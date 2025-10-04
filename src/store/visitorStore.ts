import { create } from 'zustand';

interface VisitorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  visitorType?: 'individual' | 'freelancer' | 'company';
  company?: string;
  position?: string;
  professionalStatus?: string;
  businessSector?: string;
  country: string;
  phone: string;
  avatar?: string;
  passType: 'free' | 'basic' | 'premium' | 'vip';
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';
  
  // Spécifique aux visiteurs
  sectorsOfInterest: string[];
  visitObjectives: string[];
  competencies: string[];
  expertises: string[];
  
  // Préférences
  thematicInterests: string[];
  preferredLanguage: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface Appointment {
  id: string;
  title: string;
  company: string;
  contactPerson: string;
  date: Date;
  time: string;
  duration: number;
  location: string;
  type: 'b2b' | 'conference' | 'workshop' | 'networking';
  status: 'pending' | 'confirmed' | 'cancelled';
  description?: string;
  meetingLink?: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  category: string;
  capacity: number;
  registered: number;
}

interface FavoriteExhibitor {
  id: string;
  name: string;
  sector: string;
  description: string;
  logo: string;
  pavilion: string;
  standNumber: string;
  website?: string;
}

interface Connection {
  id: string;
  name: string;
  company: string;
  position: string;
  avatar: string;
  type: 'exhibitor' | 'visitor' | 'partner';
  connectedAt: Date;
  lastInteraction?: Date;
}

interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  preview: string;
  timestamp: Date;
  read: boolean;
  type: 'direct' | 'group' | 'system';
}

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface SalonInfo {
  name: string;
  dates: {
    start: Date;
    end: Date;
  };
  location: {
    venue: string;
    city: string;
    country: string;
    address: string;
  };
  hours: {
    opening: string;
    closing: string;
  };
  stats: {
    exhibitors: number;
    visitors: number;
    conferences: number;
    countries: number;
  };
}

interface VisitorAgenda {
  appointments: Appointment[];
  guaranteedMeetings: {
    total: number;
    used: number;
    remaining: number;
  };
  personalEvents: unknown[];
}

interface VisitorState {
  visitorProfile: VisitorProfile | null;
  agenda: VisitorAgenda;
  favoriteExhibitors: FavoriteExhibitor[];
  registeredSessions: Session[];
  connections: Connection[];
  messages: Message[];
  notifications: Notification[];
  salonInfo: SalonInfo | null;
  isLoading: boolean;
  
  // Actions
  fetchVisitorData: () => Promise<void>;
  updateProfile: (profileData: Partial<VisitorProfile>) => Promise<void>;
  addToFavorites: (exhibitorId: string) => Promise<void>;
  removeFromFavorites: (exhibitorId: string) => Promise<void>;
  registerForSession: (sessionId: string) => Promise<void>;
  unregisterFromSession: (sessionId: string) => Promise<void>;
  sendMeetingRequest: (exhibitorId: string, message: string, preferredDate: Date) => Promise<void>;
  acceptMeetingRequest: (requestId: string) => Promise<void>;
  rejectMeetingRequest: (requestId: string) => Promise<void>;
  sendMessage: (recipientId: string, message: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  updateNotificationPreferences: (preferences: Partial<VisitorProfile['notificationPreferences']>) => Promise<void>;
}

// Importer le client Supabase si disponible
let supabaseClient: any = null;
try {
  const sup = require('../lib/supabase');
  supabaseClient = sup?.supabase || null;
} catch {
  supabaseClient = null;
}

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitorProfile: null,
  agenda: {
    appointments: [],
    guaranteedMeetings: { total: 0, used: 0, remaining: 0 },
    personalEvents: []
  },
  favoriteExhibitors: [],
  registeredSessions: [],
  connections: [],
  messages: [],
  notifications: [],
  salonInfo: null,
  isLoading: false,

