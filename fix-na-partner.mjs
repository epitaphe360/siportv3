import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const { data: naPartners } = await supabase
  .from('partners')
  .select('*')
  .eq('company_name', null)
  .or('company_name.eq.N/A')
  .limit(1);

if (naPartners && naPartners.length > 0) {
  const partner = naPartners[0];
  console.log(`Partenaire trouvé: ${JSON.stringify(partner, null, 2)}`);

  const { error } = await supabase
    .from('partners')
    .update({ company_name: 'Port Solutions International' })
    .eq('id', partner.id);

  if (error) {
    console.error('Erreur:', error);
  } else {
    console.log('✅ Partenaire corrigé !');
  }
} else {
  console.log('Aucun partenaire N/A trouvé');
}
