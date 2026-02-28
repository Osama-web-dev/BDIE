import { create } from 'zustand';

export type SimulationScenario = 'none' | 'privilege_escalation' | 'data_hoarding' | 'suspicious_logins' | 'tone_shift';

interface User {
  _id: string;
  name: string;
  role: string;
  department: string;
  email: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  globalRiskScore: number;
  setGlobalRiskScore: (score: number) => void;
  
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  
  isTimeTravelMode: boolean;
  setTimeTravelMode: (active: boolean) => void;
  
  timeTravelDate: Date;
  setTimeTravelDate: (date: Date) => void;
  
  activeSimulation: SimulationScenario;
  setActiveSimulation: (scenario: SimulationScenario) => void;
  
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  globalRiskScore: 12,
  setGlobalRiskScore: (score) => set({ globalRiskScore: score }),
  
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n._id === id ? { ...n, read: true } : n)
  })),
  
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  
  selectedUserId: 'u-78291a',
  setSelectedUserId: (id) => set({ selectedUserId: id }),
  
  isTimeTravelMode: false,
  setTimeTravelMode: (active) => set({ isTimeTravelMode: active }),
  
  timeTravelDate: new Date(),
  setTimeTravelDate: (date) => set({ timeTravelDate: date }),
  
  activeSimulation: 'none',
  setActiveSimulation: (scenario) => set({ activeSimulation: scenario }),
  
  theme: 'dark',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
