import { cn } from "@/lib/cn";

type MarketItem = {
  symbol: string;
  value: string;
  changePct: number;
};

const MARKET_DATA: MarketItem[] = [
  { symbol: "S&P 500", value: "5,248.31", changePct: 0.43 },
  { symbol: "Nasdaq", value: "16,428.82", changePct: 0.71 },
  { symbol: "Dow", value: "39,127.14", changePct: 0.18 },
  { symbol: "VIX", value: "14.22", changePct: -3.41 },
  { symbol: "BTC", value: "72,184", changePct: 4.12 },
];

export function MarketPulse() {
  return (
    <div className="w-full border-b border-[#1F1F22] bg-[#0D0D0F]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex items-center gap-4 sm:gap-8 overflow-x-auto scrollbar-none">
        {MARKET_DATA.map((item) => {
          const positive = item.changePct >= 0;
          return (
            <div key={item.symbol} className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-white/40 font-mono">{item.symbol}</span>
              <span className="text-xs text-white font-mono font-medium">{item.value}</span>
              <span
                className={cn(
                  "text-xs font-mono",
                  positive ? "text-[#16C784]" : "text-[#EA3943]"
                )}
              >
                {positive ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
