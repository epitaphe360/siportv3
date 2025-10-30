import { create } from 'zustand';
import { Dashboard, DashboardStats, Activity } from '../types';

interface DashboardState {
  dashboard: Dashboard | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboard: () => Promise<void>;
  updateStats: (stats: Partial<DashboardStats>) => void;
}

// Importer le client Supabase si disponible
let supabaseClient: any = null;
try {
  const sup = require('../lib/supabase');
  supabaseClient = sup?.supabase || null;
} catch {
  supabaseClient = null;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboard: null,
  isLoading: false,
  error: null,

  fetchDashboard: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!supabaseClient) {
        throw new Error('Supabase client non disponible');
      }

      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabaseClient.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Récupérer les statistiques du profil
      const { data: userProfile, error: profileError } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Calculer les statistiques
      const stats: DashboardStats = {
        profileViews: 0,
        connections: 0,
        appointments: 0,
        messages: 0,
        catalogDownloads: 0,
        miniSiteViews: 0
      };

      // Compter les vues de profil (si table profile_views existe)
      const { count: profileViewsCount } = await supabaseClient
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_user_id', user.id);
      
      stats.profileViews = profileViewsCount || 0;

      // Compter les connexions
      const { count: connectionsCount } = await supabaseClient
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      stats.connections = connectionsCount || 0;

      // Compter les rendez-vous
      const { count: appointmentsCount } = await supabaseClient
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .or(`exhibitor_id.eq.${user.id},visitor_id.eq.${user.id}`);
      
      stats.appointments = appointmentsCount || 0;

      // Compter les messages non lus
      const { count: messagesCount } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);
      
      stats.messages = messagesCount || 0;

      // Compter les téléchargements de catalogue (si table downloads existe)
      const { count: downloadsCount } = await supabaseClient
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      stats.catalogDownloads = downloadsCount || 0;

      // Compter les vues du mini-site (si table minisite_views existe)
      const { count: miniSiteViewsCount } = await supabaseClient
        .from('minisite_views')
        .select('*', { count: 'exact', head: true })
        .eq('exhibitor_id', user.id);
      
      stats.miniSiteViews = miniSiteViewsCount || 0;

      // Récupérer les activités récentes
      const { data: activities, error: activitiesError } = await supabaseClient
        .from('activities')
        .select(`
          *,
          actor:users!activities_actor_id_fkey(id, name, profile)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.warn('Erreur lors de la récupération des activités:', activitiesError);
      }

      // Transformer les activités
      const recentActivity: Activity[] = (activities || []).map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: new Date(activity.created_at),
        userId: activity.actor_id,
        userName: activity.actor?.name
      }));

      // Récupérer les événements à venir (depuis eventStore)
      // Cette partie sera gérée par le eventStore directement

      const dashboard: Dashboard = {
        stats,
        recentActivity,
        upcomingEvents: [], // Sera rempli par eventStore
        recommendations: [] // Sera rempli par networkingStore
      };

      set({ dashboard, isLoading: false, error: null });
    } catch (error: unknown) {
      console.error('Erreur lors de la récupération du dashboard:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : String(error) || 'Erreur lors du chargement du tableau de bord',
        dashboard: null 
      });
      throw error;
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
