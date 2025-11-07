import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Récupérer les variables d'environnement pour Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Les variables d\'environnement Supabase ne sont pas définies.');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Données des exposants
const exhibitorsData = [
  {
    company_name: 'Port Tech Solutions',
    description: 'Leader mondial des solutions de gestion portuaire intelligente',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
    website: 'https://porttechsolutions.com',
    contact_info: {
      email: 'contact@porttechsolutions.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Port Avenue, Le Havre, France',
      social: {
        linkedin: 'https://linkedin.com/company/porttechsolutions',
        twitter: 'https://twitter.com/porttechsol'
      }
    }
  },
  {
    company_name: 'Maritime Innovations Inc',
    description: 'Innovations technologiques pour l\'industrie maritime moderne',
    logo_url: 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=200&h=200&fit=crop',
    website: 'https://maritime-innovations.com',
    contact_info: {
      email: 'info@maritime-innovations.com',
      phone: '+1 206 555 0123',
      address: '456 Harbor Drive, Seattle, USA',
      social: {
        linkedin: 'https://linkedin.com/company/maritime-innovations',
        facebook: 'https://facebook.com/maritimeinnovations'
      }
    }
  },
  {
    company_name: 'Ocean Logistics Group',
    description: 'Solutions logistiques complètes pour le transport maritime',
    logo_url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200&h=200&fit=crop',
    website: 'https://oceanlogisticsgroup.com',
    contact_info: {
      email: 'contact@oceanlogisticsgroup.com',
      phone: '+65 6123 4567',
      address: '789 Marina Bay, Singapore',
      social: {
        linkedin: 'https://linkedin.com/company/oceanlogisticsgroup',
        instagram: 'https://instagram.com/oceanlogistics'
      }
    }
  },
  {
    company_name: 'Smart Port Systems',
    description: 'Systèmes d\'automatisation et d\'IoT pour ports intelligents',
    logo_url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
    website: 'https://smartportsystems.com',
    contact_info: {
      email: 'hello@smartportsystems.com',
      phone: '+31 20 123 4567',
      address: '321 Harbor Street, Rotterdam, Netherlands',
      social: {
        linkedin: 'https://linkedin.com/company/smartportsystems',
        twitter: 'https://twitter.com/smartportsys'
      }
    }
  },
  {
    company_name: 'Global Shipping Technologies',
    description: 'Technologies de pointe pour le transport maritime international',
    logo_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop',
    website: 'https://globalshippingtech.com',
    contact_info: {
      email: 'info@globalshippingtech.com',
      phone: '+44 20 1234 5678',
      address: '555 Thames Street, London, UK',
      social: {
        linkedin: 'https://linkedin.com/company/globalshippingtech',
        youtube: 'https://youtube.com/globalshippingtech'
      }
    }
  },
  {
    company_name: 'EcoPort Solutions',
    description: 'Solutions écologiques et durables pour les ports modernes',
    logo_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop',
    website: 'https://ecoportsolutions.com',
    contact_info: {
      email: 'contact@ecoportsolutions.com',
      phone: '+46 8 123 456',
      address: '888 Green Harbor, Stockholm, Sweden',
      social: {
        linkedin: 'https://linkedin.com/company/ecoportsolutions',
        facebook: 'https://facebook.com/ecoportsolutions'
      }
    }
  },
  {
    company_name: 'Digital Marine Services',
    description: 'Services numériques et cloud pour l\'industrie maritime',
    logo_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop',
    website: 'https://digitalmarineservices.com',
    contact_info: {
      email: 'hello@digitalmarineservices.com',
      phone: '+49 40 1234 5678',
      address: '999 Port Road, Hamburg, Germany',
      social: {
        linkedin: 'https://linkedin.com/company/digitalmarineservices',
        twitter: 'https://twitter.com/digitalmarine'
      }
    }
  },
  {
    company_name: 'Cargo Connect Platform',
    description: 'Plateforme de connexion entre expéditeurs et transporteurs maritimes',
    logo_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&h=200&fit=crop',
    website: 'https://cargoconnectplatform.com',
    contact_info: {
      email: 'support@cargoconnectplatform.com',
      phone: '+971 4 123 4567',
      address: '111 Port Plaza, Dubai, UAE',
      social: {
        linkedin: 'https://linkedin.com/company/cargoconnectplatform',
        instagram: 'https://instagram.com/cargoconnect'
      }
    }
  }
];

