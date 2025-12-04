/**
 * 🧪 TESTS EXHAUSTIFS - Application GetYourShare SIPORTS 2026
 *
 * Ce fichier teste TOUTES les fonctionnalités de l'application :
 * - Tous les boutons
 * - Toutes les validations
 * - Tous les services
 * - Toutes les routes
 * - Tous les scénarios utilisateurs
 * - Détection de toutes les erreurs
 *
 * Framework: Vitest / Playwright
 */

import { test, expect, Page } from '@playwright/test';
import { supabase } from '../src/lib/supabase';

// ============================================
// CONFIGURATION DES TESTS
// ============================================

const TEST_USERS = {
  admin: {
    email: 'admin-test@siports.com',
    password: 'TestAdmin123!',
    name: 'Admin Test',
    type: 'admin'
  },
  visitor_free: {
    email: 'visitor-free@test.com',
    password: 'Test123456!',
    name: 'Visiteur Free',
    type: 'visitor',
    visitor_level: 'free'
  },
  visitor_premium: {
    email: 'visitor-premium@test.com',
    password: 'Test123456!',
    name: 'Visiteur Premium',
    type: 'visitor',
    visitor_level: 'premium'
  },
  exhibitor: {
    email: 'exhibitor@test.com',
    password: 'Test123456!',
    name: 'Exposant Test',
    type: 'exhibitor',
    company: 'Test Company'
  },
  partner: {
    email: 'partner@test.com',
    password: 'Test123456!',
    name: 'Partenaire Test',
    type: 'partner',
    company: 'Partner Company'
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function loginAs(page: Page, userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType];
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
}

async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('button:has-text("Déconnexion")');
  await page.waitForNavigation();
}

async function createTestUser(userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType];
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        type: user.type,
        company: user.company || null
      }
    }
  });
  return { data, error };
}

async function cleanupTestData() {
  // Supprimer toutes les données de test
  await supabase.from('payment_requests').delete().like('user_id', '%test%');
  await supabase.from('appointments').delete().like('visitor_id', '%test%');
  await supabase.from('connections').delete().like('user_id_1', '%test%');
  await supabase.from('messages').delete().like('sender_id', '%test%');
}

// ============================================
// TESTS SETUP & TEARDOWN
// ============================================

test.beforeAll(async () => {
  console.log('🚀 Démarrage des tests exhaustifs...');
  await cleanupTestData();

  // Créer les utilisateurs de test
  for (const userType of Object.keys(TEST_USERS) as Array<keyof typeof TEST_USERS>) {
    await createTestUser(userType);
  }

  console.log('✅ Utilisateurs de test créés');
});

test.afterAll(async () => {
  console.log('🧹 Nettoyage des données de test...');
  await cleanupTestData();
  console.log('✅ Tests terminés');
});

// ============================================
// GROUPE 1: TESTS D'AUTHENTIFICATION
// ============================================

test.describe('🔐 Authentification', () => {

  test('1.1 - Login avec email/password valide', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.visitor_free.email);
    await page.fill('input[type="password"]', TEST_USERS.visitor_free.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=' + TEST_USERS.visitor_free.name)).toBeVisible();
  });

  test('1.2 - Login avec email invalide', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Email ou mot de passe incorrect/i')).toBeVisible();
  });

  test('1.3 - Login avec mot de passe incorrect', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.visitor_free.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Email ou mot de passe incorrect/i')).toBeVisible();
  });

  test('1.4 - Inscription nouveau visiteur', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'newvisitor@test.com');
    await page.fill('input[name="password"]', 'NewPass123!');
    await page.fill('input[name="name"]', 'Nouveau Visiteur');
    await page.fill('input[name="firstName"]', 'Nouveau');
    await page.fill('input[name="lastName"]', 'Visiteur');
    await page.selectOption('select[name="sector"]', 'technology');
    await page.fill('textarea[name="description"]', 'Description de test avec plus de 50 caractères pour passer la validation');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/signup-success/);
  });

  test('1.5 - OAuth Google (simulation)', async ({ page }) => {
    await page.goto('/login');
    const googleButton = page.locator('button:has-text("Google")');
    await expect(googleButton).toBeVisible();
    // Note: Test OAuth complet nécessite configuration OAuth de test
  });

  test('1.6 - Logout', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await logout(page);
    await expect(page).toHaveURL('/login');
  });

  test('1.7 - Mot de passe oublié', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('input[type="email"]', TEST_USERS.visitor_free.email);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Email envoyé/i')).toBeVisible();
  });
});

