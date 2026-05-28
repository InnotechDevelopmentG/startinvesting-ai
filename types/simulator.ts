export type RiskProfile = 'conservative' | 'moderate' | 'growth';
export type Frequency = 'weekly' | 'biweekly' | 'monthly';

export interface SimulatorState {
  age: number;
  startingAmount: number;
  frequency: Frequency;
  contributionAmount: number;
  years: number;
  riskProfile: RiskProfile;
  projectedValue: number;
  savingsBenchmark: number;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Bi-weekly',
  monthly: 'Monthly',
};

export const FREQUENCY_PER_YEAR: Record<Frequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
};

export const RISK_RATES: Record<RiskProfile, number> = {
  conservative: 0.05,
  moderate: 0.07,
  growth: 0.10,
};

export const RISK_LABELS: Record<RiskProfile, string> = {
  conservative: 'The Steady',
  moderate: 'The Builder',
  growth: 'The Accelerator',
};

export const RISK_DESCRIPTIONS: Record<RiskProfile, string> = {
  conservative: '5% — Diversified bond/equity blend',
  moderate: '7% — S&P 500 inflation-adjusted average',
  growth: '10% — S&P 500 nominal 100-year average',
};

export const SAVINGS_RATE = 0.025;

export const DEFAULT_STATE: SimulatorState = {
  age: 28,
  startingAmount: 0,
  frequency: 'monthly',
  contributionAmount: 200,
  years: 37,
  riskProfile: 'moderate',
  projectedValue: 0,
  savingsBenchmark: 0,
};

export const TOTAL_STEPS = 8;
