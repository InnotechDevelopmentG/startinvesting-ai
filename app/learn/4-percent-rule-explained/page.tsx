import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'The 4% Rule Explained: How Much Do You Need to Retire?';
const DESCRIPTION =
  'The math behind the most important number in retirement planning — what the 4% rule is, where it comes from, and how to calculate your exact FIRE number in seconds.';
const SLUG = '4-percent-rule-explained';
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

const SPENDING_TABLE = [
  { spending: '$30,000/yr', fireAt4: '$750,000', fireAt35: '$857,000', fireAt3: '$1,000,000' },
  { spending: '$40,000/yr', fireAt4: '$1,000,000', fireAt35: '$1,143,000', fireAt3: '$1,333,000' },
  { spending: '$50,000/yr', fireAt4: '$1,250,000', fireAt35: '$1,429,000', fireAt3: '$1,667,000' },
  { spending: '$60,000/yr', fireAt4: '$1,500,000', fireAt35: '$1,714,000', fireAt3: '$2,000,000' },
  { spending: '$80,000/yr', fireAt4: '$2,000,000', fireAt35: '$2,286,000', fireAt3: '$2,667,000' },
  { spending: '$100,000/yr', fireAt4: '$2,500,000', fireAt35: '$2,857,000', fireAt3: '$3,333,000' },
];

