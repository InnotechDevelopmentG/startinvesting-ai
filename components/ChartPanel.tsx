'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  ChartOptions,
  ChartData,
  TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  SimulatorState,
  RISK_LABELS,
  FREQUENCY_PER_YEAR,
  RISK_RATES,
  SAVINGS_RATE,
} from '@/types/simulator';
import {
  calcSeries,
  formatCurrency,
  formatCurrencyFull,
  easeOutQuart,
} from '@/lib/finance';
import ShareButton from './ShareButton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

interface ChartPanelProps {
  state: SimulatorState;
  currentStep: number;
  hideHeader?: boolean;
  chartHeight?: string;
  insightMinStep?: number;
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

export default function ChartPanel({ state, currentStep, hideHeader = false, chartHeight = '260px', insightMinStep = 4 }: ChartPanelProps) {
  const projectedNumberRef = useRef<HTMLSpanElement>(null);
  const displayValRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const startValRef = useRef(0);
  const targetRef = useRef(state.projectedValue);

  useEffect(() => {
    const target = state.projectedValue;
    targetRef.current = target;
    startValRef.current = displayValRef.current;
    startRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    function step(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(elapsed / 520, 1);
      const eased = easeOutQuart(t);
      const current = Math.round(startValRef.current + (target - startValRef.current) * eased);
      displayValRef.current = current;
      if (projectedNumberRef.current) {
        projectedNumberRef.current.textContent = formatCurrencyFull(current);
      }
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.projectedValue]);

  const ppy = FREQUENCY_PER_YEAR[state.frequency];
  const annualRate = RISK_RATES[state.riskProfile];

  const investedSeries = useMemo(
    () => calcSeries(state.startingAmount, state.contributionAmount, annualRate, ppy, state.years),
    [state.startingAmount, state.contributionAmount, annualRate, ppy, state.years]
  );

  const savingsSeries = useMemo(
    () => calcSeries(state.startingAmount, state.contributionAmount, SAVINGS_RATE, ppy, state.years),
    [state.startingAmount, state.contributionAmount, ppy, state.years]
  );

  const labels = useMemo(
    () => Array.from({ length: state.years + 1 }, (_, i) => (i === 0 ? 'Now' : `Yr ${i}`)),
    [state.years]
  );

  const chartData: ChartData<'line'> = {
    labels,
    datasets: [
      {
        label: 'Invested',
        data: investedSeries,
        borderColor: '#00C896',
        backgroundColor: 'rgba(0,200,150,0.09)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#00C896',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
      {
        label: 'Savings account',
        data: savingsSeries,
        borderColor: '#9ca3af',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#9ca3af',
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 520,
      easing: 'easeInOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        titleColor: '#111',
        bodyColor: '#555',
        padding: 12,
        titleFont: { size: 13, weight: 500, family: 'inherit' },
        bodyFont: { size: 13, family: 'inherit' },
        callbacks: {
          label(item: TooltipItem<'line'>) {
            return `${item.dataset.label}: ${formatCurrencyFull(item.raw as number)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11, family: 'inherit' },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: '#f3f4f6' },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 11, family: 'inherit' },
          callback(value) {
            return formatYAxis(value as number);
          },
        },
      },
    },
  };

  const totalContributed = Math.round(
    state.startingAmount + state.contributionAmount * ppy * state.years
  );
  const gain = state.projectedValue - totalContributed;
  const gainMultiple =
    totalContributed > 0 ? (state.projectedValue / totalContributed).toFixed(1) : null;

  const salaryMultiple =
    state.projectedValue > 0 ? (state.projectedValue / 60000).toFixed(1) : null;
  const monthlyRetirementIncome =
    state.projectedValue > 0 ? Math.round((state.projectedValue * 0.04) / 12) : null;

  const fiveYearEarlierValue = useMemo(() => {
    if (state.contributionAmount <= 0) return null;
    const series = calcSeries(
      state.startingAmount,
      state.contributionAmount,
      annualRate,
      ppy,
      state.years + 5
    );
    return series[series.length - 1];
  }, [state.startingAmount, state.contributionAmount, annualRate, ppy, state.years]);

  const hasData = state.contributionAmount > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Projected value — hidden when parent handles display */}
      {!hideHeader && (
        <div>
          <p className="text-[13px] font-medium text-[#888] uppercase tracking-widest mb-2">
            Projected value
          </p>
          {hasData ? (
            <>
              <span
                ref={projectedNumberRef}
                className="font-tabular block"
                style={{ fontSize: '58px', fontWeight: 500, letterSpacing: '-3px', color: '#111', lineHeight: 1 }}
              >
                {formatCurrencyFull(state.projectedValue)}
              </span>
              {currentStep >= 6 && (
                <p className="text-[13px] text-[#888] mt-2">
                  {RISK_LABELS[state.riskProfile]} · {(annualRate * 100).toFixed(0)}% avg annual return
                </p>
              )}
              {currentStep >= 7 && (
                <div className="mt-4">
                  <ShareButton
                    text={`📈 Just simulated my investments — could grow to ${formatCurrencyFull(state.projectedValue)} in ${state.years} years. The compounding is wild. Calculate yours:`}
                    url="https://startinvesting.ai"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <span
                className="font-tabular block"
                style={{ fontSize: '58px', fontWeight: 500, letterSpacing: '-3px', color: '#e5e7eb', lineHeight: 1 }}
              >
                —
              </span>
              <p className="text-[13px] text-[#bbb] mt-2">
                Fill in your details to see your projection
              </p>
            </>
          )}
        </div>
      )}

      {/* Chart — show placeholder when no data */}
      {!hasData && !hideHeader ? (
        <div
          className="flex flex-col items-center justify-center gap-3 rounded-xl bg-[#fafafa] border border-[#f3f4f6]"
          style={{ height: chartHeight }}
        >
          <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
            <polyline points="2,28 10,18 20,22 38,4" stroke="#e5e7eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="38" cy="4" r="3" fill="#e5e7eb"/>
          </svg>
          <p className="text-[13px] text-[#ccc] text-center px-8">
            Your growth chart will appear as you complete the steps
          </p>
        </div>
      ) : (
        <div className="relative" style={{ height: chartHeight }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Custom legend */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2">
          <div className="w-8 bg-[#00C896] rounded-full" style={{ height: '2px' }} />
          <span className="text-[12px] text-[#888]">Invested</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="32" height="2" viewBox="0 0 32 2">
            <line x1="0" y1="1" x2="32" y2="1" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5 5" />
          </svg>
          <span className="text-[12px] text-[#888]">Savings account (2.5%)</span>
        </div>
      </div>

      {/* Insight cards — appear progressively, hidden on results page */}
      {!hideHeader && currentStep >= insightMinStep && state.projectedValue > 0 && (
        <div className="flex flex-col gap-3">
          {/* Growth breakdown */}
          <div className="rounded-xl bg-[#E6FAF5] border border-[#c3f0e2] p-4 animate-fade-up">
            <p className="text-[11px] font-medium text-[#00C896] uppercase tracking-wide mb-3">
              Growth breakdown
            </p>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#888]">Total contributed</p>
                <p className="text-[15px] font-medium text-[#111] mt-0.5">
                  {formatCurrencyFull(totalContributed)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#888]">Investment gains</p>
                <p className="text-[15px] font-medium text-[#00C896] mt-0.5">
                  +{formatCurrencyFull(Math.max(gain, 0))}
                </p>
              </div>
            </div>
            {gainMultiple && parseFloat(gainMultiple) > 1 && (
              <p className="text-[12px] text-[#888] mt-2 pt-2 border-t border-[#c3f0e2]">
                Your money works {gainMultiple}× harder than just saving.
              </p>
            )}
          </div>

          {/* Savings comparison */}
          <div className="rounded-xl border border-[#e5e7eb] p-4 animate-fade-up">
            <p className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-3">
              vs. Savings account (2.5%)
            </p>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[12px] text-[#888]">In savings</p>
                <p className="text-[15px] font-medium text-[#111] mt-0.5">
                  {formatCurrencyFull(state.savingsBenchmark)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#888]">You earn extra</p>
                <p className="text-[15px] font-medium text-[#00C896] mt-0.5">
                  +{formatCurrencyFull(Math.max(state.projectedValue - state.savingsBenchmark, 0))}
                </p>
              </div>
            </div>
          </div>

          {/* 5 years earlier */}
          {currentStep >= insightMinStep + 1 && fiveYearEarlierValue !== null && (
            <div className="rounded-xl border border-[#e5e7eb] p-4 animate-fade-up">
              <p className="text-[11px] font-medium text-[#888] uppercase tracking-wide mb-3">
                If you started 5 years earlier
              </p>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-[#888]">With 5 extra years</p>
                  <p className="text-[15px] font-medium text-[#111] mt-0.5">
                    {formatCurrencyFull(fiveYearEarlierValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[#888]">Difference</p>
                  <p className="text-[15px] font-medium text-[#00C896] mt-0.5">
                    +{formatCurrencyFull(fiveYearEarlierValue - state.projectedValue)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Translation pills */}
          {currentStep >= insightMinStep + 2 && state.projectedValue > 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-up">
              {salaryMultiple && (
                <span className="px-3 py-1.5 rounded-full bg-[#f3f4f6] text-[12px] text-[#555]">
                  {salaryMultiple}× avg salary
                </span>
              )}
              {monthlyRetirementIncome && (
                <span className="px-3 py-1.5 rounded-full bg-[#f3f4f6] text-[12px] text-[#555]">
                  {formatCurrency(monthlyRetirementIncome)}/mo in retirement
                </span>
              )}
              <span className="px-3 py-1.5 rounded-full bg-[#f3f4f6] text-[12px] text-[#555]">
                4% withdrawal rule
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
