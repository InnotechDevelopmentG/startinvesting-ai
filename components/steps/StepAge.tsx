'use client';

import { SimulatorState } from '@/types/simulator';

interface StepAgeProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

export default function StepAge({ state, onUpdate, onNext }: StepAgeProps) {
  const age = state.age;
  const yearsToRetirement = Math.max(65 - age, 1);
  const pct = ((age - 16) / (75 - 16)) * 100;
  const pastRetirement = age >= 65;

  function handleChange(val: number) {
    const yrs = Math.max(65 - val, 1);
    onUpdate({ age: val, years: yrs });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-[#00C896] uppercase tracking-widest mb-3">
          Step 1 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          How old are you?
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          {age >= 65 ? "We'll project how your investments continue to grow." : "We'll calculate your path to retirement at 65."}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[48px] font-medium tracking-tight text-[#111] font-tabular">
              {age}
            </span>
            <span className="text-[20px] text-[#888]">years old</span>
          </div>
          <p className="text-[15px] text-[#888] mt-1">
            {pastRetirement
              ? 'Projecting your continued growth'
              : `${yearsToRetirement} year${yearsToRetirement !== 1 ? 's' : ''} until retirement`}
          </p>
        </div>

        <div className="relative py-2">
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1 rounded-full bg-[#00C896] pointer-events-none"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            min={16}
            max={75}
            step={1}
            value={age}
            onChange={(e) => handleChange(parseInt(e.target.value, 10))}
            aria-label={`Age: ${age}`}
            aria-valuemin={16}
            aria-valuemax={75}
            aria-valuenow={age}
            className="w-full relative z-10"
          />
        </div>

        <div className="flex justify-between text-[12px] text-[#bbb] font-medium">
          <span>16</span>
          <span>75</span>
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
