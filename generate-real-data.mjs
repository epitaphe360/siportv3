import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Configuration Supabase manquante dans le fichier .env');
  console.error('Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Utiliser la clé service_role pour contourner les politiques RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Données pour générer des valeurs réalistes
const countries = [
  'France', 'Espagne', 'Italie', 'Portugal', 'Maroc', 'Tunisie',
  'Algérie', 'Turquie', 'Grèce', 'Chypre', 'Malte', 'Égypte'
];

const companyNames = [
  'Maritime Solutions Inc', 'Port Tech Systems', 'Naval Engineering Corp',
  'Harbor Logistics Ltd', 'Ocean Freight Services', 'Coastal Shipping Co',
  'Port Authority Solutions', 'Maritime Security Systems', 'Cargo Handling Pro',
  'Terminal Management Inc', 'Ship Repair Services', 'Port Infrastructure Ltd',
  'Maritime Consulting Group', 'Harbor Development Corp', 'Shipping Tech Solutions',
  'Port Operations Management', 'Maritime Training Center', 'Coastal Engineering',
  'Harbor Maintenance Services', 'Shipping Logistics Pro', 'Port Security Systems',
  'Maritime Technology Hub', 'Harbor Expansion Corp', 'Ocean Transport Solutions',
  'Port Digital Services', 'Maritime Innovation Lab'
];

// Catégories valides selon les enums de la base
const validCategories = ['port-industry', 'port-operations'];
const validSectors = ['technology', 'manufacturing', 'logistics', 'consulting'];

const eventTitles = [
  'Conférence Innovation Portuaire', 'Atelier Cybersécurité Maritime',
  'Sommet Logistique Portuaire', 'Forum Technologies Maritimes',
  'Colloque Développement Durable', 'Séminaire Sécurité Portuaire',
  'Congrès Transport Maritime', 'Workshop Intelligence Artificielle'
];

const firstNames = [
  'Jean', 'Marie', 'Pierre', 'Sophie', 'Michel', 'Isabelle', 'Philippe', 'Catherine',
  'Antoine', 'Valérie', 'François', 'Nathalie', 'Louis', 'Anne', 'Thomas', 'Julie',
  'Nicolas', 'Émilie', 'David', 'Sandrine', 'Patrick', 'Christine', 'Christophe', 'Stéphanie'
];

const lastNames = [
  'Dupont', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit',
  'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia',
  'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André'
];

function generateRandomEmail(firstName, lastName, type, index) {
  const domain = type === 'visitor' ? 'visitor.com' : type === 'exhibitor' ? 'company.com' : 'partner.com';
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@${domain}`;
}

function generateRandomPhone() {
  return `+33${Math.floor(Math.random() * 900000000 + 100000000)}`;
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function generateRealisticData() {
  console.log('🚀 Génération de données réalistes pour SIPORTS...\n');

  try {
    // 1. Générer 1200+ visiteurs de 12 pays
    console.log('👥 Génération de 1200+ visiteurs...');
    const visitors = [];
    for (let i = 0; i < 1250; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const country = getRandomElement(countries);

      visitors.push({
        id: randomUUID(),
        email: generateRandomEmail(firstName, lastName, 'visitor', i + 1),
        name: `${firstName} ${lastName}`,
        type: 'visitor',
        profile: {
          firstName,
          lastName,
          company: `${country} Port Authority`,
          position: getRandomElement(['Ingénieur', 'Directeur', 'Capitaine', 'Consultant', 'Technicien']),
          phone: generateRandomPhone(),
          country
        }
      });
    }

    // Insérer les visiteurs par lots de 100
    for (let i = 0; i < visitors.length; i += 100) {
      const batch = visitors.slice(i, i + 100);
      const { error } = await supabase.from('users').upsert(batch);
      if (error) {
        console.error(`❌ Erreur insertion visiteurs batch ${Math.floor(i/100) + 1}:`, error.message);
      } else {
        console.log(`✅ Batch visiteurs ${Math.floor(i/100) + 1}/${Math.ceil(visitors.length/100)} inséré`);
      }
    }

    // 2. Générer 24+ exposants
    console.log('\n🏢 Génération de 24+ exposants...');
    const exhibitors = [];
    for (let i = 0; i < 26; i++) {
      const companyName = companyNames[i] || `${getRandomElement(firstNames)} Maritime Solutions`;
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);

      exhibitors.push({
        id: randomUUID(),
        user_id: randomUUID(),
        company_name: companyName,
        category: getRandomElement(validCategories), // Utiliser seulement les catégories valides
        sector: getRandomElement(validSectors),
        description: `Solutions innovantes pour l'industrie maritime - ${companyName}`,
        logo_url: `https://example.com/logo${i + 1}.png`,
        website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        verified: Math.random() > 0.2, // 80% vérifiés
        featured: Math.random() > 0.7, // 30% featured
        contact_info: {
          email: generateRandomEmail(firstName, lastName, 'exhibitor', i + 1),
          phone: generateRandomPhone(),
          address: `${Math.floor(Math.random() * 200) + 1} Port Street, Marseille`
        }
      });
    }

    // Créer d'abord les utilisateurs pour les exposants
    const exhibitorUsers = exhibitors.map((ex, index) => ({
      id: ex.user_id,
      email: ex.contact_info.email,
      name: ex.company_name,
      type: 'exhibitor',
      profile: {
        firstName: getRandomElement(firstNames),
        lastName: getRandomElement(lastNames),
        company: ex.company_name,
        position: 'Directeur Commercial',
        phone: ex.contact_info.phone
      }
    }));

    for (let i = 0; i < exhibitorUsers.length; i += 50) {
      const batch = exhibitorUsers.slice(i, i + 50);
      const { error } = await supabase.from('users').upsert(batch);
      if (error) {
        console.error(`❌ Erreur insertion utilisateurs exposants batch ${Math.floor(i/50) + 1}:`, error.message);
      }
    }

    // Insérer les exposants
    for (let i = 0; i < exhibitors.length; i += 50) {
      const batch = exhibitors.slice(i, i + 50);
      const { error } = await supabase.from('exhibitors').upsert(batch);
      if (error) {
        console.error(`❌ Erreur insertion exposants batch ${Math.floor(i/50) + 1}:`, error.message);
      } else {
        console.log(`✅ Batch exposants ${Math.floor(i/50) + 1}/${Math.ceil(exhibitors.length/50)} inséré`);
      }
    }

    // 3. Générer 8+ événements/conférences
    console.log('\n📅 Génération de 8+ événements...');
    const events = [];
    for (let i = 0; i < 10; i++) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 30) + 1);

      events.push({
        id: randomUUID(),
        title: eventTitles[i] || `Événement Maritime ${i + 1}`,
        description: `Découvrez les dernières innovations et tendances dans le domaine maritime - ${eventTitles[i] || 'Événement spécial'}`,
        type: i < 4 ? 'conference' : getRandomElement(['workshop', 'conference']),
        event_date: eventDate.toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        capacity: Math.floor(Math.random() * 200) + 50,
        registered: Math.floor(Math.random() * 150) + 20,
        category: getRandomElement(['Innovation', 'Sécurité', 'Technologie', 'Logistique', 'Environnement']),
        virtual: Math.random() > 0.7,
        featured: Math.random() > 0.6,
        location: 'Palais des Congrès, Marseille',
        tags: ['maritime', 'innovation', 'technologie', 'ports']
      });
    }

    for (let i = 0; i < events.length; i += 10) {
      const batch = events.slice(i, i + 10);
      const { error } = await supabase.from('events').upsert(batch);
      if (error) {
        console.error(`❌ Erreur insertion événements batch ${Math.floor(i/10) + 1}:`, error.message);
      } else {
        console.log(`✅ Batch événements ${Math.floor(i/10) + 1}/${Math.ceil(events.length/10)} inséré`);
      }
    }

    // 4. Générer quelques partenaires
    console.log('\n🤝 Génération de partenaires...');
    const partners = [];
    for (let i = 0; i < 8; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);

      partners.push({
        id: randomUUID(),
        email: generateRandomEmail(firstName, lastName, 'partner', i + 1),
        name: `${firstName} ${lastName} Consulting`,
        type: 'partner',
        profile: {
          firstName,
          lastName,
          company: `${getRandomElement(countries)} Logistics`,
          position: 'Directeur',
          phone: generateRandomPhone()
        }
      });
    }

    const { error: partnerError } = await supabase.from('users').upsert(partners);
    if (partnerError) {
      console.error('❌ Erreur insertion partenaires:', partnerError.message);
    } else {
      console.log('✅ Partenaires insérés');
    }

    console.log('\n🎉 Génération terminée!');
    console.log('\n📊 Résumé des données générées:');
    console.log('================================');
    console.log(`👥 Visiteurs: ${visitors.length}`);
    console.log(`🏢 Exposants: ${exhibitors.length}`);
    console.log(`🤝 Partenaires: ${partners.length}`);
    console.log(`📅 Événements: ${events.length}`);
    console.log(`🌍 Pays représentés: ${countries.length}`);

    console.log('\n🔄 Actualisez votre page pavilions pour voir les vraies valeurs!');

  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error);
    console.error('Détails:', error.message);
  }
}

generateRealisticData();
