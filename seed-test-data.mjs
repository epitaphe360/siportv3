import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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

async function seedTestData() {
  console.log('🌱 Insertion des données de test dans Supabase...\n');

  try {
    // 1. Créer des utilisateurs de test
    console.log('👥 Création des utilisateurs...');
    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@siports.com',
        name: 'Admin SIPORTS',
        type: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'SIPORTS',
          company: 'SIPORTS',
          position: 'Administrateur',
          phone: '+33123456789'
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'exhibitor1@test.com',
        name: 'Maritime Solutions Inc',
        type: 'exhibitor',
        profile: {
          firstName: 'Jean',
          lastName: 'Dupont',
          company: 'Maritime Solutions Inc',
          position: 'Directeur Commercial',
          phone: '+33123456790'
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'exhibitor2@test.com',
        name: 'Port Tech Systems',
        type: 'exhibitor',
        profile: {
          firstName: 'Marie',
          lastName: 'Martin',
          company: 'Port Tech Systems',
          position: 'CEO',
          phone: '+33123456791'
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'partner@test.com',
        name: 'Logistics Pro',
        type: 'partner',
        profile: {
          firstName: 'Pierre',
          lastName: 'Dubois',
          company: 'Logistics Pro',
          position: 'Directeur',
          phone: '+33123456792'
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'visitor1@test.com',
        name: 'Sophie Bernard',
        type: 'visitor',
        profile: {
          firstName: 'Sophie',
          lastName: 'Bernard',
          company: 'Port Authority',
          position: 'Ingénieur',
          phone: '+33123456793'
        }
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'visitor2@test.com',
        name: 'Michel Leroy',
        type: 'visitor',
        profile: {
          firstName: 'Michel',
          lastName: 'Leroy',
          company: 'Shipping Corp',
          position: 'Captain',
          phone: '+33123456794'
        }
      }
    ];

    for (const user of users) {
      const { error } = await supabase.from('users').upsert(user);
      if (error) {
        console.error(`❌ Erreur création utilisateur ${user.email}:`, error.message);
      } else {
        console.log(`✅ Utilisateur créé: ${user.email}`);
      }
    }

    // 2. Créer des exposants avec les champs de base uniquement
    console.log('\n🏢 Création des exposants...');
    const exhibitors = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440002', // Utilisateur exhibitor1@test.com
        company_name: 'Maritime Solutions Inc',
        category: 'port-industry', // Valeur enum valide
        sector: 'technology',
        description: 'Solutions technologiques pour les ports modernes',
        logo_url: '/logoheader.jpg',
        website: 'https://maritime-solutions.com',
        verified: true, // Exposant vérifié
        featured: true, // Contrat actif
        contact_info: {
          email: 'contact@maritime-solutions.com',
          phone: '+33123456790',
          address: '123 Port Street, Marseille'
        }
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440003', // Utilisateur exhibitor2@test.com
        company_name: 'Port Tech Systems',
        category: 'port-operations', // Valeur enum valide
        sector: 'manufacturing',
        description: 'Équipements portuaires de haute technologie',
        logo_url: '/siports-logo.jpg',
        website: 'https://port-tech.com',
        verified: true, // Exposant vérifié
        featured: false,
        contact_info: {
          email: 'info@port-tech.com',
          phone: '+33123456791',
          address: '456 Harbor Road, Le Havre'
        }
      }
    ];

    for (const exhibitor of exhibitors) {
      try {
        console.log(`📝 Tentative de création: ${exhibitor.company_name} (${exhibitor.category})`);
        const { error } = await supabase.from('exhibitors').upsert(exhibitor);
        if (error) {
          console.error(`❌ Erreur création exposant ${exhibitor.company_name}:`, error.message);
          console.error('Détails de l\'erreur:', error.details);
          console.error('Code d\'erreur:', error.code);
          console.error('Données envoyées:', JSON.stringify(exhibitor, null, 2));
        } else {
          console.log(`✅ Exposant créé: ${exhibitor.company_name}`);
        }
      } catch (err) {
        console.error(`❌ Exception lors de la création de ${exhibitor.company_name}:`, err.message);
        console.error('Stack trace:', err.stack);
      }
    }

    // 3. Créer des événements
    console.log('\n📅 Création des événements...');
    const events = [
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        title: 'Conférence Innovation Portuaire',
        description: 'Découvrez les dernières innovations technologiques pour les ports',
        type: 'conference',
        event_date: '2025-10-15',
        start_time: '09:00',
        end_time: '17:00',
        capacity: 200,
        registered: 150,
        category: 'Innovation',
        virtual: false,
        featured: true,
        location: 'Palais des Congrès, Marseille',
        tags: ['innovation', 'technologie', 'ports']
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        title: 'Atelier Cybersécurité Maritime',
        description: 'Sécurisation des systèmes informatiques portuaires',
        type: 'workshop',
        event_date: '2025-10-16',
        start_time: '14:00',
        end_time: '16:00',
        capacity: 50,
        registered: 35,
        category: 'Sécurité',
        virtual: true,
        featured: false,
        meeting_link: 'https://meet.siports.com/workshop-cyber',
        tags: ['cybersécurité', 'sécurité', 'maritime']
      }
    ];

    for (const event of events) {
      const { error } = await supabase.from('events').upsert(event);
      if (error) {
        console.error(`❌ Erreur création événement ${event.title}:`, error.message);
      } else {
        console.log(`✅ Événement créé: ${event.title}`);
      }
    }

    // 4. Créer des mini-sites (seulement si les exposants ont été créés)
    console.log('\n🌐 Création des mini-sites...');

    // Vérifier d'abord si les exposants existent
    const { data: existingExhibitors, error: checkError } = await supabase
      .from('exhibitors')
      .select('id, company_name')
      .in('id', ['660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002']);

    if (checkError || !existingExhibitors || existingExhibitors.length === 0) {
      console.log('⚠️ Aucun exposant trouvé, skipping mini-sites...');
    } else {
      console.log(`✅ ${existingExhibitors.length} exposant(s) trouvé(s), création des mini-sites...`);

      const miniSites = [
        {
          id: '880e8400-e29b-41d4-a716-446655440001',
          exhibitor_id: '660e8400-e29b-41d4-a716-446655440001',
          theme: 'modern',
          custom_colors: {
            primary: '#1e40af',
            secondary: '#3b82f6',
            accent: '#60a5fa'
          },
          sections: [
            {
              id: 'hero',
              type: 'hero',
              title: 'Bienvenue chez Maritime Solutions',
              content: 'Leader en solutions technologiques portuaires'
            }
          ],
          published: true, // Mini-site publié
          views: 1250
        },
        {
          id: '880e8400-e29b-41d4-a716-446655440002',
          exhibitor_id: '660e8400-e29b-41d4-a716-446655440002',
          theme: 'classic',
          custom_colors: {
            primary: '#059669',
            secondary: '#10b981',
            accent: '#34d399'
          },
          sections: [
            {
              id: 'hero',
              type: 'hero',
              title: 'Port Tech Systems',
              content: 'Équipements portuaires innovants'
            }
          ],
          published: false, // Mini-site non publié - contenu à modérer
          views: 0
        }
      ];

      for (const miniSite of miniSites) {
        try {
          const { error } = await supabase.from('mini_sites').upsert(miniSite);
          if (error) {
            console.error(`❌ Erreur création mini-site:`, error.message);
            console.error('Détails de l\'erreur:', error.details);
          } else {
            console.log(`✅ Mini-site créé pour ${miniSite.exhibitor_id}`);
          }
        } catch (err) {
          console.error(`❌ Exception lors de la création du mini-site:`, err.message);
        }
      }
    }

    console.log('\n🎉 Données de test insérées avec succès!');
    console.log('\n📊 Résultats attendus dans le tableau de bord:');
    console.log('=====================================');
    console.log('👥 Total utilisateurs: 6');
    console.log('🔥 Utilisateurs actifs: 1 (20% de 6)');
    console.log('🏢 Total exposants: 2 (1 vérifié, 1 non vérifié)');
    console.log('🤝 Total partenaires: 1');
    console.log('👤 Total visiteurs: 2');
    console.log('📅 Total événements: 2');
    console.log('⏳ Comptes à valider: 1 (exposant non vérifié)');
    console.log('📋 Contrats actifs: 1 (exposant featured)');
    console.log('🔍 Contenus à modérer: 1 (mini-site non publié)');

    console.log('\n🔄 Actualisez votre tableau de bord pour voir les vraies valeurs!');

  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
  }
}

seedTestData();
