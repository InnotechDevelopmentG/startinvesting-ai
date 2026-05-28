'use client';

import { useState, KeyboardEvent } from 'react';
import { SimulatorState } from '@/types/simulator';

interface StepAgeProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

export default function StepAge({ state, onUpdate, onNext }: StepAgeProps) {
  const [inputVal, setInputVal] = useState<string>(state.age > 0 ? String(state.age) : '');
  const [error, setError] = useState<string>('');

  const parsed = parseInt(inputVal, 10);
  const isValid = !isNaN(parsed) && parsed >= 16 && parsed <= 75;
  const yearsToRetirement = isValid ? Math.max(65 - parsed, 1) : null;

  function handleChange(val: string) {
    setInputVal(val);
    setError('');
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 16 && n <= 75) {
      const yrs = Math.max(65 - n, 1);
      onUpdate({ age: n, years: yrs });
    }
  }

  function handleContinue() {
    if (!isValid) {
      setError('Please enter an age between 16 and 75.');
      return;
    }
    onNext();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && isValid) handleContinue();
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
          We'll calculate your years until retirement at 65.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative">
          <input
            type="number"
            min={16}
            max={75}
            value={inputVal}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 28"
            autoFocus
            className="w-full text-[32px] font-medium tracking-tight text-[#111] border-b-2 border-[#e5e7eb] focus:border-[#00C896] outline-none bg-transparent pb-3 transition-colors duration-200 placeholder:text-[#d1d5db]"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {isValid && yearsToRetirement !== null && (
          <p className="text-[14px] text-[#888] mt-1">
            That's <span className="text-[#111] font-medium">{yearsToRetirement} years</span> until retirement.
          </p>
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValid}
        className="w-full py-4 rounded-xl text-[15px] font-medium transition-all duration-200
          bg-[#00C896] text-white disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed
          hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]"
      >
        Continue
      </button>
    </div>
  );
}
