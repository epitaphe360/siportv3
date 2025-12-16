import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables manquantes: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminTestUser() {
  const email = 'admin-test@siports.com';
  const password = 'TestAdmin123!';
  
  console.log('🔧 Création de l\'utilisateur admin de test...');
  
  try {
    // 1. Vérifier si l'utilisateur existe déjà dans auth
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erreur listage utilisateurs:', listError);
      throw listError;
    }
    
    const existingUser = users.users.find(u => u.email === email);
    let userId;
    
    if (existingUser) {
      console.log('ℹ️  Utilisateur auth existe déjà:', existingUser.id);
      userId = existingUser.id;
    } else {
      // Créer l'utilisateur auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name: 'Admin Test',
          type: 'admin'
        }
      });

      if (authError) throw authError;
      
      console.log(`✅ Utilisateur auth créé: ${authData.user.id}`);
      userId = authData.user.id;
    }
    
    // 2. Créer/mettre à jour le profil dans users
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: email,
        name: 'Admin Test',
        type: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'Test',
          phone: '+33600000000',
          company: 'SIPORTS',
          position: 'Administrateur'
        }
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('❌ Erreur création profil:', profileError);
      throw profileError;
    }

    console.log('✅ Profil admin créé/mis à jour dans la table users');
    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Type: admin');
    console.log('🆔 ID:', userId);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

createAdminTestUser();
