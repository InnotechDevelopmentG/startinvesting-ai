'use client';

import { useState, KeyboardEvent } from 'react';
import { SimulatorState, FREQUENCY_PER_YEAR } from '@/types/simulator';
import { formatCurrencyFull, formatCurrency } from '@/lib/finance';
import ChartPanel from './ChartPanel';
import Logo from './Logo';

interface MobileResultsViewProps {
  state: SimulatorState;
  onNext: () => void;
  onBack: () => void;
}

async function submitEmail(data: {
  email: string;
  state: SimulatorState;
}): Promise<void> {
  const res = await fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      age: data.state.age,
      startingAmount: data.state.startingAmount,
      frequency: data.state.frequency,
      contributionAmount: data.state.contributionAmount,
      years: data.state.years,
      riskProfile: data.state.riskProfile,
      projectedValue: data.state.projectedValue,
      savingsBenchmark: data.state.savingsBenchmark,
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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const retirementAge = state.age > 0 ? Math.max(state.age + state.years, 65) : 65;
  const projectedFormatted = formatCurrencyFull(state.projectedValue);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  const ppy = FREQUENCY_PER_YEAR[state.frequency];
  const totalContributed = Math.round(
    state.startingAmount + state.contributionAmount * ppy * state.years
  );
  const gains = Math.max(state.projectedValue - totalContributed, 0);
  const vsBank = Math.max(state.projectedValue - state.savingsBenchmark, 0);
  const monthlyIncome = Math.round((state.projectedValue * 0.04) / 12);

  async function handleSubmit() {
    if (!isValidEmail) { setError('Please enter a valid email.'); return; }
    setLoading(true); setError('');
    try {
      await submitEmail({ email, state });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && isValidEmail) handleSubmit();
  }

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>

      {/* Sticky top bar */}
      <div
        className="flex-shrink-0 bg-white border-b border-[#f3f4f6] px-5 flex items-center justify-between z-10"
        style={{ height: '56px', paddingTop: 'env(safe-area-inset-top)', marginTop: '0' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#888] hover:text-[#111] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[13px]">Back</span>
        </button>
        <Logo size={24} />
        <div className="w-12" />
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-6 pt-7 mx-auto" style={{ maxWidth: '480px', paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>

          {/* ── REVEAL HEADER ── */}
          <p className="text-[11px] font-medium text-[#00C896] uppercase tracking-[0.15em] mb-3">
            Your projection is ready
          </p>
          <div className="mb-1">
            <span
              className="font-tabular"
              style={{
                fontSize: '48px',
                fontWeight: 500,
                letterSpacing: '-2.5px',
                color: '#111',
                lineHeight: 1,
              }}
            >
              {projectedFormatted}
            </span>
          </div>
          <p className="text-[15px] text-[#888] mb-6">
            by age {retirementAge}
          </p>

          {/* ── CHART ── */}
          <div className="mb-6">
            <ChartPanel state={state} currentStep={7} />
          </div>

          {/* ── STAT STRIP ── */}
          <div className="grid grid-cols-3 gap-3 mb-7">
            <div className="rounded-xl bg-[#f9f9f9] px-3 py-3">
              <p className="text-[10px] font-medium text-[#888] uppercase tracking-wide mb-1">
                You put in
              </p>
              <p className="text-[14px] font-medium text-[#111] font-tabular leading-tight">
                {formatCurrency(totalContributed)}
              </p>
            </div>
            <div className="rounded-xl bg-[#E6FAF5] px-3 py-3">
              <p className="text-[10px] font-medium text-[#00C896] uppercase tracking-wide mb-1">
                Market gains
              </p>
              <p className="text-[14px] font-medium text-[#00C896] font-tabular leading-tight">
                +{formatCurrency(gains)}
              </p>
            </div>
            <div className="rounded-xl bg-[#f9f9f9] px-3 py-3">
              <p className="text-[10px] font-medium text-[#888] uppercase tracking-wide mb-1">
                vs bank
              </p>
              <p className="text-[14px] font-medium text-[#111] font-tabular leading-tight">
                +{formatCurrency(vsBank)}
              </p>
            </div>
          </div>

          {/* Retirement income pill */}
          {monthlyIncome > 0 && (
            <div className="flex items-center gap-2 mb-7">
              <span className="px-3 py-1.5 rounded-full bg-[#f3f4f6] text-[12px] text-[#555]">
                {formatCurrency(monthlyIncome)}/mo in retirement (4% rule)
              </span>
            </div>
          )}

          {/* ── DIVIDER ── */}
          <div className="border-t border-[#f3f4f6] mb-7" />

          {/* ── EMAIL CTA ── */}
          {!success ? (
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-[22px] font-medium text-[#111] leading-tight tracking-tight mb-2">
                  Get your free week-by-week investing plan.
                </h2>
                <p className="text-[14px] text-[#888] leading-relaxed">
                  Built around your exact numbers — {projectedFormatted} by age {retirementAge}.
                </p>
              </div>

              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="your@email.com"
                autoComplete="email"
                className="w-full px-4 py-4 text-[16px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors text-[#111] placeholder:text-[#ccc]"
              />

              {error && <p className="text-[13px] text-red-500">{error}</p>}

              <button
                onClick={handleSubmit}
                disabled={loading || !isValidEmail}
                className="w-full py-4 rounded-xl text-[15px] font-medium transition-all duration-200
                  bg-[#00C896] text-white disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed
                  hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]"
              >
                {loading ? 'Sending…' : 'Get my free investing plan'}
              </button>

              <button
                onClick={onNext}
                className="w-full py-3 text-[13px] text-[#aaa] hover:text-[#666] transition-colors"
              >
                Skip — just show me brokers
              </button>
            </div>
          ) : (
            /* ── SUCCESS STATE ── */
            <div className="flex flex-col items-center gap-5 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-[#E6FAF5] flex items-center justify-center">
                <svg width="24" height="20" viewBox="0 0 28 22" fill="none">
                  <path d="M2 11L10 19L26 3" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-[22px] font-medium text-[#111] tracking-tight">You're in.</h3>
                <p className="mt-1.5 text-[14px] text-[#888]">Week one is on its way.</p>
              </div>
              <button
                onClick={onNext}
                className="w-full py-4 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors active:scale-[0.98]"
              >
                Open a brokerage account →
              </button>
            </div>
          )}

          {/* ── DISCLAIMER ── */}
          <p className="text-[11px] text-[#bbb] leading-relaxed mt-7">
            Returns based on historical S&P 500 data. Past performance does not guarantee future
            results. This is for educational purposes only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
