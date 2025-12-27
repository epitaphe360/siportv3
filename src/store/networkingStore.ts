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
  selectedExhibitorForRDV: User | null;
  selectedTimeSlot: string;
  appointmentMessage: string;

  // Actions
  fetchRecommendations: () => Promise<void>;
  generateRecommendations: (userId: string) => Promise<void>;
  markAsContacted: (recommendedUserId: string) => void;
  
  // Permission-aware actions
  handleConnect: (userId: string, userName: string) => Promise<void>;
  addToFavorites: (userId: string) => Promise<void>;
  removeFromFavorites: (userId: string) => Promise<void>;
  handleMessage: (userName: string, company: string) => void;
  handleScheduleMeeting: (userName: string, company: string) => void;
  
  // Data loading
  loadConnections: () => Promise<void>;
  loadFavorites: () => Promise<void>;
  loadPendingConnections: () => Promise<void>;
  loadDailyUsage: () => Promise<void>;
  
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
  connections: [],
  favorites: [],
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

  handleConnect: async (userId: string, userName: string) => {
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

    try {
      // Créer la connexion dans Supabase
      // Note: createConnection prend seulement l'ID du destinataire, l'utilisateur courant est récupéré via auth
      await SupabaseService.createConnection(userId);
      
      // Mettre à jour le state local
      set(state => ({
        pendingConnections: [...state.pendingConnections, userId],
      }));
      
      // Recharger l'usage quotidien depuis la DB
      await get().loadDailyUsage();
      
      toast.success(`✅ Demande de connexion envoyée à ${userName}.`);
      
      // Show remaining quota if limited
      const remaining = get().getRemainingQuota();
      if (remaining.connections > 0 && remaining.connections < 5) {
        toast.info(`📊 Il vous reste ${remaining.connections} connexion(s) aujourd'hui.`);
      }
    } catch (error: unknown) {
      console.error('Erreur lors de la connexion:', error);
      toast.error(error instanceof Error ? error.message : String(error) || 'Erreur lors de l\'envoi de la demande de connexion.');
    }
  },

  addToFavorites: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté.");
      return;
    }

    try {
      // Note: addFavorite prend (entityType, entityId), l'utilisateur courant est récupéré via auth
      await SupabaseService.addFavorite('user', userId);
      set(state => ({
        favorites: [...state.favorites, userId],
      }));
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      toast.error('Erreur lors de l\'ajout aux favoris.');
    }
  },

  removeFromFavorites: async (userId: string) => {
    const { user } = useAuthStore.getState();
    if (!user) {
      toast.error("Vous devez être connecté.");
      return;
    }

    try {
      // Note: removeFavorite prend (entityType, entityId), l'utilisateur courant est récupéré via auth
      await SupabaseService.removeFavorite('user', userId);
      set(state => ({
        favorites: state.favorites.filter(id => id !== userId),
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      toast.error('Erreur lors de la suppression du favori.');
    }
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

  // Data loading methods
  loadConnections: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const connections = await SupabaseService.getUserConnections(user.id);
      set({ connections });
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error);
    }
  },

  loadFavorites: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const favorites = await SupabaseService.getUserFavorites(user.id);
      if (!favorites || favorites.length === 0) {
        // Friendly UI fallback: keep existing favorites but notify user if none
        set({ favorites: [] });
      } else {
        set({ favorites });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      // Show a non-blocking notification to the user
      try { const { toast } = await import('sonner'); toast?.error?.('Impossible de charger vos favoris pour le moment.'); } catch { /* Toast failed, ignore */ }
    }
  },

  loadPendingConnections: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const pendingConnections = await SupabaseService.getPendingConnections(user.id);
      set({ pendingConnections });
    } catch (error) {
      console.error('Erreur lors du chargement des connexions en attente:', error);
    }
  },

  loadDailyUsage: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      const quotas = await SupabaseService.getDailyQuotas(user.id);
      set({
        dailyUsage: {
          connections: quotas.connections,
          messages: quotas.messages,
          meetings: quotas.meetings,
          lastReset: new Date(),
        },
      });
    } catch (error) {
      console.error('Erreur lors du chargement de l\'usage quotidien:', error);
    }
  },

  // Permission management methods
  updatePermissions: () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const permissions = getNetworkingPermissions(user.type, user.profile?.passType || user.profile?.status || 'free');
    const eventPermissions = getEventAccessPermissions(user.type, user.profile?.passType || user.profile?.status || 'free');
    
    set({ permissions, eventPermissions });
  },

  checkActionPermission: (action: 'connect' | 'message' | 'meeting') => {
    const { user } = useAuthStore.getState();
    const state = get();
    
    if (!user || !state.permissions) {
      get().updatePermissions();
      return false;
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
