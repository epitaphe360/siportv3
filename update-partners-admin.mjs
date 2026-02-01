import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const enrichedData = {
  'Gold Partner Industries': {
    partner_type: 'Sponsor Principal',
    sector: 'Services Portuaires',
    description: 'Leader dans les solutions portuaires globales',
    mission: 'Offrir des services portuaires excellence pour les ports modernes',
    expertise: ['Gestion de port', 'Logistique maritime', 'Technologie portuaire'],
    employees: 500,
    established_year: 2000,
    contact_info: { email: 'contact@goldpartner.com', phone: '+212 5 22 12 34 56' },
    certifications: ['ISO 9001', 'ISO 14001'],
    key_figures: { ceo: 'Ahmed Bennani', headquarters: 'Casablanca' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/gold-partner.png'
  },
  'Silver Tech Group': {
    partner_type: 'Sponsor Gold',
    sector: 'Technologie',
    description: 'Innovations technologiques pour l\'industrie maritime',
    mission: 'Transformer les ports avec la technologie intelligente',
    expertise: ['IoT', 'Cloud Computing', 'Automatisation'],
    employees: 250,
    established_year: 2010,
    contact_info: { email: 'tech@silvertech.com', phone: '+212 5 22 54 32 10' },
    certifications: ['ISO 27001', 'SOC 2'],
    key_figures: { ceo: 'Karim El Idrissi', headquarters: 'Rabat' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/silver-tech.png'
  },
  'Platinium Global Corp': {
    partner_type: 'Sponsor Platine',
    sector: 'Logistique',
    description: 'Logistique mondiale avec expertise portuaire',
    mission: 'Connecter les ports du monde avec efficacité',
    expertise: ['Logistique internationale', 'Supply chain', 'Commerce électronique'],
    employees: 1200,
    established_year: 1995,
    contact_info: { email: 'logistics@platinum.com', phone: '+212 5 22 98 76 54' },
    certifications: ['ISO 9001', 'CSSF'],
    key_figures: { ceo: 'Fatima Bennani', headquarters: 'Casablanca' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/platinum-global.png'
  },
  'PortTech Solutions': {
    partner_type: 'Sponsor Argent',
    sector: 'Technologie Portuaire',
    description: 'Solutions de gestion terminaux portuaires',
    mission: 'Optimiser les opérations portuaires avec des systèmes intelligents',
    expertise: ['Systèmes TMS', 'Gestion de cargaison', 'Douanes électroniques'],
    employees: 180,
    established_year: 2008,
    contact_info: { email: 'solutions@porttech.ma', phone: '+212 5 22 34 12 90' },
    certifications: ['ISO 27001'],
    key_figures: { ceo: 'Mohamed Cheddadi', headquarters: 'Fez' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/porttech.png'
  },
  'EcoMarine Solutions': {
    partner_type: 'Sponsor Bronze',
    sector: 'Durabilité Maritime',
    description: 'Solutions écologiques pour l\'industrie portuaire',
    mission: 'Promouvoir des ports durables et verts',
    expertise: ['Énergies renouvelables', 'Gestion des déchets', 'Environnement marin'],
    employees: 95,
    established_year: 2015,
    contact_info: { email: 'eco@ecomarine.ma', phone: '+212 5 22 12 34 78' },
    certifications: ['ISO 14001', 'EMAS'],
    key_figures: { ceo: 'Youssef Mansouri', headquarters: 'Tanger' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/ecomarine.png'
  },
  'Maritime Tech Innovations': {
    partner_type: 'Partenaire Technologie',
    sector: 'Innovation',
    description: 'Innovations numériques pour la transformation maritime',
    mission: 'Pionnier des technologies maritimes de demain',
    expertise: ['IA', 'Blockchain', 'Big Data'],
    employees: 150,
    established_year: 2018,
    contact_info: { email: 'innovation@martech.ma', phone: '+212 5 22 56 78 90' },
    certifications: ['ISO 9001'],
    key_figures: { ceo: 'Dr. Leila Amrani', headquarters: 'Casablanca' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/martech-innovation.png'
  },
  'Tanger Med Logistics': {
    partner_type: 'Partenaire Stratégique',
    sector: 'Opérations Portuaires',
    description: 'Logistique intégrée pour le port de Tanger',
    mission: 'Excellente exécution logistique à Tanger Med',
    expertise: ['Terminal management', 'Manutention', 'Conteneurs'],
    employees: 600,
    established_year: 2007,
    contact_info: { email: 'ops@tangermed.ma', phone: '+212 5 39 34 56 78' },
    certifications: ['ISO 9001', 'OHSAS 18001'],
    key_figures: { ceo: 'Hassan Al Houari', headquarters: 'Tanger' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/tangmed-logistics.png'
  },
  'Global Trade Finance Corp': {
    partner_type: 'Partenaire Financier',
    sector: 'Finance',
    description: 'Solutions de financement pour commerce maritime',
    mission: 'Financer le commerce maritime mondial',
    expertise: ['Financement du commerce', 'Assurance', 'Lettres de crédit'],
    employees: 320,
    established_year: 2005,
    contact_info: { email: 'finance@globaltrade.ma', phone: '+212 5 22 78 90 12' },
    certifications: ['ISO 27001'],
    key_figures: { ceo: 'Samira Rachid', headquarters: 'Casablanca' },
    logo_url: 'https://gpitzcyyfecxqvjdvkbp.supabase.co/storage/v1/object/public/assets/partners/globaltrade.png'
  }
};

async function updatePartners() {
  console.log(`
================================================================================
📝 MISE À JOUR DES PROFILS PARTENAIRES - VERSION ADMIN
================================================================================

Connexion à Supabase...
`);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Récupérer tous les partenaires
  const { data: partners, error: fetchError } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: true });

  if (fetchError) {
    console.error('❌ Erreur lors de la récupération des partenaires:', fetchError);
    return;
  }

  console.log(`✅ ${partners.length} partenaires trouvés\n`);

  let updated = 0;
  let skipped = 0;

  for (const partner of partners) {
    const data = enrichedData[partner.company_name] || {
      partner_type: 'Partenaire',
      sector: 'Services Maritimes',
      description: 'Partenaire SIPORTS 2026',
      mission: 'Contribuer au succès de SIPORTS 2026',
      expertise: ['Maritime', 'Services portuaires'],
      employees: 100,
      established_year: 2010,
      contact_info: { email: `contact@${partner.company_name.toLowerCase().replace(/\s+/g, '')}.ma`, phone: '+212 5 22 00 00 00' },
      certifications: ['ISO 9001'],
      key_figures: { ceo: 'Directeur', headquarters: 'Maroc' },
      verified: true
    };

    try {
      // Mise à jour avec les bons champs (sans partnership_level)
      const { error: updateError } = await supabase
        .from('partners')
        .update({
          partner_type: data.partner_type,
          sector: data.sector,
          description: data.description,
          mission: data.mission,
          expertise: data.expertise,
          employees: data.employees,
          established_year: data.established_year,
          contact_info: data.contact_info,
          certifications: data.certifications,
          key_figures: data.key_figures,
          logo_url: data.logo_url || null,
          verified: true
        })
        .eq('id', partner.id);

      if (updateError) {
        console.log(`❌ ${partner.company_name}: ${updateError.message}`);
        skipped++;
      } else {
        console.log(`✅ ${partner.company_name}: Profil mis à jour`);
        updated++;
      }
    } catch (error) {
      console.error(`❌ ${partner.company_name}: ${error.message}`);
      skipped++;
    }
  }

  console.log(`
📊 Résultats:
   ✅ Profils mis à jour: ${updated}/${partners.length}
   ⏭️  Skippés: ${skipped}
   📈 Taux: ${Math.round((updated / partners.length) * 100)}%

================================================================================
✨ Mise à jour terminée !
================================================================================
`);
}

updatePartners();
