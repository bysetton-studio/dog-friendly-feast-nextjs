'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function LogoutButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await authClient.signOut();
    router.push('/');
  }

  return (
    <>
      <button className="top-nav__link kennel__logout" onClick={() => setOpen(true)}>
        Log out
      </button>

      {open && (
        <div className="kennel__modal-backdrop" onClick={() => setOpen(false)}>
          <div className="kennel__modal" onClick={(e) => e.stopPropagation()}>
            <p className="kennel__modal-text">Are you sure you want to log out?</p>
            <div className="kennel__modal-actions">
              <button className="kennel__modal-cancel" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="kennel__modal-confirm" onClick={handleLogout} disabled={loading}>
                {loading ? '...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
