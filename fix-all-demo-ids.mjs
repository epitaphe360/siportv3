import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

const demoAccounts = [
  {
    email: 'admin@siports.com',
    name: 'Admin SIPORTS',
    type: 'admin',
    profile: {
      role: 'super_admin',
      department: 'Administration'
    }
  },
  {
    email: 'exposant@siports.com',
    name: 'Exposant Démo',
    type: 'exhibitor',
    profile: {
      standNumber: 'A-101'
    }
  },
  {
    email: 'partenaire@siports.com',
    name: 'Partenaire Démo',
    type: 'partner',
    profile: {}
  },
  {
    email: 'visiteur@siports.com',
    name: 'Visiteur Démo',
    type: 'visitor',
    profile: {
      company: 'Visitor Company',
      interests: ['Port Management', 'Technology']
    }
  }
];

async function fixAllAccountIds() {
  console.log('🔧 Correction des IDs de tous les comptes de démonstration\n');
  console.log('='.repeat(60));

  const { data: authUsers } = await supabase.auth.admin.listUsers();

  for (const account of demoAccounts) {
    console.log(`\n👤 Traitement de ${account.email}...`);

    // Trouver l'ID Auth
    const authUser = authUsers.users.find(u => u.email === account.email);
    if (!authUser) {
      console.log(`   ⚠️  Compte non trouvé dans Auth - ignoré`);
      continue;
    }

    console.log(`   ✅ Auth ID: ${authUser.id}`);

    // Supprimer l'ancien enregistrement
    await supabase
      .from('users')
      .delete()
      .eq('email', account.email);

    // Créer le nouvel enregistrement avec le bon ID
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: authUser.id,
        email: account.email,
        name: account.name,
        type: account.type,
        profile: account.profile
      }]);

    if (insertError) {
      console.log(`   ❌ Erreur: ${insertError.message}`);
    } else {
      console.log(`   ✅ ID synchronisé avec Auth`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Tous les comptes ont été synchronisés!');
  console.log('\n💡 Vous pouvez maintenant vous connecter sur http://localhost:5000/login');
}

fixAllAccountIds();