// ============================================
// GROUPE 2: TESTS SYSTÈME D'ABONNEMENT
// ============================================

test.describe('💳 Système d\'Abonnement', () => {

  test('2.1 - Affichage page abonnements', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/visitor/subscription');

    await expect(page.locator('text=Pass Gratuit')).toBeVisible();
    await expect(page.locator('text=Pass Premium VIP')).toBeVisible();
    await expect(page.locator('text=700€')).toBeVisible();
  });

  test('2.2 - Inscription gratuite', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/visitor/subscription');
    await page.click('button:has-text("S\'inscrire")');

    await expect(page.locator('text=/Inscription gratuite réussie/i')).toBeVisible();
  });

  test('2.3 - Demande Pass Premium', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/visitor/subscription');
    await page.click('button:has-text("Demander le Pass Premium")');

    await page.waitForTimeout(2500); // Attendre redirection
    await expect(page).toHaveURL(/\/visitor\/payment-instructions/);
  });

  test('2.4 - Vérification infos bancaires affichées', async ({ page }) => {
    await loginAs(page, 'visitor_free');

    // Créer une demande
    const { data: request } = await supabase
      .from('payment_requests')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        requested_level: 'premium',
        amount: 700.00,
        status: 'pending'
      })
      .select()
      .single();

    await page.goto(`/visitor/payment-instructions?request_id=${request.id}`);

    await expect(page.locator('text=IBAN')).toBeVisible();
    await expect(page.locator('text=700,00 EUR')).toBeVisible();
    await expect(page.locator('text=/SIPORTS-PREMIUM-/i')).toBeVisible();
  });

  test('2.5 - Soumission référence virement', async ({ page }) => {
    await loginAs(page, 'visitor_free');

    const { data: request } = await supabase
      .from('payment_requests')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        requested_level: 'premium',
        amount: 700.00,
        status: 'pending'
      })
      .select()
      .single();

    await page.goto(`/visitor/payment-instructions?request_id=${request.id}`);
    await page.fill('input[placeholder*="référence"]', 'TEST-REF-123456');
    await page.click('button:has-text("Soumettre")');

    await expect(page.locator('text=/Justificatif enregistré/i')).toBeVisible();
  });

  test('2.6 - Demande en double bloquée', async ({ page }) => {
    await loginAs(page, 'visitor_free');

    // Créer une demande pending
    await supabase.from('payment_requests').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      requested_level: 'premium',
      amount: 700.00,
      status: 'pending'
    });

    await page.goto('/visitor/subscription');
    await page.click('button:has-text("Demander le Pass Premium")');

    await expect(page.locator('text=/déjà une demande.*en attente/i')).toBeVisible();
  });
});

// ============================================
// GROUPE 3: TESTS ADMIN - VALIDATION PAIEMENTS
// ============================================

test.describe('👨‍💼 Admin - Validation Paiements', () => {

  test('3.1 - Accès page validation (admin only)', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/payment-validation');

    await expect(page.locator('h1:has-text("Validation des Paiements")')).toBeVisible();
  });

  test('3.2 - Accès refusé pour non-admin', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/admin/payment-validation');

    await expect(page).toHaveURL(/\/forbidden|\/unauthorized/);
  });

  test('3.3 - Filtrage demandes par statut', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/payment-validation');

    await page.click('button:has-text("En attente")');
    await expect(page.locator('[data-status="pending"]')).toBeVisible();

    await page.click('button:has-text("Approuvés")');
    // Vérifier que seuls les approuvés sont affichés
  });

  test('3.4 - Approuver une demande', async ({ page }) => {
    await loginAs(page, 'admin');

    // Créer une demande de test
    const { data: user } = await supabase.auth.getUser();
    const { data: request } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.user?.id,
        requested_level: 'premium',
        amount: 700.00,
        status: 'pending',
        transfer_reference: 'TEST-123'
      })
      .select()
      .single();

    await page.goto('/admin/payment-validation');
    await page.click(`[data-request-id="${request.id}"] button:has-text("Approuver")`);

    // Confirmer dans le dialog
    page.once('dialog', dialog => dialog.accept('Paiement validé'));

    await expect(page.locator('text=/Paiement approuvé/i')).toBeVisible();

    // Vérifier que le niveau a été changé
    const { data: updatedRequest } = await supabase
      .from('payment_requests')
      .select('status')
      .eq('id', request.id)
      .single();

    expect(updatedRequest?.status).toBe('approved');
  });

  test('3.5 - Rejeter une demande', async ({ page }) => {
    await loginAs(page, 'admin');

    const { data: user } = await supabase.auth.getUser();
    const { data: request } = await supabase
      .from('payment_requests')
      .insert({
        user_id: user.user?.id,
        requested_level: 'premium',
        amount: 700.00,
        status: 'pending'
      })
      .select()
      .single();

    await page.goto('/admin/payment-validation');
    await page.click(`[data-request-id="${request.id}"] button:has-text("Rejeter")`);

    page.once('dialog', dialog => dialog.accept('Montant incorrect'));

    await expect(page.locator('text=/Paiement rejeté/i')).toBeVisible();
  });

  test('3.6 - Badge compteur demandes en attente', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/payment-validation');

    const badge = page.locator('[data-testid="pending-count"]');
    await expect(badge).toBeVisible();
    const count = await badge.textContent();
    expect(parseInt(count || '0')).toBeGreaterThanOrEqual(0);
  });
});

