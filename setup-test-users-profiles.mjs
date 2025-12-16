import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('🚀 Création des profils utilisateurs de test...\n');

  // 1. Lister tous les utilisateurs dans auth
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Erreur listage:', listError.message);
    process.exit(1);
  }

  console.log(`📋 ${users.length} utilisateurs trouvés dans auth\n`);

  // 2. Créer les profils pour les utilisateurs de test
  const testEmails = [
    'visitor-free@test.com',
    'visitor-premium@test.com',
    'exhibitor@test.com',
    'partner@test.com',
    'admin-test@siports.com'
  ];

  const testUserData = {
    'visitor-free@test.com': { type: 'visitor', name: 'Visiteur Free', visitor_level: 'free' },
    'visitor-premium@test.com': { type: 'visitor', name: 'Visiteur Premium', visitor_level: 'premium' },
    'exhibitor@test.com': { type: 'exhibitor', name: 'Exposant Test', visitor_level: null },
    'partner@test.com': { type: 'partner', name: 'Partenaire Test', visitor_level: null },
    'admin-test@siports.com': { type: 'admin', name: 'Admin Test', visitor_level: null }
  };

  for (const email of testEmails) {
    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      console.log(`⚠️  ${email} n'existe pas dans auth - création ignorée`);
      continue;
    }

    const userData = testUserData[email];
    console.log(`👤 Création profil pour ${email} (ID: ${authUser.id})...`);

    const { error } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: email,
        name: userData.name,
        type: userData.type,
        profile: {},
        visitor_level: userData.visitor_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error(`  ❌ Erreur:`, error.message);
    } else {
      console.log(`  ✅ Profil créé/mis à jour\n`);
    }
  }

  console.log('✅ Terminé !');
  process.exit(0);
}

main();
