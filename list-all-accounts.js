import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function listAllAccounts() {
  const { data: users, error } = await supabase
    .from('users')
    .select('email, name, type, status, partner_tier')
    .or('email.ilike.%@test.siport.com,email.ilike.%@siports.com')
    .eq('status', 'active')
    .order('type', { ascending: true })
    .order('email', { ascending: true });

  if (error) {
    console.error('❌ Erreur:', error);
    return;
  }

  console.log('\n🔑 TOUS LES COMPTES ACTIFS (Mot de passe: Admin123!)\n');
  console.log('═'.repeat(100));
  
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

  // ADMIN
  if (byType.admin.length > 0) {
    console.log('\n👑 ADMINISTRATEURS (' + byType.admin.length + ')');
    console.log('─'.repeat(100));
    byType.admin.forEach(acc => {
      console.log(`Email: ${acc.email.padEnd(45)} | Mot de passe: Admin123!`);
    });
  }

  // PARTNERS
  if (byType.partner.length > 0) {
    console.log('\n🤝 PARTENAIRES (' + byType.partner.length + ')');
    console.log('─'.repeat(100));
    byType.partner.forEach(acc => {
      const tier = acc.partner_tier ? `[${acc.partner_tier}]` : '';
      console.log(`Email: ${acc.email.padEnd(45)} | Mot de passe: Admin123! ${tier}`);
    });
  }

  // EXHIBITORS
  if (byType.exhibitor.length > 0) {
    console.log('\n🏢 EXPOSANTS (' + byType.exhibitor.length + ')');
    console.log('─'.repeat(100));
    byType.exhibitor.forEach(acc => {
      console.log(`Email: ${acc.email.padEnd(45)} | Mot de passe: Admin123!`);
    });
  }

  // VISITORS
  if (byType.visitor.length > 0) {
    console.log('\n👥 VISITEURS (' + byType.visitor.length + ')');
    console.log('─'.repeat(100));
    byType.visitor.forEach(acc => {
      console.log(`Email: ${acc.email.padEnd(45)} | Mot de passe: Admin123!`);
    });
  }

  console.log('\n' + '═'.repeat(100));
  console.log(`\n📊 TOTAL: ${users.length} comptes actifs`);
  console.log('🔐 Mot de passe unique pour tous: Admin123!\n');
}

listAllAccounts();
