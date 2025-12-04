/**
 * Fonction centralisée pour réinitialiser tous les stores
 * À appeler lors du logout pour éviter les fuites de données
 */

import { useExhibitorStore } from './exhibitorStore';
import { useEventStore } from './eventStore';
import { useAppointmentStore } from './appointmentStore';
import { useVisitorStore } from './visitorStore';
import { useChatStore } from './chatStore';
import { useChatBotStore } from './chatbotStore';
import { useNetworkingStore } from './networkingStore';
import { useDashboardStore } from './dashboardStore';
import { useAdminDashboardStore } from './adminDashboardStore';
import { useNewsStore } from './newsStore';

/**
 * Réinitialise tous les stores à leur état initial
 * CRITIQUE pour la sécurité : empêche les fuites de données entre utilisateurs
 */
export const resetAllStores = () => {
  try {
    // Exhibitor Store
    useExhibitorStore.setState({
      exhibitors: [],
      filteredExhibitors: [],
      selectedExhibitor: null,
      filters: {
        category: '',
        sector: '',
        country: '',
        search: ''
      },
      isLoading: false
    });

    // Event Store
    useEventStore.setState({
      events: [],
      registeredEvents: [],
      isLoading: false
    });

    // Appointment Store
    useAppointmentStore.setState({
      appointments: [],
      timeSlots: [],
      isLoading: false,
      isBooking: false,
      isCreatingSlot: false,
      isUpdating: null,
      isDeleting: null
    });

    // Visitor Store
    useVisitorStore.setState({
      visitorProfile: null,
      favoriteExhibitors: [],
      connections: [],
      messages: [],
      notifications: [],
      recommendations: [],
      isLoading: false
    });

    // Chat Store
    useChatStore.setState({
      conversations: [],
      messages: {},
      activeConversation: null,
      unreadCount: 0,
      isLoading: false
    });

    // Chatbot Store
    useChatBotStore.setState({
      messages: [],
      isOpen: false,
      isLoading: false
    });

    // Networking Store
    useNetworkingStore.setState({
      recommendations: [],
      pendingConnections: [],
      connections: [],
      favorites: [],
      permissions: {
        hasQRAccess: false,
        tier: 'free',
        canViewProfiles: false,
        canSendMessages: false,
        canBookMeetings: false
      },
      dailyUsage: {
        connections: 0,
        messages: 0,
        meetings: 0,
        lastReset: new Date()
      },
      isLoading: false
    });

    // Dashboard Store
    useDashboardStore.setState({
      dashboard: null,
      isLoading: false
    });

    // Admin Dashboard Store
    useAdminDashboardStore.setState({
      metrics: null,
      isLoading: false
    });

    // News Store
    useNewsStore.setState({
      articles: [],
      selectedArticle: null,
      categories: [],
      selectedCategory: null,
      searchTerm: '',
      isLoading: false
    });

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation des stores:', error);
    // Ne pas throw pour ne pas bloquer le logout
  }
};
