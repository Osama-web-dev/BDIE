import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL STATE STORE (zustand)
//
// Replaces the prototype store with production-ready slices for:
// 1. Auth & User Profile
// 2. Dashboard Analytics
// 3. UI State (Sidebar, Theme, Modals)
// 4. Notifications
// 5. Active Simulation State
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'analyst' | 'viewer';
export type SimulationScenario = 'none' | 'privilege_escalation' | 'data_hoarding' | 'suspicious_logins' | 'tone_shift';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: string;
  risk_score: number;
  drift_index: number;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  link: string;
  createdAt: string;
}

interface AppState {
  // Auth Slice
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Analytics Slice
  globalRiskScore: number;
  setGlobalRiskScore: (score: number) => void;
  recentHistory: any[];
  setRecentHistory: (history: any[]) => void;

  // Notification Slice
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (notifications: Notification[], unread: number) => void;
  markRead: (id: string | 'all') => void;

  // UI Slice
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeModal: string | null;
  setActiveModal: (id: string | null) => void;

  // Simulation Slice
  activeSimulation: SimulationScenario;
  setActiveSimulation: (scenario: SimulationScenario) => void;
  simulationLog: string[];
  addSimLog: (msg: string) => void;
  clearSimLog: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, notifications: [], unreadCount: 0 }),

      // Analytics
      globalRiskScore: 0,
      setGlobalRiskScore: (score) => set({ globalRiskScore: score }),
      recentHistory: [],
      setRecentHistory: (history) => set({ recentHistory: history }),

      // Notifications
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications, unread) => set({ notifications, unreadCount: unread }),
      markRead: (id) => set((state) => {
        if (id === 'all') {
          return {
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          };
        }
        return {
          notifications: state.notifications.map(n => n._id === id ? { ...n, read: true } : n),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      }),

      // UI
      isSidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      theme: 'dark',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      activeModal: null,
      setActiveModal: (id) => set({ activeModal: id }),

      // Simulation
      activeSimulation: 'none',
      setActiveSimulation: (scenario) => set({ activeSimulation: scenario }),
      simulationLog: [],
      addSimLog: (msg) => set((state) => ({ simulationLog: [...state.simulationLog, msg] })),
      clearSimLog: () => set({ simulationLog: [] }),
    }),
    {
      name: 'bdie-storage',
      partialize: (state) => ({ theme: state.theme, isSidebarCollapsed: state.isSidebarCollapsed }),
    }
  )
);
