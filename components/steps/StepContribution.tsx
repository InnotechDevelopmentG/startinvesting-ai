'use client';

import { useState, KeyboardEvent } from 'react';
import { SimulatorState, FREQUENCY_LABELS, FREQUENCY_PER_YEAR } from '@/types/simulator';

interface StepContributionProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

export default function StepContribution({ state, onUpdate, onNext }: StepContributionProps) {
  const [inputVal, setInputVal] = useState<string>(
    state.contributionAmount > 0 ? state.contributionAmount.toLocaleString() : ''
  );
  const [error, setError] = useState<string>('');

  const rawNum = parseInt(inputVal.replace(/,/g, ''), 10);
  const parsed = isNaN(rawNum) ? NaN : rawNum;
  const isValid = !isNaN(parsed) && parsed > 0;

  const annualTotal = isValid
    ? parsed * FREQUENCY_PER_YEAR[state.frequency]
    : null;

  function handleChange(val: string) {
    const digits = val.replace(/[^0-9]/g, '');
    const formatted = digits ? parseInt(digits, 10).toLocaleString() : '';
    setInputVal(formatted);
    setError('');
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n > 0) {
      onUpdate({ contributionAmount: n });
    }
  }

  function handleContinue() {
    if (!isValid) {
      setError('Please enter an amount greater than $0 to continue.');
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
          Step 4 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          How much will you invest every {FREQUENCY_LABELS[state.frequency].toLowerCase().replace('bi-weekly', 'two weeks')}?
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          Even small amounts grow significantly over time.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative flex items-baseline">
          <span className="text-[32px] font-medium text-[#888] mr-2">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={inputVal}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="100"
            autoFocus
            className="flex-1 text-[32px] font-medium tracking-tight text-[#111] border-b-2 border-[#e5e7eb] focus:border-[#00C896] outline-none bg-transparent pb-3 transition-colors duration-200 placeholder:text-[#d1d5db]"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {annualTotal !== null && (
          <p className="text-[14px] text-[#888] mt-1">
            That's{' '}
            <span className="text-[#111] font-medium">
              ${annualTotal.toLocaleString()}
            </span>{' '}
            per year.
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
