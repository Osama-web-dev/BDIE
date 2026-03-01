'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Server, Bell, Key, Database, RefreshCw, Save } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsPage() {
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRecalculate = async () => {
    setLoading(true);
    try {
      await fetch('/api/risk/recalculate', { method: 'POST' });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-8 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Settings className="text-bdie-accent" />
            System Configuration
          </h1>
          <p className="text-sm text-bdie-text-secondary mt-1">Manage global monitoring parameters and terminal preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Shield size={16} className="text-bdie-accent" />
              AI Engine Tuning
            </h3>
            <div className="space-y-6">
              <SettingSlider label="Anomaly Threshold" value={75} desc="Minimum score required to trigger a CRITICAL system-wide alert." />
              <SettingSlider label="Baseline Confidence" value={90} desc="Minimum data volume required for behavioral drift computation." />
              <SettingSlider label="Euclidean Sensitivity" value={45} desc="Weighting of spatial drift in the 5-factor risk model." />
            </div>
          </section>

          <section className="glass-panel p-8 rounded-3xl border border-white/5 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Database size={16} className="text-bdie-accent" />
              Maintenance Operations
            </h3>
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-white">Full Risk Recalculation</p>
                <p className="text-xs text-bdie-text-secondary">Triggers a system-wide rebuild of all active entity risk snapshots.</p>
              </div>
              <button
                onClick={handleRecalculate}
                disabled={loading || user?.role !== 'admin'}
                className="flex items-center gap-2 px-4 py-2 bg-bdie-accent text-bdie-bg font-bold rounded-xl active:scale-95 disabled:opacity-30 transition-all text-xs"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {success ? 'COMPLETED' : 'RECALCULATE ALL'}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Server size={14} className="text-bdie-accent" />
              Core Infrastructure
            </h3>
            <div className="space-y-3">
              <StatusItem label="Database Cluster" status="CONNECTED" />
              <StatusItem label="JWT Session Layer" status="ACTIVE" />
              <StatusItem label="Risk Engine Node" status="ONLINE" />
              <StatusItem label="Digital Twin Engine" status="NOMINAL" />
            </div>
          </section>

          <section className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-bdie-accent/20 flex items-center justify-center text-bdie-accent">
                <Settings size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Version 4.5.0-PRO</p>
                <p className="text-[10px] text-bdie-text-secondary font-mono tracking-widest">ENTERPRISE EDITION</p>
              </div>
            </div>
            <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <Save size={14} />
              SAVE ALL SETTINGS
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function SettingSlider({ label, value, desc }: any) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-[10px] text-bdie-text-secondary italic">{desc}</p>
        </div>
        <span className="text-xs font-mono text-bdie-accent">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-black/40 rounded-full relative">
        <div className="absolute top-0 left-0 bottom-0 bg-bdie-accent rounded-full" style={{ width: `${value}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-xl shadow-bdie-accent/50 border-2 border-bdie-accent cursor-pointer" style={{ left: `${value}%` }} />
      </div>
    </div>
  );
}

function StatusItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
      <span className="text-[10px] uppercase tracking-widest text-bdie-text-secondary">{label}</span>
      <span className="text-[9px] font-bold text-emerald-400 font-mono tracking-tighter">{status}</span>
    </div>
  );
}
