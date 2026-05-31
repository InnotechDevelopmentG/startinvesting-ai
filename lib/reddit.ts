/**
 * Reddit post discovery via Serper.dev (Google Search API).
 * Searches Google for Reddit posts — broader coverage than Reddit's own API,
 * no Reddit credentials needed.
 * Requires SERPER_API_KEY env var.
 */

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  permalink: string;
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
  'site:reddit.com/r/personalfinance how much should I invest per month',
  'site:reddit.com/r/personalfinance start investing beginner index fund',
  'site:reddit.com/r/investing compound interest calculator retire',
  'site:reddit.com/r/investing how much per month S&P 500 beginner',
  'site:reddit.com/r/financialindependence retirement calculator projection',
  'site:reddit.com/r/Bogleheads how much invest monthly',
  'site:reddit.com/r/FirstTimeHomeBuyer mortgage calculator payment',
  'site:reddit.com/r/povertyfinance start investing little money',
  'site:reddit.com/r/Fire retirement calculator how much',
  'site:reddit.com/r/personalfinance mortgage first home down payment',
];

// Returns the Reddit post ID (e.g. "abc123") from a URL, or null if not a valid post URL
function extractId(url: string): string | null {
  const m = url.match(/\/comments\/([a-z0-9]+)/i);
  return m ? m[1] : null;
}

function extractSubreddit(url: string): string {
  const m = url.match(/reddit\.com\/r\/([^/]+)/i);
  return m ? m[1] : '';
}

function extractPermalink(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

async function serperSearch(query: string): Promise<RedditPost[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10, tbs: 'qdr:w' }), // past week
  });

  if (!res.ok) return [];

  const data = await res.json() as SerperResponse;
  const results = data.organic ?? [];

  const posts: RedditPost[] = [];
  for (const r of results) {
    // Must be a proper post URL with /comments/<id>/
    if (!r.link.includes('reddit.com/r/') || !r.link.includes('/comments/')) continue;
    const id = extractId(r.link);
    if (!id) continue; // skip anything without a valid post ID

    posts.push({
      id,
      subreddit: extractSubreddit(r.link),
      title: r.title.replace(/\s*:\s*reddit$/i, '').replace(/\s*-\s*Reddit$/i, '').trim(),
      selftext: r.snippet ?? '',
      permalink: extractPermalink(r.link),
      created_utc: Date.now() / 1000,
    });
  }
  return posts;
}

export async function getAllRedditOpportunities(): Promise<RedditPost[]> {
  const seen = new Set<string>();
  const all: RedditPost[] = [];

  for (const query of QUERIES) {
    try {
      const posts = await serperSearch(query);
      for (const post of posts) {
        // Deduplicate by post ID within this scan run
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
