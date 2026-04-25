"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Sparkline } from "./Sparkline";
import type { StockCard as StockCardType } from "@/lib/mock";
import { cn } from "@/lib/cn";

type StockCardProps = {
  stock: StockCardType;
  flash?: boolean;
};

function formatPrice(price: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatAge(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  return `${m}m ago`;
}

export function StockCard({ stock, flash = false }: StockCardProps) {
  const positive = stock.changePct >= 0;
  const isQuiet = stock.isQuiet;
  const [age, setAge] = useState(stock.updatedSecondsAgo);
  const [flashing, setFlashing] = useState(false);
  const prevFlash = useRef(flash);

  useEffect(() => {
    const interval = setInterval(() => setAge((a) => a + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (flash && !prevFlash.current) {
      setFlashing(true);
      setTimeout(() => setFlashing(false), 800);
    }
    prevFlash.current = flash;
  }, [flash]);

  const glowClass = flashing
    ? positive
      ? "animate-glow-green"
      : "animate-glow-red"
    : "";

  return (
    <div
      className={cn(
        "relative rounded-xl border border-[#1F1F22] bg-[#141416] p-4 flex flex-col gap-3 transition-all duration-200 group cursor-default",
        "hover:-translate-y-0.5",
        positive
          ? "hover:shadow-[0_0_20px_2px_rgba(22,199,132,0.12)] hover:border-[#16C784]/20"
          : "hover:shadow-[0_0_20px_2px_rgba(234,57,67,0.12)] hover:border-[#EA3943]/20",
        glowClass
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono font-bold text-white text-lg leading-none tracking-tight">
            {stock.ticker}
          </div>
          <div className="text-xs text-white/40 mt-0.5 truncate">{stock.name}</div>
        </div>
        <div className="text-[11px] text-white/30 font-mono shrink-0 mt-0.5">
          {formatAge(age)}
        </div>
      </div>

      {/* Price row */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-semibold text-white leading-none">
          ${formatPrice(stock.price)}
        </span>
        <div
          className={cn(
            "flex items-center gap-0.5 text-sm font-mono font-medium",
            positive ? "text-[#16C784]" : "text-[#EA3943]"
          )}
        >
          {positive ? (
            <TrendingUp className="w-3.5 h-3.5" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5" />
          )}
          {positive ? "+" : ""}
          {stock.changePct.toFixed(2)}%
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-10 w-full">
        <Sparkline data={stock.sparkline} positive={positive} />
      </div>

      {/* Why section */}
      {isQuiet ? (
        <p className="text-xs text-white/30 italic leading-relaxed">
          Quiet today — no significant catalyst.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-white/70 leading-relaxed">
            {stock.whySummary}
          </p>
          {stock.sources.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {stock.sources.map((source) => (
                <a
                  key={source.label}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 hover:text-white/70 hover:border-white/25 transition-colors font-mono"
                >
                  {source.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
