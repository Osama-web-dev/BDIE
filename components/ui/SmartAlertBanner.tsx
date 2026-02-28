'use client';

import { motion } from 'motion/react';
import { AlertTriangle, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function SmartAlertBanner() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const setGlobalRiskScore = useAppStore((state) => state.setGlobalRiskScore);

  return (
    <div className="w-full glass-panel border border-bdie-danger/50 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(255,51,102,0.15)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-bdie-danger/10 to-transparent pointer-events-none" />
      
      <div className="flex items-center gap-4 z-10">
        <div className="w-12 h-12 rounded-xl bg-bdie-danger/20 flex items-center justify-center text-bdie-danger box-glow-danger animate-pulse">
          <ShieldAlert size={24} />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-bold text-white uppercase tracking-widest">Critical Risk Detected</h3>
            <span className="px-2 py-0.5 rounded-full bg-bdie-danger/20 text-bdie-danger text-[10px] font-mono border border-bdie-danger/50">
              Severity: High
            </span>
          </div>
          <p className="text-sm text-bdie-text-secondary mt-1">
            Multiple anomalous behaviors detected for user <span className="text-white font-mono">USR-78291A</span>. Privilege escalation likely.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 z-10">
        <button className="px-4 py-2 bg-bdie-danger hover:bg-bdie-danger/80 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
          Lock Account
          <ArrowRight size={16} />
        </button>
        <button 
          onClick={() => setGlobalRiskScore(12)} // Reset for demo purposes
          className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-bdie-text-secondary hover:text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
