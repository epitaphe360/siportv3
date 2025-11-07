import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function checkAdminUser() {
  console.log('🔍 Vérification du compte admin@siports.com\n');

  // Vérifier dans Auth
  console.log('1️⃣ Vérification dans Auth.users:');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('   ❌ Erreur Auth:', authError);
  } else {
    const adminAuthUsers = authUsers.users.filter(u => u.email === 'admin@siports.com');
    console.log(`   Trouvé ${adminAuthUsers.length} utilisateur(s) Auth`);
    adminAuthUsers.forEach((u, i) => {
      console.log(`   [${i + 1}] ID: ${u.id}`);
      console.log(`       Email: ${u.email}`);
      console.log(`       Created: ${u.created_at}`);
      console.log(`       Email confirmed: ${u.email_confirmed_at ? 'Oui' : 'Non'}`);
    });
  }

  // Vérifier dans la table users
  console.log('\n2️⃣ Vérification dans table users:');
  const { data: dbUsers, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@siports.com');

  if (dbError) {
    console.error('   ❌ Erreur DB:', dbError);
  } else {
    console.log(`   Trouvé ${dbUsers.length} utilisateur(s) dans la table`);
    dbUsers.forEach((u, i) => {
      console.log(`   [${i + 1}] ID: ${u.id}`);
      console.log(`       Email: ${u.email}`);
      console.log(`       Name: ${u.name}`);
      console.log(`       Type: ${u.type}`);
    });
  }

  // Test de connexion
  console.log('\n3️⃣ Test de connexion:');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@siports.com',
    password: 'Admin123!'
  });

  if (loginError) {
    console.error('   ❌ Échec de connexion:', loginError.message);
  } else {
    console.log('   ✅ Connexion réussie!');
    console.log(`   User ID: ${loginData.user.id}`);
  }
}

checkAdminUser();
