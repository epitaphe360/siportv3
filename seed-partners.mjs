import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function seedPartners() {
  console.log('🌱 Importation de partenaires de test...\n');

  const testPartners = [
    {
      company_name: 'Port Authority International',
      partner_type: 'institutional',
      sector: 'Government',
      description: 'Autorité portuaire internationale régulant les standards maritimes',
      logo_url: 'https://example.com/partner1.png',
      website: 'https://www.portauthority.org',
      verified: true,
      featured: true,
      partnership_level: 'platinum',
      contact_info: { country: 'France', email: 'contact@portauthority.org' },
      benefits: ['Infrastructure', 'Regulation']
    },
    {
      company_name: 'Maritime Innovation Group',
      partner_type: 'platinum',
      sector: 'Technology',
      description: 'Leader mondial des solutions technologiques pour le secteur maritime',
      logo_url: 'https://example.com/partner2.png',
      website: 'https://www.maritimeinnov.com',
      verified: true,
      featured: true,
      partnership_level: 'platinum',
      contact_info: { country: 'États-Unis', email: 'info@maritimeinnov.com' },
      benefits: ['Innovation', 'Digital Solutions']
    },
    {
      company_name: 'Global Shipping Alliance',
      partner_type: 'gold',
      sector: 'Logistics',
      description: 'Alliance mondiale de compagnies de transport maritime',
      logo_url: 'https://example.com/partner3.png',
      website: 'https://www.globalshipping.com',
      verified: true,
      featured: false,
      partnership_level: 'gold',
      contact_info: { country: 'Royaume-Uni', email: 'contact@globalshipping.com' },
      benefits: ['Networking', 'Best Practices']
    }
  ];

  const { data, error } = await supabase
    .from('partners')
    .insert(testPartners)
    .select();

  if (error) {
    console.error('❌ Erreur lors de l\'import:', error);
  } else {
    console.log(`✅ ${data.length} partenaires importés avec succès !`);
    console.log('\nPartenaires créés:');
    data.forEach(p => console.log(`- ${p.company_name} (${p.partner_type})`));
  }
}

seedPartners();
