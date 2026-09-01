'use client';

import { useState } from 'react';

const EMAIL = 'bysetton+dogfriendlyfeasts@gmail.com';

export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button className="copy-email" onClick={handleClick}>
      {EMAIL}
      <span className="copy-email__label">{copied ? 'Copied!' : 'Copy'}</span>
    </button>
  );
}
