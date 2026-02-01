import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

console.log(`
================================================================================
🔍 VÉRIFICATION RÉELLE DES DONNÉES PARTENAIRES
================================================================================
`);

// Vérifier les 5 premiers partenaires et les 5 derniers
const { data: partners } = await supabase
  .from('partners')
  .select('*')
  .order('created_at')
  .limit(10);

console.log(`\n📊 Vérification de ${partners.length} partenaires:\n`);

partners.forEach((p, i) => {
  console.log(`\n${i + 1}. ${p.company_name}`);
  console.log(`   ID: ${p.id}`);
  console.log(`   Secteur: ${p.sector || '❌ VIDE'}`);
  console.log(`   Type: ${p.partner_type || '❌ VIDE'}`);
  console.log(`   Description: ${p.description ? '✅ Oui' : '❌ Non'}`);
  console.log(`   Expertise: ${p.expertise && p.expertise.length > 0 ? `✅ ${p.expertise.join(', ')}` : '❌ VIDE'}`);
  console.log(`   Certifications: ${p.certifications && p.certifications.length > 0 ? `✅ ${p.certifications.join(', ')}` : '❌ VIDE'}`);
  console.log(`   Employees: ${p.employees || '❌ VIDE'}`);
  console.log(`   Established: ${p.established_year || '❌ VIDE'}`);
  console.log(`   Email: ${p.contact_info?.email || '❌ VIDE'}`);
  console.log(`   Phone: ${p.contact_info?.phone || '❌ VIDE'}`);
  console.log(`   Logo: ${p.logo_url ? '✅ Oui' : '❌ Non'}`);
  console.log(`   Verified: ${p.verified ? '✅ Oui' : '❌ Non'}`);
});

console.log(`
================================================================================
`);
