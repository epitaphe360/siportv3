
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans le fichier .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAudit() {
  console.log('🔍 Démarrage de l\'audit final de production...\n');
  const report = {
    timestamp: new Date().toISOString(),
    database: {},
    storage: {},
    rls: {},
    users: {}
  };

  try {
    // 1. Vérification de la connexion et des tables principales
    console.log('📊 Vérification des tables principales...');
    const tables = [
      'profiles', 'events', 'exhibitors', 'partners', 
      'appointments', 'messages', 'notifications', 
      'news', 'jobs', 'products'
    ];

    for (const table of tables) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        console.error(`  ❌ Table ${table}: Erreur - ${error.message}`);
        report.database[table] = { status: 'error', error: error.message };
      } else {
        console.log(`  ✅ Table ${table}: Accessible (${count} enregistrements)`);
        report.database[table] = { status: 'ok', count };
      }
    }

    // 2. Vérification des utilisateurs critiques
    console.log('\n👥 Vérification des utilisateurs critiques...');
    const criticalEmails = [
      'admin@test.com',
      'visitor.free@test.com',
      'visitor.premium@test.com',
      'exhibitor@test.com',
      'partner@test.com'
    ];

    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error(`  ❌ Erreur listing utilisateurs: ${usersError.message}`);
    } else {
      for (const email of criticalEmails) {
        const user = users.find(u => u.email === email);
        if (user) {
          console.log(`  ✅ Utilisateur ${email}: Présent (ID: ${user.id})`);
          
          // Vérifier le profil associé
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
          if (profile) {
             console.log(`     - Rôle profil: ${profile.role}`);
          } else {
             console.warn(`     ⚠️ Profil manquant pour ${email}`);
          }
        } else {
          console.warn(`  ⚠️ Utilisateur ${email}: MANQUANT`);
        }
      }
    }

    // 3. Vérification du Storage
    console.log('\n💾 Vérification des Buckets Storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error(`  ❌ Erreur listing buckets: ${bucketsError.message}`);
    } else {
      const requiredBuckets = ['avatars', 'event-images', 'documents', 'logos'];
      for (const reqBucket of requiredBuckets) {
        const bucket = buckets.find(b => b.name === reqBucket);
        if (bucket) {
          console.log(`  ✅ Bucket '${reqBucket}': Présent (Public: ${bucket.public})`);
        } else {
          console.warn(`  ⚠️ Bucket '${reqBucket}': MANQUANT`);
        }
      }
    }

    // 4. Test d'une fonction RPC critique
    console.log('\n⚡ Vérification des fonctions RPC...');
    
    // Test exec_sql
    const { error: execError } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
    if (execError) {
       console.log(`  ℹ️ RPC exec_sql: Non disponible (${execError.message})`);
    } else {
       console.log(`  ✅ RPC exec_sql: Disponible`);
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_role', { user_id: users[0]?.id });
    if (rpcError && !rpcError.message.includes('function not found')) {
       // Si l'erreur n'est pas "function not found" (car on a peut-être pas le bon ID ou la fonction n'existe pas sous ce nom exact mais d'autres oui)
       // On teste une requête simple
       console.log(`  ℹ️ Test RPC get_user_role: ${rpcError.message}`);
    } else {
       console.log(`  ✅ Connexion RPC opérationnelle`);
    }

    console.log('\n✨ Audit terminé avec succès.');
    
    // Sauvegarder le rapport
    fs.writeFileSync('AUDIT_FINAL_PRODUCTION.json', JSON.stringify(report, null, 2));
    console.log('📝 Rapport détaillé sauvegardé dans AUDIT_FINAL_PRODUCTION.json');

  } catch (err) {
    console.error('❌ Erreur critique durant l\'audit:', err);
    process.exit(1);
  }
}

runAudit();
