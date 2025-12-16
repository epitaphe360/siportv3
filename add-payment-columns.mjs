import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 Ajout des colonnes manquantes à payment_requests...');

// Vérifier d'abord si les colonnes existent
const { data: existingData, error: checkError } = await supabase
  .from('payment_requests')
  .select('transfer_date, transfer_reference, transfer_proof_url')
  .limit(1);

if (checkError && checkError.message.includes('column')) {
  console.log('❌ Colonnes manquantes détectées');
  
  // Exécuter l'ALTER TABLE via SQL direct
  const sql = `
    ALTER TABLE payment_requests 
    ADD COLUMN IF NOT EXISTS transfer_date timestamptz,
    ADD COLUMN IF NOT EXISTS transfer_reference text,
    ADD COLUMN IF NOT EXISTS transfer_proof_url text;
  `;
  
  const { error: alterError } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (alterError) {
    console.error('❌ Erreur lors de l\'ajout des colonnes:', alterError.message);
    console.log('\n📋 Veuillez exécuter ce SQL manuellement dans Supabase SQL Editor:');
    console.log(sql);
  } else {
    console.log('✅ Colonnes ajoutées avec succès!');
  }
} else {
  console.log('✅ Les colonnes existent déjà!');
}
