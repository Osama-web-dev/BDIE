'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCircle, Save, Shield, Activity, AlertTriangle, Clock,
  TrendingUp, Lock, Eye, Fingerprint, Bell, Key, Cpu,
  MapPin, Building, CalendarDays, BarChart3, CheckCircle2, XCircle
} from 'lucide-react';

const mockActivityLog = [
  { id: 1, action: 'System Login', ip: '192.168.1.45', location: 'HQ - Floor 3', time: '10:32 AM', status: 'success' },
  { id: 2, action: 'Accessed Risk Dashboard', ip: '192.168.1.45', location: 'HQ - Floor 3', time: '10:33 AM', status: 'success' },
  { id: 3, action: 'Ran Simulation: Privilege Escalation', ip: '192.168.1.45', location: 'HQ - Floor 3', time: '10:41 AM', status: 'warning' },
  { id: 4, action: 'Exported User Report', ip: '192.168.1.45', location: 'HQ - Floor 3', time: '11:05 AM', status: 'success' },
  { id: 5, action: 'Failed Login Attempt', ip: '203.0.113.42', location: 'Unknown', time: '11:22 AM', status: 'danger' },
  { id: 6, action: 'Password Changed', ip: '192.168.1.45', location: 'HQ - Floor 3', time: '11:30 AM', status: 'success' },
];

const mockStats = [
  { label: 'Sessions Today', value: 3, icon: Key, color: 'text-bdie-accent' },
  { label: 'Risk Events', value: 2, icon: AlertTriangle, color: 'text-bdie-warning' },
  { label: 'Threat Level', value: 'LOW', icon: Shield, color: 'text-bdie-accent' },
  { label: 'Clearance', value: 'L5', icon: Fingerprint, color: 'text-bdie-accent' },
];

const TABS = ['Overview', 'Activity Log', 'Security', 'Preferences'] as const;
type Tab = typeof TABS[number];

