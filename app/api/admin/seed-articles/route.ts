import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase-admin';

async function isAdminAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('admin_session')?.value;
  if (!token) return false;
  const expected = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;
  return !!expected && token === expected;
}

const ARTICLES = [
  {
    slug: 'best-free-investment-calculator-2025',
    title: 'The Best Free Investment Calculator in 2025',
    summary: 'Most investment calculators give you a number and nothing else. Here\'s what to look for — and why the math behind the estimate matters more than the interface.',
    seo_description: 'Looking for the best free investment calculator? startinvesting.ai shows your projected portfolio value using real S&P 500 data, compound growth modeling, and risk-adjusted returns. No sign-up required.',
    category: 'Tools',
    tags: ['investment calculator', 'compound interest', 'portfolio growth', 'S&P 500', 'free tools'],
    content: `If you've ever tried to figure out how much your investments will actually be worth in 20 or 30 years, you've probably run into the same problem: most calculators give you a single number with zero context. You type in some figures, hit calculate, and get a dollar amount that may or may not reflect how markets actually work. The best free investment calculator doesn't just compute — it helps you understand.

The core math behind any investment projection is compound growth. The formula is deceptively simple: your future value equals your present value times (1 + rate) to the power of years, plus the future value of your ongoing contributions. But the rate you use changes everything. A 10% nominal return looks very different from a 7% real (inflation-adjusted) return. If a calculator doesn't make this distinction clear, you're looking at numbers in a vacuum.

What separates a genuinely useful investment calculator from a toy is whether it accounts for your actual situation. Your starting amount matters, but so does your monthly contribution, your time horizon, your risk tolerance, and your current age relative to your retirement target. A 25-year-old putting in $500/month in an aggressive growth portfolio has a radically different trajectory than a 45-year-old doing the same thing in a conservative allocation. The calculator needs to handle both.

The investment simulator at startinvesting.ai was built with this in mind. You input your starting amount, contribution amount and frequency, time horizon, and risk profile — and it projects your portfolio using return assumptions grounded in historical S&P 500 data. Conservative allocations use lower return rates appropriate to bond-heavy portfolios. Moderate and growth profiles use rates that reflect diversified equity exposure. Every output is a real projection, not a marketing number.

One thing that often surprises people: contribution frequency matters more than most calculators let on. Weekly contributions outperform monthly ones, not because the math is magic, but because more frequent compounding means each dollar starts growing sooner. If you can automate weekly transfers instead of one large monthly deposit, the difference over 30 years is meaningful. The startinvesting.ai simulator lets you toggle between weekly, biweekly, and monthly to see this effect directly.

The question "how much will my investment grow?" is really three questions: how much will I have in nominal dollars, what will that be worth in today's purchasing power, and how does that compare to what I actually need? Most calculators answer only the first. A good investment calculator — one worth using — answers all three. It shows you the gap between where you're headed and where you need to be, which is the only information that actually changes your behavior.

The best time to run an investment projection is before you've made any decisions. The second best time is right now. You don't need an account, a financial advisor, or even a plan — just your current numbers and five minutes. Start at startinvesting.ai and see exactly where your money is headed.`,
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    slug: 'fire-calculator-financial-independence-retire-early',
    title: 'FIRE Calculator: How to Find Your Financial Independence Number',
    summary: 'FIRE isn\'t just for extreme savers. The 4% rule and the math behind it apply to anyone who wants to know the exact number that makes work optional.',
    seo_description: 'Use the free FIRE calculator at startinvesting.ai to find your financial independence number, years to retirement, and Coast FIRE milestone — all in today\'s dollars with real inflation-adjusted returns.',
    category: 'Tools',
    tags: ['FIRE calculator', 'financial independence', 'retire early', '4% rule', 'Coast FIRE'],
    content: `Financial Independence, Retire Early — FIRE — has a reputation as an extreme lifestyle movement for people eating rice and beans and retiring at 35. That's a narrow reading. At its core, FIRE is just a mathematical framework for figuring out exactly how much money makes work optional. You don't have to retire early to benefit from knowing your number.

The foundation of FIRE math is the Safe Withdrawal Rate, most commonly set at 4%. This comes from the Trinity Study, a 1998 academic paper that analyzed every 30-year retirement period in US stock market history and found that a 4% annual withdrawal rate had a 95%+ success rate — meaning the portfolio lasted the full 30 years. The inverse of 4% is 25, which gives you the "25x rule": your FIRE number is 25 times your annual spending. Spend $60,000 per year? Your FIRE number is $1.5 million.

The 4% rule is a starting point, not a guarantee. For early retirees with a 40- or 50-year horizon, many financial planners recommend 3% or 3.5% to build in more cushion — which pushes your FIRE number to 33x or 28x your annual spending. The FIRE calculator at startinvesting.ai lets you toggle between withdrawal rates of 3%, 3.5%, 4%, and 5%, so you can see how your number and timeline shift based on your risk tolerance and retirement length.

What makes the FIRE number feel distant for most people isn't the math — it's the failure to account for inflation. If your FIRE calculator shows you a raw future portfolio value without adjusting for purchasing power, the number is misleading. A million dollars in 25 years isn't worth a million dollars today. The startinvesting.ai FIRE calculator uses real (inflation-adjusted) returns throughout, so every number it shows is in today's dollars. When it says you'll hit your FIRE number in 18 years, that means 18 years to reach your current lifestyle — not a nominal figure that erodes to something smaller.

Coast FIRE is one of the most underrated milestones in personal finance. It's the point where your current savings, left untouched and allowed to compound, will grow to your full FIRE number by a target age — even if you never invest another dollar. Hitting Coast FIRE means you've secured your retirement floor. You can stop optimizing, take a lower-paying job you actually enjoy, or just breathe easier knowing the compounding is doing the heavy lifting from here. The FIRE calculator shows your Coast FIRE number alongside your full FIRE number.

The most powerful feature of any FIRE calculator isn't the final number — it's the sensitivity analysis. A 20% reduction in annual spending has a double compounding effect: it lowers your FIRE number AND frees up more money to invest each month. The what-if scenarios in the startinvesting.ai FIRE calculator show this clearly: adding $500/month, improving your return by 1%, or cutting spending by 20% — and the exact number of years each change saves you.

FIRE math has one fundamental truth: the variable you control most is spending. Returns fluctuate. Markets are unpredictable. But the gap between what you earn and what you spend is entirely within your control, and it's the single most powerful lever you have. Run the numbers at startinvesting.ai/fire — it takes less than two minutes and you'll know exactly where you stand.`,
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    slug: 'mortgage-calculator-true-monthly-payment',
    title: 'What Your Mortgage Payment Actually Costs: Beyond Principal and Interest',
    summary: 'Your lender will quote you a principal and interest payment. Your actual monthly cost is significantly higher. Here\'s every number you need before you make an offer.',
    seo_description: 'The free mortgage calculator at startinvesting.ai shows your true monthly payment including taxes, insurance, PMI, and HOA — plus full amortization schedule and extra payment savings.',
    category: 'Tools',
    tags: ['mortgage calculator', 'monthly payment', 'PMI', 'amortization', 'home buying'],
    content: `When a lender tells you what your mortgage payment will be, they're usually quoting principal and interest only. That number is real, but it's not what you'll actually pay each month. The true cost of homeownership includes property taxes, homeowner's insurance, and — if you put less than 20% down — private mortgage insurance (PMI). In many parts of the country, these additions push the actual payment 25% to 40% above the quoted P&I figure.

Here's what each component looks like in practice. On a $400,000 home with a 30-year fixed mortgage at 6.875% and 20% down, your principal and interest payment is roughly $2,097. Add property tax at the US average of about 1.1% ($367/month), homeowner's insurance ($150/month), and you're at approximately $2,614 — before HOA fees, which in some markets add $200 to $500 more. The mortgage calculator at startinvesting.ai shows all of these components broken out in a payment breakdown chart, so you can see exactly where each dollar goes.

PMI deserves special attention because most first-time buyers don't fully understand how it works. Private mortgage insurance protects the lender — not you — when you put less than 20% down. Rates typically run 0.5% to 1.5% of the loan amount annually, which on a $350,000 loan means $145 to $437 per month added to your payment. The good news: PMI is not permanent. Once your loan-to-value ratio drops to 80% — through a combination of principal paydown and home appreciation — you can request its removal. The startinvesting.ai mortgage calculator shows you exactly when that date arrives.

The amortization schedule is one of the most important and least-understood parts of a mortgage. In the early years of a 30-year mortgage, the vast majority of each payment goes toward interest rather than principal. In year one on a $320,000 loan at 6.875%, roughly 79% of each payment is interest. By year 20, that flips significantly. The full amortization table in the mortgage calculator shows you year by year exactly how much of your payment is reducing the loan versus lining the lender's pockets — which changes how you think about refinancing, selling, and extra payments.

Speaking of extra payments: the math here is counterintuitive and worth running. On that same $320,000 loan at 6.875%, adding just $200 per month to principal saves approximately 4 years and 3 months off the loan and around $68,000 in interest. Adding $500/month saves roughly 8 years and $120,000. The mortgage calculator's extra payment section lets you model any extra amount and see the time saved and interest avoided in real time.

The decision between a 15-year and 30-year mortgage is one of the most common questions in home buying, and the answer isn't obvious. A 15-year mortgage typically comes with a lower interest rate (often 0.5% to 0.75% less), and you pay off the home in half the time — which means dramatically less total interest. But the monthly payment is considerably higher. The loan term buttons in the mortgage calculator let you toggle between 10, 15, 20, 25, and 30 years to compare the tradeoffs instantly.

The right time to run these numbers is before you make an offer, not after you're under contract. Knowing your true monthly cost — taxes, insurance, PMI, and all — is the difference between buying a home comfortably and buying one that stretches you dangerously thin. Use the free mortgage calculator at startinvesting.ai/mortgage to see your actual numbers before you commit.`,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    slug: 'compound-interest-why-starting-early-beats-investing-more',
    title: 'Why Starting at 25 Beats Investing More at 35 — The Compound Interest Math',
    summary: 'The most important investing decision isn\'t how much you invest. It\'s when you start. The numbers behind this are more dramatic than most people expect.',
    seo_description: 'See the real math behind compound interest and why time in the market beats timing the market. Use the free compound interest calculator at startinvesting.ai to model your own growth.',
    category: 'Education',
    tags: ['compound interest', 'investing early', 'time in market', 'portfolio growth', 'retirement'],
    content: `The most cited fact in personal finance is that you should start investing early. It's repeated so often it has become a cliché — and like most clichés, it gets repeated without the underlying math that makes it genuinely compelling. When you actually run the numbers, the advantage of starting early is not a marginal edge. It's the difference between retiring comfortably and working longer than you wanted to.

Here's the cleanest illustration. Investor A starts at 25, puts $300/month into a diversified index fund, and stops contributing at 35 — just 10 years of contributions totaling $36,000. They then let the money sit untouched until age 65. Investor B waits until 35 to start, invests the same $300/month continuously until age 65 — 30 years of contributions totaling $108,000. Assuming a 7% annual return, Investor A ends up with roughly $472,000. Investor B ends up with about $340,000. The person who contributed $72,000 less ends up with $130,000 more — purely because of the extra decade of compounding.

This works because of how exponential growth functions. In the early years, compound interest feels almost invisible. $10,000 at 7% grows to $10,700 in year one — hardly exciting. But by year 30, that same $10,000 has grown to $76,000. By year 40, it's $150,000. The growth isn't linear; it accelerates. Every year you delay forfeits not just one year's growth but decades of compounding on top of that year's growth. That's why the first decade matters so much more than the last.

The rule of 72 gives you a fast mental model for compound growth. Divide 72 by your annual return rate, and that's how many years it takes to double your money. At 7% returns, your money doubles roughly every 10 years. At 10%, every 7 years. A 25-year-old with $20,000 at 7% would see that double to $40,000 by 35, $80,000 by 45, $160,000 by 55, and $320,000 by 65 — without adding another dollar. That's four doublings from doing nothing but waiting. Starting at 35 means only three doublings to age 65.

The investment simulator at startinvesting.ai is built to make this visual and personal. You input your current age, starting amount, monthly contribution, and time horizon, and it projects your portfolio using risk-adjusted return assumptions. The difference between starting today versus waiting two years is one of the most useful comparisons you can run — because it translates the abstract advice of "start early" into a specific dollar amount attached to your specific situation.

One thing the early-start advantage depends on is actually staying invested. The behavioral finance research is clear: investors consistently underperform the funds they're invested in because they sell during downturns and buy back in after recovery. A 7% average return only compounds to that $472,000 if you don't bail out in 2008, 2020, or the next crash that feels unprecedented at the time. The best investment strategy is the one you'll actually stick with through volatility — which is why risk profile matters as much as return rate.

If you haven't started yet, the best response to this math isn't guilt — it's action. The compound interest advantage is largest for a 25-year-old, but it's still very real for a 35 or 45-year-old. Every year you wait is expensive in a way that's easy to calculate and nearly impossible to recover. See exactly what your timeline looks like at startinvesting.ai — the simulator runs in under two minutes and requires no account or sign-up.`,
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    slug: 'how-much-should-i-invest-per-month',
    title: 'How Much Should You Invest Per Month? Here\'s the Actual Framework',
    summary: 'The "invest 15% of your income" rule is a starting point, not an answer. The right monthly investment amount depends on when you started, what you need, and what you can actually sustain.',
    seo_description: 'How much should you invest per month? Use the free investment simulator at startinvesting.ai to find the exact monthly contribution that hits your retirement target based on your age, income, and timeline.',
    category: 'Education',
    tags: ['how much to invest', 'monthly investment', 'investing by age', 'retirement savings', 'personal finance'],
    content: `"Invest 15% of your income" is the most common piece of financial advice on the internet. It's not bad advice — for someone who starts at 25 with a moderate income and retires at 65, 15% tends to get you close to a comfortable retirement. But it's a rule of thumb built for an average person in average circumstances, and most people's circumstances aren't average. The better question isn't what percentage should you invest — it's what monthly contribution, at your age, with your current savings, hits the specific retirement target you actually need.

The math starts with your target. What do you want to have at retirement? A common benchmark is 25x your expected annual spending, the classic FIRE number derived from the 4% safe withdrawal rate. If you plan to spend $70,000 per year in retirement, you need $1.75 million. That target, combined with your current age, current savings, expected returns, and time horizon, produces a specific required monthly contribution — not a percentage.

Here's why starting age changes the required contribution dramatically. A 25-year-old who wants $1.5 million by age 65 with $10,000 currently saved needs to contribute approximately $490/month at a 7% real return. A 35-year-old starting from the same $10,000 needs approximately $1,050/month to hit the same target. A 45-year-old needs about $2,400/month. The monthly requirement more than doubles with each decade of delay. This is why "start early" isn't just motivational advice — it's a direct statement about how much work you're handing off to future compounding versus future contributions.

The standard guidance tiers by age: in your 20s, aim to have 1x your annual salary saved by 30; 3x by 40; 6x by 50; 8x by 60; 10x by 67. These are Fidelity benchmarks and they're reasonable starting points. But they assume a specific income trajectory and spending level that may not match yours. If you're a high earner who saves aggressively, you might hit those benchmarks with less effort. If you had student loans or early medical expenses that delayed investing, you might be behind the curve through no fault of your own — and need to know specifically what catch-up contributions look like.

Contribution frequency matters more than most people account for. Monthly contributions are the default, but biweekly or weekly investing outperforms monthly investing even with the same total annual amount. This happens because more frequent contributions mean each dollar starts compounding sooner. A $600/month contribution is slightly worse than two $300 biweekly contributions, which is slightly worse than four $150 weekly contributions. The difference grows over long time horizons. The investment simulator at startinvesting.ai lets you toggle between weekly, biweekly, and monthly to see this effect on your specific numbers.

The practical answer to "how much should I invest?" for most people comes down to three steps: figure out your retirement target, input your current position and timeline into a calculator, and find the monthly number that closes the gap. If that number is uncomfortable, you have two options: increase income or decrease the target spending. If it's comfortable, you might be undershooting — which is also worth knowing. The investment simulator at startinvesting.ai walks through exactly this: it takes your current savings, contribution amount, frequency, timeline, and risk profile, and shows you projected portfolio value so you can see whether you're on track or need to adjust.

One thing worth noting: the right amount is the most you can sustain without financial stress. An aggressive savings rate that causes you to raid the account during the first market downturn is worse than a moderate rate you hold through every cycle. The psychological sustainability of your contribution level is as important as the mathematical optimality. Start with a number you can commit to, automate it, and increase it by 1% every time you get a raise. That incremental system is more effective for most people than optimizing for the mathematically perfect number they won't stick to.`,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  const results = [];

  for (const article of ARTICLES) {
    const { data, error } = await supabase
      .from('news_articles')
      .upsert(article, { onConflict: 'slug', ignoreDuplicates: false })
      .select('slug');
    results.push({ slug: article.slug, error: error?.message ?? null });
  }

  return NextResponse.json({ inserted: results });
}
