/**
 * Quora question discovery via Serper.dev (Google Search API).
 * Searches Google for Quora questions — no Quora API needed.
 * Requires SERPER_API_KEY env var.
 *
 * Two query tiers:
 *  - FRESH (qdr:m, past month): new questions where you can be the first answer
 *  - BROAD (no time filter): high-traffic evergreen questions indexed heavily by Google
 */

export interface QuoraPost {
  id: string;       // URL slug — unique identifier for the question
  title: string;
  snippet: string;
  url: string;
  score: number;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
}

interface SerperResponse {
  organic?: SerperResult[];
}

// Fresh queries — past month. New questions where you can be first to answer.
const FRESH_QUERIES = [
  'site:quora.com "how much should I invest" per month',
  'site:quora.com "FIRE number" OR "financial independence number" retire early',
  'site:quora.com "compound interest" investing start early how much',
  'site:quora.com mortgage "how much can I afford" first home buying',
  'site:quora.com "index fund" beginner "how much" invest',
  'site:quora.com "when can I retire" savings investments',
];

// Broad queries — all time. High-traffic evergreen questions.
const BROAD_QUERIES = [
  'site:quora.com "how much money do I need to retire"',
  'site:quora.com "4% rule" retirement safe withdrawal rate',
  'site:quora.com "coast FIRE" OR "lean FIRE" OR "fat FIRE" financial independence',
  'site:quora.com "S&P 500" compound interest average returns investing',
  'site:quora.com "index fund" vs "individual stocks" beginner',
  'site:quora.com "how long to save" down payment house first home',
  'site:quora.com "savings rate" retire early financial independence',
  'site:quora.com "compound interest" investing "starting at" age',
  'site:quora.com mortgage calculator "monthly payment" afford',
  'site:quora.com "how much should I save" income retirement',
];

function extractQuestionSlug(url: string): string | null {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Only quora.com links
    if (!u.hostname.includes('quora.com')) return null;
    const parts = u.pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    const slug = parts[0];
    // Skip non-question paths
    if (['topic', 'profile', 'business', 'about', 'careers', 'contact', 'news', 'search', 'answer'].includes(slug.toLowerCase())) return null;
    // Must look like a question (long enough, contains letters)
    if (slug.length < 8 || !/[a-zA-Z]/.test(slug)) return null;
    return slug;
  } catch {
    return null;
  }
}

export function scorePost(post: QuoraPost, position = 10, fresh = false): number {
  const text = (post.title + ' ' + post.snippet).toLowerCase();
  let score = 0;

  // ── Topic relevance ──────────────────────────────────────────────────────
  if (/how much.*(invest|save|put|need)/i.test(text)) score += 6;
  if (/compound interest/i.test(text)) score += 5;
  if (/coast fire|lean fire|fat fire/i.test(text)) score += 5;
  if (/4% rule|4 percent rule|safe withdrawal/i.test(text)) score += 5;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 4;
  if (/fire\b|financial independence/i.test(text)) score += 4;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/mortgage|down payment|first home|first house/i.test(text)) score += 4;
  if (/retire(ment)?|retire early/i.test(text)) score += 3;
  if (/savings rate|save.*income/i.test(text)) score += 3;
  if (/when can I retire|can I retire/i.test(text)) score += 5;
  if (/beginner|new to|just starting|getting started/i.test(text)) score += 3;
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/per month|monthly|annually|per year/i.test(text)) score += 2;

  // Questions are high-value reply opportunities
  if (/\?/.test(post.title)) score += 4;

  // ── Google position = traffic proxy ─────────────────────────────────────
  // Quora questions at top of Google = millions of views
  if (position === 1) score += 10;
  else if (position === 2) score += 8;
  else if (position === 3) score += 6;
  else if (position <= 5) score += 4;
  else if (position <= 7) score += 2;

  // Fresh question bonus — can be first answer
  if (fresh) score += 5;

  // ── Penalise low-opportunity content ────────────────────────────────────
  if (/\b(sponsored|ad\b|advertisement)\b/i.test(text)) score -= 8;

  return score;
}

async function serperSearch(
  query: string,
  tbs?: string
): Promise<{ post: QuoraPost; position: number }[]> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) throw new Error('Missing SERPER_API_KEY');

  const body: Record<string, unknown> = { q: query, num: 10 };
  if (tbs) body.tbs = tbs;

  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) return [];

  const data = await res.json() as SerperResponse;
  const results = data.organic ?? [];

  const posts: { post: QuoraPost; position: number }[] = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.link.includes('quora.com')) continue;

    const slug = extractQuestionSlug(r.link);
    if (!slug) continue;

    const url = r.link.startsWith('http') ? r.link : `https://${r.link}`;

    posts.push({
      post: {
        id: slug,
        title: r.title.replace(/\s*-\s*Quora$/i, '').trim(),
        snippet: r.snippet ?? '',
        url,
        score: 0,
      },
      position: i + 1,
    });
  }
  return posts;
}

export async function getAllQuoraOpportunities(): Promise<QuoraPost[]> {
  const seen = new Set<string>();
  const scored: { post: QuoraPost; score: number }[] = [];

  // Fresh queries first (past month) — can be first answer
  for (const query of FRESH_QUERIES) {
    try {
      const results = await serperSearch(query, 'qdr:m');
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

  // Broad queries (all time) — evergreen high-traffic questions
  for (const query of BROAD_QUERIES) {
    try {
      const results = await serperSearch(query);
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
