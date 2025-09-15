import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Récupérer le chemin du répertoire courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger le fichier SQL de migration
const migrationFile = path.join(__dirname, 'supabase/migrations/20250915000002_news_and_minisite_public_access.sql');

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

async function applyMigration() {
  try {
    console.log('🔄 Lecture du fichier de migration SQL...');
    const sqlContent = fs.readFileSync(migrationFile, 'utf8');
    console.log('✅ Fichier SQL chargé avec succès !');
    
    console.log('🚀 Application de la migration SQL directement via l\'API Supabase...');
    
    // Exécuter le SQL
    const { error } = await supabase.rpc('pgtle_admin_execute_sql_scripts', { 
      sql_script: sqlContent 
    });
    
    if (error) {
      console.error('❌ Erreur lors de l\'application de la migration:', error);
      
      // Essayer une autre approche si la première échoue
      console.log('🔄 Tentative d\'exécution avec requête SQL brute...');
      
      // Diviser le script en commandes individuelles
      const commands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i].trim() + ';';
        
        try {
          const { error } = await supabase.rpc('pg_execute', { 
            query: command 
          });
          
          if (error) {
            console.error(`❌ Erreur lors de l'exécution de la commande #${i+1}:`, error.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`❌ Exception lors de l'exécution de la commande #${i+1}:`, err.message);
          errorCount++;
        }
      }
      
      console.log(`📊 Résultats: ${successCount} commandes réussies, ${errorCount} commandes échouées`);
      
      if (errorCount > 0) {
        console.log('\n📝 INSTRUCTIONS POUR APPLIQUER MANUELLEMENT LA MIGRATION:');
        console.log('============================================');
        console.log('1. Allez à https://supabase.com/dashboard');
        console.log('2. Sélectionnez votre projet SIPORTS');
        console.log('3. Allez dans l\'onglet "SQL Editor"');
        console.log('4. Cliquez sur "New Query"');
        console.log('5. Copiez-collez tout le contenu ci-dessous:');
        console.log('============================================');
        console.log('\n--- DÉBUT DU SQL À COPIER ---');
        console.log(sqlContent);
        console.log('--- FIN DU SQL ---');
        console.log('\n============================================');
        console.log('6. Cliquez sur "Run" pour exécuter la migration');
      }
    } else {
      console.log('✅ Migration SQL appliquée avec succès !');
    }
    
    // Vérifier les politiques
    console.log('\n🔍 Vérification des politiques pour les tables principales...');
    
    const tables = ['news_articles', 'products', 'mini_sites'];
    
    for (const table of tables) {
      try {
        console.log(`\n📋 Politiques pour la table "${table}":`);
        
        const { data, error } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', table);
        
        if (error) {
          console.error(`❌ Erreur lors de la récupération des politiques pour ${table}:`, error);
        } else if (!data || data.length === 0) {
          console.log(`⚠️ Aucune politique trouvée pour la table "${table}"`);
        } else {
          data.forEach(policy => {
            console.log(`- Politique "${policy.policyname}": ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}, ${policy.cmd}, ${policy.roles.join(', ')}`);
          });
        }
      } catch (err) {
        console.error(`❌ Exception lors de la vérification des politiques pour ${table}:`, err);
      }
    }
    
    console.log('\n✨ Processus de migration terminé !');
    console.log('N\'oubliez pas de redémarrer votre application pour voir les changements.');
  } catch (error) {
    console.error('❌ Erreur lors de l\'application de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
applyMigration();
