import Link from 'next/link';
import type { Metadata } from 'next';

const TITLE = 'Coast FIRE: The Number That Lets You Stop Investing Early';
const DESCRIPTION =
  'What Coast FIRE is, how to calculate your exact Coast FIRE number, and why reaching it is one of the most underrated milestones in personal finance.';
const SLUG = 'coast-fire-number-explained';
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

// Coast FIRE numbers to reach $1.5M at 65, at 7% real return
// PV = FV / (1 + r)^n
const COAST_TABLE = [
  { age: '25', years: '40', coast: '$100,000' },
  { age: '30', years: '35', coast: '$140,000' },
  { age: '35', years: '30', coast: '$197,000' },
  { age: '40', years: '25', coast: '$276,000' },
  { age: '45', years: '20', coast: '$388,000' },
  { age: '50', years: '15', coast: '$543,000' },
];

const FAQ = [
  {
    q: 'What is Coast FIRE?',
    a: "Coast FIRE is when you've saved enough money that — if you never invest another dollar — your existing portfolio will compound to your full FIRE number by retirement age on its own. You've 'coasted' to financial independence: you just need to cover your current living expenses, not save anything extra.",
  },
  {
    q: 'How do you calculate your Coast FIRE number?',
    a: 'Coast FIRE Number = FIRE Target ÷ (1 + real return rate)^years until retirement. Example: if your FIRE number is $1.5M, you\'re 35, and you want to retire at 65, your Coast FIRE number at 7% real return is $1,500,000 ÷ (1.07)^30 = approximately $197,000.',
  },
  {
    q: "What's the difference between Coast FIRE and regular FIRE?",
    a: 'Regular FIRE means your portfolio is large enough to support full retirement now — you can stop working immediately. Coast FIRE means your portfolio will get to that point in the future without additional contributions — but you still need to work to cover current expenses, just not to save for retirement.',
  },
  {
    q: "What's Barista FIRE?",
    a: 'Barista FIRE (also called Semi-FIRE) is when you leave a high-paying stressful job but take low-stress part-time work to cover living expenses — often including health insurance. It\'s named after the stereotype of leaving corporate work to be a barista. It\'s related to Coast FIRE: once you hit Coast FIRE, you only need to earn enough to live on, not save.',
  },
  {
    q: 'Is Coast FIRE worth aiming for?',
    a: "For many people, hitting Coast FIRE is the most freeing milestone in personal finance — more than FIRE itself. Once you've coasted, the retirement savings problem is effectively solved. You can shift your career focus from maximizing income to maximizing meaning, flexibility, or balance, knowing the long-term math is already taken care of.",
  },
  {
    q: 'What return rate should I use for my Coast FIRE calculation?',
    a: "Use a real (inflation-adjusted) return rate — typically 5–7%. The S&P 500 has historically returned ~10% nominal, which is roughly 7% after inflation (using the Fisher equation). Using 7% is a reasonable baseline; 5–6% is more conservative and accounts for lower expected future returns.",
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
          <span className="text-[#888]">Coast FIRE explained</span>
        </nav>

        <div className="mb-8">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#6366f1] bg-[#f0f0ff] px-2.5 py-1 rounded-full">
            FIRE
          </span>
          <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mt-4 mb-4">
            Coast FIRE: The Number That Lets You Stop Investing Early
          </h1>
          <p className="text-[17px] text-[#555] leading-relaxed">
            Most people know about FIRE — the point where your investments support full retirement. But Coast FIRE is different, and in some ways more powerful: it&apos;s the point where you never have to save another dollar for retirement, because the math will handle it for you.
          </p>
          <p className="text-[13px] text-[#aaa] mt-3">7 min read · startinvesting.ai</p>
        </div>

        <div className="border-t border-[#f3f4f6] mb-8" />

        <div className="flex flex-col gap-6 text-[16px] text-[#333] leading-[1.75]">

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-2">What is Coast FIRE?</h2>
          <p>
            You&apos;ve hit Coast FIRE when your current savings will compound to your full FIRE number by retirement age — <strong>even if you never invest another dollar.</strong>
          </p>
          <p>
            Here&apos;s a concrete example: say your FIRE number is $1,500,000 (enough to withdraw $60,000/year at 4%). You&apos;re 35 years old and have $197,000 invested. At a 7% real return, that $197,000 will grow to approximately $1,500,000 by age 65 without any additional contributions.
          </p>
          <p>
            You&apos;ve coasted. The retirement savings problem is solved. You still need to work to pay your current bills — but you no longer need to save <em>for the future</em>. Every dollar you earn from this point only needs to cover today&apos;s expenses.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">The math behind Coast FIRE</h2>
          <p>
            The Coast FIRE calculation is straightforward. You need to find the present value of your future FIRE number:
          </p>
          <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-xl px-5 py-4">
            <p className="text-[15px] font-medium text-[#111]">Coast FIRE Number = FIRE Target ÷ (1 + r)^n</p>
            <p className="text-[13px] text-[#888] mt-1">Where r = real annual return rate (typically 0.07), n = years until retirement</p>
          </div>
          <p>
            Example: FIRE target = $1,500,000. Current age = 30. Retirement age = 65 (35 years). Real return = 7%.
          </p>
          <p>
            Coast FIRE Number = $1,500,000 ÷ (1.07)^35 = $1,500,000 ÷ 10.68 = <strong>approximately $140,000</strong>
          </p>
          <p>
            If you have $140,000 invested at 30, you can stop making retirement contributions entirely and still reach $1.5M by 65.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Coast FIRE numbers: what you need at each age</h2>
          <p>
            To reach a $1,500,000 portfolio by age 65 at a 7% real return — with no further contributions:
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#f3f4f6]">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="bg-[#f9fafb] border-b border-[#f3f4f6]">
                  <th className="text-left px-4 py-3 font-semibold text-[#555]">Your Age</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">Years to Grow</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#555]">Coast FIRE Number</th>
                </tr>
              </thead>
              <tbody>
                {COAST_TABLE.map((row, i) => (
                  <tr key={row.age} className={i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                    <td className="px-4 py-3 font-semibold text-[#111]">Age {row.age}</td>
                    <td className="px-4 py-3 text-right text-[#555]">{row.years} years</td>
                    <td className="px-4 py-3 text-right text-[#00C896] font-semibold">{row.coast}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[12px] text-[#aaa] -mt-2">To reach $1.5M by age 65 at 7% real return, stopping all contributions at the listed age. Your FIRE target may differ.</p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Why Coast FIRE changes how you think about work</h2>
          <p>
            Before hitting Coast FIRE, every career decision is tied to retirement savings. You need to stay in the high-income job, take the promotion, accept the demanding project — because you&apos;re still building the nest egg.
          </p>
          <p>
            After hitting Coast FIRE, your only financial requirement from work is to cover today&apos;s living expenses. A $40,000/year lifestyle? Any job that pays $40,000+ works. Want to start a business? Take the lower-paying but more meaningful role? Work part-time? All viable — because you don&apos;t need the work to fund retirement.
          </p>
          <p>
            This is why many personal finance thinkers argue that Coast FIRE is the milestone worth obsessing over — not full FIRE. Full FIRE requires a much larger number and may be decades away. Coast FIRE can be reached with a few years of aggressive saving early in your career.
          </p>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">Coast FIRE vs Barista FIRE vs Lean FIRE</h2>
          <ul className="list-disc pl-5 flex flex-col gap-3">
            <li>
              <strong>Coast FIRE:</strong> Your savings will compound to your FIRE number without further contributions. You still work to cover current expenses.
            </li>
            <li>
              <strong>Barista FIRE:</strong> Similar — you&apos;ve partially funded retirement and work low-stress part-time jobs to cover living expenses. Often chosen for healthcare benefits.
            </li>
            <li>
              <strong>Lean FIRE:</strong> Full financial independence, but on a very lean budget (often under $40k/year spending). You&apos;ve hit your FIRE number, but it requires frugal living.
            </li>
            <li>
              <strong>Fat FIRE:</strong> Full financial independence with a comfortable or generous budget (often $80k+/year spending).
            </li>
          </ul>

          <h2 className="text-[24px] font-medium text-[#111] tracking-tight mt-4">How to hit Coast FIRE faster</h2>
          <p>
            The Coast FIRE number is lower the younger you are — which means the strategy is to invest aggressively early and then ease off. A few years of high savings rate in your 20s can eliminate the need to save for retirement in your 30s and beyond.
          </p>
          <p>
            Practical approach: if you can save aggressively for 5–8 years in your mid-to-late 20s, you may reach your Coast FIRE number before 35. From that point, you only need income that covers your actual lifestyle — not income that also funds a retirement account.
          </p>

          <div className="rounded-2xl bg-[#111] p-7 text-center mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#00C896] mb-2">Calculate your Coast FIRE number</p>
            <p className="text-[19px] font-medium text-white mb-2 tracking-tight">See your FIRE number, Coast FIRE milestone, and exact timeline</p>
            <p className="text-[14px] text-[#888] mb-5">Free FIRE calculator — enter your numbers and see where you stand.</p>
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
          For educational purposes only. Not financial advice. Coast FIRE calculations assume consistent investment returns that are not guaranteed. All projections are in real (inflation-adjusted) dollars. Past market performance does not guarantee future results.
        </p>
      </div>
    </>
  );
}
