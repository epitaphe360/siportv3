import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDemoAccounts() {
  console.log('🔍 Vérification des comptes de démonstration...\n');

  const demoEmails = [
    'admin@siports.com',
    'exposant@siports.com',
    'partenaire@siports.com',
    'visiteur@siports.com'
  ];

  try {
    // Récupérer tous les utilisateurs
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;

    console.log('📊 Total utilisateurs dans Auth:', users.users.length);
    console.log('\n📋 Comptes de démonstration trouvés:\n');

    const foundAccounts = [];
    
    for (const email of demoEmails) {
      const user = users.users.find(u => u.email === email);
      if (user) {
        console.log(`✅ ${email} - ID: ${user.id.substring(0, 8)}...`);
        foundAccounts.push(email);
      } else {
        console.log(`❌ ${email} - NON TROUVÉ`);
      }
    }

    console.log(`\n📈 Résumé: ${foundAccounts.length}/4 comptes trouvés`);
    
    if (foundAccounts.length < 4) {
      console.log('\n💡 Lancer create-demo-accounts.mjs pour créer tous les comptes');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkDemoAccounts();