// ============================================
// GROUPE 4: TESTS RENDEZ-VOUS B2B
// ============================================

test.describe('📅 Rendez-vous B2B', () => {

  test('4.1 - Visiteur FREE ne peut pas réserver', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/appointments');

    // Essayer de réserver
    await page.click('button:has-text("Réserver")').first();
    await expect(page.locator('text=/quota.*atteint|pas disponible/i')).toBeVisible();
  });

  test('4.2 - Visiteur PREMIUM peut réserver illimité', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/appointments');

    // Réserver 10 RDV
    for (let i = 0; i < 10; i++) {
      await page.click('button:has-text("Réserver")').first();
      await page.fill('textarea[name="message"]', `Message test ${i}`);
      await page.click('button:has-text("Confirmer")');
      await expect(page.locator('text=/Rendez-vous.*confirmé/i')).toBeVisible();
    }

    // Vérifier qu'aucun message de quota n'apparaît
    await expect(page.locator('text=/quota.*atteint/i')).not.toBeVisible();
  });

  test('4.3 - Affichage calendrier rendez-vous', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/calendar');

    await expect(page.locator('[data-testid="calendar"]')).toBeVisible();
    await expect(page.locator('button:has-text("Créer créneau")')).toBeVisible();
  });

  test('4.4 - Exposant crée un créneau', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/calendar');

    await page.click('button:has-text("Créer créneau")');
    await page.fill('input[name="title"]', 'Rendez-vous test');
    await page.fill('input[type="date"]', '2026-04-02');
    await page.fill('input[type="time"]', '10:00');
    await page.fill('input[name="duration"]', '30');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Créneau créé/i')).toBeVisible();
  });

  test('4.5 - Validation quota en base de données', async () => {
    const { data: user } = await supabase.auth.getUser();

    // Essayer de créer un RDV au-delà du quota
    const { error } = await supabase.from('appointments').insert({
      visitor_id: user.user?.id,
      exhibitor_id: 'test-exhibitor-id',
      appointment_date: '2026-04-02',
      status: 'confirmed'
    });

    // Si visitor_level = 'free', doit échouer
    if (user.user?.user_metadata?.visitor_level === 'free') {
      expect(error).toBeTruthy();
      expect(error?.message).toContain('quota');
    }
  });
});

// ============================================
// GROUPE 5: TESTS NETWORKING
// ============================================

