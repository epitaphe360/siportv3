import { AdminMetricsService } from '../src/services/adminMetrics';

async function testMetrics() {
  console.log('🧪 Test des métriques admin...\n');

  try {
    const metrics = await AdminMetricsService.getMetrics();

    console.log('📊 Résultats des métriques:');
    console.log('========================');
    console.log(`👥 Total utilisateurs: ${metrics.totalUsers}`);
    console.log(`🔥 Utilisateurs actifs: ${metrics.activeUsers}`);
    console.log(`🏢 Total exposants: ${metrics.totalExhibitors}`);
    console.log(`🤝 Total partenaires: ${metrics.totalPartners}`);
    console.log(`👤 Total visiteurs: ${metrics.totalVisitors}`);
    console.log(`📅 Total événements: ${metrics.totalEvents}`);
    console.log(`⏳ Comptes à valider: ${metrics.pendingValidations}`);
    console.log(`📋 Contrats actifs: ${metrics.activeContracts}`);
    console.log(`🔍 Contenus à modérer: ${metrics.contentModerations}`);

    console.log('\n✅ Test terminé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  }
}

testMetrics();
