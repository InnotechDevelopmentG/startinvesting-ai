'use client';

import { useState, KeyboardEvent } from 'react';

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}

export default function ArticleSubscribe({ position }: { position: 'top' | 'bottom' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const valid = isValidEmail(email);

  async function handleSubmit() {
    if (!valid) { setError('Enter a valid email.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
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

  if (success) {
    return (
      <div className={`rounded-2xl border border-[#c3f0e2] bg-[#E6FAF5] px-6 py-5 flex items-center gap-3 ${position === 'top' ? 'mb-6' : 'mt-6'}`}>
        <div className="w-8 h-8 rounded-full bg-[#00C896] flex items-center justify-center flex-shrink-0">
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <path d="M1 6l4 4 8-9" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-[#111]">You're in!</p>
          <p className="text-[13px] text-[#555]">Pre-market outlook + daily recap hitting your inbox every weekday.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-[#e5e7eb] bg-[#fafafa] px-6 py-5 ${position === 'top' ? 'mb-6' : 'mt-6'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[#111] leading-snug">
            📈 Get the daily market recap + pre-market outlook
          </p>
          <p className="text-[12px] text-[#888] mt-0.5">
            No fluff. No spam. Just what's moving and why — every weekday.
          </p>
        </div>
        <div className="flex gap-2 sm:flex-shrink-0">
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="your@email.com"
            autoComplete="email"
            className="px-3 py-2.5 text-[14px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors w-full sm:w-[200px] bg-white"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !valid}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-[#00C896] text-white hover:bg-[#00b386] disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed transition-colors whitespace-nowrap flex-shrink-0"
          >
            {loading ? '…' : 'Subscribe →'}
          </button>
        </div>
      </div>
      {error && <p className="text-[12px] text-red-500 mt-2">{error}</p>}
    </div>
  );
}
