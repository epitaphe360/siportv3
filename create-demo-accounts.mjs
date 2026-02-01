import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const accounts = [
  { email: 'visitor-free@test.siport.com', password: 'Test123456!', type: 'visitor' },
  { email: 'visitor-vip@test.siport.com', password: 'Test123456!', type: 'visitor' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Test123456!', type: 'exhibitor' },
  { email: 'exhibitor-18m@test.siport.com', password: 'Test123456!', type: 'exhibitor' },
  { email: 'exhibitor-36m@test.siport.com', password: 'Test123456!', type: 'exhibitor' },
  { email: 'exhibitor-54m@test.siport.com', password: 'Test123456!', type: 'exhibitor' },
  { email: 'demo.partner@siports.com', password: 'Test123456!', type: 'partner' },
  { email: 'partner-silver@test.siport.com', password: 'Test123456!', type: 'partner' },
  { email: 'partner-gold@test.siport.com', password: 'Test123456!', type: 'partner' },
  { email: 'partner-platinum@test.siport.com', password: 'Test123456!', type: 'partner' },
  { email: 'admin@siports.com', password: 'Test123456!', type: 'admin' }
];

async function createAccounts() {
  console.log('🔐 Création des comptes de démonstration...\n');

  for (const account of accounts) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true
      });

      if (error) {
        console.log(`❌ ${account.email}: ${error.message}`);
      } else {
        console.log(`✅ ${account.email} créé (ID: ${data.user.id})`);
      }
    } catch (err) {
      console.log(`⚠️ ${account.email}: ${err.message}`);
    }
  }

  console.log('\n✨ Création terminée!');
}

createAccounts().catch(console.error);
