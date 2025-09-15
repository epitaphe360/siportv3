import { create } from 'zustand';
import { Dashboard, DashboardStats, Activity } from '../types';

interface DashboardState {
  dashboard: Dashboard | null;
  isLoading: boolean;
  
  // Actions
  fetchDashboard: () => Promise<void>;
  updateStats: (stats: Partial<DashboardStats>) => void;
}

const mockStats: DashboardStats = {
  profileViews: 1247,
  connections: 24,
  appointments: 8,
  messages: 15,
  catalogDownloads: 89,
  miniSiteViews: 2156
};

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'profile_view',
    description: 'Sarah Johnson a consulté votre profil',
    timestamp: new Date(Date.now() - 3600000),
    userId: 'user2',
    userName: 'Sarah Johnson'
  },
  {
    id: '2',
    type: 'message',
    description: 'Nouveau message de Ahmed El Mansouri',
    timestamp: new Date(Date.now() - 7200000),
    userId: 'user3',
    userName: 'Ahmed El Mansouri'
  },
  {
    id: '3',
    type: 'appointment',
    description: 'Rendez-vous confirmé avec Maritime Tech Solutions',
    timestamp: new Date(Date.now() - 10800000),
    userId: 'user4',
    userName: 'Maritime Tech Solutions'
  },
  {
    id: '4',
    type: 'download',
    description: 'Votre catalogue a été téléchargé 5 fois aujourd\'hui',
    timestamp: new Date(Date.now() - 14400000)
  },
  {
    id: '5',
    type: 'connection',
    description: 'Nouvelle connexion avec Dr. Maria Santos',
    timestamp: new Date(Date.now() - 18000000),
    userId: 'user5',
    userName: 'Dr. Maria Santos'
  }
];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboard: null,
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dashboard: Dashboard = {
        stats: mockStats,
        recentActivity: mockActivities,
        upcomingEvents: [], // Will be populated from eventStore
        recommendations: [] // Will be populated from networkingStore
      };

      set({ dashboard, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateStats: (newStats) => {
    const { dashboard } = get();
    if (dashboard) {
      set({
        dashboard: {
          ...dashboard,
          stats: { ...dashboard.stats, ...newStats }
        }
      });
    }
  }
}));