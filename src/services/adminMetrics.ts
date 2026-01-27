import { supabase } from '../lib/supabase';

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalExhibitors: number;
  totalPartners: number;
  totalVisitors: number;
  totalEvents: number;
  systemUptime: number;
  dataStorage: number;
  apiCalls: number;
  avgResponseTime: number;
  pendingValidations: number;
  activeContracts: number;
  contentModerations: number;
  onlineExhibitors: number;
  totalConnections: number;
  totalAppointments: number;
  totalMessages: number;
  totalDownloads: number;
  // Nouvelles métriques
  userGrowthData?: Array<{ name: string; users: number; exhibitors: number; visitors: number }>;
  trafficData?: Array<{ name: string; visits: number; pageViews: number }>;
  recentActivity?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    severity: string;
    adminUser: string;
  }>;
}

const defaultMetrics: AdminMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  totalExhibitors: 0,
  totalPartners: 0,
  totalVisitors: 0,
  totalEvents: 0,
  systemUptime: 99.9,
  dataStorage: 0,
  apiCalls: 0,
  avgResponseTime: 0,
  pendingValidations: 0,
  activeContracts: 0,
  contentModerations: 0,
  onlineExhibitors: 0,
  totalConnections: 0,
  totalAppointments: 0,
  totalMessages: 0,
  totalDownloads: 0
};

const METRICS_SERVER_URL = (import.meta.env.VITE_METRICS_SERVER_URL as string) || (import.meta.env.DEV ? 'http://localhost:4001/metrics' : '');
const METRICS_SECRET = (import.meta.env.VITE_METRICS_SECRET as string) || undefined;

export class AdminMetricsService {

  // Primary entry: prefers server-side admin client. In browser, tries metrics-server fallback.
  static async getMetrics(): Promise<AdminMetrics> {
    const client = (supabase as any);

    // If no service client present and running in browser, try metrics-server endpoint.
    if (supabase == null && typeof window !== 'undefined') {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (METRICS_SECRET) headers['x-metrics-secret'] = METRICS_SECRET;

        if (!METRICS_SERVER_URL) throw new Error('No metrics server URL configured');
        const resp = await fetch(METRICS_SERVER_URL, { method: 'GET', headers });
        if (resp.ok) {
          const payload = await resp.json();
          return { ...defaultMetrics, ...payload } as AdminMetrics;
        }
        console.warn('AdminMetricsService: metrics-server returned', resp.status);
      } catch (err) {
        console.warn('AdminMetricsService: fetch to metrics-server failed', err);
      }
    }

    if (!client) return defaultMetrics;

    try {
      const results: Record<string, number | undefined> = {};

      const runCount = async (key: string, query: any) => {
        try {
          const res = await query;
          results[key] = (res && typeof res.count === 'number') ? res.count : undefined;
        } catch (err) {
          console.warn(`AdminMetricsService: query ${key} failed`, err);
          results[key] = undefined;
        }
      };

      await runCount('users', client.from('users').select('id', { count: 'exact', head: true }));
      await runCount('activeUsers', client.from('users').select('id', { count: 'exact', head: true }).eq('status', 'active'));
      await runCount('exhibitors', client.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true));
      await runCount('partners', client.from('partners').select('id', { count: 'exact', head: true }));
      await runCount('visitors', client.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'));
      await runCount('events', client.from('events').select('id', { count: 'exact', head: true }));
      await runCount('pendingValidations', client.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
      await runCount('activeContracts', client.from('partners').select('id', { count: 'exact', head: true }).eq('verified', true));
      await runCount('contentModerations', client.from('mini_sites').select('id', { count: 'exact', head: true }).eq('published', false));
      await runCount('connections', client.from('connections').select('id', { count: 'exact', head: true }));
      await runCount('appointments', client.from('appointments').select('id', { count: 'exact', head: true }));
      await runCount('messages', client.from('messages').select('id', { count: 'exact', head: true }));
      await runCount('downloads', client.from('downloads').select('id', { count: 'exact', head: true }));

      const metrics: AdminMetrics = {
        totalUsers: (results['users'] ?? 0),
        activeUsers: (results['activeUsers'] ?? 0),
        totalExhibitors: (results['exhibitors'] ?? 0),
        totalPartners: (results['partners'] ?? 0),
        totalVisitors: (results['visitors'] ?? 0),
        totalEvents: (results['events'] ?? 0),
        systemUptime: 99.9, // TODO: Calculer depuis les logs système
        dataStorage: await this.calculateStorageUsage(),
        apiCalls: await this.getApiCallsCount(),
        avgResponseTime: await this.getAvgResponseTime(),
        pendingValidations: (results['pendingValidations'] ?? 0),
        activeContracts: (results['activeContracts'] ?? 0),
        contentModerations: (results['contentModerations'] ?? 0),
        onlineExhibitors: await this.getOnlineExhibitors(),
        totalConnections: (results['connections'] ?? 0),
        totalAppointments: (results['appointments'] ?? 0),
        totalMessages: (results['messages'] ?? 0),
        totalDownloads: (results['downloads'] ?? 0),
        userGrowthData: await this.getUserGrowthData(),
        trafficData: await this.getTrafficData(),
        recentActivity: await this.getRecentActivity()
      };

      return metrics;
    } catch (err) {
      console.error('AdminMetricsService: error fetching metrics', err);
      return defaultMetrics;
    }
  }

