import { PavilionMetricsService } from './src/services/pavilionMetrics.ts';

async function testPavilionMetrics() {
  console.log('🧪 Test des métriques de pavilions...\n');

  try {
    const metrics = await PavilionMetricsService.getMetrics();

    console.log('✅ Métriques récupérées avec succès:');
    console.log(`📊 Exposants: ${metrics.totalExhibitors}`);
    console.log(`👥 Visiteurs: ${metrics.totalVisitors}`);
    console.log(`🎤 Conférences: ${metrics.totalConferences}`);
    console.log(`🌍 Pays: ${metrics.countries}`);

    console.log('\n🎯 Valeurs attendues par l\'utilisateur:');
    console.log('📊 Exposants: 24+');
    console.log('👥 Visiteurs: 1,200+');
    console.log('🎤 Conférences: 8+');
    console.log('🌍 Pays: 12');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testPavilionMetrics();
