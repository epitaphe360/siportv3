
import { supabase } from '../lib/supabase';
import { isSupabaseReady } from '../lib/supabase';
import { User, Exhibitor, Product, Appointment, Event, ChatMessage, ChatConversation, MiniSiteSection, MessageAttachment, ExhibitorCategory, ContactInfo, TimeSlot } from '../types';

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
  /**
   * Crée un mini-site pour un exposant
   * @param miniSiteData Données du mini-site (company, logo, description, products, socials, documents)
   */
  static async createMiniSite(miniSiteData: {
    company: string;
    logo?: string;
    description?: string;
    products?: string;
    socials?: string;
    documents?: string[];
  }): Promise<any> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }
    const safeSupabase = supabase!;
    try {
      // Try to resolve an exhibitor for the current user (if authenticated)
      let exhibitorId: string | null = null;
      let userId: string | null = null;

      // Try to get current authenticated user id (best-effort)
      try {
        // supabase-js v2
        const userRes = await safeSupabase.auth.getUser();
        userId = (userRes as any)?.data?.user?.id || null;
        if (userId) {
          const { data: exData, error: exError } = await (safeSupabase as any)
            .from('exhibitors')
            .select('id')
            .eq('user_id', userId)
            .single();
          if (!exError && exData && (exData as any).id) {
            exhibitorId = (exData as any).id;
          }
        }
      } catch (e) {
        // ignore auth lookup failure, we'll create an exhibitor if needed
        console.warn('Could not resolve current user for exhibitor lookup', e);
      }

      // If no exhibitor found, create a minimal exhibitor record to link the mini-site
      if (!exhibitorId) {
        // If we don't have a userId, creating an exhibitor will likely be blocked by RLS.
        if (!userId) {
          throw new Error('Authentification requise : veuillez vous connecter pour créer ou lier un exposant.');
        }
        const exhibitorInsert: any = {
          company_name: miniSiteData.company || 'Sans nom',
          description: miniSiteData.description || null,
          logo_url: miniSiteData.logo || null,
          contact_info: {},
        };
        if (userId) exhibitorInsert.user_id = userId;

        const { data: createdEx, error: createExErr } = await (safeSupabase as any)
          .from('exhibitors')
          .insert([exhibitorInsert] as any)
          .select()
          .single();

        if (createExErr) {
          console.error('Error creating exhibitor for mini-site:', createExErr);
          throw new Error((createExErr as any).message || JSON.stringify(createExErr));
        }
        exhibitorId = (createdEx as any).id;
      }

      // Build a sections JSON payload that fits the existing `mini_sites` schema
      const sections = [
        { type: 'hero', content: { company: miniSiteData.company, description: miniSiteData.description, logo: miniSiteData.logo } },
        { type: 'products', content: { products: miniSiteData.products } },
        { type: 'socials', content: { socials: miniSiteData.socials } },
        { type: 'documents', content: { documents: miniSiteData.documents } },
      ];

      const { data, error } = await (safeSupabase as any)
        .from('mini_sites')
        .insert([
          {
            exhibitor_id: exhibitorId,
            theme: 'default',
            custom_colors: {},
            sections,
            published: false,
            views: 0,
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString(),
          },
        ] as any)
        .select();

      if (error) {
        console.error('Supabase createMiniSite error:', error);
        throw new Error((error as any).message || JSON.stringify(error));
      }
      return data;
    } catch (err: any) {
      console.error('createMiniSite caught exception:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }
  static async deleteUser(id: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
  
  private static checkSupabaseConnection() {
    return isSupabaseReady() && supabase;
  }
  
  // ==================== USERS ====================

  static async getUsers(): Promise<User[]> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .select('*');
    if (error) throw error;
    return (data || []).map(this.mapUserFromDB);
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
        profile: userData.profile || {}
      }] as any)
      .select()
      .single();
    if (error) throw error;
    return this.mapUserFromDB(data);
  }

  static async getUserById(id: string): Promise<User | null> {
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return this.mapUserFromDB(data);
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
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    
    return this.mapUserFromDB(data);
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('users')
      .update({
        name: updates.name,
        type: updates.type,
        profile: updates.profile
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapUserFromDB(data);
  }

  // ==================== EXHIBITORS ====================
  
  static async getExhibitors(): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    // Use safe separate queries only (avoid embedded selects entirely).
    // 1) Fetch exhibitors basic fields
    const { data: exhibitorsData, error: exhibitorsError } = await (safeSupabase as any)
      .from('exhibitors')
      .select('id,user_id,company_name,category,sector,description,logo_url,website,verified,featured,contact_info');
    if (exhibitorsError) throw exhibitorsError;

    const exhibitors = (exhibitorsData || []) as any[];
    if (exhibitors.length === 0) return [];

    const ids = exhibitors.map(e => e.id);

    // 2) Fetch products for these exhibitors in one query
    const { data: productsData, error: productsError } = await (safeSupabase as any)
      .from('products')
      .select('*')
      .in('exhibitor_id', ids);
    if (productsError) throw productsError;

    // 3) Fetch mini_sites for these exhibitors in one query
    const { data: miniSitesData, error: miniSitesError } = await (safeSupabase as any)
      .from('mini_sites')
      .select('*')
      .in('exhibitor_id', ids);
    if (miniSitesError) throw miniSitesError;

    // Group products and mini_sites by exhibitor_id
    const productsByEx: Record<string, any[]> = {};
    (productsData || []).forEach((p: any) => {
      const k = String(p.exhibitor_id);
      if (!productsByEx[k]) productsByEx[k] = [];
      productsByEx[k].push(p);
    });

    const miniByEx: Record<string, any> = {};
    (miniSitesData || []).forEach((m: any) => {
      miniByEx[String(m.exhibitor_id)] = m;
    });

    // Merge into exhibitor shapes expected by mapExhibitorFromDB
    const merged = exhibitors.map(e => ({
      ...e,
      products: productsByEx[String(e.id)] || [],
      mini_site: miniByEx[String(e.id)] || null
    }));

    return merged.map(this.mapExhibitorFromDB);
  }

  static async getExhibitorById(id: string): Promise<Exhibitor | null> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    
    const safeSupabase = supabase!;
    try {
      const { data, error } = await (safeSupabase as any)
        .from('exhibitors')
        .select(`*, user:users!exhibitors_user_id_fkey(*), products:products!fk_products_exhibitor(*), mini_site:mini_sites!mini_sites_exhibitor_id_fkey(*)`)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return this.mapExhibitorFromDB(data);
    } catch (err: any) {
      // Fallback to safer separate queries and merge (avoid PostgREST embed failures)
      console.warn('Embedded single exhibitor select failed, falling back to safe queries:', err?.message || err);
      const { data: basic, error: basicErr } = await (safeSupabase as any)
        .from('exhibitors')
        .select('id,user_id,company_name,category,sector,description,logo_url,website,verified,featured,contact_info')
        .eq('id', id)
        .single();
      if (basicErr) {
        if (basicErr.code === 'PGRST116') return null;
        throw basicErr;
      }

      const exId = basic.id;
      const [{ data: productsData, error: productsError }, { data: miniData, error: miniError }] = await Promise.all([
        (safeSupabase as any).from('products').select('*').eq('exhibitor_id', exId),
        (safeSupabase as any).from('mini_sites').select('*').eq('exhibitor_id', exId).maybeSingle?.() || (safeSupabase as any).from('mini_sites').select('*').eq('exhibitor_id', exId).single()
      ] as any);

      if (productsError) throw productsError;
      if (miniError && miniError.code !== 'PGRST116') throw miniError;

      const merged = {
        ...basic,
        products: productsData || [],
        mini_site: miniData || null
      };
      return this.mapExhibitorFromDB(merged as any);
    }
  }

  // New: lookup exhibitor by user_id
  static async getExhibitorByUserId(userId: string): Promise<Exhibitor | null> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('exhibitors')
      .select(`*, user:users!exhibitors_user_id_fkey(*), products:products!fk_products_exhibitor(*), mini_site:mini_sites!mini_sites_exhibitor_id_fkey(*)`)
      .eq('user_id', userId)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return this.mapExhibitorFromDB(data);
  }

  static async createExhibitor(exhibitorData: Partial<Exhibitor>): Promise<Exhibitor> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    
    const safeSupabase = supabase!;
    // Use explicit relation aliases on insert to avoid ambiguous embedding
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
        contact_info: exhibitorData.contactInfo || {}
      }])
      .select(`*, user:users!exhibitors_user_id_fkey(*), products:products!fk_products_exhibitor(*), mini_site:mini_sites!mini_sites_exhibitor_id_fkey(*)`)
      .single();

    if (error) throw error;
    return this.mapExhibitorFromDB(data);
  }

  static async updateExhibitor(id: string, updates: Partial<Exhibitor>): Promise<Exhibitor> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('exhibitors')
      .update({
        company_name: updates.companyName,
        category: updates.category,
        sector: updates.sector,
        description: updates.description,
        logo_url: updates.logo,
        website: updates.website,
        verified: updates.verified,
        featured: updates.featured,
        contact_info: updates.contactInfo
      })
      .eq('id', id)
      .select(`*, user:users!exhibitors_user_id_fkey(*), products:products!fk_products_exhibitor(*), mini_site:mini_sites!mini_sites_exhibitor_id_fkey(*)`)
      .single();

    if (error) throw error;
    return this.mapExhibitorFromDB(data);
  }

  /**
   * Upload exhibitor logo to storage and return public URL
   */
  static async uploadExhibitorLogo(exhibitorUserId: string, file: File): Promise<{ path: string; publicUrl?: string } | null> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }
    const safeSupabase = supabase!;
    try {
      // try to resolve exhibitor id from user id
      const { data: ex } = await (safeSupabase as any)
        .from('exhibitors')
        .select('id')
        .eq('user_id', exhibitorUserId)
        .single();
      const exhibitorId = ex?.id || exhibitorUserId;

      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
      const key = `exhibitors/${exhibitorId}/logo-${Date.now()}${ext}`;
  // @ts-expect-error - browser File type accepted by supabase-js
      const { data, error } = await (safeSupabase as any).storage.from('exhibitor-logos').upload(key, file as any, { upsert: true });
      if (error) throw error;
      const { data: publicUrlData } = (safeSupabase as any).storage.from('exhibitor-logos').getPublicUrl(data.path || key);
      return { path: data.path || key, publicUrl: publicUrlData?.publicUrl };
    } catch (err) {
      console.error('uploadExhibitorLogo error', err);
      return null;
    }
  }

  /**
   * Create a mini-site by providing only the exhibitor website URL.
   * This method calls a local AI agent endpoint (configurable via env VITE_AI_AGENT_URL)
   * which returns a mini-site payload compatible with createMiniSite.
   */
  static async createMiniSiteFromWebsite(websiteUrl: string): Promise<any> {
    // Delegate to generator and then persist
    const payload = await this.generateMiniSiteFromWebsite(websiteUrl);
    // Persist the generated payload
    return this.createMiniSite({
      company: payload.company,
      logo: payload.logo,
      description: payload.description,
      products: JSON.stringify(payload.products || []),
      socials: JSON.stringify(payload.socials || []),
      documents: payload.documents || []
    });
  }

  /**
   * Generate a mini-site payload from an exhibitor website URL without persisting it.
   * This is used by the client to show a preview/edit UI before saving.
   */
  static async generateMiniSiteFromWebsite(websiteUrl: string): Promise<any> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré.');
    }

    const agentUrl = (import.meta.env && (import.meta.env as any).VITE_AI_AGENT_URL) || (process.env.REACT_APP_AI_AGENT_URL as string) || (process.env.VITE_AI_AGENT_URL as string) || null;

    let payload: any = null;
    if (agentUrl) {
      try {
        const res = await fetch(agentUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: websiteUrl })
        });
        if (!res.ok) throw new Error(`Agent returned ${res.status}`);
        payload = await res.json();
      } catch (err) {
        console.warn('AI agent call failed, falling back to local script:', err);
      }
    }

    // Fallback: try to run local CLI script via spawn (server-side environment only)
    if (!payload && typeof window === 'undefined') {
      try {
        const runLocalCli = (globalThis as any).__runLocalAiCliFallback;
        if (typeof runLocalCli === 'function') {
          const result = await runLocalCli(websiteUrl);
          if (result) payload = result;
        } else {
          try {
            const fn = new Function('w', "return (async function(){ const child = require('child_process'); const path = require('path'); const scriptPath = path.join(process.cwd(), 'scripts', 'ai_generate_minisite.mjs'); const r = child.spawnSync(process.execPath, [scriptPath, w], { encoding: 'utf8', timeout: 30000 }); if (r && r.status === 0) { try { return JSON.parse(r.stdout); } catch(e) { console.warn('CLI agent produced invalid JSON:', e, r.stdout); return null; } } else { console.warn('CLI agent failed:', (r && (r.stderr || r.stdout)) || r); return null;} })();");
            payload = await fn(websiteUrl);
          } catch (e) {
            console.warn('Local CLI fallback failed (final):', e);
          }
        }
      } catch (err) {
        console.warn('Local CLI fallback failed:', err);
      }
    }

    if (!payload) {
      throw new Error('Could not generate mini-site payload; no AI agent available.');
    }

    return payload;
  }

  // ==================== MOCK DATA ====================
  

  // ==================== MINI SITES ====================
  
  static async getMiniSite(exhibitorId: string): Promise<MiniSiteDB | null> {
    if (!this.checkSupabaseConnection()) {
      return null;
    }
    
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('mini_sites')
      .select('*')
      .eq('exhibitor_id', exhibitorId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

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
        published: siteData.published
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async incrementMiniSiteViews(exhibitorId: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      return;
    }
    
    const safeSupabase = supabase!;
    // Incrémentation manuelle (lecture + update)
    const { data, error: fetchError } = await (safeSupabase as any)
      .from('mini_sites')
      .select('views')
      .eq('exhibitor_id', exhibitorId)
      .single();
    if (fetchError) throw fetchError;
    const currentViews = data?.views || 0;
    const { error } = await (safeSupabase as any)
      .from('mini_sites')
      .update({ 
        views: currentViews + 1,
        last_updated: new Date().toISOString()
      })
      .eq('exhibitor_id', exhibitorId);

    if (error) throw error;
  }

  // ==================== PRODUCTS ====================
  
  static async getProductsByExhibitor(exhibitorId: string): Promise<Product[]> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('products')
      .select('*')
      .eq('exhibitor_id', exhibitorId)
      .order('featured', { ascending: false })
      .order('name');
    if (error) throw error;
    return (data || []).map(this.mapProductFromDB);
  }

  static async createProduct(productData: Partial<Product>): Promise<Product> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('products')
      .insert([{
        exhibitor_id: (productData as { exhibitorId?: string }).exhibitorId,
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

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        category: updates.category,
        images: updates.images,
        specifications: updates.specifications,
        price: updates.price,
        featured: updates.featured
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapProductFromDB(data);
  }

  static async deleteProduct(id: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  // ==================== APPOINTMENTS ====================
  
  static async getAppointmentsByUser(userId: string): Promise<Appointment[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('appointments')
      .select(`
        *,
        exhibitor:exhibitors(*),
        visitor:users(*),
        time_slot:time_slots(*)
      `)
      .or(`visitor_id.eq.${userId},exhibitor_id.in.(select id from exhibitors where user_id = '${userId}')`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(this.mapAppointmentFromDB);
  }

  static async createAppointment(appointmentData: Partial<Appointment>): Promise<Appointment> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }
    const safeSupabase = supabase!;
    // Try to call the atomic booking RPC first (ensures no overbooking in concurrent scenarios)
    try {
      // Supabase RPC call: book_time_slot_atomic(visitor_id, time_slot_id, meeting_type, message)
      const rpcParams = {
        p_visitor_id: appointmentData.visitorId,
        p_time_slot_id: appointmentData.timeSlotId,
        p_meeting_type: (appointmentData.meetingType || 'in-person'),
        p_message: appointmentData.message || null
      } as any;

      const { data: rpcData, error: rpcErr } = await (safeSupabase as any)
        .rpc('book_time_slot_atomic', [rpcParams.p_visitor_id, rpcParams.p_time_slot_id, rpcParams.p_meeting_type, rpcParams.p_message]);

      if (!rpcErr && rpcData) {
        // rpc returns the inserted appointment row (single)
        return this.mapAppointmentFromDB(rpcData);
      }

      // If RPC returned an error, fall through to fallback insert below and rethrow known conditions
      if (rpcErr) {
        // Translate common Postgres errors
        const msg = (rpcErr.message || String(rpcErr)).toLowerCase();
        if (msg.includes('fully booked') || msg.includes('time slot fully booked') || msg.includes('time slot fully booked')) {
          throw new Error('Ce créneau est complet.');
        }
        if (msg.includes('duplicate') || msg.includes('unique')) {
          throw new Error('Vous avez déjà réservé ce créneau.');
        }
        // Otherwise, continue to try normal insert which may provide richer error details
      }
    } catch (rpcCallErr: any) {
      // If RPC call failed (function not found or permission), we'll try the standard insert as fallback
      const low = String(rpcCallErr?.message || rpcCallErr || '').toLowerCase();
      if (low.includes('function') && low.includes('does not exist')) {
        // expected on older DBs; continue to fallback insert
      } else if (low.includes('time slot fully booked') || low.includes('fully booked')) {
        throw new Error('Ce créneau est complet.');
      }
      // else continue to fallback behavior
    }

    // Fallback: legacy insert (DB triggers will adjust counts if RPC not present)
    const { data, error } = await (safeSupabase as any)
      .from('appointments')
      .insert([{
        exhibitor_id: appointmentData.exhibitorId,
        visitor_id: appointmentData.visitorId,
        time_slot_id: appointmentData.timeSlotId,
        message: appointmentData.message,
        meeting_type: appointmentData.meetingType || 'in-person'
      }])
      .select(`
        *,
        exhibitor:exhibitors(*),
        visitor:users(*),
        time_slot:time_slots(*)
      `)
      .single();
    if (error) {
      // Map common DB errors to friendlier messages
      const errMsg = String(error.message || error).toLowerCase();
      if (errMsg.includes('duplicate') || errMsg.includes('unique')) {
        throw new Error('Vous avez déjà réservé ce créneau.');
      }
      if (errMsg.includes('foreign key') || errMsg.includes('violat')) {
        throw new Error('Données invalides pour la réservation.');
      }
      throw error;
    }
    return this.mapAppointmentFromDB(data);
  }

  static async updateAppointmentStatus(id: string, status: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      return;
    }
    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('appointments')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  }

  // ==================== EVENTS ====================
  
  static async getEvents(): Promise<Event[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('events')
      .select('*')
      .order('featured', { ascending: false })
      .order('event_date');
    if (error) throw error;
    return data.map(this.mapEventFromDB);
  }

  // TODO: Implémenter l'inscription à un événement
  // static async registerForEvent(eventId: string, userId: string): Promise<void> {
  //   if (!this.checkSupabaseConnection()) {
  //     return;
  //   }
  //   // Fonction à implémenter correctement
  //   return;
  // }

  static async incrementArticleViews(id: string): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      return;
    }
    const safeSupabase = supabase!;
    // Incrémentation manuelle (lecture + update)
    const { data, error: fetchError } = await (safeSupabase as any)
      .from('news_articles')
      .select('views')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;
    const currentViews = data?.views || 0;
    const { error } = await (safeSupabase as any)
      .from('news_articles')
      .update({ views: currentViews + 1 })
      .eq('id', id);
    if (error) throw error;
  }

  // ==================== MAPPING FUNCTIONS ====================
  
  private static mapUserFromDB(data: UserDB): User {
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      type: data.type,
      profile: data.profile as unknown as User['profile'],
      status: data.status || 'active',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  /**
   * Map raw database exhibitor record to client Exhibitor shape
   */
  static mapExhibitorFromDB(data: ExhibitorDB): Exhibitor {
    return {
      id: data.id,
      userId: data.user_id,
      companyName: data.company_name,
      category: data.category as Exhibitor['category'],
      sector: data.sector,
      description: data.description,
      logo: data.logo_url,
      website: data.website,
      verified: data.verified,
      featured: data.featured,
      contactInfo: data.contact_info as unknown as Exhibitor['contactInfo'],
  products: data.products?.map(SupabaseService.mapProductFromDB) || [],
      availability: [], // À implémenter avec time_slots
      miniSite: data.mini_site ? {
        id: data.mini_site.id as string,
        exhibitorId: data.mini_site.exhibitor_id as string,
        theme: data.mini_site.theme as string,
        customColors: data.mini_site.custom_colors as { primary: string; secondary: string; accent: string },
        sections: data.mini_site.sections as MiniSiteSection[],
        published: data.mini_site.published as boolean,
        views: data.mini_site.views as number,
        lastUpdated: new Date(data.mini_site.last_updated as string)
      } : {
        id: '',
        exhibitorId: data.id,
        theme: 'modern',
        customColors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
        sections: [],
        published: false,
        views: 0,
        lastUpdated: new Date()
      },
      certifications: [],
      establishedYear: undefined,
      employeeCount: undefined,
      revenue: undefined,
      markets: []
    };
  }

  private static mapProductFromDB(data: Record<string, unknown>): Product {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string,
      category: data.category as string,
      images: (data.images as string[]) || [],
      specifications: data.specifications as string,
      price: data.price as number,
      featured: data.featured as boolean,
      technicalSpecs: []
    };
  }

  private static mapAppointmentFromDB(data: Record<string, unknown>): Appointment {
    return {
      id: data.id as string,
      exhibitorId: data.exhibitor_id as string,
      visitorId: data.visitor_id as string,
      timeSlotId: data.time_slot_id as string,
      status: data.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
      message: data.message as string,
      notes: data.notes as string,
      rating: data.rating as number,
      createdAt: new Date(data.created_at as string),
      meetingType: data.meeting_type as 'in-person' | 'virtual' | 'hybrid',
      meetingLink: data.meeting_link as string
    };
  }

  private static mapEventFromDB(data: Record<string, unknown>): Event {
    return {
      id: data.id as string,
      title: data.title as string,
      description: data.description as string,
      type: data.type as 'webinar' | 'roundtable' | 'networking' | 'workshop' | 'conference',
      date: new Date(data.event_date as string),
      startTime: data.start_time as string,
      endTime: data.end_time as string,
      capacity: data.capacity as number,
      registered: data.registered as number,
      speakers: [], // À implémenter avec une table speakers
      category: data.category as string,
      virtual: data.virtual as boolean,
      featured: data.featured as boolean,
      location: data.location as string,
      meetingLink: data.meeting_link as string,
      tags: (data.tags as string[]) || []
    };
  }


  private static mapMessageFromDB(data: Record<string, unknown>): ChatMessage {
    return {
      id: data.id as string,
      senderId: data.sender_id as string,
      receiverId: '', // À déterminer depuis la conversation
      content: data.content as string,
      type: data.type as 'text' | 'file' | 'system',
      timestamp: new Date(data.timestamp as string),
      read: data.read as boolean,
      attachments: (data.attachments as MessageAttachment[]) || []
    };
  }

  // ==================== ANALYTICS ====================
  
  static async getAnalytics(exhibitorId: string): Promise<AnalyticsData> {
    if (!this.checkSupabaseConnection()) {
      return {
        miniSiteViews: 0,
        appointments: 0,
        products: 0,
        profileViews: 0,
        connections: 0,
        messages: 0
      };
    }
    const safeSupabase = supabase!;
    // Récupérer les vues du mini-site
    const { data: miniSite } = await (safeSupabase as any)
      .from('mini_sites')
      .select('views')
      .eq('exhibitor_id', exhibitorId)
      .single();

    // Compter les rendez-vous
    const { count: appointmentsCount } = await (safeSupabase as any)
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitorId);

    // Compter les produits
    const { count: productsCount } = await (safeSupabase as any)
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('exhibitor_id', exhibitorId);

    return {
      miniSiteViews: miniSite?.views || 0,
      appointments: appointmentsCount || 0,
      products: productsCount || 0,
      profileViews: miniSite?.views || 0,
      connections: 0, // À implémenter
      messages: 0 // À implémenter
    };
  }

  // ==================== SEARCH ====================
  
  static async searchExhibitors(query: string, filters: SearchFilters = {}): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    let queryBuilder = (safeSupabase as any)
      .from('exhibitors')
      .select(`
        *,
        user:users(*),
        products(*),
        mini_site:mini_sites(*)
      `)
      .eq('verified', true);

    if (query) {
      queryBuilder = queryBuilder.or(`company_name.ilike.%${query}%,description.ilike.%${query}%,sector.ilike.%${query}%`);
    }

    if (filters.category) {
      queryBuilder = queryBuilder.eq('category', filters.category);
    }

    if (filters.sector) {
      queryBuilder = queryBuilder.ilike('sector', `%${filters.sector}%`);
    }

    const { data, error } = await queryBuilder
      .order('featured', { ascending: false })
      .order('company_name');

    if (error) throw error;
    return data.map(this.mapExhibitorFromDB);
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================
  
  static subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void) {
    if (!this.checkSupabaseConnection()) {
      return null;
    }
    const safeSupabase = supabase!;
    return safeSupabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        (payload) => {
          callback(this.mapMessageFromDB(payload.new));
        }
      )
      .subscribe();
  }

  static subscribeToAppointments(userId: string, callback: (appointment: Appointment) => void) {
    if (!this.checkSupabaseConnection()) {
      return null;
    }
    const safeSupabase = supabase!;
    return safeSupabase
      .channel(`appointments:${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          if (payload.new) {
            callback(this.mapAppointmentFromDB(payload.new));
          }
        }
      )
      .subscribe();
  }

  // ==================== PARTNERS ====================

  static async getPartners(): Promise<Exhibitor[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('partners')
      .select(`
        *,
        user:users(*)
      `)
      .eq('verified', true)
      .order('featured', { ascending: false })
      .order('company_name');

    if (error) throw error;
    return (data || []).map(this.mapPartnerFromDB);
  }

  static async createPartner(partnerData: {
    userId: string;
    companyName: string;
    partnerType?: string;
    sector: string;
    description: string;
    logo?: string;
    website?: string;
    contactInfo?: Record<string, unknown>;
  }): Promise<Exhibitor> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('partners')
      .insert([{
        user_id: partnerData.userId,
        company_name: partnerData.companyName,
        partner_type: partnerData.partnerType || 'bronze',
        sector: partnerData.sector,
        description: partnerData.description,
        logo_url: partnerData.logo,
        website: partnerData.website,
        contact_info: partnerData.contactInfo || {}
      }])
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return this.mapPartnerFromDB(data);
  }

  // ==================== CONVERSATIONS & MESSAGES ====================

  static async getConversations(userId: string): Promise<ChatConversation[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('conversations')
      .select(`
        *,
        messages:messages(*, sender:users(id,name,email), attachments:message_attachments(*))
      `)
      .contains('participants', [userId])
      .eq('is_active', true)
      .order('last_message_at', { ascending: false, nullsFirst: false });

    if (error) throw error;
    return (data || []).map(this.mapConversationFromDB);
  }

  static async createConversation(participants: string[], type: string = 'direct', title?: string): Promise<ChatConversation> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('conversations')
      .insert([{
        participants,
        type,
        title,
        created_by: participants[0] // First participant as creator
      }])
      .select()
      .single();

    if (error) throw error;
    return this.mapConversationFromDB(data);
  }

  static async sendMessage(conversationId: string, senderId: string, content: string, type: string = 'text', attachments?: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    mimeType?: string;
  }[]): Promise<ChatMessage> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;

    // Create message
    const { data: message, error: messageError } = await (safeSupabase as any)
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: type
      }])
      .select(`
        *,
        sender:users(id,name,email)
      `)
      .single();

    if (messageError) throw messageError;

    // Handle attachments if any
    let messageAttachments: MessageAttachment[] = [];
    if (attachments && attachments.length > 0) {
      const { data: attachmentsData, error: attachmentsError } = await (safeSupabase as any)
        .from('message_attachments')
        .insert(
          attachments.map(att => ({
            message_id: message.id,
            file_name: att.fileName,
            file_url: att.fileUrl,
            file_type: att.fileType,
            file_size: att.fileSize,
            mime_type: att.mimeType,
            uploaded_by: senderId
          }))
        )
        .select();

      if (attachmentsError) throw attachmentsError;
      messageAttachments = attachmentsData || [];
    }

    return {
      ...this.mapMessageFromDB(message),
      attachments: messageAttachments
    };
  }

  // ==================== EVENT REGISTRATIONS ====================

  static async registerForEvent(eventId: string, userId: string, registrationType: string = 'attendee'): Promise<EventRegistration> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    // Vérifier que l'utilisateur est connecté
    if (!userId) {
      throw new Error('Vous devez être connecté pour vous inscrire à un événement.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('event_registrations')
      .insert([{
        event_id: eventId,
        user_id: userId,
        registration_type: registrationType
      }])
      .select(`
        *,
        event:events(*),
        user:users(id,name,email)
      `)
      .single();

    if (error) throw error;
    return this.mapEventRegistrationFromDB(data);
  }

  static async getEventRegistrations(eventId?: string, userId?: string): Promise<EventRegistration[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    let query = (safeSupabase as any)
      .from('event_registrations')
      .select(`
        *,
        event:events(*),
        user:users(id,name,email)
      `);

    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('registration_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(this.mapEventRegistrationFromDB);
  }

  // ==================== NETWORKING RECOMMENDATIONS ====================

  static async getNetworkingRecommendations(userId: string): Promise<NetworkingRecommendationDB[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('networking_recommendations')
      .select(`
        *,
        recommended_user:users(id,name,email,profile)
      `)
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .order('score', { ascending: false })
      .limit(20);

    if (error) throw error;
    return (data || []).map(this.mapNetworkingRecommendationFromDB);
  }

  static async createNetworkingRecommendation(recommendationData: {
    userId: string;
    recommendedUserId: string;
    recommendationType: string;
    score: number;
    reasons: string[];
    category: string;
  }): Promise<NetworkingRecommendationDB> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('networking_recommendations')
      .upsert([{
        user_id: recommendationData.userId,
        recommended_user_id: recommendationData.recommendedUserId,
        recommendation_type: recommendationData.recommendationType,
        score: recommendationData.score,
        reasons: recommendationData.reasons,
        category: recommendationData.category
      }])
      .select(`
        *,
        recommended_user:users(id,name,email,profile)
      `)
      .single();

    if (error) throw error;
    return this.mapNetworkingRecommendationFromDB(data);
  }

  // ==================== ANALYTICS ====================

  static async trackAnalytics(userId: string, eventType: string, eventData: Record<string, unknown> = {}): Promise<void> {
    if (!this.checkSupabaseConnection()) {
      return;
    }

    const safeSupabase = supabase!;
    const { error } = await (safeSupabase as any)
      .from('analytics')
      .insert([{
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      }]);

    if (error) throw error;
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // ==================== ACTIVITIES ====================

  static async createActivity(activityData: {
    userId: string;
    activityType: string;
    description: string;
    relatedUserId?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    metadata?: Record<string, unknown>;
    isPublic?: boolean;
  }): Promise<ActivityDB> {
    if (!this.checkSupabaseConnection()) {
      throw new Error('Supabase non configuré. Veuillez configurer vos variables d\'environnement Supabase.');
    }

    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('activities')
      .insert([{
        user_id: activityData.userId,
        activity_type: activityData.activityType,
        description: activityData.description,
        related_user_id: activityData.relatedUserId,
        related_entity_type: activityData.relatedEntityType,
        related_entity_id: activityData.relatedEntityId,
        metadata: activityData.metadata || {},
        is_public: activityData.isPublic !== false
      }])
      .select(`
        *,
        user:users(id,name,email),
        related_user:users(id,name,email)
      `)
      .single();

    if (error) throw error;
    return this.mapActivityFromDB(data);
  }

  static async getActivities(userId?: string, limit: number = 50): Promise<ActivityDB[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    let query = (safeSupabase as any)
      .from('activities')
      .select(`
        *,
        user:users(id,name,email),
        related_user:users(id,name,email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(this.mapActivityFromDB);
  }

  // ==================== TIME SLOTS ====================

  static async getTimeSlotsByUser(userId: string): Promise<TimeSlot[]> {
    if (!this.checkSupabaseConnection()) {
      return [];
    }
    const safeSupabase = supabase!;
    const { data, error } = await (safeSupabase as any)
      .from('time_slots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;
    return (data || []).map(this.mapTimeSlotFromDB);
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
    const dateString = slotData.date instanceof Date ? slotData.date.toISOString().split('T')[0] : String(slotData.date);

    const { data, error } = await (safeSupabase as any)
      .from('time_slots')
      .insert([{
        user_id: slotData.userId,
        date: dateString,
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
    return this.mapTimeSlotFromDB(data);
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

  // ==================== MAPPING FUNCTIONS ====================

  private static mapPartnerFromDB(data: Record<string, unknown>): Exhibitor {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      companyName: data.company_name as string,
      category: 'institutional' as ExhibitorCategory, // Default category for partners
      sector: data.sector as string,
      description: data.description as string,
      logo: data.logo_url as string,
      website: data.website as string,
      verified: data.verified as boolean,
      featured: data.featured as boolean,
      contactInfo: (data.contact_info as ContactInfo) || {},
      products: [],
      availability: [],
      miniSite: {
        id: '',
        exhibitorId: data.id as string,
        theme: 'modern',
        customColors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
        sections: [],
        published: false,
        views: 0,
        lastUpdated: new Date()
      },
      certifications: [],
      establishedYear: undefined,
      employeeCount: undefined,
      revenue: undefined,
      markets: []
    };
  }

  private static mapConversationFromDB(data: Record<string, unknown>): ChatConversation {
    return {
      id: data.id as string,
      participants: data.participants as string[],
      lastMessage: undefined, // Will be populated separately if needed
      unreadCount: 0, // Will be calculated separately
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string)
    };
  }

  private static mapEventRegistrationFromDB(data: Record<string, unknown>): EventRegistration {
    return {
      id: data.id as string,
      eventId: data.event_id as string,
      userId: data.user_id as string,
      registrationType: data.registration_type as string,
      status: data.status as string,
      registrationDate: new Date(data.registration_date as string),
      attendedAt: data.attended_at ? new Date(data.attended_at as string) : undefined,
      notes: data.notes as string,
      specialRequirements: data.special_requirements as string,
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string)
    };
  }

  private static mapNetworkingRecommendationFromDB(data: Record<string, unknown>): NetworkingRecommendationDB {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      recommendedUserId: data.recommended_user_id as string,
      recommendationType: data.recommendation_type as string,
      score: parseFloat(data.score as string),
      reasons: data.reasons as string[],
      category: data.category as string,
      viewed: data.viewed as boolean,
      contacted: data.contacted as boolean,
      mutualConnections: data.mutual_connections as number,
      expiresAt: new Date(data.expires_at as string),
      createdAt: new Date(data.created_at as string),
      recommendedUser: data.recommended_user as User
    };
  }

  private static mapActivityFromDB(data: Record<string, unknown>): ActivityDB {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      activityType: data.activity_type as string,
      description: data.description as string,
      relatedUserId: data.related_user_id as string,
      relatedEntityType: data.related_entity_type as string,
      relatedEntityId: data.related_entity_id as string,
      metadata: data.metadata as Record<string, unknown>,
      isPublic: data.is_public as boolean,
      createdAt: new Date(data.created_at as string),
      user: data.user as User,
      relatedUser: data.related_user as User
    };
  }

  private static mapTimeSlotFromDB(data: Record<string, unknown>): TimeSlot {
    return {
      id: data.id as string,
      date: data.date ? new Date(String(data.date)) : new Date(),
      startTime: data.start_time as string,
      endTime: data.end_time as string,
      duration: data.duration as number,
      type: data.type as 'in-person' | 'virtual' | 'hybrid',
      maxBookings: data.max_bookings as number,
      currentBookings: data.current_bookings as number,
      available: data.available as boolean,
      location: data.location as string,
      userId: (data as any).user_id as string
    };
  }
}