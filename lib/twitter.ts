/**
 * Twitter/X post discovery via Serper.dev (Google Search API).
 * Searches Google for X.com posts — no X API credentials needed.
 * Requires SERPER_API_KEY env var.
 *
 * Google indexes tweets with high engagement far more aggressively than
 * low-engagement ones, so Serper results naturally skew toward posts worth
 * replying to.
 *
 * Two query tiers:
 *  - FRESH (qdr:d, past 24h): catch today's questions while they're still active
 *  - BROAD (qdr:w, past week): catch high-engagement posts still getting replies
 */

export interface TwitterPost {
  id: string;
  handle: string;
  title: string;
  snippet: string;
  url: string;
  created_utc: number;
  score: number;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
  date?: string;
}

interface SerperResponse {
  organic?: SerperResult[];
}

// Fresh queries — past 24h. Broad natural language, no over-quoted phrases.
const FRESH_QUERIES = [
  // Investment simulator
  'site:x.com investing compound interest monthly retirement savings',
  'site:x.com index fund S&P 500 investing monthly compound growth',
  'site:x.com started investing young compound interest savings retire',
  'site:x.com personal finance investing 401k IRA monthly contribution',
  // FIRE
  'site:x.com FIRE financial independence retire early savings rate',
  'site:x.com retire early how much save monthly FIRE number',
  'site:x.com coast FIRE lean FIRE savings number retire',
  // Mortgage
  'site:x.com mortgage payment first home afford down payment',
  'site:x.com first time home buyer mortgage afford monthly payment',
];

// Broad queries — past week. High engagement = Google indexed them.
const BROAD_QUERIES = [
  // Investment simulator
  'site:x.com compound interest investing early retirement index fund',
  'site:x.com index fund VOO SPY monthly investing retire compound',
  'site:x.com investing 500 month compound interest retire early',
  'site:x.com personal finance index fund S&P 500 retire savings',
  // FIRE
  'site:x.com FIRE number financial independence retire early monthly',
  'site:x.com 4% rule retirement withdrawal savings FIRE portfolio',
  'site:x.com financial independence retire early savings rate compound',
  'site:x.com coast FIRE fat FIRE lean FIRE savings number',
  // Mortgage
  'site:x.com mortgage monthly payment first home calculator afford',
  'site:x.com buying first home down payment mortgage rate afford',
];

function extractHandle(url: string): string {
  const m = url.match(/x\.com\/([^/]+)/i);
  if (!m) return '';
  const handle = m[1];
  if (['i', 'search', 'explore', 'home', 'settings'].includes(handle)) return '';
  return `@${handle}`;
}

function extractTweetId(url: string): string | null {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}

// Tweet IDs are snowflake IDs — extract approximate timestamp from them
function tweetIdToTimestamp(id: string): number {
  try {
    const twitterEpoch = 1288834974657;
    const ts = (BigInt(id) >> BigInt(22)) + BigInt(twitterEpoch);
    return Number(ts) / 1000;
  } catch {
    return Date.now() / 1000;
  }
}

