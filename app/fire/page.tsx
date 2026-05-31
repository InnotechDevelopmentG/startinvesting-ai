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

export default function FirePage() {
  return <FireCalculator />;
}
