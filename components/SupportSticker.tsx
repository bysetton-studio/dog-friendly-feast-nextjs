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
    <div className="support_sticker_group" ref={groupRef}>
      <a
        className="support_sticker"
        href="https://express.stitch.money/barak"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src="/support.svg" className="support_sticker__img" alt="" />
        <span className="support_sticker__text">
          Throw me<br />a bone
        </span>
      </a>

      <div className="support_sticker_options">
        {OPTIONS.map(({ label, href }) => (
          <a
            key={label}
            className="support_sticker_option"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/support.svg" className="support_sticker_option__img" alt="" />
            <span className="support_sticker_option__text">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
