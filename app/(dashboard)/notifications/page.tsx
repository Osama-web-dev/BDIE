'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ShieldAlert, Activity, Shield, Trash2, CheckSquare, Clock, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, setNotifications } = useAppStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      setLoading(true);
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications, data.unread_count);
      setLoading(false);
    }
    loadNotifications();
  }, [setNotifications]);

  const handleMarkAllRead = async () => {
    markRead('all');
    await fetch('/api/notifications', { method: 'PATCH' });
  };

  const handleAction = async (id: string, action: 'read' | 'delete') => {
    if (action === 'read') {
      markRead(id);
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    } else {
      // Optimistic delete local state
      const updated = notifications.filter(n => n._id !== id);
      const newUnread = updated.filter(n => !n.read).length;
      setNotifications(updated, newUnread);
      await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bell className="text-bdie-accent" />
            Intelligence Archive
          </h1>
          <p className="text-sm text-bdie-text-secondary">Historical and real-time security alerts per operator session.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-bdie-text-secondary hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <CheckSquare size={14} />
            MARK ALL AS RESOLVED
          </button>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/10 text-[10px] font-mono text-bdie-text-secondary uppercase tracking-[0.2em] bg-white/2">
          <div className="col-span-8">Intelligence Narrative</div>
          <div className="col-span-2">Telemetry Timestamp</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/2 flex items-center justify-center text-bdie-text-secondary/20">
                  <Shield size={32} />
                </div>
                <p className="text-sm text-bdie-text-secondary italic">No archived intelligence records found in partition.</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <motion.div
                  key={n._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  className={`grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-all group ${!n.read ? 'bg-bdie-accent/[0.02]' : 'opacity-60'}`}
                >
                  <div className="col-span-8 flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${n.severity === 'critical' ? 'bg-bdie-danger/10 border-bdie-danger/30 text-bdie-danger' :
                        n.severity === 'warning' ? 'bg-bdie-warning/10 border-bdie-warning/30 text-bdie-warning' :
                          'bg-bdie-accent/10 border-bdie-accent/30 text-bdie-accent'
                      }`}>
                      {n.severity === 'critical' ? <ShieldAlert size={18} /> : <Activity size={18} />}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-bdie-accent" />}
                      </div>
                      <p className="text-xs text-bdie-text-secondary leading-relaxed max-w-2xl">{n.message}</p>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-bdie-text-secondary">
                        <Clock size={12} />
                        <span className="text-[10px] font-mono">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-[10px] text-bdie-text-secondary/50 font-mono tracking-tighter uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="p-2 bg-white/5 hover:bg-bdie-accent/20 border border-white/10 hover:border-bdie-accent/40 rounded-lg text-bdie-text-secondary hover:text-bdie-accent transition-all"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        onClick={() => handleAction(n._id, 'read')}
                        className="p-2 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 rounded-lg text-bdie-text-secondary hover:text-emerald-500 transition-all"
                      >
                        <CheckSquare size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(n._id, 'delete')}
                      className="p-2 bg-white/5 hover:bg-bdie-danger/20 border border-white/10 hover:border-bdie-danger/40 rounded-lg text-bdie-text-secondary hover:text-bdie-danger transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
