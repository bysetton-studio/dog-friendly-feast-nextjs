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
      <button className="top-nav__link border-none cursor-pointer text-unfriendly!" onClick={() => setOpen(true)}>
        Log out
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-100 pointer-events-auto" onClick={() => setOpen(false)}>
          <div className="bg-surface/98 border border-white/10 rounded-[14px] pt-7 px-6 pb-6 w-full max-w-80 font-[Arial,sans-serif]" onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] text-fg mt-0 mb-6 text-center">Are you sure you want to log out?</p>
            <div className="flex gap-2.5">
              <button className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-150 bg-transparent border border-white/10 text-fg-muted hover:text-fg hover:border-white/25" onClick={() => setOpen(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded-lg text-[14px] font-[Arial,sans-serif] cursor-pointer transition-[background] duration-150 bg-unfriendly-vivid/15 border border-unfriendly-vivid/30 text-unfriendly hover:enabled:bg-unfriendly-vivid/25 disabled:opacity-50 disabled:cursor-default" onClick={handleLogout} disabled={loading}>
                {loading ? '...' : 'Log out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
