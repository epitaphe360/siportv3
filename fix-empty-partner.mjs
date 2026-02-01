import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Trouver les partenaires avec company_name vide
const { data: allPartners } = await supabase
  .from('partners')
  .select('id,company_name')
  .order('created_at');

console.log('Partenaires:');
allPartners.forEach((p, i) => {
  console.log(`${i + 1}. ID: ${p.id} | Nom: "${p.company_name}"`);
});

// Trouver celui qui est vide
const emptyPartner = allPartners.find(p => !p.company_name || p.company_name === 'N/A' || p.company_name.trim() === '');
if (emptyPartner) {
  console.log(`\nCorriger le partenaire: ${emptyPartner.id}`);
  const { error } = await supabase
    .from('partners')
    .update({ company_name: 'Port Solutions International' })
    .eq('id', emptyPartner.id);

  if (error) {
    console.error('❌ Erreur:', error);
  } else {
    console.log('✅ Partenaire corrigé !');
  }
}
