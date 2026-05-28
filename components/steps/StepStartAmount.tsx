'use client';

import { useState, KeyboardEvent } from 'react';
import { SimulatorState } from '@/types/simulator';

interface StepStartAmountProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

export default function StepStartAmount({ state, onUpdate, onNext }: StepStartAmountProps) {
  const [inputVal, setInputVal] = useState<string>(
    state.startingAmount > 0 ? state.startingAmount.toLocaleString() : ''
  );

  const rawNum = parseInt(inputVal.replace(/,/g, ''), 10);
  const parsed = inputVal === '' ? 0 : (isNaN(rawNum) ? NaN : rawNum);
  const isValid = !isNaN(parsed) && parsed >= 0;

  function handleChange(val: string) {
    const digits = val.replace(/[^0-9]/g, '');
    const formatted = digits ? parseInt(digits, 10).toLocaleString() : '';
    setInputVal(formatted);
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n >= 0) {
      onUpdate({ startingAmount: n });
    } else if (!digits) {
      onUpdate({ startingAmount: 0 });
    }
  }

  function handleContinue() {
    if (inputVal === '') {
      onUpdate({ startingAmount: 0 });
    }
    onNext();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleContinue();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-[#00C896] uppercase tracking-widest mb-3">
          Step 2 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          What are you starting your investment journey with?
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          Starting from $0 is completely fine — most people do.
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
            placeholder="0"
            autoFocus
            className="flex-1 text-[32px] font-medium tracking-tight text-[#111] border-b-2 border-[#e5e7eb] focus:border-[#00C896] outline-none bg-transparent pb-3 transition-colors duration-200 placeholder:text-[#d1d5db]"
          />
        </div>

        {isValid && parsed === 0 && inputVal !== '' && (
          <p className="text-[14px] text-[#888] mt-1">
            No problem — you'll build from here.
          </p>
        )}
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-4 rounded-xl text-[15px] font-medium transition-all duration-200
          bg-[#00C896] text-white hover:bg-[#00b386] active:scale-[0.98]"
      >
        Continue
      </button>
    </div>
  );
}
