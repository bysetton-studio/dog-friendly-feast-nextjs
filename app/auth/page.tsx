'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import BackgroundArt from '@/components/BackgroundArt';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      const { error: err } = await authClient.signUp.email({ name, email, password });
      if (err) {
        setError(err.message ?? 'Sign up failed.');
      } else {
        router.push('/kennel');
      }
    } else {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) {
        setError(err.message ?? 'Log in failed.');
      } else {
        router.push('/kennel');
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 font-sans">
      <BackgroundArt />
      <Link href="/" className="fixed top-5 left-6 text-sm text-[#9aa0a6] no-underline hover:text-[#e0e0e0]">← Back to map</Link>

      <div className="w-full max-w-95 bg-[rgba(30,30,30,0.9)] border border-white/8 rounded-2xl p-8 z-1">
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 mb-7">
          <button
            className={`flex-1 py-2 border-none rounded-md text-sm font-sans cursor-pointer transition-colors duration-150 ${mode === 'signup' ? 'bg-white/10 text-[#e0e0e0]' : 'bg-transparent text-[#9aa0a6]'}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Sign up
          </button>
          <button
            className={`flex-1 py-2 border-none rounded-md text-sm font-sans cursor-pointer transition-colors duration-150 ${mode === 'login' ? 'bg-white/10 text-[#e0e0e0]' : 'bg-transparent text-[#9aa0a6]'}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log in
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="flex flex-col gap-1.5 text-[13px] text-[#9aa0a6]">
              Name
              <input
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[15px] text-[#e0e0e0] font-sans outline-none transition-colors duration-150 placeholder:text-[#555] focus:border-white/25"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-[13px] text-[#9aa0a6]">
            Email
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[15px] text-[#e0e0e0] font-sans outline-none transition-colors duration-150 placeholder:text-[#555] focus:border-white/25"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-[13px] text-[#9aa0a6]">
            Password
            <input
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-[15px] text-[#e0e0e0] font-sans outline-none transition-colors duration-150 placeholder:text-[#555] focus:border-white/25"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
            />
          </label>

          {error && <p className="text-[13px] text-[#f28b82] m-0">{error}</p>}

          <button className="mt-1 py-2.75 bg-white/12 border border-white/15 rounded-lg text-[#e0e0e0] text-[15px] font-sans cursor-pointer transition-colors duration-150 hover:bg-white/18 disabled:opacity-50 disabled:cursor-default" type="submit" disabled={loading}>
            {loading ? '...' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
