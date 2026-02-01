#!/usr/bin/env node

import fetch from 'node-fetch';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

// Données enrichies pour les partenaires
const partnersData = {
  'Gold Partner Industries': { email: 'contact@goldpartner.com', phone: '+212 5 22 11 22 33', tier: 'gold' },
  'Silver Tech Group': { email: 'info@silvertech.com', phone: '+212 5 23 44 55 66', tier: 'silver' },
  'Platinium Global Corp': { email: 'partnerships@platiniumglobal.com', phone: '+212 5 24 77 88 99', tier: 'platinum' },
  'Museum Cultural Center': { email: 'contact@museum.ma', phone: '+212 5 22 55 66 77', tier: 'silver' },
  'PortTech Solutions': { email: 'sales@porttech.com', phone: '+212 5 25 88 99 00', tier: 'gold' },
  'OceanFreight Logistics': { email: 'info@oceanfreight.com', phone: '+212 5 26 11 22 33', tier: 'silver' },
  'Agence Nationale de Promotion de l\'Emploi et des Compétences (ANAPEC)': { email: 'contact@anapec.ma', phone: '+212 5 22 77 88 99', tier: 'gold' },
  'EcoMarine Solutions': { email: 'info@ecomarine.com', phone: '+212 5 27 00 11 22', tier: 'platinum' },
  'Blue Ocean Research': { email: 'research@blueoceran.org', phone: '+212 5 28 33 44 55', tier: 'silver' },
  'Port Authority International': { email: 'partnerships@portauth.org', phone: '+212 5 29 66 77 88', tier: 'gold' },
  'African Ports Network': { email: 'contact@africanports.net', phone: '+212 5 30 99 00 11', tier: 'gold' },
  'Maritime Tech Innovations': { email: 'innovation@maritimetech.com', phone: '+212 5 31 22 33 44', tier: 'platinum' },
  'Musée Maritime du Maroc': { email: 'contact@museemaritimemarocco.ma', phone: '+212 5 32 55 66 77', tier: 'silver' },
  'Port Solutions Maroc': { email: 'contact@portsolutionsmaroc.com', phone: '+212 5 33 88 99 00', tier: 'gold' },
  'Tanger Med Logistics': { email: 'logistics@tangermed.ma', phone: '+212 5 34 11 22 33', tier: 'platinum' },
  'Mediterranean Shipping Alliance': { email: 'info@medshipping.org', phone: '+212 5 35 44 55 66', tier: 'gold' },
  'Global Trade Finance Corp': { email: 'finance@globaltrade.com', phone: '+212 5 36 77 88 99', tier: 'platinum' },
  'Casablanca Port Services': { email: 'services@casablancaport.ma', phone: '+212 5 37 00 11 22', tier: 'gold' },
  'Maritime Insurance Group': { email: 'insurance@maritimeins.com', phone: '+212 5 38 33 44 55', tier: 'silver' },
  'Royal Maritime Group': { email: 'contact@royalmaritime.com', phone: '+212 5 39 66 77 88', tier: 'platinum' }
};

async function updatePartnerProfiles() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 MISE À JOUR DES PROFILS PARTENAIRES');
  console.log('='.repeat(80) + '\n');

  try {
    // Récupérer tous les partenaires via REST API
    const getResponse = await fetch(`${SUPABASE_URL}/rest/v1/partners`, {
      method: 'GET',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Erreur GET: ${getResponse.status} ${getResponse.statusText}`);
    }

    const partners = await getResponse.json();
    console.log(`✅ ${partners.length} partenaires trouvés\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const partner of partners) {
      if (!partner.company_name || partner.company_name === 'N/A') {
        skippedCount++;
        continue;
      }

      const partnerData = partnersData[partner.company_name];
      
      if (!partnerData) {
        console.log(`⏭️ ${partner.company_name}: Pas de données`);
        skippedCount++;
        continue;
      }

      try {
        const logoUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(partner.company_name)}`;

        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/partners?id=eq.${partner.id}`, {
          method: 'PATCH',
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal'
          },
          body: JSON.stringify({
            email: partnerData.email,
            phone: partnerData.phone,
            tier: partnerData.tier,
            logo_url: logoUrl,
            services: ['Consulting', 'Support', 'Solutions Intégrées']
          })
        });

        if (!updateResponse.ok) {
          console.log(`❌ ${partner.company_name}: ${updateResponse.status}`);
          skippedCount++;
        } else {
          console.log(`✅ ${partner.company_name}`);
          console.log(`   • Email: ${partnerData.email}`);
          console.log(`   • Tier: ${partnerData.tier}`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`❌ ${partner.company_name}: ${error.message}`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Résultats:`);
    console.log(`   ✅ Profils mis à jour: ${updatedCount}/${partners.length}`);
    console.log(`   ⏭️  Skippés: ${skippedCount}`);
    console.log(`   📈 Taux de complétude: ${Math.round((updatedCount / partners.length) * 100)}%\n`);

    console.log('='.repeat(80));
    console.log('✨ Mise à jour des profils partenaires terminée !');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  }
}

updatePartnerProfiles();
