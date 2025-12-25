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
  type: 'exhibitor' | 'partner' | 'visitor' | 'admin' | 'security';
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
      // On récupère d'abord l'utilisateur - utiliser maybeSingle() au lieu de single()
      // pour éviter l'erreur "Cannot coerce" quand 0 ou plusieurs résultats
      const { data: usersData, error: userError } = await safeSupabase
        .from('users')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (userError) {
        console.error('❌ Erreur DB lors de la récupération utilisateur:', userError.message);
        throw new Error(`Utilisateur non trouvé: ${userError.message}`);
      }

      const userData = usersData && usersData.length > 0 ? usersData[0] : null;

      if (!userData) {
        throw new Error('Aucun profil utilisateur trouvé pour cet email');
      }

      // Si c'est un partenaire, on tente de récupérer ses projets séparément
      // pour éviter les erreurs de jointure si la relation n'est pas détectée par PostgREST
      let projects: any[] = [];
      if (userData.type === 'partner') {
        try {
          // On essaie de récupérer par user_id (nouvelle structure)
          const { data: projectsData, error: projectsError } = await safeSupabase
            .from('partner_projects')
            .select('*')
            .eq('user_id', userData.id);
          
          if (!projectsError && projectsData) {
            projects = projectsData;
          } else {
            // Fallback: essayer de trouver via la table partners si user_id n'existe pas encore
            const { data: partnerData } = await safeSupabase
              .from('partners')
              .select('id')
              .eq('user_id', userData.id)
              .single();
            
            if (partnerData) {
              const { data: fallbackProjects } = await safeSupabase
                .from('partner_projects')
                .select('*')
                .eq('partner_id', partnerData.id);
              
              if (fallbackProjects) {
                projects = fallbackProjects;
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Erreur lors de la récupération des projets partenaire:', e);
        }
      }

      const combinedData = {
        ...userData,
        partner_projects: projects
      };

      return this.transformUserDBToUser(combinedData);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
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
          `id, company_name, partner_type, sector, description, logo_url, website, contact_info, verified, featured, partnership_level, benefits, created_at`
        )
        .order('partner_type');

      if (error) throw error;

      return (data || []).map((partner: any) => ({
        id: partner.id,
        name: partner.company_name,
        partner_tier: partner.partnership_level,
        category: partner.partner_type,
        sector: partner.sector,
        description: partner.description || '',
        logo: partner.logo_url,
        website: partner.website,
        country: partner.contact_info?.country || '',
        verified: partner.verified,
        featured: partner.featured,
        contributions: partner.benefits || [],
        establishedYear: partner.established_year || 2024,
        employees: partner.employees || '1-10',
        createdAt: new Date(partner.created_at),
        updatedAt: new Date(partner.created_at) // Fallback
      }));
    } catch (error) {
      // Log détaillé pour faciliter le debug (message, details, hint si disponibles)
      try {
        console.error('Erreur lors de la récupération des partenaires:', {
          message: (error as any)?.message || String(error),
          details: (error as any)?.details || (error as any)?.hint || null,
          raw: JSON.stringify(error)
        });
      } catch (e) {
        console.error('Erreur lors de la récupération des partenaires (raw):', error);
      }
      return [];
    }
  }

  static async getPartnerById(id: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('partners')
        .select(
          `id, company_name, partner_type, sector, description, logo_url, website, contact_info, verified, featured, partnership_level, benefits, created_at,
           projects:partner_projects(*)`
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transformer les projets de la DB vers le format UI
      const dbProjects = (data.projects || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: new Date(p.start_date),
        endDate: p.end_date ? new Date(p.end_date) : undefined,
        budget: p.budget,
        impact: p.impact,
        image: p.image_url,
        technologies: p.technologies || [],
        team: p.team || [],
        kpis: p.kpis || { progress: 0, satisfaction: 0, roi: 0 },
        timeline: (p.timeline || []).map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })),
        partners: p.project_partners || [],
        documents: p.documents || [],
        gallery: p.gallery || []
      }));

      return {
        id: data.id,
        name: data.company_name,
        sponsorshipLevel: data.partnership_level,
        category: data.partner_type,
        description: data.description || '',
        longDescription: data.description || '',
        logo: data.logo_url,
        website: data.website,
        country: data.contact_info?.country || data.country || 'Royaume-Uni',
        contributions: data.benefits || [
          "Sponsoring Session Plénière",
          "Espace Networking Premium",
          "Visibilité Logo Multi-supports"
        ],
        establishedYear: 2010,
        employees: '500-1000',
        projects: dbProjects.length > 0 ? dbProjects : this.getMockProjects(data.id, data.company_name),
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du partenaire:', error);
      return null;
    }
  }

  /**
   * Génère des projets fictifs pour les partenaires (Quick Fix pour UI)
   */
  private static getMockProjects(partnerId: string, partnerName: string): any[] {
    return [
      {
        id: `proj-${partnerId}-1`,
        name: "Optimisation des Flux Portuaires 2026",
        description: "Projet majeur de digitalisation des processus d'entrée et sortie des conteneurs utilisant l'IA pour réduire les temps d'attente de 30%.",
        status: 'active',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2026-06-30'),
        budget: "2.5M €",
        impact: "Réduction CO2 15%",
        image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
        technologies: ["IA", "IoT", "Blockchain"],
        team: ["Jean Dupont", "Sarah Miller", "Marc Chen"],
        kpis: { progress: 65, satisfaction: 92, roi: 185 },
        timeline: [
          { phase: "Analyse", date: new Date('2024-01-15'), status: 'completed', description: "Étude de faisabilité terminée" },
          { phase: "Développement", date: new Date('2024-06-01'), status: 'current', description: "Implémentation des algorithmes" }
        ],
        partners: ["Port de Casablanca", "TechLogistics"],
        documents: [{ name: "Rapport Phase 1", type: "PDF", url: "#" }],
        gallery: ["https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=400"]
      },
      {
        id: `proj-${partnerId}-2`,
        name: "Terminal Vert Intelligent",
        description: "Installation de systèmes d'énergie renouvelable et automatisation complète du terminal 3 pour une empreinte carbone neutre.",
        status: 'planned',
        startDate: new Date('2025-03-01'),
        budget: "5.8M €",
        impact: "Zéro Émission",
        image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80",
        technologies: ["Solaire", "Hydrogène", "Automatisation"],
        team: ["Elena Rodriguez", "Tom Wilson"],
        kpis: { progress: 10, satisfaction: 100, roi: 210 },
        timeline: [
          { phase: "Conception", date: new Date('2025-03-01'), status: 'upcoming', description: "Design des infrastructures" }
        ],
        partners: ["GreenEnergy Corp"],
        documents: [{ name: "Plan Directeur", type: "PDF", url: "#" }],
        gallery: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400"]
      }
    ];
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
  private static transformUserDBToUser(userDB: any): User {
    if (!userDB) return null as any;
    return {
      id: userDB.id,
      email: userDB.email,
      name: userDB.name,
      type: userDB.type,
      visitor_level: userDB.visitor_level,
      profile: userDB.profile,
      status: userDB.status || 'active',
      projects: userDB.partner_projects || [],
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

  private static transformEventDBToEvent(eventDB: any): Event {
    // Valider les dates avant de les convertir
    const startTime = eventDB.event_date || eventDB.start_time || eventDB.start_date; // Fallback pour compatibilité
    const endTime = eventDB.end_time || eventDB.end_date;
    
    if (!startTime) {
      console.warn('Event sans start_time:', eventDB.id);
      // Utiliser une date par défaut
      const defaultDate = new Date();
      return {
        id: eventDB.id,
        title: eventDB.title || 'Sans titre',
        description: eventDB.description || '',
        type: eventDB.type || eventDB.event_type || 'conference',
        startDate: defaultDate,
        endDate: defaultDate,
        capacity: eventDB.capacity,
        registered: eventDB.registered || 0,
        location: eventDB.location,
        pavilionId: eventDB.pavilion_id,
        organizerId: eventDB.organizer_id,
        featured: eventDB.featured || eventDB.is_featured || false,
        imageUrl: eventDB.image_url,
        registrationUrl: eventDB.registration_url,
        tags: eventDB.tags || [],
        date: defaultDate,
        startTime: defaultDate.toISOString(),
        endTime: defaultDate.toISOString()
      };
    }
    
    const startDate = new Date(startTime);
    let endDate: Date;

    // Gérer le cas où endTime est juste une heure (ex: "13:00:00")
    if (endTime && typeof endTime === 'string' && endTime.includes(':') && !endTime.includes('-') && !endTime.includes('T')) {
      const [hours, minutes] = endTime.split(':').map(Number);
      endDate = new Date(startDate);
      endDate.setHours(hours || 0, minutes || 0, 0);
    } else {
      endDate = new Date(endTime || startTime);
    }
    
    // Vérifier que les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn('Event avec dates invalides:', eventDB.id, startTime, endTime);
      const defaultDate = new Date();
      return {
        id: eventDB.id,
        title: eventDB.title || 'Sans titre',
        description: eventDB.description || '',
        type: eventDB.type || eventDB.event_type || 'conference',
        startDate: defaultDate,
        endDate: defaultDate,
        capacity: eventDB.capacity,
        registered: eventDB.registered || 0,
        location: eventDB.location,
        pavilionId: eventDB.pavilion_id,
        organizerId: eventDB.organizer_id,
        featured: eventDB.featured || eventDB.is_featured || false,
        imageUrl: eventDB.image_url,
        registrationUrl: eventDB.registration_url,
        tags: eventDB.tags || [],
        speakers: eventDB.speakers || [],
        date: defaultDate,
        startTime: '00:00',
        endTime: '00:00'
      };
    }

    return {
      id: eventDB.id,
      title: eventDB.title,
      description: eventDB.description,
      type: eventDB.type || eventDB.event_type,
      startDate,
      endDate,
      capacity: eventDB.capacity,
      registered: eventDB.registered || 0,
      location: eventDB.location,
      pavilionId: eventDB.pavilion_id,
      organizerId: eventDB.organizer_id,
      featured: eventDB.featured || eventDB.is_featured || false,
      imageUrl: eventDB.image_url,
      registrationUrl: eventDB.registration_url,
      tags: eventDB.tags || [],
      speakers: eventDB.speakers || [],
      // Legacy/computed fields for backward compatibility
      date: startDate,
      startTime: startDate.toISOString().substring(11, 16),
      endTime: endDate.toISOString().substring(11, 16),
    };
  }

  // ==================== AUTHENTICATION ====================
  static async signUp(email: string, password: string, userData: any, recaptchaToken?: string): Promise<User | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // 0. Vérifier reCAPTCHA si token fourni
      if (recaptchaToken) {
        const recaptchaValid = await this.verifyRecaptcha(recaptchaToken, `${userData.type}_registration`);
        if (!recaptchaValid) {
          throw new Error('Échec de la vérification reCAPTCHA. Veuillez réessayer.');
        }
      }

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
      const userPayload: any = {
        id: authData.user.id,
        email,
        name: userData.name,
        type: userData.type,
        profile: userData.profile
      };

      // ✅ Définir le niveau visiteur par défaut à 'free' pour les visiteurs
      if (userData.type === 'visitor') {
        userPayload.visitor_level = 'free';
      }

      const { data: userProfile, error: userError } = await safeSupabase
        .from('users')
        .insert([userPayload])
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

      if (!user) {
        throw new Error('Profil utilisateur introuvable. Veuillez contacter le support.');
      }

      return user;
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      throw error; // Re-throw l'erreur au lieu de retourner null
    }
  }

  // ==================== REAL IMPLEMENTATIONS ====================
  static async createMiniSite(exhibitorId: string, miniSiteData: any): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // CRITICAL FIX: Convertir les données du wizard en sections de mini-site
      const sections = miniSiteData.sections || [];

      // Si pas de sections mais des données brutes, les convertir
      if (sections.length === 0) {
        // Section Hero avec le nom de l'entreprise
        if (miniSiteData.company || miniSiteData.logo) {
          sections.push({
            id: 'hero',
            type: 'hero',
            title: 'Accueil',
            visible: true,
            order: 0,
            content: {
              title: miniSiteData.company || 'Mon Entreprise',
              subtitle: miniSiteData.description?.substring(0, 150) || '',
              backgroundImage: miniSiteData.logo || '',
              ctaText: 'Nous contacter',
              ctaLink: '#contact'
            }
          });
        }

        // Section À propos avec la description
        if (miniSiteData.description) {
          sections.push({
            id: 'about',
            type: 'about',
            title: 'À propos',
            visible: true,
            order: 1,
            content: {
              title: 'Notre expertise',
              description: miniSiteData.description,
              features: []
            }
          });
        }

        // Section Produits
        if (miniSiteData.products && miniSiteData.products.length > 0) {
          const productsList = Array.isArray(miniSiteData.products)
            ? miniSiteData.products.map((p: any, idx: number) => ({
                id: String(idx + 1),
                name: typeof p === 'string' ? p : p.name || 'Produit',
                description: typeof p === 'object' ? p.description || '' : '',
                image: typeof p === 'object' ? p.image || '' : '',
                features: [],
                price: ''
              }))
            : [];

          sections.push({
            id: 'products',
            type: 'products',
            title: 'Produits & Services',
            visible: true,
            order: 2,
            content: {
              title: 'Nos solutions',
              products: productsList
            }
          });
        }

        // Section Contact
        if (miniSiteData.contact || miniSiteData.socials) {
          sections.push({
            id: 'contact',
            type: 'contact',
            title: 'Contact',
            visible: true,
            order: 3,
            content: {
              title: 'Contactez-nous',
              email: miniSiteData.contact?.email || '',
              phone: miniSiteData.contact?.phone || '',
              address: miniSiteData.contact?.address || '',
              website: miniSiteData.contact?.website || '',
              socials: miniSiteData.socials || []
            }
          });
        }
      }

      const { data, error } = await safeSupabase
        .from('mini_sites')
        .insert([{
          exhibitor_id: exhibitorId,
          title: miniSiteData.company || 'Mon Mini-Site',
          description: miniSiteData.description || '',
          logo_url: miniSiteData.logo || '',
          theme: typeof miniSiteData.theme === 'object' ? miniSiteData.theme : { primaryColor: '#1e40af' },
          sections: sections,
          contact_info: miniSiteData.contact || {},
          social_links: { links: miniSiteData.socials || [] },
          is_published: false
        }])
        .select()
        .single();

      if (error) throw error;

      // Marquer que le mini-site a été créé dans le profil utilisateur
      try {
        await safeSupabase
          .from('users')
          .update({ minisite_created: true })
          .eq('id', exhibitorId);
      } catch (updateErr) {
        console.warn('Impossible de marquer minisite_created:', updateErr);
      }

      return data;
    } catch (error) {
      console.error('Erreur création mini-site:', error);
      throw error; // Propager l'erreur pour meilleur debugging
    }
  }

  static async updateEvent(eventId: string, eventData: Partial<Event>): Promise<Event> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const updateData: any = {};

      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.type !== undefined) updateData.event_type = eventData.type;
      if (eventData.startDate !== undefined) updateData.start_time = eventData.startDate.toISOString();
      if (eventData.endDate !== undefined) updateData.end_date = eventData.endDate.toISOString();
      if (eventData.location !== undefined) updateData.location = eventData.location;
      if (eventData.pavilionId !== undefined) updateData.pavilion_id = eventData.pavilionId;
      if (eventData.organizerId !== undefined) updateData.organizer_id = eventData.organizerId;
      if (eventData.capacity !== undefined) updateData.capacity = eventData.capacity;
      if (eventData.featured !== undefined) updateData.is_featured = eventData.featured;
      if (eventData.imageUrl !== undefined) updateData.image_url = eventData.imageUrl;
      if (eventData.registrationUrl !== undefined) updateData.registration_url = eventData.registrationUrl;
      if (eventData.tags !== undefined) updateData.tags = eventData.tags;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await safeSupabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      return this.transformEventDBToEvent(data);
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
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('events')
        .insert([{
          title: eventData.title,
          description: eventData.description,
          type: eventData.type,
          event_date: eventData.startDate.toISOString(),
          start_time: eventData.startDate.toISOString(),
          end_time: eventData.endDate.toISOString(),
          location: eventData.location,
          capacity: eventData.capacity,
          registered: 0,
          featured: eventData.featured,
          tags: eventData.tags || [],
        }])
        .select()
        .single();

      if (error) throw error;

      return this.transformEventDBToEvent(data);
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
      const { data, error } = await safeSupabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;

      return (data || []).map((event: any) => this.transformEventDBToEvent(event));
    } catch (error) {
      // Ignorer les erreurs réseau silencieusement
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur récupération événements:', error);
      }
      return [];
    }
  }

  static async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      // Vérifier si déjà inscrit
      const { data: existing } = await safeSupabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        throw new Error('Vous êtes déjà inscrit à cet événement');
      }

      // Vérifier la capacité de l'événement
      const { data: event, error: eventError } = await safeSupabase
        .from('events')
        .select('capacity, registered')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;

      if (event.capacity && event.registered >= event.capacity) {
        throw new Error('Événement complet');
      }

      // Créer l'inscription
      const { error: insertError } = await safeSupabase
        .from('event_registrations')
        .insert([{
          event_id: eventId,
          user_id: userId,
          status: 'confirmed'
        }]);

      if (insertError) throw insertError;

      // Incrémenter le compteur
      const { error: updateError } = await safeSupabase
        .from('events')
        .update({ registered: (event.registered || 0) + 1 })
        .eq('id', eventId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Erreur inscription événement:', error);
      throw error;
    }
  }

  static async getUserEventRegistrations(userId: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      // Ignorer les erreurs réseau silencieusement
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur récupération inscriptions événements:', error);
      }
      return [];
    }
  }

  static async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');

    const safeSupabase = supabase!;
    try {
      // Vérifier si inscrit
      const { data: existing } = await safeSupabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (!existing) {
        throw new Error('Vous n\'êtes pas inscrit à cet événement');
      }

      // Supprimer l'inscription
      const { error: deleteError } = await safeSupabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Décrémenter le compteur
      const { data: event } = await safeSupabase
        .from('events')
        .select('registered')
        .eq('id', eventId)
        .single();

      if (event && event.registered > 0) {
        await safeSupabase
          .from('events')
          .update({ registered: event.registered - 1 })
          .eq('id', eventId);
      }

      return true;
    } catch (error) {
      console.error('Erreur désinscription événement:', error);
      throw error;
    }
  }

  static async isUserRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
    if (!this.checkSupabaseConnection()) return false;

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      return !!data && !error;
    } catch (error) {
      return false;
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
      // Essayer d'abord avec l'ID fourni directement (pourrait être user_id ou exhibitor_id)
      let { data, error } = await safeSupabase
        .from('mini_sites')
        .select('*')
        .eq('exhibitor_id', exhibitorId)
        .single();

      // Si pas trouvé, l'ID est peut-être l'exhibitor.id, donc chercher le user_id associé
      if (error || !data) {
        console.log('[MiniSite] Pas trouvé par exhibitor_id direct, recherche via exhibitors table...');

        // Chercher l'exhibitor pour obtenir son user_id
        const { data: exhibitor } = await safeSupabase
          .from('exhibitors')
          .select('user_id')
          .eq('id', exhibitorId)
          .single();

        if (exhibitor?.user_id) {
          // Chercher le mini-site avec le user_id de l'exposant
          const result = await safeSupabase
            .from('mini_sites')
            .select('*')
            .eq('exhibitor_id', exhibitor.user_id)
            .single();

          data = result.data;
          error = result.error;
        }
      }

      if (error || !data) {
        console.warn('Mini-site non trouvé:', error?.message || 'Aucune donnée');
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

      // Transformer les noms de colonnes DB → Frontend
      // La table utilise: is_published, view_count, updated_at
      // Le frontend attend: published, views, last_updated
      data.published = data.is_published ?? false;
      data.views = data.view_count ?? 0;
      data.last_updated = data.updated_at || data.created_at;

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
      // D'abord essayer avec l'ID comme exhibitor.id
      let { data, error } = await safeSupabase
        .from('products')
        .select('*')
        .eq('exhibitor_id', exhibitorId);

      // Si pas de produits trouvés, peut-être que c'est un user_id
      // Chercher l'exhibitor pour obtenir son ID
      if ((!data || data.length === 0) && !error) {
        const { data: exhibitor } = await safeSupabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', exhibitorId)
          .single();

        if (exhibitor?.id) {
          const result = await safeSupabase
            .from('products')
            .select('*')
            .eq('exhibitor_id', exhibitor.id);

          data = result.data;
          error = result.error;
        }
      }

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
      // Déterminer le user_id pour chercher le mini-site
      let userId = exhibitorId;

      // Si l'ID passé est l'exhibitor.id, récupérer le user_id
      const { data: exhibitor } = await safeSupabase
        .from('exhibitors')
        .select('user_id')
        .eq('id', exhibitorId)
        .single();

      if (exhibitor?.user_id) {
        userId = exhibitor.user_id;
      }

      // Récupérer le nombre de vues actuel (utilise view_count, pas views)
      const { data: currentData } = await safeSupabase
        .from('mini_sites')
        .select('view_count')
        .eq('exhibitor_id', userId)
        .single();

      if (currentData) {
        // Incrémenter les vues
        await safeSupabase
          .from('mini_sites')
          .update({ view_count: (currentData.view_count || 0) + 1 })
          .eq('exhibitor_id', userId);
      }
    } catch (error) {
      console.error('Erreur incrémentation vues:', error);
    }
  }

  static async getExhibitorForMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // D'abord essayer de trouver par exhibitor.id
      let { data, error } = await safeSupabase
        .from('exhibitors')
        .select('id, company_name, logo_url, description, website, contact_info')
        .eq('id', exhibitorId)
        .single();

      // Si pas trouvé, essayer par user_id (au cas où c'est un user_id qui est passé)
      if (error || !data) {
        const result = await safeSupabase
          .from('exhibitors')
          .select('id, company_name, logo_url, description, website, contact_info')
          .eq('user_id', exhibitorId)
          .single();

        data = result.data;
        error = result.error;
      }

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
          company_name: userData.profile.company,
          partner_type: userData.profile.partnerType || 'institutional',
          sector: userData.profile.sector || 'services',
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
    if (!exhibitorId) {
      console.warn('[TIME_SLOTS] Exhibitor ID is empty');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      console.log(`[TIME_SLOTS] Fetching slots for exhibitor: ${exhibitorId}`);
      const { data, error } = await safeSupabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', exhibitorId)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('[TIME_SLOTS] Supabase error:', {
          code: (error as any)?.code,
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          status: (error as any)?.status
        });
        throw error;
      }

      console.log(`[TIME_SLOTS] Successfully fetched ${data?.length || 0} slots`);
      return data || [];
    } catch (error) {
      console.error('[TIME_SLOTS] Error fetching time slots:', {
        exhibitorId,
        message: (error as any)?.message || String(error),
        details: (error as any)?.details || (error as any)?.hint || null,
        status: (error as any)?.status || 'unknown'
      });
      return [];
    }
  }

  // Compat: some components call getTimeSlotsByUser
  static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]> {
    return this.getTimeSlotsByExhibitor(userId);
  }

  static async createTimeSlot(slotData: Omit<TimeSlot, 'id' | 'currentBookings' | 'available'>): Promise<TimeSlot> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;
    try {
      // Map frontend slotData to DB column names to handle schema differences
      const insertPayload: any = {
        exhibitor_id: (slotData as any).userId || (slotData as any).exhibitorId || null,
        slot_date: (slotData as any).date || (slotData as any).slot_date || null,
        start_time: (slotData as any).startTime || (slotData as any).start_time || null,
        end_time: (slotData as any).endTime || (slotData as any).end_time || null,
        duration: (slotData as any).duration || null,
        type: (slotData as any).type || 'in-person',
        max_bookings: (slotData as any).maxBookings ?? (slotData as any).max_bookings ?? 1,
        current_bookings: (slotData as any).currentBookings ?? (slotData as any).current_bookings ?? 0,
        available: ((slotData as any).currentBookings ?? 0) < ((slotData as any).maxBookings ?? 1),
        location: (slotData as any).location || null,
        description: (slotData as any).description || null
      };

      const { data, error } = await safeSupabase
        .from('time_slots')
        .insert([insertPayload])
        .select()
        .single();

      if (error) throw error;

      // Transform returned DB row into TimeSlot interface expected by frontend
      const created: any = data;
      const transformed: TimeSlot = {
        id: created.id,
        userId: created.exhibitor_id || created.user_id,
        date: created.slot_date ? new Date(created.slot_date) : (created.date ? new Date(created.date) : new Date()),
        startTime: created.start_time || created.startTime,
        endTime: created.end_time || created.endTime,
        duration: created.duration || 0,
        type: created.type || 'in-person',
        maxBookings: created.max_bookings || created.maxBookings || 1,
        currentBookings: created.current_bookings || created.currentBookings || 0,
        available: created.available ?? ((created.current_bookings || 0) < (created.max_bookings || 1)),
        location: created.location
      };

      return transformed;
    } catch (error) {
      try {
        console.error('Erreur lors de la création du créneau horaire:', {
          message: (error as any)?.message || String(error),
          details: (error as any)?.details || (error as any)?.hint || null,
          raw: JSON.stringify(error)
        });
      } catch (e) {
        console.error('Erreur lors de la création du créneau horaire (raw):', error);
      }
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
          exhibitor:exhibitor_id(id, company_name, logo_url),
          visitor:visitor_id(id, name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Ignorer les erreurs réseau silencieusement
      if (error instanceof Error && !error.message.includes('Failed to fetch')) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
      }
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
          exhibitor:exhibitor_id(id, company_name, logo_url),
          visitor:visitor_id(id, name, email)
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
    
    // Prepare data matching the actual database schema
    const dbData = {
      company_name: partnerData.organizationName || partnerData.name, // Reverted to company_name
      // name: partnerData.organizationName || partnerData.name,
      partner_type: partnerData.partnerType || partnerData.type || 'silver', // Changed to partner_type
      // type: partnerData.partnerType || partnerData.type || 'silver',
      // category: partnerData.sector || 'General', // Commented out to debug schema cache error
      sector: partnerData.sector,
      description: partnerData.description || '',
      website: partnerData.website,
      logo_url: partnerData.logo,
      // country: partnerData.country || 'Maroc', // Commented out to debug schema cache error
      verified: partnerData.verified || false,
      featured: partnerData.featured || false,
      partnership_level: partnerData.sponsorshipLevel || 'Silver', // Changed to partnership_level
      // sponsorship_level: partnerData.sponsorshipLevel || 'Silver',
      // contributions: partnerData.contributions || [], // Commented out to debug schema cache error
      // Note: user_id, contract_value, contact_info are not in the current schema
      // and are omitted to prevent insert errors
    };

    const { data, error } = await (safeSupabase as any)
      .from('partners')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Supabase createPartner error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }

    // Mapper les données de la DB au format Partner
    return {
      id: data.id,
      userId: data.user_id,
      organizationName: data.company_name,
      name: data.company_name,
      partnerType: data.partner_type,
      type: data.partner_type,
      sector: data.sector,
      description: data.description,
      website: data.website,
      sponsorshipLevel: data.partnership_level,
      contributions: data.benefits || [],
      logo: data.logo_url,
      verified: data.verified || false,
      featured: data.featured || false,
      // Contact info is lost in DB but we return what we can
      contactName: partnerData.contactName,
      contactEmail: partnerData.contactEmail,
      contactPhone: partnerData.contactPhone,
      contactPosition: partnerData.contactPosition
    } as Partner;
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
    firstName: string;
    lastName: string;
    companyName?: string;
    position?: string;
    phone: string;
    profileData?: any;
  }, recaptchaToken?: string): Promise<any> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    // Vérifier reCAPTCHA si token fourni
    if (recaptchaToken) {
      const recaptchaValid = await this.verifyRecaptcha(recaptchaToken, 'contact_form');
      if (!recaptchaValid) {
        throw new Error('Échec de la vérification reCAPTCHA. Veuillez réessayer.');
      }
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('registration_requests')
        .insert([{
          user_type: requestData.userType,
          email: requestData.email,
          first_name: requestData.firstName,
          last_name: requestData.lastName,
          company_name: requestData.companyName,
          position: requestData.position,
          phone: requestData.phone,
          status: 'pending',
          profile_data: requestData.profileData || {},
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

  // ==================== reCAPTCHA VERIFICATION ====================
  /**
   * Vérifie un token reCAPTCHA via l'edge function Supabase
   *
   * @param token - Token reCAPTCHA obtenu côté client
   * @param action - Action attendue (ex: 'visitor_registration')
   * @param minimumScore - Score minimum accepté (0.0 - 1.0, défaut 0.5)
   * @returns {Promise<boolean>} true si valide, false sinon
   */
  private static async verifyRecaptcha(
    token: string,
    action?: string,
    minimumScore: number = 0.5
  ): Promise<boolean> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non connecté, reCAPTCHA ignoré');
      return true; // Permettre si Supabase non connecté
    }

    const safeSupabase = supabase!;
    try {
      const { data, error } = await safeSupabase.functions.invoke('verify-recaptcha', {
        body: { token, action, minimumScore },
      });

      if (error) {
        console.warn('⚠️ Erreur vérification reCAPTCHA (Edge Function indisponible):', error.message);
        // En mode développement ou si l'Edge Function n'est pas déployée, permettre quand même
        return true;
      }

      return data?.success === true;
    } catch (error) {
      console.warn('⚠️ Exception vérification reCAPTCHA (service indisponible):', error);
      // Permettre l'inscription même si le service reCAPTCHA n'est pas disponible
      return true;
    }
  }

  // ==================== NETWORKING EXTENSIONS ====================

  /**
   * Create a new connection between users
   */
  static async createConnection(addresseeId: string, message?: string): Promise<any> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await safeSupabase
        .from('connections')
        .insert([{
          requester_id: user.id,
          addressee_id: addresseeId,
          status: 'pending',
          message: message || null
        }])
        .select()
        .single();

      if (error) throw error;

      // Create notification for addressee
      // Note: createNotification prend (userId, message, type) - 3 params seulement
      await this.createNotification(
        addresseeId,
        `${user.email} souhaite se connecter avec vous`,
        'connection'
      );

      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la connexion:', error);
      throw error;
    }
  }

  /**
   * Get all connections for a user (accepted connections only)
   */
  static async getUserConnections(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Avoid complex nested selects which can fail if relationships are not configured.
      // Instead fetch connections, then fetch related users and merge locally.
      const { data, error } = await safeSupabase
        .from('connections')
        .select('id, requester_id, addressee_id, status, created_at')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];

      const userIds = Array.from(new Set(rows.flatMap((r: any) => [r.requester_id, r.addressee_id]).filter(Boolean)));
      if (userIds.length === 0) return [];

      const { data: usersData, error: usersError } = await safeSupabase
        .from('users')
        .select('id, name, email, type, profile')
        .in('id', userIds);

      if (usersError) throw usersError;

      const usersMap: Record<string, any> = (usersData || []).reduce((acc: any, u: any) => {
        acc[u.id] = this.transformUserDBToUser(u);
        return acc;
      }, {});

      return rows.map((r: any) => ({
        ...r,
        requester: usersMap[r.requester_id] || null,
        addressee: usersMap[r.addressee_id] || null
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des connexions:', error);
      return [];
    }
  }

  /**
   * Add entity to user favorites
   */
  static async addFavorite(entityType: string, entityId: string): Promise<any> {
    if (!this.checkSupabaseConnection()) throw new Error('Supabase not connected');
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await safeSupabase
        .from('user_favorites')
        .insert([{
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId
        }])
        .select()
        .single();

      if (error) {
        // If already exists, ignore (unique constraint violation)
        if (error.code === '23505') {
          return { message: 'Already in favorites' };
        }
        throw error;
      }

      // Create activity log
      await this.createActivityLog(
        user.id,
        user.id,
        'favorite_add',
        `Ajouté ${entityType} aux favoris`,
        entityType,
        entityId
      );

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  }

  /**
   * Remove entity from user favorites
   */
  static async removeFavorite(entityType: string, entityId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await safeSupabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (error) throw error;

      // Create activity log
      await this.createActivityLog(
        user.id,
        user.id,
        'favorite_remove',
        `Retiré ${entityType} des favoris`,
        entityType,
        entityId
      );
    } catch (error) {
      console.error('Erreur lors de la suppression du favori:', error);
      throw error;
    }
  }

  /**
   * Get user's favorites
   */
  static async getUserFavorites(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      const { data, error } = await safeSupabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      // Log structured error for debugging
      this.logSupabaseError('getUserFavorites', error);

      // If the server returned 404 (table missing), return empty gracefully
      try {
        const status = (error && (error.status || error.code)) || null;
        if (status === 404 || status === '404') {
          console.warn('Table user_favorites non trouvée — retour d\'un tableau vide.');
          return [];
        }
      } catch (e) {
        // ignore
      }

      return [];
    }
  }

  /**
   * Get pending connection requests for user
   */
  static async getPendingConnections(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Simplified fetch: get pending connection rows then enrich with requester profiles
      const { data, error } = await safeSupabase
        .from('connections')
        .select('id, requester_id, addressee_id, status, created_at, message')
        .eq('addressee_id', targetUserId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];
      const requesterIds = Array.from(new Set(rows.map((r: any) => r.requester_id).filter(Boolean)));
      if (requesterIds.length === 0) return rows;

      const { data: usersData, error: usersError } = await safeSupabase
        .from('users')
        .select('id, name, email, type, profile')
        .in('id', requesterIds);

      if (usersError) throw usersError;

      const usersMap: Record<string, any> = (usersData || []).reduce((acc: any, u: any) => {
        acc[u.id] = this.transformUserDBToUser(u);
        return acc;
      }, {});

      return rows.map((r: any) => ({
        ...r,
        requester: usersMap[r.requester_id] || null
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes en attente:', error);
      return [];
    }
  }

  /**
   * Get daily quotas for user (connections, appointments, etc.)
   */
  static async getDailyQuotas(userId?: string): Promise<any> {
    if (!this.checkSupabaseConnection()) return null;
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return null;

      // Get user to check their level/tier
      const { data: userData, error: userError } = await safeSupabase
        .from('users')
        .select('type, visitor_level, partner_tier')
        .eq('id', targetUserId)
        .single();

      if (userError) throw userError;

      // Get today's start time
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get quota usage for today
      const { data: quotaData, error: quotaError } = await safeSupabase
        .from('quota_usage')
        .select('*')
        .eq('user_id', targetUserId)
        .gte('created_at', today.toISOString());

      if (quotaError) throw quotaError;

      // Calculate limits based on user level
      let limits = {
        connections_per_day: 10,
        appointments: 5,
        favorites: 20
      };

      if (userData.type === 'visitor') {
        switch (userData.visitor_level) {
          case 'free':
            limits = { connections_per_day: 10, appointments: 5, favorites: 20 };
            break;
          case 'premium':
            limits = { connections_per_day: 30, appointments: 15, favorites: 50 };
            break;
          case 'vip':
            limits = { connections_per_day: 9999, appointments: 9999, favorites: 9999 };
            break;
        }
      }

      // FIXED: Essayer d'abord avec la nouvelle table daily_quotas
      const { data: dailyQuota, error: dailyError } = await safeSupabase
        .from('daily_quotas')
        .select('connections_used, messages_used, meetings_used')
        .eq('user_id', targetUserId)
        .eq('quota_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (dailyQuota && !dailyError) {
        // FIXED: Retourner le format attendu par networkingStore
        return {
          connections: dailyQuota.connections_used || 0,
          messages: dailyQuota.messages_used || 0,
          meetings: dailyQuota.meetings_used || 0,
          // Données étendues pour d'autres usages
          limits,
          usage: {
            connections_today: dailyQuota.connections_used || 0,
            messages_today: dailyQuota.messages_used || 0,
            meetings_today: dailyQuota.meetings_used || 0
          },
          remaining: {
            connections: Math.max(0, limits.connections_per_day - (dailyQuota.connections_used || 0)),
            messages: Math.max(0, 50 - (dailyQuota.messages_used || 0)),
            meetings: Math.max(0, limits.appointments - (dailyQuota.meetings_used || 0))
          }
        };
      }

      // Fallback: Utiliser quota_usage si daily_quotas n'existe pas
      const usage = {
        connections_today: quotaData?.filter(q => q.quota_type === 'connections').length || 0,
        appointments_total: quotaData?.filter(q => q.quota_type === 'appointments').length || 0,
        favorites_total: quotaData?.filter(q => q.quota_type === 'favorites').length || 0
      };

      // FIXED: Format compatible avec networkingStore
      return {
        connections: usage.connections_today,
        messages: 0, // pas de tracking messages dans quota_usage
        meetings: usage.appointments_total,
        limits,
        usage,
        remaining: {
          connections: Math.max(0, limits.connections_per_day - usage.connections_today),
          appointments: Math.max(0, limits.appointments - usage.appointments_total),
          favorites: Math.max(0, limits.favorites - usage.favorites_total)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des quotas:', error);
      // FIXED: Retourner des valeurs par défaut au lieu de null
      return { connections: 0, messages: 0, meetings: 0 };
    }
  }

  /**
   * Helper: Create activity log entry
   */
  private static async createActivityLog(
    userId: string,
    actorId: string,
    type: string,
    description: string,
    entityType?: string,
    entityId?: string,
    metadata?: any
  ): Promise<void> {
    if (!this.checkSupabaseConnection()) return;
    const safeSupabase = supabase!;

    try {
      await safeSupabase
        .from('activities')
        .insert([{
          user_id: userId,
          actor_id: actorId,
          type,
          description,
          entity_type: entityType || null,
          entity_id: entityId || null,
          metadata: metadata || {}
        }]);
    } catch (error) {
      console.error('Erreur lors de la création du log d\'activité:', error);
      // Don't throw - activity logging is not critical
    }
  }

  // Helper: structured logging for Supabase errors
  static logSupabaseError(context: string, error: any) {
    try {
      const structured = {
        context,
        message: error?.message || String(error),
        code: error?.code || error?.status || null,
        details: error?.details || error?.hint || null,
        status: error?.status || null,
        raw: error
      };
      // Log to console (could be extended to remote logging)
      console.warn('Supabase Error:', structured);
    } catch (e) {
      console.warn('Supabase Error Logger failed', e);
    }
  }

}

