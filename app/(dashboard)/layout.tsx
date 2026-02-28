'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';

// Lazy-load Three.js background — doesn't block visible content whatsoever
const BackgroundSystem = dynamic(
  () => import('@/components/three/BackgroundSystem').then(m => ({ default: m.BackgroundSystem })),
  { ssr: false }
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const setUser = useAppStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();

    // Parallel fetches for user + notifications
    Promise.all([
      fetch('/api/auth/me', { signal: controller.signal }),
      fetch('/api/notifications', { signal: controller.signal }),
    ]).then(async ([userRes, notifRes]) => {
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const [userData, notifData] = await Promise.all([userRes.json(), notifRes.json()]);
      setUser(userData.user);
      if (notifData.notifications) {
        useAppStore.getState().setNotifications(notifData.notifications);
      }
    }).catch((err) => {
      if (err.name !== 'AbortError') router.push('/login');
    });

    return () => controller.abort();
  }, [setUser, router]);

  return (
    <div className="relative w-full h-full flex overflow-hidden bg-bdie-bg text-bdie-text-primary">
      <BackgroundSystem />
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <div className="flex-1 flex overflow-hidden relative p-4 gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
