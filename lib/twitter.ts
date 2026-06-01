/**
 * Twitter/X post discovery via Serper.dev (Google Search API).
 * Searches Google for X.com posts — no X API credentials needed.
 * Requires SERPER_API_KEY env var.
 *
 * Google indexes tweets with high engagement far more aggressively than
 * low-engagement ones, so Serper results naturally skew toward posts worth
 * replying to. We use qdr:w (past week) to keep results fresh.
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
  position?: number; // 1-based rank in Google results — lower = higher engagement
  date?: string;
}

interface SerperResponse {
  organic?: SerperResult[];
}

// Broad + specific queries to catch both questions and discussions
const QUERIES = [
  // High-intent questions (most valuable)
  'site:x.com "how much should I invest" per month',
  'site:x.com "how much do I need to retire" OR "FIRE number"',
  'site:x.com "compound interest" investing "starting early" OR "start early"',
  'site:x.com "index fund" beginner "how much" OR "per month"',
  'site:x.com "coast FIRE" OR "lean FIRE" OR "fat FIRE" investing',
  'site:x.com "4% rule" retirement portfolio withdraw',
  'site:x.com mortgage "monthly payment" calculator first home',
  // Discussion/viral content
  'site:x.com "invest $500" OR "invest $1000" per month returns',
  'site:x.com "S&P 500" returns "per year" compound OR average',
  'site:x.com financial independence "retire early" calculator OR simulator',
  // Beginner audience
  'site:x.com "just started investing" OR "started investing" index fund ETF',
  'site:x.com "how to retire early" savings rate compound interest',
];

function extractHandle(url: string): string {
  const m = url.match(/x\.com\/([^/]+)/i);
  if (!m) return '';
  // Filter out non-user paths
  const handle = m[1];
  if (['i', 'search', 'explore', 'home', 'settings'].includes(handle)) return '';
  return `@${handle}`;
}

function extractTweetId(url: string): string | null {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}

// Tweet IDs are snowflake IDs — we can extract approximate timestamp from them
function tweetIdToTimestamp(id: string): number {
  try {
    const twitterEpoch = 1288834974657;
    const ts = (BigInt(id) >> BigInt(22)) + BigInt(twitterEpoch);
    return Number(ts) / 1000;
  } catch {
    return Date.now() / 1000;
  }
}

export function scorePost(post: TwitterPost, position = 10): number {
  const text = (post.title + ' ' + post.snippet).toLowerCase();
  let score = 0;

  // Topic relevance
  if (/how much.*(invest|save|put)/i.test(text)) score += 5;
  if (/compound interest/i.test(text)) score += 5;
  if (/coast fire/i.test(text)) score += 5;
  if (/4% rule|4 percent rule/i.test(text)) score += 4;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 4;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/fire\b|financial independence/i.test(text)) score += 3;
  if (/calculator|simulator|projection/i.test(text)) score += 4;
  if (/mortgage|down payment|first home/i.test(text)) score += 3;
  if (/per month|\/month|monthly/i.test(text)) score += 2;
  if (/beginner|new to|just starting|getting started/i.test(text)) score += 3;
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/retire(ment)?/i.test(text)) score += 2;

  // Question posts get higher engagement on average
  if (/\?/.test(post.title)) score += 3;

  // Google position proxy for engagement:
  // position 1-3 = very high engagement, 4-7 = good, 8+ = lower
  if (position <= 3) score += 5;
  else if (position <= 7) score += 2;

  // Penalise news/announcement language (low reply-opportunity)
  if (/\b(announces?|reports?|says|warns?|breaks?|exclusive)\b/i.test(post.title)) score -= 4;

  // Recency bonus based on tweet snowflake ID (newer = higher score)
  const ageHours = (Date.now() / 1000 - post.created_utc) / 3600;
  if (ageHours < 6) score += 6;
  else if (ageHours < 24) score += 4;
  else if (ageHours < 72) score += 2;

  return score;
}

async function serperSearch(query: string): Promise<{ post: TwitterPost; position: number }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    // qdr:w = past week; sorted by relevance (Google default = engagement proxy)
    body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:w' }),
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
    if (!handle) continue; // skip non-user URLs

    const created_utc = tweetIdToTimestamp(id);

    const post: TwitterPost = {
      id,
      handle,
      title: r.title.replace(/\s*on X$/i, '').replace(/\s*on Twitter$/i, '').trim(),
      snippet: r.snippet ?? '',
      url,
      created_utc,
      score: 0, // will be set after scoring
    };

    posts.push({ post, position: i + 1 });
  }
  return posts;
}

export async function getAllTwitterOpportunities(): Promise<TwitterPost[]> {
  const seen = new Set<string>();
  const scored: { post: TwitterPost; score: number }[] = [];

  for (const query of QUERIES) {
    try {
      const results = await serperSearch(query);
      for (const { post, position } of results) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        const score = scorePost(post, position);
        scored.push({ post: { ...post, score }, score });
      }
    } catch {
      // continue on individual query failure
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Return sorted by score descending
  return scored
    .sort((a, b) => b.score - a.score)
    .map(({ post }) => post);
}
