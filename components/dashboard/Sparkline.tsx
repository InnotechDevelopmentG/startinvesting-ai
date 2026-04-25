"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

type SparklineProps = {
  data: number[];
  positive: boolean;
};

export function Sparkline({ data, positive }: SparklineProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const color = positive ? "#16C784" : "#EA3943";
  const chartData = data.map((v, i) => ({ i, v }));

  if (!mounted) {
    // SSR-safe placeholder — same height as the chart
    return (
      <div className="h-10 w-full flex items-end px-1">
        {chartData.map((d, i) => {
          const min = Math.min(...data);
          const max = Math.max(...data);
          const range = max - min || 1;
          const h = Math.max(2, ((d.v - min) / range) * 32);
          return (
            <div
              key={i}
              style={{ height: h, backgroundColor: color, opacity: 0.35 }}
              className="flex-1 mx-px rounded-sm"
            />
          );
        })}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
