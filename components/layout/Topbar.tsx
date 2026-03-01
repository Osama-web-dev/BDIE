'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Bell, Search, User, Clock, LogOut, Settings, UserCircle, CheckCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Topbar() {
  const { globalRiskScore, user, notifications, unreadCount, markRead, setUser } = useAppStore();
  const [time, setTime] = useState<Date | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  const handleMarkRead = async (id: string) => {
    markRead(id);
    await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
  };

  const handleMarkAllRead = async () => {
    markRead('all');
    await fetch('/api/notifications', { method: 'PATCH' });
  };

  const isHighRisk = globalRiskScore > 75;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 w-full glass-panel border-b border-bdie-border flex items-center justify-between px-6 z-50 sticky top-0"
    >
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-bdie-text-secondary group">
          <Search size={18} className="group-focus-within:text-bdie-accent transition-colors" />
          <input
            type="text"
            placeholder="Search intelligence logs..."
            className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-bdie-text-secondary/50 focus:text-white transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-bdie-text-secondary bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <Clock size={12} className="text-bdie-accent" />
          {time ? time.toISOString().replace('T', ' ').substring(0, 19) : '----/--/-- --:--:--'} UTC
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-bdie-text-secondary">Global Risk</span>
            <span className={`font-mono font-bold text-lg leading-none ${isHighRisk ? 'text-bdie-danger shadow-danger' : 'text-bdie-accent shadow-accent'}`}>
              {Math.round(globalRiskScore)}%
            </span>
          </div>
          <div className="relative w-24 h-1.5 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className={`absolute top-0 left-0 bottom-0 ${isHighRisk ? 'bg-bdie-danger' : 'bg-bdie-accent'}`}
              initial={{ width: 0 }}
              animate={{ width: `${globalRiskScore}%` }}
              transition={{ type: 'spring', stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6 h-8">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifMenu(!showNotifMenu); setShowProfileMenu(false); }}
              className="relative text-bdie-text-secondary hover:text-white transition-colors active:scale-90"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-bdie-danger rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                >
                  {unreadCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {showNotifMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute top-12 right-0 w-80 dropdown-panel rounded-xl overflow-hidden flex flex-col shadow-2xl border border-bdie-border"
                >
                  <div className="p-3 border-b border-white/10 font-medium text-xs flex items-center justify-between bg-white/5">
                    <span>Notifications</span>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-bdie-accent hover:text-white flex items-center gap-1 transition-colors"><CheckCheck size={12} /> Clear</button>}
                      <span className="bg-bdie-danger/20 text-bdie-danger px-2 py-0.5 rounded-full">{unreadCount} unread</span>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-80 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-bdie-text-secondary italic">No active threats detected.</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n._id}
                          onClick={() => handleMarkRead(n._id)}
                          className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group ${!n.read ? 'bg-white/2' : 'opacity-60'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[11px] font-bold tracking-tight ${n.severity === 'critical' ? 'text-bdie-danger' : n.severity === 'warning' ? 'text-bdie-warning' : 'text-bdie-accent'}`}>{n.title}</span>
                            <span className="text-[9px] text-bdie-text-secondary font-mono">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-bdie-text-secondary leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/notifications" className="p-2.5 text-center text-[10px] uppercase tracking-widest text-bdie-accent hover:bg-white/5 border-t border-white/10 transition-colors" onClick={() => setShowNotifMenu(false)}>Intelligence Archive →</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifMenu(false); }}
              className="w-8 h-8 rounded-full bg-bdie-accent/10 border border-bdie-accent/30 flex items-center justify-center text-bdie-accent hover:bg-bdie-accent/20 transition-all hover:scale-105 active:scale-95"
            >
              <User size={16} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute top-12 right-0 w-60 dropdown-panel rounded-xl overflow-hidden shadow-2xl border border-bdie-border"
                >
                  <div className="p-4 border-b border-white/10 bg-gradient-to-br from-bdie-accent/10 to-transparent">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-bdie-accent/20 border border-bdie-accent/40 flex items-center justify-center text-bdie-accent shadow-inner">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-tight">{user?.name || 'Operator'}</p>
                        <p className="text-[10px] text-bdie-text-secondary truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-tighter bg-bdie-accent/10 text-bdie-accent px-2 py-0.5 rounded-md border border-bdie-accent/20">{user?.role}</span>
                      <span className="text-[9px] text-bdie-text-secondary font-mono">{user?.department}</span>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link href={`/users/${user?._id}`} className="flex items-center gap-2 px-3 py-2 text-xs text-bdie-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors group" onClick={() => setShowProfileMenu(false)}>
                      <UserCircle size={14} className="group-hover:text-bdie-accent" /> Operator Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-xs text-bdie-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors group" onClick={() => setShowProfileMenu(false)}>
                      <Settings size={14} className="group-hover:text-bdie-accent" /> System Settings
                    </Link>
                    <div className="h-px bg-white/5 my-1.5" />
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-xs text-bdie-danger hover:bg-bdie-danger/10 rounded-lg transition-colors w-full group">
                      <LogOut size={14} className="group-hover:scale-110 transition-transform" /> Sign Out of Terminal
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
