import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeDatabase() {
  console.log('🔍 Analyse de la base de données...\n');

  try {
    // Vérifier les utilisateurs existants
    const { data: users, error: usersError } = await supabase.from('users').select('id, email, type');
    if (usersError) {
      console.log('❌ Erreur utilisateurs:', usersError.message);
    } else {
      console.log('👥 Utilisateurs existants:', users.length);
      users.forEach(u => console.log(`  - ${u.email} (${u.type}) - ID: ${u.id}`));
    }

    // Vérifier les exposants existants
    const { data: exhibitors, error: exhibitorsError } = await supabase.from('exhibitors').select('*');
    if (exhibitorsError) {
      console.log('❌ Erreur exposants:', exhibitorsError.message);
    } else {
      console.log('\n🏢 Exposants existants:', exhibitors.length);
      if (exhibitors.length > 0) {
        exhibitors.forEach(e => console.log(`  - ${e.company_name} (${e.category}) - Vérifié: ${e.verified}`));
      }
    }

    // Tester la structure de la table exhibitors
    console.log('\n📋 Test de création d\'exposant simple...');
    const testExhibitor = {
      id: 'test-' + Date.now(),
      user_id: users && users.length > 0 ? users[1].id : '550e8400-e29b-41d4-a716-446655440002',
      company_name: 'Test Company Analysis',
      category: 'port-industry',
      sector: 'technology',
      description: 'Test pour analyse',
      verified: true,
      featured: false
    };

    const { error: testError } = await supabase.from('exhibitors').insert(testExhibitor);
    if (testError) {
      console.log('❌ Erreur test:', testError.message);
      console.log('Détails:', testError.details);
      console.log('Code:', testError.code);
    } else {
      console.log('✅ Test réussi - Exposant créé');
      // Nettoyer
      await supabase.from('exhibitors').delete().eq('company_name', 'Test Company Analysis');
    }

  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

analyzeDatabase();
