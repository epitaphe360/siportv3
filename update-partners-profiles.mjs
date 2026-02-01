#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Données enrichies pour les partenaires
const partnersData = {
  'Gold Partner Industries': {
    email: 'contact@goldpartner.com',
    phone: '+212 5 22 11 22 33',
    tier: 'gold',
    services: ['Conseil', 'Implémentation', 'Support 24/7'],
    industry: 'Industrie Portuaire',
    employees: '500+'
  },
  'Silver Tech Group': {
    email: 'info@silviertech.com',
    phone: '+212 5 23 44 55 66',
    tier: 'silver',
    services: ['Solutions Logicielles', 'Intégration', 'Formation'],
    industry: 'Technologie',
    employees: '250-500'
  },
  'Platinium Global Corp': {
    email: 'partnerships@platiniumglobal.com',
    phone: '+212 5 24 77 88 99',
    tier: 'platinum',
    services: ['Solutions Globales', 'Consulting', 'Maintenance'],
    industry: 'Logistique Globale',
    employees: '1000+'
  },
  'Museum Cultural Center': {
    email: 'contact@museum.ma',
    phone: '+212 5 22 55 66 77',
    tier: 'silver',
    services: ['Événements', 'Expositions', 'Éducation'],
    industry: 'Culture et Patrimoine',
    employees: '100-250'
  },
  'PortTech Solutions': {
    email: 'sales@porttech.com',
    phone: '+212 5 25 88 99 00',
    tier: 'gold',
    services: ['Logiciels Portuaires', 'Automation', 'Support Technique'],
    industry: 'Technologie Portuaire',
    employees: '150-300'
  },
  'OceanFreight Logistics': {
    email: 'info@oceanfreight.com',
    phone: '+212 5 26 11 22 33',
    tier: 'silver',
    services: ['Fret Maritime', 'Douane', 'Logistique'],
    industry: 'Transport Maritime',
    employees: '300-500'
  },
  'Agence Nationale de Promotion de l\'Emploi et des Compétences (ANAPEC)': {
    email: 'contact@anapec.ma',
    phone: '+212 5 22 77 88 99',
    tier: 'gold',
    services: ['Formation', 'Emploi', 'Compétences'],
    industry: 'Ressources Humaines',
    employees: '500+'
  },
  'EcoMarine Solutions': {
    email: 'info@ecomarine.com',
    phone: '+212 5 27 00 11 22',
    tier: 'platinum',
    services: ['Solutions Écologiques', 'Durabilité', 'Consulting'],
    industry: 'Environnement Maritime',
    employees: '200-400'
  },
  'Blue Ocean Research': {
    email: 'research@blueoceran.org',
    phone: '+212 5 28 33 44 55',
    tier: 'silver',
    services: ['Recherche', 'Études', 'Rapports'],
    industry: 'Recherche Marine',
    employees: '100-200'
  },
  'Port Authority International': {
    email: 'partnerships@portauth.org',
    phone: '+212 5 29 66 77 88',
    tier: 'gold',
    services: ['Gestion Portuaire', 'Infrastructure', 'Opérations'],
    industry: 'Administration Portuaire',
    employees: '500+'
  },
  'African Ports Network': {
    email: 'contact@africanports.net',
    phone: '+212 5 30 99 00 11',
    tier: 'gold',
    services: ['Réseau Portuaire', 'Collaboration', 'Partage Expertise'],
    industry: 'Réseau Portuaire Africain',
    employees: '250-500'
  },
  'Maritime Tech Innovations': {
    email: 'innovation@maritimetech.com',
    phone: '+212 5 31 22 33 44',
    tier: 'platinum',
    services: ['Innovation Technologique', 'R&D', 'Développement'],
    industry: 'Technologie Maritime',
    employees: '150-300'
  },
  'Musée Maritime du Maroc': {
    email: 'contact@museeemaritimemarocco.ma',
    phone: '+212 5 32 55 66 77',
    tier: 'silver',
    services: ['Culture Maritime', 'Patrimoine', 'Tourisme'],
    industry: 'Culture et Tourisme',
    employees: '75-150'
  },
  'Port Solutions Maroc': {
    email: 'contact@portsolutionsmaroc.com',
    phone: '+212 5 33 88 99 00',
    tier: 'gold',
    services: ['Solutions Portuaires', 'Consulting', 'Optimisation'],
    industry: 'Services Portuaires',
    employees: '200-350'
  },
  'Tanger Med Logistics': {
    email: 'logistics@tangermed.ma',
    phone: '+212 5 34 11 22 33',
    tier: 'platinum',
    services: ['Logistique', 'Fret', 'Manutention'],
    industry: 'Logistique Portuaire',
    employees: '400-600'
  },
  'Mediterranean Shipping Alliance': {
    email: 'info@medshipping.org',
    phone: '+212 5 35 44 55 66',
    tier: 'gold',
    services: ['Alliance Maritime', 'Expédition', 'Coordination'],
    industry: 'Transport Maritime',
    employees: '300-500'
  },
  'Global Trade Finance Corp': {
    email: 'finance@globaltrade.com',
    phone: '+212 5 36 77 88 99',
    tier: 'platinum',
    services: ['Financement Commercial', 'Assurance', 'Paiements'],
    industry: 'Finance Commerciale',
    employees: '250-400'
  },
  'Casablanca Port Services': {
    email: 'services@casablancaport.ma',
    phone: '+212 5 37 00 11 22',
    tier: 'gold',
    services: ['Services Portuaires', 'Manutention', 'Entreposage'],
    industry: 'Services Portuaires',
    employees: '350-500'
  },
  'Maritime Insurance Group': {
    email: 'insurance@maritimeins.com',
    phone: '+212 5 38 33 44 55',
    tier: 'silver',
    services: ['Assurance Maritime', 'Couverture', 'Sinistres'],
    industry: 'Assurance Maritime',
    employees: '150-250'
  },
  'Royal Maritime Group': {
    email: 'contact@royalmaritime.com',
    phone: '+212 5 39 66 77 88',
    tier: 'platinum',
    services: ['Services Maritimes Premium', 'Yacht Management', 'Fret Spécialisé'],
    industry: 'Services Maritimes Haut de Gamme',
    employees: '200-350'
  }
};

