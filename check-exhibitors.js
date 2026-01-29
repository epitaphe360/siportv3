#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkExhibitors() {
  console.log('🔍 Vérification des exposants dans Supabase...\n');

  try {
    // Vérifier exhibitor_profiles
    console.log('📊 Table exhibitor_profiles:');
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('exhibitor_profiles')
      .select('id, company_name', { count: 'exact' });

    if (profilesError) {
      console.log(`   ❌ Erreur: ${profilesError.message}`);
    } else {
      console.log(`   ✅ ${profilesCount || profiles?.length || 0} exposants trouvés`);
      if (profiles && profiles.length > 0) {
        console.log(`   Premiers exposants:`);
        profiles.slice(0, 5).forEach(p => {
          console.log(`      - ${p.company_name || 'Sans nom'} (ID: ${p.id})`);
        });
        if (profiles.length > 5) {
          console.log(`      ... et ${profiles.length - 5} autres`);
        }
      }
    }

    console.log('\n📊 Table exhibitors (fallback):');
    const { data: exhibitors, error: exhibitorsError, count: exhibitorsCount } = await supabase
      .from('exhibitors')
      .select('id, company_name', { count: 'exact' });

    if (exhibitorsError) {
      console.log(`   ⚠️ Erreur: ${exhibitorsError.message}`);
    } else {
      console.log(`   ✅ ${exhibitorsCount || exhibitors?.length || 0} exposants trouvés`);
      if (exhibitors && exhibitors.length > 0) {
        console.log(`   Premiers exposants:`);
        exhibitors.slice(0, 5).forEach(e => {
          console.log(`      - ${e.company_name || 'Sans nom'} (ID: ${e.id})`);
        });
        if (exhibitors.length > 5) {
          console.log(`      ... et ${exhibitors.length - 5} autres`);
        }
      }
    }

    console.log('\n📊 Table users (type = exhibitor):');
    const { data: users, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('id, name, email, type', { count: 'exact' })
      .eq('type', 'exhibitor');

    if (usersError) {
      console.log(`   ⚠️ Erreur: ${usersError.message}`);
    } else {
      console.log(`   ✅ ${usersCount || users?.length || 0} utilisateurs de type 'exhibitor' trouvés`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkExhibitors();
