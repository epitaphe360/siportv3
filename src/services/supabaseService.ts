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

      const enrichedExhibitors = await Promise.all(
        exhibitors.map(async (exhibitorDB) => {
          const { data: products } = await (safeSupabase as any)
            .from('products')
            .select('*')
            .eq('exhibitor_id', exhibitorDB.id) || { data: [] };

          const { data: miniSite } = await (safeSupabase as any)
            .from('mini_sites')
            .select('*')
            .eq('exhibitor_id', exhibitorDB.id)
            .maybeSingle() || { data: null };

          return {
            ...exhibitorDB,
            products: products || [],
            mini_site: miniSite
          };
        })
      );

      return enrichedExhibitors.map(this.transformExhibitorDBToExhibitor);
    } catch (error) {
      console.error('Erreur lors de la récupération des exposants:', error);
      return [];
    }
  }

  // ==================== PARTNERS ====================
  static async getPartners(): Promise<any[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun partenaire disponible');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('partners')
        .select('*')
        .order('type', { ascending: true });

      if (error) throw error;

      return (data || []).map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        category: partner.category,
        description: partner.description,
        logo: partner.logo_url,
        website: partner.website,
        country: partner.country,
        sector: partner.sector,
        verified: partner.verified,
        featured: partner.featured,
        sponsorshipLevel: partner.sponsorship_level,
        contributions: partner.contributions || [],
        establishedYear: partner.established_year,
        employees: partner.employees
      }));
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
    const products = (exhibitorDB.products || []).map((p: any) => ({
      id: p.id,
      exhibitorId: p.exhibitor_id,
      name: p.name,
      description: p.description,
      category: p.category,
      images: p.images || [],
      specifications: p.specifications,
      price: p.price,
      featured: p.featured || false
    }));

    const miniSite = exhibitorDB.mini_site ? {
      theme: exhibitorDB.mini_site.theme || 'default',
      customColors: exhibitorDB.mini_site.custom_colors || {},
      sections: (exhibitorDB.mini_site.sections || []) as MiniSiteSection[],
      published: exhibitorDB.mini_site.published || false,
      views: exhibitorDB.mini_site.views || 0,
      lastUpdated: new Date(exhibitorDB.mini_site.last_updated || Date.now())
    } : null;

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
      products,
      miniSite
    };
  }

  // ==================== AUTHENTICATION ====================
  static async signUp(email: string, password: string, userData: any): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await safeSupabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) return null;
      
      // 2. Créer le profil utilisateur
      const { data: userData, error: userError } = await (safeSupabase as any)
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          name: userData.name,
          type: userData.type,
          profile: userData.profile,
          status: 'pending' // Nécessite validation admin
        }])
        .select()
        .single();
        
      if (userError) throw userError;
      
      // 3. Si c'est un exposant ou partenaire, créer l'entrée correspondante
      if (userData.type === 'exhibitor') {
        await this.createExhibitorProfile(authData.user.id, userData);
      } else if (userData.type === 'partner') {
        await this.createPartnerProfile(authData.user.id, userData);
      }
      
      return this.transformUserDBToUser(userData);
    } catch (error) {
      console.error('Erreur inscription:', error);
      return null;
    }
  }

  static async signIn(email: string, password: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    
    try {
      // AUTHENTIFICATION LOCALE POUR LES COMPTES DE TEST
      const testAccounts = [
        'admin@siports.com',
        'exposant@siports.com', 
        'partenaire@siports.com',
        'visiteur@siports.com'
      ];
      
      if (testAccounts.includes(email) && password === 'demo123') {
        console.log('🔄 Authentification locale pour compte de test:', email);

        const { data: userData, error } = await (safeSupabase as any)
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.error('❌ Erreur lors de la récupération du compte test:', error);
          return null;
        }

        if (userData) {
          console.log('✅ Compte de test authentifié:', userData.email);
          console.log('   Type:', userData.type);
          console.log('   ID:', userData.id);
          const user = this.transformUserDBToUser(userData);
          return user;
        } else {
          console.log('⚠️ Utilisateur test introuvable:', email);
          return null;
        }
      }
      
      // AUTHENTIFICATION SUPABASE STANDARD
      const { data, error } = await safeSupabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) return null;
      
      // Récupérer le profil utilisateur
      const user = await this.getUserByEmail(email);
      return user;
    } catch (error) {
      console.error('Erreur connexion:', error);
      return null;
    }
  }

  // ==================== REAL IMPLEMENTATIONS ====================
  static async createMiniSite(exhibitorId: string, miniSiteData: any): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('mini_sites')
        .insert([{
          exhibitor_id: exhibitorId,
          theme: miniSiteData.theme || 'default',
          custom_colors: miniSiteData.customColors || {},
          sections: miniSiteData.sections || [],
          published: false
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création mini-site:', error);
      return null;
    }
  }

  static async getEvents(): Promise<Event[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        type: event.event_type,
        startTime: new Date(event.start_time),
        endTime: new Date(event.end_time),
        location: event.location,
        maxParticipants: event.max_participants,
        registrationRequired: event.registration_required,
        qrCode: event.qr_code_data
      }));
    } catch (error) {
      console.error('Erreur récupération événements:', error);
      return [];
    }
  }

  static async getConversations(userId: string): Promise<ChatConversation[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('conversations')
        .select(`
          id,
          participant_ids,
          conversation_type,
          title,
          created_at,
          updated_at,
          messages:messages(
            id,
            content,
            message_type,
            created_at,
            sender:sender_id(id, name)
          )
        `)
        .contains('participant_ids', [userId])
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      return (data || []).map((conv: any) => {
        const lastMessage = conv.messages?.[0];
        return {
          id: conv.id,
          participants: conv.participant_ids,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            senderId: lastMessage.sender.id,
            receiverId: conv.participant_ids.find((id: string) => id !== lastMessage.sender.id),
            content: lastMessage.content,
            type: lastMessage.message_type,
            timestamp: new Date(lastMessage.created_at),
            read: true // Simplifié pour l'instant
          } : null,
          unreadCount: 0, // À implémenter
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at)
        };
      });
    } catch (error) {
      console.error('Erreur récupération conversations:', error);
      return [];
    }
  }

  static async sendMessage(conversationId: string, senderId: string, content: string, type: string = 'text'): Promise<ChatMessage | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          message_type: type
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      // Mettre à jour la conversation
      await (safeSupabase as any)
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return {
        id: data.id,
        senderId,
        receiverId: '', // À déterminer depuis la conversation
        content,
        type: type as any,
        timestamp: new Date(data.created_at),
        read: false
      };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return null;
    }
  }

  static async createAppointment(appointmentData: any): Promise<Appointment | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        organizerId: data.organizer_id,
        participantId: data.participant_id,
        exhibitorId: data.exhibitor_id,
        title: data.title,
        description: data.description,
        startTime: new Date(data.start_time),
        endTime: new Date(data.end_time),
        status: data.status,
        type: data.meeting_type,
        location: data.location,
        notes: data.notes,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error('Erreur création rendez-vous:', error);
      return null;
    }
  }

  // ==================== HELPER METHODS ====================
  private static async createExhibitorProfile(userId: string, userData: any): Promise<void> {
    const safeSupabase = supabase!;
    
    const { error } = await (safeSupabase as any)
      .from('exhibitors')
      .insert([{
        user_id: userId,
        company_name: userData.profile?.company || userData.name,
        category: userData.profile?.category || 'port-operations',
        sector: userData.profile?.sector || 'General',
        description: userData.profile?.bio || '',
        contact_info: {
          email: userData.email,
          phone: userData.profile?.phone || '',
          address: userData.profile?.address || '',
          city: userData.profile?.city || '',
          country: userData.profile?.country || ''
        },
        verified: false,
        featured: false
      }]);
      
    if (error) console.error('Erreur création profil exposant:', error);
  }

  private static async createPartnerProfile(userId: string, userData: any): Promise<void> {
    const safeSupabase = supabase!;
    
    const { error } = await (safeSupabase as any)
      .from('partners')
      .insert([{
        user_id: userId,
        company_name: userData.profile?.company || userData.name,
        partner_type: 'sponsor',
        description: userData.profile?.bio || '',
        tier: 3
      }]);
      
    if (error) console.error('Erreur création profil partenaire:', error);
  }

  static async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('appointments')
        .select('*')
        .or(`organizer_id.eq.${userId},participant_id.eq.${userId}`)
        .order('start_time', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map((apt: any) => ({
        id: apt.id,
        organizerId: apt.organizer_id,
        participantId: apt.participant_id,
        exhibitorId: apt.exhibitor_id,
        title: apt.title,
        description: apt.description,
        startTime: new Date(apt.start_time),
        endTime: new Date(apt.end_time),
        status: apt.status,
        type: apt.meeting_type,
        location: apt.location,
        notes: apt.notes,
        createdAt: new Date(apt.created_at)
      }));
    } catch (error) {
      console.error('Erreur récupération rendez-vous:', error);
      return [];
    }
  }

  static async searchExhibitors(query: string, filters: SearchFilters = {}): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      let queryBuilder = (safeSupabase as any)
        .from('exhibitors')
        .select('*');
        
      if (query) {
        queryBuilder = queryBuilder.or(`company_name.ilike.%${query}%,description.ilike.%${query}%,sector.ilike.%${query}%`);
      }
      
      if (filters.category) {
        queryBuilder = queryBuilder.eq('category', filters.category);
      }
      
      if (filters.sector) {
        queryBuilder = queryBuilder.ilike('sector', `%${filters.sector}%`);
      }
      
      const { data, error } = await queryBuilder.limit(20);
      
      if (error) throw error;
      
      return (data || []).map(this.transformExhibitorDBToExhibitor);
    } catch (error) {
      console.error('Erreur recherche exposants:', error);
      return [];
    }
  }

  static async getEventRegistrations(eventId?: string, userId?: string): Promise<EventRegistration[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      let queryBuilder = (safeSupabase as any)
        .from('event_registrations')
        .select('*');
        
      if (eventId) queryBuilder = queryBuilder.eq('event_id', eventId);
      if (userId) queryBuilder = queryBuilder.eq('user_id', userId);
      
      const { data, error } = await queryBuilder.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((reg: any) => ({
        id: reg.id,
        eventId: reg.event_id,
        userId: reg.user_id,
        registrationType: reg.registration_type,
        status: reg.status,
        registrationDate: new Date(reg.created_at),
        attendedAt: reg.attended_at ? new Date(reg.attended_at) : undefined,
        notes: reg.notes,
        specialRequirements: reg.special_requirements,
        createdAt: new Date(reg.created_at),
        updatedAt: new Date(reg.created_at)
      }));
    } catch (error) {
      console.error('Erreur récupération inscriptions événements:', error);
      return [];
    }
  }

  static async getNetworkingRecommendations(userId: string): Promise<NetworkingRecommendationDB[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('networking_recommendations')
        .select(`
          *,
          recommendedUser:recommended_user_id(
            id,
            name,
            email,
            type,
            profile
          )
        `)
        .eq('user_id', userId)
        .eq('viewed', false)
        .gte('expires_at', new Date().toISOString())
        .order('score', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur récupération recommandations:', error);
      return [];
    }
  }

  static async getActivities(userId?: string, limit: number = 50): Promise<ActivityDB[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      let queryBuilder = (safeSupabase as any)
        .from('activities')
        .select(`
          *,
          user:user_id(id, name),
          relatedUser:related_user_id(id, name)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (userId) {
        queryBuilder = queryBuilder.eq('user_id', userId);
      }
      
      const { data, error } = await queryBuilder;
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Erreur récupération activités:', error);
      return [];
    }
  }

  static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data: exhibitor } = await (safeSupabase as any)
        .from('exhibitors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!exhibitor) {
        console.log('Aucun exposant trouvé pour user_id:', userId);
        return [];
      }

      const { data, error } = await (safeSupabase as any)
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', exhibitor.id)
        .eq('available', true)
        .gte('slot_date', new Date().toISOString().split('T')[0])
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      return (data || []).map((slot: any) => ({
        id: slot.id,
        userId: exhibitor.id,
        startTime: new Date(`${slot.slot_date}T${slot.start_time}`),
        endTime: new Date(`${slot.slot_date}T${slot.end_time}`),
        isAvailable: slot.available,
        createdAt: new Date(slot.created_at)
      }));
    } catch (error) {
      console.error('Erreur récupération créneaux:', error);
      return [];
    }
  }

  static async createTimeSlot(slotData: {
    userId: string;
    date: string | Date;
    startTime: string;
    endTime: string;
    duration: number;
    type: 'in-person' | 'virtual' | 'hybrid';
    maxBookings: number;
    location?: string;
  }): Promise<TimeSlot> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;

    const { data: exhibitor } = await (safeSupabase as any)
      .from('exhibitors')
      .select('id')
      .eq('user_id', slotData.userId)
      .maybeSingle();

    if (!exhibitor) {
      throw new Error('Aucun exposant trouvé pour cet utilisateur');
    }

    const dateString = slotData.date instanceof Date ? slotData.date.toISOString().split('T')[0] : String(slotData.date);

    const { data, error } = await (safeSupabase as any)
      .from('time_slots')
      .insert([{
        exhibitor_id: exhibitor.id,
        slot_date: dateString,
        start_time: slotData.startTime,
        end_time: slotData.endTime,
        duration: slotData.duration,
        type: slotData.type,
        max_bookings: slotData.maxBookings,
        current_bookings: 0,
        available: true,
        location: slotData.location || null
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: exhibitor.id,
      startTime: new Date(`${data.slot_date}T${data.start_time}`),
      endTime: new Date(`${data.slot_date}T${data.end_time}`),
      isAvailable: data.available,
      createdAt: new Date(data.created_at)
    };
  }

  static async deleteTimeSlot(slotId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('time_slots')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
  }

  // ==================== USERS ====================
  static async getUsers(): Promise<User[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun utilisateur disponible');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((user: any) => this.transformUserDBToUser(user));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await safeSupabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        type: userData.type || 'visitor',
        profile: userData.profile || {},
        status: userData.status || 'active'
      }] as any)
      .select()
      .single();

    if (error) throw error;
    return this.transformUserDBToUser(data);
  }

  static async getUserById(id: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) {
      return null;
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.transformUserDBToUser(data);
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) {
      return null;
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Erreur getUserByEmail:', error);
      return null;
    }

    if (!data) return null;
    return this.transformUserDBToUser(data);
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const updateData: any = {};

    if (updates.name) updateData.name = updates.name;
    if (updates.profile) updateData.profile = updates.profile;
    if (updates.status) updateData.status = updates.status;
    if (updates.type) updateData.type = updates.type;

    const { data, error } = await (safeSupabase as any)
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.transformUserDBToUser(data);
  }
}