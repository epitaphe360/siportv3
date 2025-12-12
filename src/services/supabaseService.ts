import { supabase } from '../lib/supabase';
import { isSupabaseReady } from '../lib/supabase';
import { User, Exhibitor, Partner, Product, Appointment, Event, ChatMessage, ChatConversation, MiniSiteSection, MessageAttachment, ExhibitorCategory, ContactInfo, TimeSlot, UserProfile } from '../types';

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
  profile: UserProfile;
  status?: 'active' | 'pending' | 'suspended' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ProductDB {
  id: string;
  exhibitor_id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  specifications?: string;
  price?: number;
  featured: boolean;
}

interface MiniSiteData {
  theme: string;
  custom_colors?: Record<string, string>;
  sections?: MiniSiteSection[];
  published?: boolean;
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
  contact_info: ContactInfo;
  products?: ProductDB[];
  mini_site?: MiniSiteData;
  user?: { profile: { standNumber?: string } }; // Ajout du champ user pour le standNumber
}

interface MiniSiteDB {
  id: string;
  exhibitor_id: string;
  theme: string;
  custom_colors: Record<string, string>;
  sections: MiniSiteSection[];
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
      const { data, error } = await safeSupabase
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

  static async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const updateData: Record<string, any> = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.type !== undefined) updateData.type = userData.type;
      if (userData.status !== undefined) updateData.status = userData.status;
      if (userData.profile !== undefined) updateData.profile = userData.profile;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await safeSupabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return this.transformUserDBToUser(data);
    } catch (error) {
      console.error(`❌ Erreur mise à jour utilisateur ${userId}:`, error);
      throw error;
    }
  }

  static async createSimpleRegistrationRequest(userId: string, requestType: 'exhibitor' | 'partner'): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('registration_requests')
        .insert([{
          user_id: userId,
          request_type: requestType,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error(`❌ Erreur création demande d'inscription:`, error);
      throw error;
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
      const { data: exhibitorsData, error: exhibitorsError } = await safeSupabase
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
          products:products!products_exhibitor_id_fkey(id, exhibitor_id, name, description, category, images, specifications, price, featured),
          mini_site:mini_sites!mini_sites_exhibitor_id_fkey(theme, custom_colors, sections, published, views, last_updated),
          user:users!exhibitors_user_id_fkey(profile)
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
      const { data, error } = await safeSupabase
        .from('partners')
        .select(
          `id, name, type, category, sector, description, logo_url, website, country, verified, featured, sponsorship_level, contributions, established_year, employees`
        )
        .order('type');

      if (error) throw error;

      return (data || []).map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        type: partner.type,
        category: partner.category,
        description: partner.description,
        logo: partner.logo_url,
        website: partner.website,
        country: partner.country || '',
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
      const { data, error } = await safeSupabase
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
      profile: userDB.profile,
      status: userDB.status || 'active',
      createdAt: new Date(userDB.created_at),
      updatedAt: new Date(userDB.updated_at)
    };
  }

  private static transformExhibitorDBToExhibitor(exhibitorDB: ExhibitorDB): Exhibitor {
    const products = (exhibitorDB.products || []).map((p: ProductDB) => ({
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

    // mini_site est retourné comme un array par Supabase, prenons le premier élément
    const miniSiteArray = exhibitorDB.mini_site as any;
    const miniSiteData = Array.isArray(miniSiteArray) && miniSiteArray.length > 0 ? miniSiteArray[0] : miniSiteArray;
    
    const miniSite = miniSiteData ? {
      theme: miniSiteData.theme || 'default',
      customColors: miniSiteData.custom_colors || {},
      sections: miniSiteData.sections || [],
      published: miniSiteData.published || false,
      views: miniSiteData.views || 0,
      lastUpdated: new Date(miniSiteData.last_updated || Date.now())
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
      contactInfo: exhibitorDB.contact_info,
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


      // 2. Créer le profil utilisateur
      const { data: userProfile, error: userError } = await safeSupabase
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


      // 3. Si c'est un exposant ou partenaire, créer l'entrée correspondante
      if (userData.type === 'exhibitor') {
        await this.createExhibitorProfile(authData.user.id, userData);
      } else if (userData.type === 'partner') {
        await this.createPartnerProfile(authData.user.id, userData);
      }

      return this.transformUserDBToUser(userProfile);
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      throw error;
    }
  }

  static async signIn(email: string, password: string, options?: { rememberMe?: boolean }): Promise<User | null> {
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

      // ✅ Note: Supabase persiste automatiquement les sessions dans localStorage par défaut
      // L'option rememberMe est enregistrée pour référence future (ex: logout automatique)
      // Dans une implémentation avancée, on pourrait utiliser sessionStorage si rememberMe = false
      if (options?.rememberMe === false) {
        // Pour l'instant, on log simplement l'intention
        // TODO: Implémenter session temporaire avec sessionStorage si besoin
      }

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
      const { data, error } = await safeSupabase
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
    throw new Error('updateEvent temporairement désactivé - schéma incompatible');
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
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
      const { error } = await safeSupabase
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
    throw new Error('createEvent temporairement désactivé - schéma incompatible');
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
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
    throw new Error('getEvents temporairement désactivé - schéma incompatible');
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
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
      const { data, error } = await safeSupabase
        .from('conversations')
        .select(`
          id,
          participants,
          type,
          title,
          description,
          created_by,
          last_message_at,
          is_active,
          metadata,
          created_at,
          updated_at,
          messages:messages(
            id,
            content,
            message_type,
            created_at,
            read_at,
            receiver_id,
            sender:sender_id(id, name)
          )
        `)
        .contains('participants', [userId])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((conv: any) => {
        const lastMessage = conv.messages?.[0];

        // ✅ Compter les messages non lus pour cet utilisateur
        const unreadCount = (conv.messages || []).filter((msg: any) =>
          msg.receiver_id === userId && msg.read_at === null
        ).length;

        return {
          id: conv.id,
          participants: conv.participants,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            senderId: lastMessage.sender.id,
            receiverId: conv.participants.find((id: string) => id !== lastMessage.sender.id),
            content: lastMessage.content,
            type: lastMessage.message_type,
            timestamp: new Date(lastMessage.created_at),
            read: lastMessage.read_at !== null
          } : null,
          unreadCount, // ✅ Maintenant implémenté !
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
      const { data, error } = await safeSupabase
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
      const { data, error } = await safeSupabase
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

  /**
   * Marque tous les messages non lus d'une conversation comme lus pour un utilisateur
   * @param conversationId - ID de la conversation
   * @param userId - ID de l'utilisateur qui lit les messages
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .is('read_at', null);

      if (error) throw error;

    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      throw error;
    }
  }

  static async getMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('mini_sites')
        .select('*')
        .eq('exhibitor_id', exhibitorId)
        .single();

      if (error) {
        console.warn('Mini-site non trouvé:', error.message);
        return null;
      }

      // Transformer la structure pour le frontend
      // Unifier theme et custom_colors en un seul objet theme
      if (data && data.custom_colors && typeof data.custom_colors === 'object') {
        data.theme = {
          primaryColor: data.custom_colors.primary || data.custom_colors.primaryColor || '#1e40af',
          secondaryColor: data.custom_colors.secondary || data.custom_colors.secondaryColor || '#3b82f6',
          accentColor: data.custom_colors.accent || data.custom_colors.accentColor || '#60a5fa',
          fontFamily: data.custom_colors.fontFamily || 'Inter'
        };
      } else if (!data.theme || typeof data.theme === 'string') {
        // Si theme n'existe pas ou est une string, créer un theme par défaut
        data.theme = {
          primaryColor: '#1e40af',
          secondaryColor: '#3b82f6',
          accentColor: '#60a5fa',
          fontFamily: 'Inter'
        };
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
      const { data, error } = await safeSupabase
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
      // Récupérer le nombre de vues actuel
      const { data: currentData } = await safeSupabase
        .from('mini_sites')
        .select('views')
        .eq('exhibitor_id', exhibitorId)
        .single();

      if (currentData) {
        // Incrémenter les vues
        await safeSupabase
          .from('mini_sites')
          .update({ views: (currentData.views || 0) + 1 })
          .eq('exhibitor_id', exhibitorId);
      }
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  }

  static async getExhibitorForMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
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

  static async getExhibitorByUserId(userId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('exhibitors')
        .select('id, company_name, logo_url, description, website, contact_info, user_id')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erreur récupération exposant par user_id:', error);
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
	
	      const { error } = await safeSupabase
	        .from('exhibitors')
	        .update(updateData)
	        .eq('id', exhibitorId);
	
	      if (error) throw error;
	    } catch (error) {
	      console.error(`❌ Erreur mise à jour profil exposant ${exhibitorId}:`, error);
	      throw error;
	    }
	  }
	
	  static async updateUserStatus(userId: string, status: User['status']): Promise<void> {
	    if (!this.checkSupabaseConnection()) return;

	    const safeSupabase = supabase!;
	    try {
	      const { error } = await safeSupabase
	        .from('users')
	        .update({ status })
	        .eq('id', userId);

	      if (error) throw error;
	    } catch (error) {
	      console.error(`❌ Erreur mise à jour statut utilisateur ${userId}:`, error);
	      throw error;
	    }
	  }

	  static async validateExhibitorAtomic(
	    exhibitorId: string,
	    newStatus: 'approved' | 'rejected'
	  ): Promise<{
	    userId: string;
	    userEmail: string;
	    userName: string;
	    companyName: string;
	    success: boolean;
	  } | null> {
	    if (!this.checkSupabaseConnection()) return null;

	    const safeSupabase = supabase!;
	    try {
	      const { data, error } = await safeSupabase
	        .rpc('validate_exhibitor_atomic', {
	          p_exhibitor_id: exhibitorId,
	          p_new_status: newStatus
	        });

	      if (error) throw error;

	      const result = data?.[0];

	      if (!result?.success) {
	        throw new Error('Échec de la validation de l\'exposant');
	      }

	      return {
	        userId: result.user_id,
	        userEmail: result.user_email,
	        userName: result.user_name,
	        companyName: result.company_name,
	        success: result.success
	      };
	    } catch (error) {
	      console.error(`❌ Erreur validation exposant ${exhibitorId}:`, error);
	      throw error;
	    }
	  }

	  static async validatePartnerAtomic(
	    partnerId: string,
	    newStatus: 'approved' | 'rejected'
	  ): Promise<{
	    userId: string;
	    userEmail: string;
	    userName: string;
	    partnerName: string;
	    success: boolean;
	  } | null> {
	    if (!this.checkSupabaseConnection()) return null;

	    const safeSupabase = supabase!;
	    try {
	      const { data, error } = await safeSupabase
	        .rpc('validate_partner_atomic', {
	          p_partner_id: partnerId,
	          p_new_status: newStatus
	        });

	      if (error) throw error;

	      const result = data?.[0];

	      if (!result?.success) {
	        throw new Error('Échec de la validation du partenaire');
	      }

	      return {
	        userId: result.user_id,
	        userEmail: result.user_email,
	        userName: result.user_name,
	        partnerName: result.partner_name,
	        success: result.success
	      };
	    } catch (error) {
	      console.error(`❌ Erreur validation partenaire ${partnerId}:`, error);
	      throw error;
	    }
	  }

	  static async createExhibitorProfile(userId: string, userData: any): Promise<void> {
    if (!this.checkSupabaseConnection()) return;

    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('exhibitors')
        .insert([{
          id: userId, // Utilise l'ID utilisateur comme ID exposant
          user_id: userId,
          company_name: userData.profile.company,
          category: userData.profile.category || 'institutional',
          sector: userData.profile.sector || 'logistics',
          description: userData.profile.description || '',
          contact_info: {
            email: userData.email,
            phone: userData.profile.phone || ''
          }
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erreur création profil exposant:', error);
      throw error;
    }
  }

  static async createPartnerProfile(userId: string, userData: any): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    
    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
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
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      throw error;
    }
  }

  // ===== CONTACT FUNCTIONS =====

  /**
   * Créer un message de contact
   */
  static async createContactMessage(messageData: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    subject: string;
    message: string;
  }): Promise<{ id: string }> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Connexion Supabase non disponible');
    }

    const safeSupabase = supabase!;

    try {
      const { data, error } = await safeSupabase
        .from('contact_messages')
        .insert([
          {
            first_name: messageData.firstName,
            last_name: messageData.lastName,
            email: messageData.email,
            company: messageData.company || null,
            subject: messageData.subject,
            message: messageData.message,
            status: 'new'
          }
        ])
        .select('id')
        .single();

      if (error) {
        console.error('❌ Erreur création message contact:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la création du message:', error);
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
      let query = safeSupabase.from('users').select('*');

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
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
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
      const { data, error } = await safeSupabase
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
	      await safeSupabase.from('notifications').insert([{
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
	      const { error } = await safeSupabase.from('connections').insert([{
	        requester_id: fromUserId,
	        addressee_id: toUserId,
	        status: 'pending'
	      }]);
	
	      if (error) throw error;
	
	      // Envoyer une notification au destinataire
	      this.createNotification(toUserId, 'Vous avez reçu une demande de connexion.', 'connection');
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors de l\'envoi de la demande de connexion:', error);
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
	      const { data, error } = await safeSupabase
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
	      console.error('Erreur lors de l\'acceptation de la demande:', error);
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
      const { data: connections, error } = await safeSupabase
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
      const { data: users, error: usersError } = await safeSupabase
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
  static async getTimeSlotsByExhibitor(exhibitorId: string): Promise<TimeSlot[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', exhibitorId);
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
      const { data, error } = await safeSupabase
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
      const { error } = await safeSupabase
        .from('time_slots')
        .delete()
        .eq('id', slotId);
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du créneau horaire:', error);
    }
  }




  // ==================== APPOINTMENTS ====================
  static async getAppointments(): Promise<Appointment[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('appointments')
        .select(`
          *,
          exhibitor:exhibitors(id, company_name, logo_url),
          visitor:users(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      return [];
    }
  }

  static async updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;
    try {
      const { error } = await safeSupabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;
    } catch (error) {
      console.error(`❌ Erreur mise à jour statut rendez-vous ${appointmentId}:`, error);
      throw error;
    }
  }

  static async createAppointment(appointmentData: {
    exhibitorId?: string;
    visitorId: string;
    timeSlotId: string;
    message?: string;
    meetingType?: string;
  }): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // Utiliser la fonction atomique pour éviter les race conditions
      const { data, error } = await safeSupabase
        .rpc('book_appointment_atomic', {
          p_time_slot_id: appointmentData.timeSlotId,
          p_visitor_id: appointmentData.visitorId,
          p_exhibitor_id: appointmentData.exhibitorId,
          p_message: appointmentData.message || null,
          p_meeting_type: appointmentData.meetingType || 'in-person'
        });

      if (error) throw error;

      // La fonction RPC retourne un tableau avec un seul élément
      const result = data?.[0];

      if (!result?.success) {
        throw new Error(result?.error_message || 'Erreur lors de la création du rendez-vous');
      }

      // Récupérer le rendez-vous créé
      const { data: appointment, error: fetchError } = await safeSupabase
        .from('appointments')
        .select(`
          *,
          exhibitor:exhibitors(id, company_name, logo_url),
          visitor:users(id, name, email)
        `)
        .eq('id', result.appointment_id)
        .single();

      if (fetchError) throw fetchError;

      return appointment;
    } catch (error) {
      console.error("Erreur lors de la création du rendez-vous:", error);
      throw error;
    }
  }

  // ==================== MAPPING HELPERS ====================
  private static mapUserFromDB(data: any): User {
    return this.transformUserDBToUser(data);
  }

  private static mapExhibitorFromDB(data: any): Exhibitor {
    return this.transformExhibitorDBToExhibitor(data);
  }

  private static mapProductFromDB(data: any): Product {
    return {
      id: data.id,
      exhibitorId: data.exhibitor_id,
      name: data.name,
      description: data.description,
      category: data.category,
      images: data.images || [],
      specifications: data.specifications,
      price: data.price,
      featured: data.featured || false
    };
  }

  // ==================== USERS ====================

  static async getUsers(): Promise<User[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('users')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Erreur lors de la récupération des utilisateurs:', error.message);
        return [];
      }

      return (data || []).map(this.transformUserDBToUser);
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

  // ==================== PARTNERS ====================

  static async createPartner(partnerData: Partial<Partner>): Promise<Partner> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('partners')
      .insert([{
        name: partnerData.name,
        type: partnerData.type,
        category: partnerData.category,
        sector: partnerData.sector,
        description: partnerData.description,
        website: partnerData.website,
        country: partnerData.country,
        sponsorship_level: partnerData.sponsorshipLevel,
        contributions: partnerData.contributions || [],
        logo_url: partnerData.logo,
        established_year: partnerData.establishedYear,
        employees: partnerData.employees,
        verified: partnerData.verified || false,
        featured: partnerData.featured || false
      }])
      .select()
      .single();

    if (error) throw error;

    // Mapper les données de la DB au format Partner
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      category: data.category,
      sector: data.sector,
      description: data.description,
      website: data.website,
      country: data.country,
      sponsorshipLevel: data.sponsorship_level,
      contributions: data.contributions || [],
      logo: data.logo_url,
      establishedYear: data.established_year,
      employees: data.employees,
      verified: data.verified || false,
      featured: data.featured || false
    };
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

