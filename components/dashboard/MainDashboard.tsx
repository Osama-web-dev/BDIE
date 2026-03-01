'use client';

import dynamic from 'next/dynamic';
import { memo, useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Activity, Database, Users, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

const PredictiveGraph = dynamic(
  () => import('./PredictiveGraph').then(m => ({ default: m.PredictiveGraph })),
  { ssr: false, loading: () => <div className="w-full h-64 bg-white/5 animate-pulse rounded-xl" /> }
);
const DigitalTwin = dynamic(
  () => import('./DigitalTwin').then(m => ({ default: m.DigitalTwin })),
  { ssr: false, loading: () => <div className="w-full h-80 flex items-center justify-center"><div className="w-20 h-20 border-2 border-bdie-accent/20 border-t-bdie-accent rounded-full animate-spin" /></div> }
);
const SimulationEngine = dynamic(
  () => import('./SimulationEngine').then(m => ({ default: m.SimulationEngine })),
  { ssr: false }
);

const MetricCard = ({ title, value, sub, icon: Icon, color }: any) => (
  <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col gap-1 group hover:border-white/10 transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-widest text-bdie-text-secondary font-mono">{title}</span>
      <div className={`p-2 rounded-lg bg-${color}/10 text-${color} group-hover:scale-110 transition-transform`}>
        <Icon size={16} />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
      <span className="text-[10px] text-bdie-text-secondary font-mono">{sub}</span>
    </div>
  </div>
);

const TwinPanel = memo(function TwinPanel({ score, isHighRisk }: { score: number; isHighRisk: boolean }) {
  return (
    <div className="flex-1 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden items-center justify-center min-h-[400px]">
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Users size={16} className="text-bdie-accent" />
        <h2 className="font-mono text-[10px] tracking-widest text-white uppercase px-1">Global Digital Twin</h2>
      </div>
      <div className="absolute top-0 right-0 p-6 z-10 text-right">
        <p className="text-[10px] uppercase tracking-tighter text-bdie-text-secondary">Network Status</p>
        <p className={`text-xs font-mono font-bold ${isHighRisk ? 'text-bdie-danger animate-pulse' : 'text-bdie-accent'}`}>
          {isHighRisk ? 'CRITICAL DRIFT' : 'NOMINAL'}
        </p>
      </div>
      <div className="w-full h-full relative flex items-center justify-center">
        <DigitalTwin />
      </div>
    </div>
  );
});

export function MainDashboard() {
  const { globalRiskScore, user } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const isHighRisk = globalRiskScore > 75;

  useEffect(() => {
    fetch('/api/risk/global')
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-bdie-accent animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Intelligence Command Center</h1>
          </div>
          <p className="text-sm text-bdie-text-secondary">System-wide behavioral analysis for {stats?.user_count || '--'} monitored entities.</p>
        </div>
        <SimulationEngine />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Global Risk Index"
          value={`${Math.round(globalRiskScore)}%`}
          sub="+2.4% vs last 24h"
          icon={Activity}
          color="bdie-accent"
        />
        <MetricCard
          title="Critical Anomalies"
          value={stats?.distribution?.critical || '0'}
          sub="Requires attention"
          icon={AlertTriangle}
          color="bdie-danger"
        />
        <MetricCard
          title="Active Sessions"
          value={stats?.user_count || '0'}
          sub="Real-time monitoring"
          icon={ShieldCheck}
          color="emerald-500"
        />
        <MetricCard
          title="Predictive Confidence"
          value="92%"
          sub="ML Model Alpha v4"
          icon={TrendingUp}
          color="bdie-accent"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="flex-1 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-bdie-accent" />
                <h2 className="font-mono text-xs tracking-widest text-white uppercase">Aggregated Risk Projection</h2>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-bdie-accent" />
                  <span className="text-[10px] text-bdie-text-secondary uppercase">Historical</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-bdie-accent/30 border border-bdie-accent/50" />
                  <span className="text-[10px] text-bdie-text-secondary uppercase">Forecast</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full relative">
              <PredictiveGraph />
            </div>
          </div>

          <div className="h-48 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-bdie-accent" />
                <h2 className="font-mono text-xs tracking-widest text-white uppercase">Departmental Risk Vectors</h2>
              </div>
              <button className="text-[10px] uppercase tracking-widest text-bdie-accent hover:text-white transition-colors">Full Report →</button>
            </div>
            <div className="flex-1 flex items-end gap-2 px-2 overflow-x-auto custom-scrollbar pb-2">
              {stats?.departments?.map((dept: any) => (
                <div key={dept.name} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
                  <div className="w-full relative bg-white/5 rounded-t-md overflow-hidden h-24">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${dept.avg_score}%` }}
                      className={`absolute bottom-0 left-0 right-0 ${dept.severity === 'critical' ? 'bg-bdie-danger/40 border-t border-bdie-danger' : 'bg-bdie-accent/30 border-t border-bdie-accent/50'}`}
                    />
                  </div>
                  <span className="text-[9px] text-bdie-text-secondary uppercase truncate w-full text-center group-hover:text-white transition-colors">{dept.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 min-h-0">
          <TwinPanel score={globalRiskScore} isHighRisk={isHighRisk} />
        </div>
      </div>
    </div>
  );
}
