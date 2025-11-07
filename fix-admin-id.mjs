import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixAdminId() {
  console.log('🔧 Correction de l\'ID du compte admin\n');

  // Récupérer l'ID Auth
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const adminAuth = authUsers.users.find(u => u.email === 'admin@siports.com');
  
  if (!adminAuth) {
    console.error('❌ Compte admin non trouvé dans Auth');
    return;
  }

  console.log(`✅ Auth ID trouvé: ${adminAuth.id}`);

  // Supprimer l'ancien enregistrement dans users
  console.log('\n1️⃣ Suppression de l\'ancien enregistrement users...');
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('email', 'admin@siports.com');

  if (deleteError) {
    console.error('   ❌ Erreur suppression:', deleteError.message);
  } else {
    console.log('   ✅ Ancien enregistrement supprimé');
  }

  // Créer le bon enregistrement avec l'ID Auth
  console.log('\n2️⃣ Création du nouvel enregistrement avec le bon ID...');
  const { error: insertError } = await supabase
    .from('users')
    .insert([{
      id: adminAuth.id,
      email: 'admin@siports.com',
      name: 'Admin SIPORTS',
      type: 'admin',
      profile: {
        role: 'super_admin',
        department: 'Administration'
      }
    }]);

  if (insertError) {
    console.error('   ❌ Erreur création:', insertError.message);
  } else {
    console.log('   ✅ Enregistrement créé avec succès');
  }

  // Vérification
  console.log('\n3️⃣ Vérification finale...');
  const { data: checkData, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('email', 'admin@siports.com')
    .single();

  if (checkError) {
    console.error('   ❌ Erreur vérification:', checkError.message);
  } else {
    console.log('   ✅ Vérification OK');
    console.log(`   ID: ${checkData.id}`);
    console.log(`   Email: ${checkData.email}`);
    console.log(`   Name: ${checkData.name}`);
    console.log(`   Type: ${checkData.type}`);
    console.log(`   ✅ L'ID correspond maintenant à Auth!`);
  }
}

fixAdminId();
