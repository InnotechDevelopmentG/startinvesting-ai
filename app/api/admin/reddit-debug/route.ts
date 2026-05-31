import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  const [a, b, c, d] = await Promise.all([
    // What the active query actually returns
    supabase.from('reddit_opportunities').select('id,title,dismissed,addressed')
      .or('dismissed.is.null,dismissed.eq.false')
      .or('addressed.is.null,addressed.eq.false')
      .order('created_at', { ascending: false }).limit(20),

    // All rows raw
    supabase.from('reddit_opportunities').select('id,title,dismissed,addressed')
      .order('created_at', { ascending: false }).limit(20),

    // Count by dismissed/addressed
    supabase.from('reddit_opportunities').select('dismissed,addressed'),

    // Test a simple eq query
    supabase.from('reddit_opportunities').select('id,title').eq('dismissed', false).eq('addressed', false).limit(5),
  ]);

  return NextResponse.json({
    activeQuery: { count: a.data?.length, error: a.error, rows: a.data },
    allRaw: { count: b.data?.length, error: b.error, rows: b.data },
    simpleEq: { count: d.data?.length, error: d.error, rows: d.data },
    breakdown: c.data?.reduce((acc, r) => {
      const key = `dismissed=${r.dismissed},addressed=${r.addressed}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  });
}
