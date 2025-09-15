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

async function testSingleValue() {
  try {
    console.log('🔍 Test d\'une valeur simple...\n');

    // Tester une valeur simple
    const { error } = await supabase.from('exhibitors').insert({
      id: '550e8400-e29b-41d4-a716-446655440010',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      company_name: 'Test Company Simple',
      category: 'service', // Valeur simple
      sector: 'tech', // Valeur simple
      description: 'Test simple',
      verified: true
    });

    if (!error) {
      console.log('✅ Valeur valide trouvée: service/tech');
      await supabase.from('exhibitors').delete().eq('id', '550e8400-e29b-41d4-a716-446655440010');
    } else {
      console.log('❌ Valeur invalide:', error.message);
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
}

testSingleValue();
