import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Vérification des tables et colonnes Supabase...\n');

const tablesToCheck = {
  'users': ['id', 'email', 'name', 'type', 'visitor_level'],
  'payment_requests': ['id', 'user_id', 'status', 'amount', 'transfer_date', 'transfer_reference', 'transfer_proof_url'],
  'appointments': ['id', 'visitor_id', 'exhibitor_id', 'appointment_date', 'status'],
  'events': ['id', 'title', 'description', 'start_time', 'end_time'],
  'event_registrations': ['id', 'event_id', 'user_id', 'status'],
  'connections': ['id', 'user_id_1', 'user_id_2', 'status'],
  'messages': ['id', 'sender_id', 'receiver_id', 'content'],
  'notifications': ['id', 'user_id', 'title', 'message', 'type']
};

for (const [table, columns] of Object.entries(tablesToCheck)) {
  console.log(`\n📊 Table: ${table}`);
  
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(1);
  
  if (error) {
    console.log(`  ❌ ERREUR: ${error.message}`);
    continue;
  }
  
  console.log(`  ✅ Table accessible`);
  
  // Vérifier les colonnes
  for (const col of columns) {
    const { data: colData, error: colError } = await supabase
      .from(table)
      .select(col)
      .limit(1);
    
    if (colError) {
      console.log(`    ❌ Colonne "${col}": ${colError.message}`);
    } else {
      console.log(`    ✅ Colonne "${col}": OK`);
    }
  }
}

console.log('\n✅ Vérification terminée');
