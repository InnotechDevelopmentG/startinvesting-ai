import type { Metadata } from 'next';
import FireCalculator from '@/components/FireCalculator';

export const metadata: Metadata = {
  title: 'FIRE Calculator — startinvesting.ai',
  description:
    'Calculate your FIRE number, years to financial independence, and Coast FIRE milestone. Uses real inflation-adjusted returns based on the Trinity Study 4% rule.',
  alternates: { canonical: 'https://startinvesting.ai/fire' },
  openGraph: {
    title: 'FIRE Calculator — startinvesting.ai',
    description: 'Find your Financial Independence number and exactly how long it takes to get there.',
    url: 'https://startinvesting.ai/fire',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'FIRE Calculator',
  url: 'https://startinvesting.ai/fire',
  description: 'Free FIRE calculator that finds your financial independence number, years to retirement, and Coast FIRE milestone using real inflation-adjusted returns.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'startinvesting.ai', url: 'https://startinvesting.ai' },
  featureList: [
    'FIRE number calculator',
    'Coast FIRE calculator',
    'Real inflation-adjusted returns',
    'Year-by-year projection chart',
    'What-if scenario analysis',
    '4% rule withdrawal rate',
  ],
};

export default function FirePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FireCalculator />
    </>
  );
}
