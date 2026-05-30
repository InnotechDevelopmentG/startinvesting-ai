import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Investment confirmed — startinvesting.ai',
  robots: { index: false },
};

export default function CheckinYesPage() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-10 text-center shadow-sm border border-[#f0f0f0]">
        <div className="w-16 h-16 rounded-full bg-[#E6FAF5] flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#00C896" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-[12px] font-semibold uppercase tracking-widest text-[#00C896] mb-3">
          Logged
        </p>
        <h1 className="text-[28px] font-bold text-[#111] mb-3 tracking-tight leading-tight">
          You invested. Nice work.
        </h1>
        <p className="text-[15px] text-[#666] leading-relaxed mb-8">
          Every contribution compounds. You're building something real — keep showing up and future you will thank you.
        </p>
        <div className="bg-[#f9f9f9] rounded-xl p-5 mb-8 text-left">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#888] mb-2">Reminder</p>
          <p className="text-[14px] text-[#444] leading-relaxed">
            Set up <strong className="text-[#111]">auto-invest</strong> so your contributions happen automatically — no willpower required.
          </p>
        </div>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-[14px] font-semibold bg-[#111] text-white hover:bg-[#222] transition-colors"
        >
          Back to simulator
        </Link>
      </div>
    </div>
  );
}