// Données des partenaires
const partnersData = [
  {
    organization_name: 'International Maritime Organization',
    partner_type: 'institutional',
    sector: 'Maritime',
    country: 'United Kingdom',
    website: 'https://imo.org',
    description: 'Organisation internationale spécialisée dans la sécurité maritime et la prévention de la pollution marine',
    contact_name: 'John Smith',
    contact_email: 'info@imo.org',
    contact_phone: '+44 20 7735 7611',
    contact_position: 'Director of Relations',
    sponsorship_level: 'Platinum',
    contributions: ['Réglementation maritime', 'Sécurité maritime', 'Protection environnement'],
    logo: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop'
  },
  {
    organization_name: 'World Ports Association',
    partner_type: 'platinum',
    sector: 'Ports',
    country: 'Belgium',
    website: 'https://worldportsassociation.org',
    description: 'Association mondiale des ports pour la coopération internationale',
    contact_name: 'Marie Dubois',
    contact_email: 'contact@worldportsassociation.org',
    contact_phone: '+32 2 123 4567',
    contact_position: 'Executive Director',
    sponsorship_level: 'Platinum',
    contributions: ['Networking', 'Best practices', 'Innovation portuaire'],
    logo: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=200&fit=crop'
  },
  {
    organization_name: 'Global Logistics Forum',
    partner_type: 'gold',
    sector: 'Logistics',
    country: 'Switzerland',
    website: 'https://globallogisticsforum.org',
    description: 'Forum international pour les professionnels de la logistique',
    contact_name: 'Hans Mueller',
    contact_email: 'info@globallogisticsforum.org',
    contact_phone: '+41 22 123 4567',
    contact_position: 'Chairman',
    sponsorship_level: 'Gold',
    contributions: ['Supply chain', 'Digital logistics', 'Sustainability'],
    logo: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=200&h=200&fit=crop'
  },
  {
    organization_name: 'Maritime Tech Alliance',
    partner_type: 'silver',
    sector: 'Technology',
    country: 'Norway',
    website: 'https://maritimetechalliance.org',
    description: 'Alliance pour l\'innovation technologique maritime',
    contact_name: 'Erik Olsen',
    contact_email: 'contact@maritimetechalliance.org',
    contact_phone: '+47 22 123 456',
    contact_position: 'CEO',
    sponsorship_level: 'Silver',
    contributions: ['Innovation', 'R&D', 'Digitalisation'],
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop'
  }
];

