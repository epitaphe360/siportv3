#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function auditPartnerProfiles() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 AUDIT DES PROFILS PARTENAIRES');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Récupérer les partenaires
    console.log('📊 Étape 1: Récupération des partenaires...');
    const { data: partners, error: pError } = await supabase
      .from('partners')
      .select('*');

    if (pError) {
      throw new Error(`Erreur: ${pError.message}`);
    }

    console.log(`✅ ${partners?.length || 0} partenaire(s) trouvé(s)\n`);

    if (!partners || partners.length === 0) {
      console.log('❌ Aucun partenaire trouvé dans la base de données!\n');
      return;
    }

    // 2. Analyser les profils
    console.log('📋 ANALYSE DES PROFILS PARTENAIRES:\n');

    let completeCount = 0;
    let incompleteCount = 0;
    const incompletePartners = [];

    for (let i = 0; i < partners.length; i++) {
      const partner = partners[i];
      
      // Vérifier les champs obligatoires
      const hasCompanyName = !!partner.company_name;
      const hasEmail = !!partner.email;
      const hasDescription = !!partner.description && partner.description.length > 20;
      const hasLogo = !!partner.logo_url;
      const hasWebsite = !!partner.website;
      const hasPhone = !!partner.phone;
      const hasTier = !!partner.tier;
      const hasServices = !!partner.services && Array.isArray(partner.services);

      const isComplete = hasCompanyName && hasEmail && hasDescription && hasLogo && hasWebsite && hasPhone && hasTier;

      console.log(`${i + 1}. ${partner.company_name || 'N/A'}`);
      console.log(`   ${isComplete ? '✅ COMPLET' : '⚠️ INCOMPLET'}`);
      console.log(`   • Nom: ${hasCompanyName ? '✅' : '❌'}`);
      console.log(`   • Email: ${hasEmail ? '✅' : '❌'}`);
      console.log(`   • Description: ${hasDescription ? '✅' : '❌'}`);
      console.log(`   • Logo: ${hasLogo ? '✅' : '❌'}`);
      console.log(`   • Site Web: ${hasWebsite ? '✅' : '❌'}`);
      console.log(`   • Téléphone: ${hasPhone ? '✅' : '❌'}`);
      console.log(`   • Tier: ${hasTier ? '✅' : '❌'}`);
      console.log(`   • Services: ${hasServices ? '✅' : '❌'}`);
      
      if (isComplete) {
        completeCount++;
      } else {
        incompleteCount++;
        incompletePartners.push(partner);
      }
      
      console.log();
    }

    // 3. Résumé
    console.log('📈 RÉSUMÉ:');
    console.log(`   • Partenaires avec profil complet: ${completeCount}/${partners.length}`);
    console.log(`   • Partenaires avec profil incomplet: ${incompleteCount}/${partners.length}`);
    console.log(`   • Taux de complétude: ${Math.round((completeCount / partners.length) * 100)}%\n`);

    // 4. Recommandations
    if (incompletePartners.length > 0) {
      console.log('💡 PARTENAIRES À COMPLÉTER:');
      for (const partner of incompletePartners) {
        console.log(`   • ${partner.company_name} - ID: ${partner.id}`);
      }
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    process.exit(1);
  }
}

auditPartnerProfiles();
