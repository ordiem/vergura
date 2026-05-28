"use client";

import { useState } from "react";

export function ReportActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 bg-ivory px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-ink transition-colors duration-300 hover:bg-champagne"
      >
        Download PDF
      </button>
      <button
        type="button"
        onClick={copyLink}
        aria-label={`Copy link to ${title}`}
        className="inline-flex items-center gap-2 border border-[rgba(191,164,106,0.5)] px-5 py-2.5 font-sans text-[0.72rem] uppercase tracking-[0.16em] text-champagne transition-all duration-300 hover:border-gold hover:bg-[rgba(191,164,106,0.07)]"
      >
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
    </div>
  );
}
