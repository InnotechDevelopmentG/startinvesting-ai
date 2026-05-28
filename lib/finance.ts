import { Frequency, RiskProfile, FREQUENCY_PER_YEAR, RISK_RATES, SAVINGS_RATE } from '@/types/simulator';

export function periodicRate(annualRate: number, paymentsPerYear: number): number {
  return Math.pow(1 + annualRate, 1 / paymentsPerYear) - 1;
}

export function futureValue(
  principal: number,
  pmt: number,
  annualRate: number,
  paymentsPerYear: number,
  years: number
): number {
  const N = paymentsPerYear * years;
  const i = periodicRate(annualRate, paymentsPerYear);
  const fvLump = principal * Math.pow(1 + i, N);
  const fvAnnuity = i < 1e-10 ? pmt * N : pmt * ((Math.pow(1 + i, N) - 1) / i);
  return fvLump + fvAnnuity;
}

export function calcSeries(
  principal: number,
  pmt: number,
  annualRate: number,
  paymentsPerYear: number,
  years: number
): number[] {
  const arr = [Math.round(principal)];
  for (let y = 1; y <= years; y++) {
    arr.push(Math.round(futureValue(principal, pmt, annualRate, paymentsPerYear, y)));
  }
  return arr;
}

export function calcProjectedValue(
  principal: number,
  contributionAmount: number,
  frequency: Frequency,
  riskProfile: RiskProfile,
  years: number
): number {
  const paymentsPerYear = FREQUENCY_PER_YEAR[frequency];
  const annualRate = RISK_RATES[riskProfile];
  return Math.round(futureValue(principal, contributionAmount, annualRate, paymentsPerYear, years));
}

export function calcSavingsBenchmark(
  principal: number,
  contributionAmount: number,
  frequency: Frequency,
  years: number
): number {
  const paymentsPerYear = FREQUENCY_PER_YEAR[frequency];
  return Math.round(futureValue(principal, contributionAmount, SAVINGS_RATE, paymentsPerYear, years));
}

export function calcTotalContributed(
  principal: number,
  contributionAmount: number,
  frequency: Frequency,
  years: number
): number {
  const paymentsPerYear = FREQUENCY_PER_YEAR[frequency];
  return Math.round(principal + contributionAmount * paymentsPerYear * years);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatCurrencyFull(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}
