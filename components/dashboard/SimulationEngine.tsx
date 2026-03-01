'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Play, Activity, Terminal, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SimulationEngine() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const { user, activeSimulation, setActiveSimulation, simulationLog, addSimLog, clearSimLog } = useAppStore();

  const scenarios = [
    { id: 'privilege_escalation', name: 'Privilege Escalation', icon: ShieldAlert, description: 'Simulate unauthorized administrative access attempts.' },
    { id: 'data_hoarding', name: 'Data Hoarding', icon: Terminal, description: 'Rapid large-scale file access and archival activity.' },
    { id: 'suspicious_logins', name: 'Anomalous Access', icon: Activity, description: 'Impossible travel and off-hours credential rotation.' },
    { id: 'tone_shift', name: 'Behavioral Drift', icon: Activity, description: 'Sentiment shift in communication indicating insider risk.' },
  ];

  const runScenario = async (id: string) => {
    if (!user) return;

    setIsLaunching(true);
    clearSimLog();
    setActiveSimulation(id as any);
    addSimLog(`[SYSTEM] Initializing scenario: ${id.replace('_', ' ').toUpperCase()}`);
    addSimLog(`[AUTH] Authenticating session for user: ${user.name}`);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: id, target_user_id: user._id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Simulation failed');

      // Stream the logs from result to state with delays for effect
      for (const line of data.result.log) {
        addSimLog(line);
        await new Promise(r => setTimeout(r, 400));
      }

      addSimLog(`[SUCCESS] Scenario completed. Risk Delta: ${data.result.risk_delta}%`);

      // Refresh global stats after simulation
      const riskRes = await fetch('/api/risk/global');
      const riskData = await riskRes.json();
      useAppStore.getState().setGlobalRiskScore(riskData.global_score);

    } catch (err: any) {
      addSimLog(`[ERROR] Execution aborted: ${err.message}`);
    } finally {
      setIsLaunching(false);
    }
  };

  if (user?.role === 'viewer') return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-bdie-accent/10 border border-bdie-accent/30 rounded-xl text-bdie-accent text-xs font-bold hover:bg-bdie-accent/20 transition-all hover:scale-105 active:scale-95"
      >
        <Play size={14} fill="currentColor" />
        LAUNCH SIMULATION
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLaunching && setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-bdie-accent/20 flex items-center justify-center text-bdie-accent">
                    <ActivitySquare size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Threat Simulation Pipeline</h3>
                    <p className="text-xs text-bdie-text-secondary">Validate monitoring efficacy through controlled scenarios.</p>
                  </div>
                </div>
                {!isLaunching && (
                  <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} className="text-bdie-text-secondary" />
                  </button>
                )}
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    disabled={isLaunching}
                    onClick={() => runScenario(s.id)}
                    className={`flex flex-col gap-3 p-4 rounded-2xl border transition-all text-left group ${activeSimulation === s.id
                        ? 'bg-bdie-accent/20 border-bdie-accent shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <s.icon size={20} className={activeSimulation === s.id ? 'text-bdie-accent' : 'text-bdie-text-secondary group-hover:text-white'} />
                      {activeSimulation === s.id && <div className="w-2 h-2 rounded-full bg-bdie-accent animate-pulse" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${activeSimulation === s.id ? 'text-white' : 'text-bdie-text-primary'}`}>{s.name}</p>
                      <p className="text-[10px] text-bdie-text-secondary leading-relaxed mt-1">{s.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-6 pt-0 mt-auto">
                <div className="bg-black/60 rounded-2xl border border-white/5 p-4 h-48 overflow-y-auto font-mono flex flex-col gap-1 custom-scrollbar">
                  {simulationLog.length === 0 ? (
                    <p className="text-bdie-text-secondary/30 text-xs italic">Awaiting scenario selection...</p>
                  ) : (
                    simulationLog.map((log, i) => (
                      <p key={i} className="text-[11px] leading-relaxed">
                        <span className="text-bdie-accent/50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                        <span className={log.startsWith('[ERROR]') ? 'text-bdie-danger' : log.startsWith('[SUCCESS]') ? 'text-emerald-400 font-bold' : 'text-bdie-text-secondary'}>
                          {log}
                        </span>
                      </p>
                    ))
                  )}
                  {isLaunching && <div className="w-1 h-4 bg-bdie-accent animate-pulse mt-1" />}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Separate import for ActivitySquare since it was missing in the view_file of Sidebar but referenced in my head
import { ActivitySquare } from 'lucide-react';
