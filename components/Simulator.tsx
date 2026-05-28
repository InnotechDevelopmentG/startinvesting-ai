'use client';

import { useState, useCallback } from 'react';
import {
  SimulatorState,
  DEFAULT_STATE,
  FREQUENCY_PER_YEAR,
  RISK_RATES,
  SAVINGS_RATE,
} from '@/types/simulator';
import { futureValue } from '@/lib/finance';
import ChartPanel from './ChartPanel';
import StepFlow from './StepFlow';

function computeProjections(state: SimulatorState): Pick<SimulatorState, 'projectedValue' | 'savingsBenchmark'> {
  const ppy = FREQUENCY_PER_YEAR[state.frequency];
  const annualRate = RISK_RATES[state.riskProfile];

  const projectedValue = Math.round(
    futureValue(state.startingAmount, state.contributionAmount, annualRate, ppy, state.years)
  );
  const savingsBenchmark = Math.round(
    futureValue(state.startingAmount, state.contributionAmount, SAVINGS_RATE, 12, state.years)
  );

  return { projectedValue, savingsBenchmark };
}

export default function Simulator() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<SimulatorState>(() => {
    const base = { ...DEFAULT_STATE };
    return { ...base, ...computeProjections(base) };
  });

  const handleUpdate = useCallback((updates: Partial<SimulatorState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      const projections = computeProjections(next);
      return { ...next, ...projections };
    });
  }, []);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, 8));
  }, []);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile layout: stack vertically */}
      <div className="lg:hidden flex flex-col min-h-screen">
        {/* Chart on top (mobile) */}
        <div className="px-6 pt-8 pb-6 border-b border-[#f3f4f6]">
          <div className="max-w-lg mx-auto">
            <ChartPanel state={state} currentStep={step} />
          </div>
        </div>

        {/* Steps below (mobile) */}
        <div className="flex-1 px-6 pt-8 pb-12">
          <div className="max-w-lg mx-auto">
            <StepFlow
              state={state}
              currentStep={step}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>

      {/* Desktop layout: two-column */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left panel — chart */}
        <div className="flex-1 sticky top-0 h-screen overflow-y-auto border-r border-[#f3f4f6] px-12 py-12 xl:px-16">
          <div className="max-w-[520px] mx-auto h-full flex flex-col justify-center">
            <div className="mb-8">
              <span className="text-[13px] font-medium text-[#111] tracking-tight">
                startinvesting.ai
              </span>
            </div>
            <ChartPanel state={state} currentStep={step} />
          </div>
        </div>

        {/* Right panel — steps */}
        <div className="w-[480px] xl:w-[520px] flex-shrink-0 px-12 py-12 xl:px-16 overflow-y-auto">
          <div className="max-w-[380px] mx-auto min-h-full flex flex-col justify-center">
            <StepFlow
              state={state}
              currentStep={step}
              onUpdate={handleUpdate}
              onNext={handleNext}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
