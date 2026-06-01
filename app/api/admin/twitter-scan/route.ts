import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllTwitterOpportunities, TwitterPost } from '@/lib/twitter';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

async function draftReply(post: TwitterPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = post.snippet.slice(0, 400) || '(no body)';

  const prompt = `You're helping Griffen reply to a tweet. He built startinvesting.ai — a free investment simulator (no sign-up) that shows projected portfolio value based on age, contributions, timeline, and risk profile. It also has a FIRE calculator at startinvesting.ai/fire and mortgage calculator at startinvesting.ai/mortgage.

Tweet from ${post.handle}: "${post.title}"
Context: "${body}"

Write a GENUINE helpful reply for Twitter. Rules:
- Lead with useful information or insight that directly addresses the tweet
- Only mention startinvesting.ai if genuinely relevant
- If you mention it, keep it brief: "I built a free calculator — startinvesting.ai"
- For FIRE/retirement questions mention startinvesting.ai/fire
- For mortgage questions mention startinvesting.ai/mortgage
- Sound like a real person, not a marketer
- Max 240 characters (Twitter limit)
- Never start with "Great tweet" or filler
- No hashtags

Return only the reply text.`;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });
    return (msg.content[0] as { text: string }).text.trim();
  } catch {
    return '';
  }
}

async function insertPost(supabase: ReturnType<typeof import('@/lib/supabase-admin').getSupabaseAdminClient>, post: TwitterPost, drafted_reply: string): Promise<string | null> {
  // Try full insert with all columns
  const { error } = await supabase.from('twitter_opportunities').insert({
    tweet_id: post.id,
    handle: post.handle,
    title: post.title,
    url: post.url,
    body_snippet: post.snippet.slice(0, 400),
    drafted_reply,
    score: post.score,
    tweet_created_at: new Date(post.created_utc * 1000).toISOString(),
  });

  if (!error) return null;

  // If full insert fails (e.g. score/tweet_created_at columns don't exist yet),
  // fall back to core columns only
  const { error: fallbackError } = await supabase.from('twitter_opportunities').insert({
    tweet_id: post.id,
    handle: post.handle,
    title: post.title,
    url: post.url,
    body_snippet: post.snippet.slice(0, 400),
    drafted_reply,
  });

  if (!fallbackError) return null;
  return fallbackError.message;
}

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_session');
  if (!cookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: existing } = await supabase.from('twitter_opportunities').select('tweet_id');
    const knownIds = new Set((existing ?? []).map(r => r.tweet_id as string));

    const allPosts = await getAllTwitterOpportunities();
    const candidates = allPosts.filter(p => !knownIds.has(p.id));
    const top = candidates.slice(0, 8);

    let inserted = 0;
    const insertErrors: string[] = [];
    for (const post of top) {
      const drafted_reply = await draftReply(post);
      await new Promise(r => setTimeout(r, 300));
      const err = await insertPost(supabase, post, drafted_reply);
      if (!err) {
        inserted++;
      } else {
        console.error('[twitter-scan] insert error:', err);
        insertErrors.push(err);
      }
    }

    return NextResponse.json({
      success: true,
      fetched: allPosts.length,
      unique: candidates.length,
      inserted,
      ...(insertErrors.length > 0 && { insertErrors }),
    });
  } catch (err) {
    console.error('[twitter-scan]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