export function scorePost(post: TwitterPost, position = 10, fresh = false): number {
  const text = (post.title + ' ' + post.snippet).toLowerCase();
  let score = 0;

  // ── Topic relevance ──────────────────────────────────────────────────────
  if (/how much.*(invest|save|put)/i.test(text)) score += 6;
  if (/compound interest/i.test(text)) score += 5;
  if (/coast fire/i.test(text)) score += 5;
  if (/4% rule|4 percent rule/i.test(text)) score += 5;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 4;
  if (/fire\b|financial independence/i.test(text)) score += 4;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/calculator|simulator|projection/i.test(text)) score += 4;
  if (/mortgage|down payment|first home|first house/i.test(text)) score += 4;
  if (/per month|\/month|monthly/i.test(text)) score += 2;
  if (/beginner|new to|just starting|getting started|just started/i.test(text)) score += 4;
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/retire(ment)?/i.test(text)) score += 2;
  if (/savings rate|save.*income/i.test(text)) score += 3;
  if (/when can I retire|can I retire/i.test(text)) score += 5;

  // Questions are the best reply opportunities
  if (/\?/.test(post.title)) score += 4;

  // ── Engagement proxy: Google position ────────────────────────────────────
  // Google indexes high-engagement tweets first — position is a strong signal
  if (position === 1) score += 9;
  else if (position === 2) score += 7;
  else if (position === 3) score += 5;
  else if (position <= 5) score += 3;
  else if (position <= 7) score += 1;

  // ── Recency: snowflake timestamp ─────────────────────────────────────────
  // Fresh posts are actively being read — best window to reply is within 12h
  const ageHours = (Date.now() / 1000 - post.created_utc) / 3600;
  if (ageHours < 1) score += 15;
  else if (ageHours < 3) score += 11;
  else if (ageHours < 12) score += 8;
  else if (ageHours < 24) score += 5;
  else if (ageHours < 72) score += 2;

  // Bonus for coming from a fresh (qdr:d) query — already a recency signal
  if (fresh) score += 3;

  // ── Hard disqualifiers — return very low score so they're never stored ───
  // Political content
  if (/\b(governor|senator|congressman|president|democrat|republican|GOP|Biden|Trump|Harris|politician|election|ballot|policy|legislation|bill passed|signed into law)\b/i.test(text)) score -= 30;
  // News/media commentary
  if (/\b(announces?|reports?|breaking|exclusive|warns?|says|drops|rises|falls|crash|scandal|disaster|malefactor|maloderous)\b/i.test(post.title)) score -= 20;
  // Must contain at least one personal finance signal — if none, kill it
  const hasFinanceSignal = /invest|retire|mortgage|savings|compound|index fund|FIRE|financial independence|S&P|401k|IRA|down payment|net worth|income/i.test(text);
  if (!hasFinanceSignal) score -= 25;
  // Spam/promotional patterns
  if (/\b(sponsored|ad\b|promo|click here|sign up|buy now|discount|coupon|giveaway|win|prize)\b/i.test(text)) score -= 20;
  // News outlets / bots — handles ending in "news", "media", "official", "bot"
  if (/news|media|official|_bot\b/i.test(post.handle)) score -= 15;

  return score;
}

// Minimum score a post must reach to be worth storing
export const MIN_SCORE_THRESHOLD = 5;

async function serperSearch(
  query: string,
  tbs: 'qdr:d' | 'qdr:w' = 'qdr:w'
): Promise<{ post: TwitterPost; position: number }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10, tbs, gl: 'us', hl: 'en' }),
  });

  if (!res.ok) return [];

  const data = await res.json() as SerperResponse;
  const results = data.organic ?? [];

  const posts: { post: TwitterPost; position: number }[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.link.includes('x.com/') && !r.link.includes('twitter.com/')) continue;
    if (!r.link.includes('/status/')) continue;

    const id = extractTweetId(r.link);
    if (!id) continue;

    const url = r.link.replace('twitter.com', 'x.com');
    const handle = extractHandle(url);
    if (!handle) continue;

    const title = r.title.replace(/\s*on X$/i, '').replace(/\s*on Twitter$/i, '').trim();
    const snippet = r.snippet ?? '';

    // Skip non-English posts — reject if >20% of characters are non-ASCII
    const combined = title + ' ' + snippet;
    const nonAscii = (combined.match(/[^\x00-\x7F]/g) ?? []).length;
    if (combined.length > 0 && nonAscii / combined.length > 0.2) continue;

    const post: TwitterPost = {
      id,
      handle,
      title,
      snippet,
      url,
      created_utc: tweetIdToTimestamp(id),
      score: 0,
    };

    posts.push({ post, position: i + 1 });
  }
  return posts;
}

export async function getAllTwitterOpportunities(): Promise<TwitterPost[]> {
  const seen = new Set<string>();
  const scored: { post: TwitterPost; score: number }[] = [];

  // Fresh queries (past 24h) — these get the `fresh` scoring bonus
  for (const query of FRESH_QUERIES) {
    try {
      const results = await serperSearch(query, 'qdr:d');
      for (const { post, position } of results) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        const score = scorePost(post, position, true);
        scored.push({ post: { ...post, score }, score });
      }
    } catch {
      // continue on individual query failure
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Then broad queries (past week) for high-engagement posts
  for (const query of BROAD_QUERIES) {
    try {
      const results = await serperSearch(query, 'qdr:w');
      for (const { post, position } of results) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        const score = scorePost(post, position, false);
        scored.push({ post: { ...post, score }, score });
      }
    } catch {
      // continue on individual query failure
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return scored
    .filter(({ score }) => score >= MIN_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}
