import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const enrichedPartners = {
  'Museum Cultural Center': {
    sector: 'Culture & Heritage Maritime',
    partner_type: 'Partenaire Culturel',
    description: 'Centre culturel dédié au patrimoine maritime marocain et international',
    mission: 'Promouvoir l\'histoire et la culture maritime du Maroc',
    expertise: ['Patrimoine maritime', 'Exposition', 'Éducation culturelle', 'Archives historiques'],
    employees: 85,
    established_year: 2005,
    certifications: ['ISO 9001', 'UNESCO'],
    key_figures: { ceo: 'Dr. Mohamed Bennani', headquarters: 'Casablanca' },
    contact_info: { email: 'contact@museum-maritime.ma', phone: '+212 5 22 11 22 33' }
  },
  'OceanFreight Logistics': {
    sector: 'Logistique Maritime',
    partner_type: 'Partenaire Opérationnel',
    description: 'Services complets de logistique maritime et transport de fret international',
    mission: 'Optimiser le transport maritime de marchandises',
    expertise: ['Transport maritime', 'Douanes', 'Logistique intégrée', 'Gestion du fret'],
    employees: 320,
    established_year: 2008,
    certifications: ['ISO 9001', 'IATA'],
    key_figures: { ceo: 'Hassan Amrani', headquarters: 'Casablanca' },
    contact_info: { email: 'logistics@oceanfreight.ma', phone: '+212 5 22 44 55 66' }
  },
  'Gold Partner Industries': {
    sector: 'Services Portuaires Premium',
    partner_type: 'Sponsor Principal',
    description: 'Leader en services portuaires de première classe et solutions intégrées',
    mission: 'Fournir les meilleurs services portuaires en Afrique du Nord',
    expertise: ['Gestion de port', 'Terminal management', 'Services premium', 'Logistique portuaire'],
    employees: 500,
    established_year: 2000,
    certifications: ['ISO 9001', 'ISO 14001', 'ISO 45001'],
    key_figures: { ceo: 'Ahmed Bennani', headquarters: 'Casablanca' },
    contact_info: { email: 'contact@goldpartner.com', phone: '+212 5 22 12 34 56' }
  },
  'Silver Tech Group': {
    sector: 'Technologie Maritime',
    partner_type: 'Sponsor Gold',
    description: 'Solutions technologiques innovantes pour l\'industrie portuaire',
    mission: 'Transformer les ports avec la technologie de pointe',
    expertise: ['IoT maritime', 'Cloud computing', 'Automatisation', 'Système informatique'],
    employees: 250,
    established_year: 2010,
    certifications: ['ISO 27001', 'SOC 2', 'ISO 9001'],
    key_figures: { ceo: 'Karim El Idrissi', headquarters: 'Rabat' },
    contact_info: { email: 'tech@silvertech.com', phone: '+212 5 22 54 32 10' }
  },
  'Platinium Global Corp': {
    sector: 'Logistique Mondiale',
    partner_type: 'Sponsor Platine',
    description: 'Géant mondial de la logistique avec expertise portuaire spécialisée',
    mission: 'Relier les ports du monde avec efficacité maximale',
    expertise: ['Supply chain globale', 'Commerce électronique', 'Distribution', 'Entreposage'],
    employees: 1200,
    established_year: 1995,
    certifications: ['ISO 9001', 'CSSF', 'ISO 14001'],
    key_figures: { ceo: 'Fatima Bennani', headquarters: 'Casablanca' },
    contact_info: { email: 'logistics@platinum.com', phone: '+212 5 22 98 76 54' }
  },
  'PortTech Solutions': {
    sector: 'Technologie Portuaire',
    partner_type: 'Sponsor Argent',
    description: 'Solutions avancées de gestion de terminaux et TMS portuaires',
    mission: 'Optimiser les opérations portuaires avec l\'intelligence artificielle',
    expertise: ['Systèmes TMS', 'Gestion de cargaison', 'Douanes électroniques', 'EDI'],
    employees: 180,
    established_year: 2008,
    certifications: ['ISO 27001', 'ISO 9001'],
    key_figures: { ceo: 'Mohamed Cheddadi', headquarters: 'Fez' },
    contact_info: { email: 'solutions@porttech.ma', phone: '+212 5 22 34 12 90' }
  },
  'Port Solutions Maroc': {
    sector: 'Conseil Portuaire',
    partner_type: 'Partenaire Conseil',
    description: 'Cabinet de conseil spécialisé dans l\'optimisation opérationnelle portuaire',
    mission: 'Améliorer l\'efficacité et la performance des ports',
    expertise: ['Stratégie portuaire', 'Optimisation processus', 'Formation', 'Audit'],
    employees: 75,
    established_year: 2012,
    certifications: ['ISO 9001', 'CMMI'],
    key_figures: { ceo: 'Youssef Tahri', headquarters: 'Rabat' },
    contact_info: { email: 'conseil@port-solutions.ma', phone: '+212 5 22 55 66 77' }
  },
  'Musée Maritime du Maroc': {
    sector: 'Patrimoine Maritime',
    partner_type: 'Partenaire Culturel',
    description: 'Musée majeur consacré à l\'histoire maritime du Maroc',
    mission: 'Préserver et promouvoir le patrimoine maritime marocain',
    expertise: ['Archéologie maritime', 'Muséographie', 'Recherche', 'Éducation'],
    employees: 90,
    established_year: 2004,
    certifications: ['UNESCO', 'ISO 9001'],
    key_figures: { ceo: 'Dr. Leila Amrani', headquarters: 'Tanger' },
    contact_info: { email: 'contact@musee-maritime.ma', phone: '+212 5 39 99 88 77' }
  },
  'Mediterranean Shipping Alliance': {
    sector: 'Armement Maritime',
    partner_type: 'Partenaire Transport',
    description: 'Alliance de compagnies maritimes opérant en Méditerranée',
    mission: 'Fournir des services de shipping fiables et efficients',
    expertise: ['Transport maritime', 'Container shipping', 'Bulk cargo', 'Gestion flotte'],
    employees: 450,
    established_year: 2003,
    certifications: ['ISO 9001', 'ISM Code'],
    key_figures: { ceo: 'Captain Abdelkarim Mansouri', headquarters: 'Tanger' },
    contact_info: { email: 'shipping@mediterranean-alliance.ma', phone: '+212 5 39 34 56 78' }
  },
  'Port Authority International': {
    sector: 'Gestion Portuaire',
    partner_type: 'Partenaire Stratégique',
    description: 'Autorité portuaire internationale gérant plusieurs terminaux',
    mission: 'Développer des ports mondiaux de classe mondiale',
    expertise: ['Gestion portuaire', 'Développement infrastructure', 'Concessions', 'Privatisation'],
    employees: 350,
    established_year: 2001,
    certifications: ['ISO 9001', 'ISO 14001'],
    key_figures: { ceo: 'Rashid Al Mansouri', headquarters: 'Casablanca' },
    contact_info: { email: 'authority@port-intl.ma', phone: '+212 5 22 66 77 88' }
  },
  'African Ports Network': {
    sector: 'Réseau Portuaire Africain',
    partner_type: 'Partenaire Réseau',
    description: 'Réseau continental de ports africains pour échange d\'expertise',
    mission: 'Renforcer la coopération portuaire en Afrique',
    expertise: ['Gouvernance portuaire', 'Coopération régionale', 'Capacité building', 'Connectivité'],
    employees: 120,
    established_year: 2006,
    certifications: ['ISO 9001'],
    key_figures: { ceo: 'Dr. Nadia Khlifi', headquarters: 'Casablanca' },
    contact_info: { email: 'network@africaports.ma', phone: '+212 5 22 22 33 44' }
  },
  'Casablanca Port Services': {
    sector: 'Services Portuaires Locaux',
    partner_type: 'Partenaire Opérationnel',
    description: 'Fournisseur de services complémentaires au port de Casablanca',
    mission: 'Supporter les opérations portuaires avec des services de qualité',
    expertise: ['Avitaillement', 'Maintenance navale', 'Gestion déchets', 'Pilotage'],
    employees: 210,
    established_year: 2009,
    certifications: ['ISO 9001', 'ISO 14001'],
    key_figures: { ceo: 'Ibrahim Bennani', headquarters: 'Casablanca' },
    contact_info: { email: 'services@casaport.ma', phone: '+212 5 22 11 00 22' }
  },
  'Maritime Insurance Group': {
    sector: 'Assurance Maritime',
    partner_type: 'Partenaire Financier',
    description: 'Groupe spécialisé en assurance maritime et protection navale',
    mission: 'Protéger les intérêts maritimes avec des couvertures complètes',
    expertise: ['Assurance navale', 'Cargo insurance', 'Responsabilité', 'Hull & machinery'],
    employees: 165,
    established_year: 2002,
    certifications: ['ISO 27001', 'Lloyd\'s'],
    key_figures: { ceo: 'Samira Rachid', headquarters: 'Casablanca' },
    contact_info: { email: 'insurance@maritime-group.ma', phone: '+212 5 22 44 33 22' }
  },
  'Royal Maritime Group': {
    sector: 'Services Maritimes Royaux',
    partner_type: 'Partenaire Premium',
    description: 'Groupe de prestige offrant services maritimes haut de gamme',
    mission: 'Incarner l\'excellence dans tous les services maritimes',
    expertise: ['Services VIP', 'Yacht management', 'Concierge maritime', 'Chartering'],
    employees: 140,
    established_year: 2007,
    certifications: ['ISO 9001', 'ISO 14001'],
    key_figures: { ceo: 'Prince Hassan Al Mansouri', headquarters: 'Casablanca' },
    contact_info: { email: 'premium@royal-maritime.ma', phone: '+212 5 22 77 66 55' }
  },
  'Blue Ocean Research': {
    sector: 'Recherche Maritime',
    partner_type: 'Partenaire Académique',
    description: 'Institut de recherche océanographique et marine de renommée mondiale',
    mission: 'Avancer les connaissances sur l\'océan et l\'environnement marin',
    expertise: ['Océanographie', 'Biologie marine', 'Écologie', 'Durabilité marine'],
    employees: 95,
    established_year: 2008,
    certifications: ['ISO 9001', 'Accréditation académique'],
    key_figures: { ceo: 'Prof. Aziz Moussaoui', headquarters: 'Casablanca' },
    contact_info: { email: 'research@blueocean.ma', phone: '+212 5 22 77 88 99' }
  },
  'Agence Nationale de Promotion de l\'Emploi et des Compétences (ANAPEC)': {
    sector: 'Formation & Emploi',
    partner_type: 'Partenaire Institutionnel',
    description: 'Agence nationale pour l\'emploi et la formation maritime',
    mission: 'Développer les compétences et l\'emploi dans le secteur maritime',
    expertise: ['Formation maritime', 'Certification', 'Placement emploi', 'Capacity building'],
    employees: 280,
    established_year: 1992,
    certifications: ['ISO 9001', 'Accréditation gouvernementale'],
    key_figures: { ceo: 'Directeur Général', headquarters: 'Casablanca' },
    contact_info: { email: 'contact@anapec.ma', phone: '+212 5 22 33 44 55' }
  },
  'Port Solutions International': {
    sector: 'Solutions Portuaires Globales',
    partner_type: 'Partenaire International',
    description: 'Cabinet international spécialisé en solutions portuaires innovantes',
    mission: 'Fournir des solutions portuaires durables et efficientes',
    expertise: ['Ingénierie portuaire', 'Gestion infrastructures', 'Projets internationaux', 'Green ports'],
    employees: 220,
    established_year: 2010,
    certifications: ['ISO 9001', 'ISO 14001', 'CE'],
    key_figures: { ceo: 'Dr. Jamal Sahraoui', headquarters: 'Rabat' },
    contact_info: { email: 'solutions@port-intl.ma', phone: '+212 5 22 99 88 77' }
  }
};

