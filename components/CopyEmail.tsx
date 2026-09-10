'use client';

import { useState } from 'react';

const EMAIL = 'bysetton+dogworldweb@gmail.com';

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      className="inline-flex items-center gap-2.5 bg-white/6 border border-white/12 rounded-lg px-3.5 py-2 text-sm text-fg-soft cursor-pointer transition-[background,color] duration-150 hover:bg-white/10 hover:text-fg"
      onClick={handleClick}
    >
      {EMAIL}
      <span className="text-[11px] font-semibold text-fg-muted bg-white/8 rounded px-1.75 py-0.5 shrink-0">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}
