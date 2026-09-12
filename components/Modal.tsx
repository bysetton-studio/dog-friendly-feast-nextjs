'use client';

import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ open, onClose, children, maxWidth = 'max-w-80' }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-500 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className={`dialog pt-7 px-6 pb-6 w-full ${maxWidth} font-[Arial,sans-serif]`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