// Fonction pour créer les exposants avec mini-sites et produits
async function seedExhibitors() {
  console.log('🌱 Création des exposants avec mini-sites et produits...\n');

  for (const exhibitorData of exhibitorsData) {
    console.log(`📦 Création de l'exposant: ${exhibitorData.company_name}`);

    // Créer l'exposant
    const { data: exhibitor, error: exhibitorError } = await supabase
      .from('exhibitors')
      .upsert({
        company_name: exhibitorData.company_name,
        description: exhibitorData.description,
        logo_url: exhibitorData.logo_url,
        website: exhibitorData.website,
        contact_info: exhibitorData.contact_info
      })
      .select()
      .single();

    if (exhibitorError) {
      console.error(`  ❌ Erreur création exposant:`, exhibitorError.message);
      continue;
    }

    console.log(`  ✅ Exposant créé avec ID: ${exhibitor.id}`);

    // Créer le mini-site
    const miniSiteData = {
      exhibitor_id: exhibitor.id,
      theme: 'default',
      custom_colors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#60a5fa',
        fontFamily: 'Inter'
      },
      sections: [
        {
          type: 'hero',
          content: {
            title: exhibitorData.company_name,
            subtitle: exhibitorData.description,
            backgroundImage: 'https://images.unsplash.com/photo-1580091873836-0c109fa1e489?w=1200&fit=crop',
            ctaText: 'Découvrir nos solutions',
            ctaLink: '#products'
          }
        },
        {
          type: 'about',
          content: {
            title: 'À propos de nous',
            description: `${exhibitorData.company_name} est un acteur majeur dans le secteur maritime. Nous offrons des solutions innovantes et personnalisées pour répondre aux besoins de nos clients.`,
            features: ['Innovation continue', 'Expertise reconnue', 'Support 24/7', 'Présence internationale']
          }
        },
        {
          type: 'products',
          content: {
            title: 'Nos solutions',
            description: 'Découvrez notre gamme complète de produits et services'
          }
        },
        {
          type: 'contact',
          content: {
            title: 'Contactez-nous',
            email: exhibitorData.contact_info.email,
            phone: exhibitorData.contact_info.phone,
            address: exhibitorData.contact_info.address
          }
        }
      ],
      published: true,
      views: Math.floor(Math.random() * 500),
      last_updated: new Date().toISOString()
    };

    const { error: miniSiteError } = await supabase
      .from('mini_sites')
      .upsert(miniSiteData);

    if (miniSiteError) {
      console.error(`  ❌ Erreur création mini-site:`, miniSiteError.message);
    } else {
      console.log(`  ✅ Mini-site créé`);
    }

    // Créer 3-5 produits pour chaque exposant
    const productCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < productCount; i++) {
      const productData = {
        exhibitor_id: exhibitor.id,
        name: `Solution ${i + 1} - ${exhibitorData.company_name.split(' ')[0]}`,
        description: `Solution innovante pour optimiser les opérations maritimes et portuaires. Produit phare de ${exhibitorData.company_name}.`,
        category: ['Technology', 'Services', 'Equipment', 'Software'][Math.floor(Math.random() * 4)],
        images: [
          `https://images.unsplash.com/photo-${1580091873836 + i}?w=600&fit=crop`
        ],
        price: `${(5000 + Math.random() * 50000).toFixed(0)}€`,
        featured: i === 0
      };

      const { error: productError } = await supabase
        .from('products')
        .upsert(productData);

      if (productError) {
        console.error(`  ❌ Erreur création produit:`, productError.message);
      }
    }

    console.log(`  ✅ ${productCount} produits créés\n`);
  }
}

// Fonction pour créer les partenaires
async function seedPartners() {
  console.log('🌱 Création des partenaires...\n');

  for (const partnerData of partnersData) {
    console.log(`🤝 Création du partenaire: ${partnerData.organization_name}`);

    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .upsert({
        organization_name: partnerData.organization_name,
        partner_type: partnerData.partner_type,
        sector: partnerData.sector,
        country: partnerData.country,
        website: partnerData.website,
        description: partnerData.description,
        contact_name: partnerData.contact_name,
        contact_email: partnerData.contact_email,
        contact_phone: partnerData.contact_phone,
        contact_position: partnerData.contact_position,
        sponsorship_level: partnerData.sponsorship_level,
        contributions: partnerData.contributions,
        logo: partnerData.logo,
        featured: partnerData.partner_type === 'institutional' || partnerData.partner_type === 'platinum',
        verified: true
      })
      .select()
      .single();

    if (partnerError) {
      console.error(`  ❌ Erreur création partenaire:`, partnerError.message);
    } else {
      console.log(`  ✅ Partenaire créé avec ID: ${partner.id}\n`);
    }
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du seeding complet de la base de données\n');
  console.log('=' .repeat(60) + '\n');

  try {
    await seedExhibitors();
    console.log('=' .repeat(60) + '\n');
    await seedPartners();
    console.log('=' .repeat(60) + '\n');
    console.log('✅ Seeding terminé avec succès !');
    console.log(`📊 ${exhibitorsData.length} exposants créés`);
    console.log(`🤝 ${partnersData.length} partenaires créés`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