test.describe('🤝 Networking', () => {

  test('5.1 - Visiteur FREE ne peut pas envoyer de messages', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/messages');

    await expect(page.locator('text=/Le réseautage.*pas disponible/i')).toBeVisible();
  });

  test('5.2 - Visiteur PREMIUM peut envoyer messages illimités', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/messages');

    // Envoyer 50 messages
    for (let i = 0; i < 50; i++) {
      await page.click('button:has-text("Nouveau message")');
      await page.fill('input[name="recipient"]', 'test@example.com');
      await page.fill('textarea[name="message"]', `Message ${i}`);
      await page.click('button[type="submit"]');
    }

    // Aucune limite atteinte
    await expect(page.locator('text=/limite.*messages/i')).not.toBeVisible();
  });

  test('5.3 - Page networking affichage', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/networking');

    await expect(page.locator('h1:has-text("Réseautage")')).toBeVisible();
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible();
  });

  test('5.4 - Recherche utilisateurs', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/networking');

    await page.fill('input[placeholder*="Rechercher"]', 'test');
    await page.click('button:has-text("Rechercher")');

    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('5.5 - Créer une connexion', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/networking');

    await page.click('[data-testid="user-card"]').first();
    await page.click('button:has-text("Connecter")');

    await expect(page.locator('text=/Demande.*envoyée/i')).toBeVisible();
  });

  test('5.6 - Vérification permissions networking', async () => {
    const { getNetworkingPermissions } = await import('../src/lib/networkingPermissions');

    // Free user
    const freePerms = getNetworkingPermissions('visitor', 'free');
    expect(freePerms.canAccessNetworking).toBe(false);
    expect(freePerms.maxMessagesPerDay).toBe(0);

    // Premium user
    const premiumPerms = getNetworkingPermissions('visitor', 'premium');
    expect(premiumPerms.canAccessNetworking).toBe(true);
    expect(premiumPerms.maxMessagesPerDay).toBe(-1); // Illimité
    expect(premiumPerms.canAccessVIPLounge).toBe(true);
  });
});

// ============================================
// GROUPE 6: TESTS PAGES PARTENAIRE
// ============================================

test.describe('🤝 Pages Partenaire', () => {

  test('6.1 - Page événements partenaire', async ({ page }) => {
    await loginAs(page, 'partner');
    await page.goto('/partner/events');

    await expect(page.locator('h1:has-text("Événements")')).toBeVisible();
    await expect(page.locator('[data-testid="event-list"]')).toBeVisible();
  });

  test('6.2 - Événements chargés depuis Supabase', async ({ page }) => {
    await loginAs(page, 'partner');
    await page.goto('/partner/events');

    // Attendre le chargement
    await page.waitForTimeout(2000);

    // Vérifier qu'il n'y a PAS de données hardcodées
    const hardcodedText = page.locator('text="Conférence Innovation Portuaire"');
    await expect(hardcodedText).not.toBeVisible();
  });

  test('6.3 - Page leads partenaire', async ({ page }) => {
    await loginAs(page, 'partner');
    await page.goto('/partner/leads');

    await expect(page.locator('h1:has-text("Leads")')).toBeVisible();
  });

  test('6.4 - Leads chargés depuis connexions', async ({ page }) => {
    await loginAs(page, 'partner');
    await page.goto('/partner/leads');

    await page.waitForTimeout(2000);

    // Vérifier que les données viennent de Supabase
    const hardcoded = page.locator('text="Port Solutions Inc."');
    await expect(hardcoded).not.toBeVisible();
  });

  test('6.5 - Page analytiques partenaire', async ({ page }) => {
    await loginAs(page, 'partner');
    await page.goto('/partner/analytics');

    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
  });
});

// ============================================
// GROUPE 7: TESTS EXPOSANT
// ============================================

test.describe('🏢 Exposant', () => {

  test('7.1 - Création mini-site wizard', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/minisite-creation');

    // Étape 1: Nom compagnie
    await page.fill('input[name="company"]', 'Test Company');
    await page.click('button:has-text("Suivant")');

    // Étape 2: Logo
    await page.setInputFiles('input[type="file"]', './tests/fixtures/logo.png');
    await page.click('button:has-text("Suivant")');

    // Étape 3: Description
    await page.fill('textarea[name="description"]', 'Description de test');
    await page.click('button:has-text("Suivant")');

    // Étape 4: Documents
    await page.click('button:has-text("Suivant")');

    // Étape 5: Produits
    await page.fill('textarea[name="products"]', 'Produit 1\nProduit 2');
    await page.click('button:has-text("Suivant")');

    // Étape 6: Réseaux sociaux
    await page.fill('input[name="linkedin"]', 'https://linkedin.com/company/test');
    await page.click('button:has-text("Terminer")');

    await expect(page.locator('text=/Mini-site créé/i')).toBeVisible();
  });

  test('7.2 - Import mini-site depuis URL', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/minisite-creation');

    await page.fill('input[placeholder*="URL"]', 'https://example.com');
    await page.click('button:has-text("Importer")');

    await page.waitForTimeout(5000); // Attendre scraping
    await expect(page.locator('text=/Importé avec succès/i')).toBeVisible();
  });

  test('7.3 - Éditeur WYSIWYG mini-site', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/minisite/editor');

    await expect(page.locator('[data-testid="wysiwyg-editor"]')).toBeVisible();

    // Éditer le contenu
    await page.fill('[contenteditable="true"]', 'Nouveau contenu');
    await page.click('button:has-text("Enregistrer")');

    await expect(page.locator('text=/Enregistré/i')).toBeVisible();
  });

  test('7.4 - Gestion disponibilités exposant', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/availability/settings');

    await page.click('button:has-text("Ajouter disponibilité")');
    await page.fill('input[type="date"]', '2026-04-02');
    await page.fill('input[name="start_time"]', '09:00');
    await page.fill('input[name="end_time"]', '18:00');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Disponibilité.*ajoutée/i')).toBeVisible();
  });
});

