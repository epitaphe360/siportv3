import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante dans le fichier .env');
  console.error('Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Utiliser la clé service_role pour les migrations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('🚀 Exécution de la migration pour créer la table news...\n');

  try {
    // Lire le fichier SQL de migration
    const migrationPath = path.join(process.cwd(), 'scripts', 'create-news-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration SQL chargée depuis:', migrationPath);
    console.log('🔧 Exécution de la migration...\n');

    // Exécuter la migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la migration:', error.message);

      // Essayer une approche alternative en exécutant les commandes une par une
      console.log('🔄 Tentative d\'exécution commande par commande...\n');

      const commands = migrationSQL.split(';').filter(cmd => cmd.trim().length > 0);

      for (const command of commands) {
        if (command.trim()) {
          try {
            console.log(`⚡ Exécution: ${command.trim().substring(0, 50)}...`);
            const { error: cmdError } = await supabase.rpc('exec_sql', {
              sql: command.trim()
            });

            if (cmdError) {
              console.error(`❌ Erreur commande: ${cmdError.message}`);
            } else {
              console.log(`✅ Commande exécutée avec succès`);
            }
          } catch (cmdErr) {
            console.error(`❌ Exception commande: ${cmdErr.message}`);
          }
        }
      }
    } else {
      console.log('✅ Migration exécutée avec succès!');
      console.log('📊 Résultat:', data);
    }

    // Vérifier si la table a été créée
    console.log('\n🔍 Vérification de la création de la table...');
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'news');

    if (checkError) {
      console.error('❌ Erreur vérification table:', checkError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ Table news créée avec succès!');
    } else {
      console.log('⚠️ Table news introuvable - vérification manuelle recommandée');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    console.error('Stack trace:', error.stack);
  }
}

runMigration();
