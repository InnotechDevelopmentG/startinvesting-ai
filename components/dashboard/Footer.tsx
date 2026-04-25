import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#1F1F22] mt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8 flex flex-col items-center gap-2 text-center">
        <p className="text-[11px] text-white/25 font-mono">
          © {new Date().getFullYear()} strikewhileitshot.com
        </p>
        <p className="text-[11px] text-white/25 max-w-md leading-relaxed">
          Not investment advice. AI summaries may contain errors. Quote data via Finnhub.
        </p>
        <div className="flex items-center gap-4 mt-1">
          {[
            { href: "/about", label: "About" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
          ].map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