async function updatePartnerProfiles() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 MISE À JOUR DES PROFILS PARTENAIRES');
  console.log('='.repeat(80) + '\n');

  try {
    // Récupérer tous les partenaires
    const { data: partners, error: fetchError } = await supabase
      .from('partners')
      .select('*');

    if (fetchError) {
      throw new Error(`Erreur fetch: ${fetchError.message}`);
    }

    if (!partners || partners.length === 0) {
      console.log('❌ Aucun partenaire trouvé\n');
      return;
    }

    console.log(`✅ ${partners.length} partenaires trouvés\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const partner of partners) {
      if (!partner.company_name || partner.company_name === 'N/A') {
        console.log(`⏭️ Skipped vide/N/A`);
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
        // Générer un logo URL basé sur le nom (utiliser unsplash ou similar)
        const logoUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(partner.company_name)}`;

        const { error: updateError } = await supabase
          .from('partners')
          .update({
            email: partnerData.email,
            phone: partnerData.phone,
            tier: partnerData.tier,
            services: partnerData.services,
            industry: partnerData.industry,
            employees: partnerData.employees,
            logo_url: logoUrl
          })
          .eq('id', partner.id);

        if (updateError) {
          console.log(`❌ ${partner.company_name}: ${updateError.message}`);
          skippedCount++;
        } else {
          console.log(`✅ ${partner.company_name}`);
          console.log(`   Email: ${partnerData.email}`);
          console.log(`   Tier: ${partnerData.tier}`);
          console.log(`   Services: ${partnerData.services.join(', ')}`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`❌ ${partner.company_name}: ${error.message}`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Résultats:`);
    console.log(`   ✅ Profils mis à jour: ${updatedCount}`);
    console.log(`   ⏭️  Ignorés: ${skippedCount}`);
    console.log(`   📈 Taux: ${Math.round((updatedCount / partners.length) * 100)}%\n`);

    console.log('='.repeat(80));
    console.log('✨ Mise à jour des profils partenaires terminée !');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  }
}

updatePartnerProfiles();
