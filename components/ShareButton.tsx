'use client';

import { useState } from 'react';

interface ShareButtonProps {
  text: string;
  url: string;
}

export default function ShareButton({ text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  async function handleShare() {
    // Native share sheet — works great on iOS/Android
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: `${text}\n${url}` });
        return;
      } catch {
        // User cancelled or API not available — fall through
      }
    }
    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked — show inline hint to use Post button instead
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 3000);
    }
  }

  function openPost() {
    const fullText = `${text} ${url}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=400'
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
      {/* Primary share / copy */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 bg-[#f3f4f6] text-[#111] hover:bg-[#e5e7eb] active:scale-[0.97]"
      >
        {copied ? (
          <>
            <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
              <path d="M1 4.5L4.5 8.5L12 1" stroke="#00C896" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[#00C896]">Copied!</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4.3 6.2L9.7 3.3M4.3 7.8L9.7 10.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Share results
          </>
        )}
      </button>

      {/* Post on X */}
      <button
        onClick={openPost}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-black text-white hover:bg-[#222] active:scale-[0.97] transition-all duration-200"
      >
        <svg width="13" height="13" viewBox="0 0 1200 1227" fill="none">
          <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.163 519.284ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.828Z" fill="white"/>
        </svg>
        Post
      </button>
    </div>
      {copyFailed && (
        <p className="text-[11px] text-[#888]">Couldn&apos;t copy — use Post to share on X instead.</p>
      )}
    </div>
  );
}
