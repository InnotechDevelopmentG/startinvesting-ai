import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#00C896',
};

export const metadata: Metadata = {
  title: 'startinvesting.ai — Investment Growth Simulator',
  description:
    'See exactly how much your money could grow. A free, guided investment simulator built on real historical S&P 500 data. Takes 2 minutes.',
  metadataBase: new URL('https://startinvesting.ai'),
  alternates: {
    canonical: 'https://startinvesting.ai',
  },
  openGraph: {
    title: 'startinvesting.ai — Investment Growth Simulator',
    description: 'See exactly how much your money could grow. Free. Takes 2 minutes.',
    url: 'https://startinvesting.ai',
    siteName: 'startinvesting.ai',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'startinvesting.ai — Investment Growth Simulator',
    description: 'See exactly how much your money could grow. Free. Takes 2 minutes.',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
