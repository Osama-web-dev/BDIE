'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { Bell, Search, User, Clock, LogOut, Settings, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const user = useAppStore((state) => state.user);
  const notifications = useAppStore((state) => state.notifications);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const [time, setTime] = useState<Date | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    useAppStore.getState().setUser(null);
    router.push('/login');
  };

  const handleMarkRead = async (id: string) => {
    markNotificationRead(id);
    await fetch(`/api/notifications/${id}`, { method: 'PATCH', body: JSON.stringify({ read: true }) });
  };

  const isHighRisk = globalRiskScore > 75;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 w-full glass-panel border-b border-bdie-border flex items-center justify-between px-6"
      style={{ zIndex: 50, position: 'relative' }}
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-bdie-text-secondary">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search intelligence logs..."
            className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-bdie-text-secondary/50 focus:text-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-bdie-text-secondary bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <Clock size={14} className="text-bdie-accent" />
          {time ? time.toISOString().replace('T', ' ').substring(0, 19) : '----/--/-- --:--:--'} UTC
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-bdie-text-secondary">Global Risk</span>
            <span className={`font-mono font-bold text-lg ${isHighRisk ? 'text-bdie-danger text-glow-danger' : 'text-bdie-accent text-glow-accent'}`}>
              {globalRiskScore.toFixed(1)}%
            </span>
          </div>
          <div className="relative w-24 md:w-32 h-2 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className={`absolute top-0 left-0 bottom-0 ${isHighRisk ? 'bg-bdie-danger' : 'bg-bdie-accent'}`}
              initial={{ width: 0 }}
              animate={{ width: `${globalRiskScore}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          {/* Notifications */}
          <div className="relative" ref={notifRef} style={{ zIndex: 60 }}>
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
              className="relative text-bdie-text-secondary hover:text-white transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-bdie-danger rounded-full text-[9px] font-bold text-white flex items-center justify-center box-glow-danger"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ position: 'fixed', top: '64px', right: '80px', zIndex: 9999 }}
                  className="w-80 dropdown-panel rounded-xl overflow-hidden flex flex-col max-h-96"
                >
                  <div className="p-3 border-b border-white/10 font-medium text-sm flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="text-[10px] bg-bdie-danger/20 text-bdie-danger px-2 py-0.5 rounded-full">{unreadCount} unread</span>}
                  </div>
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-sm text-bdie-text-secondary">No notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-white/5' : ''}`} onClick={() => handleMarkRead(n._id)}>
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-xs font-bold ${n.type === 'critical' ? 'text-bdie-danger' : n.type === 'warning' ? 'text-bdie-warning' : 'text-bdie-accent'}`}>{n.title}</span>
                            <span className="text-[10px] text-bdie-text-secondary">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs text-bdie-text-secondary">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/notifications" className="p-2 text-center text-xs text-bdie-accent hover:bg-white/5 border-t border-white/10" onClick={() => setShowNotifMenu(false)}>View All Notifications →</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef} style={{ zIndex: 60 }}>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
              className="w-8 h-8 rounded-full bg-bdie-accent/20 border border-bdie-accent/40 flex items-center justify-center text-bdie-accent hover:bg-bdie-accent/30 transition-all hover:scale-110"
            >
              <User size={16} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{ position: 'fixed', top: '64px', right: '16px', zIndex: 9999 }}
                  className="w-56 dropdown-panel rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="p-4 border-b border-white/10 bg-bdie-accent/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-bdie-accent/20 border border-bdie-accent/40 flex items-center justify-center text-bdie-accent">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'Operator'}</p>
                        <p className="text-[10px] text-bdie-text-secondary truncate">{user?.email || 'admin@bdie.io'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-bdie-accent/10 text-bdie-accent px-2 py-0.5 rounded-full border border-bdie-accent/20">{user?.role || 'Administrator'}</span>
                  </div>
                  <div className="p-2 flex flex-col">
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-bdie-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <UserCircle size={16} /> Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm text-bdie-text-secondary hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => setShowProfileMenu(false)}>
                      <Settings size={16} /> Settings
                    </Link>
                    <div className="h-px bg-white/10 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-bdie-danger hover:bg-bdie-danger/10 rounded-lg transition-colors text-left w-full">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
