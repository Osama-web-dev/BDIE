'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Shield, Users, Database, Settings, ActivitySquare, ShieldAlert, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function Sidebar() {
  const globalRiskScore = useAppStore((state) => state.globalRiskScore);
  const user = useAppStore((state) => state.user);
  const isSidebarCollapsed = useAppStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed);
  const isHighRisk = globalRiskScore > 75;
  const pathname = usePathname();

  // RBAC Filtered Nav Items
  const navItems = [
    { icon: <Activity />, label: 'Command Center', href: '/dashboard', roles: ['admin', 'analyst', 'viewer'] },
    { icon: <Users />, label: 'Digital Twins', href: '/users', roles: ['admin', 'analyst', 'viewer'] },
    { icon: <Shield />, label: 'Risk Analysis', href: '/analysis', roles: ['admin', 'analyst'] },
    { icon: <ActivitySquare />, label: 'Simulations', href: '/simulations', roles: ['admin', 'analyst'] },
    { icon: <FileText />, label: 'Audit Logs', href: '/audit', roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role || 'viewer'));

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 80 : 256 }}
      className="h-full glass-panel border-r border-bdie-border flex flex-col py-6 px-4 gap-8 relative z-20 transition-all duration-300"
    >
      <button
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-bdie-panel border border-bdie-border rounded-full flex items-center justify-center text-bdie-text-secondary hover:text-white z-30 transition-transform active:scale-90"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`flex items-center gap-3 w-full ${isSidebarCollapsed ? 'justify-center' : 'justify-start'}`}>
        <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isHighRisk ? 'bg-bdie-danger/20 text-bdie-danger shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-bdie-accent/20 text-bdie-accent shadow-[0_0_15px_rgba(16,185,129,0.2)]'}`}>
          <ShieldAlert size={24} />
        </div>
        {!isSidebarCollapsed && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden whitespace-nowrap">
            <h1 className="font-mono font-bold text-lg tracking-wider text-bdie-text-primary">BDIE</h1>
            <p className="text-[10px] text-bdie-text-secondary uppercase tracking-widest">Intelligence Engine</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 w-full flex flex-col gap-2">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
            collapsed={isSidebarCollapsed}
          />
        ))}
      </nav>

      <div className="w-full mt-auto">
        <NavItem
          icon={<Settings />}
          label="System Config"
          href="/settings"
          active={pathname === '/settings'}
          collapsed={isSidebarCollapsed}
        />
      </div>
    </motion.aside>
  );
}

function NavItem({ icon, label, href, active, collapsed }: { icon: React.ReactNode, label: string, href: string, active: boolean, collapsed: boolean }) {
  return (
    <Link href={href} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative ${active ? 'bg-white/10 text-white' : 'text-bdie-text-secondary hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center' : ''}`}>
      {active && (
        <motion.div
          layoutId="active-nav"
          className="absolute left-0 top-0 bottom-0 w-1 bg-bdie-accent rounded-r-full"
        />
      )}
      <span className="shrink-0 group-hover:scale-110 transition-transform duration-300">{icon}</span>
      {!collapsed && (
        <span className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all">{label}</span>
      )}
    </Link>
  );
}
