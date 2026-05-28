'use client';

import { SimulatorState, RiskProfile, RISK_LABELS, RISK_DESCRIPTIONS } from '@/types/simulator';

interface StepRiskProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

const profiles: RiskProfile[] = ['conservative', 'moderate', 'growth'];

const RISK_ICONS: Record<RiskProfile, string> = {
  conservative: '🛡️',
  moderate: '⚖️',
  growth: '🚀',
};

export default function StepRisk({ state, onUpdate, onNext }: StepRiskProps) {
  function handleSelect(profile: RiskProfile) {
    onUpdate({ riskProfile: profile });
    setTimeout(onNext, 120);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-[#00C896] uppercase tracking-widest mb-3">
          Step 6 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          What's your risk tolerance?
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          All three are based on 30–100 years of real market data.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {profiles.map((profile) => {
          const isSelected = state.riskProfile === profile;
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
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-[20px] mt-0.5">{RISK_ICONS[profile]}</span>
                  <div>
                    <p className={`text-[16px] font-medium ${isSelected ? 'text-[#00C896]' : 'text-[#111]'}`}>
                      {RISK_LABELS[profile]}
                    </p>
                    <p className="text-[13px] text-[#888] mt-0.5">
                      {RISK_DESCRIPTIONS[profile]}
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
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
