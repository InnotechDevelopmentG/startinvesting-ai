import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Finance Guides — startinvesting.ai',
  description:
    'Free in-depth guides on investing, FIRE, compound interest, and mortgages — with real numbers, not vague advice.',
  alternates: { canonical: 'https://startinvesting.ai/learn' },
  openGraph: {
    title: 'Personal Finance Guides — startinvesting.ai',
    description: 'Free guides on investing, FIRE, compound interest, and mortgages — real numbers, zero jargon.',
    url: 'https://startinvesting.ai/learn',
    type: 'website',
    siteName: 'startinvesting.ai',
  },
};

const articles = [
  {
    slug: 'how-much-to-invest-per-month',
    title: 'How Much Should I Invest Per Month?',
    description: 'The honest answer — with real dollar examples at every income level and timeline.',
    tag: 'Investing',
    readTime: '7 min',
  },
  {
    slug: '4-percent-rule-explained',
    title: 'The 4% Rule: How Much Do You Actually Need to Retire?',
    description: 'The math behind the most important retirement number — and how to calculate yours in 30 seconds.',
    tag: 'FIRE',
    readTime: '8 min',
  },
  {
    slug: 'compound-interest-examples',
    title: 'Compound Interest: How $500/Month Becomes $1.7 Million',
    description: 'Exact outcomes for $100, $300, $500, and $1,000/month — starting at 25, 35, and 45.',
    tag: 'Investing',
    readTime: '6 min',
  },
  {
    slug: 'coast-fire-number-explained',
    title: 'Coast FIRE: The Number That Lets You Stop Investing Early',
    description: 'What Coast FIRE is, how to calculate your number, and why it changes how you think about work.',
    tag: 'FIRE',
    readTime: '7 min',
  },
  {
    slug: '30-year-vs-15-year-mortgage',
    title: '30-Year vs. 15-Year Mortgage: Which Saves More Money?',
    description: 'Side-by-side with real numbers — total interest, monthly payments, and the invest-the-difference math.',
    tag: 'Mortgage',
    readTime: '7 min',
  },
];

const tagStyle: Record<string, string> = {
  Investing: 'text-[#00C896] bg-[#E6FAF5]',
  FIRE: 'text-[#6366f1] bg-[#f0f0ff]',
  Mortgage: 'text-[#f59e0b] bg-[#fef9ec]',
};

export default function LearnPage() {
  return (
    <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-12">
      <div className="mb-10">
        <p className="text-[11px] font-semibold text-[#00C896] uppercase tracking-[0.15em] mb-3">Learn</p>
        <h1 className="text-[36px] md:text-[44px] font-medium text-[#111] leading-tight tracking-tight">
          Personal finance, explained with numbers
        </h1>
        <p className="text-[16px] text-[#888] mt-3 max-w-[540px]">
          No vague advice. No jargon. The math behind building wealth — and exactly how to apply it.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <Link key={article.slug} href={`/learn/${article.slug}`} className="block group">
            <div className="rounded-xl border border-[#f3f4f6] hover:border-[#00C896] bg-white p-5 h-full flex flex-col transition-colors duration-200">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${tagStyle[article.tag]}`}>
                  {article.tag}
                </span>
                <span className="text-[11px] text-[#bbb]">{article.readTime} read</span>
              </div>
              <h2 className="text-[16px] font-medium text-[#111] leading-snug group-hover:text-[#00C896] transition-colors mb-2 flex-1">
                {article.title}
              </h2>
              <p className="text-[13px] text-[#888] leading-relaxed">{article.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
