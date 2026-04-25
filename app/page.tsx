import { getStocks } from "@/lib/getStocks";
import { Header } from "@/components/dashboard/Header";
import { MarketPulse } from "@/components/dashboard/MarketPulse";
import { StockGrid } from "@/components/dashboard/StockGrid";
import { Footer } from "@/components/dashboard/Footer";

export const revalidate = 60;

export default async function HomePage() {
  const stocks = await getStocks();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MarketPulse />

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Top Movers Today
            </h1>
            <p className="text-sm text-white/40 mt-0.5">
              20 most-watched US stocks, with AI explanations of the move.
            </p>
          </div>
          <span className="text-xs text-white/25 font-mono self-start sm:self-auto">
            Updates every 60s
          </span>
        </div>

        <StockGrid initialStocks={stocks} />
      </main>

      <Footer />
    </div>
  );
}
