'use client';

import { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';
import { useAppStore } from '@/store/useAppStore';

export function ActivityClusters() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const activeSimulation = useAppStore((state) => state.activeSimulation);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!mounted) return [];
    
    const clusters = [];
    const numClusters = 5 + Math.floor(globalRiskScore / 20);
    
    for (let i = 0; i < numClusters; i++) {
      // eslint-disable-next-line react-hooks/purity
      let x = Math.random() * 100;
      // eslint-disable-next-line react-hooks/purity
      let y = Math.random() * 100;
      // eslint-disable-next-line react-hooks/purity
      let z = Math.random() * 500 + 100;
      // eslint-disable-next-line react-hooks/purity
      let risk = Math.random() * 100;

      // Adjust based on simulation
      if (activeSimulation === 'suspicious_logins' && i < 3) {
        // eslint-disable-next-line react-hooks/purity
        x = 80 + Math.random() * 20;
        // eslint-disable-next-line react-hooks/purity
        y = 80 + Math.random() * 20;
        // eslint-disable-next-line react-hooks/purity
        z = 800 + Math.random() * 400;
        // eslint-disable-next-line react-hooks/purity
        risk = 90 + Math.random() * 10;
      } else if (activeSimulation === 'data_hoarding' && i === 0) {
        z = 2000;
        risk = 95;
      }

      clusters.push({
        x,
        y,
        z,
        risk,
        name: `Cluster ${i + 1}`,
      });
    }
    return clusters;
  }, [globalRiskScore, activeSimulation]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-lg border border-white/10 shadow-xl">
          <p className="font-mono text-xs text-white mb-2">{data.name}</p>
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-bdie-text-secondary">Frequency: <span className="text-white font-mono">{Math.round(data.z)}</span></span>
            <span className="text-bdie-text-secondary">Anomaly: <span className="text-white font-mono">{data.risk.toFixed(1)}%</span></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
          <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
          <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} />
          <Scatter data={data} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.risk > 75 ? '#ff3366' : entry.risk > 50 ? '#ffb800' : '#00ff9d'} 
                fillOpacity={0.6}
                stroke={entry.risk > 75 ? '#ff3366' : entry.risk > 50 ? '#ffb800' : '#00ff9d'}
                strokeWidth={1}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
