import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — startinvesting.ai',
  description: 'Privacy policy for startinvesting.ai',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-16">
      <Link href="/" className="text-[13px] text-[#aaa] hover:text-[#00C896] transition-colors mb-8 inline-block">← Back to home</Link>

      <p className="text-[12px] font-semibold text-[#00C896] uppercase tracking-widest mb-4">Legal</p>
      <h1 className="text-[36px] font-medium text-[#111] leading-tight tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-[14px] text-[#aaa] mb-10">Last updated: June 2025</p>

      <div className="flex flex-col gap-8 text-[15px] text-[#444] leading-relaxed">

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">1. Overview</h2>
          <p>startinvesting.ai ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our website at startinvesting.ai (the "Site"). By using the Site, you agree to the practices described in this policy.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">2. Information We Collect</h2>
          <p className="mb-3">We collect only the information you voluntarily provide:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li><strong className="text-[#111]">Email address</strong> — when you subscribe to our newsletter or complete the investment simulator.</li>
            <li><strong className="text-[#111]">Simulator inputs</strong> — age, starting amount, contribution amount, investment frequency, risk preference, and time horizon. This data is used solely to generate your personalized simulation results and follow-up emails.</li>
            <li><strong className="text-[#111]">Check-in responses</strong> — whether you have made an investment in a given week, collected via our weekly accountability emails.</li>
          </ul>
          <p className="mt-3">We do not collect payment information, social security numbers, government IDs, or any sensitive financial account data.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li>To send your personalized investment simulation results via email.</li>
            <li>To deliver our free daily market recap and pre-market newsletter (if subscribed).</li>
            <li>To send weekly investing accountability check-ins (if you completed the simulator).</li>
            <li>To improve the quality and relevance of our content.</li>
          </ul>
          <p className="mt-3">We do not sell, rent, trade, or otherwise share your personal information with third parties for their marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">4. Third-Party Services</h2>
          <p className="mb-3">We use the following trusted third-party services to operate the Site:</p>
          <ul className="list-disc pl-5 flex flex-col gap-2">
            <li><strong className="text-[#111]">Supabase</strong> — secure database storage for subscriber and simulation data.</li>
            <li><strong className="text-[#111]">Resend</strong> — transactional email delivery.</li>
            <li><strong className="text-[#111]">Vercel</strong> — website hosting and infrastructure.</li>
            <li><strong className="text-[#111]">Anthropic</strong> — AI content generation for market news articles and email summaries.</li>
            <li><strong className="text-[#111]">Finnhub</strong> — real-time market data for news and email content.</li>
          </ul>
          <p className="mt-3">Each of these providers operates under their own privacy policies and data security practices.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">5. Data Retention</h2>
          <p>We retain your email address and simulation data for as long as you are an active subscriber. You may request deletion of your data at any time by emailing us at <a href="mailto:contact@startinvesting.ai" className="text-[#00C896] underline underline-offset-2">contact@startinvesting.ai</a>. We will remove your data within 30 days of your request.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">6. Cookies</h2>
          <p>We use minimal browser storage (localStorage) to remember your simulator progress and email capture state within a session. We do not use third-party tracking cookies or advertising pixels.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">7. Children's Privacy</h2>
          <p>The Site is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected such information, please contact us immediately.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">8. Security</h2>
          <p>We implement reasonable technical and organizational measures to protect your data. However, no method of internet transmission is 100% secure. We cannot guarantee absolute security of data transmitted to or stored on our systems.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of the Site after changes constitutes acceptance of the revised policy.</p>
        </section>

        <section>
          <h2 className="text-[18px] font-semibold text-[#111] mb-3">10. Contact</h2>
          <p>For any privacy-related questions or data removal requests, contact us at:<br />
            <a href="mailto:contact@startinvesting.ai" className="text-[#00C896] underline underline-offset-2">contact@startinvesting.ai</a>
          </p>
        </section>

      </div>
    </div>
  );
}
