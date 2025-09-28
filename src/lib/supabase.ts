import { createClient } from '@supabase/supabase-js';
import { UserProfile, ContactInfo } from '../types';

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          type: 'exhibitor' | 'partner' | 'visitor' | 'admin';
          visitor_level?: 'free' | 'basic' | 'premium' | 'vip'; // Ajouté
          profile: UserProfile;
          status?: 'active' | 'pending' | 'suspended' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          type: 'exhibitor' | 'partner' | 'visitor' | 'admin';
          visitor_level?: 'free' | 'basic' | 'premium' | 'vip'; // Ajouté
          profile: UserProfile;
          status?: 'active' | 'pending' | 'suspended' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          type?: 'exhibitor' | 'partner' | 'visitor' | 'admin';
          visitor_level?: 'free' | 'basic' | 'premium' | 'vip'; // Ajouté
          profile?: UserProfile;
          status?: 'active' | 'pending' | 'suspended' | 'rejected';
          created_at?: string;
          updated_at?: string;
        };
      };
      exhibitors: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          category: string;
          sector: string;
          description: string;
          logo_url: string | null;
          website: string | null;
          verified: boolean;
          featured: boolean;
          contact_info: ContactInfo;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          category: string;
          sector: string;
          description: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: ContactInfo;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          category?: string;
          sector?: string;
          description?: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: ContactInfo;
          created_at?: string;
          updated_at?: string;
        };
      };
      partners: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          partner_type: string;
          sector: string;
          description: string;
          logo_url: string | null;
          website: string | null;
          verified: boolean;
          featured: boolean;
          contact_info: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          partner_type?: string;
          sector: string;
          description: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          partner_type?: string;
          sector?: string;
          description?: string;
          logo_url?: string | null;
          website?: string | null;
          verified?: boolean;
          featured?: boolean;
          contact_info?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      mini_sites: {
        Row: {
          id: string;
          exhibitor_id: string;
          theme: string;
          custom_colors: Record<string, unknown>;
          sections: Record<string, unknown>[];
          published: boolean;
          views: number;
          last_updated: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          exhibitor_id: string;
          theme: string;
          custom_colors?: Record<string, unknown>;
          sections?: Record<string, unknown>[];
          published?: boolean;
          views?: number;
          last_updated?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          exhibitor_id?: string;
          theme?: string;
          custom_colors?: Record<string, unknown>;
          sections?: Record<string, unknown>[];
          published?: boolean;
          views?: number;
          last_updated?: string;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          exhibitor_id: string;
          name: string;
          description: string;
          category: string;
          images: string[];
          specifications: string | null;
          price: number | null;
          featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          exhibitor_id: string;
          name: string;
          description: string;
          category: string;
          images?: string[];
          specifications?: string | null;
          price?: number | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          exhibitor_id?: string;
          name?: string;
          description?: string;
          category?: string;
          images?: string[];
          specifications?: string | null;
          price?: number | null;
          featured?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          exhibitor_id: string;
          visitor_id: string;
          time_slot_id: string;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          message: string | null;
          notes: string | null;
          rating: number | null;
          created_at: string;
          meeting_type: 'in-person' | 'virtual' | 'hybrid';
          meeting_link: string | null;
        };
        Insert: {
          id?: string;
          exhibitor_id: string;
          visitor_id: string;
          time_slot_id: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          message?: string | null;
          notes?: string | null;
          rating?: number | null;
          created_at?: string;
          meeting_type?: 'in-person' | 'virtual' | 'hybrid';
          meeting_link?: string | null;
        };
        Update: {
          id?: string;
          exhibitor_id?: string;
          visitor_id?: string;
          time_slot_id?: string;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          message?: string | null;
          notes?: string | null;
          rating?: number | null;
          created_at?: string;
          meeting_type?: 'in-person' | 'virtual' | 'hybrid';
          meeting_link?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          participants: string[];
          type: string;
          title: string | null;
          created_by: string;
          is_active: boolean;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          participants: string[];
          type?: string;
          title?: string | null;
          created_by: string;
          is_active?: boolean;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          participants?: string[];
          type?: string;
          title?: string | null;
          created_by?: string;
          is_active?: boolean;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type: string;
          read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          message_type?: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          message_type?: string;
          read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_attachments: {
        Row: {
          id: string;
          message_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          mime_type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          mime_type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          message_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          mime_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          registration_type: string;
          status: string;
          registration_date: string;
          attended_at: string | null;
          notes: string | null;
          special_requirements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          registration_type?: string;
          status?: string;
          registration_date?: string;
          attended_at?: string | null;
          notes?: string | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          registration_type?: string;
          status?: string;
          registration_date?: string;
          attended_at?: string | null;
          notes?: string | null;
          special_requirements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      networking_recommendations: {
        Row: {
          id: string;
          user_id: string;
          recommended_user_id: string;
          recommendation_type: string;
          score: number;
          reasons: string[];
          category: string;
          viewed: boolean;
          contacted: boolean;
          mutual_connections: number;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recommended_user_id: string;
          recommendation_type: string;
          score: number;
          reasons: string[];
          category: string;
          viewed?: boolean;
          contacted?: boolean;
          mutual_connections?: number;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recommended_user_id?: string;
          recommendation_type?: string;
          score?: number;
          reasons?: string[];
          category?: string;
          viewed?: boolean;
          contacted?: boolean;
          mutual_connections?: number;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          event_data: Record<string, unknown>;
          session_id: string;
          user_agent: string;
          referrer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          event_data?: Record<string, unknown>;
          session_id: string;
          user_agent: string;
          referrer: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          event_data?: Record<string, unknown>;
          session_id?: string;
          user_agent?: string;
          referrer?: string;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          activity_type: string;
          description: string;
          related_user_id: string | null;
          related_entity_type: string | null;
          related_entity_id: string | null;
          metadata: Record<string, unknown>;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_type: string;
          description: string;
          related_user_id?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          metadata?: Record<string, unknown>;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_type?: string;
          description?: string;
          related_user_id?: string | null;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          metadata?: Record<string, unknown>;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          type: 'in-person' | 'virtual' | 'hybrid';
          max_bookings: number;
          current_bookings: number;
          available: boolean;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          start_time: string;
          end_time: string;
          duration: number;
          type: 'in-person' | 'virtual' | 'hybrid';
          max_bookings: number;
          current_bookings?: number;
          available?: boolean;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          duration?: number;
          type?: 'in-person' | 'virtual' | 'hybrid';
          max_bookings?: number;
          current_bookings?: number;
          available?: boolean;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      news_articles: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          author: string;
          published: boolean;
          published_at: string | null;
          featured_image: string | null;
          tags: string[];
          views: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          author: string;
          published?: boolean;
          published_at?: string | null;
          featured_image?: string | null;
          tags?: string[];
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          author?: string;
          published?: boolean;
          published_at?: string | null;
          featured_image?: string | null;
          tags?: string[];
          views?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference';
          event_date: string;
          start_time: string;
          end_time: string;
          capacity: number;
          registered: number;
          category: string;
          virtual: boolean;
          featured: boolean;
          location: string | null;
          meeting_link: string | null;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference';
          event_date: string;
          start_time: string;
          end_time: string;
          capacity?: number;
          registered?: number;
          category: string;
          virtual?: boolean;
          featured?: boolean;
          location?: string | null;
          meeting_link?: string | null;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference';
          event_date?: string;
          start_time?: string;
          end_time?: string;
          capacity?: number;
          registered?: number;
          category?: string;
          virtual?: boolean;
          featured?: boolean;
          location?: string | null;
          meeting_link?: string | null;
          tags?: string[];
          created_at?: string;
        };
      };
    };
  };
};


// FORCÉ : N'utilise QUE la config .env (Vite) et ignore toute injection WordPress
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// SÉCURITÉ : La service role key ne doit JAMAIS être exposée côté client
// Elle est uniquement utilisée côté serveur dans les fichiers server/

// Log d'avertissement si une config WordPress est détectée (debug)
if (typeof window !== 'undefined' && (window as any).SIPORTS_CONFIG) {
  console.warn('[SIPORTS] La config injectée par WordPress (window.SIPORTS_CONFIG) est ignorée. Seule la config .env est utilisée.');
}

// Debug logging (safe): do not print keys or lengths in client
console.log('🔍 Supabase config:', {
  urlProvided: !!supabaseUrl,
  anonKeyPresent: !!supabaseAnonKey
});

// Vérifier si Supabase est configuré avec de vraies valeurs
const isSupabaseConfigured = supabaseUrl &&
                             supabaseAnonKey &&
                             supabaseUrl.startsWith('https://') &&
                             !supabaseUrl.includes('placeholder') &&
                             !supabaseUrl.includes('votre-project-id') &&
                             supabaseAnonKey.length > 50 &&
                             !supabaseAnonKey.includes('placeholder') &&
                             !supabaseAnonKey.startsWith('demo_');

if (!isSupabaseConfigured) {
  const errorMessage = 'Supabase env vars missing or invalid. Some features requiring Supabase will be disabled in this session.';
  console.warn(errorMessage);
  // Show a non-fatal banner on the page to inform developers
  try {
    const rootElement =
      document.getElementById('siports-networking-app') ||
      document.getElementById('siports-exhibitor-dashboard-app') ||
      document.body;
    if (rootElement) {
      const banner = document.createElement('div');
      banner.style.padding = '12px';
      banner.style.backgroundColor = '#fff4e5';
      banner.style.border = '1px solid #f1c40f';
      banner.style.color = '#663c00';
      banner.style.margin = '8px';
      banner.textContent = errorMessage + ' (see console for details)';
      rootElement.insertBefore(banner, rootElement.firstChild);
    }
  } catch (e) {
    // ignore DOM errors in non-browser contexts
  }
  // Don't throw: allow the app to run in degraded mode (useful for local dev without keys)
}

// Client Supabase simplifié et sécurisé
let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null = null;

// Fonction pour obtenir le client Supabase avec création paresseuse
function getSupabaseClient(): ReturnType<typeof createClient<Database>> | null {
  // Retourner null si pas configuré
  if (!isSupabaseConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  
  // Créer le client une seule fois
  if (!supabaseClientInstance) {
    console.log('🔧 Creating Supabase client instance');
    supabaseClientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  
  return supabaseClientInstance;
}

// SÉCURITÉ : Aucun client admin côté client !
// Les opérations admin doivent être effectuées via les serveurs Express dans server/

// Export du client Supabase standard uniquement (sécurisé)
export const supabase = getSupabaseClient();

// Export de la fonction de vérification
export const isSupabaseReady = () => isSupabaseConfigured && getSupabaseClient() !== null;

// Note: Les opérations admin doivent utiliser les serveurs Express dans server/
// qui ont accès aux service role keys de manière sécurisée