/**
 * Twitter/X post discovery via Serper.dev (Google Search API).
 * Searches Google for X.com posts — no X API credentials needed.
 * Requires SERPER_API_KEY env var.
 *
 * Note: Google indexes high-engagement tweets more reliably than low-engagement ones,
 * which means results skew toward posts worth engaging with.
 */

export interface TwitterPost {
  id: string;
  handle: string;
  title: string;
  snippet: string;
  url: string;
  created_utc: number;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
}

interface SerperResponse {
  organic?: SerperResult[];
}

const QUERIES = [
  'site:x.com how much should I invest per month compound interest',
  'site:x.com "how much do I need to retire" fire financial independence',
  'site:x.com "index fund" beginner investing "per month" S&P 500',
  'site:x.com "FIRE number" financial independence retire early calculator',
  'site:x.com "coast fire" "compound interest" investing',
  'site:x.com mortgage calculator "monthly payment" first home',
  'site:x.com "start investing" beginner "index fund" ETF',
  'site:x.com "4% rule" retirement "safe withdrawal" portfolio',
  'site:x.com "how much to retire" savings "per month" investing',
  'site:x.com "compound interest" "starting early" investing wealth',
];

function extractHandle(url: string): string {
  const m = url.match(/x\.com\/([^/]+)/i);
  return m ? `@${m[1]}` : '';
}

function extractTweetId(url: string): string | null {
  const m = url.match(/\/status\/(\d+)/);
  return m ? m[1] : null;
}

async function serperSearch(query: string): Promise<TwitterPost[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:m' }), // past month
  });

  if (!res.ok) return [];

  const data = await res.json() as SerperResponse;
  const results = data.organic ?? [];

  const posts: TwitterPost[] = [];
  for (const r of results) {
    if (!r.link.includes('x.com/') && !r.link.includes('twitter.com/')) continue;
    if (!r.link.includes('/status/')) continue; // must be a tweet, not a profile

    const id = extractTweetId(r.link);
    if (!id) continue;

    // Normalize twitter.com → x.com
    const url = r.link.replace('twitter.com', 'x.com');

    posts.push({
      id,
      handle: extractHandle(url),
      title: r.title.replace(/\s*on X$/i, '').replace(/\s*on Twitter$/i, '').trim(),
      snippet: r.snippet ?? '',
      url,
      created_utc: Date.now() / 1000,
    });
  }
  return posts;
}

export async function getAllTwitterOpportunities(): Promise<TwitterPost[]> {
  const seen = new Set<string>();
  const all: TwitterPost[] = [];

  for (const query of QUERIES) {
    try {
      const posts = await serperSearch(query);
      for (const post of posts) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        all.push(post);
      }
    } catch {
      // continue on individual query failure
    }
    await new Promise(r => setTimeout(r, 300));
  }

  return all;
}
