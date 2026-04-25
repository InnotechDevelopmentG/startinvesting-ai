"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SignupModal } from "./SignupModal";
import { cn } from "@/lib/cn";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [elapsed, setElapsed] = useState(14);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => (e >= 60 ? 1 : e + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#1F1F22] bg-[#0A0A0B]/90 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center shrink-0">
            <span className="font-mono text-white font-bold text-sm sm:text-base tracking-tight italic">
              strike while it&apos;s hot
            </span>
          </a>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live status pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#1F1F22] bg-[#141416] text-[11px] text-white/50 font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16C784] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16C784]" />
              </span>
              Live · {elapsed}s ago
            </div>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-1.5 rounded-lg border border-[#1F1F22] bg-[#141416] text-white/50 hover:text-white hover:border-white/20 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* CTA */}
            <button
              onClick={() => setModalOpen(true)}
              className={cn(
                "text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg",
                "bg-white text-black hover:bg-white/90 transition-colors"
              )}
            >
              Get the daily brief
            </button>
          </div>
        </div>
      </header>

      <SignupModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
