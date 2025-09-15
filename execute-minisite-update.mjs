import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Les variables d\'environnement Supabase ne sont pas définies.');
  console.error('Assurez-vous d\'avoir défini VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY dans votre fichier .env');
  process.exit(1);
}

// Créer le client Supabase avec la clé de service (admin rights)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🔄 Mise à jour directe des mini-sites en SQL...');
  
  try {
    // Lire le contenu du fichier SQL
    const sqlContent = fs.readFileSync('update-mini-sites-direct.sql', 'utf8');
    
    // Exécuter le SQL via supabase REST API
    const { data, error } = await supabase.rpc('pg_execute', { command: sqlContent });
    
    if (error) {
      console.error('❌ Erreur lors de l\'exécution du SQL:', error);
      return;
    }
    
    console.log('✅ SQL exécuté avec succès');
    console.log('Résultat:', data);
    
    // Vérifier les sections mises à jour
    console.log('\n📊 Vérification des mini-sites mis à jour...');
    const { data: miniSites, error: getMiniSitesError } = await supabase
      .from('mini_sites')
      .select('id, sections')
      .limit(5);
    
    if (getMiniSitesError) {
      console.error('❌ Erreur lors de la récupération des mini-sites:', getMiniSitesError);
      return;
    }
    
    console.log(`📊 ${miniSites.length} mini-sites trouvés`);
    
    for (const miniSite of miniSites) {
      const sections = miniSite.sections || [];
      const sectionTypes = sections.map(s => s.type);
      
      console.log(`🏢 Mini-site ${miniSite.id} contient ${sections.length} sections: ${sectionTypes.join(', ')}`);
    }
    
    console.log('\n🎉 Opération terminée !');
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

main();