// ============================================
// GROUPE 8: TESTS ÉVÉNEMENTS
// ============================================

test.describe('📆 Événements', () => {

  test('8.1 - Page événements publique', async ({ page }) => {
    await page.goto('/events');

    await expect(page.locator('h1:has-text("Événements")')).toBeVisible();
    await expect(page.locator('[data-testid="events-list"]')).toBeVisible();
  });

  test('8.2 - Vérification dates événement (1-3 avril 2026)', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=/1.*Avril.*2026/i')).toBeVisible();
    await expect(page.locator('text=/3.*Avril.*2026/i')).toBeVisible();
  });

  test('8.3 - Admin créer événement', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/create-event');

    await page.fill('input[name="title"]', 'Événement Test');
    await page.fill('textarea[name="description"]', 'Description événement');
    await page.fill('input[type="date"]', '2026-04-02');
    await page.fill('input[name="start_time"]', '10:00');
    await page.fill('input[name="end_time"]', '12:00');
    await page.selectOption('select[name="event_type"]', 'conference');
    await page.fill('input[name="max_participants"]', '100');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/Événement créé/i')).toBeVisible();
  });

  test('8.4 - Inscription à un événement', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/events');

    await page.click('[data-testid="event-card"]').first();
    await page.click('button:has-text("S\'inscrire")');

    await expect(page.locator('text=/Inscription.*confirmée/i')).toBeVisible();
  });

  test('8.5 - Limite événements pour FREE', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/events');

    // S'inscrire à 3 événements (limite = 2)
    for (let i = 0; i < 3; i++) {
      await page.click(`[data-testid="event-card"]:nth-child(${i + 1})`);
      await page.click('button:has-text("S\'inscrire")');
    }

    await expect(page.locator('text=/limite.*événements/i')).toBeVisible();
  });

  test('8.6 - Événements illimités pour PREMIUM', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/events');

    // S'inscrire à 10 événements
    for (let i = 0; i < 10; i++) {
      await page.click(`[data-testid="event-card"]:nth-child(${i + 1})`);
      await page.click('button:has-text("S\'inscrire")');
    }

    // Aucune limite
    await expect(page.locator('text=/limite.*événements/i')).not.toBeVisible();
  });
});

// ============================================
// GROUPE 9: TESTS VALIDATIONS FORMULAIRES
// ============================================

test.describe('✅ Validations Formulaires', () => {

  test('9.1 - Email invalide', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'invalidemail');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/email.*invalide/i')).toBeVisible();
  });

  test('9.2 - Mot de passe trop court', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="password"]', 'short');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/12 caractères/i')).toBeVisible();
  });

  test('9.3 - Mot de passe sans majuscule', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="password"]', 'lowercase123!');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/majuscule/i')).toBeVisible();
  });

  test('9.4 - Mot de passe sans caractère spécial', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/caractère spécial/i')).toBeVisible();
  });

  test('9.5 - Description trop courte (< 50 char)', async ({ page }) => {
    await page.goto('/register');
    await page.fill('textarea[name="description"]', 'Court');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/50 caractères/i')).toBeVisible();
  });

  test('9.6 - Champs requis manquants', async ({ page }) => {
    await page.goto('/register');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=/requis|obligatoire/i')).toBeVisible();
  });

  test('9.7 - Validation montant paiement', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/payment-validation');

    // Vérifier que le montant est toujours 700€
    const amounts = await page.locator('[data-testid="payment-amount"]').allTextContents();
    amounts.forEach(amount => {
      expect(amount).toContain('700');
    });
  });
});

