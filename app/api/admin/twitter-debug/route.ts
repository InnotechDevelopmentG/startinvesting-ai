import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('admin_session');
  if (!cookie?.value) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  // Raw select — no filters, no ordering, just get whatever is in the table
  const { data, error } = await supabase
    .from('twitter_opportunities')
    .select('*')
    .limit(20);

  return NextResponse.json({
    rowCount: data?.length ?? 0,
    error: error ? { message: error.message, code: error.code, details: error.details } : null,
    rows: data ?? [],
  });
}
