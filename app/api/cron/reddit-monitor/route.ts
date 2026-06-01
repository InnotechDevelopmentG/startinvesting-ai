import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllRedditOpportunities, RedditPost } from '@/lib/reddit';
import { draftRedditReply } from '@/lib/reddit-reply';

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
    const { data: existing } = await supabase.from('reddit_opportunities').select('post_id');
    const knownIds = new Set((existing ?? []).map(r => r.post_id as string));

    const allPosts = await getAllRedditOpportunities();
    const candidates = allPosts.filter(p => !knownIds.has(p.id));

    const top = candidates.slice(0, 8);

    let inserted = 0;
    for (const post of top) {
      const drafted_reply = await draftRedditReply(post);
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

    console.log(`[reddit-monitor] fetched=${allPosts.length} unique=${candidates.length} inserted=${inserted}`);
    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('[reddit-monitor]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
