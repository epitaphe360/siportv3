
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const TEST_USERS = {
  admin: {
    email: 'admin-test@siports.com',
    password: 'TestAdmin123!',
    role: 'admin',
    name: 'Admin Test'
  },
  visitor_free: {
    email: 'visitor-free@test.com',
    password: 'Test123456!',
    role: 'visitor',
    visitor_level: 'free',
    name: 'Visiteur Free'
  },
  visitor_premium: {
    email: 'visitor-premium@test.com',
    password: 'Test123456!',
    role: 'visitor',
    visitor_level: 'premium',
    name: 'Visiteur Premium'
  },
  exhibitor: {
    email: 'exhibitor@test.com',
    password: 'Test123456!',
    role: 'exhibitor',
    name: 'Exposant Test'
  },
  partner: {
    email: 'partner@test.com',
    password: 'Test123456!',
    role: 'partner',
    name: 'Partenaire Test'
  }
};

async function fixEnvironment() {
  console.log('🔧 Démarrage de la réparation de l\'environnement...\n');

  // 1. Création des Buckets
  console.log('📦 Vérification/Création des Buckets Storage...');
  const buckets = ['avatars', 'event-images', 'documents', 'logos'];
  
  for (const bucketName of buckets) {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    if (error && error.message.includes('not found')) {
      console.log(`  ➕ Création du bucket '${bucketName}'...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });
      if (createError) console.error(`  ❌ Erreur création bucket ${bucketName}:`, createError.message);
      else console.log(`  ✅ Bucket ${bucketName} créé.`);
    } else if (data) {
      console.log(`  ✅ Bucket '${bucketName}' existe déjà.`);
    }
  }

  // 2. Création/Réparation des utilisateurs
  console.log('\n👥 Vérification/Création des utilisateurs de test...');
  
  for (const [key, userData] of Object.entries(TEST_USERS)) {
    // Vérifier si l'utilisateur existe
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let user = users.find(u => u.email === userData.email);
    let userId = user?.id;

    if (!user) {
      console.log(`  ➕ Création de l'utilisateur ${userData.email}...`);
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.name,
          role: userData.role,
          visitor_level: userData.visitor_level
        }
      });
      
      if (createError) {
        console.error(`  ❌ Erreur création user ${userData.email}:`, createError.message);
        continue;
      }
      userId = newUser.user.id;
      console.log(`  ✅ Utilisateur créé (ID: ${userId})`);
    } else {
      console.log(`  ✅ Utilisateur ${userData.email} existe (ID: ${userId})`);
    }

    // Vérifier/Créer le profil
    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      
      if (!profile) {
        console.log(`  ➕ Création du profil pour ${userData.email}...`);
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId,
          email: userData.email,
          role: userData.role,
          full_name: userData.name,
          visitor_level: userData.visitor_level || 'free',
          created_at: new Date().toISOString()
        });
        
        if (profileError) console.error(`  ❌ Erreur création profil:`, profileError.message);
        else console.log(`  ✅ Profil créé.`);
      } else {
        console.log(`  ✅ Profil existe.`);
        // Mettre à jour le rôle si nécessaire
        if (profile.role !== userData.role) {
            console.log(`  🔄 Correction du rôle profil (${profile.role} -> ${userData.role})...`);
            await supabase.from('profiles').update({ role: userData.role }).eq('id', userId);
        }
      }
    }
  }

  console.log('\n✨ Réparation terminée.');
}

fixEnvironment();
