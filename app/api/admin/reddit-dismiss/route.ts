import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('reddit_opportunities')
      .update({ dismissed: true })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reddit-dismiss]', err);
    return NextResponse.json({ error: 'Failed to dismiss' }, { status: 500 });
  }
}
