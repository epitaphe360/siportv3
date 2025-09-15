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

async function checkEnums() {
  try {
    console.log('🔍 Test des valeurs d\'enum pour exhibitors...\n');

    // Tester différentes valeurs d'enum possibles
    const testValues = {
      category: ['services', 'equipment', 'technology', 'consulting', 'manufacturing', 'logistics', 'shipping', 'port_services'],
      sector: ['technology', 'manufacturing', 'services', 'logistics', 'shipping', 'consulting', 'infrastructure']
    };

    for (const [field, values] of Object.entries(testValues)) {
      console.log(`Test du champ: ${field}`);
      for (const value of values) {
        try {
          const { error } = await supabase.from('exhibitors').insert({
            id: 'test-' + Math.random().toString(36).substr(2, 9),
            user_id: '550e8400-e29b-41d4-a716-446655440001',
            company_name: 'Test Company',
            [field]: value,
            description: 'Test',
            verified: true
          });
          if (!error) {
            console.log(`✅ Valeur valide pour ${field}: ${value}`);
            // Supprimer le test
            await supabase.from('exhibitors').delete().eq('company_name', 'Test Company');
            break;
          } else {
            console.log(`❌ Valeur invalide pour ${field}: ${value} - ${error.message}`);
          }
        } catch (err) {
          console.log(`❌ Exception pour ${field}: ${value} - ${err.message}`);
        }
      }
      console.log('');
    }
  } catch (error) {
    console.error('Erreur générale:', error);
  }
}

checkEnums();
