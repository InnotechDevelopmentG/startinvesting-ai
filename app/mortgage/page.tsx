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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Mortgage Calculator',
  url: 'https://startinvesting.ai/mortgage',
  description: 'Free mortgage calculator showing true monthly payment including taxes, insurance, PMI, and HOA — plus full amortization schedule and extra payment savings.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'startinvesting.ai', url: 'https://startinvesting.ai' },
  featureList: [
    'True monthly payment calculation',
    'PMI calculator with removal date',
    'Property tax and insurance breakdown',
    'Full amortization schedule',
    'Extra payment savings calculator',
    'Loan term comparison',
  ],
};

export default function MortgagePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MortgageCalculator />
    </>
  );
}
