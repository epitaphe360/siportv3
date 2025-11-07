import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkPartnersSchema() {
  console.log('🔍 Vérification de la structure de la table partners...\n');

  // Test 1: Vérifier si la table existe
  const { data: partners, error: selectError } = await supabase
    .from('partners')
    .select('*')
    .limit(1);

  console.log('Erreur SELECT *:', selectError);
  
  if (partners && partners.length > 0) {
    console.log('\n✅ Table partners existe avec des données');
    console.log('Colonnes disponibles:', Object.keys(partners[0]));
    console.log('\nPremier enregistrement:', JSON.stringify(partners[0], null, 2));
  } else if (!selectError) {
    console.log('\n⚠️  Table partners existe mais est vide');
  } else {
    console.log('\n❌ Problème avec la table partners');
  }

  // Test 2: Compter les partenaires
  const { count, error: countError } = await supabase
    .from('partners')
    .select('*', { count: 'exact', head: true });

  console.log('\n📊 Nombre de partenaires:', count);
  console.log('Erreur COUNT:', countError);
}

checkPartnersSchema();
