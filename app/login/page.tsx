'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('admin@bdie.io');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        router.push('/dashboard');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bdie-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.05)_0%,transparent_50%)]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-2xl border border-white/10 z-10 relative"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-bdie-accent/20 flex items-center justify-center text-bdie-accent box-glow-accent mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-mono font-bold text-white tracking-widest">BDIE</h1>
          <p className="text-xs text-bdie-text-secondary uppercase tracking-widest mt-2">Intelligence Engine</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono text-bdie-text-secondary mb-1 uppercase">Operator ID / Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-bdie-accent transition-colors font-mono text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-bdie-text-secondary mb-1 uppercase">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-bdie-accent transition-colors font-mono text-sm"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 bg-bdie-accent hover:bg-bdie-accent/80 text-black font-bold py-3 rounded-lg transition-colors uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Initialize Session'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
