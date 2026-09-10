'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavButton from '@/components/NavButton';
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
    <div className="kennel-dropdown" ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <NavButton>My Kennel</NavButton>

      {open && (
        <div className="kennel-dropdown__menu">
          <Link href="/kennel" className="kennel-dropdown__item" onClick={() => setOpen(false)}>
            🐾 The Dog House
          </Link>

          <div className="kennel-dropdown__divider" />

          {confirmLogout ? (
            <div className="kennel-dropdown__confirm">
              <span className="kennel-dropdown__confirm-label">Sure?</span>
              <button
                className="kennel-dropdown__confirm-yes"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? '...' : 'Yes, log out'}
              </button>
              <button
                className="kennel-dropdown__confirm-no"
                onClick={() => setConfirmLogout(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="kennel-dropdown__item kennel-dropdown__item--danger"
              onClick={() => setConfirmLogout(true)}
            >
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
