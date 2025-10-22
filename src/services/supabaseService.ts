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
  user?: { profile: { standNumber?: string } }; // Ajout du champ user pour le standNumber
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
      console.error('Erreur lors de la récupération de l\`utilisateur:', error);
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
        .select(`
          id,
          user_id,
          company_name,
          category,
          sector,
          description,
          logo_url,
          website,
          verified,
          featured,
          contact_info,
          products:products(id, exhibitor_id, name, description, category, images, specifications, price, featured),
          mini_site:mini_sites(theme, custom_colors, sections, published, views, last_updated),
          user:users(profile->>standNumber) // Joindre la table users pour récupérer le standNumber
        `);

      if (exhibitorsError) throw exhibitorsError;

      return (exhibitorsData || []).map(this.transformExhibitorDBToExhibitor);
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
        .select(
          `id, name, type, category, description, logo_url, website, country, sector, verified, featured, sponsorship_level, contributions, established_year, employees`
        )
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

  // ==================== RECOMMENDATIONS ====================
  static async getRecommendationsForUser(userId: string, limit: number = 10): Promise<{ itemId: string; itemType: string; similarityScore: number }[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn("⚠️ Supabase non configuré - impossible de récupérer les recommandations");
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .rpc("get_recommendations_for_user", { p_user_id: userId, p_limit: limit });

      if (error) throw error;

      return (data || []).map((rec: any) => ({
        itemId: rec.item_id,
        itemType: rec.item_type,
        similarityScore: rec.similarity_score,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des recommandations:", error);
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
      status: userDB.status || 'active',
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
      miniSite,
      standNumber: exhibitorDB.user?.profile?.standNumber || undefined
    };
  }

  // ==================== AUTHENTICATION ====================
  static async signUp(email: string, password: string, userData: any): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      console.log('🔐 Création compte Auth Supabase pour:', email);

      // 1. Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await safeSupabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Erreur Auth:', authError);
        throw authError;
      }
      if (!authData.user) {
        console.error('❌ Aucun utilisateur retourné par Auth');
        return null;
      }

      console.log('✅ Compte Auth créé, ID:', authData.user.id);
      console.log('📝 Création du profil utilisateur dans la table users...');

      // 2. Créer le profil utilisateur
      const { data: userProfile, error: userError } = await (safeSupabase as any)
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          name: userData.name,
          type: userData.type,
          profile: userData.profile
        }])
        .select()
        .single();

      if (userError) {
        console.error('❌ Erreur création profil:', userError);
        throw userError;
      }

      console.log('✅ Profil utilisateur créé');

      // 3. Si c'est un exposant ou partenaire, créer l'entrée correspondante
      if (userData.type === 'exhibitor') {
        console.log('📋 Création profil exposant...');
        await this.createExhibitorProfile(authData.user.id, userData);
      } else if (userData.type === 'partner') {
        console.log('📋 Création profil partenaire...');
        await this.createPartnerProfile(authData.user.id, userData);
      }

      return this.transformUserDBToUser(userProfile);
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;

    try {
	      // AUTHENTIFICATION SUPABASE STANDARD
      const { data, error: authError } = await safeSupabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

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

  static async updateEvent(eventId: string, eventData: Omit<Event, 'id' | 'registered'>): Promise<Event> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('events')
        .update({
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.type,
          event_date: eventData.date.toISOString().split('T')[0],
          start_time: `${eventData.date.toISOString().split('T')[0]}T${eventData.startTime}:00Z`,
          end_time: `${eventData.date.toISOString().split('T')[0]}T${eventData.endTime}:00Z`,
          capacity: eventData.capacity,
          category: eventData.category,
          virtual: eventData.virtual,
          featured: eventData.featured,
          location: eventData.location,
          meeting_link: eventData.meetingLink,
          tags: eventData.tags,
          speakers: eventData.speakers,
        })
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Transformer les données de la DB au type Event
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.event_type,
	        date: new Date(data.event_date),
	        startTime: data.start_time.substring(11, 16),
	        endTime: data.end_time.substring(11, 16),
        capacity: data.capacity,
        registered: data.registered,
        speakers: data.speakers,
        category: data.category,
        virtual: data.virtual,
        featured: data.featured,
        location: data.location,
        meetingLink: data.meeting_link,
        tags: data.tags,
      } as Event;

	    } catch (error) {
	      const errorMessage = error instanceof Error ? error.message : `Erreur inconnue lors de la mise à jour de l'événement ${eventId}`;
	      console.error(`Erreur lors de la mise à jour de l'événement ${eventId}:`, errorMessage);
	      throw new Error(errorMessage);
	    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { error } = await (safeSupabase as any)
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
	    } catch (error) {
	      const errorMessage = error instanceof Error ? error.message : `Erreur inconnue lors de la suppression de l'événement ${eventId}`;
	      console.error(`Erreur lors de la suppression de l'événement ${eventId}:`, errorMessage);
	      throw new Error(errorMessage);
	    }
  }

  static async createEvent(eventData: Omit<Event, 'id' | 'registered'>): Promise<Event> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('events')
        .insert([{
          title: eventData.title,
          description: eventData.description,
          event_type: eventData.type,
          event_date: eventData.date.toISOString().split('T')[0], // Stocker la date seule
          start_time: `${eventData.date.toISOString().split('T')[0]}T${eventData.startTime}:00Z`, // Combiner date et heure pour le timestamp de début
          end_time: `${eventData.date.toISOString().split('T')[0]}T${eventData.endTime}:00Z`, // Combiner date et heure pour le timestamp de fin
          capacity: eventData.capacity,
          category: eventData.category,
          virtual: eventData.virtual,
          featured: eventData.featured,
          location: eventData.location,
          meeting_link: eventData.meetingLink,
          tags: eventData.tags,
          speakers: eventData.speakers,
          registered: 0, // Initialiser à 0
        }])
        .select()
        .single();

      if (error) throw error;

      // Transformer les données de la DB au type Event
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.event_type,
	        date: new Date(data.event_date),
	        startTime: data.start_time.substring(11, 16), // Extraire HH:MM (position 11 à 15)
	        endTime: data.end_time.substring(11, 16), // Extraire HH:MM (position 11 à 15)
        capacity: data.capacity,
        registered: data.registered,
        speakers: data.speakers,
        category: data.category,
        virtual: data.virtual,
        featured: data.featured,
        location: data.location,
        meetingLink: data.meeting_link,
        tags: data.tags,
      } as Event;

	    } catch (error) {
	      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de l\'événement';
	      console.error('Erreur lors de la création de l\'événement:', errorMessage);
	      throw new Error(errorMessage);
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
	        date: new Date(event.event_date),
	        startTime: event.start_time.substring(11, 16),
	        endTime: event.end_time.substring(11, 16),
        capacity: event.capacity,
        registered: event.registered || 0,
        speakers: event.speakers || [],
        category: event.category,
        virtual: event.virtual,
        featured: event.featured,
        location: event.location,
        meetingLink: event.meeting_link,
        tags: event.tags || [],
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

  static async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return (data || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        content: msg.content,
        type: msg.message_type,
        timestamp: new Date(msg.created_at),
        read: msg.read_at !== null
      }));
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return [];
    }
  }

  static async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string, type: 'text' | 'image' = 'text'): Promise<ChatMessage | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          message_type: type
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      return {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        content: data.content,
        type: data.message_type,
        timestamp: new Date(data.created_at),
        read: false
      };
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return null;
    }
  }

  static async getMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('mini_sites')
        .select('*')
        .eq('exhibitor_id', exhibitorId)
        .single();
        
      if (error) {
        console.warn('Mini-site non trouvé:', error.message);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur récupération mini-site:', error);
      return null;
    }
  }

  static async getExhibitorProducts(exhibitorId: string): Promise<Product[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('products')
        .select('*')
        .eq('exhibitor_id', exhibitorId);
        
      if (error) throw error;
      
      return (data || []).map((p: any) => ({
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
    } catch (error) {
      console.error('Erreur récupération produits:', error);
      return [];
    }
  }

  static async incrementMiniSiteViews(exhibitorId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    
    const safeSupabase = supabase!;
    try {
      await (safeSupabase as any).rpc('increment_view_count', { exhibitor_id_param: exhibitorId });
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  }

  static async getExhibitorForMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('exhibitors')
        .select('id, company_name, logo_url, description, website, contact_info')
        .eq('id', exhibitorId)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur récupération exposant pour mini-site:', error);
      return null;
	    }
	  }
	
	  static async updateExhibitor(exhibitorId: string, data: Partial<Exhibitor>): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;
	
	    const safeSupabase = supabase!;
	    try {
	      const updateData: Record<string, any> = {};
	      if (data.verified !== undefined) updateData.verified = data.verified;
	      if (data.featured !== undefined) updateData.featured = data.featured;
	      if (data.website !== undefined) updateData.website = data.website;
	      if (data.logo !== undefined) updateData.logo_url = data.logo;
	      // Ajoutez d'autres champs à mettre à jour si nécessaire
	
	      const { error } = await (safeSupabase as any)
	        .from('exhibitors')
	        .update(updateData)
	        .eq('id', exhibitorId);
	
	      if (error) throw error;
	      console.log(`✅ Profil exposant ${exhibitorId} mis à jour`);
	    } catch (error) {
	      console.error(`❌ Erreur mise à jour profil exposant ${exhibitorId}:`, error);
	      throw error;
	    }
	  }
	
	  static async updateUserStatus(userId: string, status: User['status']): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;
	
	    const safeSupabase = supabase!;
	    try {
	      const { error } = await (safeSupabase as any)
	        .from('users')
	        .update({ status })
	        .eq('id', userId);
	
	      if (error) throw error;
	      console.log(`✅ Statut utilisateur ${userId} mis à jour à ${status}`);
	    } catch (error) {
	      console.error(`❌ Erreur mise à jour statut utilisateur ${userId}:`, error);
	      throw error;
	    }
	  }
	
	  static async createExhibitorProfile(userId: string, userData: any): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    
    const safeSupabase = supabase!;
    try {
      const { error } = await (safeSupabase as any)
        .from('exhibitors')
        .insert([{
          id: userId, // Utilise l'ID utilisateur comme ID exposant
          user_id: userId,
          company_name: userData.profile.company,
          category: userData.profile.category || 'default',
          sector: userData.profile.sector || 'default',
          description: userData.profile.description || '',
          contact_info: {
            email: userData.email,
            phone: userData.profile.phone || ''
          }
        }]);
        
      if (error) throw error;
      console.log('✅ Profil exposant créé');
    } catch (error) {
      console.error('❌ Erreur création profil exposant:', error);
      throw error;
    }
  }

  static async createPartnerProfile(userId: string, userData: any): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    
    const safeSupabase = supabase!;
    try {
      const { error } = await (safeSupabase as any)
        .from('partners')
        .insert([{
          id: userId, // Utilise l'ID utilisateur comme ID partenaire
          user_id: userId,
          name: userData.profile.company,
          type: userData.profile.partnerType || 'sponsor',
          sector: userData.profile.sector || 'default',
          description: userData.profile.description || '',
          website: userData.profile.website || ''
        }]);
        
      if (error) throw error;
      console.log('✅ Profil partenaire créé');
    } catch (error) {
      console.error('❌ Erreur création profil partenaire:', error);
	      throw error;
	    }
	  }
	
	  static async sendValidationEmail(userData: {
	    email: string;
	    firstName: string;
	    lastName: string;
	    companyName: string;
	    status: 'approved' | 'rejected';
	  }): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;
	
	    const safeSupabase = supabase!;
	
	    try {
	      const { data, error } = await safeSupabase.functions.invoke('send-validation-email', {
	        body: userData
	      });
	
	      if (error) throw error;
	      console.log(`✅ Email de validation (${userData.status}) envoyé:`, data);
	    } catch (error) {
	      console.error(`❌ Erreur lors de l\`envoi de l\`email de validation:`, error);
	      throw error;
	    }
	  }
	
	  static async sendRegistrationEmail(userData: any): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;

    try {
      const { data, error } = await safeSupabase.functions.invoke('send-registration-email', {
        body: userData
      });

      if (error) throw error;
      console.log('✅ Email de confirmation envoyé:', data);
    } catch (error) {
      console.error('❌ Erreur lors de l\`envoi de l\`email:', error);
      throw error;
    }
  }
  // ===== NETWORKING FUNCTIONS =====

  /**
   * Recherche avancée d'utilisateurs avec filtres
   */
  static async searchUsers(filters: {
    searchTerm?: string;
    sector?: string;
    userType?: string;
    location?: string;
    limit?: number;
  }): Promise<User[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    const safeSupabase = supabase!;
    try {
      let query = (safeSupabase as any).from('users').select('*');

      // Filtre par terme de recherche (nom, entreprise, poste)
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const term = filters.searchTerm.trim().toLowerCase();
        query = query.or(`profile->>firstName.ilike.%${term}%,profile->>lastName.ilike.%${term}%,profile->>company.ilike.%${term}%,profile->>position.ilike.%${term}%`);
      }

      // Filtre par secteur
      if (filters.sector) {
        query = query.eq('profile->>sector', filters.sector);
      }

      // Filtre par type d'utilisateur
      if (filters.userType) {
        query = query.eq('type', filters.userType);
      }

      // Filtre par localisation (pays)
      if (filters.location) {
        query = query.eq('profile->>country', filters.location);
      }

      // Limite
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(this.transformUserDBToUser);
    } catch (error) {
      console.error('Erreur lors de la recherche d\`utilisateurs:', error);
      return [];
    }
  }

  /**
   * Récupère les recommandations de networking pour un utilisateur
   */
  static async getRecommendations(userId: string, limit: number = 10): Promise<User[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('recommendations')
        .select('recommended_user:recommended_user_id(*)')
        .eq('user_id', userId)
        .limit(limit);

      if (error) throw error;

      return (data || []).map((rec: any) => this.transformUserDBToUser(rec.recommended_user));
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      return [];
    }
  }

  /**
   * Envoie une demande de connexion
   */
	  static async createNotification(userId: string, message: string, type: 'connection' | 'event' | 'message' | 'system'): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;
	
	    const safeSupabase = supabase!;
	    try {
	      await (safeSupabase as any).from('notifications').insert([{
	        user_id: userId,
	        message: message,
	        type: type,
	        read: false
	      }]);
	    } catch (error) {
	      console.error('Erreur lors de la création de la notification:', error);
	    }
	  }
	
	  static async sendConnectionRequest(fromUserId: string, toUserId: string): Promise<boolean> {
	    if (!this.checkSupabaseConnection()) return false;
	
	    const safeSupabase = supabase!;
	    try {
	      const { error } = await (safeSupabase as any).from('connections').insert([{
	        requester_id: fromUserId,
	        addressee_id: toUserId,
	        status: 'pending'
	      }]);
	
	      if (error) throw error;
	
	      // Envoyer une notification au destinataire
	      this.createNotification(toUserId, 'Vous avez reçu une demande de connexion.', 'connection');
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors de l\`envoi de la demande de connexion:', error);
	      return false;
	    }
	  }
	
	  /**
	   * Accepte une demande de connexion
	   */
	  static async acceptConnectionRequest(connectionId: string): Promise<boolean> {
	    if (!this.checkSupabaseConnection()) return false;
	
	    const safeSupabase = supabase!;
	    try {
	      const { data, error } = await (safeSupabase as any)
	        .from('connections')
	        .update({ status: 'accepted' })
	        .eq('id', connectionId)
	        .select('requester_id, addressee_id')
	        .single();
	
	      if (error) throw error;
	
	      // Envoyer une notification à l'expéditeur
	      const requesterId = data.requester_id;
	      this.createNotification(requesterId, 'Votre demande de connexion a été acceptée !', 'connection');
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors de l\`acceptation de la demande:', error);
	      return false;
	    }
	  }

  /**
   * Récupère les connexions d'un utilisateur
   */
  static async getConnections(userId: string): Promise<User[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      // On récupère les IDs des utilisateurs connectés
      const { data: connections, error } = await (safeSupabase as any)
        .from('connections')
        .select('requester_id, addressee_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (error) throw error;

      const connectedUserIds = (connections || []).map((conn: any) => 
        conn.requester_id === userId ? conn.addressee_id : conn.requester_id
      );

      if (connectedUserIds.length === 0) return [];

      // On récupère les profils de ces utilisateurs
      const { data: users, error: usersError } = await (safeSupabase as any)
        .from('users')
        .select('*')
        .in('id', connectedUserIds);

      if (usersError) throw usersError;

      return (users || []).map(this.transformUserDBToUser);
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }

  // ==================== TIME SLOTS ====================
  static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('time_slots')
        .select('*')
        .eq('user_id', userId);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des créneaux horaires:', error);
      return [];
    }
  }

  static async createTimeSlot(slotData: Omit<TimeSlot, 'id' | 'currentBookings' | 'available'>): Promise<TimeSlot> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('time_slots')
        .insert([slotData])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du créneau horaire:', error);
      throw error;
    }
  }

  static async deleteTimeSlot(slotId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      const { error } = await (safeSupabase as any)
        .from('time_slots')
        .delete()
        .eq('id', slotId);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du créneau horaire:', error);
    }
  }




  // ==================== APPOINTMENTS ====================

  static async createAppointment(appointmentData: {
    exhibitorId: string;
    visitorId: string;
    timeSlotId: string;
    status: string;
    meetingType: string;
  }): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // 1. Créer le rendez-vous
      const { data: appointment, error: appointmentError } = await (safeSupabase as any)
        .from("appointments")
        .insert([
          {
            exhibitor_id: appointmentData.exhibitorId,
            visitor_id: appointmentData.visitorId,
            time_slot_id: appointmentData.timeSlotId,
            status: appointmentData.status,
            meeting_type: appointmentData.meetingType,
          },
        ])
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // 2. Récupérer le créneau horaire associé
      const { data: timeSlot, error: timeSlotError } = await (safeSupabase as any)
        .from("time_slots")
        .select("id, max_bookings, current_bookings, available")
        .eq("id", appointmentData.timeSlotId)
        .single();

      if (timeSlotError) throw timeSlotError;

      // 3. Mettre à jour le nombre de réservations et le statut de disponibilité
      let newCurrentBookings = (timeSlot.current_bookings || 0) + 1;
      let newAvailableStatus = timeSlot.available;

      if (newCurrentBookings >= timeSlot.max_bookings) {
        newAvailableStatus = false;
      }

      const { error: updateError } = await (safeSupabase as any)
        .from("time_slots")
        .update({
          current_bookings: newCurrentBookings,
          available: newAvailableStatus,
        })
        .eq("id", appointmentData.timeSlotId);

      if (updateError) throw updateError;

      return appointment;
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous ou de la mise à jour du créneau:", error);
      return null;
    }
  }

  // ==================== USERS ====================

  static async createUser(userData: Partial<User>): Promise<User> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        type: userData.type || 'visitor',
        status: userData.status || 'pending',
        profile: userData.profile || {}
      }])
      .select()
      .single();
    if (error) throw error;
    return this.mapUserFromDB(data);
  }

  // ==================== EXHIBITORS ====================

  static async createExhibitor(exhibitorData: Partial<Exhibitor>): Promise<Exhibitor> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('exhibitors')
      .insert([{
        user_id: exhibitorData.userId,
        company_name: exhibitorData.companyName,
        category: exhibitorData.category,
        sector: exhibitorData.sector,
        description: exhibitorData.description,
        logo_url: exhibitorData.logo,
        website: exhibitorData.website,
        contact_info: exhibitorData.contactInfo || {},
        verified: exhibitorData.verified || false,
        featured: exhibitorData.featured || false
      }])
      .select(`*, user:users!exhibitors_user_id_fkey(*), products:products!fk_products_exhibitor(*), mini_site:mini_sites!mini_sites_exhibitor_id_fkey(*)`)
      .single();

    if (error) throw error;
    return this.mapExhibitorFromDB(data);
  }

  // ==================== PRODUCTS ====================

  static async createProduct(productData: Partial<Product> & { exhibitorId?: string }): Promise<Product> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('products')
      .insert([{
        exhibitor_id: productData.exhibitorId,
        name: productData.name,
        description: productData.description,
        category: productData.category,
        images: productData.images || [],
        specifications: productData.specifications,
        price: productData.price,
        featured: productData.featured || false
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapProductFromDB(data);
  }

  // ==================== MINI SITES ====================

  static async updateMiniSite(exhibitorId: string, siteData: Partial<MiniSiteDB>): Promise<MiniSiteDB> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('mini_sites')
      .upsert({
        exhibitor_id: exhibitorId,
        theme: siteData.theme,
        custom_colors: siteData.custom_colors,
        sections: siteData.sections,
        published: siteData.published,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // ==================== REGISTRATION REQUESTS ====================

  static async getRegistrationRequests(status?: 'pending' | 'approved' | 'rejected'): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;
    try {
      let query = (safeSupabase as any).from('registration_requests').select('*');
      if (status) {
        query = query.eq('status', status);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching registration requests:', error);
      return [];
    }
  }

  static async updateRegistrationRequestStatus(
    requestId: string,
    status: 'approved' | 'rejected',
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      const updateData: any = {
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      };
      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }
      const { error } = await (safeSupabase as any)
        .from('registration_requests')
        .update(updateData)
        .eq('id', requestId);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating registration request status:', error);
      throw error;
    }
  }

  static async createRegistrationRequest(requestData: {
    userType: string;
    email: string;
    name: string;
    company?: string;
    phone?: string;
    metadata?: any;
  }): Promise<any> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('registration_requests')
        .insert([{
          user_type: requestData.userType,
          email: requestData.email,
          name: requestData.name,
          company: requestData.company,
          phone: requestData.phone,
          status: 'pending',
          metadata: requestData.metadata || {},
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating registration request:', error);
      throw error;
    }
  }

}

