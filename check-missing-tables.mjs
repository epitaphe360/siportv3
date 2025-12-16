import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Vérification des tables requises...\n');

const tablesToCheck = [
  'events',
  'event_registrations',
  'appointments'
];

for (const table of tablesToCheck) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Table "${table}" - Erreur: ${error.message}`);
    } else {
      console.log(`✅ Table "${table}" - OK (${data?.length || 0} lignes testées)`);
    }
  } catch (err) {
    console.log(`❌ Table "${table}" - Exception: ${err.message}`);
  }
}

console.log('\n✅ Vérification terminée');
