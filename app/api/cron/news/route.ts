import { NextRequest, NextResponse } from 'next/server';
import { generateNewsArticle } from '@/lib/news-generator';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export const maxDuration = 60; // seconds — article generation needs time

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  const authHeader = req.headers.get('authorization');
  const querySecret = req.nextUrl.searchParams.get('secret');

  const authorized =
    !cronSecret ||
    isVercelCron ||
    authHeader === `Bearer ${cronSecret}` ||
    querySecret === cronSecret;

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[news-cron] Starting article generation...');

    const article = await generateNewsArticle();

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('news_articles')
      .insert({
        slug: article.slug,
        title: article.title,
        seo_description: article.seo_description,
        summary: article.summary,
        content: article.content,
        category: article.category,
        tags: article.tags,
        published_at: new Date().toISOString(),
      })
      .select('id, slug')
      .single();

    if (error) {
      // Duplicate slug — just log and return ok (article already exists for this time window)
      if (error.code === '23505') {
        console.log('[news-cron] Duplicate slug, skipping:', article.slug);
        return NextResponse.json({ success: true, skipped: true, slug: article.slug });
      }
      throw new Error(`Supabase insert error: ${error.message}`);
    }

    console.log('[news-cron] Published:', data.slug);
    return NextResponse.json({ success: true, slug: data.slug, id: data.id });
  } catch (err) {
    console.error('[news-cron] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
