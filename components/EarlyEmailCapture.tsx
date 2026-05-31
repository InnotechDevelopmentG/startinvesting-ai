'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface EarlyEmailCaptureProps {
  age: number;
  onDismiss: () => void;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export default function EarlyEmailCapture({ age, onDismiss }: EarlyEmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const isClosingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const valid = isValidEmail(email);

  // Animate in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  // Focus input once visible
  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => inputRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [visible]);

  function dismiss() {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setVisible(false);
    setTimeout(onDismiss, 300);
  }

  async function handleSubmit() {
    if (!valid) { setError('Please enter a valid email.'); return; }
    setLoading(true); setError('');
    try {
      await fetch('/api/early-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, age }),
      });
      localStorage.setItem('early_capture_email', email);
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 1800);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && valid) handleSubmit();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center sm:px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={dismiss}
      />

      {/* Sheet / modal */}
      <div
        className="relative bg-white w-full sm:max-w-[420px] sm:rounded-2xl rounded-t-2xl px-6 pt-5 pb-8 sm:pb-6 shadow-xl transition-transform duration-300"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-5 sm:hidden" />

        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#f3f4f6] text-[#888] hover:text-[#111] transition-colors"
          aria-label="Close"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {success ? (
          <div className="flex flex-col items-center gap-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#E6FAF5] flex items-center justify-center">
              <svg width="22" height="18" viewBox="0 0 28 22" fill="none">
                <path d="M2 11L10 19L26 3" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[18px] font-medium text-[#111] tracking-tight">You're in!</p>
              <p className="text-[13px] text-[#888] mt-1">Hot tips incoming. Now let's build your plan.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Icon + heading */}
            <div className="flex items-start gap-3 pr-8">
              <div className="w-10 h-10 rounded-xl bg-[#E6FAF5] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <rect x="1" y="1" width="18" height="14" rx="2.5" stroke="#00C896" strokeWidth="1.6"/>
                  <path d="M1 4l9 6 9-6" stroke="#00C896" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-[#111] leading-snug tracking-tight">
                  Want your custom investing plan?
                </h2>
                <p className="text-[13px] text-[#888] mt-1 leading-relaxed">
                  Hot investment tips + your personalized plan — completely free, no spam.
                </p>
              </div>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="your@email.com"
              autoComplete="email"
              className="w-full px-4 py-3.5 text-[16px] rounded-xl border border-[#e5e7eb] focus:border-[#00C896] outline-none transition-colors text-[#111] placeholder:text-[#ccc]"
            />

            {error && <p className="text-[12px] text-red-500 -mt-1">{error}</p>}

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={loading || !valid}
              className="w-full py-3.5 rounded-xl text-[15px] font-medium transition-all duration-200
                bg-[#00C896] text-white disabled:bg-[#e5e7eb] disabled:text-[#aaa] disabled:cursor-not-allowed
                hover:enabled:bg-[#00b386] active:enabled:scale-[0.98]"
            >
              {loading ? 'Saving…' : 'Count me in →'}
            </button>

            {/* Skip */}
            <button
              onClick={dismiss}
              className="w-full py-1.5 text-[13px] text-[#bbb] hover:text-[#888] transition-colors"
            >
              No thanks, skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
