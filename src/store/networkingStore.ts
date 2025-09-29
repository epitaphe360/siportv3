import { create } from 'zustand';
import { toast } from 'sonner';
import { NetworkingRecommendation, User } from '@/types';
import RecommendationService from '@/services/recommendationService';
import useAuthStore from './authStore';
import { SupabaseService } from '@/services/supabaseService';
import { 
  getNetworkingPermissions, 
  getEventAccessPermissions,
  checkDailyLimits,
  getPermissionErrorMessage,
  type NetworkingPermissions,
  type EventAccessPermissions
} from '@/lib/networkingPermissions';

// Types
interface AIInsights {
  summary: string;
  suggestions: string[];
  topKeywords: string[];
}

// AI Insights will be fetched from backend
const generateAIInsights = async (userId: string): Promise<AIInsights> => {
  try {
    // Call to AI service would be here
    const insights = await SupabaseService.getNetworkingInsights?.(userId);
    return insights || {
      summary: "Analyse de votre réseau en cours...",
      suggestions: ["Connectez-vous avec plus d'exposants", "Participez aux événements recommandés"],
      topKeywords: ["Réseautage", "Opportunités"],
    };
  } catch {
    return {
      summary: "Développez votre réseau professionnel.",
      suggestions: ["Explorez les profils d'exposants", "Participez aux événements"],
      topKeywords: ["Networking", "Connections"],
    };
  }
};

interface DailyUsage {
  connections: number;
  messages: number;
  meetings: number;
  lastReset: Date;
}

interface NetworkingState {
  recommendations: NetworkingRecommendation[];
  connections: string[]; // Array of user IDs
  favorites: string[]; // Array of user IDs
  pendingConnections: string[]; // Array of user IDs
  aiInsights: AIInsights | null;
  isLoading: boolean;
  error: string | null;
  
  // Permissions and usage tracking
  permissions: NetworkingPermissions | null;
  eventPermissions: EventAccessPermissions | null;
  dailyUsage: DailyUsage;
  
  // Appointment Modal State
  showAppointmentModal: boolean;
  selectedExhibitorForRDV: User | null; // Using User type for profile data
  selectedTimeSlot: string;
  appointmentMessage: string;

  // Actions
  fetchRecommendations: () => Promise<void>;
  generateRecommendations: (userId: string) => Promise<void>;
  markAsContacted: (recommendedUserId: string) => void;
  
  // Permission-aware actions
  handleConnect: (userId: string, userName: string) => void;
  addToFavorites: (userId: string) => void;
  removeFromFavorites: (userId: string) => void;
  handleMessage: (userName: string, company: string) => void;
  handleScheduleMeeting: (userName: string, company: string) => void;
  
  // Permission management
  updatePermissions: () => void;
  checkActionPermission: (action: 'connect' | 'message' | 'meeting') => boolean;
  getRemainingQuota: () => { connections: number; messages: number; meetings: number };
  
  // AI and insights
  loadAIInsights: () => void;

  // Modal Actions
  setShowAppointmentModal: (show: boolean) => void;
  setSelectedExhibitorForRDV: (exhibitor: User | null) => void;
  setSelectedTimeSlot: (slot: string) => void;
  setAppointmentMessage: (message: string) => void;
}

