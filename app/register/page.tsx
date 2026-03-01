'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: 'Cybersecurity',
        role: 'analyst' as const
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const setUser = useAppStore((state) => state.setUser);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setUser(data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-bdie-bg flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bdie-accent/5 rounded-full blur-[100px]" />

            <div className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10 border border-bdie-border">
                <div className="flex flex-col items-center gap-2 mb-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-bdie-accent to-emerald-500 flex items-center justify-center">
                        <span className="text-bdie-bg font-bold text-xl">B</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-bdie-text-primary mt-4">Operator Registration</h1>
                    <p className="text-bdie-text-secondary text-sm">Provision new account for BDIE platform</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-bdie-danger/10 border border-bdie-danger/20 text-bdie-danger text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-11 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden focus:border-bdie-accent transition-all"
                            placeholder="e.g. John Miller"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">Email</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full h-11 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden focus:border-bdie-accent transition-all"
                            placeholder="operator@bdie.io"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">Dept</label>
                            <input
                                type="text"
                                required
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full h-11 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                className="w-full h-11 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden"
                            >
                                <option value="analyst">Analyst</option>
                                <option value="viewer">Viewer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase tracking-widest text-bdie-text-secondary px-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full h-11 bg-black/40 border border-bdie-border rounded-xl px-4 text-bdie-text-primary focus:outline-hidden focus:border-bdie-accent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-bdie-accent text-bdie-bg font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-bdie-bg/30 border-t-bdie-bg rounded-full animate-spin" /> : 'PROVISION ACCOUNT'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-bdie-border text-center">
                    <p className="text-bdie-text-secondary text-xs">
                        Already registered? <Link href="/login" className="text-bdie-accent hover:underline">Establish Uplink</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
