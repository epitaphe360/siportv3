#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Données enrichies pour les partenaires
const partnersEnrichedData = {
  'Gold Partner Industries': {
    partner_type: 'Consulting',
    sector: 'Technology',
    contact_info: { email: 'contact@goldpartner.com', phone: '+212 5 22 11 22 33', country: 'Morocco' },
    partnership_level: 'Gold',
    mission: 'Fournir des solutions de consulting de classe mondiale pour l\'industrie portuaire',
    expertise: ['Consulting', 'Implémentation', 'Support 24/7', 'Optimisation Portuaire'],
    employees: '500+',
    established_year: 2005,
    certifications: ['ISO 9001', 'ISO 14001'],
    key_figures: { revenue: '50M+', clients: '200+', employees: '500' }
  },
  'Silver Tech Group': {
    partner_type: 'Technology',
    sector: 'Software',
    contact_info: { email: 'info@silvertech.com', phone: '+212 5 23 44 55 66', country: 'Morocco' },
    partnership_level: 'Silver',
    mission: 'Développer des solutions logicielles innovantes pour les ports modernes',
    expertise: ['Solutions Logicielles', 'Intégration', 'Formation', 'Support Technique'],
    employees: '250-500',
    established_year: 2010,
    certifications: ['ISO 27001'],
    key_figures: { revenue: '25M+', clients: '150+', employees: '350' }
  },
  'Platinium Global Corp': {
    partner_type: 'Consulting & Services',
    sector: 'Logistics',
    contact_info: { email: 'partnerships@platiniumglobal.com', phone: '+212 5 24 77 88 99', country: 'Morocco' },
    partnership_level: 'Platinum',
    mission: 'Offrir des solutions globales intégrées pour la transformation portuaire',
    expertise: ['Solutions Globales', 'Consulting Stratégique', 'Maintenance', 'Optimisation'],
    employees: '1000+',
    established_year: 1998,
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
    key_figures: { revenue: '100M+', clients: '300+', employees: '1200' }
  },
  'PortTech Solutions': {
    partner_type: 'Technology',
    sector: 'Software',
    contact_info: { email: 'sales@porttech.com', phone: '+212 5 25 88 99 00', country: 'Morocco' },
    partnership_level: 'Gold',
    mission: 'Révolutionner la gestion portuaire par la technologie',
    expertise: ['Logiciels Portuaires', 'Automation', 'Support Technique', 'Cloud Solutions'],
    employees: '150-300',
    established_year: 2015,
    certifications: ['ISO 27001', 'SOC 2'],
    key_figures: { revenue: '15M+', clients: '80+', employees: '200' }
  },
  'EcoMarine Solutions': {
    partner_type: 'Environmental Services',
    sector: 'Sustainability',
    contact_info: { email: 'info@ecomarine.com', phone: '+212 5 27 00 11 22', country: 'Morocco' },
    partnership_level: 'Platinum',
    mission: 'Créer des ports écologiques et durables',
    expertise: ['Solutions Écologiques', 'Durabilité', 'Consulting Environnemental', 'Certification'],
    employees: '200-400',
    established_year: 2012,
    certifications: ['ISO 14001', 'EMAS', 'B Corp'],
    key_figures: { revenue: '30M+', clients: '120+', employees: '300' }
  },
  'Maritime Tech Innovations': {
    partner_type: 'Technology',
    sector: 'Innovation',
    contact_info: { email: 'innovation@maritimetech.com', phone: '+212 5 31 22 33 44', country: 'Morocco' },
    partnership_level: 'Platinum',
    mission: 'Innover pour l\'industrie maritime du 21ème siècle',
    expertise: ['Innovation Technologique', 'R&D', 'Développement Logiciel', 'IA & ML'],
    employees: '150-300',
    established_year: 2018,
    certifications: ['ISO 27001', 'Startup Certifiée'],
    key_figures: { revenue: '10M+', clients: '50+', employees: '180' }
  },
  'Tanger Med Logistics': {
    partner_type: 'Logistics',
    sector: 'Port Services',
    contact_info: { email: 'logistics@tangermed.ma', phone: '+212 5 34 11 22 33', country: 'Morocco' },
    partnership_level: 'Platinum',
    mission: 'Être le leader logistique de la région méditerranéenne',
    expertise: ['Logistique Portuaire', 'Fret', 'Manutention', 'Entreposage'],
    employees: '400-600',
    established_year: 2007,
    certifications: ['ISO 9001', 'ISO 14001'],
    key_figures: { revenue: '80M+', clients: '200+', employees: '500' }
  },
  'Global Trade Finance Corp': {
    partner_type: 'Finance',
    sector: 'Financial Services',
    contact_info: { email: 'finance@globaltrade.com', phone: '+212 5 36 77 88 99', country: 'Morocco' },
    partnership_level: 'Platinum',
    mission: 'Financer le commerce mondial et les opérations portuaires',
    expertise: ['Financement Commercial', 'Assurance Crédit', 'Solutions de Paiement', 'Lettres de Crédit'],
    employees: '250-400',
    established_year: 2000,
    certifications: ['ISO 9001', 'ISO 27001', 'FCA Regulated'],
    key_figures: { revenue: '120M+', clients: '350+', employees: '350' }
  }
};

async function updatePartnerProfiles() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 MISE À JOUR DES PROFILS PARTENAIRES - VERSION 2');
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
        skippedCount++;
        continue;
      }

      const enrichedData = partnersEnrichedData[partner.company_name];
      
      if (!enrichedData) {
        console.log(`⏭️ ${partner.company_name}: Pas de données`);
        skippedCount++;
        continue;
      }

      try {
        const logoUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(partner.company_name)}`;

        const { error: updateError } = await supabase
          .from('partners')
          .update({
            partner_type: enrichedData.partner_type,
            sector: enrichedData.sector,
            contact_info: enrichedData.contact_info,
            partnership_level: enrichedData.partnership_level,
            mission: enrichedData.mission,
            expertise: enrichedData.expertise,
            employees: enrichedData.employees,
            established_year: enrichedData.established_year,
            certifications: enrichedData.certifications,
            key_figures: enrichedData.key_figures,
            logo_url: logoUrl,
            verified: true
          })
          .eq('id', partner.id);

        if (updateError) {
          console.log(`❌ ${partner.company_name}: ${updateError.message}`);
          skippedCount++;
        } else {
          console.log(`✅ ${partner.company_name}`);
          console.log(`   • Type: ${enrichedData.partner_type}`);
          console.log(`   • Niveau: ${enrichedData.partnership_level}`);
          console.log(`   • Expertise: ${enrichedData.expertise.slice(0, 2).join(', ')}`);
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
    console.log(`   📈 Taux: ${Math.round((updatedCount / partners.length) * 100)}%\n`);

    console.log('='.repeat(80));
    console.log('✨ Mise à jour terminée !');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  }
}

updatePartnerProfiles();
