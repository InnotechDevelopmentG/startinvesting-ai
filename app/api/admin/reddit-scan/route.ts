import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllRedditOpportunities, RedditPost } from '@/lib/reddit';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
}

function scorePost(post: RedditPost): number {
  const text = (post.title + ' ' + post.selftext).toLowerCase();
  let score = 0;
  if (/how much.*(invest|save|put)/i.test(text)) score += 4;
  if (/compound interest/i.test(text)) score += 4;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 3;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/retire(ment)?|fire\b/i.test(text)) score += 2;
  if (/calculator|simulator|projection/i.test(text)) score += 3;
  if (/mortgage|down payment|first home|home buy/i.test(text)) score += 3;
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/beginner|new to|just starting|getting started/i.test(text)) score += 2;
  if (/per month|\/month|monthly/i.test(text)) score += 2;
  if (/\?/.test(post.title)) score += 2;
  if (/\b(report|announces|says|warns|drops|rises|falls|crash)\b/i.test(post.title)) score -= 3;
  return score;
}

async function draftReply(post: RedditPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = post.selftext.slice(0, 600) || '(no body)';

  const prompt = `You're helping Griffen respond to a Reddit post. He built startinvesting.ai — a free investment simulator (no sign-up) that shows projected portfolio value based on age, contributions, timeline, and risk profile. It also has a mortgage calculator at startinvesting.ai/mortgage.

Subreddit: r/${post.subreddit}
Post title: "${post.title}"
Post body: "${body}"

Write a reply that sounds like a real person dashing off a quick comment. Rules:
- 2–3 sentences MAX. Shorter is better.
- Answer their actual question first with a concrete, specific point
- Lowercase is fine. Imperfect grammar is fine. Don't be formal.
- Only mention startinvesting.ai if they're asking about numbers/projections/mortgage — and only as a casual aside at the end, e.g. "i made a free tool for this if you wanna play with numbers — startinvesting.ai"
- For mortgage questions use startinvesting.ai/mortgage
- NO filler: no "great question", no "hope this helps", no "as someone who...", no bullet points, no em dashes, no "it's worth noting"
- Do NOT sound like a blog post or a financial advisor
- Write like a 28-year-old who knows their stuff and is being helpful on Reddit

Return only the reply text, nothing else.`;

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

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();

    const { data: existing } = await supabase.from('reddit_opportunities').select('post_id');
    const knownIds = new Set((existing ?? []).map(r => r.post_id as string));

    const allPosts = await getAllRedditOpportunities();

    const candidates = allPosts.filter(p => !knownIds.has(p.id));

    const top = candidates
      .map(p => ({ post: p, score: scorePost(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    let inserted = 0;
    for (const { post } of top) {
      const drafted_reply = await draftReply(post);
      await new Promise(r => setTimeout(r, 300));

      const { error } = await supabase.from('reddit_opportunities').insert({
        post_id: post.id,
        subreddit: post.subreddit,
        title: post.title,
        url: `https://reddit.com${post.permalink}`,
        body_snippet: post.selftext.slice(0, 400),
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
