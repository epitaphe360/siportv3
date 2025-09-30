import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const pavilionsData = [
  {
    slug: 'digitalization',
    name: 'Digitalisation Portuaire',
    description: "Technologies numériques transformant l'écosystème portuaire",
    color: '#3b82f6',
    icon: 'Building2',
    order_index: 1,
    featured: true,
    programs: [
      {
        title: 'Démonstration IoT en Temps Réel',
        time: '10:00',
        speaker: 'Dr. Sarah Johnson - PortTech Solutions',
        description: 'Présentation d\'un système IoT complet pour la surveillance et l\'optimisation des opérations portuaires avec capteurs intelligents et analyse prédictive.',
        order_index: 1
      },
      {
        title: 'Atelier Automatisation des Processus',
        time: '14:30',
        speaker: 'Ahmed El Mansouri - AutoPort Systems',
        description: 'Workshop pratique sur l\'automatisation des processus logistiques portuaires avec démonstration de solutions RPA et IA.',
        order_index: 2
      },
      {
        title: 'Présentation Système de Gestion Intégré',
        time: '11:00',
        speaker: 'Marie Dubois - PortFlow Technologies',
        description: 'Démonstration d\'une plateforme unifiée de gestion portuaire intégrant tous les systèmes d\'information et de contrôle.',
        order_index: 3
      }
    ]
  },
  {
    slug: 'sustainability',
    name: 'Durabilité Portuaire',
    description: "Initiatives environnementales pour des ports durables",
    color: '#16a34a',
    icon: 'Globe',
    order_index: 2,
    featured: true,
    programs: [
      {
        title: 'Démonstration Électrification des Quais',
        time: '09:30',
        speaker: 'Dr. Thomas Green - EcoPort Energy',
        description: 'Présentation technologique complète des solutions d\'électrification des navires au quai avec démonstration de bornes de recharge haute puissance.',
        order_index: 1
      },
      {
        title: 'Workshop Économie Circulaire',
        time: '15:00',
        speaker: 'Isabella Rodriguez - Circular Ports Initiative',
        description: 'Session interactive sur les stratégies d\'économie circulaire appliquées aux ports avec études de cas et démonstrations pratiques.',
        order_index: 2
      },
      {
        title: 'Présentation Solutions Hydroliennes',
        time: '10:30',
        speaker: 'Pierre Dubois - Marine Energy Systems',
        description: 'Démonstration de technologies hydroliennes portuaires pour la production d\'énergie renouvelable à partir des courants marins.',
        order_index: 3
      }
    ]
  },
  {
    slug: 'security',
    name: 'Sécurité et Sûreté',
    description: "Solutions pour la sécurité physique et numérique des ports",
    color: '#dc2626',
    icon: 'Users',
    order_index: 3,
    featured: false,
    programs: [
      {
        title: 'Démonstration Cybersécurité Maritime',
        time: '16:00',
        speaker: 'Colonel Marc Dubois - SecureMaritime Systems',
        description: 'Présentation interactive des menaces cybernétiques dans le secteur maritime et démonstration de solutions de protection avancées.',
        order_index: 1
      },
      {
        title: 'Atelier Gestion des Crises',
        time: '13:30',
        speaker: 'Dr. Fatima Al-Zahra - CrisisPort Solutions',
        description: 'Simulation de crise portuaire avec démonstration des protocoles de réponse et des outils de coordination en temps réel.',
        order_index: 2
      },
      {
        title: 'Présentation Systèmes de Surveillance IA',
        time: '14:00',
        speaker: 'Jean-Michel Leroy - AISecurity Ports',
        description: 'Démonstration de caméras intelligentes et de systèmes de surveillance automatisés utilisant l\'intelligence artificielle pour la détection d\'anomalies.',
        order_index: 3
      }
    ]
  },
  {
    slug: 'innovation',
    name: 'Innovation Portuaire',
    description: "Nouvelles technologies et modèles économiques portuaires",
    color: '#9333ea',
    icon: 'Calendar',
    order_index: 4,
    featured: true,
    programs: [
      {
        title: 'Pitch Startup : Drones Portuaires',
        time: '12:00',
        speaker: 'Équipe DronePort - DronePort Startup',
        description: 'Présentation de startups innovantes développant des solutions de drones pour l\'inspection et la surveillance portuaire automatisée.',
        order_index: 1
      },
      {
        title: 'Hackathon Portuaire - Finale',
        time: '16:30',
        speaker: 'Jury Hackathon - SIPORTS Innovation Lab',
        description: 'Présentation des projets développés pendant le hackathon de 48h sur des défis portuaires réels avec démonstration des solutions gagnantes.',
        order_index: 2
      },
      {
        title: 'Networking Startups & Investisseurs',
        time: '11:30',
        speaker: 'Modérateur Innovation - PortInvest Network',
        description: 'Session de réseautage dédiée entre startups portuaires et investisseurs avec démonstration de produits et pitchs rapides.',
        order_index: 3
      },
      {
        title: 'Atelier Blockchain & Supply Chain',
        time: '15:30',
        speaker: 'Dr. Blockchain Expert - ChainPort Technologies',
        description: 'Workshop pratique sur l\'application de la blockchain pour la traçabilité et l\'optimisation des chaînes logistiques portuaires.',
        order_index: 4
      }
    ]
  }
];

async function seedPavilions() {
  console.log('🚀 Starting pavilions data seeding...\n');

  for (const pavilionData of pavilionsData) {
    try {
      const { programs, ...pavilion } = pavilionData;

      console.log(`📦 Inserting pavilion: ${pavilion.name}`);

      const { data: insertedPavilion, error: pavilionError } = await supabase
        .from('pavilions')
        .upsert({ ...pavilion }, { onConflict: 'slug' })
        .select()
        .single();

      if (pavilionError) {
        console.error(`❌ Error inserting pavilion ${pavilion.name}:`, pavilionError);
        continue;
      }

      console.log(`✅ Pavilion "${pavilion.name}" inserted with ID: ${insertedPavilion.id}`);

      if (programs && programs.length > 0) {
        console.log(`   📋 Inserting ${programs.length} programs...`);

        const programsWithPavilionId = programs.map(program => ({
          ...program,
          pavilion_id: insertedPavilion.id
        }));

        const { error: programsError } = await supabase
          .from('pavilion_programs')
          .upsert(programsWithPavilionId);

        if (programsError) {
          console.error(`   ❌ Error inserting programs:`, programsError);
        } else {
          console.log(`   ✅ ${programs.length} programs inserted successfully`);
        }
      }

      console.log('');
    } catch (error) {
      console.error(`❌ Unexpected error processing pavilion:`, error);
    }
  }

  console.log('✨ Pavilions data seeding completed!\n');
}

seedPavilions()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });