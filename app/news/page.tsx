export default function NewsPage() {
  return (
    <div className="max-w-[680px] mx-auto px-6 py-16">
      <p className="text-[12px] font-semibold text-[#00C896] uppercase tracking-widest mb-4">News</p>
      <h1 className="text-[38px] font-medium text-[#111] leading-tight tracking-tight mb-6">
        Market updates & investing insights.
      </h1>
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center rounded-2xl border border-[#f3f4f6] bg-[#fafafa]">
        <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h8" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-[15px] font-medium text-[#111]">Coming soon</p>
        <p className="text-[14px] text-[#888] max-w-[280px] leading-relaxed">
          Weekly market summaries and investing tips — straight to your inbox.
        </p>
        <a
          href="/"
          className="mt-2 px-6 py-3 rounded-xl text-[14px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
        >
          Get notified — try the simulator →
        </a>
      </div>
    </div>
  );
}
