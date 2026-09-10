'use client';

import { useEffect, useRef } from 'react';

const OPTIONS = [
  { label: 'R50',   href: 'https://express.stitch.money/barak/50/dog-world' },
  { label: 'R100',  href: 'https://express.stitch.money/barak/100/dog-world' },
  { label: 'other', href: 'https://express.stitch.money/barak' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SupportSticker({ open, onClose }: Props) {
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="support_sticker_group absolute top-[calc(100%+8px)] left-0 z-200 flex flex-col items-center max-md:flex-row max-md:items-center"
      ref={groupRef}
    >
      <a
        className="support_sticker w-30 h-30 flex items-center justify-center transition-transform duration-250 ease-in-out cursor-pointer no-underline max-md:w-26 max-md:h-26"
        href="https://express.stitch.money/barak"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/support.svg" className="absolute w-30 h-30 animate-sticker-spin-20 max-md:w-26 max-md:h-26" alt="" />
        <span className="relative text-center font-['Comic_Neue','Comic_Sans_MS','Comic_Sans',cursive] text-[13px] font-bold [-webkit-text-stroke:0.5px_#fff] text-white leading-[1.3] p-5 max-md:text-[12px] max-md:p-4">
          Like what you see?<br/>Throw me<br />a bone
        </span>
      </a>

      <div className="support_sticker_options flex flex-row gap-2 opacity-0 pointer-events-none mt-1 transition-opacity duration-250 ease-in-out max-md:flex-col max-md:mt-0 max-md:ml-1">
        {OPTIONS.map(({ label, href }) => (
          <a
            key={label}
            className="support_sticker_option relative w-14 h-14 flex items-center justify-center no-underline transition-transform duration-350 [cubic-bezier(0.34,1.56,0.64,1)]"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/support.svg" className="absolute inset-0 w-full h-full animate-sticker-spin-14" alt="" />
            <span className="relative text-center font-['Comic_Neue','Comic_Sans_MS','Comic_Sans',cursive] text-[10px] font-bold [-webkit-text-stroke:0.4px_#fff] text-white leading-[1.2]">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
