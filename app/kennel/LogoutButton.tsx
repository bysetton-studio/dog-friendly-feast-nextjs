'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
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
      <Button intent="alert" onClick={() => setOpen(true)}>Log out</Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <p className="text-[15px] text-card-fg mt-0 mb-6 text-center">Are you sure you want to log out?</p>
        <div className="flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          <Button intent="alert" className="flex-1" onClick={handleLogout} disabled={loading}>{loading ? '...' : 'Log out'}</Button>
        </div>
      </Modal>
    </>
  );
}
