'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Activity, Calendar, MapPin,
  ArrowLeft, AlertTriangle, TrendingUp, Info,
  MessageSquare, HardDrive, ShieldAlert, Fingerprint
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import dynamic from 'next/dynamic';

const DigitalTwin = dynamic(
  () => import('@/components/dashboard/DigitalTwin').then(m => ({ default: m.DigitalTwin })),
  { ssr: false }
);

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function fetchData() {
      try {
        const [uRes, hRes, eRes] = await Promise.all([
          fetch(`/api/users/${id}`),
          fetch(`/api/users/${id}/risk`),
          fetch(`/api/explain/${id}`),
        ]);

        const [uData, hData, eData] = await Promise.all([
          uRes.json(),
          hRes.json(),
          eRes.json(),
        ]);

        setUser(uData.user);
        setHistory(hData.history);
        setExplanation(eData.explanation);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (isLoading) return (
    <div className="w-full h-full flex items-center justify-center flex-col gap-4">
      <div className="w-12 h-12 border-2 border-bdie-accent/20 border-t-bdie-accent rounded-full animate-spin" />
      <p className="text-xs font-mono text-bdie-text-secondary tracking-widest uppercase">Initializing Digital Twin...</p>
    </div>
  );

  if (!user) return <div className="p-10 text-center text-bdie-danger">Entity records not found.</div>;

  const latestFactor = history[0]?.factors || [];
  const isHighRisk = user.risk_score > 75;

  return (
    <div className="w-full h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white/5 border border-white/10 rounded-xl text-bdie-text-secondary hover:text-white transition-all active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">{user.name}</h1>
              <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold border ${isHighRisk ? 'bg-bdie-danger/10 border-bdie-danger text-bdie-danger' : 'bg-bdie-accent/10 border-bdie-accent text-bdie-accent'}`}>
                {isHighRisk ? 'Alert-Critical' : 'Nominal'}
              </span>
            </div>
            <p className="text-xs text-bdie-text-secondary mt-0.5">Entity ID: <span className="font-mono">{user._id}</span> • Unit: {user.department}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-bdie-text-secondary">Current Score</span>
            <span className={`text-3xl font-bold font-mono ${isHighRisk ? 'text-bdie-danger shadow-danger' : 'text-bdie-accent shadow-accent'}`}>
              {Math.round(user.risk_score)}%
            </span>
          </div>
          <div className="w-px h-10 bg-white/10 mx-2" />
          <button className="px-4 py-2 bg-bdie-accent text-bdie-bg font-bold rounded-xl active:scale-95 transition-all text-xs">
            GENERATE DOSSIER
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden pb-4">
        {/* Left Column: Visual Twin + Identity */}
        <div className="flex flex-col gap-6 min-h-0">
          <div className="glass-panel flex-1 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center justify-center p-6 min-h-[350px]">
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-bdie-accent">
                <Fingerprint size={16} />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white">Biometric Twin</span>
              </div>
            </div>
            <div className="w-full h-full relative flex items-center justify-center">
              <DigitalTwin scale={1.2} />
            </div>
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-bdie-text-secondary uppercase">Behavioral Drift Index</span>
                <span className="text-xs font-mono text-white">{(user.drift_index || 0).toFixed(4)}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (user.drift_index || 0) * 100)}%` }}
                  className="h-full bg-bdie-accent shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                />
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
            <h3 className="text-xs font-mono text-bdie-text-secondary uppercase tracking-[.2em] mb-4">Identity Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <MetaItem icon={MapPin} label="Home Region" value="North America (US-East)" />
              <MetaItem icon={Activity} label="Trust Score" value="84/100" />
              <MetaItem icon={Shield} label="Access Level" value={user.role.toUpperCase()} />
              <MetaItem icon={Calendar} label="Last Active" value={new Date().toLocaleDateString()} />
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Explainability */}
        <div className="xl:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="glass-panel flex-1 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
            <div className="flex items-center border-b border-white/10 p-2">
              <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Risk Breakdown" icon={AlertTriangle} />
              <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} label="AI Insight" icon={TrendingUp} />
              <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Activity" icon={Activity} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {latestFactor.map((f: any) => (
                        <FactorCard key={f.name} factor={f} />
                      ))}
                      {latestFactor.length === 0 && <div className="col-span-2 p-10 text-center text-bdie-text-secondary italic">No behavioral vectors tracked for this period.</div>}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'ai' && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-bdie-accent/5 border border-bdie-accent/20 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-bdie-accent/20 flex items-center justify-center text-bdie-accent">
                          <TrendingUp size={18} />
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Automated Threat Narrative</h4>
                      </div>
                      <p className="text-sm text-bdie-text-secondary leading-relaxed first-letter:text-2xl first-letter:font-bold first-letter:text-bdie-accent first-letter:mr-1">
                        {explanation?.summary || "Analyzing current behavioral snapshots for anomalous patterns..."}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-mono uppercase tracking-widest text-bdie-text-secondary">Factor Contribution Analysis</h4>
                      {explanation?.factor_explanations?.map((ex: any) => (
                        <div key={ex.factor} className="p-4 bg-white/2 border border-white/5 rounded-xl flex items-start gap-4">
                          <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${ex.severity === 'critical' ? 'text-bdie-danger bg-bdie-danger/10' : 'text-bdie-accent bg-bdie-accent/10'}`}>
                            <Info size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-tight mb-1">{ex.label} — {ex.contribution}%</p>
                            <p className="text-xs text-bdie-text-secondary leading-relaxed">{ex.impact}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'logs'}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-bdie-text-secondary">
        <Icon size={12} />
        <span className="text-[10px] uppercase font-mono tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-medium text-white">{value}</span>
    </div>
  );
}

function TabButton({ active, onClick, label, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-tight rounded-xl transition-all relative ${active ? 'text-white bg-white/5' : 'text-bdie-text-secondary hover:text-white hover:bg-white/2'}`}
    >
      <Icon size={14} className={active ? 'text-bdie-accent' : ''} />
      {label}
      {active && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-bdie-accent" />}
    </button>
  );
}

function FactorCard({ factor }: { factor: any }) {
  const icons: any = {
    login_anomaly: ShieldAlert,
    privilege_escalation: Shield,
    file_access_anomaly: HardDrive,
    data_volume_anomaly: Activity,
    tone_shift: MessageSquare
  };
  const Icon = icons[factor.name] || Shield;

  return (
    <div className="p-4 glass-panel border border-white/5 rounded-2xl flex flex-col gap-3 group hover:border-white/10 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-bdie-accent group-hover:scale-110 transition-transform">
            <Icon size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-white">{factor.label}</span>
        </div>
        <span className="text-[10px] font-mono text-bdie-text-secondary">{factor.contribution}% Impact</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${factor.contribution}%` }}
          className="h-full bg-bdie-accent shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        />
      </div>
    </div>
  );
}
