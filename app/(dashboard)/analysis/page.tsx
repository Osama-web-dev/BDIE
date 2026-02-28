'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, TrendingUp, AlertTriangle, Users, Activity,
  ChevronDown, ChevronUp, Brain, Lock, Database, Network,
  BarChart3, Eye, GitBranch, Zap
} from 'lucide-react';

const riskVectors = [
  { id: 1, name: 'Privilege Escalation', severity: 'CRITICAL', score: 91, users: 2, icon: Lock, trend: '+12%', color: '#ff3366' },
  { id: 2, name: 'Data Exfiltration Pattern', severity: 'HIGH', score: 78, users: 5, icon: Database, trend: '+4%', color: '#ffb800' },
  { id: 3, name: 'Unusual Login Geography', severity: 'HIGH', score: 74, users: 3, icon: Network, trend: '-2%', color: '#ffb800' },
  { id: 4, name: 'After-Hours Access Anomaly', severity: 'MEDIUM', score: 58, users: 8, icon: Eye, trend: '+8%', color: '#00c8ff' },
  { id: 5, name: 'File Volume Spike', severity: 'MEDIUM', score: 45, users: 12, icon: BarChart3, trend: 'stable', color: '#00ff9d' },
  { id: 6, name: 'Communication Graph Shift', severity: 'LOW', score: 22, users: 19, icon: GitBranch, trend: '-5%', color: '#00ff9d' },
];

const aiInsights = [
  { id: 1, title: 'Coordinated Behavior Detected', body: 'Two accounts show synchronized login patterns 03:00–04:00 UTC, suggesting automated or coordinated activity. Recommend immediate review.', severity: 'critical', icon: Brain },
  { id: 2, title: 'Baseline Drift — Finance Dept', body: 'File access volume in Finance has increased 340% above the 30-day baseline in the past 48h. No corresponding project activity found.', severity: 'high', icon: TrendingUp },
  { id: 3, title: 'Anomalous Privilege Use', body: 'Admin privileges invoked outside normal hours on 3 consecutive days. Pattern does not match approved maintenance windows.', severity: 'high', icon: Zap },
];

const BarChartMini = ({ values, color }: { values: number[], color: string }) => {
  const max = Math.max(...values);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
          className="flex-1 rounded-t-sm min-w-[3px]"
          style={{ background: color, opacity: 0.5 + (v / max) * 0.5 }}
        />
      ))}
    </div>
  );
};

