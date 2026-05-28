'use client';

import { useState } from 'react';
import { SimulatorState, RiskProfile } from '@/types/simulator';

interface StepRiskProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

const profiles: RiskProfile[] = ['conservative', 'moderate', 'growth'];

const RISK_CARDS: Record<RiskProfile, { icon: string; label: string; fund: string; desc: string; detail: string }> = {
  conservative: {
    icon: '🛡️',
    label: 'The Steady',
    fund: 'AGG / BND',
    desc: '~5%/yr · Bonds & stable assets',
    detail: 'Lower swings, consistent returns. Good if you prefer stability or are closer to retirement.',
  },
  moderate: {
    icon: '📈',
    label: 'The Builder',
    fund: 'VOO / SPY',
    desc: '~8%/yr · S&P 500 index',
    detail: '500 of the biggest US companies in one fund. Warren Buffett\'s recommendation for most investors.',
  },
  growth: {
    icon: '⚡',
    label: 'The Accelerator',
    fund: 'QQQ',
    desc: '~12%/yr · Nasdaq 100',
    detail: 'Tech-focused, higher upside. Best for long time horizons and those comfortable with more volatility.',
  },
};

export default function StepRisk({ state: _state, onUpdate, onNext }: StepRiskProps) {
  const [selected, setSelected] = useState<RiskProfile | null>(null);

  function handleSelect(profile: RiskProfile) {
    setSelected(profile);
    onUpdate({ riskProfile: profile });
    setTimeout(onNext, 150);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-[#00C896] uppercase tracking-widest mb-3">
          Step 6 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          Pick your investing style.
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          All three are based on real historical market data.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {profiles.map((profile) => {
          const card = RISK_CARDS[profile];
          const isSelected = selected === profile;
          return (
            <button
              key={profile}
              onClick={() => handleSelect(profile)}
              className={`w-full px-5 py-4 rounded-xl text-left transition-all duration-150 border
                ${isSelected
                  ? 'border-[#00C896] bg-[#E6FAF5]'
                  : 'border-[#e5e7eb] bg-white hover:border-[#00C896]'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-[20px] mt-0.5 flex-shrink-0">{card.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-[16px] font-medium ${isSelected ? 'text-[#00C896]' : 'text-[#111]'}`}>
                        {card.label}
                      </p>
                      <span className="text-[11px] font-medium text-[#888] bg-[#f3f4f6] px-2 py-0.5 rounded-full font-mono">
                        {card.fund}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#00C896] font-medium mt-0.5">{card.desc}</p>
                    <p className="text-[12px] text-[#888] mt-1 leading-relaxed">{card.detail}</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors
                  ${isSelected ? 'border-[#00C896] bg-[#00C896]' : 'border-[#d1d5db]'}`}>
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
