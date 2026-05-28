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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {/* Robinhood logo mark */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="6" fill="#00C896"/>
              <path d="M10 20V9h5.2c2.4 0 4.1 1.5 4.1 3.7 0 1.6-.9 2.8-2.2 3.3l2.6 4h-2.9l-2.3-3.6H12.6V20H10zm2.6-5.8h2.4c1 0 1.7-.7 1.7-1.6 0-.9-.7-1.6-1.7-1.6h-2.4v3.2z" fill="white"/>
            </svg>
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
        </div>

        {/* Free stock callout */}
        <div className="flex items-start gap-3 bg-white rounded-lg px-4 py-3 mb-4 border border-[#c3f0e2]">
          <span className="text-[22px] mt-0.5">🎁</span>
          <div>
            <p className="text-[14px] font-medium text-[#111]">
              Sign up with this link and earn a free stock worth $5 or more!
            </p>
            <p className="text-[12px] text-[#888] mt-0.5">
              Credited to your account after you sign up.
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

        <p className="text-[11px] text-[#aaa] text-center mt-3">
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
