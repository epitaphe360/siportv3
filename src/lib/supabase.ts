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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Debug logging
console.log('🔍 Supabase Environment Variables:');
console.log('URL:', supabaseUrl);
console.log('Anon Key Length:', supabaseAnonKey?.length);
console.log('Service Key Length:', supabaseServiceKey?.length);

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
  console.info('ℹ️ Mode développement - Utilisation des valeurs de démonstration');
  console.info('Pour la production, configurez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env');
  console.info('URL actuelle:', supabaseUrl);
  console.info('Configuration check details:');
  console.info('- Has URL:', !!supabaseUrl);
  console.info('- Has Anon Key:', !!supabaseAnonKey);
  console.info('- URL starts with https:', supabaseUrl?.startsWith('https://'));
  console.info('- URL has no placeholder:', !supabaseUrl?.includes('placeholder'));
  console.info('- Anon Key length > 50:', supabaseAnonKey && supabaseAnonKey.length > 50);
  console.info('- Anon Key has no placeholder:', !supabaseAnonKey?.includes('placeholder'));
  console.info('- Anon Key does not start with demo_:', !supabaseAnonKey?.startsWith('demo_'));
}

// Utiliser une approche globale pour garantir un seul client
declare global {
  var __supabaseClient: ReturnType<typeof createClient<Database>> | null;
  var __supabaseAdminClient: ReturnType<typeof createClient<Database>> | null;
  var __supabaseClientCreated: boolean;
  var __supabaseAdminClientCreated: boolean;
}

// Initialiser les variables globales si elles n'existent pas
if (typeof globalThis.__supabaseClient === 'undefined') {
  globalThis.__supabaseClient = null;
  globalThis.__supabaseClientCreated = false;
}
if (typeof globalThis.__supabaseAdminClient === 'undefined') {
  globalThis.__supabaseAdminClient = null;
  globalThis.__supabaseAdminClientCreated = false;
}

// Fonction pour obtenir le client Supabase standard avec vérification globale
function getSupabaseClient(): ReturnType<typeof createClient<Database>> | null {
  if (!globalThis.__supabaseClient && !globalThis.__supabaseClientCreated && isSupabaseConfigured && supabaseUrl && supabaseAnonKey) {
    globalThis.__supabaseClientCreated = true;
    console.log('🔧 Creating global Supabase client instance');
    globalThis.__supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return globalThis.__supabaseClient;
}

// Fonction pour obtenir le client Supabase admin avec vérification globale
function getSupabaseAdminClient(): ReturnType<typeof createClient<Database>> | null {
  // Never create the admin client in the browser – it's for server-only operations
  if (typeof window !== 'undefined') {
    // In browser context return the already-created client if any, but avoid creating a new one
    return globalThis.__supabaseAdminClient ?? null;
  }

  if (!globalThis.__supabaseAdminClient && !globalThis.__supabaseAdminClientCreated && isSupabaseConfigured && supabaseUrl && supabaseServiceKey) {
    globalThis.__supabaseAdminClientCreated = true;
    console.log('🔧 Creating global Supabase admin client instance (server)');
    globalThis.__supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return globalThis.__supabaseAdminClient;
}

// Export des clients via des getters
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdminClient();

// Export de la fonction de vérification
export const isSupabaseReady = () => isSupabaseConfigured && getSupabaseClient() !== null;
export const isSupabaseAdminReady = () => isSupabaseConfigured && getSupabaseAdminClient() !== null;