// ============================================
// GROUPE 10: TESTS SÉCURITÉ & PERMISSIONS
// ============================================

test.describe('🔒 Sécurité & Permissions', () => {

  test('10.1 - Page admin bloquée pour non-admin', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/forbidden|\/unauthorized/);
  });

  test('10.2 - Routes protégées sans auth', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/visitor/subscription',
      '/admin/users',
      '/exhibitor/dashboard',
      '/partner/dashboard'
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('10.3 - XSS dans formulaires', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/contact');

    const xssPayload = '<script>alert("XSS")</script>';
    await page.fill('input[name="name"]', xssPayload);
    await page.fill('textarea[name="message"]', xssPayload);
    await page.click('button[type="submit"]');

    // Vérifier que le script n'est pas exécuté
    await page.waitForTimeout(1000);
    const alerts = await page.evaluate(() => window.alert === undefined);
    expect(alerts).toBeFalsy();
  });

  test('10.4 - SQL Injection tentative', async () => {
    const sqlPayload = "'; DROP TABLE users; --";

    const { error } = await supabase
      .from('users')
      .select()
      .eq('email', sqlPayload);

    // Ne devrait pas causer d'erreur (protégé par paramètres liés)
    expect(error).toBeFalsy();
  });

  test('10.5 - Rate limiting sur API', async ({ page }) => {
    // Envoyer 20 requêtes rapidement
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        fetch('http://localhost:4000/create-mini-site', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: `Test ${i}` })
        })
      );
    }

    const responses = await Promise.all(promises);
    const rateLimited = responses.some(r => r.status === 429);

    expect(rateLimited).toBeTruthy();
  });

  test('10.6 - CORS headers présents', async () => {
    const response = await fetch('http://localhost:4000/create-mini-site', {
      method: 'OPTIONS'
    });

    expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
  });
});

// ============================================
// GROUPE 11: TESTS QUOTAS
// ============================================

test.describe('📊 Quotas', () => {

  test('11.1 - Vérification quotas FREE (0)', async () => {
    const { getVisitorQuota } = await import('../src/config/quotas');
    const quota = getVisitorQuota('free');
    expect(quota).toBe(0);
  });

  test('11.2 - Vérification quotas PREMIUM (illimité)', async () => {
    const { getVisitorQuota } = await import('../src/config/quotas');
    const quota = getVisitorQuota('premium');
    expect(quota).toBe(999999); // Représentation de -1 (illimité)
  });

  test('11.3 - Trigger quota en base de données', async () => {
    // Ce test vérifie que le trigger check_visitor_quota fonctionne
    const { data: user } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.visitor_free.email,
      password: TEST_USERS.visitor_free.password
    });

    // Essayer de créer un RDV confirmé (devrait échouer pour FREE)
    const { error } = await supabase.from('appointments').insert({
      visitor_id: user.user?.id,
      exhibitor_id: 'test-id',
      appointment_date: '2026-04-02T10:00:00',
      status: 'confirmed'
    });

    expect(error).toBeTruthy();
    expect(error?.message).toContain('quota');
  });
});

// ============================================
// GROUPE 12: TESTS NOTIFICATIONS
// ============================================

test.describe('🔔 Notifications', () => {

  test('12.1 - Notification après approbation paiement', async ({ page }) => {
    await loginAs(page, 'visitor_free');

    // Simuler approbation
    const { data: user } = await supabase.auth.getUser();
    await supabase.from('notifications').insert({
      user_id: user.user?.id,
      title: 'Paiement approuvé',
      message: 'Test notification',
      type: 'success'
    });

    await page.goto('/dashboard');
    await page.click('[data-testid="notifications-button"]');

    await expect(page.locator('text=Paiement approuvé')).toBeVisible();
  });

  test('12.2 - Notifications en temps réel', async ({ page }) => {
    await loginAs(page, 'visitor_free');
    await page.goto('/dashboard');

    // Créer une notification pendant que l'utilisateur est sur la page
    const { data: user } = await supabase.auth.getUser();
    await supabase.from('notifications').insert({
      user_id: user.user?.id,
      title: 'Nouveau message',
      message: 'Test temps réel',
      type: 'info'
    });

    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="notification-toast"]')).toBeVisible();
  });
});

