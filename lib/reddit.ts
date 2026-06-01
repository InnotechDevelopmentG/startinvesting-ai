/**
 * Reddit post discovery via Serper.dev (Google Search API).
 * Searches Google for Reddit posts — broader coverage than Reddit's own API,
 * no Reddit credentials needed.
 *
 * Two query tiers:
 *  - FRESH (qdr:d, past 24h): catch today's questions while they're hot
 *  - BROAD (qdr:w, past week): catch high-engagement posts still getting replies
 */

export interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  permalink: string;
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

// Fresh — past 24h. Questions asked today while thread is still active.
const FRESH_QUERIES = [
  'site:reddit.com/r/personalfinance how much should I invest per month',
  'site:reddit.com/r/investing compound interest how much start investing',
  'site:reddit.com/r/financialindependence FIRE number retirement calculator',
  'site:reddit.com/r/FirstTimeHomeBuyer mortgage calculator monthly payment afford',
  'site:reddit.com/r/povertyfinance start investing little money index fund',
  'site:reddit.com/r/Fire when can I retire savings rate',
  'site:reddit.com/r/personalfinance should I invest or pay off debt',
];

// Broad — past week. High-engagement posts still getting traction on Google.
const BROAD_QUERIES = [
  'site:reddit.com/r/personalfinance start investing beginner index fund',
  'site:reddit.com/r/investing how much per month S&P 500 beginner',
  'site:reddit.com/r/financialindependence retirement calculator projection',
  'site:reddit.com/r/Bogleheads how much invest monthly index fund',
  'site:reddit.com/r/personalfinance mortgage first home down payment',
  'site:reddit.com/r/investing compound interest retire early calculator',
  'site:reddit.com/r/personalfinance pay off mortgage vs invest',
  'site:reddit.com/r/Fire coast fire number retirement age',
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

// Parse Serper's relative/absolute date strings into unix seconds
function parseSerperDate(date?: string): number {
  if (!date) return Date.now() / 1000 - 86400 * 3; // default: ~3 days ago
  const d = date.toLowerCase().trim();
  const now = Date.now() / 1000;

  const hourMatch = d.match(/(\d+)\s*hour/);
  if (hourMatch) return now - parseInt(hourMatch[1]) * 3600;

  const dayMatch = d.match(/(\d+)\s*day/);
  if (dayMatch) return now - parseInt(dayMatch[1]) * 86400;

  const weekMatch = d.match(/(\d+)\s*week/);
  if (weekMatch) return now - parseInt(weekMatch[1]) * 86400 * 7;

  const monthMatch = d.match(/(\d+)\s*month/);
  if (monthMatch) return now - parseInt(monthMatch[1]) * 86400 * 30;

  const parsed = Date.parse(date);
  if (!isNaN(parsed)) return parsed / 1000;

  return now - 86400 * 3;
}

function scorePost(post: RedditPost, position: number, fresh: boolean): number {
  const text = (post.title + ' ' + post.selftext).toLowerCase();
  let score = 0;

  // ── Topic relevance ──────────────────────────────────────────────────────
  if (/how much.*(invest|save|put)/i.test(text)) score += 6;
  if (/compound interest/i.test(text)) score += 5;
  if (/coast fire|lean fire|fat fire/i.test(text)) score += 5;
  if (/4% rule|4 percent rule/i.test(text)) score += 5;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 4;
  if (/fire\b|financial independence/i.test(text)) score += 4;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/calculator|simulator|projection/i.test(text)) score += 4;
  if (/mortgage|down payment|first home|first house/i.test(text)) score += 4;
  if (/retire(ment)?|retire early/i.test(text)) score += 3;
  if (/savings rate|save.*income/i.test(text)) score += 3;
  if (/when can I retire|can I retire/i.test(text)) score += 5;
  if (/beginner|new to|just starting|getting started/i.test(text)) score += 4;
  if (/per month|\/month|monthly/i.test(text)) score += 2;
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/\?/.test(post.title)) score += 4;

  // ── Google position = engagement proxy ───────────────────────────────────
  if (position === 1) score += 9;
  else if (position === 2) score += 7;
  else if (position === 3) score += 5;
  else if (position <= 5) score += 3;
  else if (position <= 7) score += 1;

  // ── Recency: reply value drops off fast ──────────────────────────────────
  const ageHours = (Date.now() / 1000 - post.created_utc) / 3600;
  if (ageHours < 3) score += 12;
  else if (ageHours < 12) score += 9;
  else if (ageHours < 24) score += 6;
  else if (ageHours < 72) score += 3;

  // Fresh query bonus (came from qdr:d search)
  if (fresh) score += 4;

  // ── Penalise noise ───────────────────────────────────────────────────────
  if (/\b(report|announces?|says|warns?|drops|rises|falls|crash)\b/i.test(post.title)) score -= 3;
  if (/\b(sponsored|ad\b|advertisement)\b/i.test(text)) score -= 8;

  return score;
}

async function serperSearch(
  query: string,
  tbs: 'qdr:d' | 'qdr:w' = 'qdr:w'
): Promise<{ post: RedditPost; position: number }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: 10, tbs }),
  });

  if (!res.ok) return [];

  const data = await res.json() as SerperResponse;
  const results = data.organic ?? [];

  const posts: { post: RedditPost; position: number }[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.link.includes('reddit.com/r/') || !r.link.includes('/comments/')) continue;
    const id = extractId(r.link);
    if (!id) continue;

    posts.push({
      post: {
        id,
        subreddit: extractSubreddit(r.link),
        title: r.title.replace(/\s*:\s*reddit$/i, '').replace(/\s*-\s*Reddit$/i, '').trim(),
        selftext: r.snippet ?? '',
        permalink: extractPermalink(r.link),
        created_utc: parseSerperDate(r.date),
        score: 0,
      },
      position: i + 1,
    });
  }
  return posts;
}

export async function getAllRedditOpportunities(): Promise<RedditPost[]> {
  const seen = new Set<string>();
  const scored: { post: RedditPost; score: number }[] = [];

  // Fresh queries first (past 24h) — highest reply value
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

  // Broad queries (past week) for high-engagement posts still active
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
