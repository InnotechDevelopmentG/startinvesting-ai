import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllTwitterOpportunities } from '@/lib/twitter';
import { draftReply } from '@/lib/twitter-reply';

export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');
  return isVercelCron || authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
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
      const { error } = await supabase.from('twitter_opportunities').upsert({
        tweet_id: post.id,
        handle: post.handle,
        title: post.title,
        url: post.url,
        body_snippet: post.snippet.slice(0, 400),
        drafted_reply,
        score: post.score,
        tweet_created_at: new Date(post.created_utc * 1000).toISOString(),
      }, { onConflict: 'tweet_id', ignoreDuplicates: true });
      if (!error) inserted++;
    }

    console.log(`[twitter-monitor] fetched=${allPosts.length} unique=${candidates.length} inserted=${inserted}`);
    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('[twitter-monitor]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
