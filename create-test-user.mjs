import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function createTestUser() {
  console.log('👤 Création d\'un utilisateur de test...\n');

  const testUser = {
    email: 'exposant@siports.com',
    password: 'Test123456!',
    type: 'exhibitor',
    name: 'Test Exposant',
    company: 'Test Company'
  };

  try {
    // 1. Créer l'utilisateur dans Auth
    console.log('📧 Création du compte Auth pour:', testUser.email);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true, // Auto-confirm l'email
      user_metadata: {
        name: testUser.name,
        type: testUser.type
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        console.log('⚠️  L\'utilisateur existe déjà. Réinitialisation du mot de passe...');
        
        // Récupérer l'utilisateur existant
        const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) throw listError;
        
        const existingUser = existingUsers.users.find(u => u.email === testUser.email);
        
        if (existingUser) {
          // Mettre à jour le mot de passe
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: testUser.password }
          );
          
          if (updateError) throw updateError;
          
          console.log('✅ Mot de passe réinitialisé !');
          console.log('\n📋 Identifiants de connexion :');
          console.log('   Email:', testUser.email);
          console.log('   Mot de passe:', testUser.password);
          console.log('\n💡 Vous pouvez maintenant vous connecter sur http://localhost:5000/login');
          return;
        }
      } else {
        throw authError;
      }
    }

    if (!authData.user) {
      throw new Error('Aucun utilisateur créé');
    }

    console.log('✅ Compte Auth créé, ID:', authData.user.id);

    // 2. Créer le profil utilisateur dans la table users
    console.log('📝 Création du profil utilisateur...');
    const { error: userError } = await supabase
      .from('users')
      .upsert([{
        id: authData.user.id,
        email: testUser.email,
        name: testUser.name,
        type: testUser.type,
        status: 'active',
        profile: {}
      }]);

    if (userError) {
      console.warn('⚠️  Erreur profil (peut-être déjà existant):', userError.message);
    } else {
      console.log('✅ Profil utilisateur créé');
    }

    // 3. Créer l'entrée exhibitor si c'est un exposant
    if (testUser.type === 'exhibitor') {
      console.log('🏢 Création de l\'exposant...');
      const { error: exhibitorError } = await supabase
        .from('exhibitors')
        .upsert([{
          user_id: authData.user.id,
          company_name: testUser.company,
          category: 'port-operations',
          sector: 'Test',
          description: 'Compte de test pour SIPORTS',
          verified: true,
          featured: false,
          contact_info: {
            email: testUser.email,
            phone: '+33123456789',
            address: 'Test Address'
          }
        }]);

      if (exhibitorError) {
        console.warn('⚠️  Erreur exposant (peut-être déjà existant):', exhibitorError.message);
      } else {
        console.log('✅ Exposant créé');
      }
    }

    console.log('\n✅ Utilisateur de test créé avec succès !');
    console.log('\n📋 Identifiants de connexion :');
    console.log('   Email:', testUser.email);
    console.log('   Mot de passe:', testUser.password);
    console.log('\n💡 Vous pouvez maintenant vous connecter sur http://localhost:5000/login');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestUser();
