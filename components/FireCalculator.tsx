'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { calculateFIRE, fmtFireFull, fmtFireShort, FireInputs } from '@/lib/fire';
import EmailCaptureModal from './EmailCaptureModal';
import Tooltip from './Tooltip';
import ShareButton from './ShareButton';

const WR_OPTIONS = [3, 3.5, 4, 5] as const;

const WR_HINT: Record<number, string> = {
  3:   'Ultra-conservative — built for 50+ year retirements.',
  3.5: 'Conservative — suited for early retirement, 40+ yr horizon.',
  4:   'Standard — the Trinity Study rate. Safe for 30+ yr retirements.',
  5:   'Aggressive — higher risk of depletion over a long retirement.',
};

const DEFAULTS: FireInputs = {
  currentAge: 30,
  currentSavings: 50_000,
  monthlyContribution: 1_500,
  annualSpending: 60_000,
  annualReturn: 7,
  inflationRate: 3,
  withdrawalRate: 4,
};

function fmtInt(n: number): string {
  return n > 0 ? Math.round(n).toLocaleString() : '';
}

function yearsLabel(yrs: number | null): string {
  if (yrs === null) return '—';
  if (yrs <= 0) return 'Now!';
  const y = Math.floor(yrs);
  const m = Math.round((yrs - y) * 12);
  if (y === 0) return `${m} mo`;
  if (m === 0) return `${y} yr${y !== 1 ? 's' : ''}`;
  return `${y} yr${y !== 1 ? 's' : ''} ${m} mo`;
}

