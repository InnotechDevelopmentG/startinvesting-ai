import { MetadataRoute } from 'next';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://startinvesting.ai';

  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    { url: base,              lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/fire`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/mortgage`,lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/news`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic article pages
  try {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from('news_articles')
      .select('slug, published_at')
      .order('published_at', { ascending: false })
      .limit(500);

    const articles: MetadataRoute.Sitemap = (data ?? []).map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: new Date(a.published_at),
      changeFrequency: 'never',
      priority: 0.7,
    }));

    return [...static_pages, ...articles];
  } catch {
    return static_pages;
  }
}
