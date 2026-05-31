'use client';

import { useState, useMemo, useRef } from 'react';
import {
  calculateMortgage,
  buildAmortizationSchedule,
  formatMortgageDollar,
  shortDollar,
  MortgageInputs,
} from '@/lib/mortgage';
import EmailCaptureModal from './EmailCaptureModal';
import Tooltip from './Tooltip';
import ShareButton from './ShareButton';

const TERM_OPTIONS = [10, 15, 20, 25, 30];

const DEFAULTS: MortgageInputs = {
  homePrice: 400000,
  downPayment: 80000,
  annualRate: 6.875,
  termYears: 30,
  annualPropertyTax: 4400,
  annualInsurance: 1800,
  monthlyHOA: 0,
  pmiRate: 0.85,
  extraMonthlyPayment: 0,
};

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function fmtInt(n: number): string {
  return n > 0 ? Math.round(n).toLocaleString() : '';
}

function fmtDec(n: number, decimals = 3): string {
  return n > 0 ? n.toFixed(decimals) : '';
}

// ── Donut chart ─────────────────────────────────────────────────────────────
interface Segment { label: string; value: number; color: string }

function DonutChart({ segments, centerLabel, centerValue }: {
  segments: Segment[];
  centerLabel: string;
  centerValue: string;
}) {
  const r = 52;
  const sw = 18;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (total === 0) return null;

  let cum = 0;
  return (
    <svg viewBox="0 0 128 128" style={{ width: '100%', maxWidth: 180 }}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="#f3f4f6" strokeWidth={sw} />
      {segments.filter(s => s.value > 0).map((seg) => {
        const frac = seg.value / total;
        const len = frac * C;
        const offset = C / 4 - cum;
        cum += len;
        return (
          <circle
            key={seg.label}
            cx="64" cy="64" r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={sw}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease' }}
          />
        );
      })}
      <text x="64" y="58" textAnchor="middle" fill="#888" fontSize="9" fontFamily="inherit" fontWeight="500" letterSpacing="0.5">
        {centerLabel.toUpperCase()}
      </text>
      <text x="64" y="74" textAnchor="middle" fill="#111" fontSize="14" fontFamily="inherit" fontWeight="700">
        {centerValue}
      </text>
    </svg>
  );
}

