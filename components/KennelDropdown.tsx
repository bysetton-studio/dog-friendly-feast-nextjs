'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function KennelDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirmLogout(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    setLoading(true);
    await authClient.signOut();
    router.push('/');
  }

  return (
    <div className="kennel-dropdown" ref={ref}>
      <button className="top-nav__link kennel-dropdown__trigger" onClick={() => setOpen((v) => !v)}>
        My Kennel
      </button>

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
