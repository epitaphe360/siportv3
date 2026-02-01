#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Contenu enrichi pour chaque exposant
const miniSitesContent = {
  'ABB Marine & Ports': {
    exhibitorId: 'bdc36cff-f8a7-42b5-ad0a-377b83a4afc9',
    sections: [
      {
        type: 'hero',
        content: {
          title: 'ABB Marine & Ports',
          subtitle: 'Automatisation Portuaire Avancée',
          description: 'Solutions numériques intégrées pour moderniser vos opérations portuaires',
          backgroundImage: 'https://images.unsplash.com/photo-1570552886111-e80fcca6a029?w=1200&h=600&fit=crop',
          cta: 'Découvrez nos solutions'
        }
      },
      {
        type: 'about',
        content: {
          title: 'À Propos d\'ABB Marine & Ports',
          description: 'Depuis plus de 130 ans, ABB est un leader mondial en technologie et ingénierie. Dans le secteur maritime et portuaire, nous proposons des solutions d\'automatisation et de numérisation qui optimisent les opérations, réduisent les coûts et améliorent la sécurité.',
          features: [
            'Automatisation intelligente des opérations portuaires',
            'Solutions de suivi et de traçabilité en temps réel',
            'Systèmes d\'énergie renouvelable pour ports',
            'Réduction de 30% des coûts d\'exploitation',
            'Conformité environnementale maximale'
          ]
        }
      },
      {
        type: 'products',
        content: {
          title: 'Nos Solutions Principales',
          products: [
            {
              name: 'PortWorks Automation',
              description: 'Plateforme complète d\'automatisation des terminaux portuaires',
              features: ['Gestion des conteneurs', 'Optimisation des trajets', 'Prévention des incidents'],
              image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop'
            },
            {
              name: 'MarineConnect IoT',
              description: 'Connectivité IoT pour navires et équipements portuaires',
              features: ['Monitoring 24/7', 'Maintenance prédictive', 'Réduction carbone'],
              image: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=300&fit=crop'
            },
            {
              name: 'GreenPort Energy',
              description: 'Solutions d\'énergie propre pour infrastructures portuaires',
              features: ['Panneaux solaires intégrés', 'Stockage d\'énergie', 'Électrification des quais'],
              image: 'https://images.unsplash.com/photo-1509391366360-2e938648ef48?w=400&h=300&fit=crop'
            }
          ]
        }
      },
      {
        type: 'services',
        content: {
          title: 'Services et Support',
          services: [
            {
              icon: '🔧',
              title: 'Installation & Intégration',
              description: 'Mise en place complète et intégration avec systèmes existants'
            },
            {
              icon: '👨‍💼',
              title: 'Formation & Support',
              description: 'Formation complète du personnel et support technique 24/7'
            },
            {
              icon: '📊',
              title: 'Analyse & Optimisation',
              description: 'Audit, analyse de performance et recommandations d\'optimisation'
            }
          ]
        }
      },
      {
        type: 'contact',
        content: {
          title: 'Contactez-nous',
          description: 'Rencontrez notre équipe à SIPORTS 2026',
          email: 'contact@abb.com',
          phone: '+212 5 22 94 94 94',
          website: 'https://www.abb.com/maritime'
        }
      }
    ]
  },
  'Advanced Port Systems': {
    exhibitorId: 'af542668-e467-4ea8-9e2f-33301dafe53c',
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Advanced Port Systems',
          subtitle: 'Systèmes Intelligents pour Ports Modernes',
          description: 'Logiciels et technologies de pointe pour l\'optimisation portuaire',
          backgroundImage: 'https://images.unsplash.com/photo-1573868326374-07da8b87d3a1?w=1200&h=600&fit=crop',
          cta: 'Voir nos projets'
        }
      },
      {
        type: 'about',
        content: {
          title: 'Qui Sommes-nous?',
          description: 'Advanced Port Systems (APS) est spécialisée dans le développement de solutions logicielles avancées pour la gestion intégrée des ports. Notre expertise couvre la planification des opérations, l\'optimisation des ressources et la planification prédictive.',
          features: [
            'Logiciels TMS (Terminal Management System) de dernière génération',
            'Intelligence artificielle pour prévision de la congestion',
            'Intégration avec systèmes d\'automatisation',
            'Réduction des délais d\'accostage de 40%',
            'Traçabilité complète de la cargaison'
          ]
        }
      },
      {
        type: 'products',
        content: {
          title: 'Nos Produits',
          products: [
            {
              name: 'PortFlow TMS',
              description: 'Système de gestion terminale complètement intégré',
              features: ['Planification optimale', 'Allocation ressources', 'Facturation automatique'],
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
            },
            {
              name: 'PredictPort AI',
              description: 'Prévision de la congestion et optimisation des flux',
              features: ['Machine Learning avancé', 'Prévisions en temps réel', 'Alertes intelligentes'],
              image: 'https://images.unsplash.com/photo-1518186285752-4acb81eaf4ad?w=400&h=300&fit=crop'
            },
            {
              name: 'CargoTracker Pro',
              description: 'Suivi complet et traçabilité de la cargaison',
              features: ['Localisation GPS', 'Documentation numérique', 'Bloc de chaîne'],
              image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop'
            }
          ]
        }
      },
      {
        type: 'testimonials',
        content: {
          title: 'Clients Satisfaits',
          testimonials: [
            {
              name: 'Mohamed Ben Ali',
              company: 'Port de Casablanca',
              text: 'APS a révolutionné notre processus de gestion. Réduction de 35% des délais d\'opération!',
              rating: 5
            },
            {
              name: 'Fatima Zahra',
              company: 'Terminal Logistique Tanger',
              text: 'Support technique excellent et formation complète. Très satisfaits du résultat.',
              rating: 5
            }
          ]
        }
      }
    ]
  },
  'Maritime Equipment Co': {
    exhibitorId: '05bde359-ab2c-454a-82f5-d21f298c1976',
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Maritime Equipment Co',
          subtitle: 'Équipements Maritimes Professionnels',
          description: 'Fournisseur leader d\'équipements et de services pour l\'industrie maritime',
          backgroundImage: 'https://images.unsplash.com/photo-1495576857606-8a5fae38f34d?w=1200&h=600&fit=crop',
          cta: 'Parcourir le catalogue'
        }
      },
      {
        type: 'about',
        content: {
          title: 'Notre Expertise',
          description: 'Depuis 25 ans, Maritime Equipment Co fournit des équipements de haute qualité, des systèmes de sécurité et des solutions de maintenance pour navires et installations portuaires.',
          features: [
            'Certification internationale ISO 9001',
            'Produits testés en conditions réelles',
            'Garantie de 5 ans sur équipements',
            'Disponibilité de pièces détachées',
            'Service technique expert'
          ]
        }
      },
      {
        type: 'products',
        content: {
          title: 'Produits Principaux',
          products: [
            {
              name: 'Systèmes de Sécurité Marine',
              description: 'Équipement de sauvetage et systèmes d\'alarme certifiés',
              features: ['Gilets de sauvetage', 'Radeaux de sauvetage', 'Systèmes d\'alerte'],
              image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop'
            },
            {
              name: 'Équipements de Pont',
              description: 'Treuils, poulies et accessoires de qualité premium',
              features: ['Treuils hydrauliques', 'Poulies renforcées', 'Chaînes certifiées'],
              image: 'https://images.unsplash.com/photo-1513294712202-a63fb21a01bb?w=400&h=300&fit=crop'
            },
            {
              name: 'Systèmes de Navigation',
              description: 'Radar, GPS et équipements de navigation avancés',
              features: ['Radar 3D', 'GPS haute précision', 'ECDIS intégré'],
              image: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=400&h=300&fit=crop'
            },
            {
              name: 'Pièces Détachées',
              description: 'Inventaire complet de pièces de rechange authentiques',
              features: ['Disponibilité 24/7', 'Livraison rapide', 'Garantie d\'origine'],
              image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop'
            }
          ]
        }
      },
      {
        type: 'certifications',
        content: {
          title: 'Certifications et Normes',
          certifications: ['ISO 9001', 'ISO 14001', 'IMCA', 'SOLAS', 'IMO']
        }
      }
    ]
  },
  'StartUp Port Innovations': {
    exhibitorId: 'f86febbd-5c7a-431d-a989-4d0c58242b12',
    sections: [
      {
        type: 'hero',
        content: {
          title: 'StartUp Port Innovations',
          subtitle: 'Innovation Numérique pour Ports du Futur',
          description: 'Solutions disruptives pour la transformation digitale des ports',
          backgroundImage: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
          cta: 'Découvrir l\'innovation'
        }
      },
      {
        type: 'about',
        content: {
          title: 'Notre Mission',
          description: 'StartUp Port Innovations révolutionne l\'industrie portuaire en combinant l\'IA, la blockchain et l\'IoT. Notre mission est de créer les ports intelligents de demain.',
          features: [
            'Technologies blockchain pour transparence',
            'Automatisation par drones et robots',
            'Prévention zéro émission carbone',
            'Plateforme open source',
            'Partenaires académiques internationaux'
          ]
        }
      },
      {
        type: 'products',
        content: {
          title: 'Solutions Innovantes',
          products: [
            {
              name: 'PortChain Blockchain',
              description: 'Système de traçabilité basé sur la blockchain',
              features: ['Transparent', 'Immuable', 'Décentralisé'],
              image: 'https://images.unsplash.com/photo-1460925895917-adf4e565db1d?w=400&h=300&fit=crop'
            },
            {
              name: 'DronePort Fleet',
              description: 'Système d\'inspection et de chargement par drones',
              features: ['Contrôle automatisé', 'Sécurité maximale', 'Réduction des coûts'],
              image: 'https://images.unsplash.com/photo-1518873422760-92db51c56b1f?w=400&h=300&fit=crop'
            },
            {
              name: 'GreenPort Zero',
              description: 'Plateforme pour ports 100% neutres en carbone',
              features: ['Suivi émissions', 'Énergies renouvelables', 'Rapports automatisés'],
              image: 'https://images.unsplash.com/photo-1497935586351-b8810fdc37fa?w=400&h=300&fit=crop'
            },
            {
              name: 'PortAI Analytics',
              description: 'Analyse prédictive basée sur l\'IA pour optimisation portuaire',
              features: ['Machine Learning avancé', 'Prévisions précises', 'Dashboards temps réel'],
              image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'
            }
          ]
        }
      },
      {
        type: 'team',
        content: {
          title: 'Notre Équipe',
          description: 'Une équipe jeune et dynamique composée de développeurs, d\'ingénieurs et de maritimiers passionnés',
          teamSize: '25 experts',
          founded: '2022',
          location: 'Casablanca, Maroc'
        }
      }
    ]
  }
};