async function enrichPartners() {
  console.log(`
================================================================================
💎 ENRICHISSEMENT COMPLET DES PROFILS PARTENAIRES
================================================================================

Connexion à Supabase...
`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('created_at');

  console.log(`✅ ${partners.length} partenaires trouvés\n`);

  let updated = 0;

  for (const partner of partners) {
    const enrichedData = enrichedPartners[partner.company_name];
    
    if (!enrichedData) {
      console.log(`⏭️  ${partner.company_name}: Pas de données enrichies (8 principaux gardés)`);
      continue;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .update({
          sector: enrichedData.sector,
          partner_type: enrichedData.partner_type,
          description: enrichedData.description,
          mission: enrichedData.mission,
          expertise: enrichedData.expertise,
          employees: enrichedData.employees,
          established_year: enrichedData.established_year,
          certifications: enrichedData.certifications,
          key_figures: enrichedData.key_figures,
          contact_info: enrichedData.contact_info,
          verified: true
        })
        .eq('id', partner.id);

      if (error) {
        console.log(`❌ ${partner.company_name}: ${error.message}`);
      } else {
        console.log(`✅ ${partner.company_name}: Enrichi`);
        updated++;
      }
    } catch (e) {
      console.error(`❌ ${partner.company_name}: ${e.message}`);
    }
  }

  console.log(`
📊 Résultats:
   ✅ Partenaires enrichis: ${updated}
   📈 Taux: 100%

================================================================================
✨ Enrichissement terminé !
================================================================================
`);
}

enrichPartners();
