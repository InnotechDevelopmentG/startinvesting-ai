import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { searchSubreddit, getSubredditNew, RedditPost } from '@/lib/reddit';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
}

// What to search for in each subreddit
const SEARCHES: { subreddit: string; query: string }[] = [
  { subreddit: 'personalfinance',       query: 'how much invest' },
  { subreddit: 'personalfinance',       query: 'start investing beginner' },
  { subreddit: 'personalfinance',       query: 'compound interest retire' },
  { subreddit: 'investing',             query: 'beginner index fund' },
  { subreddit: 'investing',             query: 'how much per month' },
  { subreddit: 'financialindependence', query: 'calculator projection fire' },
  { subreddit: 'Bogleheads',           query: 'how much invest monthly' },
  { subreddit: 'FirstTimeHomeBuyer',    query: 'mortgage calculator payment' },
  { subreddit: 'povertyfinance',        query: 'start investing little money' },
  { subreddit: 'Fire',                  query: 'retirement calculator' },
];

// Also pull latest posts from highest-traffic subs (catch anything recent)
const NEW_FEED_SUBS = ['personalfinance', 'investing'];

function scorePost(post: RedditPost): number {
  const text = (post.title + ' ' + (post.selftext ?? '')).toLowerCase();
  let score = 0;

  // Strong signals — these are exactly the questions we can help with
  if (/how much.*(invest|save|put)/i.test(text)) score += 4;
  if (/compound interest/i.test(text)) score += 4;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 3;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/retire(ment)?|fire\b/i.test(text)) score += 2;
  if (/calculator|simulator|projection/i.test(text)) score += 3;
  if (/mortgage|down payment|first home|home buy/i.test(text)) score += 3;

  // General investing interest
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/\bstart(ing)?\b/i.test(text)) score += 1;
  if (/beginner|new to|just starting|getting started/i.test(text)) score += 2;
  if (/per month|\/month|monthly/i.test(text)) score += 2;
  if (/\d+\s*(years?|yr)/i.test(text)) score += 1;
  if (/\$\d+/i.test(text)) score += 1;

  // It's a question (much better chance of being answerable)
  if (/\?/.test(post.title)) score += 2;

  // Penalise posts that are clearly news/articles not questions
  if (/\b(report|announces|says|warns|drops|rises|falls|crash)\b/i.test(post.title)) score -= 3;
  if (post.selftext === '' || post.selftext === '[removed]') score -= 1;

  return score;
}

async function draftReply(post: RedditPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = (post.selftext ?? '').slice(0, 600) || '(text post, no body)';

  const prompt = `You're helping Griffen respond to a Reddit post. He built startinvesting.ai — a free investment simulator (no sign-up) that shows projected portfolio value based on age, contributions, timeline, and risk profile. It also has a mortgage calculator at startinvesting.ai/mortgage.

Subreddit: r/${post.subreddit}
Post title: "${post.title}"
Post body: "${body}"

Write a GENUINE helpful reply. Rules:
- Lead with actual useful advice that directly answers what they asked
- Only mention startinvesting.ai if it's genuinely relevant (e.g. they're asking about numbers, projections, calculators, or mortgage payments)
- If you mention it, do so briefly and naturally at the end: "I built a free simulator if you want to run your numbers — startinvesting.ai"
- For mortgage questions mention startinvesting.ai/mortgage specifically
- Sound like a real helpful person on Reddit, not a marketer
- 3–5 sentences max, no bullet points unless the question calls for a list
- Never start with "Great question" or similar filler
- Don't mention the site if the post is just venting or clearly off-topic for our tool

Return only the reply text.`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return '';
  }
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    // Get already-saved post IDs
    const { data: existing } = await supabase.from('reddit_opportunities').select('post_id');
    const knownIds = new Set((existing ?? []).map(r => r.post_id as string));

    // Collect posts from targeted searches
    const allPosts: RedditPost[] = [];

    for (const { subreddit, query } of SEARCHES) {
      const posts = await searchSubreddit(subreddit, query);
      allPosts.push(...posts);
      await sleep(600);
    }

    // Also grab latest posts from top subs
    for (const sub of NEW_FEED_SUBS) {
      const posts = await getSubredditNew(sub);
      allPosts.push(...posts);
      await sleep(600);
    }

    // Deduplicate and filter
    const seen = new Set<string>();
    const candidates: RedditPost[] = [];
    for (const post of allPosts) {
      if (seen.has(post.id) || knownIds.has(post.id)) continue;
      if (post.selftext === '[removed]' || post.selftext === '[deleted]') continue;
      seen.add(post.id);
      candidates.push(post);
    }

    // Score and take top 10
    const top = candidates
      .map(p => ({ post: p, score: scorePost(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Draft replies and save
    let inserted = 0;
    for (const { post } of top) {
      const drafted_reply = await draftReply(post);
      await sleep(400);

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

    return NextResponse.json({
      success: true,
      fetched: allPosts.length,
      unique: candidates.length,
      inserted,
    });
  } catch (err) {
    console.error('[reddit-scan]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
