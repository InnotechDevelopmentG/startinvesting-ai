import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'startinvesting.ai — Investment Growth Simulator',
  description:
    'See exactly how much your money could grow. A free, guided investment simulator built on real historical data.',
  openGraph: {
    title: 'startinvesting.ai — Investment Growth Simulator',
    description: 'See exactly how much your money could grow.',
    url: 'https://startinvesting.ai',
    siteName: 'startinvesting.ai',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
