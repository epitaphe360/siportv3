import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Test de connexion aux tables avec clé ANON...\n');

// Test avec utilisateur anonyme (comme dans l'app)
const tables = ['events', 'event_registrations', 'appointments'];

for (const table of tables) {
  console.log(`\n📊 Table: ${table}`);
  
  // Test avec clé anon
  const { data: anonData, error: anonError } = await supabase
    .from(table)
    .select('*')
    .limit(1);
  
  if (anonError) {
    console.log(`  ❌ ANON: ${anonError.message}`);
    console.log(`  Code: ${anonError.code}`);
  } else {
    console.log(`  ✅ ANON: OK (${anonData?.length || 0} lignes)`);
  }
  
  // Test avec clé service_role
  const { data: adminData, error: adminError } = await supabaseAdmin
    .from(table)
    .select('*')
    .limit(1);
  
  if (adminError) {
    console.log(`  ❌ ADMIN: ${adminError.message}`);
  } else {
    console.log(`  ✅ ADMIN: OK (${adminData?.length || 0} lignes)`);
  }
}

console.log('\n✅ Tests terminés');
