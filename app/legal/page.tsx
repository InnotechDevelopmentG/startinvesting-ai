import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Legal Disclaimer — startinvesting.ai',
  description: 'Legal disclaimer for startinvesting.ai — educational simulation tool, not financial advice.',
};

export default function LegalPage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-16">
      <Link href="/" className="text-[13px] text-[#aaa] hover:text-[#00C896] transition-colors mb-8 inline-block">← Back to home</Link>

      <p className="text-[12px] font-semibold text-[#00C896] uppercase tracking-widest mb-4">Legal</p>
      <h1 className="text-[36px] font-medium text-[#111] leading-tight tracking-tight mb-2">Legal Disclaimer</h1>
      <p className="text-[14px] text-[#aaa] mb-10">Last updated: June 2025</p>

      <div className="flex flex-col gap-8 text-[15px] text-[#444] leading-relaxed">

        <div className="bg-[#fff8e6] border border-[#f5e0a0] rounded-xl px-5 py-4">
          <p className="text-[13px] text-[#7a5c00] font-medium leading-relaxed">
            startinvesting.ai is an educational simulation tool. Nothing on this site is financial advice. All content is provided for informational and educational purposes only.
          </p>
        </div>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">1. Not Financial Advice</h2>
          <p>The content, tools, simulations, news articles, and emails provided by startinvesting.ai are for <strong className="text-[#111]">educational and informational purposes only</strong>. Nothing on this Site constitutes financial advice, investment advice, trading advice, tax advice, legal advice, or any other professional advice of any kind.</p>
          <p className="mt-3">startinvesting.ai is not a registered investment adviser, broker-dealer, financial planner, or tax professional. We do not recommend, endorse, or suggest the purchase or sale of any specific securities, investment products, or financial strategies.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">2. Simulation Results Are Hypothetical</h2>
          <p>All projections, growth estimates, and future value calculations displayed on this Site are <strong className="text-[#111]">hypothetical and illustrative only</strong>. They are based on historical average annual returns of the S&P 500 index and do not account for taxes, fees, inflation, market volatility, or individual circumstances.</p>
          <p className="mt-3"><strong className="text-[#111]">Past performance of the S&P 500 or any other index does not guarantee or predict future results.</strong> Actual investment returns will vary and may be significantly lower — or negative. You could lose some or all of your invested capital.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">3. Editorial Content</h2>
          <p>Market news articles and email newsletters published by startinvesting.ai are <strong className="text-[#111]">editorial and educational content only</strong>. They are generated using AI tools and publicly available market data for the purpose of general financial literacy. They are not research reports, analyst recommendations, or solicitations to buy or sell any securities.</p>
          <p className="mt-3">Any mention of specific securities, ETFs, or financial products (e.g., VOO, VTI, SPY) is for illustrative and educational purposes only and does not constitute a recommendation or endorsement.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">4. Affiliate Relationships</h2>
          <p>startinvesting.ai may include affiliate links to third-party financial products or services (such as brokerage account referral links). We may earn a commission if you sign up through these links, at no additional cost to you. The inclusion of any affiliate link does not constitute a financial recommendation.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">5. Consult a Professional</h2>
          <p>Before making any investment or financial decision, you should consult with a qualified and licensed financial advisor, tax professional, or other appropriate professional who can take your specific circumstances into account. startinvesting.ai cannot and does not provide personalized financial guidance.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">6. Accuracy of Information</h2>
          <p>While we strive to provide accurate and up-to-date information, startinvesting.ai makes no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of any information on the Site. Any reliance you place on such information is strictly at your own risk.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, startinvesting.ai and its operators shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of or reliance on any content, tools, or information provided on this Site.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">8. Contact</h2>
          <p>For questions about this disclaimer, contact us at:<br />
            <a href="mailto:contact@startinvesting.ai" className="text-[#00C896] underline underline-offset-2">contact@startinvesting.ai</a>
          </p>
        </section>

      </div>
    </div>
  );
}