  fetchVisitorData: async () => {
    set({ isLoading: true });
    try {
      // Récupérer les données réelles depuis Supabase
      if (supabaseClient) {
        // Récupérer le profil utilisateur actuel
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          // Récupérer le profil complet depuis la table users
          const { data: userProfile, error: profileError } = await supabaseClient
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;

          // Récupérer les favoris
          const { data: favorites, error: favError } = await supabaseClient
            .from('favorites')
            .select(`
              exhibitor_id,
              exhibitors:users!favorites_exhibitor_id_fkey(
                id,
                name,
                profile
              )
            `)
            .eq('visitor_id', user.id);

          if (favError) console.warn('Erreur lors de la récupération des favoris:', favError);

          // Récupérer les connexions
          const { data: connections, error: connError } = await supabaseClient
            .from('connections')
            .select(`
              *,
              connected_user:users!connections_connected_user_id_fkey(
                id,
                name,
                type,
                profile
              )
            `)
            .eq('user_id', user.id);

          if (connError) console.warn('Erreur lors de la récupération des connexions:', connError);

          // Récupérer les notifications
          const { data: notifications, error: notifError } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (notifError) console.warn('Erreur lors de la récupération des notifications:', notifError);

          // Récupérer les informations du salon (configuration globale)
          const { data: salonConfig, error: salonError } = await supabaseClient
            .from('salon_config')
            .select('*')
            .single();

          if (salonError) console.warn('Erreur lors de la récupération des infos salon:', salonError);

          // Transformer et définir les données
          set({
            visitorProfile: userProfile ? {
              id: userProfile.id,
              firstName: userProfile.profile?.firstName || '',
              lastName: userProfile.profile?.lastName || '',
              email: userProfile.email,
              visitorType: userProfile.profile?.visitorType,
              company: userProfile.profile?.company,
              position: userProfile.profile?.position,
              professionalStatus: userProfile.profile?.professionalStatus,
              businessSector: userProfile.profile?.businessSector,
              country: userProfile.profile?.country || '',
              phone: userProfile.profile?.phone || '',
              avatar: userProfile.profile?.avatar,
              passType: userProfile.visitor_level || 'free',
              registrationStatus: userProfile.status === 'active' ? 'confirmed' : 'pending',
              sectorsOfInterest: userProfile.profile?.sectorsOfInterest || [],
              visitObjectives: userProfile.profile?.visitObjectives || [],
              competencies: userProfile.profile?.competencies || [],
              expertises: userProfile.profile?.expertise || [],
              thematicInterests: userProfile.profile?.thematicInterests || [],
              preferredLanguage: userProfile.profile?.preferredLanguage || 'fr',
              notificationPreferences: {
                email: true,
                push: true,
                inApp: true
              }
            } : null,
            favoriteExhibitors: (favorites || []).map((fav: any) => ({
              id: fav.exhibitor_id,
              name: fav.exhibitors?.name || 'Exposant',
              sector: fav.exhibitors?.profile?.sectors?.[0] || 'Non spécifié',
              description: fav.exhibitors?.profile?.companyDescription || '',
              logo: fav.exhibitors?.profile?.avatar || '',
              pavilion: 'À déterminer',
              standNumber: 'À déterminer',
              website: fav.exhibitors?.profile?.website
            })),
            connections: (connections || []).map((conn: any) => ({
              id: conn.id,
              name: conn.connected_user?.name || 'Utilisateur',
              company: conn.connected_user?.profile?.company || '',
              position: conn.connected_user?.profile?.position || '',
              avatar: conn.connected_user?.profile?.avatar || '',
              type: conn.connected_user?.type || 'visitor',
              connectedAt: new Date(conn.created_at),
              lastInteraction: conn.last_interaction ? new Date(conn.last_interaction) : undefined
            })),
            notifications: (notifications || []).map((notif: any) => ({
              id: notif.id,
              type: notif.type,
              title: notif.title,
              message: notif.message,
              timestamp: new Date(notif.created_at),
              read: notif.read || false,
              actionUrl: notif.action_url
            })),
            salonInfo: salonConfig ? {
              name: salonConfig.name || 'SIPORTS 2026',
              dates: {
                start: new Date(salonConfig.start_date),
                end: new Date(salonConfig.end_date)
              },
              location: {
                venue: salonConfig.venue || '',
                city: salonConfig.city || '',
                country: salonConfig.country || '',
                address: salonConfig.address || ''
              },
              hours: {
                opening: salonConfig.opening_time || '09:00',
                closing: salonConfig.closing_time || '18:00'
              },
              stats: {
                exhibitors: salonConfig.exhibitors_count || 0,
                visitors: salonConfig.visitors_count || 0,
                conferences: salonConfig.conferences_count || 0,
                countries: salonConfig.countries_count || 0
              }
            } : null,
            isLoading: false
          });
        }
      } else {
        console.warn('Supabase client non disponible');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données visiteur:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<VisitorProfile>) => {
    const { visitorProfile } = get();
    if (!visitorProfile) throw new Error('Aucun profil visiteur chargé');
    
    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('users')
          .update({
            profile: {
              ...visitorProfile,
              ...profileData
            }
          })
          .eq('id', visitorProfile.id);

        if (error) throw error;

        set({
          visitorProfile: { ...visitorProfile, ...profileData }
        });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  },

  addToFavorites: async (exhibitorId: string) => {
    const { visitorProfile, favoriteExhibitors } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('favorites')
          .insert({
            visitor_id: visitorProfile.id,
            exhibitor_id: exhibitorId
          });

        if (error) throw error;

        // Récupérer les infos de l'exposant
        const { data: exhibitor } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', exhibitorId)
          .single();

        if (exhibitor) {
          const newFavorite: FavoriteExhibitor = {
            id: exhibitor.id,
            name: exhibitor.name,
            sector: exhibitor.profile?.sectors?.[0] || 'Non spécifié',
            description: exhibitor.profile?.companyDescription || '',
            logo: exhibitor.profile?.avatar || '',
            pavilion: 'À déterminer',
            standNumber: 'À déterminer',
            website: exhibitor.profile?.website
          };

          set({ favoriteExhibitors: [...favoriteExhibitors, newFavorite] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  },

  removeFromFavorites: async (exhibitorId: string) => {
    const { visitorProfile, favoriteExhibitors } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('favorites')
          .delete()
          .eq('visitor_id', visitorProfile.id)
          .eq('exhibitor_id', exhibitorId);

        if (error) throw error;

        set({ 
          favoriteExhibitors: favoriteExhibitors.filter(e => e.id !== exhibitorId) 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
  },

  registerForSession: async (sessionId: string) => {
    const { visitorProfile, registeredSessions } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('event_registrations')
          .insert({
            event_id: sessionId,
            user_id: visitorProfile.id,
            registration_type: 'visitor',
            status: 'confirmed'
          });

        if (error) throw error;

        // TODO: Récupérer les détails de la session et l'ajouter à registeredSessions
        console.log('Inscription à la session réussie');
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription à la session:', error);
      throw error;
    }
  },

  unregisterFromSession: async (sessionId: string) => {
    const { visitorProfile, registeredSessions } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('event_registrations')
          .delete()
          .eq('event_id', sessionId)
          .eq('user_id', visitorProfile.id);

        if (error) throw error;

        set({ 
          registeredSessions: registeredSessions.filter(s => s.id !== sessionId) 
        });
      }
    } catch (error) {
      console.error('Erreur lors de la désinscription de la session:', error);
      throw error;
    }
  },

  sendMeetingRequest: async (exhibitorId: string, message: string, preferredDate: Date) => {
    const { visitorProfile } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      if (supabaseClient) {
        // Cette fonctionnalité devrait utiliser le système de rendez-vous existant
        // via appointmentStore plutôt que visitorStore
        console.warn('Utiliser appointmentStore.bookAppointment() à la place');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande de rendez-vous:', error);
      throw error;
    }
  },

  acceptMeetingRequest: async (requestId: string) => {
    // Cette fonctionnalité devrait utiliser appointmentStore
    console.warn('Utiliser appointmentStore.updateAppointmentStatus() à la place');
  },

  rejectMeetingRequest: async (requestId: string) => {
    // Cette fonctionnalité devrait utiliser appointmentStore
    console.warn('Utiliser appointmentStore.cancelAppointment() à la place');
  },

  sendMessage: async (recipientId: string, message: string) => {
    const { visitorProfile } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('messages')
          .insert({
            sender_id: visitorProfile.id,
            receiver_id: recipientId,
            content: message,
            type: 'text'
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  },

  markNotificationAsRead: (notificationId: string) => {
    const { notifications } = get();
    
    // Mettre à jour localement
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });

    // Mettre à jour dans Supabase
    if (supabaseClient) {
      supabaseClient
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .then(({ error }: any) => {
          if (error) console.error('Erreur lors de la mise à jour de la notification:', error);
        });
    }
  },

  updateNotificationPreferences: async (preferences: Partial<VisitorProfile['notificationPreferences']>) => {
    const { visitorProfile } = get();
    if (!visitorProfile) throw new Error('Utilisateur non connecté');

    try {
      const updatedPreferences = {
        ...visitorProfile.notificationPreferences,
        ...preferences
      };

      if (supabaseClient) {
        const { error } = await supabaseClient
          .from('users')
          .update({
            profile: {
              ...visitorProfile,
              notificationPreferences: updatedPreferences
            }
          })
          .eq('id', visitorProfile.id);

        if (error) throw error;
      }

      set({
        visitorProfile: {
          ...visitorProfile,
          notificationPreferences: updatedPreferences
        }
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
}));
