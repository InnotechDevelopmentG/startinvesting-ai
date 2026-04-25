"use client";

import { useEffect, useState, useRef } from "react";
import { StockCard } from "./StockCard";
import type { StockCard as StockCardType } from "@/lib/mock";

type StockGridProps = {
  initialStocks: StockCardType[];
};

export function StockGrid({ initialStocks }: StockGridProps) {
  const [stocks, setStocks] = useState<StockCardType[]>(initialStocks);
  const [flashedTickers, setFlashedTickers] = useState<Set<string>>(new Set());
  const prevStocksRef = useRef<Map<string, StockCardType>>(
    new Map(initialStocks.map((s) => [s.ticker, s]))
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/stocks");
        if (!res.ok) return;
        const newStocks: StockCardType[] = await res.json();

        const changed = new Set<string>();
        newStocks.forEach((s) => {
          const prev = prevStocksRef.current.get(s.ticker);
          if (prev && prev.price !== s.price) {
            changed.add(s.ticker);
          }
        });

        if (changed.size > 0) {
          setFlashedTickers(changed);
          setTimeout(() => setFlashedTickers(new Set()), 900);
        }

        prevStocksRef.current = new Map(newStocks.map((s) => [s.ticker, s]));
        setStocks(newStocks);
      } catch {
        // silent — keep showing last known data
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {stocks.map((stock) => (
        <StockCard
          key={stock.ticker}
          stock={stock}
          flash={flashedTickers.has(stock.ticker)}
        />
      ))}
    </div>
  );
}
