import { useMemo } from 'react';
import { useDashboardStore } from '../store/dashboardStore';

interface DashboardStatsWithGrowth {
  profileViews: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  connections: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  appointments: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  messages: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  catalogDownloads: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
  miniSiteViews: { value: number; growth: string; growthType: 'positive' | 'negative' | 'neutral' };
}

/**
 * Hook personnalisé pour récupérer les statistiques du dashboard avec calcul de croissance
 * TODO: Implémenter le calcul de croissance réel en comparant avec la période précédente
 */
export const useDashboardStats = (): DashboardStatsWithGrowth | null => {
  const { dashboard } = useDashboardStore();

  return useMemo(() => {
    if (!dashboard?.stats) return null;

    // TODO: Récupérer les statistiques de la période précédente pour calculer la croissance réelle
    // Pour l'instant, on retourne les valeurs sans croissance calculée
    
    return {
      profileViews: {
        value: dashboard.stats.profileViews || 0,
        growth: '--',
        growthType: 'neutral'
      },
      connections: {
        value: dashboard.stats.connections || 0,
        growth: '--',
        growthType: 'neutral'
      },
      appointments: {
        value: dashboard.stats.appointments || 0,
        growth: '--',
        growthType: 'neutral'
      },
      messages: {
        value: dashboard.stats.messages || 0,
        growth: '--',
        growthType: 'neutral'
      },
      catalogDownloads: {
        value: dashboard.stats.catalogDownloads || 0,
        growth: '--',
        growthType: 'neutral'
      },
      miniSiteViews: {
        value: dashboard.stats.miniSiteViews || 0,
        growth: '--',
        growthType: 'neutral'
      }
    };
  }, [dashboard?.stats]);
};
