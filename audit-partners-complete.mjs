import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

async function auditPartners() {
  console.log(`
================================================================================
🔍 AUDIT COMPLET DES PROFILS PARTENAIRES
================================================================================

Connexion à Supabase...
`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: partners, error: fetchError } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ Erreur:', fetchError);
    return;
  }

  console.log(`✅ ${partners.length} partenaire(s) trouvé(s)\n`);

  let completeCount = 0;
  const incomplete = [];

  for (let i = 0; i < partners.length; i++) {
    const p = partners[i];
    const requiredFields = {
      company_name: p.company_name,
      description: p.description,
      email: p.contact_info?.email,
      phone: p.contact_info?.phone,
      sector: p.sector,
      partner_type: p.partner_type,
      employees: p.employees,
      established_year: p.established_year,
      expertise: p.expertise?.length > 0 ? p.expertise : null,
      certifications: p.certifications?.length > 0 ? p.certifications : null,
      verified: p.verified
    };

    const allComplete = Object.values(requiredFields).every(v => v !== null && v !== undefined && v !== '');
    const fields = Object.entries(requiredFields);
    const completedFields = fields.filter(([_, v]) => v !== null && v !== undefined && v !== '').length;

    console.log(`\n${i + 1}. ${p.company_name || 'N/A'}`);
    console.log(`   Statut: ${allComplete ? '✅ COMPLET' : '⚠️  INCOMPLET'}`);
    console.log(`   Complétude: ${completedFields}/${fields.length} champs`);
    
    if (!allComplete) {
      const missing = fields
        .filter(([_, v]) => v === null || v === undefined || v === '')
        .map(([k]) => k);
      console.log(`   Manquants: ${missing.join(', ')}`);
      incomplete.push({
        name: p.company_name || 'N/A',
        id: p.id,
        missing: missing
      });
    } else {
      completeCount++;
    }
  }

  const completionRate = Math.round((completeCount / partners.length) * 100);

  console.log(`
📈 RÉSUMÉ:
   ✅ Partenaires COMPLETS: ${completeCount}/${partners.length}
   ⚠️  Partenaires INCOMPLETS: ${partners.length - completeCount}/${partners.length}
   📊 Taux de complétude: ${completionRate}%

================================================================================
`);

  if (incomplete.length > 0 && incomplete.length <= 5) {
    console.log('💡 À COMPLÉTER:');
    incomplete.forEach(p => {
      console.log(`   • ${p.name} - Manque: ${p.missing.join(', ')}`);
    });
  }
}

auditPartners();
