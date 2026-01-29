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
    // Vérifier exhibitors (table source unique)
    console.log('📊 Table exhibitors (source unique):');
    const { data: exhibitors, error: exhibitorsError, count: exhibitorsCount } = await supabase
      .from('exhibitors')
      .select('id, company_name', { count: 'exact' });

    if (exhibitorsError) {
      console.log(`   ❌ Erreur: ${exhibitorsError.message}`);
    } else {
      console.log(`   ✅ ${exhibitorsCount || exhibitors?.length || 0} exposants trouvés`);
      if (exhibitors && exhibitors.length > 0) {
        console.log(`   Exposants:`);
        exhibitors.forEach((e, i) => {
          console.log(`      ${i + 1}. ${e.company_name || 'Sans nom'} (ID: ${e.id})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkExhibitors();

