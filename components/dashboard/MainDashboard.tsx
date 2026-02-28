'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Activity, Database, Users } from 'lucide-react';

// Lazy-load all Three.js and heavy chart components — they don't block initial render
const PredictiveGraph = dynamic(
  () => import('./PredictiveGraph').then(m => ({ default: m.PredictiveGraph })),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[200px]" /> }
);
const DigitalTwin = dynamic(
  () => import('./DigitalTwin').then(m => ({ default: m.DigitalTwin })),
  { ssr: false, loading: () => <div className="w-full h-full min-h-[300px]" /> }
);
const ActivityClusters = dynamic(
  () => import('./ActivityClusters').then(m => ({ default: m.ActivityClusters })),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);
const SimulationEngine = dynamic(
  () => import('./SimulationEngine').then(m => ({ default: m.SimulationEngine })),
  { ssr: false }
);
const TimeTravelSlider = dynamic(
  () => import('./TimeTravelSlider').then(m => ({ default: m.TimeTravelSlider })),
  { ssr: false }
);

// Memoize panels so they don't re-render when Zustand updates globalRiskScore
const GraphPanel = memo(function GraphPanel() {
  return (
    <div
      className="flex-1 min-h-[300px] glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden group"
      style={{ contain: 'layout style' }}
    >
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-bdie-accent/40 to-transparent" />
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-bdie-accent" />
          <h2 className="font-mono text-sm tracking-widest text-white uppercase">Future Risk Projection</h2>
        </div>
        <span className="text-xs font-mono text-bdie-text-secondary bg-black/40 px-2 py-1 rounded-md border border-white/5">
          Confidence: 89%
        </span>
      </div>
      <div className="flex-1 w-full relative">
        <PredictiveGraph />
      </div>
    </div>
  );
});

const ClusterPanel = memo(function ClusterPanel() {
  return (
    <div
      className="h-48 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden"
      style={{ contain: 'layout style' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Database size={18} className="text-bdie-accent" />
        <h2 className="font-mono text-sm tracking-widest text-white uppercase">Activity Clustering</h2>
      </div>
      <div className="flex-1 w-full relative">
        <ActivityClusters />
      </div>
    </div>
  );
});

const TwinPanel = memo(function TwinPanel({ isHighRisk, driftScore }: { isHighRisk: boolean; driftScore: string }) {
  return (
    <div
      className="flex-1 glass-panel rounded-2xl border border-white/5 p-6 flex flex-col relative overflow-hidden items-center justify-center"
      style={{ contain: 'layout style' }}
    >
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <Users size={18} className="text-bdie-accent" />
        <h2 className="font-mono text-sm tracking-widest text-white uppercase">Digital Twin</h2>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <span className={`text-xs font-mono px-2 py-1 rounded-md border ${isHighRisk ? 'bg-bdie-danger/20 text-bdie-danger border-bdie-danger/50' : 'bg-bdie-accent/20 text-bdie-accent border-bdie-accent/50'}`}>
          Drift: {driftScore}%
        </span>
      </div>
      <div className="w-full h-full relative flex items-center justify-center">
        <DigitalTwin />
      </div>
    </div>
  );
});

export function MainDashboard() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const isHighRisk = globalRiskScore > 75;
  const driftScore = globalRiskScore.toFixed(1);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-medium tracking-tight text-white">Intelligence Command Center</h1>
          <p className="text-sm text-bdie-text-secondary mt-1">Real-time behavioral drift analysis and predictive risk visualization.</p>
        </div>
        <SimulationEngine />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          <GraphPanel />
          <ClusterPanel />
        </div>
        <div className="flex flex-col gap-6 min-h-0">
          <TwinPanel isHighRisk={isHighRisk} driftScore={driftScore} />
        </div>
      </div>

      <div className="h-20 glass-panel rounded-2xl border border-white/5 px-6 flex items-center relative overflow-hidden">
        <TimeTravelSlider />
      </div>
    </div>
  );
}
