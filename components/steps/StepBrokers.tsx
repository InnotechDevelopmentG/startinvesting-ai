'use client';

import { SimulatorState } from '@/types/simulator';
import { formatCurrencyFull } from '@/lib/finance';

interface StepBrokersProps {
  state: SimulatorState;
}

const ROBINHOOD_URL = 'https://join.robinhood.com/griffea5';

export default function StepBrokers({ state }: StepBrokersProps) {
  const projectedFormatted = formatCurrencyFull(state.projectedValue);
  const retirementAge = state.age > 0 ? Math.max(state.age + state.years, 65) : 65;

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-[26px] font-medium text-[#111] leading-tight tracking-tight">
          Open a brokerage account
        </h2>
        <p className="mt-2 text-[15px] text-[#888] leading-relaxed">
          The next step toward {projectedFormatted} by age {retirementAge}. Takes 5 minutes.
        </p>
      </div>

      {/* Robinhood card */}
      <div className="rounded-xl border border-[#00C896] bg-[#E6FAF5] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#00C896] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 14V5h3.8c1.8 0 3 1.1 3 2.7 0 1.2-.7 2.1-1.7 2.5l1.9 3H8.8L7.1 10.4H6.1V14H4zm2.1-5.2H7.9c.8 0 1.3-.5 1.3-1.2 0-.7-.5-1.2-1.3-1.2H6.1v2.4z" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[16px] font-medium text-[#111]">Robinhood</p>
              <span className="text-[11px] font-medium text-[#00C896] bg-white border border-[#00C896] px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>
            <p className="text-[13px] text-[#888] mt-0.5">Commission-free investing</p>
          </div>
        </div>

        {/* Free stock callout */}
        <div className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 mb-4 border border-[#c3f0e2]">
          <span className="text-[22px] leading-none mt-0.5">🎁</span>
          <div>
            <p className="text-[14px] font-medium text-[#111]">
              Sign up with this link and earn a free stock worth $5 or more!
            </p>
            <p className="text-[12px] text-[#888] mt-0.5">
              Credited to your account after sign-up.
            </p>
          </div>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2 mb-5">
          {[
            'Commission-free stocks, ETFs, and crypto',
            'Fractional shares starting from $1',
            'Easy recurring investment setup',
            'Clean mobile app — beginner friendly',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-[13px] text-[#555]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                <circle cx="7" cy="7" r="7" fill="#00C896" opacity="0.15"/>
                <path d="M4 7l2 2 4-4" stroke="#00C896" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href={ROBINHOOD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-4 rounded-xl text-[15px] font-medium text-center bg-[#00C896] text-white hover:bg-[#00b386] transition-colors active:scale-[0.98]"
        >
          Get my free stock and open account →
        </a>

        {/* FTC disclosure — legally required */}
        <p className="text-[11px] text-[#aaa] text-center mt-3 leading-relaxed">
          Affiliate link — we may earn a commission if you open an account, at no extra cost to you.
          Free stock offer subject to Robinhood's terms and conditions.
        </p>
      </div>

      <p className="text-[11px] text-[#bbb] leading-relaxed">
        Returns based on historical S&P 500 data. Past performance does not guarantee future results.
        This is for educational purposes only and does not constitute financial advice.
      </p>
    </div>
  );
}
