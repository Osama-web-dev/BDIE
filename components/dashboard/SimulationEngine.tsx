'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, SimulationScenario } from '@/store/useAppStore';
import { Play, Square, ChevronDown, FlaskConical } from 'lucide-react';

const scenarios: { id: SimulationScenario; label: string }[] = [
  { id: 'none', label: 'Live Monitoring' },
  { id: 'privilege_escalation', label: 'Simulate Privilege Escalation' },
  { id: 'data_hoarding', label: 'Simulate Data Hoarding' },
  { id: 'suspicious_logins', label: 'Simulate Suspicious Logins' },
  { id: 'tone_shift', label: 'Simulate Communication Tone Shift' },
];

export function SimulationEngine() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const activeSimulation = useAppStore((state) => state.activeSimulation);
  const setActiveSimulation = useAppStore((state) => state.setActiveSimulation);
  const setGlobalRiskScore = useAppStore((state) => state.setGlobalRiskScore);
  const notifications = useAppStore((state) => state.notifications);
  const setNotifications = useAppStore((state) => state.setNotifications);

  const handleSelect = async (scenario: SimulationScenario) => {
    setActiveSimulation(scenario);
    setIsOpen(false);
    setIsLoading(true);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.notification) {
          setNotifications([data.notification, ...notifications]);
        }

        // Smoothly animate the score
        let currentScore = useAppStore.getState().globalRiskScore;
        const targetScore = data.newScore;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const newScore = currentScore + (targetScore - currentScore) * easeProgress;
          
          setGlobalRiskScore(newScore);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    } catch (error) {
      console.error('Failed to run simulation', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeLabel = scenarios.find(s => s.id === activeSimulation)?.label;

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 ${
          activeSimulation !== 'none' 
            ? 'bg-bdie-warning/20 border-bdie-warning/50 text-bdie-warning box-glow-warning' 
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FlaskConical size={16} className={activeSimulation !== 'none' || isLoading ? 'animate-pulse' : ''} />
        <span className="text-sm font-medium">{isLoading ? 'Simulating...' : activeLabel}</span>
        <ChevronDown size={16} className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 glass-panel border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleSelect(scenario.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                    activeSimulation === scenario.id 
                      ? 'bg-white/10 text-white font-medium' 
                      : 'text-bdie-text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {scenario.id === 'none' ? <Square size={14} /> : <Play size={14} />}
                  {scenario.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
