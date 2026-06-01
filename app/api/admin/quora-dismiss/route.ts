import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('admin_session');
  if (!cookie?.value) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json() as { id: string };
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('quora_opportunities').update({ dismissed: true }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
