'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { SimulatorState } from '@/types/simulator';
import { formatCurrencyFull } from '@/lib/finance';

interface StepEmailProps {
  state: SimulatorState;
  onNext: () => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function StepEmail({ state, onNext }: StepEmailProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const retirementAge = state.age > 0 ? Math.max(state.age + state.years, 65) : 65;
  const projectedFormatted = formatCurrencyFull(state.projectedValue);
  const valid = isValidEmail(email);

  // Auto-submit if email was captured earlier — snapshot state at mount, runs once only
  useEffect(() => {
    const stored = localStorage.getItem('early_capture_email');
    if (!stored || !isValidEmail(stored)) return;
    const snapshot = {
      email: stored,
      age: state.age,
      startingAmount: state.startingAmount,
      frequency: state.frequency,
      contributionAmount: state.contributionAmount,
      years: state.years,
      riskProfile: state.riskProfile,
      projectedValue: state.projectedValue,
      savingsBenchmark: state.savingsBenchmark,
    };
    setLoading(true);
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    })
      .then(() => setSuccess(true))
      .catch(() => setEmail(stored))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!valid) { setError('Please enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
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
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Something went wrong.'); }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && valid) handleSubmit();
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-6 text-center py-4">
        <div className="w-16 h-16 rounded-full bg-[#E6FAF5] flex items-center justify-center">
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <path d="M2 11L10 19L26 3" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="text-[24px] font-medium text-[#111] tracking-tight">You're in.</h3>
          <p className="mt-2 text-[15px] text-[#888]">Week one is on its way.</p>
        </div>
        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors active:scale-[0.98]"
        >
          Open a brokerage account →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-medium text-[#00C896] uppercase tracking-[0.15em] mb-4">
          Your projection is ready
        </p>
        <h2 className="text-[26px] font-medium text-[#111] leading-tight tracking-tight">
          You could build{' '}
          <span className="text-[#00C896]">{projectedFormatted}</span>
          {' '}by age {retirementAge}.
        </h2>
        <p className="mt-3 text-[15px] text-[#888] leading-relaxed">
          Get a free week-by-week investing plan built around your exact numbers.
        </p>
      </div>

      <div className="rounded-xl bg-[#E6FAF5] border border-[#c3f0e2] px-5 py-4">
        <p className="text-[12px] font-medium text-[#00C896] uppercase tracking-wide mb-1">
          Your projection
        </p>
        <p className="text-[28px] font-medium text-[#111] tracking-tight font-tabular">
          {projectedFormatted}
        </p>
        <p className="text-[13px] text-[#888] mt-1">by age {retirementAge}</p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="your@email.com"
          autoComplete="email"
          autoFocus
          className="w-full px-4 py-4 text-[16px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors text-[#111] placeholder:text-[#ccc]"
        />
        {error && <p className="text-[13px] text-red-500">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || !valid}
          className="w-full py-4 rounded-xl text-[15px] font-medium transition-all duration-200
            bg-[#00C896] text-white disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed
            hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]"
        >
          {loading ? 'Sending…' : 'Get my free investing plan'}
        </button>
        <button
          onClick={onNext}
          className="w-full py-3 text-[14px] text-[#aaa] hover:text-[#666] transition-colors"
        >
          Skip — just show me brokers
        </button>
      </div>

      <p className="text-[11px] text-[#bbb] leading-relaxed">
        Returns based on historical S&P 500 data. Past performance does not guarantee future results.
        This is for educational purposes only and does not constitute financial advice.
      </p>
    </div>
  );
}
