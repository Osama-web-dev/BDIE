'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Cpu, Brain, Shield, Sliders, Save, RotateCcw,
  Zap, Database, Network, AlertTriangle, CheckCircle2,
  Activity, Lock, Eye, Bell, GitBranch, Server
} from 'lucide-react';

export default function SettingsPage() {
  const [aiSensitivity, setAiSensitivity] = useState(72);
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [anomalyWindow, setAnomalyWindow] = useState(24);
  const [modelVersion, setModelVersion] = useState('v3.2-stable');
  const [dataRetention, setDataRetention] = useState('90');
  const [autoSimulation, setAutoSimulation] = useState(false);
  const [deepScan, setDeepScan] = useState(true);
  const [realtimeAlert, setRealtimeAlert] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setAiSensitivity(72);
    setRiskThreshold(75);
    setAnomalyWindow(24);
    setModelVersion('v3.2-stable');
    setDataRetention('90');
  };

  const systemStats = [
    { label: 'CPU Usage', value: 34, unit: '%', color: '#00ff9d', icon: Cpu },
    { label: 'Memory', value: 61, unit: '%', color: '#ffb800', icon: Database },
    { label: 'Network I/O', value: 18, unit: 'MB/s', color: '#00ff9d', icon: Network },
    { label: 'Active Models', value: 3, unit: '', color: '#00ff9d', icon: Brain },
  ];

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto flex flex-col gap-4 pb-6"
      >
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5 bg-bdie-accent blur-3xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-bdie-accent/10 border border-bdie-accent/30 flex items-center justify-center text-bdie-accent">
              <Sliders size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">System Configuration</h1>
              <p className="text-sm text-bdie-text-secondary">AI model tuning, engine parameters, and operational settings.</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 text-xs text-bdie-text-secondary hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all">
                <RotateCcw size={13} /> Reset
              </button>
              <motion.button
                onClick={handleSave}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all ${saved ? 'bg-bdie-accent/20 text-bdie-accent border border-bdie-accent/40' : 'bg-bdie-accent/10 text-bdie-accent border border-bdie-accent/30 hover:bg-bdie-accent/20'}`}
              >
                {saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                {saved ? 'Saved!' : 'Save Config'}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: AI Controls */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* AI Engine */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <Brain size={16} className="text-bdie-accent" />
                <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">AI Engine Parameters</h2>
              </div>
              <div className="flex flex-col gap-5">
                {/* AI Sensitivity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-white">Detection Sensitivity</label>
                    <span className="font-mono text-sm text-bdie-accent">{aiSensitivity}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-black/50 rounded-full">
                      <motion.div
                        animate={{ width: `${aiSensitivity}%` }}
                        className="h-full bg-gradient-to-r from-bdie-accent/50 to-bdie-accent rounded-full"
                      />
                    </div>
                    <input
                      type="range" min="0" max="100" value={aiSensitivity}
                      onChange={e => setAiSensitivity(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0"
                      style={{ cursor: 'none' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-bdie-text-secondary mt-1 font-mono">
                    <span>Low (fewer alerts)</span><span>High (more alerts)</span>
                  </div>
                </div>

                {/* Risk Threshold */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-white">Critical Risk Threshold</label>
                    <span className="font-mono text-sm text-bdie-warning">{riskThreshold}%</span>
                  </div>
                  <div className="relative">
                    <div className="w-full h-2 bg-black/50 rounded-full">
                      <motion.div
                        animate={{ width: `${riskThreshold}%` }}
                        className="h-full bg-gradient-to-r from-bdie-warning/50 to-bdie-warning rounded-full"
                      />
                    </div>
                    <input
                      type="range" min="0" max="100" value={riskThreshold}
                      onChange={e => setRiskThreshold(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0"
                      style={{ cursor: 'none' }}
                    />
                  </div>
                </div>

                {/* Anomaly Window */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm text-white">Anomaly Detection Window</label>
                    <span className="font-mono text-sm text-white">{anomalyWindow}h</span>
                  </div>
                  <div className="flex gap-2">
                    {[6, 12, 24, 48, 72].map(h => (
                      <button key={h} onClick={() => setAnomalyWindow(h)}
                        className={`flex-1 py-2 rounded-lg text-xs font-mono transition-all ${anomalyWindow === h ? 'bg-bdie-accent/20 text-bdie-accent border border-bdie-accent/30' : 'bg-white/5 text-bdie-text-secondary hover:bg-white/10'}`}
                      >{h}h</button>
                    ))}
                  </div>
                </div>

                {/* Model Version */}
                <div>
                  <label className="block text-sm text-white mb-2">Model Version</label>
                  <div className="flex gap-2">
                    {['v3.2-stable', 'v4.0-beta'].map(v => (
                      <button key={v} onClick={() => setModelVersion(v)}
                        className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${modelVersion === v ? 'bg-bdie-accent/20 text-bdie-accent border border-bdie-accent/30' : 'bg-white/5 text-bdie-text-secondary hover:bg-white/10 border border-white/5'}`}
                      >
                        <GitBranch size={12} /> {v}
                        {v === 'v4.0-beta' && <span className="text-[9px] bg-bdie-warning/20 text-bdie-warning px-1 rounded">BETA</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Toggles */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-5">
                <Shield size={16} className="text-bdie-accent" />
                <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">Operational Controls</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Auto-Simulation', desc: 'Run scheduled threat simulations', value: autoSimulation, set: setAutoSimulation, icon: Zap },
                  { label: 'Deep Scan Mode', desc: 'Analyze all file access patterns', value: deepScan, set: setDeepScan, icon: Eye },
                  { label: 'Real-time Alerts', desc: 'Immediate critical notifications', value: realtimeAlert, set: setRealtimeAlert, icon: Bell },
                ].map(item => (
                  <div key={item.label} className="p-4 bg-black/40 rounded-xl border border-white/5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <item.icon size={14} className="text-bdie-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-white">{item.label}</p>
                      </div>
                      <button
                        onClick={() => item.set(!item.value)}
                        className={`relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0 ${item.value ? 'bg-bdie-accent' : 'bg-white/10'}`}
                      >
                        <motion.div
                          animate={{ x: item.value ? 18 : 2 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>
                    <p className="text-xs text-bdie-text-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: System Stats */}
          <div className="flex flex-col gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Server size={14} className="text-bdie-accent" />
                <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">System Status</h2>
              </div>
              <div className="flex flex-col gap-4">
                {systemStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <stat.icon size={12} style={{ color: stat.color }} />
                        <span className="text-xs text-bdie-text-secondary">{stat.label}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: stat.color }}>{stat.value}{stat.unit}</span>
                    </div>
                    {stat.unit === '%' && (
                      <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.value}%` }}
                          transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: stat.color }}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-bdie-accent animate-pulse" />
                  <span className="text-xs text-bdie-accent">All systems operational</span>
                </div>
              </div>
            </div>

            {/* Data Config */}
            <div className="glass-panel rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Database size={14} className="text-bdie-accent" />
                <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">Data Management</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs text-bdie-text-secondary mb-2">Retention Period</label>
                  <div className="flex gap-2">
                    {['30', '60', '90', '180'].map(d => (
                      <button key={d} onClick={() => setDataRetention(d)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all ${dataRetention === d ? 'bg-bdie-accent/20 text-bdie-accent border border-bdie-accent/30' : 'bg-white/5 text-bdie-text-secondary hover:bg-white/10'}`}
                      >{d}d</button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-t border-white/5">
                  <span className="text-bdie-text-secondary">Stored Records</span>
                  <span className="font-mono text-white">14,882</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-bdie-text-secondary">DB Size</span>
                  <span className="font-mono text-white">2.4 GB</span>
                </div>
                <button className="w-full mt-1 py-2 text-xs text-bdie-danger hover:bg-bdie-danger/10 border border-white/5 hover:border-bdie-danger/30 rounded-lg transition-all flex items-center justify-center gap-2">
                  <AlertTriangle size={12} /> Purge Old Records
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