  static async getPendingValidations(): Promise<number> {
    const client = (supabase as any);
    if (!client) return defaultMetrics.pendingValidations;
    try {
      const res = await client.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', false);
      return (res && typeof res.count === 'number') ? res.count : defaultMetrics.pendingValidations;
    } catch (err) {
      console.error('AdminMetricsService.getPendingValidations error', err);
      return defaultMetrics.pendingValidations;
    }
  }

  static async getActiveContracts(): Promise<number> {
    const client = (supabase as any);
    if (!client) return defaultMetrics.activeContracts;
    try {
      const res = await client.from('exhibitors').select('id', { count: 'exact', head: true }).eq('featured', true);
      return (res && typeof res.count === 'number') ? res.count : defaultMetrics.activeContracts;
    } catch (err) {
      console.error('AdminMetricsService.getActiveContracts error', err);
      return defaultMetrics.activeContracts;
    }
  }

  static async getContentModerations(): Promise<number> {
    const client = (supabase as any);
    if (!client) return defaultMetrics.contentModerations;
    try {
      const res = await client.from('mini_sites').select('id', { count: 'exact', head: true }).eq('published', false);
      return (res && typeof res.count === 'number') ? res.count : defaultMetrics.contentModerations;
    } catch (err) {
      console.error('AdminMetricsService.getContentModerations error', err);
      return defaultMetrics.contentModerations;
    }
  }

  // Calculer l'utilisation du stockage
  private static async calculateStorageUsage(): Promise<number> {
    const client = (supabase as any);
    if (!client) return 0;
    try {
      // Compter les fichiers uploadés (approximation)
      const { data } = await client.from('media_content').select('file_size');
      if (data && Array.isArray(data)) {
        const totalBytes = data.reduce((sum: number, item: any) => sum + (item.file_size || 0), 0);
        const totalGB = totalBytes / (1024 * 1024 * 1024);
        return Math.round(totalGB * 10) / 10; // Arrondir à 1 décimale
      }
      return 0;
    } catch (err) {
      console.error('AdminMetricsService.calculateStorageUsage error', err);
      return 0;
    }
  }

  // Compter les appels API (depuis les logs si disponible)
  private static async getApiCallsCount(): Promise<number> {
    const client = (supabase as any);
    if (!client) return 0;
    try {
      // Compter les requêtes des dernières 24h si table de logs existe
      const { count } = await client
        .from('api_logs')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      return count || 0;
    } catch (err) {
      // Table n'existe peut-être pas, retourner une estimation
      return 0;
    }
  }

  // Temps de réponse moyen
  private static async getAvgResponseTime(): Promise<number> {
    const client = (supabase as any);
    if (!client) return 0;
    try {
      const { data } = await client
        .from('api_logs')
        .select('response_time')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(100);
      
      if (data && data.length > 0) {
        const avg = data.reduce((sum: number, log: any) => sum + (log.response_time || 0), 0) / data.length;
        return Math.round(avg);
      }
      return 0;
    } catch (err) {
      return 0;
    }
  }

  // Exposants en ligne (actifs dans les dernières 15 minutes)
  private static async getOnlineExhibitors(): Promise<number> {
    const client = (supabase as any);
    if (!client) return 0;
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const { count } = await client
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('type', 'exhibitor')
        .gte('last_seen', fifteenMinutesAgo);
      return count || 0;
    } catch (err) {
      console.error('AdminMetricsService.getOnlineExhibitors error', err);
      return 0;
    }
  }

  // Données de croissance utilisateurs (6 derniers mois)
  static async getUserGrowthData(): Promise<Array<{ name: string; users: number; exhibitors: number; visitors: number }>> {
    const client = (supabase as any);
    if (!client) return [];
    
    try {
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
      const result = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        const { count: users } = await client
          .from('users')
          .select('id', { count: 'exact', head: true })
          .lte('created_at', endOfMonth.toISOString());
        
        const { count: exhibitors } = await client
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'exhibitor')
          .lte('created_at', endOfMonth.toISOString());
        
        const { count: visitors } = await client
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('type', 'visitor')
          .lte('created_at', endOfMonth.toISOString());
        
        result.push({
          name: months[5 - i],
          users: users || 0,
          exhibitors: exhibitors || 0,
          visitors: visitors || 0
        });
      }
      
      return result;
    } catch (err) {
      console.error('AdminMetricsService.getUserGrowthData error', err);
      return [];
    }
  }

  // Données de trafic hebdomadaire
  static async getTrafficData(): Promise<Array<{ name: string; visits: number; pageViews: number }>> {
    const client = (supabase as any);
    if (!client) return [];
    
    try {
      const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const result = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        
        const { count: visits } = await client
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString())
          .eq('unique_view', true);
        
        const { count: pageViews } = await client
          .from('page_views')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());
        
        result.push({
          name: days[6 - i],
          visits: visits || 0,
          pageViews: pageViews || 0
        });
      }
      
      return result;
    } catch (err) {
      console.error('AdminMetricsService.getTrafficData error', err);
      return [];
    }
  }

  // Activité récente de l'admin
  static async getRecentActivity(): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    severity: string;
    adminUser: string;
  }>> {
    const client = (supabase as any);
    if (!client) return [];
    
    try {
      const { data } = await client
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && Array.isArray(data)) {
        return data.map((log: any) => ({
          id: log.id,
          type: log.action_type || 'system_alert',
          description: log.description || 'Action système',
          timestamp: new Date(log.created_at),
          severity: log.severity || 'info',
          adminUser: log.admin_user || 'System'
        }));
      }
      
      return [];
    } catch (err) {
      console.error('AdminMetricsService.getRecentActivity error', err);
      return [];
    }
  }
}

export default AdminMetricsService;
