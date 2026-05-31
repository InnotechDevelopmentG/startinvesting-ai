export interface FireInputs {
  currentAge: number;
  currentSavings: number;
  monthlyContribution: number;
  annualSpending: number;   // in today's dollars
  annualReturn: number;     // nominal %, e.g. 7
  inflationRate: number;    // %, e.g. 3
  withdrawalRate: number;   // %, e.g. 4
}

export interface YearProjection {
  year: number;
  age: number;
  portfolioValue: number;   // today's dollars (real)
  totalContributed: number; // cumulative cash put in
  totalGrowth: number;      // gain above contributions
  isFIREYear: boolean;
}

export interface FireResult {
  fireNumber: number;
  yearsToFIRE: number | null;
  fireAge: number | null;
  progressPercent: number;
  realAnnualReturnPct: number;
  coastFireNumber: number;
  isCoastFIRE: boolean;
  projections: YearProjection[];
}

// Real monthly return via Fisher equation
function realMonthlyR(nominalAnnualPct: number, inflationPct: number): number {
  const realAnnual = (1 + nominalAnnualPct / 100) / (1 + inflationPct / 100) - 1;
  return Math.pow(1 + realAnnual, 1 / 12) - 1;
}

// Future portfolio value after n months (real dollars)
function fv(pv: number, pmt: number, r: number, n: number): number {
  if (r === 0) return pv + pmt * n;
  return pv * Math.pow(1 + r, n) + pmt * (Math.pow(1 + r, n) - 1) / r;
}

// Analytical months to reach target
function monthsToReach(pv: number, pmt: number, r: number, target: number): number | null {
  if (pv >= target) return 0;
  if (pmt <= 0 && r <= 0) return null;
  if (r === 0) return pmt > 0 ? Math.ceil((target - pv) / pmt) : null;
  // Solve: (pv + pmt/r) * (1+r)^n = target + pmt/r
  const ratio = (target + pmt / r) / (pv + pmt / r);
  if (!isFinite(ratio) || ratio <= 1) return ratio <= 1 ? 0 : null;
  const n = Math.log(ratio) / Math.log(1 + r);
  if (!isFinite(n) || n > 80 * 12) return null;
  return Math.ceil(n);
}

export function calculateFIRE(inputs: FireInputs): FireResult {
  const {
    currentAge, currentSavings, monthlyContribution,
    annualSpending, annualReturn, inflationRate, withdrawalRate,
  } = inputs;

  const fireNumber = annualSpending > 0 && withdrawalRate > 0
    ? Math.round(annualSpending / (withdrawalRate / 100))
    : 0;

  const r = realMonthlyR(annualReturn, inflationRate);
  const realAnnual = Math.pow(1 + r, 12) - 1;
  const realAnnualReturnPct = realAnnual * 100;

  const progressPercent = fireNumber > 0
    ? Math.min((currentSavings / fireNumber) * 100, 100)
    : 0;

  const months = fireNumber > 0
    ? monthsToReach(currentSavings, monthlyContribution, r, fireNumber)
    : 0;
  const yearsToFIRE = months !== null ? months / 12 : null;
  const fireAge = yearsToFIRE !== null ? currentAge + yearsToFIRE : null;

  // Coast FIRE: savings needed now to reach fireNumber at 65 with zero contributions
  const yearsToCoast = Math.max(65 - currentAge, 1);
  const coastFireNumber = fireNumber > 0
    ? Math.round(fireNumber / Math.pow(1 + realAnnual, yearsToCoast))
    : 0;
  const isCoastFIRE = coastFireNumber > 0 && currentSavings >= coastFireNumber;

  // Year-by-year projections (real dollars)
  const maxYears = yearsToFIRE !== null
    ? Math.min(Math.ceil(yearsToFIRE) + 5, 60)
    : Math.min(55, Math.max(30, 65 - currentAge + 5));

  let fireYearMarked = false;
  const projections: YearProjection[] = [];

  for (let yr = 1; yr <= maxYears; yr++) {
    const n = yr * 12;
    const portfolioValue = Math.round(fv(currentSavings, monthlyContribution, r, n));
    const totalContributed = Math.round(currentSavings + monthlyContribution * n);
    const totalGrowth = Math.max(portfolioValue - totalContributed, 0);
    const isFIREYear = !fireYearMarked
      && fireNumber > 0
      && portfolioValue >= fireNumber
      && months !== null;
    if (isFIREYear) fireYearMarked = true;

    projections.push({ year: yr, age: currentAge + yr, portfolioValue, totalContributed, totalGrowth, isFIREYear });
  }

  return {
    fireNumber,
    yearsToFIRE,
    fireAge,
    progressPercent,
    realAnnualReturnPct,
    coastFireNumber,
    isCoastFIRE,
    projections,
  };
}

export function fmtFireFull(n: number): string {
  return '$' + Math.round(n).toLocaleString();
}

export function fmtFireShort(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `$${m >= 10 ? m.toFixed(1) : m.toFixed(2)}M`;
  }
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}
