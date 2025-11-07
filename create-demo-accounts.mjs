import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

const demoAccounts = [
  {
    email: 'admin@siports.com',
    password: 'Admin123!',
    type: 'admin',
    name: 'Admin SIPORTS',
    profile: {
      role: 'super_admin',
      department: 'Administration'
    }
  },
  {
    email: 'exposant@siports.com',
    password: 'Expo123!',
    type: 'exhibitor',
    name: 'Exposant Démo',
    company: 'Demo Exhibitor Company',
    profile: {
      standNumber: 'A-101'
    }
  },
  {
    email: 'partenaire@siports.com',
    password: 'Partner123!',
    type: 'partner',
    name: 'Partenaire Démo',
    company: 'Demo Partner Company',
    profile: {}
  },
  {
    email: 'visiteur@siports.com',
    password: 'Visit123!',
    type: 'visitor',
    name: 'Visiteur Démo',
    profile: {
      company: 'Visitor Company',
      interests: ['Port Management', 'Technology']
    }
  }
];

async function createOrUpdateAccount(account) {
  console.log(`\n👤 Traitement de ${account.email}...`);

  try {
    // Vérifier si l'utilisateur existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === account.email);

    let userId;

    if (existingUser) {
      console.log('   ⚠️  Compte existant - Mise à jour du mot de passe');
      userId = existingUser.id;
      
      // Mettre à jour le mot de passe
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: account.password }
      );
      
      if (updateError) throw updateError;
      console.log('   ✅ Mot de passe mis à jour');
    } else {
      console.log('   📧 Création du compte Auth');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          name: account.name,
          type: account.type
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Aucun utilisateur créé');
      
      userId = authData.user.id;
      console.log('   ✅ Compte Auth créé');
    }

    // Créer/Mettre à jour le profil utilisateur
    console.log('   📝 Mise à jour du profil utilisateur');
    const { error: userError } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        email: account.email,
        name: account.name,
        type: account.type,
        profile: account.profile
      }], { onConflict: 'id' });

    if (userError && !userError.message.includes('duplicate')) {
      console.warn('   ⚠️  Erreur profil:', userError.message);
    } else {
      console.log('   ✅ Profil utilisateur mis à jour');
    }

    // Créer les entrées spécifiques selon le type
    if (account.type === 'exhibitor') {
      console.log('   🏢 Mise à jour de l\'exposant');
      const { error: exhibitorError } = await supabase
        .from('exhibitors')
        .upsert([{
          user_id: userId,
          company_name: account.company,
          category: 'port-operations',
          sector: 'Demo',
          description: 'Compte de démonstration pour SIPORTS',
          verified: true,
          featured: false,
          contact_info: {
            email: account.email,
            phone: '+33123456789',
            address: 'Demo Address'
          }
        }], { onConflict: 'user_id' });

      if (exhibitorError && !exhibitorError.message.includes('duplicate')) {
        console.warn('   ⚠️  Erreur exposant:', exhibitorError.message);
      } else {
        console.log('   ✅ Exposant mis à jour');
      }
    }

    if (account.type === 'partner') {
      console.log('   🤝 Mise à jour du partenaire');
      const { error: partnerError } = await supabase
        .from('partners')
        .upsert([{
          user_id: userId,
          company_name: account.company,
          partner_type: 'gold',
          sector: 'Demo',
          description: 'Compte de démonstration pour SIPORTS',
          verified: true,
          featured: false,
          partnership_level: 'gold',
          contact_info: {
            email: account.email,
            phone: '+33123456789',
            country: 'France'
          }
        }], { onConflict: 'user_id' });

      if (partnerError && !partnerError.message.includes('duplicate')) {
        console.warn('   ⚠️  Erreur partenaire:', partnerError.message);
      } else {
        console.log('   ✅ Partenaire mis à jour');
      }
    }

    return true;

  } catch (error) {
    console.error(`   ❌ Erreur pour ${account.email}:`, error.message);
    return false;
  }
}

async function createAllDemoAccounts() {
  console.log('🎯 Création/Mise à jour des 4 comptes de démonstration\n');
  console.log('='.repeat(60));

  let successCount = 0;

  for (const account of demoAccounts) {
    const success = await createOrUpdateAccount(account);
    if (success) successCount++;
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ ${successCount}/4 comptes créés/mis à jour avec succès !`);
  
  console.log('\n📋 IDENTIFIANTS DE CONNEXION :\n');
  demoAccounts.forEach(account => {
    console.log(`${account.type.toUpperCase().padEnd(12)} | ${account.email.padEnd(25)} | ${account.password}`);
  });

  console.log('\n💡 Tous les comptes sont actifs et prêts à être utilisés sur http://localhost:5000/login');
}

createAllDemoAccounts();
