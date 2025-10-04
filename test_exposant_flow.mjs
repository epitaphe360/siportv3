#!/usr/bin/env node

/**
 * Script de test du flux complet :
 * 1. Créer un exposant
 * 2. Valider l'exposant (admin)
 * 3. Créer le mini-site automatiquement
 * 4. Vérifier l'affichage du mini-site
 */

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Données de test
const testExhibitor = {
  email: `test-exposant-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  companyName: 'Test Company Solutions',
  sector: 'Technology',
  category: 'port-industry',
  description: 'Une entreprise de test pour valider le flux complet',
  website: 'https://example.com'
};

let createdUserId = null;
let createdExhibitorId = null;

console.log('🚀 Début du test du flux complet...\n');

// Étape 1 : Créer un exposant
async function step1_createExhibitor() {
  console.log('📝 ÉTAPE 1 : Création de l\'exposant...');
  
  try {
    // Créer l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testExhibitor.email,
      password: testExhibitor.password,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', authError);
      return false;
    }

    createdUserId = authData.user.id;
    console.log(`✅ Utilisateur créé avec l'ID: ${createdUserId}`);

    // Créer le profil utilisateur
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: createdUserId,
        email: testExhibitor.email,
        name: testExhibitor.companyName,
        type: 'exhibitor',
        profile: {
          companyName: testExhibitor.companyName,
          sector: testExhibitor.sector
        }
      });

    if (userError) {
      console.error('❌ Erreur lors de la création du profil utilisateur:', userError);
      return false;
    }

    console.log('✅ Profil utilisateur créé');

    // Créer le profil exposant
    const { data: exhibitorData, error: exhibitorError } = await supabase
      .from('exhibitors')
      .insert({
        user_id: createdUserId,
        company_name: testExhibitor.companyName,
        category: testExhibitor.category,
        sector: testExhibitor.sector,
        description: testExhibitor.description,
        website: testExhibitor.website,
        verified: false,
        featured: false,
        contact_info: {
          email: testExhibitor.email,
          website: testExhibitor.website
        }
      })
      .select()
      .single();

    if (exhibitorError) {
      console.error('❌ Erreur lors de la création du profil exposant:', exhibitorError);
      return false;
    }

    createdExhibitorId = exhibitorData.id;
    console.log(`✅ Profil exposant créé avec l'ID: ${createdExhibitorId}`);
    console.log('✅ ÉTAPE 1 TERMINÉE\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Étape 2 : Valider l'exposant (admin)
async function step2_validateExhibitor() {
  console.log('✅ ÉTAPE 2 : Validation de l\'exposant par l\'admin...');
  
  try {
    // Vérifier l'exposant
    const { error: exhibitorError } = await supabase
      .from('exhibitors')
      .update({ verified: true, featured: true })
      .eq('id', createdExhibitorId);

    if (exhibitorError) {
      console.error('❌ Erreur lors de la vérification de l\'exposant:', exhibitorError);
      return false;
    }

    console.log('✅ Exposant validé et vérifié');
    console.log('✅ ÉTAPE 2 TERMINÉE\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Étape 3 : Créer le mini-site automatiquement
async function step3_createMiniSite() {
  console.log('🎨 ÉTAPE 3 : Création du mini-site...');
  
  try {
    // Créer le mini-site
    const { data: miniSiteData, error: miniSiteError } = await supabase
      .from('mini_sites')
      .insert({
        exhibitor_id: createdExhibitorId,
        theme: 'professional',
        custom_colors: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#60a5fa'
        },
        sections: [
          {
            type: 'hero',
            title: testExhibitor.companyName,
            subtitle: 'Solutions innovantes pour l\'industrie portuaire',
            backgroundImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
          },
          {
            type: 'about',
            title: 'À propos',
            description: testExhibitor.description
          },
          {
            type: 'products',
            title: 'Nos produits',
            items: []
          },
          {
            type: 'contact',
            title: 'Contactez-nous',
            email: testExhibitor.email,
            website: testExhibitor.website
          }
        ],
        published: true,
        views: 0
      })
      .select()
      .single();

    if (miniSiteError) {
      console.error('❌ Erreur lors de la création du mini-site:', miniSiteError);
      return false;
    }

    console.log(`✅ Mini-site créé avec l'ID: ${miniSiteData.id}`);
    console.log('✅ ÉTAPE 3 TERMINÉE\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Étape 4 : Vérifier l'affichage du mini-site
async function step4_verifyMiniSite() {
  console.log('🔍 ÉTAPE 4 : Vérification de l\'affichage du mini-site...');
  
  try {
    // Récupérer le mini-site
    const { data: miniSite, error: miniSiteError } = await supabase
      .from('mini_sites')
      .select('*')
      .eq('exhibitor_id', createdExhibitorId)
      .single();

    if (miniSiteError) {
      console.error('❌ Erreur lors de la récupération du mini-site:', miniSiteError);
      return false;
    }

    console.log('✅ Mini-site récupéré avec succès');
    console.log(`   - ID: ${miniSite.id}`);
    console.log(`   - Thème: ${miniSite.theme}`);
    console.log(`   - Publié: ${miniSite.published ? 'Oui' : 'Non'}`);
    console.log(`   - Nombre de sections: ${miniSite.sections.length}`);
    console.log(`   - Vues: ${miniSite.views}`);

    // Récupérer l'exposant avec son mini-site
    const { data: exhibitor, error: exhibitorError } = await supabase
      .from('exhibitors')
      .select(`
        *,
        mini_sites!mini_sites_exhibitor_id_fkey (*)
      `)
      .eq('id', createdExhibitorId)
      .single();

    if (exhibitorError) {
      console.error('❌ Erreur lors de la récupération de l\'exposant:', exhibitorError);
      return false;
    }

    console.log('✅ Exposant récupéré avec son mini-site');
    console.log(`   - URL du mini-site: /minisite/${createdExhibitorId}`);
    console.log('✅ ÉTAPE 4 TERMINÉE\n');
    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Fonction de nettoyage (optionnel)
async function cleanup() {
  console.log('🧹 Nettoyage des données de test...');
  
  try {
    // Supprimer le mini-site
    await supabase
      .from('mini_sites')
      .delete()
      .eq('exhibitor_id', createdExhibitorId);

    // Supprimer l'exposant
    await supabase
      .from('exhibitors')
      .delete()
      .eq('id', createdExhibitorId);

    // Supprimer l'utilisateur
    await supabase
      .from('users')
      .delete()
      .eq('id', createdUserId);

    // Supprimer l'utilisateur de l'auth
    await supabase.auth.admin.deleteUser(createdUserId);

    console.log('✅ Nettoyage terminé\n');
  } catch (error) {
    console.error('⚠️  Erreur lors du nettoyage:', error);
  }
}

// Exécution du test
async function runTest() {
  try {
    const step1 = await step1_createExhibitor();
    if (!step1) {
      console.error('❌ Le test a échoué à l\'étape 1');
      return;
    }

    const step2 = await step2_validateExhibitor();
    if (!step2) {
      console.error('❌ Le test a échoué à l\'étape 2');
      return;
    }

    const step3 = await step3_createMiniSite();
    if (!step3) {
      console.error('❌ Le test a échoué à l\'étape 3');
      return;
    }

    const step4 = await step4_verifyMiniSite();
    if (!step4) {
      console.error('❌ Le test a échoué à l\'étape 4');
      return;
    }

    console.log('🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS ! 🎉\n');
    console.log('📋 Résumé :');
    console.log(`   - User ID: ${createdUserId}`);
    console.log(`   - Exhibitor ID: ${createdExhibitorId}`);
    console.log(`   - Email: ${testExhibitor.email}`);
    console.log(`   - URL du mini-site: /minisite/${createdExhibitorId}`);
    console.log('');

    // Demander si on doit nettoyer
    console.log('⚠️  Les données de test ont été créées.');
    console.log('   Pour les supprimer, exécutez : node test_exposant_flow.mjs --cleanup');
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution du test:', error);
  }
}

// Point d'entrée
if (process.argv.includes('--cleanup')) {
  cleanup();
} else {
  runTest();
}
