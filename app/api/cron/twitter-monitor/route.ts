import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllTwitterOpportunities, TwitterPost } from '@/lib/twitter';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');
  return isVercelCron || authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
}

async function draftReply(post: TwitterPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `You're helping Griffen reply to a tweet. He built startinvesting.ai — a free investment simulator (no sign-up) that shows projected portfolio value based on age, contributions, timeline, and risk profile. It also has a FIRE calculator at startinvesting.ai/fire and mortgage calculator at startinvesting.ai/mortgage.

Tweet from ${post.handle}: "${post.title}"
Context: "${post.snippet.slice(0, 400)}"

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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: existing } = await supabase.from('twitter_opportunities').select('tweet_id');
    const knownIds = new Set((existing ?? []).map(r => r.tweet_id as string));

    const allPosts = await getAllTwitterOpportunities();
    const candidates = allPosts.filter(p => !knownIds.has(p.id));

    // Top 8 are already sorted by score from getAllTwitterOpportunities
    const top = candidates.slice(0, 8);

    let inserted = 0;
    for (const post of top) {
      const drafted_reply = await draftReply(post);
      await new Promise(r => setTimeout(r, 300));
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
      if (!error) inserted++;
    }

    console.log(`[twitter-monitor] fetched=${allPosts.length} unique=${candidates.length} inserted=${inserted}`);
    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('[twitter-monitor]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
