import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news_articles')
      .select('id, slug, title, published_at')
      .order('published_at', { ascending: false })
      .limit(5);

    return NextResponse.json({ data, error, count: data?.length ?? 0 });
  } catch (err) {
    return NextResponse.json({ threw: err instanceof Error ? err.message : String(err) });
  }
}