function NumInput({
  label, value, onChange, prefix, suffix, hint, tooltip, inputMode = 'numeric',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  tooltip?: string;
  inputMode?: 'numeric' | 'decimal';
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <label className="text-[12px] font-medium text-[#555] uppercase tracking-wider">{label}</label>
        {tooltip && <Tooltip content={tooltip} />}
      </div>
      <div className="flex items-center bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-3 py-2.5 focus-within:border-[#00C896] transition-colors">
        {prefix && <span className="text-[14px] text-[#aaa] mr-1.5 flex-shrink-0">{prefix}</span>}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[15px] text-[#111] outline-none min-w-0"
          placeholder="0"
        />
        {suffix && <span className="text-[14px] text-[#aaa] ml-1.5 flex-shrink-0">{suffix}</span>}
      </div>
      {hint && <p className="text-[11px] text-[#aaa]">{hint}</p>}
    </div>
  );
}

export default function FireCalculator() {
  const [inputs, setInputs] = useState<FireInputs>(DEFAULTS);

  const [ageStr,      setAgeStr]      = useState(String(DEFAULTS.currentAge));
  const [savingsStr,  setSavingsStr]  = useState(fmtInt(DEFAULTS.currentSavings));
  const [contribStr,  setContribStr]  = useState(fmtInt(DEFAULTS.monthlyContribution));
  const [spendingStr, setSpendingStr] = useState(fmtInt(DEFAULTS.annualSpending));
  const [returnStr,   setReturnStr]   = useState(String(DEFAULTS.annualReturn));
  const [inflStr,     setInflStr]     = useState(String(DEFAULTS.inflationRate));
  const [showProjection, setShowProjection] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const touchedFields = useRef(new Set<string>());

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('early_capture_email')) return;
    // already shown check
  }, []);

  function trackField(name: string) {
    if (typeof window !== 'undefined' && (
      localStorage.getItem('early_capture_email') ||
      localStorage.getItem('fire_modal_dismissed')
    )) return;
    if (showModal) return;
    touchedFields.current.add(name);
    if (touchedFields.current.size >= 2) {
      setShowModal(true);
    }
  }

  function handleModalClose() {
    setShowModal(false);
    if (typeof window !== 'undefined' && !localStorage.getItem('early_capture_email')) {
      localStorage.setItem('fire_modal_dismissed', '1');
    }
  }

  function patch(p: Partial<FireInputs>) {
    setInputs(prev => ({ ...prev, ...p }));
  }

  function onAge(v: string) {
    const d = v.replace(/[^0-9]/g, '');
    setAgeStr(d);
    patch({ currentAge: parseInt(d) || 0 });
    trackField('age');
  }
  function onSavings(v: string) {
    const d = v.replace(/[^0-9]/g, '');
    setSavingsStr(d ? parseInt(d).toLocaleString() : '');
    patch({ currentSavings: parseInt(d) || 0 });
    trackField('savings');
  }
  function onContrib(v: string) {
    const d = v.replace(/[^0-9]/g, '');
    setContribStr(d ? parseInt(d).toLocaleString() : '');
    patch({ monthlyContribution: parseInt(d) || 0 });
    trackField('contrib');
  }
  function onSpending(v: string) {
    const d = v.replace(/[^0-9]/g, '');
    setSpendingStr(d ? parseInt(d).toLocaleString() : '');
    patch({ annualSpending: parseInt(d) || 0 });
    trackField('spending');
  }
  function onReturn(v: string) {
    const c = v.replace(/[^0-9.]/g, '');
    setReturnStr(c);
    patch({ annualReturn: parseFloat(c) || 0 });
    trackField('return');
  }
  function onInfl(v: string) {
    const c = v.replace(/[^0-9.]/g, '');
    setInflStr(c);
    patch({ inflationRate: parseFloat(c) || 0 });
    trackField('infl');
  }

  const result = useMemo(() => calculateFIRE(inputs), [inputs]);

  const scenarioMore    = useMemo(() => calculateFIRE({ ...inputs, monthlyContribution: inputs.monthlyContribution + 500 }), [inputs]);
  const scenarioBetter  = useMemo(() => calculateFIRE({ ...inputs, annualReturn: inputs.annualReturn + 1 }), [inputs]);
  const scenarioLess    = useMemo(() => calculateFIRE({ ...inputs, annualSpending: Math.round(inputs.annualSpending * 0.8) }), [inputs]);

  const shareText = useMemo(() => {
    if (result.fireAge !== null && result.yearsToFIRE !== null) {
      return `🔥 Just calculated my FIRE number: ${fmtFireFull(result.fireNumber)} — I can retire at age ${Math.ceil(result.fireAge)} in ${yearsLabel(result.yearsToFIRE)}. What's yours?`;
    }
    return `🔥 My FIRE number is ${fmtFireFull(result.fireNumber)} — the exact amount I need to never work again. Calculate yours:`;
  }, [result]);

  const moreYrs   = result.yearsToFIRE !== null && scenarioMore.yearsToFIRE   !== null ? +(result.yearsToFIRE - scenarioMore.yearsToFIRE).toFixed(1)   : null;
  const betterYrs = result.yearsToFIRE !== null && scenarioBetter.yearsToFIRE !== null ? +(result.yearsToFIRE - scenarioBetter.yearsToFIRE).toFixed(1) : null;
  const lessYrs   = result.yearsToFIRE !== null && scenarioLess.yearsToFIRE   !== null ? +(result.yearsToFIRE - scenarioLess.yearsToFIRE).toFixed(1)   : null;

  // Projection chart — cap at ~28 rows
  const chartRows = useMemo(() => {
    const all = result.projections;
    if (all.length <= 28) return all;
    const fireIdx = all.findIndex(r => r.isFIREYear);
    const step = Math.ceil(all.length / 24);
    return all.filter((_, i) =>
      i === 0 || i === all.length - 1 || i % step === 0 || i === fireIdx
    );
  }, [result.projections]);

  const needMore = result.fireNumber > 0 && inputs.currentSavings < result.fireNumber
    ? result.fireNumber - inputs.currentSavings
    : 0;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">

      {showModal && (
        <EmailCaptureModal
          source="fire"
          age={inputs.currentAge || undefined}
          onClose={handleModalClose}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#00C896] uppercase tracking-[0.15em] mb-2">Calculator</p>
        <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mb-2">
          FIRE Calculator
        </h1>
        <p className="text-[15px] text-[#888]">
          Find your Financial Independence number and exactly how many years it takes to get there — in today's dollars.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">

        {/* ── LEFT: Inputs ── */}
        <div className="flex flex-col gap-6">

          {/* Situation */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Your Situation</p>
            <NumInput
              label="Current Age"
              value={ageStr}
              onChange={onAge}
              suffix="yrs"
              tooltip="Your age today. This determines how long your money has to compound — even a few extra years makes an enormous difference."
            />
            <NumInput
              label="Current Investments"
              value={savingsStr}
              onChange={onSavings}
              prefix="$"
              hint="Total across 401(k), IRA, brokerage, etc."
              tooltip="Your total invested balance across all accounts — 401(k), Roth IRA, traditional IRA, brokerage. Don't include cash savings or emergency funds."
            />
            <NumInput
              label="Monthly Contribution"
              value={contribStr}
              onChange={onContrib}
              prefix="$"
              hint="In today's dollars — assumed to grow with inflation over time"
              tooltip="How much you invest every month. Even $200/month at 25 beats $1,000/month at 40 — consistency and time are everything."
            />
          </div>

          {/* Target */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Retirement Target</p>

            <NumInput
              label="Annual Spending in Retirement"
              value={spendingStr}
              onChange={onSpending}
              prefix="$"
              hint={`In today's dollars — $${Math.round(inputs.annualSpending / 12).toLocaleString()}/mo · what you'd need if you stopped working tomorrow`}
              tooltip="What you'd need to live on per year in retirement, in today's dollars. Most people underestimate this. Include housing, food, travel, healthcare, and fun."
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-[12px] font-medium text-[#555] uppercase tracking-wider">Withdrawal Rate</label>
                  <Tooltip content="The % of your portfolio you draw down each year. The 4% rule comes from the Trinity Study (1998) — historically sustainable for 30+ year retirements. Go lower for extra safety or a very long retirement." />
                </div>
                <span className="text-[11px] text-[#aaa]">{(100 / inputs.withdrawalRate).toFixed(1)}× multiplier</span>
              </div>
              <div className="flex gap-2">
                {WR_OPTIONS.map(wr => (
                  <button
                    key={wr}
                    onClick={() => patch({ withdrawalRate: wr })}
                    className={`flex-1 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                      inputs.withdrawalRate === wr
                        ? 'bg-[#111] text-white'
                        : 'bg-[#f3f4f6] text-[#555] hover:bg-[#e5e7eb]'
                    }`}
                  >
                    {wr}%
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#aaa]">{WR_HINT[inputs.withdrawalRate]}</p>
            </div>
          </div>

          {/* Growth */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Growth Assumptions</p>

            <NumInput
              label="Expected Annual Return"
              value={returnStr}
              onChange={onReturn}
              suffix="%"
              inputMode="decimal"
              hint="S&P 500 has averaged ~10% nominal historically. 7% is a common real-return estimate."
              tooltip="Your expected average annual investment return. The S&P 500 has averaged ~10% nominally since 1926. After inflation, a real return of 6–7% is a reasonable planning assumption."
            />
            <NumInput
              label="Inflation Rate"
              value={inflStr}
              onChange={onInfl}
              suffix="%"
              inputMode="decimal"
              hint="US long-run average ~3%. Fed targets 2%."
              tooltip="How much purchasing power erodes per year. The US long-run average is ~3%. The Fed targets 2%. All results shown in today's dollars already account for this."
            />

            <div className="bg-[#f9fafb] border border-[#f3f4f6] rounded-xl px-4 py-3">
              <p className="text-[12px] text-[#888]">
                Real return after inflation:{' '}
                <span className="font-semibold text-[#111]">{result.realAnnualReturnPct.toFixed(2)}%/yr</span>
                {' '}— all numbers shown in <span className="font-medium text-[#111]">today&apos;s dollars</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="flex flex-col gap-5">

          {/* Hero */}
          <div className="bg-[#111] rounded-2xl p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#00C896] mb-1">Your FIRE Number</p>
            <p
              className="font-tabular leading-none mb-5"
              style={{ fontSize: result.fireNumber >= 10_000_000 ? '36px' : result.fireNumber >= 1_000_000 ? '44px' : '52px', fontWeight: 700, letterSpacing: '-2px' }}
            >
              {result.fireNumber > 0 ? fmtFireFull(result.fireNumber) : '—'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">Time to FIRE</p>
                <p className="text-[22px] font-bold text-white leading-tight">
                  {yearsLabel(result.yearsToFIRE)}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-[#888] uppercase tracking-wider mb-1">FIRE Age</p>
                <p className="text-[22px] font-bold text-white leading-tight">
                  {result.fireAge !== null ? `Age ${Math.ceil(result.fireAge)}` : '—'}
                </p>
              </div>
            </div>

            {result.yearsToFIRE === null && (
              <p className="text-[11px] text-[#888] mt-3">Increase monthly contributions or target lower spending to reach FIRE.</p>
            )}
          </div>

          {/* Share */}
          {result.fireNumber > 0 && (
            <ShareButton
              text={shareText}
              url="https://startinvesting.ai/fire"
            />
          )}

          {/* Progress */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Progress</p>
              <p className="text-[22px] font-bold text-[#111]">{result.progressPercent.toFixed(1)}%</p>
            </div>

            <div className="h-3 rounded-full bg-[#f3f4f6] overflow-hidden mb-2">
              <div
                className="h-full rounded-full bg-[#00C896] transition-all duration-500"
                style={{ width: `${result.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#aaa] mb-4">
              <span>{fmtFireShort(inputs.currentSavings)} saved</span>
              {needMore > 0 && <span>{fmtFireShort(needMore)} to go</span>}
              <span>{fmtFireShort(result.fireNumber)} target</span>
            </div>

            {/* Coast FIRE */}
            <div className={`rounded-xl px-4 py-3 border ${
              result.isCoastFIRE
                ? 'bg-[#E6FAF5] border-[#c3f0e2]'
                : 'bg-[#f9fafb] border-[#f3f4f6]'
            }`}>
              {result.isCoastFIRE ? (
                <>
                  <p className="text-[12px] font-semibold text-[#00C896] mb-1">You&apos;ve hit Coast FIRE</p>
                  <p className="text-[12px] text-[#555]">
                    Your current savings will compound to your FIRE number by age {result.coastTargetAge} — even if you stop investing today.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[12px] font-semibold text-[#555] mb-1">
                    Coast FIRE: {fmtFireShort(result.coastFireNumber)}
                  </p>
                  <p className="text-[12px] text-[#888]">
                    Save {fmtFireShort(Math.max(result.coastFireNumber - inputs.currentSavings, 0))} more, then you can stop contributing and still retire by {result.coastTargetAge}.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* What-if */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-4">What If?</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  label: '+$500/mo saved',
                  years: moreYrs,
                  age: scenarioMore.fireAge,
                },
                {
                  label: '+1% return',
                  years: betterYrs,
                  age: scenarioBetter.fireAge,
                },
                {
                  label: '20% less spending',
                  years: lessYrs,
                  age: scenarioLess.fireAge,
                },
              ].map(({ label, years, age }) => (
                <div key={label} className="bg-[#f9fafb] rounded-xl p-3">
                  <p className="text-[10px] text-[#888] mb-1.5 leading-snug">{label}</p>
                  {years !== null && years > 0 ? (
                    <>
                      <p className="text-[16px] font-bold text-[#00C896] leading-none">−{years}yr</p>
                      {age !== null && (
                        <p className="text-[10px] text-[#aaa] mt-1">Age {Math.ceil(age)}</p>
                      )}
                    </>
                  ) : years !== null && years <= 0 ? (
                    <p className="text-[13px] font-bold text-[#00C896]">Already!</p>
                  ) : (
                    <p className="text-[13px] text-[#ccc]">—</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-4">Summary</p>
            <div className="flex flex-col divide-y divide-[#f3f4f6]">
              {[
                { label: 'FIRE Number',              value: result.fireNumber > 0 ? fmtFireFull(result.fireNumber) : '—', bold: true },
                { label: 'Monthly at Retirement',    value: `${fmtFireShort(inputs.annualSpending / 12)}/mo` },
                { label: 'Portfolio Multiple',       value: `${(100 / inputs.withdrawalRate).toFixed(1)}× annual spending` },
                { label: 'Real Return (net of inflation)', value: `${result.realAnnualReturnPct.toFixed(2)}%/yr` },
                { label: 'Coast FIRE Number',        value: fmtFireFull(result.coastFireNumber) },
                ...(result.yearsToFIRE !== null
                  ? [{ label: 'Working Years Left', value: yearsLabel(result.yearsToFIRE) }]
                  : []),
              ].map(({ label, value, bold }) => (
                <div key={label} className="flex justify-between items-center py-2.5">
                  <span className="text-[13px] text-[#666]">{label}</span>
                  <span className={`text-[13px] ${bold ? 'font-semibold text-[#111]' : 'text-[#111]'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#bbb] leading-relaxed px-1">
            Uses real (inflation-adjusted) returns based on the Trinity Study 4% rule framework.
            All projections are in today&apos;s dollars. Past returns don&apos;t guarantee future results.
            Not financial advice — consult a qualified financial planner.
          </p>
        </div>
      </div>

      {/* ── Projection Chart ── */}
      <div className="mt-8">
        <button
          onClick={() => setShowProjection(v => !v)}
          className="flex items-center gap-2 text-[14px] font-medium text-[#555] hover:text-[#111] transition-colors mb-4"
        >
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: showProjection ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {showProjection ? 'Hide' : 'Show'} year-by-year projection
        </button>

        {showProjection && (
          <div className="bg-white border border-[#f3f4f6] rounded-2xl overflow-hidden">

            {/* Bar chart */}
            <div className="p-6 border-b border-[#f3f4f6]">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">Portfolio Growth Toward FIRE Number</p>
              <p className="text-[11px] text-[#bbb] mb-4">In today&apos;s dollars</p>
              <div className="flex flex-col gap-2">
                {chartRows.map(row => {
                  const pct = result.fireNumber > 0
                    ? Math.min((row.portfolioValue / result.fireNumber) * 100, 100)
                    : 0;
                  return (
                    <div key={row.year} className="flex items-center gap-3">
                      <span className={`text-[11px] w-12 flex-shrink-0 ${row.isFIREYear ? 'text-[#00C896] font-bold' : 'text-[#aaa]'}`}>
                        Yr {row.year}
                      </span>
                      <div className="flex-1 h-3.5 rounded-full bg-[#f3f4f6] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            row.isFIREYear || pct >= 100 ? 'bg-[#00C896]' : 'bg-[#111]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-[11px] w-20 text-right flex-shrink-0 font-tabular ${
                        row.isFIREYear ? 'text-[#00C896] font-bold' : 'text-[#888]'
                      }`}>
                        {fmtFireShort(row.portfolioValue)}{row.isFIREYear ? ' ✓' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              {result.yearsToFIRE === null && (
                <p className="text-[12px] text-[#aaa] mt-4 text-center">
                  No FIRE milestone reached in the projection period — try increasing contributions or adjusting target spending.
                </p>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#f3f4f6]">
                    {['Year', 'Age', 'Portfolio (real $)', 'Total Invested', 'Market Gains', '% to FIRE'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#aaa] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartRows.map((row, i) => {
                    const pct = result.fireNumber > 0
                      ? Math.min((row.portfolioValue / result.fireNumber) * 100, 100)
                      : 0;
                    return (
                      <tr key={row.year} className={
                        row.isFIREYear
                          ? 'bg-[#E6FAF5]'
                          : i % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white'
                      }>
                        <td className={`px-4 py-2.5 font-medium ${row.isFIREYear ? 'text-[#00C896]' : 'text-[#111]'}`}>
                          {row.year}
                        </td>
                        <td className="px-4 py-2.5 text-[#555]">{row.age}</td>
                        <td className={`px-4 py-2.5 font-medium font-tabular ${row.isFIREYear ? 'text-[#00C896] font-semibold' : 'text-[#111]'}`}>
                          {fmtFireFull(row.portfolioValue)}{row.isFIREYear ? ' ✓' : ''}
                        </td>
                        <td className="px-4 py-2.5 text-[#555] font-tabular">{fmtFireShort(row.totalContributed)}</td>
                        <td className="px-4 py-2.5 text-[#00C896] font-tabular">{fmtFireShort(row.totalGrowth)}</td>
                        <td className="px-4 py-2.5 text-[#888]">{pct.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
