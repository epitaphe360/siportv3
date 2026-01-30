import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkExhibitorLogos() {
  console.log('\n🔍 Vérification des logos exposants...\n');

  // Vérifier table exhibitors
  const { data: exhibitors, error: exhError } = await supabase
    .from('exhibitors')
    .select('id, company_name, logo_url')
    .limit(10);

  if (!exhError && exhibitors && exhibitors.length > 0) {
    console.log('📋 Table "exhibitors" (' + exhibitors.length + ' résultats):');
    console.log('─'.repeat(80));
    exhibitors.forEach(ex => {
      const hasLogo = ex.logo_url ? '✅' : '❌';
      console.log(`${hasLogo} ${(ex.company_name || 'Sans nom').padEnd(40)} | ${ex.logo_url || 'PAS DE LOGO'}`);
    });
  }

  // Vérifier table exhibitor_profiles
  const { data: profiles, error: profError } = await supabase
    .from('exhibitor_profiles')
    .select('id, company_name, logo_url')
    .limit(10);

  if (!profError && profiles && profiles.length > 0) {
    console.log('\n📋 Table "exhibitor_profiles" (' + profiles.length + ' résultats):');
    console.log('─'.repeat(80));
    profiles.forEach(ex => {
      const hasLogo = ex.logo_url ? '✅' : '❌';
      console.log(`${hasLogo} ${(ex.company_name || 'Sans nom').padEnd(40)} | ${ex.logo_url || 'PAS DE LOGO'}`);
    });
  }

  // Vérifier users type exhibitor
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, profile')
    .eq('type', 'exhibitor')
    .limit(10);

  if (!usersError && users && users.length > 0) {
    console.log('\n📋 Table "users" (type=exhibitor, ' + users.length + ' résultats):');
    console.log('─'.repeat(80));
    users.forEach(u => {
      const profile = u.profile || {};
      const hasLogo = profile.logo || profile.logo_url ? '✅' : '❌';
      const logoUrl = profile.logo || profile.logo_url || 'PAS DE LOGO';
      console.log(`${hasLogo} ${(u.name || u.email || 'Sans nom').padEnd(40)} | ${logoUrl}`);
    });
  }

  console.log('\n' + '═'.repeat(80));
  console.log('\n💡 Les exposants sans logo (❌) afficheront des initiales colorées');
  console.log('📝 Pour ajouter un logo: Modifier le profil exposant');
}

checkExhibitorLogos();
