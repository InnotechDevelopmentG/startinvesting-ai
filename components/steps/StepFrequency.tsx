'use client';

import { SimulatorState, Frequency, FREQUENCY_LABELS } from '@/types/simulator';

interface StepFrequencyProps {
  state: SimulatorState;
  onUpdate: (updates: Partial<SimulatorState>) => void;
  onNext: () => void;
}

const frequencies: Frequency[] = ['weekly', 'biweekly', 'monthly'];

const FREQ_SUBLABELS: Record<Frequency, string> = {
  weekly: '52 contributions / year',
  biweekly: '26 contributions / year',
  monthly: '12 contributions / year',
};

export default function StepFrequency({ state, onUpdate, onNext }: StepFrequencyProps) {
  function handleSelect(freq: Frequency) {
    onUpdate({ frequency: freq });
    // auto-advance after brief delay for visual feedback
    setTimeout(onNext, 120);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-[#00C896] uppercase tracking-widest mb-3">
          Step 3 of 6
        </p>
        <h2 className="text-[28px] font-medium text-[#111] leading-tight tracking-tight">
          How often will you contribute?
        </h2>
        <p className="mt-2 text-[15px] text-[#888]">
          Pick what matches your pay schedule.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {frequencies.map((freq) => {
          const isSelected = state.frequency === freq;
          return (
            <button
              key={freq}
              onClick={() => handleSelect(freq)}
              className={`w-full px-5 py-4 rounded-xl text-left transition-all duration-150 border
                ${isSelected
                  ? 'border-[#00C896] bg-[#E6FAF5]'
                  : 'border-[#e5e7eb] bg-white hover:border-[#00C896]'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[16px] font-medium ${isSelected ? 'text-[#00C896]' : 'text-[#111]'}`}>
                    {FREQUENCY_LABELS[freq]}
                  </p>
                  <p className="text-[13px] text-[#888] mt-0.5">
                    {FREQ_SUBLABELS[freq]}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
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