export const useNetworkingStore = create<NetworkingState>((set, get) => ({
  // State
  recommendations: [],
  connections: [], // Will be loaded from Supabase
  favorites: [], // Will be loaded from Supabase
  pendingConnections: [],
  aiInsights: null,
  isLoading: false,
  error: null,
  
  // Permissions and usage
  permissions: null,
  eventPermissions: null,
  dailyUsage: {
    connections: 0,
    messages: 0,
    meetings: 0,
    lastReset: new Date(),
  },
  
  // Appointment Modal State
  showAppointmentModal: false,
  selectedExhibitorForRDV: null,
  selectedTimeSlot: '',
  appointmentMessage: '',

  // Actions
  fetchRecommendations: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ error: 'User not authenticated.', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const allUsers = await SupabaseService.getUsers();
      const recommendations = await RecommendationService.generateRecommendations(user, allUsers);
      set({ recommendations, isLoading: false });
    } catch (e) {
      const error = e instanceof Error ? e.message : 'An unknown error occurred.';
      set({ error, isLoading: false });
      console.error("Failed to fetch recommendations:", error);
    }
  },

  generateRecommendations: async (userId: string) => {
    // This can be an alias for fetchRecommendations or have its own logic
    toast.info(`Génération de recommandations pour l'utilisateur ${userId}...`);
    await get().fetchRecommendations();
  },

  markAsContacted: (recommendedUserId: string) => {
    set(state => ({
      recommendations: state.recommendations.map(rec =>
        rec.recommendedUserId === recommendedUserId ? { ...rec, contacted: true } : rec
      ),
    }));
    toast.success("Utilisateur marqué comme contacté.");
  },

  handleConnect: (userId: string, userName: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer une demande de connexion.");
      return;
    }

    // Check permissions
    if (!get().checkActionPermission('connect')) {
      const errorMessage = getPermissionErrorMessage(user.type, user.profile.passType || user.profile.status, 'connection');
      toast.error(errorMessage);
      return;
    }

    set(state => ({
      pendingConnections: [...state.pendingConnections, userId],
      dailyUsage: {
        ...state.dailyUsage,
        connections: state.dailyUsage.connections + 1,
      },
    }));
    
    toast.success(`✅ Demande de connexion envoyée à ${userName}.`);
    
    // Show remaining quota if limited
    const remaining = get().getRemainingQuota();
    if (remaining.connections > 0 && remaining.connections < 5) {
      toast.info(`📊 Il vous reste ${remaining.connections} connexion(s) aujourd'hui.`);
    }
  },

  addToFavorites: (userId: string) => {
    set(state => ({
      favorites: [...state.favorites, userId],
    }));
  },

  removeFromFavorites: (userId: string) => {
    set(state => ({
      favorites: state.favorites.filter(id => id !== userId),
    }));
  },

  handleMessage: (userName: string, company: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté pour envoyer un message.");
      return;
    }

    // Check permissions
    if (!get().checkActionPermission('message')) {
      const errorMessage = getPermissionErrorMessage(user.type, user.profile.passType || user.profile.status, 'message');
      toast.error(errorMessage);
      return;
    }

    set(state => ({
      dailyUsage: {
        ...state.dailyUsage,
        messages: state.dailyUsage.messages + 1,
      },
    }));

    toast.success(`💬 Message envoyé à ${userName} de ${company}.`);
    
    // Show remaining quota
    const remaining = get().getRemainingQuota();
    if (remaining.messages > 0 && remaining.messages < 5) {
      toast.info(`📊 Il vous reste ${remaining.messages} message(s) aujourd'hui.`);
    }
  },

  handleScheduleMeeting: (userName: string, company: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté pour programmer un rendez-vous.");
      return;
    }

    // Check permissions
    if (!get().checkActionPermission('meeting')) {
      const errorMessage = getPermissionErrorMessage(user.type, user.profile.passType || user.profile.status, 'meeting');
      toast.error(errorMessage);
      return;
    }

    set(state => ({
      dailyUsage: {
        ...state.dailyUsage,
        meetings: state.dailyUsage.meetings + 1,
      },
    }));

    toast.success(`📅 Demande de rendez-vous envoyée à ${userName} de ${company}.`);
    
    // Show remaining quota
    const remaining = get().getRemainingQuota();
    if (remaining.meetings > 0 && remaining.meetings < 3) {
      toast.info(`📊 Il vous reste ${remaining.meetings} rendez-vous aujourd'hui.`);
    }
  },

  // Permission management methods
  updatePermissions: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const permissions = getNetworkingPermissions(user.type, user.profile.passType || user.profile.status);
    const eventPermissions = getEventAccessPermissions(user.type, user.profile.passType || user.profile.status);
    
    set({ permissions, eventPermissions });
  },

  checkActionPermission: (action: 'connect' | 'message' | 'meeting') => {
    const { user } = useAuthStore.getState();
    const state = get();
    
    if (!user || !state.permissions) {
      get().updatePermissions();
      return false;
    }

    // Check if today's usage should be reset
    const now = new Date();
    const lastReset = state.dailyUsage.lastReset;
    const shouldReset = now.getDate() !== lastReset.getDate() || 
                       now.getMonth() !== lastReset.getMonth() || 
                       now.getFullYear() !== lastReset.getFullYear();

    if (shouldReset) {
      set(() => ({
        dailyUsage: {
          connections: 0,
          messages: 0,
          meetings: 0,
          lastReset: now,
        },
      }));
    }

    // Check basic permission
    switch (action) {
      case 'connect':
        if (!state.permissions.canMakeConnections) return false;
        break;
      case 'message':
        if (!state.permissions.canSendMessages) return false;
        break;
      case 'meeting':
        if (!state.permissions.canScheduleMeetings) return false;
        break;
    }

    // Check daily limits
    const limits = checkDailyLimits(user.type, user.profile.passType || user.profile.status, state.dailyUsage);
    
    switch (action) {
      case 'connect':
        return limits.canMakeConnection;
      case 'message':
        return limits.canSendMessage;
      case 'meeting':
        return limits.canScheduleMeeting;
      default:
        return false;
    }
  },

  getRemainingQuota: () => {
    const { user } = useAuthStore.getState();
    const state = get();
    
    if (!user) return { connections: 0, messages: 0, meetings: 0 };
    
    const limits = checkDailyLimits(user.type, user.profile.passType || user.profile.status, state.dailyUsage);
    
    return {
      connections: limits.remainingConnections,
      messages: limits.remainingMessages,
      meetings: limits.remainingMeetings,
    };
  },

  loadAIInsights: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ isLoading: true });
    try {
      const insights = await generateAIInsights(user.id);
      set({ aiInsights: insights, isLoading: false });
      toast.success('Insights IA générés avec succès !');
    } catch (error) {
      set({ isLoading: false });
      toast.error('Erreur lors de la génération des insights.');
    }
  },

  // Modal Actions
  setShowAppointmentModal: (show) => set({ showAppointmentModal: show }),
  setSelectedExhibitorForRDV: (exhibitor) => set({ selectedExhibitorForRDV: exhibitor }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setAppointmentMessage: (message) => set({ appointmentMessage: message }),
}));