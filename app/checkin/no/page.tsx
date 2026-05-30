import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No worries — startinvesting.ai',
  robots: { index: false },
};

export default function CheckinNoPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center shadow-sm border border-[#f0f0f0]">
        <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#888" strokeWidth="2"/>
            <path d="M12 7v5" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#888"/>
          </svg>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#888] mb-3">
          Got it
        </p>
        <h1 className="text-[28px] font-bold text-[#111] mb-3 tracking-tight leading-tight">
          No worries — there's still time.
        </h1>
        <p className="text-[15px] text-[#666] leading-relaxed mb-8">
          Missing one contribution won't derail your plan. The most important thing is getting back on track. Here's the fastest way to get started.
        </p>

        <div className="flex flex-col gap-4 text-left mb-8">
          <div className="bg-[#f9f9f9] rounded-xl p-5">
            <p className="text-[13px] font-semibold text-[#111] mb-1">1. Open a free brokerage account</p>
            <p className="text-[13px] text-[#666] leading-relaxed">Takes 5 minutes. Robinhood, Fidelity, or Schwab all work great.</p>
          </div>
          <div className="bg-[#f9f9f9] rounded-xl p-5">
            <p className="text-[13px] font-semibold text-[#111] mb-1">2. Set up auto-invest</p>
            <p className="text-[13px] text-[#666] leading-relaxed">Link your bank and schedule automatic contributions. Remove the decision entirely.</p>
          </div>
          <div className="bg-[#f9f9f9] rounded-xl p-5">
            <p className="text-[13px] font-semibold text-[#111] mb-1">3. Buy VOO, VTI, or SPY</p>
            <p className="text-[13px] text-[#666] leading-relaxed">S&P 500 index fund. One purchase, instant diversification, ~10% avg annual return historically.</p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block w-full px-6 py-3.5 rounded-xl text-[15px] font-semibold bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
        >
          Review my plan
        </Link>
      </div>
    </div>
  );
}
