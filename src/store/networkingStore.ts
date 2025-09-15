import { create } from 'zustand';
import { toast } from 'sonner';
import { NetworkingRecommendation, User } from '@/types';
import RecommendationService from '@/services/recommendationService';
import useAuthStore from './authStore';
import { SupabaseService } from '@/services/supabaseService';

// Types
interface AIInsights {
  summary: string;
  suggestions: string[];
  topKeywords: string[];
}

// Mock data for demonstration
const MOCK_AI_INSIGHTS: AIInsights = {
  summary: "Votre activité réseau est en hausse de 15% cette semaine.",
  suggestions: [
    "Engagez avec des exposants dans le secteur 'Logistique 4.0'.",
    "Participez au webinaire 'Ports du Futur' prévu demain.",
    "3 nouveaux profils hautement compatibles ont été identifiés.",
  ],
  topKeywords: ["IA", "Durabilité", "Automatisation", "Sécurité"],
};

interface NetworkingState {
  recommendations: NetworkingRecommendation[];
  connections: string[]; // Array of user IDs
  favorites: string[]; // Array of user IDs
  pendingConnections: string[]; // Array of user IDs
  aiInsights: AIInsights | null;
  isLoading: boolean;
  error: string | null;
  
  // Appointment Modal State
  showAppointmentModal: boolean;
  selectedExhibitorForRDV: User | null; // Using User type for profile data
  selectedTimeSlot: string;
  appointmentMessage: string;

  // Actions
  fetchRecommendations: () => Promise<void>;
  generateRecommendations: (userId: string) => Promise<void>;
  markAsContacted: (recommendedUserId: string) => void;
  
  // Connection & Favorites
  handleConnect: (userId: string, userName: string) => void;
  addToFavorites: (userId: string) => void;
  removeFromFavorites: (userId: string) => void;

  // UI Actions
  handleMessage: (userName: string, company: string) => void;
  handleScheduleMeeting: (userName: string, company: string) => void;
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
  connections: ['user_2', 'user_4'], // Mock initial connections
  favorites: ['user_3'], // Mock initial favorites
  pendingConnections: [],
  aiInsights: null,
  isLoading: false,
  error: null,
  
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
    set(state => ({
      pendingConnections: [...state.pendingConnections, userId],
    }));
    toast.success(`Demande de connexion envoyée à ${userName}.`);
    // In a real app, this would trigger a backend notification
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
    toast.info(`Ouverture du chat avec ${userName} (${company})...`);
    // Placeholder for chat functionality
  },

  handleScheduleMeeting: (userName:string, company:string) => {
    toast.info(`Planification d'un RDV avec ${userName} (${company})...`);
    // Placeholder for scheduling functionality
  },

  loadAIInsights: () => {
    set({ isLoading: true });
    toast.promise(
      new Promise(resolve => setTimeout(() => {
        set({ aiInsights: MOCK_AI_INSIGHTS, isLoading: false });
        resolve(MOCK_AI_INSIGHTS);
      }, 1500)),
      {
        loading: 'L\'IA analyse vos données...',
        success: 'Insights IA générés avec succès !',
        error: 'Erreur lors de la génération des insights.',
      }
    );
  },

  // Modal Actions
  setShowAppointmentModal: (show) => set({ showAppointmentModal: show }),
  setSelectedExhibitorForRDV: (exhibitor) => set({ selectedExhibitorForRDV: exhibitor }),
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  setAppointmentMessage: (message) => set({ appointmentMessage: message }),
}));