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

function scorePost(post: TwitterPost): number {
  const text = (post.title + ' ' + post.snippet).toLowerCase();
  let score = 0;
  if (/how much.*(invest|save|put)/i.test(text)) score += 4;
  if (/compound interest/i.test(text)) score += 4;
  if (/index fund|etf|voo|vti|spy/i.test(text)) score += 3;
  if (/s&p 500|sp500/i.test(text)) score += 3;
  if (/retire(ment)?|fire\b/i.test(text)) score += 2;
  if (/calculator|simulator|projection/i.test(text)) score += 3;
  if (/mortgage|down payment|first home/i.test(text)) score += 3;
  if (/invest(ing)?/i.test(text)) score += 1;
  if (/beginner|new to|just starting|getting started/i.test(text)) score += 2;
  if (/per month|\/month|monthly/i.test(text)) score += 2;
  if (/\?/.test(post.title)) score += 2;
  if (/coast fire/i.test(text)) score += 3;
  if (/4% rule|4 percent rule/i.test(text)) score += 3;
  return score;
}

async function draftReply(post: TwitterPost): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const body = post.snippet.slice(0, 400) || '(no body)';

  const prompt = `You're helping Griffen reply to a tweet. He built startinvesting.ai — a free investment simulator (no sign-up) that shows projected portfolio value based on age, contributions, timeline, and risk profile. It also has a FIRE calculator at startinvesting.ai/fire and mortgage calculator at startinvesting.ai/mortgage.

Tweet from ${post.handle}: "${post.title}"
Context: "${body}"

Write a GENUINE helpful reply for Twitter. Rules:
- Lead with useful information or insight that directly addresses the tweet
- Only mention startinvesting.ai if genuinely relevant (they're asking about numbers, projections, calculators)
- If you mention it, keep it brief: "I built a free calculator if you want to run the numbers — startinvesting.ai"
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

    const top = candidates
      .map(p => ({ post: p, score: scorePost(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    let inserted = 0;
    for (const { post } of top) {
      const drafted_reply = await draftReply(post);
      await new Promise(r => setTimeout(r, 300));
      const { error } = await supabase.from('twitter_opportunities').insert({
        tweet_id: post.id,
        handle: post.handle,
        title: post.title,
        url: post.url,
        body_snippet: post.snippet.slice(0, 400),
        drafted_reply,
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
