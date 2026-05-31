import type { Metadata } from 'next';
import Simulator from '@/components/Simulator';
import HeroSection from '@/components/HeroSection';

export const metadata: Metadata = {
  title: 'Investment Simulator — startinvesting.ai',
  description: 'Free investment simulator that projects your portfolio growth based on your age, contributions, timeline, and risk profile. Built on real S&P 500 data. No sign-up required.',
  alternates: { canonical: 'https://startinvesting.ai' },
  openGraph: {
    title: 'Investment Simulator — startinvesting.ai',
    description: 'See exactly how much your investments could grow. Free, no sign-up required.',
    url: 'https://startinvesting.ai',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Investment Simulator',
  url: 'https://startinvesting.ai',
  description: 'Free investment simulator that projects portfolio growth based on age, contributions, timeline, and risk profile using real S&P 500 historical data.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'startinvesting.ai', url: 'https://startinvesting.ai' },
  featureList: [
    'Portfolio growth projection',
    'Risk-adjusted return modeling',
    'S&P 500 historical data',
    'Weekly, biweekly, monthly contributions',
    'Retirement timeline calculator',
    'Free personalized investing plan',
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSection />
      <Simulator />
    </>
  );
}
