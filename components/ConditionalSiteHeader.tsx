'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from './SiteHeader';

export default function ConditionalSiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <SiteHeader />;
}
