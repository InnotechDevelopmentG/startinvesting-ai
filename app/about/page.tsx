import ArticleSubscribe from '@/components/ArticleSubscribe';

export default function AboutPage() {
  return (
    <div className="max-w-[680px] mx-auto px-6 py-16">
      <p className="text-[12px] font-semibold text-[#00C896] uppercase tracking-widest mb-4">About</p>
      <h1 className="text-[38px] font-medium text-[#111] leading-tight tracking-tight mb-6">
        We make investing simple.
      </h1>
      <p className="text-[17px] text-[#555] leading-relaxed mb-4">
        startinvesting.ai is a free tool that helps people understand the power of compound growth — using real historical market data, not marketing fluff.
      </p>
      <p className="text-[17px] text-[#555] leading-relaxed mb-4">
        We believe anyone can build wealth. You don't need a financial advisor, a large salary, or a finance degree. You just need to start — even small, even imperfect.
      </p>
      <p className="text-[17px] text-[#555] leading-relaxed mb-10">
        Our simulator is guided, personalized, and takes less than two minutes. No sign-up required to see your numbers.
      </p>

      <ArticleSubscribe position="top" />

      <div className="mt-6">
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[15px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
        >
          Try the simulator →
        </a>
      </div>
    </div>
  );
}
