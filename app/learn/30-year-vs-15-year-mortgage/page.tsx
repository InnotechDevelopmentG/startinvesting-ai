import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = '30-Year vs. 15-Year Mortgage: Which Saves More Money?';
const DESCRIPTION =
  'A side-by-side comparison with real numbers — monthly payments, total interest, and the "invest the difference" math that changes how most people think about this decision.';
const SLUG = '30-year-vs-15-year-mortgage';
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

const FAQ = [
  {
    q: 'Is a 15-year mortgage worth it?',
    a: "A 15-year mortgage saves roughly $249,000 in total interest on a $320,000 loan at 7% compared to a 30-year. It's worth it if you can comfortably afford the higher monthly payment, you're risk-averse, and you won't reliably invest the monthly payment difference in the market.",
  },
  {
    q: 'How much more do you pay monthly on a 15-year vs 30-year mortgage?',
    a: 'On a $320,000 loan at 7%, a 15-year mortgage costs about $2,876/month vs $2,129/month for a 30-year — a difference of $747/month. Your payment is 35% higher, but you pay off the home in half the time.',
  },
  {
    q: "What is the 'invest the difference' strategy?",
    a: "Instead of choosing a 15-year mortgage, you take the 30-year and invest the monthly payment difference ($747/month) in an S&P 500 index fund. Over 30 years at 8% average annual return, that $747/month grows to approximately $1.1 million — far exceeding the $249,000 in interest savings from the 15-year. The catch: you have to actually invest the difference.",
  },
  {
    q: "Should I get a 30-year mortgage and invest the difference?",
    a: "Mathematically, 'invest the difference' usually wins over a 15-year mortgage — the stock market's historical returns outpace the interest savings. But this only works if you actually invest the money consistently for 30 years. Many people spend it instead. If you're disciplined and will invest, 30-year often wins on paper. If you're not sure, the 15-year is the forced-savings version.",
  },
  {
    q: 'Which mortgage term is better for first-time buyers?',
    a: 'Most first-time buyers choose the 30-year for the lower monthly payment and cash flow flexibility. It leaves more room for unexpected expenses, furnishing costs, and building an emergency fund. You can always make extra principal payments on a 30-year to pay it off faster — but you can\'t reduce payments on a 15-year if your income drops.',
  },
  {
    q: 'Does the 15-year mortgage always have a lower interest rate?',
    a: 'Usually, yes — 15-year mortgage rates are typically 0.5–0.75% lower than 30-year rates. This makes the 15-year even more attractive on a pure interest basis. In the example above using the same 7% rate, the actual savings would be even greater if you used realistic rate differentials.',
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
          <span className="text-[#888]">30-year vs 15-year mortgage</span>
        </nav>

        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#f59e0b] bg-[#fef9ec] px-2.5 py-1 rounded-full">
            Mortgage
          </span>
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mt-4 mb-4">
            30-Year vs. 15-Year Mortgage: Which Saves More Money?
          </h1>
          <p className="text-[17px] text-[#555] leading-relaxed">
            The 15-year mortgage saves you a quarter-million dollars in interest. But the 30-year might still be the smarter financial choice — if you do one specific thing with the money you save each month. Here are the exact numbers.
          </p>
          <p className="text-[13px] text-[#aaa] mt-3">7 min read · startinvesting.ai</p>
        </div>

        <div className="border-t border-[#f3f4f6] mb-8" />

        <div className="flex flex-col gap-6 text-[16px] text-[#333] leading-[1.75]">

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-2">The side-by-side comparison</h2>
          <p>
            Using a realistic example: <strong>$400,000 home, 20% down payment ($80,000), $320,000 loan, 7% interest rate.</strong>
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#f3f4f6]">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                  <th className="text-left px-4 py-3 font-semibold text-[#555]"> </th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">30-Year</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">15-Year</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Monthly P&I Payment', a: '$2,129', b: '$2,876', highlight: false },
                  { label: 'Total Payments', a: '$766,440', b: '$517,680', highlight: false },
                  { label: 'Total Interest Paid', a: '$446,440', b: '$197,680', highlight: true },
                  { label: 'Interest Savings (15-yr)', a: '—', b: '$248,760', highlight: false },
                  { label: 'Payoff', a: 'Year 30', b: 'Year 15', highlight: false },
                ].map((row, i) => (
                  <tr key={row.label} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                    <td className="px-4 py-3 font-medium text-[#555]">{row.label}</td>
                    <td className={`px-4 py-3 text-right ${row.highlight ? 'text-[#ef4444] font-semibold' : 'text-[#555]'}`}>{row.a}</td>
                    <td className={`px-4 py-3 text-right ${row.highlight ? 'text-[#00C896] font-semibold' : 'text-[#00C896] font-semibold'}`}>{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-[#aaa] -mt-2">$320,000 loan at 7% interest. Principal &amp; interest only — does not include taxes, insurance, or PMI.</p>

          <p>
            The 15-year mortgage saves <strong>$248,760 in total interest</strong> and you pay off the home 15 years earlier. That&apos;s genuinely significant. But the monthly payment is $747/month higher — and what you do with that $747 is the entire debate.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The "invest the difference" argument</h2>
          <p>
            The counterargument to the 15-year mortgage: take the 30-year, and every month invest the $747 you&apos;re saving in a low-cost S&amp;P 500 index fund instead.
          </p>
          <p>
            $747/month invested at an 8% average annual return for 30 years grows to approximately <strong>$1,110,000</strong>.
          </p>
          <p>
            Compare: the 15-year mortgage saves you $249,000 in interest. Investing the difference produces $1,110,000 in wealth. Even after paying the extra $249,000 in mortgage interest, you&apos;re ahead by roughly <strong>$860,000</strong>.
          </p>
          <p>
            On paper, the math strongly favors the 30-year + invest strategy. But there&apos;s a massive asterisk.
          </p>

          <div className="bg-[#fff9ec] border border-[#fde68a] rounded-xl px-5 py-4">
            <p className="font-semibold text-[#111] mb-1">The catch: you have to actually invest the difference</p>
            <p className="text-[14px] text-[#555]">
              Studies consistently show that most people who take the 30-year intending to invest the difference… don&apos;t. The money gets absorbed into lifestyle spending. The 15-year mortgage is a forced savings mechanism — it&apos;s harder to spend money you never see.
            </p>
          </div>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">15-year mortgages also usually have lower rates</h2>
          <p>
            There&apos;s another factor that strengthens the case for the 15-year: lenders typically offer 15-year mortgages at 0.5–0.75% lower rates than 30-year mortgages. At the time of writing, the national average for a 30-year is around 7%, while a 15-year might be 6.3%.
          </p>
          <p>
            Using more realistic rates — 7% for 30-year, 6.3% for 15-year — the total interest savings from the 15-year widen further. The monthly payment comparison:
          </p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>30-year at 7%: $2,129/month — total interest $446,440</li>
            <li>15-year at 6.3%: $2,764/month — total interest $177,520</li>
            <li>Interest savings: $268,920</li>
          </ul>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">When the 15-year mortgage is the right choice</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>You&apos;re not confident you&apos;ll invest the monthly difference consistently</li>
            <li>You want a guaranteed return (debt payoff) rather than a variable one (markets)</li>
            <li>You&apos;re within 15–20 years of retirement and want to own your home outright</li>
            <li>The higher monthly payment is still well within your budget (&lt;25% of take-home pay)</li>
            <li>You value the psychological security of a debt-free home</li>
          </ul>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">When the 30-year mortgage is the right choice</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>You will actually, reliably invest the monthly payment difference</li>
            <li>You want cash flow flexibility — income is variable, you have business risk, or you&apos;re early career</li>
            <li>Your mortgage interest rate is low (below 5%) relative to expected investment returns</li>
            <li>You want to preserve cash for other investments (rental property, business, etc.)</li>
            <li>The 15-year payment would stretch your budget uncomfortably</li>
          </ul>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The hybrid approach: 30-year with extra payments</h2>
          <p>
            A popular middle ground: take the 30-year for payment flexibility, but make extra principal payments when finances allow — essentially self-imposing a faster payoff schedule without the obligation.
          </p>
          <p>
            An extra $300/month in principal payments on a 30-year mortgage at 7% will pay off the loan in about 21 years and save roughly $140,000 in interest. Not as good as the 15-year, but with complete flexibility to stop extra payments if your income changes.
          </p>

          <div className="rounded-2xl bg-[#111] p-7 text-center mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00C896] mb-2">Run your own numbers</p>
            <p className="text-[19px] font-medium text-white mb-2 tracking-tight">See your exact monthly payment, total interest, and amortization</p>
            <p className="text-[14px] text-[#888] mb-5">Free mortgage calculator — compare terms, rates, and extra payments.</p>
            <Link href="/mortgage" className="inline-block px-7 py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors">
              Open Mortgage Calculator →
            </Link>
          </div>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-8">Frequently asked questions</h2>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="border-l-2 border-[#f59e0b] pl-4">
                <p className="font-semibold text-[#111] mb-2">{q}</p>
                <p className="text-[15px] text-[#555]">{a}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-[#bbb] leading-relaxed border-t border-[#f3f4f6] pt-6 mt-10">
          For educational purposes only. Not financial advice. Mortgage calculations are estimates. Actual rates, payments, and savings vary by lender, credit score, and loan terms. Investment return projections assume 8% average annual return — actual returns vary. Consult a licensed mortgage professional before making home financing decisions.
        </p>
      </div>
    </>
  );
}
