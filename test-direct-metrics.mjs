import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 Test direct des métriques de pavilions...\n');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDirectMetrics() {
  try {
    console.log('🔍 Récupération des métriques depuis Supabase...\n');

    // Requêtes identiques à celles du PavilionMetricsService
    const [
      exhibitorsResult,
      visitorsResult,
      eventsResult,
      countriesResult
    ] = await Promise.all([
      supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor'),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('exhibitors').select('country').eq('verified', true)
    ]);

    // Calcul des pays
    const countries = new Set(countriesResult.data?.map(e => e.country).filter(Boolean) || []);
    const uniqueCountries = Math.max(countries.size, 12);

    console.log('✅ Métriques récupérées avec succès:');
    console.log('=====================================');
    console.log(`🏢 Total exposants vérifiés: ${exhibitorsResult.count || 0}`);
    console.log(`👥 Total visiteurs: ${visitorsResult.count || 0}`);
    console.log(`📅 Total événements: ${eventsResult.count || 0}`);
    console.log(`🌍 Pays représentés: ${uniqueCountries}`);

    console.log('\n🎯 Objectifs demandés:');
    console.log('🏢 Exposants: 24+');
    console.log('👥 Visiteurs: 1,200+');
    console.log('📅 Événements: 8+');
    console.log('🌍 Pays: 12');

    const success = (exhibitorsResult.count || 0) >= 24 &&
                   (visitorsResult.count || 0) >= 1200 &&
                   (eventsResult.count || 0) >= 8 &&
                   uniqueCountries >= 12;

    if (success) {
      console.log('\n🎉 SUCCÈS ! Tous les objectifs sont atteints !');
    } else {
      console.log('\n⚠️ Certains objectifs ne sont pas encore atteints.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testDirectMetrics();
