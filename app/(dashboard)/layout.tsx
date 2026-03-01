'use client';

import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

const BackgroundSystem = dynamic(
  () => import('@/components/three/BackgroundSystem').then(m => ({ default: m.BackgroundSystem })),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUser, setNotifications, setGlobalRiskScore } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initDashboard() {
      try {
        const [meRes, notifRes, riskRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/notifications'),
          fetch('/api/risk/global'),
        ]);

        if (meRes.status === 401) {
          router.push('/login');
          return;
        }

        const [meData, notifData, riskData] = await Promise.all([
          meRes.json(),
          notifRes.json(),
          riskRes.json(),
        ]);

        setUser(meData.user);
        setNotifications(notifData.notifications, notifData.unread_count);
        setGlobalRiskScore(riskData.global_score);
        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        router.push('/login');
      }
    }

    initDashboard();
  }, [setUser, setNotifications, setGlobalRiskScore, router]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-bdie-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-bdie-accent rounded-full animate-spin" />
          <span className="text-bdie-text-secondary text-sm font-mono tracking-widest animate-pulse">
            INITIALIZING CORE...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen flex overflow-hidden bg-bdie-bg text-bdie-text-primary selection:bg-bdie-accent/30 selection:text-bdie-accent">
      <BackgroundSystem />
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 flex flex-col overflow-hidden relative p-4 lg:p-6 pb-20 lg:pb-6 gap-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
