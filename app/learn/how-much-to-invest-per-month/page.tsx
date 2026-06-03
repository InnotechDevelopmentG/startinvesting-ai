import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'How Much Should I Invest Per Month?';
const DESCRIPTION =
  'Not "15% of income" — the actual monthly investment amount based on your goal, age, and timeline. With real compound interest examples.';
const SLUG = 'how-much-to-invest-per-month';
const DATE = '2026-06-03T00:00:00Z';

export const metadata: Metadata = {
  title: `${TITLE} (With Real Examples) — startinvesting.ai`,
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

const TABLE_DATA = [
  { amt: '$100/mo', y10: '$18,300', y20: '$58,900', y30: '$149,000', y40: '$349,000' },
  { amt: '$200/mo', y10: '$36,600', y20: '$117,800', y30: '$298,000', y40: '$698,000' },
  { amt: '$500/mo', y10: '$91,500', y20: '$294,500', y30: '$745,000', y40: '$1,740,000' },
  { amt: '$1,000/mo', y10: '$182,900', y20: '$589,000', y30: '$1,490,000', y40: '$3,490,000' },
];

const FAQ = [
  {
    q: 'How much should I invest per month as a beginner?',
    a: 'Start with whatever you can sustain — even $50 or $100/month is a meaningful start. The habit and time in market matter more than the amount early on. Automate it so you never think about it, then increase by 1% of income per year.',
  },
  {
    q: 'Is investing $500 a month good?',
    a: '$500/month at an 8% average annual return grows to roughly $91,500 in 10 years, $294,500 in 20 years, and $745,000 in 30 years. Starting at 25, that same $500/month can reach $1.74 million by age 65.',
  },
  {
    q: 'What percentage of income should I invest?',
    a: 'The standard guideline is 15% of gross income for a traditional retirement at 65. If you started late, aim for 20–25%. For early retirement (FIRE), savings rates of 30–50% are common. The exact percentage matters less than the consistency.',
  },
  {
    q: 'Is $200 a month enough to invest?',
    a: '$200/month at 8% grows to about $117,800 in 20 years and $298,000 in 30 years. It\'s a meaningful amount, but you\'ll want to increase contributions as your income grows if you want a comfortable retirement.',
  },
  {
    q: "What if I can't afford to invest right now?",
    a: "Start with your 401(k) up to the employer match only — that's a 50–100% guaranteed return on day one. If there's no employer match, $25–50/month in a Roth IRA still builds the habit and compounds for decades.",
  },
  {
    q: 'Should I pay off debt or invest?',
    a: 'If your debt rate is above 7–8% (credit cards, personal loans), pay it off first — the guaranteed return beats expected market returns. Below 5% (many student loans, mortgages), investing while paying minimums often wins. Between 5–7% is a judgment call.',
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
          <span className="text-[#888]">How much to invest per month</span>
        </nav>

        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#00C896] bg-[#E6FAF5] px-2.5 py-1 rounded-full">
            Investing
          </span>
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mt-4 mb-4">
            How Much Should I Invest Per Month?
          </h1>
          <p className="text-[17px] text-[#555] leading-relaxed">
            Most financial advice says "invest 15% of your income." But that number was designed for people starting at 25, working until 67, with a typical retirement. If that&apos;s not you, 15% is probably the wrong target — and here&apos;s how to find the right one.
          </p>
          <p className="text-[13px] text-[#aaa] mt-3">7 min read · startinvesting.ai</p>
        </div>

        <div className="border-t border-[#f3f4f6] mb-8" />

        <div className="flex flex-col gap-6 text-[16px] text-[#333] leading-[1.75]">

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-2">Start with a specific goal, not a percentage</h2>
          <p>
            Before picking a monthly amount, you need a target. &quot;Retire comfortably&quot; isn&apos;t a target — &quot;$1.5 million by age 62&quot; is. Once you have a number and a deadline, the math tells you exactly what monthly contribution you need.
          </p>
          <p>
            Example: if you want $1 million by 65 and you&apos;re 30 today, you have 35 years. At an 8% average annual return (the long-run S&amp;P 500 average), you need about <strong>$670/month</strong>. That&apos;s your actual number — not whatever 15% of your salary happens to be.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">What different monthly amounts actually grow to</h2>
          <p>At an 8% average annual return, here&apos;s what consistent monthly investing produces:</p>

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
                {TABLE_DATA.map((row, i) => (
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
          <p className="text-[12px] text-[#aaa] -mt-2">Assumes 8% average annual return, compounded monthly. For educational purposes only.</p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">When you start matters more than how much you invest</h2>
          <p>
            This is the most overlooked fact in personal finance: <strong>the timing of your contributions matters more than the size of them.</strong>
          </p>
          <p>Two people both invest $500/month at 8% — but one starts at 25, the other at 35:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Starting at <strong>age 25</strong>: $500/month for 40 years → <strong>$1,740,000</strong> by age 65</li>
            <li>Starting at <strong>age 35</strong>: $500/month for 30 years → <strong>$745,000</strong> by age 65</li>
          </ul>
          <p>
            That 10-year head start is worth nearly <strong>$1 million</strong> — without investing a single extra dollar per month. That&apos;s compound interest at scale.
          </p>
          <p>
            The implication: it is almost always better to start investing a small amount now than to wait until you can invest a larger amount later. $100/month at 25 beats $500/month at 40 in most scenarios.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The 15% rule — and when it actually works</h2>
          <p>The 15% guideline works well if you:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>Start saving in your mid-20s</li>
            <li>Plan to retire around 65–67</li>
            <li>Want to replace roughly 75–80% of your pre-retirement income</li>
            <li>Will receive some Social Security benefits</li>
          </ul>
          <p>
            If you started later, want to retire earlier, or live in a high cost-of-living area, 15% probably isn&apos;t enough. A 35-year-old targeting retirement at 55 might need to save 25–35% to make the numbers work.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Where to put your money — in order</h2>
          <ol className="list-decimal pl-5 flex flex-col gap-2">
            <li><strong>401(k) up to the employer match.</strong> If your employer matches 50% up to 6% of salary, that&apos;s a guaranteed 50% return on day one — nothing beats it.</li>
            <li><strong>Pay off high-interest debt</strong> (anything above 7–8% APR). The guaranteed &quot;return&quot; of eliminating 24% credit card debt beats the market every time.</li>
            <li><strong>Roth IRA up to the annual limit</strong> ($7,000 in 2024). Tax-free growth for decades is one of the best deals available to individual investors.</li>
            <li><strong>Max out your 401(k)</strong> ($23,000 in 2024).</li>
            <li><strong>Taxable brokerage account</strong> — anything beyond the above.</li>
          </ol>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The easiest way to increase your savings rate</h2>
          <p>
            Whenever you get a raise, automatically direct 50% of it toward investing. If you get a $300/month raise, set up an automatic transfer of $150/month to your investment account the same week. You never see the money, you don&apos;t miss it, and within a decade your monthly contribution has doubled — painlessly.
          </p>
          <p>
            Another proven tactic: increase your contribution rate by just 1% of income each year. Going from 10% to 11% is invisible in your paycheck, but over 10 years it compounds dramatically.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">What to actually buy</h2>
          <p>
            Once you know how much to invest, the &quot;what&quot; is simple for most people: <strong>an S&amp;P 500 index fund.</strong> Specifically VOO (Vanguard), FXAIX (Fidelity), or SPY. These track the 500 largest US companies, charge near-zero fees (VOO charges 0.03%/year), and have outperformed the vast majority of actively managed funds over every 15+ year period on record.
          </p>
          <p>
            The strategy: pick the index fund, automate monthly purchases, don&apos;t check it obsessively, repeat for decades. That&apos;s it.
          </p>

          <div className="rounded-2xl bg-[#111] p-7 text-center mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00C896] mb-2">Try the calculator</p>
            <p className="text-[19px] font-medium text-white mb-2 tracking-tight">See exactly what your monthly investment will grow to</p>
            <p className="text-[14px] text-[#888] mb-5">Enter your numbers and get a projection based on real S&amp;P 500 historical data.</p>
            <Link href="/" className="inline-block px-7 py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors">
              Calculate my investment growth →
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
          For educational purposes only. Not financial advice. All examples assume a consistent monthly contribution and a flat 8% annual return — actual market returns vary and are not guaranteed. Past performance does not guarantee future results.
        </p>
      </div>
    </>
  );
}
