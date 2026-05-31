'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const NAV_LINKS = [
  { label: 'Investment Simulator', href: '/' },
  { label: 'Mortgage Calculator', href: '/mortgage' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
];

export default function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header
        className="sticky top-0 z-40 bg-white border-b border-[#f3f4f6]"
        style={{ height: '64px' }}
      >
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6 md:px-10">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size={28} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors
                  ${pathname === href
                    ? 'text-[#111] bg-[#f3f4f6]'
                    : 'text-[#888] hover:text-[#111] hover:bg-[#f9f9f9]'
                  }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right — Login */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin/login"
              className="px-4 py-2 rounded-lg text-[14px] font-medium border border-[#e5e7eb] text-[#555] hover:border-[#00C896] hover:text-[#00C896] transition-colors"
            >
              Login
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-[14px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
            >
              Get started →
            </Link>
          </div>

          {/* Mobile — hamburger */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors"
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 bg-[#555] rounded-full transition-all duration-200"
              style={mobileMenuOpen ? { transform: 'rotate(45deg) translateY(6px)' } : {}}
            />
            <span
              className="block w-5 h-0.5 bg-[#555] rounded-full transition-all duration-200"
              style={mobileMenuOpen ? { opacity: 0 } : {}}
            />
            <span
              className="block w-5 h-0.5 bg-[#555] rounded-full transition-all duration-200"
              style={mobileMenuOpen ? { transform: 'rotate(-45deg) translateY(-6px)' } : {}}
            />
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/20"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-[64px] left-0 right-0 z-30 bg-white border-b border-[#f3f4f6] shadow-sm">
            <div className="px-6 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-[15px] font-medium transition-colors
                    ${pathname === href ? 'text-[#111] bg-[#f3f4f6]' : 'text-[#555] hover:bg-[#f9f9f9]'}`}
                >
                  {label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2 pb-1">
                <Link
                  href="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center rounded-xl text-[14px] font-medium border border-[#e5e7eb] text-[#555] hover:border-[#00C896] hover:text-[#00C896] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-3 text-center rounded-xl text-[14px] font-medium bg-[#00C896] text-white hover:bg-[#00b386] transition-colors"
                >
                  Get started →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
