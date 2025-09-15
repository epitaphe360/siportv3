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

async function testNullValues() {
  try {
    console.log('🔍 Test avec valeurs nulles...\n');

    // Tester avec des valeurs nulles
    const { error } = await supabase.from('exhibitors').insert({
      id: '550e8400-e29b-41d4-a716-446655440010',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      company_name: 'Test Company Null',
      category: null,
      sector: null,
      description: 'Test avec null',
      verified: true
    });

    if (!error) {
      console.log('✅ Les champs category et sector peuvent être null');
      await supabase.from('exhibitors').delete().eq('id', '550e8400-e29b-41d4-a716-446655440010');
    } else {
      console.log('❌ Erreur avec null:', error.message);
    }

  } catch (error) {
    console.error('Erreur:', error);
  }
}

testNullValues();
