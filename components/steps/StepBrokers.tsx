'use client';

import { SimulatorState } from '@/types/simulator';
import { formatCurrencyFull } from '@/lib/finance';

interface StepBrokersProps {
  state: SimulatorState;
}

interface BrokerCard {
  name: string;
  tagline: string;
  badge: string | null;
  description: string;
  cta: string;
  url: string;
  color: string;
}

const BROKERS: BrokerCard[] = [
  {
    name: 'Robinhood',
    tagline: 'Best for beginners',
    badge: 'Top Pick',
    description: 'Commission-free stocks, ETFs, and crypto. Fractional shares from $1. Clean mobile app that makes it easy to auto-invest.',
    cta: 'Open a Robinhood account',
    url: 'https://robinhood.com',
    color: '#00C896',
  },
  {
    name: 'Acorns',
    tagline: 'Best for automatic investing',
    badge: null,
    description: 'Rounds up your purchases and invests the change automatically. Perfect if you want your investing on autopilot.',
    cta: 'Start with Acorns',
    url: 'https://acorns.com',
    color: '#3D5A80',
  },
  {
    name: 'Public',
    tagline: 'Best for community & learning',
    badge: null,
    description: 'Invest in stocks, ETFs, and bonds alongside a community of investors. Good for people who want to understand what they own.',
    cta: 'Join Public',
    url: 'https://public.com',
    color: '#5C6BC0',
  },
];

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
          The next step toward {projectedFormatted} by age {retirementAge} is picking a home for your investments.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {BROKERS.map((broker, idx) => (
          <div
            key={broker.name}
            className={`rounded-xl border p-5 transition-all ${
              idx === 0 ? 'border-[#00C896] bg-[#E6FAF5]' : 'border-[#e5e7eb] bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-medium text-[#111]">{broker.name}</p>
                  {broker.badge && (
                    <span className="text-[11px] font-medium text-[#00C896] bg-white border border-[#00C896] px-2 py-0.5 rounded-full">
                      {broker.badge}
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[#888] mt-0.5">{broker.tagline}</p>
              </div>
            </div>

            <p className="text-[14px] text-[#555] leading-relaxed mb-4">
              {broker.description}
            </p>

            <a
              href={broker.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block w-full py-3 rounded-lg text-[14px] font-medium text-center transition-all
                ${idx === 0
                  ? 'bg-[#00C896] text-white hover:bg-[#00b386]'
                  : 'border border-[#e5e7eb] text-[#111] hover:border-[#00C896] hover:text-[#00C896]'
                }`}
            >
              {broker.cta}
            </a>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-[#bbb] leading-relaxed">
        Returns based on historical S&P 500 data. Past performance does not guarantee future results.
        This is for educational purposes only and does not constitute financial advice.
      </p>
    </div>
  );
}
