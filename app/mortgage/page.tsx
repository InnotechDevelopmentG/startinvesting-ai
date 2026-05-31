import type { Metadata } from 'next';
import MortgageCalculator from '@/components/MortgageCalculator';

export const metadata: Metadata = {
  title: 'Mortgage Calculator — startinvesting.ai',
  description:
    'Free mortgage calculator with PMI, property tax, insurance, HOA, amortization schedule, and extra payment savings. See your true monthly payment and total cost.',
  alternates: { canonical: 'https://startinvesting.ai/mortgage' },
  openGraph: {
    title: 'Mortgage Calculator — startinvesting.ai',
    description: 'See your true monthly payment, total interest, and full amortization schedule.',
    url: 'https://startinvesting.ai/mortgage',
    type: 'website',
  },
};

export default function MortgagePage() {
  return <MortgageCalculator />;
}
