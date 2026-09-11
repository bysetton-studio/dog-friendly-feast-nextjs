'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { authClient } from '@/lib/auth-client';

export default function KennelDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setConfirmLogout(false);
    }, 120);
  }, []);

  async function handleLogout() {
    setLoading(true);
    await authClient.signOut();
    router.push('/');
  }

  return (
    <div className="relative" ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button>My Kennel</Button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 min-w-50 bg-card-bg border border-black/10 rounded-xl p-1.5 flex flex-col gap-0.5 shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
          <Button href="/kennel" variant="tertiary" className="w-full justify-start px-3 py-2.5 rounded-lg">
            The Dog House
          </Button>

          <div className="h-px bg-black/8 my-0.5" />

          {confirmLogout ? (
            <div className="flex flex-col items-center gap-1.5 px-2 py-1.5">
              <span className="text-[13px] text-card-fg-muted shrink-0">Sure?</span>
              <Button intent="alert" className="w-full" onClick={handleLogout} disabled={loading}>{loading ? '...' : 'Yes, log out'}</Button>
              <Button variant="secondary" className="w-full" onClick={() => setConfirmLogout(false)}>Cancel</Button>
            </div>
          ) : (
            <Button intent="alert" variant="tertiary" className="w-full justify-start px-3 py-2.5 rounded-lg" onClick={() => setConfirmLogout(true)}>
              Log out
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