// ── Number input ─────────────────────────────────────────────────────────────
function NumInput({
  label, value, onChange, prefix, suffix, hint, tooltip, inputMode = 'numeric', step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  tooltip?: string;
  inputMode?: 'numeric' | 'decimal';
  step?: string;
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

// ── Main component ────────────────────────────────────────────────────────────
export default function MortgageCalculator() {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULTS);
  const [showAmortization, setShowAmortization] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const touchedFields = useRef(new Set<string>());

  // String states for controlled inputs
  const [homePriceStr, setHomePriceStr] = useState(fmtInt(DEFAULTS.homePrice));
  const [dpDollarStr, setDpDollarStr] = useState(fmtInt(DEFAULTS.downPayment));
  const [dpPercentStr, setDpPercentStr] = useState('20.000');
  const [rateStr, setRateStr] = useState(fmtDec(DEFAULTS.annualRate, 3));
  const [taxStr, setTaxStr] = useState(fmtInt(DEFAULTS.annualPropertyTax));
  const [insuranceStr, setInsuranceStr] = useState(fmtInt(DEFAULTS.annualInsurance));
  const [hoaStr, setHoaStr] = useState('');
  const [pmiStr, setPmiStr] = useState(fmtDec(DEFAULTS.pmiRate, 2));
  const [extraStr, setExtraStr] = useState('');

  const isUpdating = useRef(false);

  function trackField(name: string) {
    if (typeof window !== 'undefined' && localStorage.getItem('early_capture_email')) return;
    if (showModal) return;
    touchedFields.current.add(name);
    if (touchedFields.current.size >= 2) setShowModal(true);
  }

  function updateInputs(patch: Partial<MortgageInputs>) {
    setInputs(prev => ({ ...prev, ...patch }));
  }

  // Home price change — keep percent, update dollar
  function onHomePriceChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    setHomePriceStr(digits ? parseInt(digits).toLocaleString() : '');
    const hp = parseInt(digits) || 0;
    if (!isUpdating.current) {
      isUpdating.current = true;
      const pct = inputs.homePrice > 0 ? (inputs.downPayment / inputs.homePrice) * 100 : 20;
      const newDp = Math.round((pct / 100) * hp);
      setDpDollarStr(newDp > 0 ? newDp.toLocaleString() : '');
      setDpPercentStr(pct > 0 ? pct.toFixed(3) : '');
      updateInputs({ homePrice: hp, downPayment: newDp });
      isUpdating.current = false;
    }
    trackField('homePrice');
  }

  function onDpDollarChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    setDpDollarStr(digits ? parseInt(digits).toLocaleString() : '');
    const dp = parseInt(digits) || 0;
    const hp = inputs.homePrice;
    const pct = hp > 0 ? (dp / hp) * 100 : 0;
    setDpPercentStr(pct > 0 ? pct.toFixed(3) : '');
    updateInputs({ downPayment: dp });
    trackField('downPayment');
  }

  function onDpPercentChange(v: string) {
    const clean = v.replace(/[^0-9.]/g, '');
    setDpPercentStr(clean);
    const pct = parseFloat(clean) || 0;
    const dp = Math.round((pct / 100) * inputs.homePrice);
    setDpDollarStr(dp > 0 ? dp.toLocaleString() : '');
    updateInputs({ downPayment: dp });
    trackField('downPayment');
  }

  function onRateChange(v: string) {
    const clean = v.replace(/[^0-9.]/g, '');
    setRateStr(clean);
    updateInputs({ annualRate: parseFloat(clean) || 0 });
    trackField('rate');
  }

  function onTaxChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    setTaxStr(digits ? parseInt(digits).toLocaleString() : '');
    updateInputs({ annualPropertyTax: parseInt(digits) || 0 });
  }

  function onInsuranceChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    setInsuranceStr(digits ? parseInt(digits).toLocaleString() : '');
    updateInputs({ annualInsurance: parseInt(digits) || 0 });
  }

  function onHoaChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    setHoaStr(digits ? parseInt(digits).toLocaleString() : '');
    updateInputs({ monthlyHOA: parseInt(digits) || 0 });
  }

  function onPmiChange(v: string) {
    const clean = v.replace(/[^0-9.]/g, '');
    setPmiStr(clean);
    updateInputs({ pmiRate: parseFloat(clean) || 0 });
  }

  function onExtraChange(v: string) {
    const digits = v.replace(/[^0-9]/g, '');
    setExtraStr(digits ? parseInt(digits).toLocaleString() : '');
    updateInputs({ extraMonthlyPayment: parseInt(digits) || 0 });
  }

  const result = useMemo(() => calculateMortgage(inputs), [inputs]);
  const amortization = useMemo(
    () => showAmortization ? buildAmortizationSchedule(inputs) : [],
    [showAmortization, inputs]
  );

  const shareText = useMemo(() =>
    `🏠 Just ran my mortgage numbers: ${formatMortgageDollar(result.totalMonthly)}/mo total payment, ${formatMortgageDollar(result.totalInterest)} in interest over ${inputs.termYears} years. Eye-opening. See yours:`,
    [result.totalMonthly, result.totalInterest, inputs.termYears]
  );

  // Donut segments
  const segments: Segment[] = [
    { label: 'Principal & Interest', value: result.monthlyPI, color: '#00C896' },
    { label: 'Property Tax', value: result.monthlyTax, color: '#6366f1' },
    { label: 'Insurance', value: result.monthlyInsurance, color: '#f59e0b' },
    ...(result.monthlyPMI > 0 ? [{ label: 'PMI', value: result.monthlyPMI, color: '#ef4444' }] : []),
    ...(result.monthlyHOA > 0 ? [{ label: 'HOA', value: result.monthlyHOA, color: '#8b5cf6' }] : []),
  ];

  function monthsToYearsStr(months: number): string {
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    if (mos === 0) return `${yrs} yr${yrs !== 1 ? 's' : ''}`;
    return `${yrs} yr${yrs !== 1 ? 's' : ''} ${mos} mo`;
  }

  const pmiRemovalDate = result.pmiRemovalMonth
    ? new Date(Date.now() + result.pmiRemovalMonth * 30 * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-10">

      {showModal && (
        <EmailCaptureModal
          source="mortgage"
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold text-[#00C896] uppercase tracking-[0.15em] mb-2">Calculator</p>
        <h1 className="text-[32px] md:text-[40px] font-medium text-[#111] leading-tight tracking-tight mb-2">
          Mortgage Calculator
        </h1>
        <p className="text-[15px] text-[#888]">
          See your true monthly payment including taxes, insurance, and PMI — plus full amortization schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">

        {/* ── LEFT: Inputs ── */}
        <div className="flex flex-col gap-6">

          {/* Core inputs */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Loan Details</p>

            {/* Home price */}
            <NumInput
              label="Home Price"
              value={homePriceStr}
              onChange={onHomePriceChange}
              prefix="$"
              tooltip="The purchase price of the home. Closing costs (typically 2–5% extra) are not included here — budget for those separately."
            />

            {/* Down payment */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <label className="text-[12px] font-medium text-[#555] uppercase tracking-wider">Down Payment</label>
                <Tooltip content="More down = lower monthly payment. Hit 20% to avoid PMI, which can cost $100–300/month. Less than 20% means you're paying extra to protect the lender, not yourself." />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-3 py-2.5 focus-within:border-[#00C896] transition-colors">
                  <span className="text-[14px] text-[#aaa] mr-1.5">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={dpDollarStr}
                    onChange={e => onDpDollarChange(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-[15px] text-[#111] outline-none min-w-0"
                  />
                </div>
                <div className="flex items-center bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-3 py-2.5 focus-within:border-[#00C896] transition-colors">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={dpPercentStr}
                    onChange={e => onDpPercentChange(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent text-[15px] text-[#111] outline-none min-w-0"
                  />
                  <span className="text-[14px] text-[#aaa] ml-1.5">%</span>
                </div>
              </div>
              {result.requiresPMI && (
                <p className="text-[11px] text-[#ef4444] mt-0.5">
                  Less than 20% down — PMI applies ({inputs.pmiRate}%/yr)
                </p>
              )}
              {!result.requiresPMI && (
                <p className="text-[11px] text-[#00C896] mt-0.5">
                  ✓ 20%+ down — no PMI required
                </p>
              )}
            </div>

            {/* Interest rate */}
            <NumInput
              label="Interest Rate (APR)"
              value={rateStr}
              onChange={onRateChange}
              suffix="%"
              inputMode="decimal"
              hint="Current 30-yr national avg ~6.8%"
              tooltip="Your Annual Percentage Rate. Even 0.5% lower saves tens of thousands over the life of the loan. Shop at least 3 lenders — rates vary more than most people realize."
            />

            {/* Loan term */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-[12px] font-medium text-[#555] uppercase tracking-wider">Loan Term</label>
                <Tooltip content="Shorter term = higher monthly payment but dramatically less total interest. A 15-year vs 30-year loan can save $150K+ in interest on a $400K home." />
              </div>
              <div className="flex gap-2 flex-wrap">
                {TERM_OPTIONS.map(yr => (
                  <button
                    key={yr}
                    onClick={() => updateInputs({ termYears: yr })}
                    className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${
                      inputs.termYears === yr
                        ? 'bg-[#111] text-white'
                        : 'bg-[#f3f4f6] text-[#555] hover:bg-[#e5e7eb]'
                    }`}
                  >
                    {yr} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly costs */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6 flex flex-col gap-5">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Monthly Costs</p>

            <NumInput
              label="Annual Property Tax"
              value={taxStr}
              onChange={onTaxChange}
              prefix="$"
              hint={`${inputs.homePrice > 0 ? ((inputs.annualPropertyTax / inputs.homePrice) * 100).toFixed(2) : '0.00'}% of home value · US avg ~1.1%`}
              tooltip="Varies significantly by state and county. New Jersey averages ~2.2%, Hawaii ~0.3%. Check your county assessor's website or ask your realtor for a real number."
            />

            <NumInput
              label="Homeowner's Insurance"
              value={insuranceStr}
              onChange={onInsuranceChange}
              prefix="$"
              hint="Per year · US avg ~$1,800/yr"
              tooltip="Required by your lender. Covers fire, theft, and liability. Varies by location, home value, and coverage level. Get multiple quotes — prices vary widely."
            />

            <NumInput
              label="HOA Fees (monthly)"
              value={hoaStr}
              onChange={onHoaChange}
              prefix="$"
              hint="Leave blank if no HOA"
              tooltip="Homeowners Association fees. Common in condos and planned communities. Read the HOA docs carefully before buying — special assessments can add thousands unexpectedly."
            />

            {result.requiresPMI && (
              <NumInput
                label="PMI Rate"
                value={pmiStr}
                onChange={onPmiChange}
                suffix="%/yr"
                inputMode="decimal"
                hint="Typically 0.5–1.5% · Drops off when LTV reaches 80%"
                tooltip="Private Mortgage Insurance protects the lender (not you) when your down payment is under 20%. It drops off automatically once you hit 80% LTV. The faster you build equity, the sooner it's gone."
              />
            )}
          </div>

          {/* Extra payment */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6 flex flex-col gap-5">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-1">Extra Monthly Payment</p>
              <p className="text-[12px] text-[#aaa]">See how much time and interest you save by paying extra each month.</p>
            </div>
            <NumInput
              label="Extra Payment"
              value={extraStr}
              onChange={onExtraChange}
              prefix="$"
              hint="Added to principal each month"
            />
            {result.interestSavedWithExtra !== null && result.interestSavedWithExtra > 0 && (
              <div className="bg-[#E6FAF5] border border-[#c3f0e2] rounded-xl px-4 py-3 flex flex-col gap-1">
                <p className="text-[12px] font-semibold text-[#00C896]">With {formatMortgageDollar(inputs.extraMonthlyPayment)}/mo extra:</p>
                <p className="text-[13px] text-[#111]">
                  Pay off <strong>{result.monthsSavedWithExtra} months early</strong> ({monthsToYearsStr(result.monthsSavedWithExtra!)})
                </p>
                <p className="text-[13px] text-[#111]">
                  Save <strong>{formatMortgageDollar(result.interestSavedWithExtra)} in interest</strong>
                </p>
                <p className="text-[12px] text-[#888]">
                  Payoff: {monthsToYearsStr(result.payoffMonthsWithExtra!)} instead of {monthsToYearsStr(result.payoffMonths)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="flex flex-col gap-5">

          {/* Monthly payment card */}
          <div className="bg-[#111] rounded-2xl p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#00C896] mb-1">Total Monthly Payment</p>
            <p
              className="font-tabular leading-none mb-1"
              style={{ fontSize: '48px', fontWeight: 700, letterSpacing: '-2px' }}
            >
              {formatMortgageDollar(result.totalMonthly)}
            </p>
            <p className="text-[13px] text-[#888]">
              {inputs.termYears}-year fixed · {inputs.annualRate.toFixed(3)}% APR
            </p>
          </div>

          {/* Share */}
          <ShareButton
            text={shareText}
            url="https://startinvesting.ai/mortgage"
          />

          {/* Donut + breakdown */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-4">Payment Breakdown</p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-[140px] mx-auto sm:mx-0">
                <DonutChart
                  segments={segments}
                  centerLabel="monthly"
                  centerValue={formatMortgageDollar(result.totalMonthly)}
                />
              </div>
              <div className="flex flex-col gap-2.5 flex-1 min-w-0">
                {segments.map(seg => (
                  <div key={seg.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="text-[12px] text-[#666]">{seg.label}</span>
                    </div>
                    <span className="text-[13px] font-medium text-[#111] flex-shrink-0">
                      {formatMortgageDollar(seg.value)}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary numbers */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
            <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-4">Loan Summary</p>
            <div className="flex flex-col divide-y divide-[#f3f4f6]">
              {[
                { label: 'Home Price', value: formatMortgageDollar(inputs.homePrice) },
                { label: 'Down Payment', value: `${formatMortgageDollar(inputs.downPayment)} (${result.downPaymentPercent.toFixed(1)}%)` },
                { label: 'Loan Amount', value: formatMortgageDollar(result.principal) },
                { label: 'Total Interest', value: formatMortgageDollar(result.totalInterest), highlight: true },
                { label: 'Total Cost of Home', value: formatMortgageDollar(result.totalCost), bold: true },
                { label: 'LTV Ratio', value: `${(result.ltvRatio * 100).toFixed(1)}%` },
                ...(result.requiresPMI && pmiRemovalDate ? [{ label: 'PMI Removed', value: pmiRemovalDate }] : []),
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2.5">
                  <span className="text-[13px] text-[#666]">{row.label}</span>
                  <span className={`text-[13px] ${row.bold ? 'font-semibold text-[#111]' : row.highlight ? 'text-[#ef4444]' : 'text-[#111]'}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* LTV visual */}
          <div className="bg-white border border-[#f3f4f6] rounded-2xl p-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa]">Equity vs. Loan</p>
              <p className="text-[12px] text-[#888]">{result.downPaymentPercent.toFixed(1)}% equity at close</p>
            </div>
            <div className="h-3 rounded-full bg-[#f3f4f6] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00C896] transition-all duration-500"
                style={{ width: `${Math.min(100 - result.ltvRatio * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#aaa] mt-1.5">
              <span>Your equity: {formatMortgageDollar(inputs.downPayment)}</span>
              <span>Loan: {formatMortgageDollar(result.principal)}</span>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-[#bbb] leading-relaxed px-1">
            Estimates only. Actual costs vary by lender, credit score, and location.
            Not financial advice — consult a licensed mortgage professional.
          </p>
        </div>
      </div>

      {/* ── Amortization Schedule ── */}
      <div className="mt-8">
        <button
          onClick={() => setShowAmortization(v => !v)}
          className="flex items-center gap-2 text-[14px] font-medium text-[#555] hover:text-[#111] transition-colors mb-4"
        >
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: showAmortization ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {showAmortization ? 'Hide' : 'Show'} amortization schedule
        </button>

        {showAmortization && (
          <div className="bg-white border border-[#f3f4f6] rounded-2xl overflow-hidden">
            {/* Balance chart */}
            <div className="p-6 border-b border-[#f3f4f6]">
              <p className="text-[12px] font-semibold uppercase tracking-widest text-[#aaa] mb-4">Remaining Balance by Year</p>
              <div className="flex flex-col gap-1.5">
                {amortization.map(row => {
                  const pct = inputs.homePrice > 0 ? (row.endBalance / inputs.homePrice) * 100 : 0;
                  const equityPct = 100 - pct;
                  return (
                    <div key={row.year} className="flex items-center gap-3">
                      <span className="text-[11px] text-[#aaa] w-10 flex-shrink-0">Yr {row.year}</span>
                      <div className="flex-1 h-3.5 rounded-full bg-[#f3f4f6] overflow-hidden flex">
                        <div
                          className="h-full bg-[#00C896] rounded-full transition-all duration-300"
                          style={{ width: `${equityPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-[#888] w-16 text-right flex-shrink-0">
                        {shortDollar(row.endBalance)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#f3f4f6]">
                    {['Year', 'Beginning Balance', 'Principal', 'Interest', 'Ending Balance', 'Cumulative Interest'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#aaa]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {amortization.map((row, i) => (
                    <tr key={row.year} className={i % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white'}>
                      <td className="px-4 py-2.5 font-medium text-[#111]">{row.year}</td>
                      <td className="px-4 py-2.5 text-[#555]">{formatMortgageDollar(row.startBalance)}</td>
                      <td className="px-4 py-2.5 text-[#00C896] font-medium">{formatMortgageDollar(row.principalPaid)}</td>
                      <td className="px-4 py-2.5 text-[#ef4444]">{formatMortgageDollar(row.interestPaid)}</td>
                      <td className="px-4 py-2.5 text-[#555]">{formatMortgageDollar(row.endBalance)}</td>
                      <td className="px-4 py-2.5 text-[#888]">{formatMortgageDollar(row.cumulativeInterest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