export default function AnalysisPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  const severityBg: Record<string, string> = {
    CRITICAL: 'bg-bdie-danger/10 text-bdie-danger border-bdie-danger/30',
    HIGH: 'bg-bdie-warning/10 text-bdie-warning border-bdie-warning/30',
    MEDIUM: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    LOW: 'bg-bdie-accent/10 text-bdie-accent border-bdie-accent/30',
  };

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto flex flex-col gap-4 pb-6"
      >
        {/* Header */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-32 opacity-5 bg-bdie-danger blur-3xl pointer-events-none" />
          <div className="w-11 h-11 rounded-xl bg-bdie-danger/10 border border-bdie-danger/30 flex items-center justify-center text-bdie-danger">
            <Shield size={22} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Risk Analysis Module</h1>
            <p className="text-xs text-bdie-text-secondary mt-0.5">Multi-vector behavioral threat surface — live analysis</p>
          </div>
          <div className="flex gap-3">
            {[
              { label: 'Critical', count: 1, color: 'text-bdie-danger' },
              { label: 'High', count: 2, color: 'text-bdie-warning' },
              { label: 'Medium', count: 2, color: 'text-blue-400' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className={`text-xl font-bold font-mono ${item.color}`}>{item.count}</p>
                <p className="text-[10px] text-bdie-text-secondary">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Threat Vectors', value: 6, sub: '2 active escalating', icon: AlertTriangle, vals: [20, 35, 28, 42, 38, 55, 62, 48, 70, 74], color: '#ff3366' },
            { label: 'Users Monitored', value: 49, sub: '3 high risk', icon: Users, vals: [40, 42, 41, 45, 43, 47, 49, 46, 49, 49], color: '#00ff9d' },
            { label: 'Events Today', value: 1204, sub: '+18% vs yesterday', icon: Activity, vals: [80, 95, 110, 88, 102, 120, 95, 110, 130, 142], color: '#ffb800' },
            { label: 'Model Confidence', value: '89.4%', sub: 'v3.2-stable', icon: Brain, vals: [82, 84, 85, 86, 87, 87, 88, 88, 89, 89], color: '#00ff9d' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-panel rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon size={14} style={{ color: stat.color }} />
                <span className="font-mono text-lg font-bold text-white">{stat.value}</span>
              </div>
              <BarChartMini values={stat.vals} color={stat.color} />
              <p className="text-xs text-bdie-text-secondary mt-2">{stat.label}</p>
              <p className="text-[10px] text-bdie-text-secondary/60">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Risk Vectors Table */}
          <div className="lg:col-span-3 glass-panel rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">Risk Vectors</h2>
              <span className="text-[10px] text-bdie-text-secondary font-mono">Sorted by severity</span>
            </div>
            <div className="flex flex-col divide-y divide-white/5">
              {riskVectors.map((rv, i) => (
                <div key={rv.id}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${rv.color}15`, border: `1px solid ${rv.color}30` }}>
                      <rv.icon size={14} style={{ color: rv.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-white">{rv.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-mono ${severityBg[rv.severity]}`}>{rv.severity}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1 bg-black/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${rv.score}%` }}
                            transition={{ delay: 0.3 + i * 0.07, duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ background: rv.color }}
                          />
                        </div>
                        <span className="text-xs font-mono shrink-0" style={{ color: rv.color }}>{rv.score}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-bdie-text-secondary">{rv.users} users</p>
                      <p className={`text-[10px] font-mono ${rv.trend.startsWith('+') ? 'text-bdie-danger' : rv.trend.startsWith('-') ? 'text-bdie-accent' : 'text-bdie-text-secondary'}`}>{rv.trend}</p>
                    </div>
                    <button
                      onClick={() => setExpanded(expanded === rv.id ? null : rv.id)}
                      className="text-bdie-text-secondary hover:text-white transition-colors ml-1"
                    >
                      {expanded === rv.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </motion.div>
                  <AnimatePresence>
                    {expanded === rv.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-3 px-11 text-xs text-bdie-text-secondary leading-relaxed">
                          This vector affects {rv.users} monitored users. Behavioral patterns indicate {rv.severity.toLowerCase()} risk across department access logs. Recommended action: immediate supervisor review and temporary access restriction pending investigation.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <div className="glass-panel rounded-2xl p-5 border border-white/10 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={14} className="text-bdie-accent" />
                <h2 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-widest">AI Insights</h2>
              </div>
              <div className="flex flex-col gap-3">
                {aiInsights.map((ai, i) => (
                  <motion.div
                    key={ai.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl border"
                    style={{
                      borderColor: ai.severity === 'critical' ? 'rgba(255,51,102,0.2)' : ai.severity === 'high' ? 'rgba(255,184,0,0.2)' : 'rgba(0,255,157,0.2)',
                      background: ai.severity === 'critical' ? 'rgba(255,51,102,0.04)' : ai.severity === 'high' ? 'rgba(255,184,0,0.04)' : 'rgba(0,255,157,0.04)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <ai.icon size={13} style={{ color: ai.severity === 'critical' ? '#ff3366' : ai.severity === 'high' ? '#ffb800' : '#00ff9d' }} />
                      <span className="text-xs font-medium text-white">{ai.title}</span>
                    </div>
                    <p className="text-[11px] text-bdie-text-secondary leading-relaxed">{ai.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
