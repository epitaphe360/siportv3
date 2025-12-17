import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testExhibitorFlow() {
  console.log('=== Test du flux d\'inscription Exposant ===\n');
  
  const testEmail = 'test-exposant-' + Date.now() + '@test.com';
  
  // 1. Créer l'utilisateur Auth
  console.log('1. Création utilisateur Auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Test123456!',
    email_confirm: true,
    user_metadata: {
      full_name: 'Exposant Test',
      role: 'exhibitor'
    }
  });
  
  if (authError) {
    console.log('❌ Erreur Auth:', authError.message);
    return;
  }
  console.log('✅ Utilisateur Auth créé:', authData.user.id);
  
  // 1b. Créer le profil utilisateur (table 'users' - nécessaire pour la FK exhibitors)
  console.log('\n1b. Création profil utilisateur (table users)...');
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: testEmail,
      name: 'Exposant Test',
      type: 'exhibitor',
      profile: {
        firstName: 'Exposant',
        lastName: 'Test',
        company: 'Test Company SARL'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (profileError) {
    console.log('❌ Erreur création profil:', profileError.message);
  } else {
    console.log('✅ Profil créé dans users:', profileData.id);
  }
  
  // 2. Créer la demande d'inscription (pour validation admin)
  console.log('\n2. Création demande inscription (registration_requests)...');
  const { data: reqData, error: reqError } = await supabase
    .from('registration_requests')
    .insert({
      user_id: authData.user.id,
      user_type: 'exhibitor',
      email: testEmail,
      first_name: 'Exposant',
      last_name: 'Test',
      company_name: 'Test Company SARL',
      position: 'Directeur',
      phone: '+33123456789',
      status: 'pending',
      profile_data: { 
        sector: 'Technologie', 
        country: 'FR',
        description: 'Description de test'
      }
    })
    .select()
    .single();
    
  if (reqError) {
    console.log('❌ Erreur registration_requests:', reqError.message);
  } else {
    console.log('✅ Demande d\'inscription créée - ID:', reqData.id);
    console.log('   Status: pending (en attente validation admin)');
    console.log('   → L\'administrateur doit approuver cette demande');
  }
  
  // 3. Créer l'entrée exhibitor (avec catégorie valide)
  // Les catégories valides: 'institutional', 'port-industry', 'port-operations', 'academic'
  console.log('\n3. Création entrée exhibitors...');
  const { data: exhibData, error: exhibError } = await supabase
    .from('exhibitors')
    .insert({
      user_id: authData.user.id,
      company_name: 'Test Company SARL',
      sector: 'Technologie Maritime',
      category: 'port-industry', // Valeur valide de l'enum exhibitor_category
      description: 'Entreprise spécialisée dans les solutions technologiques pour l\'industrie portuaire',
      contact_info: {
        email: testEmail,
        phone: '+33123456789',
        address: 'Paris, France'
      },
      verified: false,  // En attente de vérification admin
      featured: false
    })
    .select()
    .single();
    
  if (exhibError) {
    console.log('❌ Erreur exhibitors:', exhibError.message);
  } else {
    console.log('✅ Dossier Exposant créé - ID:', exhibData.id);
    console.log('   Entreprise:', exhibData.company_name);
    console.log('   Catégorie:', exhibData.category);
    console.log('   Vérifié:', exhibData.verified ? 'Oui' : 'Non (en attente)');
  }
  
  // 4. Test envoi email (Edge Function)
  console.log('\n4. Test envoi email notification...');
  try {
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-registration-email', {
      body: {
        to: testEmail,
        name: 'Exposant Test',
        userType: 'exhibitor'
      }
    });
    
    if (emailError) {
      console.log('⚠️ Email Edge Function non configurée:', emailError.message);
      console.log('   → Pour configurer: déployer l\'edge function send-registration-email');
    } else {
      console.log('✅ Email de confirmation envoyé:', emailData);
    }
  } catch (e) {
    console.log('⚠️ Email Edge Function non disponible (normal en dev)');
  }
  
  // Résumé
  console.log('\n========================================');
  console.log('      RÉSUMÉ DU FLUX D\'INSCRIPTION');
  console.log('========================================');
  console.log('✅ 1. Utilisateur Auth créé');
  console.log(profileData ? '✅ 1b. Profil utilisateur créé' : '❌ 1b. Profil non créé');
  console.log(reqData ? '✅ 2. Demande en attente validation admin' : '❌ 2. Demande non créée');
  console.log(exhibData ? '✅ 3. Dossier exposant enregistré en base' : '❌ 3. Dossier exposant non créé');
  console.log('⚠️ 4. Email (nécessite configuration Edge Function)');
  console.log('========================================\n');
  
  if (profileData && reqData && exhibData) {
    console.log('🎉 Le flux d\'inscription Exposant est FONCTIONNEL !');
    console.log('   • Les données sont bien enregistrées en base');
    console.log('   • La demande est créée pour validation admin');
    console.log('   • L\'email nécessite configuration de l\'Edge Function');
  }
  
  // Nettoyage
  console.log('\n5. Nettoyage des données de test...');
  if (exhibData) await supabase.from('exhibitors').delete().eq('id', exhibData.id);
  if (reqData) await supabase.from('registration_requests').delete().eq('id', reqData.id);
  if (profileData) await supabase.from('users').delete().eq('id', profileData.id);
  await supabase.auth.admin.deleteUser(authData.user.id);
  console.log('✅ Données de test supprimées\n');
  
  console.log('=== FIN DU TEST ===');
}

testExhibitorFlow();
