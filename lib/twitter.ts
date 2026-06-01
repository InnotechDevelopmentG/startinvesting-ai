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

// Ultra-fresh queries — run with qdr:h (past hour). Catch posts the moment they're hot.
const ULTRA_FRESH_QUERIES = [
  'site:x.com "how much should I invest" per month',
  'site:x.com "FIRE number" OR "financial independence number"',
  'site:x.com "compound interest" "how much will" investing',
  'site:x.com "mortgage payment" OR "can I afford" first home',
];

// Fresh queries — run with qdr:d (past 24h). Catch questions asked today.
const FRESH_QUERIES = [
  // Investment simulator
  'site:x.com "how much will" invest compound interest grow years',
  'site:x.com "just started investing" OR "new to investing" index fund monthly',
  'site:x.com "investing $" per month compound interest retirement',
  // FIRE calculator
  'site:x.com "FIRE number" OR "what is my FIRE number" savings',
  'site:x.com "when can I retire" savings rate monthly invest',
  'site:x.com "coast FIRE" OR "lean FIRE" number how much save',
  // Mortgage calculator
  'site:x.com "can I afford" mortgage "monthly payment" first home',
  'site:x.com "down payment" house saving "how much" OR "how long"',
];

// Broad queries — run with qdr:w (past week). High engagement = Google indexed them.
const BROAD_QUERIES = [
  // Investment simulator
  'site:x.com "how much should I invest" monthly compound interest',
  'site:x.com "index fund" "per month" how much retire compound',
  'site:x.com "compound interest" "start early" OR "starting at" age invest',
  'site:x.com "invest early" compound interest retirement years',
  // FIRE calculator
  'site:x.com "how much do I need to retire" FIRE savings',
  'site:x.com "4% rule" retirement withdrawal savings FIRE',
  'site:x.com "coast FIRE" OR "fat FIRE" OR "lean FIRE" savings number',
  'site:x.com "financial independence" "retire early" how much save monthly',
  // Mortgage calculator
  'site:x.com mortgage "monthly payment" "first home" calculator afford',
  'site:x.com "down payment" saving first house how much afford',
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

  // ── Penalise low-opportunity content ────────────────────────────────────
  if (/\b(announces?|reports?|says|warns?|breaks?|exclusive)\b/i.test(post.title)) score -= 5;
  if (/\b(sponsored|ad|promo)\b/i.test(text)) score -= 8;

  return score;
}

async function serperSearch(
  query: string,
  tbs: 'qdr:h' | 'qdr:d' | 'qdr:w' = 'qdr:w'
): Promise<{ post: TwitterPost; position: number }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query, num: 10, tbs, gl: 'us', hl: 'en', lr: 'lang_en' }),
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

  // Ultra-fresh queries (past hour) — highest reply value
  for (const query of ULTRA_FRESH_QUERIES) {
    try {
      const results = await serperSearch(query, 'qdr:h');
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
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}
