'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SimulatorState,
  DEFAULT_STATE,
  FREQUENCY_PER_YEAR,
  RISK_RATES,
  SAVINGS_RATE,
} from '@/types/simulator';
import { futureValue, formatCurrencyFull, easeOutQuart } from '@/lib/finance';
import ChartPanel from './ChartPanel';
import StepFlow from './StepFlow';
import Logo from './Logo';
import MobileResultsView from './MobileResultsView';

function computeProjections(
  state: SimulatorState
): Pick<SimulatorState, 'projectedValue' | 'savingsBenchmark'> {
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
  const [chartSheetOpen, setChartSheetOpen] = useState(false);
  const [state, setState] = useState<SimulatorState>(() => {
    const base = { ...DEFAULT_STATE };
    return { ...base, ...computeProjections(base) };
  });

  // Animated projected value for mobile top bar
  const mobileValueRef = useRef<HTMLSpanElement>(null);
  const mobileDisplayRef = useRef(0);
  const mobileRafRef = useRef<number | null>(null);
  const mobileStartRef = useRef<number | null>(null);
  const mobileStartValRef = useRef(0);

  useEffect(() => {
    const target = state.projectedValue;
    mobileStartValRef.current = mobileDisplayRef.current;
    mobileStartRef.current = null;
    if (mobileRafRef.current) cancelAnimationFrame(mobileRafRef.current);

    function tick(ts: number) {
      if (mobileStartRef.current === null) mobileStartRef.current = ts;
      const elapsed = ts - mobileStartRef.current;
      const t = Math.min(elapsed / 520, 1);
      const eased = easeOutQuart(t);
      const current = Math.round(
        mobileStartValRef.current + (target - mobileStartValRef.current) * eased
      );
      mobileDisplayRef.current = current;
      if (mobileValueRef.current) {
        mobileValueRef.current.textContent = formatCurrencyFull(current);
      }
      if (t < 1) mobileRafRef.current = requestAnimationFrame(tick);
    }

    mobileRafRef.current = requestAnimationFrame(tick);
    return () => {
      if (mobileRafRef.current) cancelAnimationFrame(mobileRafRef.current);
    };
  }, [state.projectedValue]);

  // Close chart sheet when step changes
  useEffect(() => {
    setChartSheetOpen(false);
  }, [step]);

  const handleUpdate = useCallback((updates: Partial<SimulatorState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      return { ...next, ...computeProjections(next) };
    });
  }, []);

  const handleNext = useCallback(() => setStep((s) => Math.min(s + 1, 8)), []);
  const handleBack = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  return (
    <div className="bg-white">

      {/* ─────────────── MOBILE ─────────────── */}
      <div className="lg:hidden">

        {/* Step 7 on mobile: full-screen results reveal */}
        {step === 7 && (
          <MobileResultsView
            state={state}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Steps 1–6 and 8: top bar + full-screen step flow */}
        {step !== 7 && (
          <div className="flex flex-col" style={{ height: '100dvh' }}>

            {/* Sticky top bar */}
            <div
              className="flex-shrink-0 bg-white border-b border-[#f3f4f6] z-10 relative"
              style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
            >
              {/* Logo — always centered, icon-only on mobile */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Logo size={28} iconOnly />
              </div>
              {/* Chart pill — right */}
              <div className="absolute right-4 top-0 bottom-0 flex items-center">
                <button
                  onClick={() => setChartSheetOpen(true)}
                  className="flex items-center gap-2 pl-3 pr-3.5 py-1.5 rounded-full bg-[#f3f4f6] active:bg-[#e5e7eb] transition-colors"
                  aria-label="View your projection chart"
                >
                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                    <polyline points="0,11 4,6 8,8 15,1" stroke="#00C896" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                  {state.projectedValue > 0 ? (
                    <span
                      ref={mobileValueRef}
                      className="font-tabular text-[14px] font-medium text-[#111]"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {formatCurrencyFull(state.projectedValue)}
                    </span>
                  ) : (
                    <span className="text-[13px] text-[#aaa]">your projection</span>
                  )}
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1l4 4 4-4" stroke="#aaa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Step content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-6 pt-8 mx-auto" style={{ maxWidth: '480px', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
                <StepFlow
                  state={state}
                  currentStep={step}
                  onUpdate={handleUpdate}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              </div>
            </div>

            {/* Chart bottom sheet */}
            {chartSheetOpen && (
              <div className="fixed inset-0 z-50 flex flex-col justify-end">
                <div
                  className="absolute inset-0 bg-black/40 animate-fade-in"
                  onClick={() => setChartSheetOpen(false)}
                />
                <div
                  className="relative bg-white rounded-t-2xl animate-slide-up overflow-y-auto"
                  style={{ maxHeight: '88vh' }}
                >
                  <div className="sticky top-0 bg-white pt-3 pb-2 px-6 z-10">
                    <div className="w-10 h-1 bg-[#e5e7eb] rounded-full mx-auto" />
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-[15px] font-medium text-[#111]">Your projection</p>
                      <button
                        onClick={() => setChartSheetOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f4f6] text-[#888]"
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="px-6 pb-10">
                    <ChartPanel state={state} currentStep={step} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─────────────── DESKTOP ─────────────── */}
      <div className="hidden lg:flex flex-col min-h-screen">

        {/* Top header bar */}
        <div
          className="flex-shrink-0 bg-white border-b border-[#f3f4f6] px-12 xl:px-16 flex items-center z-10"
          style={{ height: '64px' }}
        >
          <Logo size={30} />
        </div>

        {/* Two-column content */}
        <div className="flex flex-1">
          {/* Left panel — chart */}
          <div
            className="flex-1 border-r border-[#f3f4f6] px-12 py-10 xl:px-16 overflow-y-auto"
            style={{ position: 'sticky', top: '64px', height: 'calc(100vh - 64px)' }}
          >
            <div className="max-w-[520px] mx-auto h-full flex flex-col justify-center">
              <ChartPanel state={state} currentStep={step} />
            </div>
          </div>

          {/* Right panel — steps */}
          <div
            className="w-[480px] xl:w-[520px] flex-shrink-0 px-12 py-10 xl:px-16 overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 64px)' }}
          >
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
    </div>
  );
}
