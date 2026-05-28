'use client';

import { SimulatorState } from '@/types/simulator';

interface StepYearsProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

export default function StepYears({ state, onUpdate, onNext }: StepYearsProps) {
  const years = state.years;
  const endAge = state.age > 0 ? state.age + years : null;

  function handleChange(val: number) {
    onUpdate({ years: val });
  }

  // Build track fill percentage
  const pct = ((years - 5) / (50 - 5)) * 100;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-[#00C896] uppercase tracking-widest mb-3">
          Step 5 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          How long will you invest?
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          Time is the single most powerful factor in compounding.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-baseline gap-2">
          <span className="text-[48px] font-medium tracking-tight text-[#111] font-tabular">
            {years}
          </span>
          <span className="text-[20px] text-[#888]">years</span>
          {endAge !== null && (
            <span className="text-[15px] text-[#888] ml-2">
              (until age {endAge})
            </span>
          )}
        </div>

        <div className="relative py-2">
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-[#00C896] pointer-events-none"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={5}
            max={50}
            step={1}
            value={years}
            onChange={(e) => handleChange(parseInt(e.target.value, 10))}
            className="w-full relative z-10"
          />
        </div>

        <div className="flex justify-between text-[12px] text-[#bbb] font-medium">
          <span>5 yrs</span>
          <span>50 yrs</span>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-4 rounded-xl text-[15px] font-medium transition-all duration-200
          bg-[#00C896] text-white hover:bg-[#00b386] active:scale-[0.98]"
      >
        Continue
      </button>
    </div>
  );
}
