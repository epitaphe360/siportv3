import { supabase, isSupabaseReady } from '../lib/supabase';

export interface PavilionMetrics {
  totalExhibitors: number;
  totalVisitors: number;
  totalConferences: number;
  countries: number;
}

// Valeurs par défaut pour le développement
const defaultPavilionMetrics: PavilionMetrics = {
  totalExhibitors: 24,
  totalVisitors: 1200,
  totalConferences: 8,
  countries: 12
};

export class PavilionMetricsService {
  static async getMetrics(): Promise<PavilionMetrics> {
    // Si Supabase n'est pas configuré, retourner les valeurs par défaut
    if (!isSupabaseReady() || !supabase) {
      console.info('🔄 Utilisation des métriques de pavilions par défaut (mode développement)');
      console.info('ℹ️ Supabase configuré:', isSupabaseReady());
      console.info('ℹ️ Client Supabase disponible:', !!supabase);
      return defaultPavilionMetrics;
    }

    console.info('🚀 Récupération des vraies métriques de pavilions depuis Supabase...');

    try {
      // Récupérer les métriques depuis Supabase
      const [
        exhibitorsResult,
        visitorsResult,
        eventsResult,
        countriesResult
      ] = await Promise.all([
        // Total exposants (tous les exposants vérifiés)
        (supabase as any).from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true),

        // Total visiteurs
        (supabase as any).from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'),

        // Total conférences/événements
        (supabase as any).from('events').select('id', { count: 'exact', head: true }),

        // Pays représentés (distinct des pays des exposants)
        (supabase as any).from('exhibitors').select('country').eq('verified', true)
      ]);

      // Calculer le nombre de pays distincts
      const countries = new Set(countriesResult.data?.map((e: any) => e.country).filter(Boolean) || []);
      const uniqueCountries = countries.size;

      // Calculer les métriques
      const metrics: PavilionMetrics = {
        totalExhibitors: exhibitorsResult.count || 0,
        totalVisitors: visitorsResult.count || 0,
        totalConferences: eventsResult.count || 0,
        countries: Math.max(uniqueCountries, 12) // Minimum 12 pays comme demandé
      };

      console.info('✅ Métriques de pavilions récupérées depuis Supabase:', metrics);
      console.info('📊 Détails des requêtes pavilions:');
      console.info('- Total exposants:', exhibitorsResult.count);
      console.info('- Total visiteurs:', visitorsResult.count);
      console.info('- Total conférences/événements:', eventsResult.count);
      console.info('- Pays représentés:', uniqueCountries);

      return metrics;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métriques de pavilions:', error);
      console.info('🔄 Retour aux métriques de pavilions par défaut');
      return defaultPavilionMetrics;
    }
  }

  // Méthode pour rafraîchir les métriques
  static async refreshMetrics(): Promise<PavilionMetrics> {
    return this.getMetrics();
  }
}
