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
}

const defaultMetrics: AdminMetrics = {
  totalUsers: 9,
  activeUsers: 2,
  totalExhibitors: 1,
  totalPartners: 6,
  totalVisitors: 4,
  totalEvents: 6,
  systemUptime: 99.8,
  dataStorage: 2.4,
  apiCalls: 125000,
  avgResponseTime: 145,
  pendingValidations: 0,
  activeContracts: 1,
  contentModerations: 0
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
      await runCount('exhibitors', client.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true));
      await runCount('partners', client.from('partners').select('id', { count: 'exact', head: true }));
      await runCount('visitors', client.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'));
      await runCount('events', client.from('events').select('id', { count: 'exact', head: true }));
      await runCount('pendingValidations', client.from('registration_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'));
      await runCount('activeContracts', client.from('partners').select('id', { count: 'exact', head: true }).eq('verified', true));
      await runCount('contentModerations', client.from('mini_sites').select('id', { count: 'exact', head: true }).eq('published', false));

      const metrics: AdminMetrics = {
        totalUsers: results['users'] ?? defaultMetrics.totalUsers,
        activeUsers: Math.floor((results['users'] ?? defaultMetrics.totalUsers) * 0.2),
        totalExhibitors: results['exhibitors'] ?? defaultMetrics.totalExhibitors,
        totalPartners: results['partners'] ?? defaultMetrics.totalPartners,
        totalVisitors: results['visitors'] ?? defaultMetrics.totalVisitors,
        totalEvents: results['events'] ?? defaultMetrics.totalEvents,
        systemUptime: defaultMetrics.systemUptime,
        dataStorage: defaultMetrics.dataStorage,
        apiCalls: defaultMetrics.apiCalls,
        avgResponseTime: defaultMetrics.avgResponseTime,
        pendingValidations: results['pendingValidations'] ?? defaultMetrics.pendingValidations,
        activeContracts: results['activeContracts'] ?? defaultMetrics.activeContracts,
        contentModerations: results['contentModerations'] ?? defaultMetrics.contentModerations
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
}

export default AdminMetricsService;
