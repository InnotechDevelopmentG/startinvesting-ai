'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(true);
  const btnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click/tap
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [open]);

  function checkPosition() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setAbove(rect.top > 180);
    }
  }

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        ref={btnRef}
        type="button"
        onMouseEnter={() => { checkPosition(); setOpen(true); }}
        onMouseLeave={() => setOpen(false)}
        onClick={() => { checkPosition(); setOpen(v => !v); }}
        className="w-[15px] h-[15px] rounded-full bg-[#e5e7eb] text-[#999] text-[9px] font-bold flex items-center justify-center hover:bg-[#d1d5db] hover:text-[#555] transition-colors flex-shrink-0 leading-none"
        aria-label="More info"
      >
        ?
      </button>

      {open && (
        <div
          className={`absolute left-1/2 -translate-x-1/2 z-50 w-56 bg-[#1a1a1a] text-white text-[12px] leading-relaxed rounded-xl px-3.5 py-2.5 shadow-2xl pointer-events-none ${
            above ? 'bottom-full mb-2.5' : 'top-full mt-2.5'
          }`}
          style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.25))' }}
        >
          {content}
          {/* Arrow */}
          {above ? (
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#1a1a1a]" />
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-[#1a1a1a]" />
          )}
        </div>
      )}
    </div>
  );
}
