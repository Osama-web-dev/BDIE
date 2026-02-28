'use client';

import { useMemo, useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { useAppStore } from '@/store/useAppStore';
import { format, subHours, addHours } from 'date-fns';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 rounded-lg border border-white/10 shadow-xl">
        <p className="font-mono text-xs text-bdie-text-secondary mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-white capitalize">{entry.name}</span>
            </span>
            <span className="font-mono font-bold" style={{ color: entry.color }}>
              {entry.value?.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function PredictiveGraph() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const activeSimulation = useAppStore((state) => state.activeSimulation);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = useMemo(() => {
    if (!mounted) return [];

    const now = new Date();
    const newData = [];

    // Generate historical data
    for (let i = 12; i >= 0; i--) {
      const time = subHours(now, i);
      newData.push({
        time: format(time, 'HH:mm'),
        // eslint-disable-next-line react-hooks/purity
        baseline: 10 + Math.random() * 5,
        // eslint-disable-next-line react-hooks/purity
        current: 12 + Math.random() * (globalRiskScore / 5),
        predicted: null,
        confidenceUpper: null,
        confidenceLower: null,
        isFuture: false,
      });
    }

    // Generate future prediction data
    let lastCurrent = newData[newData.length - 1].current;
    for (let i = 1; i <= 6; i++) {
      const time = addHours(now, i);

      let predictedRisk = lastCurrent;
      if (activeSimulation === 'privilege_escalation') predictedRisk += i * 8;
      else if (activeSimulation === 'data_hoarding') predictedRisk += i * 5;
      else if (activeSimulation === 'suspicious_logins') predictedRisk += i * 10;
      else if (activeSimulation === 'tone_shift') predictedRisk += i * 3;
      // eslint-disable-next-line react-hooks/purity
      else predictedRisk += (Math.random() - 0.5) * 5;

      predictedRisk = Math.min(Math.max(predictedRisk, 0), 100);

      newData.push({
        time: format(time, 'HH:mm'),
        // eslint-disable-next-line react-hooks/purity
        baseline: 10 + Math.random() * 5,
        current: null,
        predicted: predictedRisk,
        confidenceUpper: Math.min(predictedRisk + i * 3, 100),
        confidenceLower: Math.max(predictedRisk - i * 3, 0),
        isFuture: true,
      });
    }

    return newData;
  }, [globalRiskScore, activeSimulation]);

  if (!mounted) {
    return <div className="w-full h-full min-h-[200px]" />;
  }

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00ff9d" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00ff9d" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffb800" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ffb800" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'var(--font-jetbrains-mono)' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />

          <ReferenceLine x={data.find(d => d.isFuture)?.time} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />

          <Area
            type="monotone"
            dataKey="baseline"
            stroke="rgba(255,255,255,0.2)"
            fill="none"
            strokeWidth={1}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="confidenceUpper"
            stroke="none"
            fill="url(#colorConfidence)"
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="current"
            stroke="#00ff9d"
            fill="url(#colorCurrent)"
            strokeWidth={2}
            isAnimationActive={false}
          />

          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#ffb800"
            strokeDasharray="5 5"
            fill="url(#colorPredicted)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
