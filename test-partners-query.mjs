import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function testPartnersQuery() {
  console.log('🧪 Test de la requête partners du service...\n');

  // Requête exacte du service (corrigée)
  const { data, error } = await supabase
    .from('partners')
    .select(
      `id, company_name, partner_type, sector, description, logo_url, website, verified, featured, contact_info, partnership_level, contract_value, benefits`
    )
    .order('partner_type');

  console.log('Erreur:', error);
  console.log('Nombre de résultats:', data?.length || 0);
  
  if (data && data.length > 0) {
    console.log('\n✅ Requête réussie !');
    console.log('Premier partenaire:', JSON.stringify(data[0], null, 2));
  } else if (!error) {
    console.log('\n⚠️  Aucun partenaire dans la base de données');
    console.log('Il faut importer des données de test');
  }
}

testPartnersQuery();
