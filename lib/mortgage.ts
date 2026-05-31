export interface MortgageInputs {
  homePrice: number;
  downPayment: number;       // dollar amount
  annualRate: number;        // e.g. 6.875
  termYears: number;
  annualPropertyTax: number; // dollars/year
  annualInsurance: number;   // dollars/year
  monthlyHOA: number;
  pmiRate: number;           // e.g. 0.85 (percent per year)
  extraMonthlyPayment: number;
}

export interface MortgageResult {
  principal: number;
  downPaymentPercent: number;
  monthlyPI: number;
  monthlyPMI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  totalMonthly: number;
  totalInterest: number;
  totalCost: number;
  ltvRatio: number;
  requiresPMI: boolean;
  pmiRemovalMonth: number | null;
  payoffMonths: number;
  payoffMonthsWithExtra: number | null;
  interestSavedWithExtra: number | null;
  monthsSavedWithExtra: number | null;
}

export interface AmortizationYear {
  year: number;
  startBalance: number;
  principalPaid: number;
  interestPaid: number;
  endBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

function monthlyPayment(principal: number, monthlyRate: number, numPayments: number): number {
  if (principal <= 0) return 0;
  if (monthlyRate === 0) return principal / numPayments;
  return (
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

export function calculateMortgage(inputs: MortgageInputs): MortgageResult {
  const { homePrice, downPayment, annualRate, termYears, annualPropertyTax, annualInsurance, monthlyHOA, pmiRate, extraMonthlyPayment } = inputs;

  const principal = Math.max(homePrice - downPayment, 0);
  const downPaymentPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  const ltvRatio = homePrice > 0 ? principal / homePrice : 0;

  const monthlyPI = monthlyPayment(principal, monthlyRate, numPayments);
  const requiresPMI = ltvRatio > 0.8;
  const monthlyPMI = requiresPMI ? (principal * (pmiRate / 100)) / 12 : 0;
  const monthlyTax = annualPropertyTax / 12;
  const monthlyInsurance = annualInsurance / 12;
  const totalMonthly = monthlyPI + monthlyPMI + monthlyTax + monthlyInsurance + monthlyHOA;
  const totalInterest = monthlyPI * numPayments - principal;
  const totalCost = homePrice + Math.max(totalInterest, 0);

  // PMI removal: when balance reaches 80% LTV
  let pmiRemovalMonth: number | null = null;
  if (requiresPMI && monthlyRate > 0) {
    let balance = principal;
    const pmiThreshold = homePrice * 0.80;
    for (let m = 1; m <= numPayments; m++) {
      const interest = balance * monthlyRate;
      const principalPmt = monthlyPI - interest;
      balance -= principalPmt;
      if (balance <= pmiThreshold) {
        pmiRemovalMonth = m;
        break;
      }
    }
  }

  // Extra payment payoff
  let payoffMonthsWithExtra: number | null = null;
  let interestSavedWithExtra: number | null = null;
  let monthsSavedWithExtra: number | null = null;
  if (extraMonthlyPayment > 0 && principal > 0 && monthlyRate > 0) {
    let balance = principal;
    let months = 0;
    let totalInterestExtra = 0;
    while (balance > 0.01 && months < numPayments * 2) {
      const interest = balance * monthlyRate;
      totalInterestExtra += interest;
      const payment = Math.min(monthlyPI + extraMonthlyPayment, balance + interest);
      balance = balance + interest - payment;
      months++;
    }
    payoffMonthsWithExtra = months;
    interestSavedWithExtra = Math.max(totalInterest - totalInterestExtra, 0);
    monthsSavedWithExtra = numPayments - months;
  }

  return {
    principal,
    downPaymentPercent,
    monthlyPI,
    monthlyPMI,
    monthlyTax,
    monthlyInsurance,
    monthlyHOA,
    totalMonthly,
    totalInterest: Math.max(totalInterest, 0),
    totalCost,
    ltvRatio,
    requiresPMI,
    pmiRemovalMonth,
    payoffMonths: numPayments,
    payoffMonthsWithExtra,
    interestSavedWithExtra,
    monthsSavedWithExtra,
  };
}

export function buildAmortizationSchedule(inputs: MortgageInputs): AmortizationYear[] {
  const { homePrice, downPayment, annualRate, termYears } = inputs;
  const principal = Math.max(homePrice - downPayment, 0);
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  const mPmt = monthlyPayment(principal, monthlyRate, numPayments);

  const years: AmortizationYear[] = [];
  let balance = principal;
  let cumInterest = 0;
  let cumPrincipal = 0;

  for (let y = 1; y <= termYears; y++) {
    const startBalance = balance;
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 0; m < 12; m++) {
      if (balance <= 0.01) break;
      const interest = balance * monthlyRate;
      const principalPmt = Math.min(mPmt - interest, balance);
      yearInterest += interest;
      yearPrincipal += principalPmt;
      balance -= principalPmt;
    }

    cumInterest += yearInterest;
    cumPrincipal += yearPrincipal;

    years.push({
      year: y,
      startBalance: Math.round(startBalance),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      endBalance: Math.max(Math.round(balance), 0),
      cumulativeInterest: Math.round(cumInterest),
      cumulativePrincipal: Math.round(cumPrincipal),
    });

    if (balance <= 0.01) break;
  }

  return years;
}

export function formatMortgageDollar(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function shortDollar(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n).toLocaleString()}`;
}
