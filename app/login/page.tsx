'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const setUser = useAppStore((state) => state.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      router.push(callbackUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bdie-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bdie-accent/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bdie-danger/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10 border border-bdie-border animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bdie-accent to-emerald-500 flex items-center justify-center shadow-lg shadow-bdie-accent/20">
            <span className="text-bdie-bg font-bold text-xl">B</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-bdie-text-primary mt-4">Command Access</h1>
          <p className="text-bdie-text-secondary text-sm">Initialize session for BDIE Terminal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-bdie-danger/10 border border-bdie-danger/20 text-bdie-danger text-sm animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">
              Operator Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden focus:border-bdie-accent focus:ring-1 focus:ring-bdie-accent/50 transition-all placeholder:text-bdie-text-secondary/30"
              placeholder="e.g. admin@bdie.io"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">
              Security Key
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden focus:border-bdie-accent focus:ring-1 focus:ring-bdie-accent/50 transition-all placeholder:text-bdie-text-secondary/30"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-bdie-accent text-bdie-bg font-bold rounded-xl active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-bdie-bg/30 border-t-bdie-bg rounded-full animate-spin" />
            ) : (
              'ESTABLISH UPLINK'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-bdie-border text-center">
          <p className="text-bdie-text-secondary text-xs">
            New Terminal Access? <Link href="/register" className="text-bdie-accent hover:underline decoration-bdie-accent/30 underline-offset-4">Register Operator</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