export default function ProfilePage() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || '');
    }
    const interval = setInterval(() => setUptime(p => p + 1), 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, department })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMessage('Profile updated successfully.');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch {
      setMessage('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60); const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  if (!user) return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-bdie-accent/30 border-t-bdie-accent rounded-full animate-spin" />
        <span className="text-sm text-bdie-text-secondary font-mono">Loading profile...</span>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto flex flex-col gap-4 pb-6"
      >
        {/* Header Card */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5 bg-bdie-accent blur-3xl pointer-events-none" />
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative shrink-0"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-bdie-accent/30 to-bdie-accent/5 border border-bdie-accent/30 flex items-center justify-center text-bdie-accent box-glow-accent">
                <UserCircle size={40} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-bdie-accent rounded-full border-2 border-bdie-bg animate-pulse" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <span className="text-[10px] bg-bdie-accent/10 text-bdie-accent px-2 py-0.5 rounded-full border border-bdie-accent/20 font-mono uppercase tracking-widest">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-bdie-text-secondary font-mono">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-bdie-text-secondary">
                  <Building size={12} />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-bdie-text-secondary">
                  <Clock size={12} />
                  <span>Session: {formatUptime(uptime)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-bdie-accent">
                  <Activity size={12} className="animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {mockStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-black/40 border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1 min-w-[80px]"
                >
                  <stat.icon size={14} className={stat.color} />
                  <span className={`font-mono font-bold text-lg ${stat.color}`}>{stat.value}</span>
                  <span className="text-[9px] text-bdie-text-secondary uppercase tracking-wider text-center">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab
                  ? 'bg-bdie-accent/20 text-bdie-accent border border-bdie-accent/30'
                  : 'text-bdie-text-secondary hover:text-white hover:bg-white/5'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'Overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest mb-4">Edit Profile</h2>
                  <form onSubmit={handleSave} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-mono text-bdie-text-secondary mb-2 uppercase">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-bdie-accent transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-bdie-text-secondary mb-2 uppercase">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-bdie-accent transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-bdie-text-secondary mb-2 uppercase">Role (Read-only)</label>
                      <div className="w-full bg-white/5 border border-white/5 rounded-lg px-4 py-3 text-bdie-text-secondary text-sm flex items-center gap-2">
                        <Shield size={14} className="text-bdie-accent" />
                        {user.role}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className={`text-sm ${message.includes('success') ? 'text-bdie-accent' : 'text-bdie-danger'}`}>{message}</span>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="bg-bdie-accent/10 hover:bg-bdie-accent/20 border border-bdie-accent/30 text-bdie-accent px-5 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50 hover:box-glow-accent"
                      >
                        <Save size={14} />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Risk Score Card */}
                  <div className="glass-panel rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">Risk Profile</h2>
                      <span className="text-xs text-bdie-accent font-mono">LOW RISK</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 shrink-0">
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                          <motion.circle
                            cx="18" cy="18" r="14" fill="none"
                            stroke="#00ff9d" strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray="88"
                            initial={{ strokeDashoffset: 88 }}
                            animate={{ strokeDashoffset: 88 - (88 * 12 / 100) }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-bdie-accent font-mono">12%</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">Behavioral Risk Score</p>
                        <p className="text-xs text-bdie-text-secondary">Within normal operational parameters. No anomalies detected in the past 7 days.</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="glass-panel rounded-2xl p-5 border border-white/10">
                    <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest mb-3">Access Details</h2>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: 'User ID', value: user._id, icon: Fingerprint },
                        { label: 'Clearance Level', value: 'Level 5 — Confidential', icon: Lock },
                        { label: 'Last Login', value: 'Today, 10:32 AM', icon: CalendarDays },
                        { label: 'Primary Location', value: 'HQ — Security Operations', icon: MapPin },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                          <item.icon size={13} className="text-bdie-accent shrink-0" />
                          <span className="text-xs text-bdie-text-secondary w-28 shrink-0">{item.label}</span>
                          <span className="text-xs text-white font-mono truncate">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY LOG TAB */}
            {activeTab === 'Activity Log' && (
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">Recent Session Activity</h2>
                  <span className="text-[10px] text-bdie-text-secondary font-mono">Last 24h</span>
                </div>
                <div className="flex flex-col divide-y divide-white/5">
                  {mockActivityLog.map((log, i) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4 py-3"
                    >
                      <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-bdie-accent' : log.status === 'warning' ? 'bg-bdie-warning' : 'bg-bdie-danger'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">{log.action}</p>
                        <p className="text-xs text-bdie-text-secondary font-mono">{log.ip} · {log.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-bdie-text-secondary font-mono">{log.time}</p>
                        {log.status === 'success' ? <CheckCircle2 size={12} className="text-bdie-accent ml-auto mt-0.5" />
                          : log.status === 'danger' ? <XCircle size={12} className="text-bdie-danger ml-auto mt-0.5" />
                            : <AlertTriangle size={12} className="text-bdie-warning ml-auto mt-0.5" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'Security' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col gap-4">
                  <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">Security Settings</h2>

                  {[
                    { label: 'Two-Factor Authentication', desc: 'Require 2FA for every login', value: twoFactor, set: setTwoFactor },
                    { label: 'Email Alerts', desc: 'Notify on suspicious activity', value: emailAlerts, set: setEmailAlerts },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm text-white">{item.label}</p>
                        <p className="text-xs text-bdie-text-secondary mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${item.value ? 'bg-bdie-accent' : 'bg-white/10'}`}
                      >
                        <motion.div
                          animate={{ x: item.value ? 20 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>
                  ))}

                  <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-sm text-white mb-3">Session Timeout</p>
                    <div className="flex gap-2">
                      {['15', '30', '60', '120'].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setSessionTimeout(mins)}
                          className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${sessionTimeout === mins ? 'bg-bdie-accent/20 text-bdie-accent border border-bdie-accent/30' : 'bg-white/5 text-bdie-text-secondary hover:bg-white/10'}`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6 border border-white/10">
                  <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest mb-4">Security Score</h2>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: '2FA Enabled', ok: twoFactor },
                      { label: 'Email Alerts Active', ok: emailAlerts },
                      { label: 'Session Timeout Set', ok: true },
                      { label: 'Role-Based Access', ok: true },
                      { label: 'Audit Logging', ok: true },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-center gap-3"
                      >
                        {item.ok
                          ? <CheckCircle2 size={15} className="text-bdie-accent shrink-0" />
                          : <XCircle size={15} className="text-bdie-danger shrink-0" />}
                        <span className={`text-sm ${item.ok ? 'text-white' : 'text-bdie-text-secondary'}`}>{item.label}</span>
                      </motion.div>
                    ))}
                    <div className="mt-2 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-bdie-text-secondary">Security Score</span>
                        <span className="text-xs font-mono text-bdie-accent">{[twoFactor, emailAlerts, true, true, true].filter(Boolean).length * 20}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${[twoFactor, emailAlerts, true, true, true].filter(Boolean).length * 20}%` }}
                          className="h-full bg-bdie-accent rounded-full"
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'Preferences' && (
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest mb-4">Display & Notifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Desktop Notifications', desc: 'Browser push notifications for critical alerts', icon: Bell },
                    { label: 'Live Risk Feed', desc: 'Real-time risk score updates in sidebar', icon: TrendingUp },
                    { label: 'AI Reasoning Panel', desc: 'Show transparency module on dashboard', icon: Cpu },
                    { label: 'Compact Mode', desc: 'Reduce visual density in tables and lists', icon: BarChart3 },
                  ].map((pref, i) => (
                    <motion.div
                      key={pref.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4 p-4 bg-black/40 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-bdie-accent/10 border border-bdie-accent/20 flex items-center justify-center text-bdie-accent shrink-0">
                        <pref.icon size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{pref.label}</p>
                        <p className="text-xs text-bdie-text-secondary mt-0.5">{pref.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
