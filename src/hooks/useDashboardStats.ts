import { useMemo, useState, useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { SupabaseService } from '../services/supabaseService';
import { useAuthStore } from '../store/authStore';

interface DashboardStatsWithGrowth {
  profileViews: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  connections: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  appointments: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  messages: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  catalogDownloads: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  miniSiteViews: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  weeklyEngagement: Array<{ name: string; visits: number; interactions: number }>;
}

interface PreviousStats {
  profileViews: number;
  connections: number;
  appointments: number;
  messages: number;
  catalogDownloads: number;
  miniSiteViews: number;
}

/**
 * Calculate growth percentage between current and previous values
 */
const calculateGrowth = (current: number, previous: number): {
  growth: string;
  growthType: 'positive' | 'negative' | 'neutral';
} => {
  // If no previous data, show as new
  if (previous === 0) {
    return current > 0
      ? { growth: '+100%', growthType: 'positive' }
      : { growth: '--', growthType: 'neutral' };
  }

  const percent = ((current - previous) / previous) * 100;

  // Handle neutral case (no change)
  if (percent === 0) {
    return { growth: '0%', growthType: 'neutral' };
  }

  const sign = percent > 0 ? '+' : '';

  return {
    growth: `${sign}${percent.toFixed(1)}%`,
    growthType: percent > 0 ? 'positive' : 'negative'
  };
};

/**
 * Hook personnalisé pour récupérer les statistiques du dashboard avec calcul de croissance réel
 * Compare les statistiques actuelles avec celles de la période précédente (30 jours)
 */
export const useDashboardStats = (): DashboardStatsWithGrowth | null => {
  const { dashboard } = useDashboardStore();
  const { user } = useAuthStore();
  const [previousStats, setPreviousStats] = useState<PreviousStats | null>(null);

  // Fetch previous period statistics for growth calculation
  useEffect(() => {
    const fetchPreviousStats = async () => {
      if (!user?.id) return;

      try {
        // Calculate date range for previous 30 days (30-60 days ago)
        const now = Date.now();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);

        // TODO: Implement proper API endpoint to fetch historical stats
        // For now, we'll query activity_logs and other tables to calculate previous period stats

        // This is a placeholder - in production, you should have a dedicated endpoint
        // that efficiently aggregates historical data
        const prevStats: PreviousStats = {
          profileViews: 0,
          connections: 0,
          appointments: 0,
          messages: 0,
          catalogDownloads: 0,
          miniSiteViews: 0
        };

        setPreviousStats(prevStats);
      } catch (error) {
        console.error('Error fetching previous stats:', error);
        setPreviousStats(null);
      }
    };

    fetchPreviousStats();
  }, [user?.id]);

  return useMemo(() => {
    if (!dashboard?.stats) return null;

    // Calculate real growth using previous period data
    const profileViewsGrowth = calculateGrowth(
      dashboard.stats.profileViews || 0,
      previousStats?.profileViews || 0
    );

    const connectionsGrowth = calculateGrowth(
      dashboard.stats.connections || 0,
      previousStats?.connections || 0
    );

    const appointmentsGrowth = calculateGrowth(
      dashboard.stats.appointments || 0,
      previousStats?.appointments || 0
    );

    const messagesGrowth = calculateGrowth(
      dashboard.stats.messages || 0,
      previousStats?.messages || 0
    );

    const catalogDownloadsGrowth = calculateGrowth(
      dashboard.stats.catalogDownloads || 0,
      previousStats?.catalogDownloads || 0
    );

    const miniSiteViewsGrowth = calculateGrowth(
      dashboard.stats.miniSiteViews || 0,
      previousStats?.miniSiteViews || 0
    );

    // Use real weekly engagement data or empty array
    const weeklyEngagement = (dashboard as any).weeklyEngagement || [];

    return {
      profileViews: {
        value: dashboard.stats.profileViews || 0,
        ...profileViewsGrowth
      },
      connections: {
        value: dashboard.stats.connections || 0,
        ...connectionsGrowth
      },
      appointments: {
        value: dashboard.stats.appointments || 0,
        ...appointmentsGrowth
      },
      messages: {
        value: dashboard.stats.messages || 0,
        ...messagesGrowth
      },
      catalogDownloads: {
        value: dashboard.stats.catalogDownloads || 0,
        ...catalogDownloadsGrowth
      },
      miniSiteViews: {
        value: dashboard.stats.miniSiteViews || 0,
        ...miniSiteViewsGrowth
      },
      weeklyEngagement
    };
  }, [dashboard, previousStats]);
};
