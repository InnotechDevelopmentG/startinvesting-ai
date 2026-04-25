import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16">
        <Link
          href="/"
          className="text-xs text-white/30 hover:text-white/60 transition-colors font-mono mb-8 inline-block"
        >
          ← back to dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-6">About</h1>
        <p className="text-white/60 leading-relaxed text-base mb-6">
          <strong className="text-white">Strike While It&apos;s Hot</strong> is a real-time
          finance dashboard that shows the top 20 most-watched US stocks and explains —
          in plain English — why each one is moving right now. We combine live quote data
          from Finnhub with AI-generated summaries powered by Claude to give retail
          investors the one thing Bloomberg doesn&apos;t: a straight answer to{" "}
          <em>why is this moving?</em>
        </p>
        <div className="border border-[#1F1F22] rounded-xl p-4 bg-[#141416] text-xs text-white/40 leading-relaxed">
          <strong className="text-white/60">Disclaimer:</strong> This site is for
          informational purposes only and does not constitute investment advice. AI-generated
          summaries may contain errors or omissions. Quote data is provided by Finnhub and
          may be delayed. Past performance is not indicative of future results. Always do
          your own research before making investment decisions.
        </div>
      </main>
      <Footer />
    </div>
  );
}
