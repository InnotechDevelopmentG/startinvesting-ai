import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

// Verify the request is from an authenticated admin session
async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
}

const TARGET_SUBREDDITS = new Set([
  'personalfinance', 'investing', 'financialindependence',
  'Bogleheads', 'FirstTimeHomeBuyer', 'povertyfinance',
  'Millennials', 'RealEstate', 'Fire', 'leanfire',
]);

const SEARCH_QUERIES = [
  'how much should I invest per month',
  'compound interest calculator retire',
  'S&P 500 index fund beginner how to start',
  'mortgage calculator first home buying',
  'how to start investing young',
];

interface RedditPost {
  id: string;
  subreddit: string;
  title: string;
  selftext: string;
  permalink: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

async function searchReddit(query: string): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=day&limit=15&type=link`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'startinvesting.ai/1.0 (educational finance monitor; contact@startinvesting.ai)',
        'Accept': 'application/json',
      },
    });
    if (!res.ok) return [];
    const data = await res.json() as { data?: { children?: { data: RedditPost }[] } };
    return data?.data?.children?.map((c) => c.data) ?? [];
  } catch {
    return [];
  }
}

function scorePost(title: string, body: string): number {
  const text = (title + ' ' + body).toLowerCase();
  let score = 0;
  if (/invest|investing|investment/.test(text)) score += 2;
  if (/compound interest|compound growth/.test(text)) score += 3;
  if (/s&p 500|sp500|index fund|etf|voo|vti|spy/.test(text)) score += 3;
  if (/retire|retirement|fire\b/.test(text)) score += 2;
  if (/mortgage|home buy|first home|down payment/.test(text)) score += 2;
  if (/calculator|simulator|projection|how much will/.test(text)) score += 2;
  if (/per month|\/month|monthly|how much should/.test(text)) score += 1;
  if (/beginner|start|new to|just starting|getting started/.test(text)) score += 1;
  if (/\?/.test(title)) score += 1;
  return score;
}

async function draftReply(post: RedditPost): Promise<string | null> {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const body = post.selftext?.slice(0, 800) || '(no body)';

    const prompt = `You are helping someone respond to a Reddit post in r/${post.subreddit} about personal finance or investing.

The person responding (Griffen) built startinvesting.ai — a free investment simulator that shows your exact projected value based on your age, contribution amount, and timeline. It also has a mortgage calculator. No sign-up required to use it.

Reddit post title: "${post.title}"
Post body: "${body}"

Write a GENUINE, HELPFUL reply that:
1. Actually answers their question or adds real value — this is the priority
2. Mentions startinvesting.ai ONCE, naturally, briefly, at the end — only if it's genuinely relevant (e.g. "I built a free simulator if you want to plug in your numbers — startinvesting.ai")
3. Sounds like a real person, not marketing copy
4. Uses Reddit-appropriate tone: direct, conversational, not formal
5. Is concise — 3-6 sentences is ideal, 10 max
6. Never starts with "Great question!" or similar filler
7. If the post is about mortgages, mention the mortgage calculator specifically

Return ONLY the reply text, nothing else.`;

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    });

    return (message.content[0] as { type: string; text: string }).text.trim();
  } catch {
    return null;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: existing } = await supabase
      .from('reddit_opportunities')
      .select('post_id');
    const knownIds = new Set((existing ?? []).map((r) => r.post_id as string));

    const allPosts: RedditPost[] = [];
    for (const query of SEARCH_QUERIES) {
      const posts = await searchReddit(query);
      allPosts.push(...posts);
      await sleep(1200);
    }

    const seen = new Set<string>();
    const candidates: RedditPost[] = [];
    for (const post of allPosts) {
      if (seen.has(post.id) || knownIds.has(post.id)) continue;
      if (!TARGET_SUBREDDITS.has(post.subreddit)) continue;
      if (Date.now() / 1000 - post.created_utc > 48 * 3600) continue;
      seen.add(post.id);
      candidates.push(post);
    }

    const scored = candidates
      .map((p) => ({ post: p, score: scorePost(p.title, p.selftext ?? '') }))
      .filter(({ score }) => score >= 3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    let inserted = 0;
    for (const { post } of scored) {
      const drafted_reply = await draftReply(post);
      await sleep(500);

      const { error } = await supabase.from('reddit_opportunities').insert({
        post_id: post.id,
        subreddit: post.subreddit,
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        body_snippet: (post.selftext ?? '').slice(0, 400),
        drafted_reply,
      });

      if (!error) inserted++;
    }

    return NextResponse.json({ success: true, found: candidates.length, inserted });
  } catch (err) {
    console.error('[reddit-scan]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
