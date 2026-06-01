import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import { getAllRedditOpportunities, RedditPost } from '@/lib/reddit';
import { draftRedditReply } from '@/lib/reddit-reply';

export const maxDuration = 60;

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
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

    const top = candidates.slice(0, 10);

    // Draft all replies in parallel
    const replies = await Promise.all(top.map(post => draftRedditReply(post)));

    // Batch insert
    const rows = top.map((post: RedditPost, i: number) => ({
      post_id: post.id,
      subreddit: post.subreddit,
      title: post.title,
      url: `https://reddit.com${post.permalink}`,
      body_snippet: post.selftext.slice(0, 400),
      drafted_reply: replies[i],
    }));

    const { error: insertError, data: insertedRows } = await supabase
      .from('reddit_opportunities')
      .insert(rows)
      .select('id');

    const inserted = insertedRows?.length ?? (insertError ? 0 : rows.length);

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