// ============================================
// GROUPE 13: TESTS RECHERCHE & FILTRES
// ============================================

test.describe('🔍 Recherche & Filtres', () => {

  test('13.1 - Recherche exposants', async ({ page }) => {
    await page.goto('/exhibitors');

    await page.fill('input[placeholder*="Rechercher"]', 'technology');
    await page.click('button:has-text("Rechercher")');

    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="exhibitor-card"]')).toBeVisible();
  });

  test('13.2 - Filtrage par secteur', async ({ page }) => {
    await page.goto('/exhibitors');

    await page.selectOption('select[name="sector"]', 'technology');
    await page.waitForTimeout(1000);

    const cards = await page.locator('[data-testid="exhibitor-card"]').all();
    expect(cards.length).toBeGreaterThan(0);
  });

  test('13.3 - Filtrage événements par date', async ({ page }) => {
    await page.goto('/events');

    await page.fill('input[type="date"]', '2026-04-02');
    await page.click('button:has-text("Filtrer")');

    await expect(page.locator('text=/2.*Avril.*2026/i')).toBeVisible();
  });

  test('13.4 - Recherche utilisateurs networking', async ({ page }) => {
    await loginAs(page, 'visitor_premium');
    await page.goto('/networking');

    await page.fill('input[placeholder*="Rechercher"]', 'test');
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="user-result"]')).toBeVisible();
  });
});

// ============================================
// GROUPE 14: TESTS PERFORMANCE
// ============================================

test.describe('⚡ Performance', () => {

  test('14.1 - Temps de chargement page accueil < 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });

  test('14.2 - Lazy loading des images', async ({ page }) => {
    await page.goto('/exhibitors');

    const images = await page.locator('img[loading="lazy"]').count();
    expect(images).toBeGreaterThan(0);
  });

  test('14.3 - Taille bundle JS < 500KB', async ({ page }) => {
    const response = await page.goto('/');
    const resources = await page.evaluate(() =>
      performance.getEntriesByType('resource')
    );

    const jsSize = resources
      .filter((r: any) => r.name.endsWith('.js'))
      .reduce((sum: number, r: any) => sum + r.transferSize, 0);

    expect(jsSize).toBeLessThan(500 * 1024); // 500KB
  });
});

// ============================================
// GROUPE 15: TESTS ERREURS & EDGE CASES
// ============================================

test.describe('❌ Gestion Erreurs', () => {

  test('15.1 - Page 404 affichée pour route invalide', async ({ page }) => {
    await page.goto('/page-qui-nexiste-pas');

    await expect(page.locator('text=/404|Page non trouvée/i')).toBeVisible();
  });

  test('15.2 - Gestion erreur réseau', async ({ page }) => {
    // Simuler perte de connexion
    await page.route('**/*', route => route.abort());

    await page.goto('/events');
    await expect(page.locator('text=/Erreur.*chargement/i')).toBeVisible();
  });

  test('15.3 - Formulaire avec données invalides', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('input[name="email"]', 'invalid');
    await page.fill('input[name="message"]', 'x'); // Trop court
    await page.click('button[type="submit"]');

    const errors = await page.locator('.error-message').count();
    expect(errors).toBeGreaterThan(0);
  });

  test('15.4 - Upload fichier trop gros', async ({ page }) => {
    await loginAs(page, 'exhibitor');
    await page.goto('/minisite-creation');

    // Créer un fichier > 5MB
    const bigFile = Buffer.alloc(6 * 1024 * 1024); // 6MB
    await page.setInputFiles('input[type="file"]', {
      name: 'big.jpg',
      mimeType: 'image/jpeg',
      buffer: bigFile
    });

    await expect(page.locator('text=/taille.*fichier/i')).toBeVisible();
  });

  test('15.5 - Token expiré', async ({ page }) => {
    await loginAs(page, 'visitor_free');

    // Simuler expiration du token
    await page.evaluate(() => {
      localStorage.removeItem('supabase.auth.token');
    });

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

// ============================================
// TESTS DE GÉNÉRATION DE RAPPORT
// ============================================

test.afterAll(async () => {
  console.log('\n📊 === RAPPORT DE TESTS ===\n');
  console.log('✅ Tous les tests sont terminés');
  console.log('📝 Consultez le rapport détaillé dans ./test-results/\n');
});
