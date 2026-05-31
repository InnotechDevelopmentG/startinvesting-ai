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
    const text = await req.text();
    const { id } = JSON.parse(text);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('reddit_opportunities')
      .update({ addressed: true })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
