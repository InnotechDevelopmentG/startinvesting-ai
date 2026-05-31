import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

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
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('reddit_opportunities')
      .update({ dismissed: true })
      .eq('id', id);

    if (error) {
      console.error('[reddit-dismiss] supabase error:', error);
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reddit-dismiss]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
