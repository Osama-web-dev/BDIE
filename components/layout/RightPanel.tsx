'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { Brain, ShieldAlert, Activity, ArrowRight, ChevronRight, AlertCircle, Database, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const mockReasons = [
  { id: 1, factor: 'Irregular Login Clustering', weight: 45, confidence: 92, time: '2m ago', icon: Activity },
  { id: 2, factor: 'Increased Privilege Exploration', weight: 30, confidence: 85, time: '15m ago', icon: Lock },
  { id: 3, factor: 'File Sensitivity Escalation', weight: 25, confidence: 78, time: '1h ago', icon: Database },
];

export function RightPanel() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const isHighRisk = globalRiskScore > 75;
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  return (
    <motion.aside
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 300, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="w-80 h-full glass-panel border-l border-bdie-border flex flex-col p-6 gap-6 relative z-30"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-16 bg-bdie-panel border border-bdie-border rounded-l-xl flex items-center justify-center text-bdie-text-secondary hover:text-white transition-colors z-40"
      >
        <ChevronRight size={20} className={`transform transition-transform ${isOpen ? '' : 'rotate-180'}`} />
      </button>

      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Brain size={24} className="text-bdie-accent text-glow-accent" />
        <div>
          <h2 className="font-mono font-bold text-sm tracking-widest text-white uppercase">AI Reasoning</h2>
          <p className="text-[10px] text-bdie-text-secondary uppercase tracking-widest">Transparency Module</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 custom-scrollbar">
        <AnimatePresence>
          {mockReasons.map((reason, index) => (
            <motion.div
              key={reason.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 100, damping: 15 }}
              className="bg-black/40 border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-colors group cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-bdie-accent opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <reason.icon size={16} className="text-bdie-text-secondary group-hover:text-bdie-accent transition-colors" />
                  <span className="font-medium text-sm text-white">{reason.factor}</span>
                </div>
                <span className="text-[10px] font-mono text-bdie-text-secondary">{reason.time}</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-bdie-text-secondary">Weight Impact</span>
                  <span className="font-mono text-bdie-accent">{reason.weight}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reason.weight}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 1, ease: 'easeOut' }}
                    className="h-full bg-bdie-accent"
                  />
                </div>

                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-bdie-text-secondary">Confidence</span>
                  <span className="font-mono text-white">{reason.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${reason.confidence}%` }}
                    transition={{ delay: 0.7 + index * 0.1, duration: 1, ease: 'easeOut' }}
                    className="h-full bg-white/30"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-bdie-text-secondary uppercase tracking-widest">Model Confidence</span>
          <span className="font-mono text-sm text-white">89.4%</span>
        </div>
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '89.4%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-bdie-accent/50 to-bdie-accent"
          />
        </div>
        <button onClick={() => router.push('/analysis')} className="w-full mt-2 py-3 bg-white/5 hover:bg-bdie-accent/10 border border-white/10 hover:border-bdie-accent/30 rounded-xl text-xs font-medium text-white transition-all flex items-center justify-center gap-2 group">
          View Full Analysis
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.aside>
  );
}
