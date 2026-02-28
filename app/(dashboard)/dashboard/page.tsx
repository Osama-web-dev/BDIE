'use client';

import { MainDashboard } from '@/components/dashboard/MainDashboard';
import { RightPanel } from '@/components/layout/RightPanel';
import { SmartAlertBanner } from '@/components/ui/SmartAlertBanner';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'motion/react';

export default function DashboardPage() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);

  return (
    <>
      {/* Main content area + right panel side by side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden gap-3">
        {/* Alert banner sits above the main panel, in-flow (not absolute) */}
        <AnimatePresence>
          {globalRiskScore > 75 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden shrink-0"
            >
              <SmartAlertBanner />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto overflow-x-hidden glass-panel rounded-2xl p-6 flex flex-col gap-6 relative">
          <MainDashboard />
        </main>
      </div>

      <RightPanel />
    </>
  );
}
