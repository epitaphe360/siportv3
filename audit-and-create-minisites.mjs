#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Données pour les mini-sites de test
const miniSiteTemplates = {
  'TechMarine Solutions': {
    theme: 'modern',
    custom_colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'TechMarine Solutions',
          subtitle: 'Innovations Marines Numériques',
          description: 'Solutions de pointe pour l\'industrie maritime'
        }
      },
      {
        type: 'about',
        content: {
          title: 'À propos',
          description: 'Spécialisée dans les technologies marines avancées depuis 2015'
        }
      },
      {
        type: 'products',
        content: {
          products: [
            { name: 'SonarPro AI', description: 'Système de détection intelligent' },
            { name: 'SeaTrack', description: 'Suivi de flotte en temps réel' }
          ]
        }
      }
    ]
  },
  'LogiportHub': {
    theme: 'professional',
    custom_colors: { primary: '#0369a1', secondary: '#0ea5e9', accent: '#38bdf8' },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'LogiportHub',
          subtitle: 'Logistique Portuaire Intégrée',
          description: 'Plateforme complète de gestion logistique'
        }
      },
      {
        type: 'about',
        content: {
          title: 'À propos',
          description: 'Leader en solutions logistiques portuaires au Maroc'
        }
      },
      {
        type: 'services',
        content: {
          services: ['Gestion de conteneurs', 'Optimisation des trajets', 'Traçabilité complète']
        }
      }
    ]
  },
  'CargoDirect': {
    theme: 'modern',
    custom_colors: { primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'CargoDirect',
          subtitle: 'Transport et Fret',
          description: 'Solutions de fret flexible et fiable'
        }
      },
      {
        type: 'about',
        content: {
          title: 'À propos',
          description: 'Spécialiste du transport de fret international'
        }
      }
    ]
  },
  'InstitutionMaritime': {
    theme: 'elegant',
    custom_colors: { primary: '#1f2937', secondary: '#4b5563', accent: '#6b7280' },
    sections: [
      {
        type: 'hero',
        content: {
          title: 'Institution Maritime',
          subtitle: 'Formation et Recherche',
          description: 'Centre de formation maritime de référence'
        }
      },
      {
        type: 'about',
        content: {
          title: 'À propos',
          description: 'Institut de recherche et formation maritimes depuis 1985'
        }
      }
    ]
  }
};

async function auditAndCreateMiniSites() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 AUDIT ET CRÉATION DE MINI-SITES');
  console.log('='.repeat(80) + '\n');

  try {
    // 1. Récupérer tous les exposants
    console.log('📊 Étape 1: Récupération des exposants...');
    const { data: exhibitors, error: exhibError } = await supabase
      .from('exhibitors')
      .select('id, user_id, company_name, description, logo_url');

    if (exhibError) {
      throw new Error(`Erreur lors de la récupération des exposants: ${exhibError.message}`);
    }

    console.log(`✅ ${exhibitors?.length || 0} exposant(s) trouvé(s)\n`);

    if (!exhibitors || exhibitors.length === 0) {
      console.log('❌ Aucun exposant trouvé dans la base de données');
      return;
    }

    // 2. Récupérer les mini-sites existants
    console.log('📊 Étape 2: Récupération des mini-sites existants...');
    const { data: miniSites, error: msError } = await supabase
      .from('mini_sites')
      .select('id, exhibitor_id, published');

    if (msError) {
      throw new Error(`Erreur lors de la récupération des mini-sites: ${msError.message}`);
    }

    console.log(`✅ ${miniSites?.length || 0} mini-site(s) trouvé(s)\n`);

    // 3. Identifier les exposants sans mini-site
    console.log('📊 Étape 3: Identification des exposants sans mini-site...\n');
    
    const miniSitesByExhibitorId = new Map(
      miniSites?.map(ms => [ms.exhibitor_id, ms]) || []
    );

    const exhibitorsWithoutMiniSite = [];
    const exhibitorsWithMiniSite = [];

    for (const exhibitor of exhibitors) {
      if (miniSitesByExhibitorId.has(exhibitor.id)) {
        exhibitorsWithMiniSite.push(exhibitor);
        console.log(`✅ ${exhibitor.company_name}: Mini-site existant`);
      } else {
        exhibitorsWithoutMiniSite.push(exhibitor);
        console.log(`❌ ${exhibitor.company_name}: AUCUN mini-site`);
      }
    }

    console.log(`\n📈 Résumé:`);
    console.log(`   • Exposants avec mini-site: ${exhibitorsWithMiniSite.length}`);
    console.log(`   • Exposants SANS mini-site: ${exhibitorsWithoutMiniSite.length}\n`);

    // 4. Créer les mini-sites manquants
    if (exhibitorsWithoutMiniSite.length > 0) {
      console.log('🚀 Étape 4: Création des mini-sites manquants...\n');

      let createdCount = 0;
      let skippedCount = 0;

      for (const exhibitor of exhibitorsWithoutMiniSite) {
        try {
          // Chercher le template correspondant
          let template = miniSiteTemplates[exhibitor.company_name];
          
          if (!template) {
            // Si pas de template spécifique, créer un générique
            console.log(`⚠️  Pas de template pour "${exhibitor.company_name}", création d'un mini-site générique...`);
            template = {
              theme: 'modern',
              custom_colors: { primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd' },
              sections: [
                {
                  type: 'hero',
                  content: {
                    title: exhibitor.company_name,
                    subtitle: 'Bienvenue',
                    description: exhibitor.description || 'Découvrez notre entreprise'
                  }
                },
                {
                  type: 'about',
                  content: {
                    title: 'À propos de nous',
                    description: exhibitor.description || 'Découvrez qui nous sommes et nos services'
                  }
                }
              ]
            };
          }

          // Insérer le mini-site
          const { data: newMiniSite, error: createError } = await supabase
            .from('mini_sites')
            .insert({
              exhibitor_id: exhibitor.id,
              theme: template.theme,
              custom_colors: template.custom_colors,
              sections: template.sections,
              published: true, // ✅ Publier automatiquement
              views: 0,
              last_updated: new Date().toISOString(),
              created_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.log(`   ❌ ${exhibitor.company_name}: ${createError.message}`);
            skippedCount++;
          } else {
            console.log(`   ✅ ${exhibitor.company_name}: Mini-site créé (ID: ${newMiniSite.id})`);
            createdCount++;
          }
        } catch (error) {
          console.log(`   ❌ ${exhibitor.company_name}: Erreur - ${error.message}`);
          skippedCount++;
        }
      }

      console.log(`\n📊 Résultats de création:`);
      console.log(`   • Mini-sites créés: ${createdCount}`);
      console.log(`   • Erreurs: ${skippedCount}\n`);
    } else {
      console.log('✅ Tous les exposants ont un mini-site !\n');
    }

    // 5. Afficher l'URL d'accès pour chaque mini-site
    console.log('🔗 URLs d\'accès des mini-sites:\n');
    for (const exhibitor of exhibitors) {
      const hasMiniSite = miniSitesByExhibitorId.has(exhibitor.id) || 
                          exhibitorsWithoutMiniSite.includes(exhibitor);
      const icon = hasMiniSite ? '✅' : '❌';
      console.log(`   ${icon} ${exhibitor.company_name}`);
      console.log(`      http://localhost:5173/minisite/${exhibitor.id}\n`);
    }

    console.log('='.repeat(80));
    console.log('✨ Audit et création terminés !');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    process.exit(1);
  }
}

auditAndCreateMiniSites();
