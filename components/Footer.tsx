import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#f3f4f6] bg-white mt-16">
      <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-10">

        {/* Top row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 mb-8">

          {/* Brand + tagline */}
          <div className="max-w-xs">
            <p className="text-[14px] font-semibold text-[#111] mb-1">startinvesting.ai</p>
            <p className="text-[13px] text-[#888] leading-relaxed">
              A free investment growth simulator built on real historical S&P 500 data. For education only — not financial advice.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#bbb] mb-3">Tools</p>
              <div className="flex flex-col gap-2">
                <Link href="/" className="text-[13px] text-[#555] hover:text-[#111] transition-colors">Investment Simulator</Link>
                <Link href="/news" className="text-[13px] text-[#555] hover:text-[#111] transition-colors">Market News</Link>
                <Link href="/about" className="text-[13px] text-[#555] hover:text-[#111] transition-colors">About</Link>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#bbb] mb-3">Legal</p>
              <div className="flex flex-col gap-2">
                <Link href="/privacy" className="text-[13px] text-[#555] hover:text-[#111] transition-colors">Privacy Policy</Link>
                <Link href="/legal" className="text-[13px] text-[#555] hover:text-[#111] transition-colors">Legal Disclaimer</Link>
                <a href="mailto:contact@startinvesting.ai" className="text-[13px] text-[#555] hover:text-[#111] transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer box */}
        <div className="bg-[#f9fafb] rounded-xl px-5 py-4 mb-6">
          <p className="text-[11px] text-[#888] leading-relaxed">
            <strong className="text-[#555] font-semibold">Important disclaimer:</strong> startinvesting.ai is an educational simulation tool only. Nothing on this site constitutes financial advice, investment advice, trading advice, or any other advice. All projections are hypothetical and based on historical S&P 500 average returns — past performance does not guarantee future results. We are not a registered investment advisor, broker-dealer, or financial planner. Always consult a qualified financial professional before making any investment decisions.
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[12px] text-[#bbb]">
            © {year} startinvesting.ai · All rights reserved.
          </p>
          <p className="text-[12px] text-[#bbb]">
            Questions? <a href="mailto:contact@startinvesting.ai" className="hover:text-[#555] transition-colors underline underline-offset-2">contact@startinvesting.ai</a>
          </p>
        </div>

      </div>
    </footer>
  );
}
