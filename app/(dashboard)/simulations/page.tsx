'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ActivitySquare, Play, Terminal, Users, Search, History, ChevronRight, TrendingUp } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function SimulationsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      const res = await fetch('/api/simulate');
      const data = await res.json();
      setHistory(data.history || []);
      setLoading(false);
    }
    loadHistory();
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <ActivitySquare className="text-bdie-accent" />
            Simulation Laboratory
          </h1>
          <p className="text-sm text-bdie-text-secondary">Historical logs and results of executed behavioral scenarios.</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-5 border-b border-white/10 text-[10px] font-mono text-bdie-text-secondary uppercase tracking-[0.2em] bg-white/2">
          <div className="col-span-4">Scenario Context</div>
          <div className="col-span-3">Target Entity</div>
          <div className="col-span-2">Telemetry Delta</div>
          <div className="col-span-2">Execution State</div>
          <div className="col-span-1 text-right">Details</div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-20 text-center text-xs font-mono text-bdie-text-secondary animate-pulse">QUERYING SIMULATION ARCHIVE...</div>
          ) : history.length === 0 ? (
            <div className="p-20 text-center italic text-sm text-bdie-text-secondary">No simulation records found in this partition.</div>
          ) : (
            history.map((sim, i) => (
              <div
                key={sim._id}
                className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 hover:bg-white/5 transition-all group"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-bdie-accent/10 border border-bdie-accent/20 flex items-center justify-center text-bdie-accent">
                    <Terminal size={16} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white uppercase tracking-tight truncate">{sim.scenario.replace('_', ' ')}</span>
                    <span className="text-[10px] text-bdie-text-secondary font-mono">ID: {sim._id}</span>
                  </div>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-bdie-text-secondary">
                    <Users size={12} />
                  </div>
                  <span className="text-xs text-white truncate font-medium">{sim.target_user_id?.name || 'Unknown'}</span>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-white">+{sim.risk_delta}%</span>
                    <div className="w-px h-3 bg-white/10" />
                    <TrendingUpArrow delta={sim.risk_delta} />
                  </div>
                </div>
                <div className="col-span-2 items-center flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">{sim.status}</span>
                </div>
                <div className="col-span-1 text-right">
                  <button className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-bdie-text-secondary hover:text-white hover:bg-white/5 transition-all">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TrendingUpArrow({ delta }: { delta: number }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-bdie-danger">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
