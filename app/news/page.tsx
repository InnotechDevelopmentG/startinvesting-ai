import Link from 'next/link';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: 'Investing News & Market Updates — startinvesting.ai',
  description:
    'Stock market updates, S&P 500 news, and investing insights — updated 5× daily. Written for everyday investors. No jargon, no fluff.',
  alternates: { canonical: 'https://startinvesting.ai/news' },
  openGraph: {
    title: 'Investing News & Market Updates — startinvesting.ai',
    description: 'Daily stock market updates written for everyday investors.',
    url: 'https://startinvesting.ai/news',
    type: 'website',
  },
};

interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  published_at: string;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function NewsPage() {
  const supabase = getSupabaseAdminClient();
  const { data: articles } = await supabase
    .from('news_articles')
    .select('id, slug, title, summary, category, tags, published_at')
    .order('published_at', { ascending: false })
    .limit(30);

  const list = (articles ?? []) as Article[];
  const [featured, ...rest] = list;

  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-12">

      {/* Page header */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-[#00C896] uppercase tracking-[0.15em] mb-3">
          Market News
        </p>
        <h1 className="text-[36px] md:text-[44px] font-medium text-[#111] leading-tight tracking-tight">
          What's moving the market
        </h1>
        <p className="text-[16px] text-[#888] mt-3">
          Updated 5× daily. No jargon, no noise.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center rounded-2xl border border-[#f3f4f6] bg-[#fafafa]">
          <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h8" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-[15px] font-medium text-[#111]">First update coming soon</p>
          <p className="text-[14px] text-[#888]">Articles publish automatically 5× daily.</p>
        </div>
      ) : (
        <>
          {/* Featured article */}
          <Link href={`/news/${featured.slug}`} className="block group mb-8">
            <div className="rounded-2xl border border-[#f3f4f6] hover:border-[#00C896] bg-white p-7 transition-colors duration-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00C896] bg-[#E6FAF5] px-2.5 py-1 rounded-full">
                  Latest
                </span>
                <span className="text-[12px] text-[#aaa]">{timeAgo(featured.published_at)}</span>
              </div>
              <h2 className="text-[22px] md:text-[26px] font-medium text-[#111] leading-snug tracking-tight group-hover:text-[#00C896] transition-colors mb-3">
                {featured.title}
              </h2>
              <p className="text-[15px] text-[#666] leading-relaxed mb-4">{featured.summary}</p>
              <div className="flex flex-wrap gap-2">
                {featured.tags?.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-[11px] text-[#888] bg-[#f3f4f6] px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>

          {/* Article grid */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((article) => (
                <Link key={article.id} href={`/news/${article.slug}`} className="block group">
                  <div className="rounded-xl border border-[#f3f4f6] hover:border-[#00C896] bg-white p-5 h-full flex flex-col transition-colors duration-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#888]">
                        Market Update
                      </span>
                      <span className="text-[11px] text-[#bbb]">{timeAgo(article.published_at)}</span>
                    </div>
                    <h3 className="text-[15px] font-medium text-[#111] leading-snug group-hover:text-[#00C896] transition-colors mb-2 flex-1">
                      {article.title}
                    </h3>
                    <p className="text-[13px] text-[#888] leading-relaxed line-clamp-2 mb-3">
                      {article.summary}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] text-[#aaa] bg-[#f9f9f9] px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
