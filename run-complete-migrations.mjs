import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔧 Exécution des migrations pour compléter la base de données...\n');

const sql = fs.readFileSync('complete-database-setup.sql', 'utf8');

// Diviser en requêtes individuelles (en utilisant les lignes vides comme séparateurs)
const queries = sql
  .split(/;\s*\n/)
  .filter(q => q.trim() && !q.trim().startsWith('--'))
  .map(q => q.trim() + ';');

let successCount = 0;
let errorCount = 0;

for (let i = 0; i < queries.length; i++) {
  const query = queries[i];
  if (!query || query === ';') continue;
  
  console.log(`\nExécution requête ${i + 1}/${queries.length}...`);
  
  const { error } = await supabase.rpc('exec_sql', { sql_query: query });
  
  if (error) {
    console.log(`  ❌ Erreur: ${error.message}`);
    errorCount++;
    // Continue même en cas d'erreur (table peut déjà exister)
  } else {
    console.log(`  ✅ OK`);
    successCount++;
  }
}

console.log(`\n📊 Résumé: ${successCount} réussies, ${errorCount} erreurs`);
console.log('\n✅ Migration terminée!');
console.log('\n💡 Si des erreurs persistent, exécutez le SQL manuellement dans Supabase SQL Editor.');
