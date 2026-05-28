'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { SimulatorState, FREQUENCY_PER_YEAR, RISK_LABELS, RISK_RATES } from '@/types/simulator';
import { formatCurrencyFull, formatCurrency } from '@/lib/finance';
import ChartPanel from './ChartPanel';
import Logo from './Logo';

interface MobileResultsViewProps {
  state: SimulatorState;
  onNext: () => void;
  onBack: () => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

async function submitEmail(email: string, state: SimulatorState): Promise<void> {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      age: state.age,
      startingAmount: state.startingAmount,
      frequency: state.frequency,
      contributionAmount: state.contributionAmount,
      years: state.years,
      riskProfile: state.riskProfile,
      projectedValue: state.projectedValue,
      savingsBenchmark: state.savingsBenchmark,
    }),
  });
  if (!res.ok) {
    const d = await res.json();
    throw new Error(d.error || 'Something went wrong.');
  }
}

export default function MobileResultsView({
  state,
  onNext,
  onBack,
}: MobileResultsViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const emailInputRef = useRef<HTMLInputElement>(null);
  const touchStartY = useRef(0);
  const [sheetDragY, setSheetDragY] = useState(0);

  const retirementAge = state.age > 0 ? Math.max(state.age + state.years, 65) : 65;
  const projectedFormatted = formatCurrencyFull(state.projectedValue);
  const valid = isValidEmail(email);

  const ppy = FREQUENCY_PER_YEAR[state.frequency];
  const totalContributed = Math.round(
    state.startingAmount + state.contributionAmount * ppy * state.years
  );
  const gains = Math.max(state.projectedValue - totalContributed, 0);
  const vsBank = Math.max(state.projectedValue - state.savingsBenchmark, 0);
  const monthlyIncome = Math.round((state.projectedValue * 0.04) / 12);
  const annualRate = RISK_RATES[state.riskProfile];

  useEffect(() => {
    if (sheetOpen && !success) {
      const timer = setTimeout(() => emailInputRef.current?.focus(), 320);
      return () => clearTimeout(timer);
    }
  }, [sheetOpen, success]);

  async function handleSubmit() {
    if (!valid) { setError('Please enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
      await submitEmail(email, state);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && valid) handleSubmit();
  }

  function handleSheetTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleSheetTouchMove(e: React.TouchEvent) {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setSheetDragY(delta);
  }

  function handleSheetTouchEnd() {
    if (sheetDragY > 100) setSheetOpen(false);
    setSheetDragY(0);
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>

      {/* ── Top bar ── */}
      <div
        className="flex-shrink-0 bg-white border-b border-[#f3f4f6] z-10 relative"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Logo — always centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Logo size={24} />
        </div>
        {/* Back button — left */}
        <div className="absolute left-4 top-0 bottom-0 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[#888] hover:text-[#111] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[13px]">Back</span>
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div
          className="px-5 mx-auto"
          style={{
            maxWidth: '480px',
            paddingBottom: 'calc(88px + env(safe-area-inset-bottom))',
          }}
        >

          {/* Hero — compact single projection number */}
          <div className="pt-5 pb-4">
            <p className="text-[11px] font-medium text-[#00C896] uppercase tracking-[0.15em] mb-2">
              Your projection
            </p>
            <p
              className="font-tabular leading-none mb-1"
              style={{ fontSize: '44px', fontWeight: 600, letterSpacing: '-2.5px', color: '#111' }}
            >
              {projectedFormatted}
            </p>
            <p className="text-[14px] text-[#888]">
              by age {retirementAge} · {RISK_LABELS[state.riskProfile]} · {(annualRate * 100).toFixed(0)}%/yr
            </p>
          </div>

          {/* Chart — fills most of the viewport */}
          <div className="mb-2">
            <ChartPanel
              state={state}
              currentStep={7}
              hideHeader={true}
              chartHeight="clamp(200px, 42vh, 300px)"
            />
          </div>

          {/* Touch hint */}
          <p className="text-[11px] text-[#ccc] text-center mb-5">
            touch &amp; drag chart to explore values by year
          </p>

          {/* Stats — 2×2 grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            <div className="rounded-xl bg-[#f9f9f9] px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#888] mb-1">You put in</p>
              <p className="text-[15px] font-semibold text-[#111] font-tabular">{formatCurrency(totalContributed)}</p>
            </div>
            <div className="rounded-xl bg-[#E6FAF5] px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#00C896] mb-1">Market gains</p>
              <p className="text-[15px] font-semibold text-[#00C896] font-tabular">+{formatCurrency(gains)}</p>
            </div>
            <div className="rounded-xl bg-[#f9f9f9] px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-[#888] mb-1">vs savings account</p>
              <p className="text-[15px] font-semibold text-[#111] font-tabular">+{formatCurrency(vsBank)}</p>
            </div>
            {monthlyIncome > 0 && (
              <div className="rounded-xl bg-[#f9f9f9] px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-wide text-[#888] mb-1">Retirement income</p>
                <p className="text-[15px] font-semibold text-[#111] font-tabular">{formatCurrency(monthlyIncome)}/mo</p>
                <p className="text-[10px] text-[#bbb] mt-0.5">4% withdrawal rule</p>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-[#ccc] leading-relaxed mt-4">
            Based on historical market data. Past performance does not guarantee future results.
            Educational purposes only — not financial advice.
          </p>
        </div>
      </div>

      {/* ── Sticky bottom CTA ── */}
      <div
        className="flex-shrink-0 bg-white border-t border-[#f3f4f6] px-5 pt-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <button
          onClick={() => setSheetOpen(true)}
          className="w-full py-4 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors active:scale-[0.98]"
        >
          Show me how to get there →
        </button>
        <button
          onClick={onNext}
          className="w-full py-2.5 text-[13px] text-[#aaa] hover:text-[#666] transition-colors mt-1"
        >
          Skip, show me brokers
        </button>
      </div>

      {/* ── Email bottom sheet ── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setSheetOpen(false)}
          />
          <div
            className="relative bg-white rounded-t-2xl animate-slide-up px-6 pt-4"
            style={{
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
              transform: `translateY(${sheetDragY}px)`,
              transition: sheetDragY > 0 ? 'none' : 'transform 0.3s ease',
            }}
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-5" />

            {success ? (
              <div className="flex flex-col items-center gap-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#E6FAF5] flex items-center justify-center">
                  <svg width="24" height="20" viewBox="0 0 28 22" fill="none">
                    <path d="M2 11L10 19L26 3" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[22px] font-medium text-[#111] tracking-tight">You're in.</h3>
                  <p className="mt-1.5 text-[14px] text-[#888]">Your plan is on its way.</p>
                </div>
                <button
                  onClick={onNext}
                  className="w-full py-4 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors active:scale-[0.98]"
                >
                  Open a brokerage account →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-[20px] font-medium text-[#111] leading-tight tracking-tight">
                    Your step-by-step plan is ready.
                  </h2>
                  <p className="text-[13px] text-[#888] mt-1.5 leading-relaxed">
                    Built around {projectedFormatted} by age {retirementAge} — your exact numbers.
                  </p>
                </div>

                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="w-full px-4 py-4 text-[16px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors text-[#111] placeholder:text-[#ccc]"
                />

                {error && <p className="text-[13px] text-red-500 -mt-1">{error}</p>}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !valid}
                  className="w-full py-4 rounded-xl text-[15px] font-medium transition-all duration-200
                    bg-[#00C896] text-white disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed
                    hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]"
                >
                  {loading ? 'Sending…' : 'Send me the plan →'}
                </button>

                <button
                  onClick={() => { setSheetOpen(false); onNext(); }}
                  className="w-full py-2.5 text-[13px] text-[#aaa] hover:text-[#666] transition-colors"
                >
                  Skip, show me brokers
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
