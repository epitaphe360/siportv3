import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function listAllExhibitors() {
  console.log('\n=== LISTE COMPLÈTE DES EXPOSANTS ===\n');
  
  const { data: exhibitors, error } = await supabase
    .from('exhibitors')
    .select('id, company_name, stand_number, stand_level, user_id, created_at')
    .order('company_name', { ascending: true });

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log(`Total: ${exhibitors.length} exposants\n`);
  
  exhibitors.forEach((expo, index) => {
    console.log(`${index + 1}. ${expo.company_name}`);
    console.log(`   ID: ${expo.id}`);
    console.log(`   Stand: ${expo.stand_number} | Niveau: ${expo.stand_level}`);
    console.log(`   User ID: ${expo.user_id}`);
    console.log(`   Créé: ${new Date(expo.created_at).toLocaleDateString('fr-FR')}`);
    console.log('');
  });
}

listAllExhibitors();
