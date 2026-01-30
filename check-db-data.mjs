import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Vérification des données dans la base...\n');

async function checkData() {
  try {
    // Compter les utilisateurs
    const { count: totalUsers } = await supabase.from('users').select('id', { count: 'exact', head: true });
    console.log(`👥 Total utilisateurs (users): ${totalUsers}`);

    // Compter par type
    const { count: exhibitorUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'exhibitor');
    console.log(`   - Exposants (users.type='exhibitor'): ${exhibitorUsers}`);

    const { count: partnerUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'partner');
    console.log(`   - Partenaires (users.type='partner'): ${partnerUsers}`);

    const { count: visitorUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'visitor');
    console.log(`   - Visiteurs (users.type='visitor'): ${visitorUsers}`);

    const { count: adminUsers } = await supabase.from('users').select('id', { count: 'exact', head: true }).eq('type', 'admin');
    console.log(`   - Admins (users.type='admin'): ${adminUsers}`);

    console.log('\n📋 Profils détaillés:');

    // Compter les profils exhibitors
    const { count: exhibitorProfiles } = await supabase.from('exhibitors').select('id', { count: 'exact', head: true });
    console.log(`   - Profils exposants (exhibitors table): ${exhibitorProfiles}`);

    const { count: verifiedExhibitors } = await supabase.from('exhibitors').select('id', { count: 'exact', head: true }).eq('verified', true);
    console.log(`     • Vérifiés: ${verifiedExhibitors}`);

    // Compter les profils partners
    const { count: partnerProfiles } = await supabase.from('partners').select('id', { count: 'exact', head: true });
    console.log(`   - Profils partenaires (partners table): ${partnerProfiles}`);

    const { count: verifiedPartners } = await supabase.from('partners').select('id', { count: 'exact', head: true }).eq('verified', true);
    console.log(`     • Vérifiés: ${verifiedPartners}`);

    console.log('\n📊 Autres données:');

    const { count: events } = await supabase.from('events').select('id', { count: 'exact', head: true });
    console.log(`   - Événements: ${events || 0}`);

    const { count: appointments } = await supabase.from('appointments').select('id', { count: 'exact', head: true });
    console.log(`   - Rendez-vous: ${appointments || 0}`);

    const { count: connections } = await supabase.from('connections').select('id', { count: 'exact', head: true });
    console.log(`   - Connexions: ${connections || 0}`);

    const { count: messages } = await supabase.from('messages').select('id', { count: 'exact', head: true });
    console.log(`   - Messages: ${messages || 0}`);

    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkData();
