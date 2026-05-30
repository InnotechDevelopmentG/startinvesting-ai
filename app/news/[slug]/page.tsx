import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import ArticleSubscribe from '@/components/ArticleSubscribe';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  seo_description: string;
  content: string;
  category: string;
  tags: string[];
  published_at: string;
}

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from('news_articles')
    .select('title, seo_description, summary, slug, published_at')
    .eq('slug', params.slug)
    .single();

  if (!data) return { title: 'Article not found' };

  const desc = data.seo_description || data.summary;
  const url = `https://startinvesting.ai/news/${data.slug}`;

  return {
    title: `${data.title} — startinvesting.ai`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: data.title,
      description: desc,
      url,
      type: 'article',
      publishedTime: data.published_at,
      siteName: 'startinvesting.ai',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: desc,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/Los_Angeles',
  });
}

export default async function ArticlePage({ params }: Props) {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from('news_articles')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!data) notFound();

  const article = data as Article;
  const paragraphs = article.content.split('\n\n').filter(Boolean);

  // Structured data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.seo_description || article.summary,
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: { '@type': 'Organization', name: 'startinvesting.ai' },
    publisher: {
      '@type': 'Organization',
      name: 'startinvesting.ai',
      url: 'https://startinvesting.ai',
    },
    url: `https://startinvesting.ai/news/${article.slug}`,
    keywords: article.tags?.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[720px] mx-auto px-6 py-12">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] text-[#aaa] mb-8">
          <Link href="/" className="hover:text-[#00C896] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-[#00C896] transition-colors">News</Link>
          <span>/</span>
          <span className="text-[#888] truncate">{article.title.slice(0, 40)}…</span>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00C896] bg-[#E6FAF5] px-2.5 py-1 rounded-full">
              Market Update
            </span>
          </div>
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mb-4">
            {article.title}
          </h1>
          <p className="text-[16px] text-[#666] leading-relaxed mb-4">
            {article.summary}
          </p>
          <p className="text-[13px] text-[#aaa]">
            {formatDate(article.published_at)} · startinvesting.ai
          </p>
        </div>

        {/* Subscribe — top */}
        <ArticleSubscribe position="top" />

        {/* Divider */}
        <div className="border-t border-[#f3f4f6] mb-8" />

        {/* Article body */}
        <div className="flex flex-col gap-5 mb-10">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[16px] text-[#333] leading-[1.75]">
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {article.tags.map((tag) => (
              <span key={tag} className="text-[12px] text-[#888] bg-[#f3f4f6] px-3 py-1.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Subscribe — bottom */}
        <ArticleSubscribe position="bottom" />

        {/* Disclaimer */}
        <p className="text-[11px] text-[#bbb] leading-relaxed border-t border-[#f3f4f6] pt-6 mb-10">
          This article is generated from real-time financial news for educational purposes only.
          It does not constitute financial advice. Past market performance does not guarantee future results.
          Always do your own research before investing.
        </p>

        {/* CTA */}
        <div className="rounded-2xl bg-[#111] p-7 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00C896] mb-2">
            Ready to start investing?
          </p>
          <p className="text-[18px] font-medium text-white mb-1 tracking-tight">
            See how much your money could grow.
          </p>
          <p className="text-[14px] text-[#888] mb-5">
            Free simulator · Takes 2 minutes · Built on real S&P 500 data.
          </p>
          <Link
            href="/"
            className="inline-block px-7 py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
          >
            Calculate my investment growth →
          </Link>
        </div>
      </div>
    </>
  );
}
