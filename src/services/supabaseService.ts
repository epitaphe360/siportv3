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

interface PartnerDB {
  id: string;
  company_name: string;
  partner_type: string;
  sector?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  featured: boolean;
  partnership_level?: string;
  benefits?: string[];
  contact_info?: { country?: string };
  created_at: string;
}

interface PartnerUI {
  id: string;
  name: string;
  partner_tier: string;
  category: string;
  sector?: string;
  description: string;
  logo?: string;
  website?: string;
  country: string;
  verified: boolean;
  featured: boolean;
  contributions: string[];
  projects?: PartnerProject[];
  enrichedData?: Record<string, unknown>;
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

interface RegistrationRequest {
  id: string;
  user_id: string;
  request_type: 'exhibitor' | 'partner';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface PartnerProject {
  id: string;
  partner_id?: string;
  user_id?: string;
  name: string;
  description: string;
  timeline?: Array<{ date: string; milestone: string }>;
  sectors?: string[];
  status?: string;
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

interface Recommendation {
  id: string;
  item_type: string;
  similarity_score: number;
}

interface ErrorInfo {
  message: string;
  details: string | null;
}

interface MiniSiteFieldData {
  theme?: string;
  custom_colors?: Record<string, string>;
  sections?: MiniSiteSection[];
  published?: boolean;
  views?: number;
  last_updated?: string;
}

interface EventDB {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  type?: string;
  capacity?: number;
  created_at: string;
}

interface ChatConversationDB {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_at?: string;
  created_at: string;
  messages?: ChatMessageDB[];
}

interface ChatMessageDB {
  id: string;
  conversation_id?: string;
  sender_id?: string;
  sender?: { id: string; name?: string };
  receiver_id?: string;
  text?: string;
  content?: string;
  message_type?: string;
  created_at: string;
  read?: boolean;
  read_at?: string | null;
}

interface UserSignupData {
  type: 'visitor' | 'partner' | 'exhibitor' | 'admin' | 'security';
  name?: string;
  email?: string;
  profile?: UserProfile;
  [key: string]: unknown;
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
      // Optimized: Select only necessary columns instead of *
      const { data: usersData, error: userError } = await safeSupabase
        .from('users')
        .select('id, email, name, type, profile, status, created_at')
        .eq('email', email)
        .range(0, 0);

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
      let projects: PartnerProject[] = [];
      if (userData.type === 'partner') {
        try {
          // On essaie de récupérer par user_id (nouvelle structure)
          // Optimized: Select only necessary columns
          const { data: projectsData, error: projectsError } = await safeSupabase
            .from('partner_projects')
            .select('id, user_id, partner_id, name, description, sectors, status, created_at')
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
              // Optimized: Select only necessary columns
              const { data: fallbackProjects } = await safeSupabase
                .from('partner_projects')
                .select('id, user_id, partner_id, name, description, sectors, status, created_at')
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
      // ✅ Étape 1: Vérifier que l'utilisateur existe et que nous avons les droits d'accès
      console.log('🔍 Vérification de l\'utilisateur avant mise à jour:', userId);
      const { data: existingUser, error: checkError } = await safeSupabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (checkError) {
        console.error(`❌ Erreur vérification utilisateur ${userId}:`, checkError);
        throw new Error(`Utilisateur ${userId} non trouvé ou pas d'accès (RLS): ${checkError.message}`);
      }

      if (!existingUser) {
        throw new Error(`Utilisateur ${userId} n'existe pas en base de données`);
      }

      // ✅ Étape 2: Construire les données à mettre à jour
      const updateData: Record<string, any> = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.type !== undefined) updateData.type = userData.type;
      if (userData.status !== undefined) updateData.status = userData.status;
      if (userData.profile !== undefined) updateData.profile = userData.profile;

      updateData.updated_at = new Date().toISOString();

      // ✅ Étape 3: Effectuer la mise à jour avec gestion appropriée des résultats
      console.log('📝 Mise à jour utilisateur:', userId, Object.keys(updateData));
      const { data, error } = await safeSupabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select('*');

      if (error) {
        console.error(`❌ Erreur lors de la mise à jour ${userId}:`, error);
        throw new Error(`Erreur mise à jour: ${error.message}`);
      }

      // ✅ Vérifier que nous avons au moins un résultat
      if (!data || data.length === 0) {
        console.error(`❌ PGRST116: Aucune ligne retournée après la mise à jour de ${userId}`);
        throw new Error(`Pas de données retournées après mise à jour de ${userId}. Vérifiez les permissions RLS.`);
      }

      const updatedData = Array.isArray(data) ? data[0] : data;
      console.log('✅ Utilisateur mis à jour avec succès:', userId);
      return this.transformUserDBToUser(updatedData);
    } catch (error) {
      console.error(`❌ Erreur mise à jour utilisateur ${userId}:`, error);
      throw error;
    }
  }

  static async createSimpleRegistrationRequest(userId: string, requestType: 'exhibitor' | 'partner'): Promise<RegistrationRequest | null> {
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
      // Use exhibitor_profiles as the source of truth
      const { data: profiles, error: profilesError } = await safeSupabase
        .from('exhibitor_profiles')
        .select(`
          id,
          user_id,
          company_name,
          category,
          sector,
          description,
          logo_url,
          website,
          email,
          phone,
          stand_number
        `);

      if (profilesError) {
          // If exhibitor_profiles invalid, fallback to old exhibitors table logic if needed, 
          // but for now let's assume profiles is the way foward.
          // Or check if error is "relation does not exist" -> then fallback.
          console.warn('Erreur exhibitor_profiles, essai fallback exhibitors:', profilesError.message);
          throw profilesError; 
      }
      
      return (profiles || []).map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        companyName: p.company_name || 'Sans nom',
        category: (p.category as any) || 'startup',
        sector: p.sector || 'General',
        description: p.description || '',
        logo: p.logo_url,
        website: p.website,
        verified: false, 
        featured: false,
        contactInfo: {
            email: p.email || '',
            phone: p.phone || '',
            address: '',
            city: '',
            country: 'France' // Default
        },
        products: [], // Profiles don't have products directly joined yet in this query
        availability: [],
        miniSite: null,
        certifications: [],
        markets: [],
        standNumber: p.stand_number
      }));

    } catch (error) {
       // Fallback to original implementation if table not found (for safety)
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
              contact_info
            `);
    
          if (exhibitorsError) throw exhibitorsError;
    
          return (exhibitorsData || []).map(this.transformExhibitorDBToExhibitor);
       } catch (e) {
          console.error('Erreur lors de la récupération des exposants (toutes tables):', e);
          return [];
       }
    }
  }

  // ==================== PARTNERS ====================
  static async getPartners(): Promise<PartnerUI[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré - aucun partenaire disponible');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      // FIX: Use correct column names matching the partners table schema (from createMissingTables.ts)
      const { data, error } = await safeSupabase
        .from('partners')
        .select(
          `id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, benefits, contact_info, created_at`
        )
        .order('partner_type');

      if (error) throw error;

      return (data || []).map((partner: PartnerDB) => ({
        id: partner.id,
        name: partner.company_name,
        partner_tier: partner.partnership_level || partner.partner_type,
        category: partner.partner_type,
        sector: partner.sector,
        description: partner.description || '',
        logo: partner.logo_url,
        website: partner.website,
        country: partner.contact_info?.country || '',
        verified: partner.verified,
        featured: partner.featured,
        contributions: partner.benefits || [],
        establishedYear: 2024, // Default as column missing
        employees: '1-10', // Default as column missing
        createdAt: new Date(partner.created_at),
        updatedAt: new Date(partner.created_at)
      }));
    } catch (error) {
      // Log détaillé pour faciliter le debug (message, details, hint si disponibles)
      try {
        const errorInfo = error as ErrorInfo & { hint?: string };
        console.error('Erreur lors de la récupération des partenaires:', {
          message: errorInfo?.message || String(error),
          details: errorInfo?.details || errorInfo?.hint || null,
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
      // Récupérer toutes les données enrichies depuis la base de données
      const { data, error } = await safeSupabase
        .from('partners')
        .select(
          `id, company_name, partner_type, sector, description, logo_url, website, verified, featured, partnership_level, benefits, contact_info, created_at,
           mission, vision, values_list, certifications, awards, social_media, key_figures, testimonials, news, expertise, clients, video_url, gallery, established_year, employees, country,
           projects:partner_projects(*)`
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Transformer les projets de la DB vers le format UI
      const dbProjects = (data.projects || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.start_date ? new Date(p.start_date as string) : new Date(),
        endDate: p.end_date ? new Date(p.end_date as string) : undefined,
        budget: p.budget,
        impact: p.impact,
        image: p.image_url,
        technologies: (p.technologies as string[]) || [],
        team: (p.team as unknown[]) || [],
        kpis: (p.kpis as Record<string, unknown>) || { progress: 0, satisfaction: 0, roi: 0 },
        timeline: ((p.timeline as unknown[]) || []).map((t: unknown) => {
          const timelineItem = t as Record<string, unknown>;
          return {
            ...timelineItem,
            date: timelineItem.date ? new Date(timelineItem.date as string) : new Date()
          };
        }),
        partners: (p.project_partners as unknown[]) || [],
        documents: (p.documents as unknown[]) || [],
        gallery: (p.gallery as unknown[]) || []
      }));

      // Utiliser les données de la base de données, avec fallback sur les données générées
      const fallbackData = this.getEnrichedPartnerData(data.id, data.company_name, data.sector);
      
      // Vérifier si les données enrichies existent dans la base
      const hasDbEnrichedData = data.mission || data.vision || (data.values_list && data.values_list.length > 0);

      return {
        id: data.id,
        name: data.company_name,
        type: data.partner_type || 'gold',
        sponsorshipLevel: data.partnership_level || data.partner_type,
        category: data.partner_type,
        sector: data.sector || 'Maritime',
        description: data.description || '',
        longDescription: data.description || fallbackData.longDescription,
        logo: data.logo_url,
        website: data.website,
        country: data.country || data.contact_info?.country || 'Maroc',
        verified: data.verified ?? true,
        featured: data.featured ?? false,
        contributions: data.benefits || [
          "Sponsoring Session Plénière",
          "Espace Networking Premium",
          "Visibilité Logo Multi-supports"
        ],
        establishedYear: data.established_year || data.contact_info?.establishedYear || 2010,
        employees: data.employees || data.contact_info?.employees || '500-1000',
        projects: dbProjects.length > 0 ? dbProjects : this.getMockProjects(data.id, data.company_name),
        // Données enrichies depuis la base de données (avec fallback)
        mission: data.mission || fallbackData.mission,
        vision: data.vision || fallbackData.vision,
        values: data.values_list || fallbackData.values,
        certifications: data.certifications || fallbackData.certifications,
        awards: data.awards || fallbackData.awards,
        socialMedia: data.social_media || fallbackData.socialMedia,
        keyFigures: data.key_figures || fallbackData.keyFigures,
        testimonials: data.testimonials || fallbackData.testimonials,
        news: data.news || fallbackData.news,
        expertise: data.expertise || fallbackData.expertise,
        clients: data.clients || fallbackData.clients,
        videoUrl: data.video_url || fallbackData.videoUrl,
        gallery: data.gallery || fallbackData.gallery,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du partenaire:', error);
      return null;
    }
  }

  /**
   * Génère des données enrichies pour la page partenaire
   */
  private static getEnrichedPartnerData(partnerId: string, partnerName: string, sector?: string): Record<string, unknown> {
    return {
      longDescription: `${partnerName} est un acteur majeur du secteur ${sector || 'maritime'} avec plus de 15 ans d'expérience dans l'accompagnement des transformations digitales et durables. Notre engagement envers l'innovation et l'excellence nous a permis de développer des solutions de pointe pour les ports et terminaux à travers le monde. En partenariat avec SIPORTS 2026, nous contribuons activement à façonner l'avenir du secteur portuaire africain.`,
      mission: "Transformer le secteur portuaire africain par l'innovation technologique et le développement durable, tout en créant de la valeur pour nos partenaires et les communautés locales.",
      vision: "Devenir le partenaire de référence pour la modernisation des infrastructures portuaires en Afrique d'ici 2030, en plaçant l'humain et l'environnement au cœur de chaque projet.",
      values: [
        "Innovation continue",
        "Excellence opérationnelle", 
        "Développement durable",
        "Partenariat de confiance",
        "Responsabilité sociale"
      ],
      certifications: [
        "ISO 9001:2015 - Management de la Qualité",
        "ISO 14001:2015 - Management Environnemental",
        "ISO 45001:2018 - Santé et Sécurité au Travail",
        "ISPS Code - Sûreté Maritime"
      ],
      awards: [
        { name: "Prix de l'Innovation Portuaire", year: 2024, issuer: "African Ports Association" },
        { name: "Excellence en Développement Durable", year: 2023, issuer: "Green Port Initiative" },
        { name: "Meilleur Partenaire Technologique", year: 2023, issuer: "SIPORTS Awards" }
      ],
      socialMedia: {
        linkedin: "https://linkedin.com/company/" + partnerName.toLowerCase().replace(/\s+/g, '-'),
        twitter: "https://twitter.com/" + partnerName.toLowerCase().replace(/\s+/g, ''),
        facebook: "https://facebook.com/" + partnerName.toLowerCase().replace(/\s+/g, ''),
        youtube: "https://youtube.com/@" + partnerName.toLowerCase().replace(/\s+/g, '')
      },
      keyFigures: [
        { label: "Chiffre d'affaires", value: "45M €", icon: "TrendingUp" },
        { label: "Projets réalisés", value: "120+", icon: "Target" },
        { label: "Pays d'intervention", value: "15", icon: "Globe" },
        { label: "Clients satisfaits", value: "98%", icon: "ThumbsUp" }
      ],
      testimonials: [
        {
          quote: "Une collaboration exceptionnelle qui a transformé notre approche de la gestion portuaire. Leur expertise et leur engagement sont remarquables.",
          author: "Dr. Fatima El Amrani",
          role: "Directrice Générale, Port de Tanger Med",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg"
        },
        {
          quote: "Leur capacité à innover tout en respectant les normes environnementales les plus strictes est impressionnante. Un partenaire de confiance.",
          author: "Ahmed Benkirane",
          role: "CEO, Marsa Maroc",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg"
        }
      ],
      news: [
        {
          title: "Nouveau partenariat stratégique avec le Port de Casablanca",
          date: new Date('2024-12-15'),
          excerpt: "Signature d'un accord majeur pour la digitalisation complète des opérations portuaires.",
          image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400"
        },
        {
          title: "Lancement de notre solution IoT pour les terminaux",
          date: new Date('2024-11-20'),
          excerpt: "Notre nouvelle plateforme Smart Terminal permet une gestion en temps réel des opérations.",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"
        },
        {
          title: "Prix de l'Innovation à SIPORTS 2024",
          date: new Date('2024-10-05'),
          excerpt: "Reconnaissance de notre engagement pour l'innovation dans le secteur maritime.",
          image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400"
        }
      ],
      expertise: [
        "Digitalisation portuaire",
        "Intelligence artificielle",
        "Internet des objets (IoT)",
        "Développement durable",
        "Gestion de la chaîne logistique",
        "Sécurité maritime",
        "Formation & Accompagnement"
      ],
      clients: [
        "Port de Casablanca",
        "Tanger Med",
        "Marsa Maroc",
        "Port de Djibouti",
        "Port de Dakar",
        "SOMAPORT"
      ],
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder
      gallery: [
        "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=800",
        "https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=800"
      ]
    };
  }

  /**
   * Génère des projets fictifs pour les partenaires (Quick Fix pour UI)
   */
  private static getMockProjects(partnerId: string, partnerName: string): PartnerProject[] {
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

      return (data || []).map((rec: Recommendation) => ({
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
  private static transformUserDBToUser(userDB: UserDB | null): User | null {
    if (!userDB) return null;
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
    const miniSiteArray = exhibitorDB.mini_site as unknown;
    const miniSiteData = Array.isArray(miniSiteArray) && miniSiteArray.length > 0 ? (miniSiteArray[0] as MiniSiteFieldData) : (miniSiteArray as MiniSiteFieldData);

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

  private static transformEventDBToEvent(eventDB: EventDB): Event {
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
      endDate.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0);
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
  static async signUp(email: string, password: string, userData: UserSignupData, recaptchaToken?: string): Promise<User | null> {
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
      console.log('📝 Tentative de création utilisateur:', { email, type: userData.type });
      
      const { data: authData, error: authError } = await safeSupabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Désactiver l'email de confirmation
          data: {
            name: userData.name,
            type: userData.type
          }
        }
      });

      console.log('📝 Réponse signUp:', { 
        user: authData?.user?.id, 
        email: authData?.user?.email,
        confirmed: authData?.user?.email_confirmed_at,
        session: !!authData?.session,
        error: authError 
      });

      if (authError) {
        console.error('❌ Erreur Auth:', authError);
        throw authError;
      }
      if (!authData.user) {
        console.error('❌ Aucun utilisateur retourné par Auth');
        return null;
      }
      
      // ⚠️ Vérifier si l'email n'est pas confirmé
      if (!authData.user.email_confirmed_at) {
        console.warn('⚠️ Email non confirmé! Session:', authData.session ? 'OUI' : 'NON');
      }


      // 2. Créer le profil utilisateur
      const userPayload: UserDB = {
        id: authData.user.id,
        email,
        name: userData.name,
        type: userData.type,
        status: userData.status || 'pending', // ✅ Inclure le status (pending_payment pour partners/exhibitors)
        profile: userData.profile
      };

      // ✅ Définir le niveau visiteur par défaut à 'free' pour les visiteurs
      if (userData.type === 'visitor') {
        userPayload.visitor_level = 'free';
        // Les visiteurs gratuits sont actifs immédiatement
        if (!userData.status) {
          userPayload.status = 'active';
        }
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
      // Session handling via Supabase auth persistence (sufficient for most use cases)
      if (options?.rememberMe === false) {
        // Future: Could implement sessionStorage for temporary sessions if needed
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
  static async createMiniSite(exhibitorId: string, miniSiteData: MiniSiteData): Promise<MiniSiteDB | null> {
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
            ? miniSiteData.products.map((p: unknown, idx: number) => {
                const product = p as Record<string, unknown>;
                return {
                  id: String(idx + 1),
                  name: typeof p === 'string' ? p : (product.name as string) || 'Produit',
                  description: typeof p === 'object' ? (product.description as string) || '' : '',
                  image: typeof p === 'object' ? (product.image as string) || '' : '',
                  features: [],
                  price: ''
                };
              })
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
      const updateData: Record<string, unknown> = {};

      if (eventData.title !== undefined) updateData.title = eventData.title;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.type !== undefined) updateData.event_type = eventData.type;
      if (eventData.startDate !== undefined) updateData.start_date = eventData.startDate.toISOString();
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

    // Validation des dates
    if (!eventData.startDate || !eventData.endDate) {
      throw new Error('Les dates de début et de fin sont obligatoires');
    }

    if (!(eventData.startDate instanceof Date) || isNaN(eventData.startDate.getTime())) {
      throw new Error('La date de début est invalide');
    }

    if (!(eventData.endDate instanceof Date) || isNaN(eventData.endDate.getTime())) {
      throw new Error('La date de fin est invalide');
    }

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

      return (data || []).map((event: EventDB) => this.transformEventDBToEvent(event));
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
        .maybeSingle();

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
        .maybeSingle();

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

      return (data || []).map((conv: ChatConversationDB) => {
        const lastMessage = conv.messages?.[0];

        // ✅ Compter les messages non lus pour cet utilisateur
        const unreadCount = (conv.messages || []).filter((msg: ChatMessageDB) =>
          msg.sender_id !== userId && !msg.read
        ).length;

        // FIX N+1: Transform and include all messages in the conversation
        const messages = (conv.messages || []).map((msg: ChatMessageDB) => ({
          id: msg.id,
          senderId: msg.sender?.id || msg.sender_id || '',
          receiverId: msg.receiver_id || '',
          content: msg.content || msg.text || '',
          type: (msg.message_type || 'text') as 'text' | 'file' | 'system',
          timestamp: new Date(msg.created_at),
          read: msg.read_at !== null
        }));

        return {
          id: conv.id,
          participants: conv.participants,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            senderId: lastMessage.sender?.id || lastMessage.sender_id || '',
            receiverId: conv.participants.find((id: string) => id !== lastMessage.sender?.id) || '',
            content: lastMessage.content || lastMessage.text || '',
            type: (lastMessage.message_type || 'text') as 'text' | 'file' | 'system',
            timestamp: new Date(lastMessage.created_at),
            read: lastMessage.read_at !== null
          } : undefined,
          unreadCount, // ✅ Maintenant implémenté !
          messages, // FIX N+1: Return messages to avoid separate queries
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
      
      return (data || []).map((msg: Record<string, unknown>) => ({
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
        .maybeSingle();

      // Si pas trouvé, l'ID est peut-être l'exhibitor.id, donc chercher le user_id associé
      if (!data) {
        console.log('[MiniSite] Pas trouvé par exhibitor_id direct, recherche via exhibitors table...');

        // Chercher l'exhibitor pour obtenir son user_id
        const { data: exhibitor } = await safeSupabase
          .from('exhibitors')
          .select('user_id')
          .eq('id', exhibitorId)
          .maybeSingle();

        if (exhibitor?.user_id) {
          // Chercher le mini-site avec le user_id de l'exposant
          const result = await safeSupabase
            .from('mini_sites')
            .select('*')
            .eq('exhibitor_id', exhibitor.user_id)
            .maybeSingle();

          data = result.data;
          error = result.error;
        }
      }

      if (error || !data) {
        if (error) {
          console.warn('[MiniSite] Erreur:', error.message);
        }
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
      // Essayer d'abord avec exhibitor_id direct
      const { data: productsData, error: productsError } = await safeSupabase
        .from('products')
        .select('*')
        .eq('exhibitor_id', exhibitorId);

      if (productsError) throw productsError;
      
      // Si on trouve des produits, les retourner
      if (productsData && productsData.length > 0) {
        return productsData.map((p: ProductDB) => ({
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
      }

      // Sinon, chercher l'exhibitor_id à partir du user_id
      const { data: exhibitorData, error: exhibitorError } = await safeSupabase
        .from('exhibitors')
        .select('id')
        .eq('user_id', exhibitorId)
        .single();

      if (exhibitorError || !exhibitorData) {
        return [];
      }

      // Récupérer les produits avec l'exhibitor_id trouvé
      const { data: productsByExhibitor, error: productsByExhibitorError } = await safeSupabase
        .from('products')
        .select('*')
        .eq('exhibitor_id', exhibitorData.id);

      if (productsByExhibitorError) throw productsByExhibitorError;
      if (productsByExhibitorError) throw productsByExhibitorError;
      
      return (productsByExhibitor || []).map((p: ProductDB) => ({
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
      // ⚡ FIX N+1: Utiliser RPC pour incrémentation atomique (3 queries → 1 RPC)
      const { data, error } = await safeSupabase.rpc('increment_minisite_views', {
        p_exhibitor_id: exhibitorId
      });

      if (error) {
        throw error;
      }

      if (data && !data.success) {
        console.warn('Incrémentation vues mini-site échouée:', data.error);
      }
    } catch (error: any) {
      // Fallback si la fonction RPC n'existe pas encore (migration non appliquée)
      if (error?.message?.includes('function increment_minisite_views') ||
          error?.code === '42883' || // function does not exist
          error?.code === 'PGRST202') { // function not found

        console.warn('⚠️ RPC increment_minisite_views non disponible, utilisation fallback');

        // Méthode traditionnelle (2 queries)
        let userId = exhibitorId;

        const { data: exhibitor } = await safeSupabase
          .from('exhibitors')
          .select('user_id')
          .eq('id', exhibitorId)
          .maybeSingle();

        if (exhibitor?.user_id) {
          userId = exhibitor.user_id;
        }

        const { data: miniSite } = await safeSupabase
          .from('mini_sites')
          .select('id, view_count')
          .eq('exhibitor_id', userId)
          .maybeSingle();

        if (miniSite) {
          await safeSupabase
            .from('mini_sites')
            .update({
              view_count: (miniSite.view_count || 0) + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', miniSite.id);
        }
      } else {
        console.error('Erreur incrémentation vues:', error);
      }
    }
  }

  static async getPublishedMiniSites(): Promise<{ data: any[] | null; error: any }> {
    if (!this.checkSupabaseConnection()) return { data: null, error: 'Supabase non connecté' };

    const safeSupabase = supabase!;
    try {
      // Récupérer tous les mini-sites publiés avec les infos des exposants
      const { data: minisites, error: minisitesError } = await safeSupabase
        .from('mini_sites')
        .select('id, exhibitor_id, theme, view_count, published')
        .eq('published', true);

      if (minisitesError) throw minisitesError;

      if (!minisites || minisites.length === 0) {
        return { data: [], error: null };
      }

      // Récupérer les infos des exposants pour chaque mini-site
      const exhibitorIds = minisites.map(ms => ms.exhibitor_id);
      const { data: exhibitors, error: exhibitorsError } = await safeSupabase
        .from('exhibitors')
        .select('id, user_id, company_name, logo_url, category, sector')
        .or(exhibitorIds.map(id => `user_id.eq.${id},id.eq.${id}`).join(','));

      if (exhibitorsError) {
        console.warn('Erreur récupération exposants:', exhibitorsError);
      }

      // Combiner les données
      const result = minisites.map(ms => {
        const exhibitor = exhibitors?.find(
          e => e.user_id === ms.exhibitor_id || e.id === ms.exhibitor_id
        );

        return {
          id: ms.id,
          exhibitor_id: ms.exhibitor_id,
          company_name: exhibitor?.company_name || 'Exposant',
          category: exhibitor?.category || 'Non spécifié',
          sector: exhibitor?.sector || 'Non spécifié',
          theme: ms.theme || 'modern',
          views: ms.view_count || 0,
          logo_url: exhibitor?.logo_url
        };
      });

      return { data: result, error: null };
    } catch (error) {
      console.error('Erreur récupération mini-sites publiés:', error);
      return { data: null, error };
    }
  }

  static async getExhibitorForMiniSite(exhibitorId: string): Promise<any | null> {
    if (!this.checkSupabaseConnection()) return null;

    const safeSupabase = supabase!;
    try {
      // ⚡ FIX N+1: Utiliser OR pour chercher par id OU user_id en une seule query
      const { data, error } = await safeSupabase
        .from('exhibitors')
        .select('id, company_name, logo_url, description, website, contact_info')
        .or(`id.eq.${exhibitorId},user_id.eq.${exhibitorId}`)
        .maybeSingle();

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
        .maybeSingle();

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

	  static async createExhibitorProfile(userId: string, userData: Record<string, unknown>): Promise<void> {
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

  static async createPartnerProfile(userId: string, userData: Record<string, unknown>): Promise<void> {
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
	
	  static async sendRegistrationEmail(userData: Record<string, unknown>): Promise<void> {
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
      // Optimized: Select only necessary columns instead of *
      let query = safeSupabase.from('users').select('id, email, name, type, profile, status, created_at');

      // Par défaut, afficher uniquement les exposants, visiteurs et partenaires (pas les admins)
      // Si aucun userType et aucun secteur spécifiés, afficher tous les types professionnels
      const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim();
      const hasSector = filters.sector && filters.sector.trim();
      const hasLocation = filters.location && filters.location.trim();
      
      // Exclure les admins si aucun type spécifié ET aucun secteur spécifié
      if (!filters.userType && !hasSector) {
        // Toujours exclure les admins si aucun type et aucun secteur spécifié
        query = query.in('type', ['exhibitor', 'partner', 'visitor']);
      }

      // Filtre par terme de recherche (nom, entreprise, poste)
      if (hasSearchTerm) {
        const term = `%${filters.searchTerm!.trim().toLowerCase()}%`;
        // Utiliser un filtre OR plus simple et lisible
        query = query.or(
          `profile->>firstName.ilike.${term},` +
          `profile->>lastName.ilike.${term},` +
          `profile->>company.ilike.${term},` +
          `profile->>companyName.ilike.${term},` +
          `profile->>position.ilike.${term},` +
          `name.ilike.${term},` +
          `email.ilike.${term}`
        );
      }

      // Filtre par secteur
      if (hasSector) {
        query = query.eq('profile->>sector', filters.sector);
      }

      // Filtre par type d'utilisateur
      if (filters.userType) {
        query = query.eq('type', filters.userType);
      }

      // Filtre par localisation (pays)
      if (hasLocation) {
        query = query.eq('profile->>country', filters.location);
      }

      // Exclure les utilisateurs sans profil valide
      query = query.not('profile', 'is', null);

      // Limite (par défaut 50 si pas de filtre, 100 avec filtres)
      const defaultLimit = filters.limit || 100;
      query = query.limit(defaultLimit);

      const { data, error } = await query;

      if (error) throw error;

      // Filtrer les résultats côté client pour s'assurer d'avoir des données valides
      const transformedUsers = (data || []).map(this.transformUserDBToUser);
      
      const users = transformedUsers.filter(u => u && (u.profile?.firstName || u.profile?.company || u.profile?.companyName || u.name));

      return users;
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

      return (data || []).map((rec: Record<string, unknown>) => this.transformUserDBToUser(rec.recommended_user));
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
	      // Utiliser la nouvelle structure de notifications avec title et category
	      await safeSupabase.from('notifications').insert([{
	        user_id: userId,
	        title: type === 'connection' ? 'Nouvelle connexion' : 
	               type === 'event' ? 'Événement' : 
	               type === 'message' ? 'Nouveau message' : 'Notification',
	        message: message,
	        type: type === 'connection' ? 'info' : 
	              type === 'event' ? 'info' : 
	              type === 'message' ? 'info' : 'info',
	        category: type,
	        is_read: false
	      }]);
	    } catch (error) {
	      console.error('❌ Erreur création notification:', error);
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
	   * Refuse une demande de connexion
	   */
	  static async rejectConnectionRequest(connectionId: string): Promise<boolean> {
	    if (!this.checkSupabaseConnection()) return false;
	
	    const safeSupabase = supabase!;
	    try {
	      const { error } = await safeSupabase
	        .from('connections')
	        .delete()
	        .eq('id', connectionId);
	
	      if (error) throw error;
	
	      return true;
	    } catch (error) {
	      console.error('Erreur lors du refus de la demande:', error);
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

      const connectedUserIds = (connections || []).map((conn: Record<string, unknown>) => 
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
  static async getTimeSlotsByExhibitor(exhibitorIdOrUserId: string): Promise<TimeSlot[]> {
    if (!this.checkSupabaseConnection()) return [];
    
    // Validate UUID format (must be 36 chars with hyphens)
    if (!exhibitorIdOrUserId || !exhibitorIdOrUserId.includes('-') || exhibitorIdOrUserId.length !== 36) {
      console.warn('[TIME_SLOTS] Invalid ID format:', exhibitorIdOrUserId);
      return [];
    }

    if (!exhibitorIdOrUserId) {
      console.warn('[TIME_SLOTS] ID is empty');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      // D'abord, essayer de récupérer directement avec exhibitor_id
      let { data, error } = await safeSupabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', exhibitorIdOrUserId)
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      // Si pas de résultats, vérifier si c'est un user_id et essayer de résoudre l'exhibitor_id
      if (!error && (!data || data.length === 0)) {
        const { data: exhibitor } = await safeSupabase
          .from('exhibitors')
          .select('id')
          .eq('user_id', exhibitorIdOrUserId)
          .maybeSingle();

        if (exhibitor) {
          const result = await safeSupabase
            .from('time_slots')
            .select('*')
            .eq('exhibitor_id', exhibitor.id)
            .order('slot_date', { ascending: true })
            .order('start_time', { ascending: true });
          
          data = result.data;
          error = result.error;
        }
      }

      if (error) {
        console.error('[TIME_SLOTS] Error fetching slots:', error.message);
        throw error;
      }

      // Helper pour parser une date sans décalage UTC
      const parseLocalDate = (dateStr: string | Date): string => {
        if (!dateStr) return '';
        // Garder juste la partie YYYY-MM-DD pour éviter le décalage UTC
        return String(dateStr).split('T')[0];
      };

      // Transform DB rows to TimeSlot interface (snake_case → camelCase)
      interface TimeSlotRow {
        id: string;
        exhibitor_id?: string;
        user_id?: string;
        slot_date?: string;
        date?: string;
        start_time?: string;
        startTime?: string;
        end_time?: string;
        endTime?: string;
        duration?: number;
        type?: string;
        max_bookings?: number;
        maxBookings?: number;
        current_bookings?: number;
        currentBookings?: number;
        available?: boolean;
        location?: string;
      }

      const transformed = (data || []).map((row: TimeSlotRow) => ({
        id: row.id,
        userId: row.exhibitor_id || row.user_id,
        date: parseLocalDate(row.slot_date || row.date),
        startTime: row.start_time || row.startTime,
        endTime: row.end_time || row.endTime,
        duration: row.duration || 0,
        type: row.type || 'in-person',
        maxBookings: row.max_bookings || row.maxBookings || 1,
        currentBookings: row.current_bookings || row.currentBookings || 0,
        available: row.available !== undefined ? row.available : true,
        location: row.location || undefined
      }));

      return transformed;
    } catch (error) {
      const errorInfo = error as Record<string, unknown>;
      console.error('[TIME_SLOTS] Error fetching time slots:', {
        exhibitorId,
        message: (errorInfo.message as string) || String(error),
        details: ((errorInfo.details as string) || (errorInfo.hint as string)) || null,
        status: (errorInfo.status as string) || 'unknown'
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
      // Validation: la date ne doit pas être dans le passé
      const slotDate = (slotData as unknown as Record<string, unknown>).date || (slotData as unknown as Record<string, unknown>).slot_date;
      if (slotDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [year, month, day] = String(slotDate).split('T')[0].split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day);
        if (parsedDate < today) {
          throw new Error('Impossible de créer un créneau pour une date passée');
        }
      }

      // Résoudre l'exhibitor_id depuis le userId si nécessaire
      let exhibitorId = (slotData as unknown as Record<string, unknown>).exhibitorId || null;
      
      if (!exhibitorId) {
        const userId = (slotData as unknown as Record<string, unknown>).userId;
        if (userId) {
          // Récupérer l'exhibitor_id correspondant au user_id
          const { data: exhibitor, error: exhError } = await safeSupabase
            .from('exhibitors')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (exhError || !exhibitor) {
            console.warn('⚠️ [CREATE_SLOT] Exhibitor introuvable pour userId:', userId, 'création automatique...');
            
            // Créer automatiquement l'exhibitor si il n'existe pas
            const { data: user } = await safeSupabase
              .from('users')
              .select('id, email, name, profile')
              .eq('id', userId)
              .single();
            
            if (!user) {
              throw new Error(`Utilisateur ${userId} introuvable`);
            }
            
            const companyName = user.profile?.company || user.profile?.companyName || user.name || 'Exposant';
            const userName = user.profile?.firstName && user.profile?.lastName 
              ? `${user.profile.firstName} ${user.profile.lastName}` 
              : user.name || 'Contact';
            
            const { data: newExhibitor, error: createError } = await safeSupabase
              .from('exhibitors')
              .insert({
                user_id: userId,
                company_name: companyName,
                sector: user.profile?.sector || 'Maritime Services',
                description: 'Profil créé automatiquement',
                contact_info: { email: user.email, name: userName },
                category: 'port-industry',
                verified: false,
                featured: false
              })
              .select('id')
              .single();
            
            if (createError || !newExhibitor) {
              console.error('❌ [CREATE_SLOT] Erreur création auto exhibitor:', createError);
              throw new Error(`Impossible de créer le profil exposant pour ${userId}`);
            }
            
            exhibitorId = newExhibitor.id;
            console.log('✅ [CREATE_SLOT] Exhibitor créé automatiquement:', { userId, exhibitorId });
          } else {
            exhibitorId = exhibitor.id;
            console.log('✅ [CREATE_SLOT] Exhibitor résolu:', { userId, exhibitorId });
          }
        }
      }

      if (!exhibitorId) {
        throw new Error('exhibitor_id ou userId requis pour créer un créneau');
      }

      // Map frontend slotData to DB column names to handle schema differences
      const slotDataRecord = slotData as unknown as Record<string, unknown>;
      const insertPayload: Record<string, unknown> = {
        exhibitor_id: exhibitorId,
        slot_date: slotDataRecord.date || slotDataRecord.slot_date || null,
        start_time: slotDataRecord.startTime || slotDataRecord.start_time || null,
        end_time: slotDataRecord.endTime || slotDataRecord.end_time || null,
        duration: slotDataRecord.duration || null,
        type: slotDataRecord.type || 'in-person',
        max_bookings: (slotDataRecord.maxBookings as number) ?? (slotDataRecord.max_bookings as number) ?? 1,
        current_bookings: (slotDataRecord.currentBookings as number) ?? (slotDataRecord.current_bookings as number) ?? 0,
        available: ((slotDataRecord.currentBookings as number) ?? 0) < ((slotDataRecord.maxBookings as number) ?? 1),
        location: slotDataRecord.location || null
      };

      // LOG DÉTAILLÉ POUR DEBUG
      console.log('🔍 [CREATE_SLOT] Payload à insérer:', JSON.stringify(insertPayload, null, 2));

      // Check for existing slot to avoid 409 Conflict
      const { data: existingSlot } = await safeSupabase
        .from('time_slots')
        .select('*')
        .eq('exhibitor_id', insertPayload.exhibitor_id)
        .eq('slot_date', insertPayload.slot_date)
        .eq('start_time', insertPayload.start_time)
        .maybeSingle();

      let data, error;

      if (existingSlot) {
        console.log('⚠️ [CREATE_SLOT] Le créneau existe déjà, retour du créneau existant.');
        data = existingSlot;
        error = null;
      } else {
        const result = await safeSupabase
          .from('time_slots')
          .insert([insertPayload])
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        const errorInfo = error as unknown as Record<string, unknown>;
        console.error('❌ [CREATE_SLOT] Erreur Supabase:', {
          code: errorInfo.code,
          message: errorInfo.message,
          details: errorInfo.details,
          hint: errorInfo.hint,
          payload: insertPayload
        });
        throw error;
      }

      console.log('✅ [CREATE_SLOT] Créneau créé avec succès:', data);

      // Helper pour parser une date sans décalage UTC
      const parseLocalDateString = (dateStr: string | Date): Date => {
        if (dateStr instanceof Date) return dateStr;
        // Format YYYY-MM-DD -> créer une date à minuit heure locale
        const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
      };

      // Transform returned DB row into TimeSlot interface expected by frontend
      const created = data as unknown as Record<string, unknown>;
      const transformed: TimeSlot = {
        id: created.id,
        userId: created.exhibitor_id || created.user_id,
        date: created.slot_date ? parseLocalDateString(created.slot_date) : (created.date ? parseLocalDateString(created.date) : new Date()),
        startTime: created.start_time || created.startTime,
        endTime: created.end_time || created.endTime,
        duration: created.duration || 0,
        type: created.type || 'in-person',
        maxBookings: created.max_bookings || created.maxBookings || 1,
        currentBookings: created.current_bookings || created.currentBookings || 0,
        available: created.available ?? ((created.current_bookings || 0) < (created.max_bookings || 1)),
        location: created.location
      };

      console.log('✅ [CREATE_SLOT] Transformation réussie:', transformed);
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
      // 1. Fetch appointments raw
      const { data: appointmentsRaw, error } = await safeSupabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
         console.warn("Error fetching appointments raw:", error.message);
         throw error;
      }
      
      if (!appointmentsRaw || appointmentsRaw.length === 0) return [];

      const visitorIds = [...new Set(appointmentsRaw.map(a => a.visitor_id))];
      const exhibitorIds = [...new Set(appointmentsRaw.map(a => a.exhibitor_id))];

      // 2. Fetch related data in parallel
      const [visitorsResponse, profilesResponse] = await Promise.all([
         safeSupabase.from('users').select('id, name, email').in('id', visitorIds),
         safeSupabase.from('exhibitor_profiles').select('id, user_id, company_name, logo_url').in('user_id', exhibitorIds)
      ]);

      const visitorsMap = new Map(visitorsResponse.data?.map(v => [v.id, v]) || []);
      const profilesMap = new Map(profilesResponse.data?.map(p => [p.user_id, p]) || []);

      // 3. Merge data
      return appointmentsRaw.map(apt => {
          const visitor = visitorsMap.get(apt.visitor_id);
          const profile = profilesMap.get(apt.exhibitor_id); // exhibitor_id is user_id of exhibitor

          return {
            ...apt,
            visitor: visitor ? { 
                id: visitor.id, 
                name: visitor.name, 
                email: visitor.email 
            } : undefined,
            exhibitor: profile ? {
                id: profile.user_id, 
                companyName: profile.company_name,
                logo: profile.logo_url,
            } : {
                // Creates a fallback if profile is missing but we have the ID (maybe fetch 'users' for name?)
                id: apt.exhibitor_id,
                companyName: 'Exposant',
            },
            exhibitorUserId: apt.exhibitor_id
          };
      });

    } catch (error) {
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
      // Vérifier le niveau du visiteur - les visiteurs "free" ne peuvent pas prendre de rendez-vous
      const { data: visitorData, error: visitorError } = await safeSupabase
        .from('users')
        .select('visitor_level')
        .eq('id', appointmentData.visitorId)
        .single();

      if (visitorError) throw visitorError;

      if (visitorData?.visitor_level === 'free') {
        throw new Error('Les visiteurs de niveau Free n\'ont pas accès aux rendez-vous. Veuillez passer au niveau Premium ou VIP pour réserver des rendez-vous.');
      }

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
          exhibitor:exhibitors!exhibitor_id(id, company_name, logo_url),
          visitor:users!visitor_id(id, name, email)
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
  private static mapUserFromDB(data: UserDB): User {
    return this.transformUserDBToUser(data);
  }

  private static mapExhibitorFromDB(data: ExhibitorDB): Exhibitor {
    return this.transformExhibitorDBToExhibitor(data);
  }

  private static mapProductFromDB(data: ProductDB): Product {
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

  /**
   * Get users with optional filtering and pagination
   * OPTIMIZATION: Prevents over-fetching by adding filters and limits
   */
  static async getUsers(options?: {
    sector?: string;
    type?: User['type'];
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<User[]> {
    if (!this.checkSupabaseConnection()) {
      console.warn('⚠️ Supabase non configuré');
      return [];
    }

    const safeSupabase = supabase!;
    try {
      // OPTIMIZATION: Select only needed fields instead of '*'
      let query = safeSupabase
        .from('users')
        .select('id, email, name, type, profile, status, created_at, visitor_level, partner_tier')
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.sector) {
        // Filter by sector if user profile contains it
        query = query.contains('profile->sectors', [options.sector]);
      }

      // Apply pagination
      const limit = options?.limit || 50; // Default 50 items
      const offset = options?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

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

  static async updatePartner(partnerId: string, partnerData: Partial<Partner>): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;
    
    const dbData: any = {};
    if (partnerData.organizationName) dbData.company_name = partnerData.organizationName;
    if (partnerData.partnerType) dbData.partner_type = partnerData.partnerType;
    if (partnerData.sector) dbData.sector = partnerData.sector;
    if (partnerData.description) dbData.description = partnerData.description;
    if (partnerData.website) dbData.website = partnerData.website;
    if (partnerData.logo) dbData.logo_url = partnerData.logo;
    if (partnerData.verified !== undefined) dbData.verified = partnerData.verified;
    if (partnerData.featured !== undefined) dbData.featured = partnerData.featured;
    if (partnerData.sponsorshipLevel) dbData.partnership_level = partnerData.sponsorshipLevel;

    const { error } = await (safeSupabase as any)
      .from('partners')
      .update(dbData)
      .eq('id', partnerId);

    if (error) {
      console.error('Supabase updatePartner error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
  }

  static async deletePartner(partnerId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('partners')
      .delete()
      .eq('id', partnerId);

    if (error) {
      console.error('Supabase deletePartner error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
  }

  static async deleteExhibitor(exhibitorId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('exhibitors')
      .delete()
      .eq('id', exhibitorId);

    if (error) {
      console.error('Supabase deleteExhibitor error:', error);
      throw new Error(error.message || JSON.stringify(error));
    }
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
      // Step 1: Get the user_id from the registration request
      const { data: request, error: fetchError } = await (safeSupabase as any)
        .from('registration_requests')
        .select('user_id, user_type')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      // Step 2: Update the registration request
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

      // Step 3: CRITICAL FIX - Also update the user's status
      if (request?.user_id) {
        const newUserStatus = status === 'approved' ? 'active' : 'rejected';
        const { error: userError } = await (safeSupabase as any)
          .from('users')
          .update({ status: newUserStatus })
          .eq('id', request.user_id);

        if (userError) {
          console.error('Error updating user status:', userError);
          // Don't throw - the registration request was updated successfully
        }

        // Step 4: If partner, also update partners table verified status
        if (request.user_type === 'partner' && status === 'approved') {
          await (safeSupabase as any)
            .from('partners')
            .update({ verified: true })
            .eq('id', request.user_id);
        }

        // Step 5: If exhibitor, also update exhibitors table verified status
        if (request.user_type === 'exhibitor' && status === 'approved') {
          await (safeSupabase as any)
            .from('exhibitors')
            .update({ verified: true })
            .eq('user_id', request.user_id);
        }
      }
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

      if (error) {
        // Handle duplicate connection (409 conflict)
        if (error.code === '23505' || error.message?.includes('duplicate')) {
          throw new Error('Vous avez déjà une demande de connexion en cours avec cet utilisateur.');
        }
        throw error;
      }

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
   * Get pending connection requests for user (both sent and received)
   */
  static async getPendingConnections(userId?: string): Promise<any[]> {
    if (!this.checkSupabaseConnection()) return [];
    const safeSupabase = supabase!;

    try {
      const { data: { user } } = await safeSupabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return [];

      // Fetch both pending connections sent by user AND received by user
      const { data, error } = await safeSupabase
        .from('connections')
        .select('id, requester_id, addressee_id, status, created_at, message')
        .or(`requester_id.eq.${targetUserId},addressee_id.eq.${targetUserId}`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const rows = data || [];
      
      // Get all user IDs involved (both requesters and addressees)
      const userIds = Array.from(new Set(rows.flatMap((r: any) => [r.requester_id, r.addressee_id]).filter(Boolean)));
      if (userIds.length === 0) return rows;

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
          activity_type: type,
          description,
          related_user_id: actorId || null,
          related_entity_type: entityType || null,
          related_entity_id: entityId || null,
          metadata: metadata || {},
          is_public: true
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