async function updateMiniSitesContent() {
  console.log('\n' + '='.repeat(80));
  console.log('🔄 MISE À JOUR DU CONTENU DES MINI-SITES');
  console.log('='.repeat(80) + '\n');

  try {
    let updatedCount = 0;
    let errorCount = 0;

    for (const [companyName, miniSiteData] of Object.entries(miniSitesContent)) {
      try {
        console.log(`📝 Mise à jour: ${companyName}...`);

        // Récupérer le mini-site existant
        const { data: existingMiniSite, error: fetchError } = await supabase
          .from('mini_sites')
          .select('id')
          .eq('exhibitor_id', miniSiteData.exhibitorId)
          .single();

        if (fetchError || !existingMiniSite) {
          console.log(`   ❌ Mini-site non trouvé pour ${companyName}`);
          errorCount++;
          continue;
        }

        // Mettre à jour avec le nouveau contenu
        const { data: updated, error: updateError } = await supabase
          .from('mini_sites')
          .update({
            sections: miniSiteData.sections
          })
          .eq('exhibitor_id', miniSiteData.exhibitorId)
          .select()
          .single();

        if (updateError) {
          console.log(`   ❌ Erreur: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Contenu enrichi`);
          console.log(`      • ${miniSiteData.sections.length} sections`);
          const productCount = miniSiteData.sections.find(s => s.type === 'products')?.content?.products?.length || 0;
          if (productCount > 0) {
            console.log(`      • ${productCount} produits/services`);
          }
          updatedCount++;
        }
      } catch (error) {
        console.log(`   ❌ ${companyName}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Résumé des mises à jour:`);
    console.log(`   ✅ Mini-sites mis à jour: ${updatedCount}/4`);
    console.log(`   ❌ Erreurs: ${errorCount}\n`);

    // Vérifier le contenu
    console.log('🔍 Vérification du contenu...\n');
    const { data: allMiniSites } = await supabase
      .from('mini_sites')
      .select('exhibitor_id, sections')
      .limit(4);

    if (allMiniSites) {
      for (const site of allMiniSites) {
        const exhibitorName = Object.keys(miniSitesContent).find(
          key => miniSitesContent[key].exhibitorId === site.exhibitor_id
        );
        console.log(`✅ ${exhibitorName || 'Unknown'}`);
        console.log(`   Sections: ${site.sections.length}`);
        site.sections.forEach(section => {
          console.log(`   • ${section.type}`);
        });
        console.log();
      }
    }

    console.log('='.repeat(80));
    console.log('✨ Mise à jour du contenu terminée !');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  }
}

updateMiniSitesContent();
