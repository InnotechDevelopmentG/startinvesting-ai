import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Compound Interest: How $500/Month Becomes $1.7 Million';
const DESCRIPTION =
  'Real compound interest examples with exact dollar amounts — what $100, $300, $500, and $1,000/month grows to starting at age 25, 35, and 45.';
const SLUG = 'compound-interest-examples';
const DATE = '2026-06-03T00:00:00Z';

export const metadata: Metadata = {
  title: `${TITLE} — startinvesting.ai`,
  description: DESCRIPTION,
  alternates: { canonical: `https://startinvesting.ai/learn/${SLUG}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `https://startinvesting.ai/learn/${SLUG}`,
    type: 'article',
    publishedTime: DATE,
    siteName: 'startinvesting.ai',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

const AGE_TABLE = [
  { label: 'Start at 25 (40 yrs)', y: '$1,740,000', invested: '$240,000', gains: '$1,500,000' },
  { label: 'Start at 30 (35 yrs)', y: '$1,160,000', invested: '$210,000', gains: '$950,000' },
  { label: 'Start at 35 (30 yrs)', y: '$745,000', invested: '$180,000', gains: '$565,000' },
  { label: 'Start at 40 (25 yrs)', y: '$475,000', invested: '$150,000', gains: '$325,000' },
  { label: 'Start at 45 (20 yrs)', y: '$294,500', invested: '$120,000', gains: '$174,500' },
];

const AMOUNT_TABLE = [
  { amt: '$100/mo', y10: '$18,300', y20: '$58,900', y30: '$149,000', y40: '$349,000' },
  { amt: '$200/mo', y10: '$36,600', y20: '$117,800', y30: '$298,000', y40: '$698,000' },
  { amt: '$300/mo', y10: '$54,900', y20: '$176,700', y30: '$447,000', y40: '$1,047,000' },
  { amt: '$500/mo', y10: '$91,500', y20: '$294,500', y30: '$745,000', y40: '$1,740,000' },
  { amt: '$1,000/mo', y10: '$182,900', y20: '$589,000', y30: '$1,490,000', y40: '$3,490,000' },
];

const FAQ = [
  {
    q: 'How does compound interest work with investing?',
    a: "When your investments earn returns, those returns are added to your principal. The next period, you earn returns on the larger amount — including the previous returns. Over time, this creates exponential growth. A portfolio earning 8% doubles roughly every 9 years (the Rule of 72: 72 ÷ 8 = 9 years).",
  },
  {
    q: 'How much does $500/month grow to in 30 years?',
    a: '$500 invested every month at an 8% average annual return grows to approximately $745,000 in 30 years. You would have contributed $180,000 of your own money — compound interest generates the remaining $565,000.',
  },
  {
    q: 'How much does compound interest make you over 40 years?',
    a: '$500/month at 8% over 40 years reaches approximately $1,740,000. Of that, $240,000 is your actual contributions — the other $1,500,000 is pure compound growth. That 6.25× multiplier is why starting early is so powerful.',
  },
  {
    q: "What's the Rule of 72?",
    a: "The Rule of 72 estimates how long it takes your money to double: divide 72 by your expected return rate. At 8% returns, your money doubles every 9 years (72 ÷ 8). At 10%, it doubles every 7.2 years. At 6%, it doubles every 12 years.",
  },
  {
    q: 'Does compound interest work monthly or annually?',
    a: 'In most investment accounts, returns compound continuously (or daily), which is slightly better than annual compounding. For practical planning purposes, the difference between monthly and annual compounding at 8% over 30 years is small — the much bigger factor is whether you start investing today or delay.',
  },
  {
    q: "Is compound interest better than a savings account?",
    a: "High-yield savings accounts pay 4–5% APY as of 2024, which compounds your interest — but this is much lower than the historical stock market return of ~10% nominal (8% inflation-adjusted). For long-term money you won't need for 10+ years, an S&P 500 index fund has historically outperformed savings accounts by a wide margin.",
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: DATE,
      dateModified: DATE,
      author: { '@type': 'Organization', name: 'startinvesting.ai' },
      publisher: { '@type': 'Organization', name: 'startinvesting.ai', url: 'https://startinvesting.ai' },
      url: `https://startinvesting.ai/learn/${SLUG}`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-[720px] mx-auto px-6 py-12">

        <nav className="flex items-center gap-2 text-[13px] text-[#aaa] mb-8">
          <Link href="/" className="hover:text-[#00C896] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-[#00C896] transition-colors">Learn</Link>
          <span>/</span>
          <span className="text-[#888]">Compound interest examples</span>
        </nav>

        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00C896] bg-[#E6FAF5] px-2.5 py-1 rounded-full">
            Investing
          </span>
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mt-4 mb-4">
            Compound Interest: How $500/Month Becomes $1.7 Million
          </h1>
          <p className="text-[17px] text-[#555] leading-relaxed">
            Compound interest is simple to understand and almost impossible to intuit — because the growth is invisible for years, then suddenly enormous. Here are the actual numbers, so you can see what&apos;s happening.
          </p>
          <p className="text-[13px] text-[#aaa] mt-3">6 min read · startinvesting.ai</p>
        </div>

        <div className="border-t border-[#f3f4f6] mb-8" />

        <div className="flex flex-col gap-6 text-[16px] text-[#333] leading-[1.75]">

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-2">How compound interest actually works</h2>
          <p>
            Simple interest: you earn returns only on your original investment. If you put $10,000 in at 8%, you earn $800/year, every year. After 30 years: $34,000 total.
          </p>
          <p>
            Compound interest: you earn returns on your original investment <em>plus</em> all the returns you&apos;ve already earned. That same $10,000 at 8%, compounded annually for 30 years, grows to <strong>$100,627</strong> — nearly 3× more.
          </p>
          <p>
            The math compounds even more dramatically when you add monthly contributions, because every dollar you invest has its own compounding timeline.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The Rule of 72: how fast your money doubles</h2>
          <p>
            A quick mental model: divide 72 by your expected annual return to find how many years it takes your money to double.
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>At <strong>8% return</strong> (S&amp;P 500 inflation-adjusted average): money doubles every <strong>9 years</strong></li>
            <li>At <strong>10% return</strong> (S&amp;P 500 nominal average): money doubles every <strong>7.2 years</strong></li>
            <li>At <strong>5% return</strong> (bonds): money doubles every <strong>14.4 years</strong></li>
            <li>At <strong>4.5% return</strong> (HYSA): money doubles every <strong>16 years</strong></li>
          </ul>
          <p>
            At 8%, $100,000 grows to $200,000 in 9 years, $400,000 in 18 years, $800,000 in 27 years, and $1,600,000 in 36 years — without adding a single dollar. <em>That&apos;s</em> the compounding snowball.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">$500/month: what it grows to at different starting ages</h2>
          <p>
            Investing $500/month consistently at an 8% average annual return, until age 65:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#f3f4f6]">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                  <th className="text-left px-4 py-3 font-semibold text-[#555]">Starting Age</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">Portfolio at 65</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">You Invested</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">Market Added</th>
                </tr>
              </thead>
              <tbody>
                {AGE_TABLE.map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                    <td className="px-4 py-3 font-semibold text-[#111]">{row.label}</td>
                    <td className="px-4 py-3 text-right text-[#00C896] font-semibold">{row.y}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.invested}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.gains}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-[#aaa] -mt-2">$500/month at 8% average annual return to age 65. Educational purposes only.</p>

          <p>
            The person who starts at 25 invests only $120,000 more than the person who starts at 35 (10 extra years × $500/month × 12 months = $60,000 more) — but ends up with nearly <strong>$1 million more</strong>. The extra million didn&apos;t come from extra contributions. It came from compound growth having 10 more years to work.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Different monthly amounts over time</h2>
          <p>All at 8% average annual return:</p>

          <div className="overflow-x-auto rounded-xl border border-[#f3f4f6]">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                  <th className="text-left px-4 py-3 font-semibold text-[#555]">Monthly</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">10 yrs</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">20 yrs</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">30 yrs</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">40 yrs</th>
                </tr>
              </thead>
              <tbody>
                {AMOUNT_TABLE.map((row, i) => (
                  <tr key={row.amt} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                    <td className="px-4 py-3 font-semibold text-[#111]">{row.amt}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.y10}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.y20}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.y30}</td>
                    <td className="px-4 py-3 text-right text-[#00C896] font-semibold">{row.y40}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Why the growth feels invisible — and then sudden</h2>
          <p>
            Compound interest is back-weighted. The first 10 years of $500/month investing at 8% produces about $91,500. The <em>last</em> 10 years of a 40-year investment period (years 30–40) produces roughly <strong>$800,000</strong> in new growth.
          </p>
          <p>
            This is why consistent investors feel like nothing is happening for the first decade — and then suddenly feel rich. The math is working the whole time; you just can&apos;t see it until the snowball gets large enough.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The one thing that kills compound interest</h2>
          <p>
            Stopping. If you invest $500/month from age 25 to 35 (10 years, $60,000 total), then stop investing entirely, your $91,500 grows to approximately <strong>$980,000</strong> by age 65 — purely through compound growth with no additional contributions.
          </p>
          <p>
            Compare that to someone who skips the first 10 years and invests $500/month from age 35 to 65 (30 years, $180,000 total invested) — they end up with about <strong>$745,000</strong>.
          </p>
          <p>
            The 10-year early investor, who invested $120,000 less, ends up with $235,000 more. Time is the most powerful variable.
          </p>

          <div className="rounded-2xl bg-[#111] p-7 text-center mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00C896] mb-2">See your own numbers</p>
            <p className="text-[19px] font-medium text-white mb-2 tracking-tight">Enter your monthly contribution and watch it compound</p>
            <p className="text-[14px] text-[#888] mb-5">Free calculator built on real S&amp;P 500 historical data.</p>
            <Link href="/" className="inline-block px-7 py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors">
              Calculate my compound growth →
            </Link>
          </div>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-l-2 border-[#00C896] pl-4">
                <p className="font-semibold text-[#111] mb-2">{q}</p>
                <p className="text-[15px] text-[#555]">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#bbb] leading-relaxed border-t border-[#f3f4f6] pt-6 mt-10">
          For educational purposes only. Not financial advice. All examples assume a flat 8% annual return compounded monthly — actual market returns vary year to year and are not guaranteed. Past performance does not guarantee future results.
        </p>
      </div>
    </>
  );
}
