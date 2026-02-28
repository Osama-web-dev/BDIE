'use client';
import { useAppStore } from '@/store/useAppStore';

export default function NotificationsPage() {
  const notifications = useAppStore(state => state.notifications);
  
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 glass-panel rounded-2xl border border-white/5 p-8">
      <h1 className="text-2xl font-sans text-white mb-6">All Notifications</h1>
      <div className="flex flex-col gap-4">
        {notifications.length === 0 ? (
          <p className="text-bdie-text-secondary">No notifications found.</p>
        ) : (
          notifications.map(n => (
            <div key={n._id} className="p-4 bg-black/40 border border-white/5 rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white">{n.title}</span>
                <span className="text-xs text-bdie-text-secondary">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-bdie-text-secondary">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
