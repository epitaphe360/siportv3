import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 Ajout de la colonne appointment_date à appointments...');

const { data, error } = await supabase
  .from('appointments')
  .select('appointment_date')
  .limit(1);

if (error && error.message.includes('appointment_date')) {
  console.log('❌ Colonne manquante détectée, tentative d\'ajout...');
  
  const sql = `
    ALTER TABLE appointments 
    ADD COLUMN IF NOT EXISTS appointment_date date;
  `;
  
  const { error: alterError } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (alterError) {
    console.error('❌ Erreur:', alterError.message);
    console.log('\n📋 Exécutez ce SQL manuellement dans Supabase SQL Editor:');
    console.log(sql);
  } else {
    console.log('✅ Colonne appointment_date ajoutée avec succès!');
  }
} else {
  console.log('✅ La colonne appointment_date existe déjà!');
}
