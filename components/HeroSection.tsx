'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const TOOLS = [
  { label: 'Investment Simulator', href: '/#simulator' },
  { label: 'FIRE Calculator', href: '/fire' },
  { label: 'Mortgage Calculator', href: '/mortgage' },
  { label: 'Market News', href: '/news' },
];

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
}

export default function HeroSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skip, setSkip] = useState(true); // start hidden, reveal after localStorage check

  useEffect(() => {
    if (!localStorage.getItem('early_capture_email')) setSkip(false);
  }, []);

  if (skip) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) { setError('Enter a valid email'); return; }
    setLoading(true); setError('');
    try {
      await fetch('/api/early-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, age: 0 }),
      });
      localStorage.setItem('early_capture_email', email);
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border-b border-[#f3f4f6] px-6 py-14 md:py-20">
      <div className="max-w-[700px] mx-auto text-center">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-[#E6FAF5] text-[#00C896] text-[11px] font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          Free · No sign-up · Updated daily
        </div>

        {/* Headline */}
        <h1 className="text-[38px] md:text-[52px] font-bold text-[#111] tracking-tight leading-[1.1] mb-5">
          The financial tools your<br className="hidden sm:block" /> advisor charges for.
        </h1>

        {/* Subheadline */}
        <p className="text-[17px] md:text-[19px] text-[#666] leading-relaxed mb-8 max-w-[540px] mx-auto">
          Investment simulator, FIRE calculator, mortgage tools, and daily pre/post-market intel — completely free, no account required.
        </p>

        {/* Email capture */}
        {submitted ? (
          <div className="flex items-center justify-center gap-2.5 text-[#00C896] font-semibold text-[16px] mb-8">
            <svg width="20" height="16" viewBox="0 0 28 22" fill="none">
              <path d="M2 11L10 19L26 3" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            You&apos;re in — market intel hits your inbox every morning.
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-[460px] mx-auto mb-2">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="your@email.com"
                autoComplete="email"
                className="flex-1 px-4 py-3.5 text-[16px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none text-[#111] placeholder:text-[#ccc] transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3.5 bg-[#00C896] text-white text-[15px] font-semibold rounded-xl hover:bg-[#00b386] active:scale-[0.98] transition-all disabled:opacity-60 whitespace-nowrap"
              >
                {loading ? 'Saving…' : 'Get daily intel →'}
              </button>
            </form>
            {error && <p className="text-[12px] text-red-500 mb-2">{error}</p>}
            <p className="text-[12px] text-[#bbb] mb-9">
              Pre-market alpha + post-market recap. Free forever. Unsubscribe anytime.
            </p>
          </>
        )}

        {/* Tool pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {TOOLS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-full border border-[#e5e7eb] text-[13px] font-medium text-[#555] hover:border-[#00C896] hover:text-[#00C896] transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Scroll cue */}
        <div className="flex flex-col items-center gap-1.5 text-[12px] text-[#ccc]">
          <span>Try the simulator below</span>
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
            <path d="M1 1l6 7 6-7" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

      </div>
    </section>
  );
}
