'use client';

import { useState, useEffect, KeyboardEvent } from 'react';

interface Props {
  onClose: () => void;
  source: 'fire' | 'mortgage';
  age?: number;
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}

const COPY = {
  fire: {
    eyebrow: 'Your FIRE plan is running',
    heading: 'Get a free weekly investing breakdown',
    sub: 'We\'ll send you market insights + tips to hit your FIRE number faster.',
    cta: 'Send me the breakdown',
  },
  mortgage: {
    eyebrow: 'Your mortgage is calculated',
    heading: 'Get free homebuyer tips in your inbox',
    sub: 'We\'ll send rate updates, buying tips, and ways to pay off your mortgage faster.',
    cta: 'Send me the tips',
  },
};

export default function EmailCaptureModal({ onClose, source, age }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const valid = isValidEmail(email);
  const c = COPY[source];

  // Trap focus / close on Escape
  useEffect(() => {
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit() {
    if (!valid) { setError('Enter a valid email address.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/early-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), age: age ?? null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'error'); }
      localStorage.setItem('early_capture_email', email.trim().toLowerCase());
      setDone(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
      setLoading(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && valid) handleSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[400px] p-7 flex flex-col gap-5">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#bbb] hover:text-[#555] hover:bg-[#f3f4f6] transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {done ? (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E6FAF5] flex items-center justify-center">
              <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
                <path d="M2 10l8 8L24 2" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[20px] font-medium text-[#111] tracking-tight">You&apos;re in.</p>
              <p className="text-[14px] text-[#888] mt-1">First email is on its way.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Pulse dot + eyebrow */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse flex-shrink-0" />
              <p className="text-[11px] font-semibold text-[#00C896] uppercase tracking-[0.15em]">{c.eyebrow}</p>
            </div>

            <div>
              <h2 className="text-[22px] font-medium text-[#111] leading-snug tracking-tight">{c.heading}</h2>
              <p className="text-[14px] text-[#888] mt-2 leading-relaxed">{c.sub}</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={onKey}
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                className="w-full px-4 py-3.5 text-[15px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors text-[#111] placeholder:text-[#ccc]"
              />
              {error && <p className="text-[12px] text-red-500">{error}</p>}
              <button
                onClick={handleSubmit}
                disabled={loading || !valid}
                className="w-full py-3.5 rounded-xl text-[15px] font-medium transition-all
                  bg-[#00C896] text-white hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]
                  disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed"
              >
                {loading ? 'Sending…' : c.cta}
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-[13px] text-[#bbb] hover:text-[#777] transition-colors"
              >
                No thanks
              </button>
            </div>

            <p className="text-[11px] text-[#bbb]">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}
