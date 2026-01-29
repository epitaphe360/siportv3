import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkAccounts() {
  console.log('🔍 Vérification des comptes existants...\n');

  // Récupérer tous les comptes de test
  const { data: users, error } = await supabase
    .from('users')
    .select('email, name, type, status, partner_tier, created_at')
    .or('email.ilike.%@test.siport.com,email.ilike.%@siports.com')
    .order('type', { ascending: true })
    .order('email', { ascending: true });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️  Aucun compte de test trouvé\n');
    return;
  }

  console.log(`✅ ${users.length} comptes trouvés:\n`);

  // Grouper par type
  const byType = {
    admin: [],
    partner: [],
    exhibitor: [],
    visitor: [],
    media: []
  };

  users.forEach(user => {
    if (byType[user.type]) {
      byType[user.type].push(user);
    }
  });

  // Afficher par type
  Object.entries(byType).forEach(([type, accounts]) => {
    if (accounts.length > 0) {
      console.log(`\n📋 ${type.toUpperCase()} (${accounts.length}):`);
      console.log('─'.repeat(80));
      accounts.forEach(acc => {
        const tier = acc.partner_tier ? ` [${acc.partner_tier}]` : '';
        const status = acc.status === 'active' ? '✅' : '❌';
        console.log(`${status} ${acc.email.padEnd(40)} ${tier}`);
        console.log(`   ${acc.name || 'Sans nom'}`);
      });
    }
  });

  console.log('\n' + '═'.repeat(80));
  console.log(`\n💡 Mot de passe pour tous les comptes: Admin123!`);
  console.log(`\n⚠️  Si la connexion échoue, le compte n'existe pas dans auth.users`);
}

checkAccounts();