const FAQ = [
  {
    q: 'What is the 4% rule?',
    a: 'The 4% rule says you can withdraw 4% of your investment portfolio per year in retirement without running out of money over a 30-year period. It was derived from the 1998 Trinity Study, which tested historical withdrawal rates against actual stock and bond market returns from 1926 onward.',
  },
  {
    q: 'How do I calculate my FIRE number using the 4% rule?',
    a: 'Multiply your expected annual retirement spending by 25. If you plan to spend $60,000/year in retirement, your FIRE number is $60,000 × 25 = $1,500,000. That\'s the portfolio size at which a 4% annual withdrawal equals your spending.',
  },
  {
    q: 'Is the 4% rule still safe today?',
    a: 'Research generally supports the 4% rule for 30-year retirements. For early retirees with 40–50 year horizons, many planners recommend 3–3.5% to provide more buffer. Current low-yield bond environments have also prompted some experts to suggest 3.3–3.5% as more conservative targets.',
  },
  {
    q: 'What happens if the market crashes early in my retirement?',
    a: 'This is called "sequence of returns risk." A major crash in your first 5 years of retirement has a disproportionately large impact. Strategies to mitigate this include keeping 1–2 years of expenses in cash, having part-time income flexibility, or using a 3.5% withdrawal rate instead of 4%.',
  },
  {
    q: 'Can I use the 4% rule for an early retirement at 40 or 45?',
    a: 'For a 40–50 year retirement, the 4% rule has historically worked but with less margin. Most early retirees use 3.25–3.5% as a safer withdrawal rate for very long retirements. Some also plan for part-time income in the early years to reduce portfolio withdrawals.',
  },
  {
    q: "What's the difference between 3%, 3.5%, 4%, and 5% withdrawal rates?",
    a: 'Lower withdrawal rates require a larger portfolio but provide more safety. At 3%, your FIRE number is annual spending × 33.3. At 3.5%, it\'s × 28.6. At 4%, it\'s × 25. At 5%, it\'s × 20 — the most aggressive rate, suitable only for shorter retirements or those with other income sources.',
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
          <span className="text-[#888]">The 4% rule explained</span>
        </nav>

        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6366f1] bg-[#f0f0ff] px-2.5 py-1 rounded-full">
            FIRE
          </span>
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mt-4 mb-4">
            The 4% Rule: How Much Do You Actually Need to Retire?
          </h1>
          <p className="text-[17px] text-[#555] leading-relaxed">
            The 4% rule is the foundation of almost every retirement calculation. Understanding it takes about 5 minutes, and it will change how you think about money, work, and what &quot;enough&quot; actually means.
          </p>
          <p className="text-[13px] text-[#aaa] mt-3">8 min read · startinvesting.ai</p>
        </div>

        <div className="border-t border-[#f3f4f6] mb-8" />

        <div className="flex flex-col gap-6 text-[16px] text-[#333] leading-[1.75]">

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-2">What is the 4% rule?</h2>
          <p>
            The 4% rule says: <strong>if you withdraw 4% of your investment portfolio in your first year of retirement and adjust that amount for inflation each year, your money will last at least 30 years</strong> in almost every historical market scenario — including the Great Depression, the 1970s stagflation, and the 2008 financial crisis.
          </p>
          <p>
            It was first formulated by financial advisor William Bengen in 1994 and later validated by the famous Trinity Study (1998) at Trinity University. They backtested withdrawal rates against actual US stock and bond market returns going back to 1926. The conclusion: a 4% withdrawal rate has a 95%+ historical success rate for 30-year retirements with a balanced portfolio.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The formula: your FIRE number in one calculation</h2>
          <p>The 4% rule gives you a simple formula for your retirement number:</p>
          <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-xl px-5 py-4">
            <p className="text-[15px] font-medium text-[#111]">FIRE Number = Annual Retirement Spending × 25</p>
            <p className="text-[13px] text-[#888] mt-1">Because 4% × 25 = 100% of your spending. Simple.</p>
          </div>
          <p>
            If you plan to spend $60,000 per year in retirement, your FIRE number is $60,000 × 25 = <strong>$1,500,000</strong>. Once you have that invested in a diversified portfolio, you can withdraw $60,000/year indefinitely — at least historically.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">FIRE numbers by annual spending</h2>
          <p>Here&apos;s what the 4% rule means in practice, across three different withdrawal rate assumptions:</p>

          <div className="overflow-x-auto rounded-xl border border-[#f3f4f6]">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                  <th className="text-left px-4 py-3 font-semibold text-[#555]">Annual Spending</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">4% (Standard)</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">3.5% (Conservative)</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">3% (Ultra-safe)</th>
                </tr>
              </thead>
              <tbody>
                {SPENDING_TABLE.map((row, i) => (
                  <tr key={row.spending} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                    <td className="px-4 py-3 font-semibold text-[#111]">{row.spending}</td>
                    <td className="px-4 py-3 text-right text-[#00C896] font-semibold">{row.fireAt4}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.fireAt35}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.fireAt3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-[#aaa] -mt-2">Numbers rounded. FIRE number = Annual spending ÷ withdrawal rate.</p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Why the math works: the return minus withdrawal equation</h2>
          <p>
            The 4% rule works because a diversified portfolio invested in stocks historically returns about 7–10% annually in nominal terms. After inflation (~3%), that&apos;s a <strong>real return of roughly 4–7%</strong> per year.
          </p>
          <p>
            If your portfolio earns 7% real and you withdraw 4%, the remaining 3% continues to compound. In most years, your portfolio actually <em>grows</em> even while you&apos;re withdrawing from it. The rule fails mainly in scenarios where markets crash severely in the first years of retirement — before the portfolio has time to recover.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">When to use a lower rate: 3% or 3.5%</h2>
          <p>
            The original Trinity Study was designed for a 30-year retirement — roughly retiring at 65 and living to 95. If you&apos;re planning for a <strong>40–50 year retirement</strong> (retiring at 40 or 45), many researchers recommend a lower withdrawal rate:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li><strong>3.5%</strong> — Good for 40-year retirements; still aggressive but well-tested historically</li>
            <li><strong>3.25%</strong> — Common target for people retiring in their early 40s</li>
            <li><strong>3%</strong> — Ultra-conservative; essentially &quot;fail-proof&quot; historically, but requires a 33× spending portfolio</li>
          </ul>
          <p>
            The simplest approach for early retirees: use the standard 4% rule to know the minimum required number, but plan to build 10–15% extra buffer before you stop working.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The fastest way to reduce your FIRE number</h2>
          <p>
            Your FIRE number is directly tied to your spending. Reducing your annual expenses by $10,000 reduces your required portfolio by $250,000. This is why the FIRE community focuses so heavily on spending — it has a 25× multiplier effect on how much you need to save.
          </p>
          <p>
            A few levers that have an outsized impact:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li><strong>Housing:</strong> Moving from a $3,000/month to a $2,000/month home reduces your FIRE number by $300,000</li>
            <li><strong>Cars:</strong> Eliminating a $600/month car payment reduces your FIRE number by $180,000</li>
            <li><strong>Part-time work in early retirement:</strong> $20,000/year in part-time income means you only need to withdraw $40,000 instead of $60,000, reducing your FIRE number by $500,000</li>
          </ul>

          <div className="rounded-2xl bg-[#111] p-7 text-center mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00C896] mb-2">Calculate your FIRE number</p>
            <p className="text-[19px] font-medium text-white mb-2 tracking-tight">See exactly when you can retire — in today&apos;s dollars</p>
            <p className="text-[14px] text-[#888] mb-5">Enter your savings, contributions, and spending to get your exact FIRE timeline.</p>
            <Link href="/fire" className="inline-block px-7 py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors">
              Open FIRE Calculator →
            </Link>
          </div>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-l-2 border-[#6366f1] pl-4">
                <p className="font-semibold text-[#111] mb-2">{q}</p>
                <p className="text-[15px] text-[#555]">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#bbb] leading-relaxed border-t border-[#f3f4f6] pt-6 mt-10">
          For educational purposes only. Not financial advice. The 4% rule is based on historical US market data and does not guarantee future results. Individual circumstances vary — consult a qualified financial planner before making retirement decisions.
        </p>
      </div>
    </>
  );
}
