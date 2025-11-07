import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function debugExhibitors() {
  console.log('🔍 Debug des exposants...\n');

  // Test 1: Requête simple
  console.log('📊 Test 1: SELECT simple');
  const { data: simple, error: simpleError } = await supabase
    .from('exhibitors')
    .select('id, company_name, verified')
    .limit(3);

  console.log('Erreur:', simpleError);
  console.log('Résultats:', simple?.length || 0);
  if (simple) console.log('Premier:', simple[0]);

  // Test 2: Requête complète comme le service (CORRIGÉE avec toutes les FK)
  console.log('\n📊 Test 2: SELECT complet comme le service');
  const { data: full, error: fullError } = await supabase
    .from('exhibitors')
    .select(`
      id,
      user_id,
      company_name,
      category,
      sector,
      description,
      logo_url,
      website,
      verified,
      featured,
      contact_info,
      products:products!products_exhibitor_id_fkey(id, exhibitor_id, name, description, category, images, specifications, price, featured),
      mini_site:mini_sites!mini_sites_exhibitor_id_fkey(theme, custom_colors, sections, published, views, last_updated),
      user:users!exhibitors_user_id_fkey(profile)
    `)
    .limit(2);

  console.log('Erreur:', fullError);
  console.log('Résultats:', full?.length || 0);
  
  if (full && full.length > 0) {
    console.log('\n✅ Requête réussie !');
    console.log('Premier exposant (brut):', JSON.stringify(full[0], null, 2));
  } else if (fullError) {
    console.log('\n❌ Erreur détectée');
  } else {
    console.log('\n⚠️  Aucune donnée retournée');
  }
}

debugExhibitors();
