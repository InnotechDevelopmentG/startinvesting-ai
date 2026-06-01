import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllQuoraOpportunities } from '@/lib/quora';
import { draftQuoraReply } from '@/lib/quora-reply';

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
    const { data: existing } = await supabase.from('quora_opportunities').select('question_id');
    const knownIds = new Set((existing ?? []).map(r => r.question_id as string));

    const allPosts = await getAllQuoraOpportunities();
    const candidates = allPosts.filter(p => !knownIds.has(p.id));
    const top = candidates.slice(0, 8);

    let inserted = 0;
    for (const post of top) {
      const drafted_reply = await draftQuoraReply(post);
      await new Promise(r => setTimeout(r, 300));
      const { error } = await supabase.from('quora_opportunities').insert({
        question_id: post.id,
        title: post.title,
        url: post.url,
        body_snippet: post.snippet.slice(0, 400),
        drafted_reply,
        score: post.score,
      });
      if (!error) inserted++;
      else console.error('[quora-monitor] insert error:', error.message);
    }

    console.log(`[quora-monitor] fetched=${allPosts.length} unique=${candidates.length} inserted=${inserted}`);
    return NextResponse.json({ success: true, inserted });
  } catch (err) {
    console.error('[quora-monitor]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
