'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import './auth.css';

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
        router.push('/');
      }
    } else {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) {
        setError(err.message ?? 'Log in failed.');
      } else {
        router.push('/');
      }
    }

    setLoading(false);
  }

  return (
    <main className="auth">
      <Link href="/" className="auth__back">← Back to map</Link>

      <div className="auth__card">
        <div className="auth__tabs">
          <button
            className={`auth__tab${mode === 'signup' ? ' auth__tab--active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Sign up
          </button>
          <button
            className={`auth__tab${mode === 'login' ? ' auth__tab--active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log in
          </button>
        </div>

        <form className="auth__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="auth__label">
              Name
              <input
                className="auth__input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
              />
            </label>
          )}

          <label className="auth__label">
            Email
            <input
              className="auth__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </label>

          <label className="auth__label">
            Password
            <input
              className="auth__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={8}
            />
          </label>

          {error && <p className="auth__error">{error}</p>}

          <button className="auth__submit" type="submit" disabled={loading}>
            {loading ? '...' : mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
