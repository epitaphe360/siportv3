import { supabase } from '../lib/supabase';
import { isSupabaseReady } from '../lib/supabase';
import { User, Exhibitor, Product, Appointment, Event, ChatMessage, ChatConversation, MiniSiteSection, MessageAttachment, ExhibitorCategory, ContactInfo, TimeSlot } from '../types';

// Production: All data from Supabase only
function getDemoExhibitors(): Exhibitor[] {
  return [];
}

// Interfaces pour les données de base de données
interface UserDB {
  id: string;
  email: string;
  name: string;
  type: 'exhibitor' | 'partner' | 'visitor' | 'admin';
  profile: Record<string, unknown>;
  status?: 'active' | 'pending' | 'suspended' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ExhibitorDB {
  id: string;
  user_id: string;
  company_name: string;
  category: string;
  sector: string;
  description: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  featured: boolean;
  contact_info: Record<string, unknown>;
  products?: Record<string, unknown>[];
  mini_site?: Record<string, unknown>;
}

interface MiniSiteDB {
  id: string;
  exhibitor_id: string;
  theme: string;
  custom_colors: Record<string, unknown>;
  sections: Record<string, unknown>[];
  published: boolean;
  views: number;
  last_updated: string;
}

interface AnalyticsData {
  miniSiteViews: number;
  appointments: number;
  products: number;
  profileViews: number;
  connections: number;
  messages: number;
}

interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationType: string;
  status: string;
  registrationDate: Date;
  attendedAt?: Date;
  notes?: string;
  specialRequirements?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NetworkingRecommendationDB {
  id: string;
  userId: string;
  recommendedUserId: string;
  recommendationType: string;
  score: number;
  reasons: string[];
  category: string;
  viewed: boolean;
  contacted: boolean;
  mutualConnections: number;
  expiresAt: Date;
  createdAt: Date;
  recommendedUser?: User;
}

interface ActivityDB {
  id: string;
  userId: string;
  activityType: string;
  description: string;
  relatedUserId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata: Record<string, unknown>;
  isPublic: boolean;
  createdAt: Date;
  user?: User;
  relatedUser?: User;
}

interface SearchFilters {
  category?: string;
  sector?: string;
}

export class SupabaseService {
  // ==================== CONNECTION CHECK ====================
  static checkSupabaseConnection(): boolean {
    return isSupabaseReady();
  }

  // ==================== USER MANAGEMENT ====================
  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré');
      return null;
    }
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) {
        console.warn('Utilisateur non trouvé:', error.message);
        return null;
      }
      
      return this.transformUserDBToUser(data);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // ==================== EXHIBITORS ====================
  static async getExhibitors(): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun exposant disponible');
      return [];
    }
    
    const safeSupabase = supabase!;
    try {
      const { data: exhibitorsData, error: exhibitorsError } = await (safeSupabase as any)
        .from('exhibitors')
        .select('id,user_id,company_name,category,sector,description,logo_url,website,verified,featured,contact_info');
      
      if (exhibitorsError) throw exhibitorsError;
      
      const exhibitors = (exhibitorsData || []) as any[];
      if (exhibitors.length === 0) return [];
      
      return exhibitors.map(this.transformExhibitorDBToExhibitor);
    } catch (error) {
      console.error('Erreur lors de la récupération des exposants:', error);
      return [];
    }
  }

  // ==================== PARTNERS ====================
  static async getPartners(): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('partners')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des partenaires:', error);
      return [];
    }
  }

  // ==================== TRANSFORMATION METHODS ====================
  private static transformUserDBToUser(userDB: UserDB): User {
    return {
      id: userDB.id,
      email: userDB.email,
      name: userDB.name,
      type: userDB.type,
      profile: userDB.profile as any,
      status: userDB.status,
      createdAt: new Date(userDB.created_at),
      updatedAt: new Date(userDB.updated_at)
    };
  }

  private static transformExhibitorDBToExhibitor(exhibitorDB: ExhibitorDB): Exhibitor {
    return {
      id: exhibitorDB.id,
      companyName: exhibitorDB.company_name,
      category: exhibitorDB.category as ExhibitorCategory,
      sector: exhibitorDB.sector,
      description: exhibitorDB.description,
      logo: exhibitorDB.logo_url,
      website: exhibitorDB.website,
      verified: exhibitorDB.verified,
      featured: exhibitorDB.featured,
      contactInfo: exhibitorDB.contact_info as ContactInfo,
      products: [],
      miniSite: null
    };
  }

  // ==================== EMPTY STUBS FOR OTHER METHODS ====================
  static async createMiniSite(miniSiteData: any): Promise<any> {
    console.log('Mini-site creation - will be implemented with real Supabase integration');
    return null;
  }

  static async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    return [];
  }

  static async getEvents(): Promise<Event[]> {
    return [];
  }

  static async searchExhibitors(query: string, filters: SearchFilters = {}): Promise<Exhibitor[]> {
    return [];
  }

  static async getConversations(userId: string): Promise<ChatConversation[]> {
    return [];
  }

  static async getEventRegistrations(eventId?: string, userId?: string): Promise<EventRegistration[]> {
    return [];
  }

  static async getNetworkingRecommendations(userId: string): Promise<NetworkingRecommendationDB[]> {
    return [];
  }

  static async getActivities(userId?: string, limit: number = 50): Promise<ActivityDB[]> {
    return [];
  }

  static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]> {
    return [];
  }
}