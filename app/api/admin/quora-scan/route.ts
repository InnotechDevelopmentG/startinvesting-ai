import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllQuoraOpportunities, QuoraPost } from '@/lib/quora';
import { draftQuoraReply } from '@/lib/quora-reply';

export const maxDuration = 60;

async function insertPost(
  supabase: ReturnType<typeof import('@/lib/supabase-admin').getSupabaseAdminClient>,
  post: QuoraPost,
  drafted_reply: string
): Promise<string | null> {
  const { error } = await supabase.from('quora_opportunities').insert({
    question_id: post.id,
    title: post.title,
    url: post.url,
    body_snippet: post.snippet.slice(0, 400),
    drafted_reply,
    score: post.score,
  });
  if (!error) return null;

  // Fallback without score column in case it doesn't exist
  const { error: fallbackError } = await supabase.from('quora_opportunities').insert({
    question_id: post.id,
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
    const { data: existing } = await supabase.from('quora_opportunities').select('question_id');
    const knownIds = new Set((existing ?? []).map(r => r.question_id as string));

    const allPosts = await getAllQuoraOpportunities();
    const candidates = allPosts.filter(p => !knownIds.has(p.id));
    const top = candidates.slice(0, 8);

    let inserted = 0;
    const insertErrors: string[] = [];
    for (const post of top) {
      const drafted_reply = await draftQuoraReply(post);
      await new Promise(r => setTimeout(r, 300));
      const err = await insertPost(supabase, post, drafted_reply);
      if (!err) inserted++;
      else insertErrors.push(err);
    }

    return NextResponse.json({
      success: true,
      fetched: allPosts.length,
      unique: candidates.length,
      inserted,
      ...(insertErrors.length > 0 && { insertErrors }),
    });
  } catch (err) {
    console.error('[quora-scan]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
