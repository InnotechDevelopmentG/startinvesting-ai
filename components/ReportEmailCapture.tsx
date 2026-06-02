'use client';

import { useState, KeyboardEvent } from 'react';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

interface ReportEmailCaptureProps {
  title: string;
  description: string;
  ctaLabel: string;
  onSubmit: (email: string) => Promise<void>;
}

export default function ReportEmailCapture({
  title,
  description,
  ctaLabel,
  onSubmit,
}: ReportEmailCaptureProps) {
  const [email, setEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const s = localStorage.getItem('early_capture_email') ?? '';
    return isValidEmail(s) ? s : '';
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const valid = isValidEmail(email);

  async function handleSubmit() {
    if (!valid) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSubmit(email.trim().toLowerCase());
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
      <div className="bg-[#E6FAF5] border border-[#c3f0e2] rounded-2xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#00C896] flex items-center justify-center flex-shrink-0">
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <path d="M1 7L6.5 12.5L17 1" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-[#111]">Report sent!</p>
          <p className="text-[13px] text-[#555] mt-0.5">Check your inbox — it&apos;s on its way.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
      <p className="text-[12px] font-semibold uppercase tracking-widest text-[#00C896] mb-1">{title}</p>
      <p className="text-[14px] text-[#555] mb-4 leading-relaxed">{description}</p>

      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="your@email.com"
          autoComplete="email"
          className="w-full px-4 py-3.5 text-[15px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors text-[#111] placeholder:text-[#ccc]"
        />
        {error && <p className="text-[12px] text-red-500">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading || !valid}
          className="w-full py-3.5 rounded-xl text-[14px] font-medium transition-all
            bg-[#00C896] text-white disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed
            hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]"
        >
          {loading ? 'Sending…' : ctaLabel}
        </button>
      </div>

      <p className="text-[11px] text-[#bbb] mt-3 leading-relaxed">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
