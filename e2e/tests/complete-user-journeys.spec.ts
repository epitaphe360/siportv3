import { test, expect, Page } from '@playwright/test';

/**
 * ============================================================================
 * SUITE DE TESTS E2E ULTRA-COMPLÈTE - SIPORTV3
 * ============================================================================
 *
 * Cette suite teste TOUS les scénarios utilisateur de bout en bout:
 * 1. Inscription & Authentification
 * 2. Profil Visiteur complet
 * 3. Profil Exposant complet
 * 4. Profil Partenaire complet
 * 5. Administration
 * 6. Networking & Rendez-vous
 * 7. Chat & Messagerie
 * 8. Recommandations IA
 * 9. MiniSite Builder
 * 10. Événements & Pavillons
 */

// ============================================================================
// HELPERS & FIXTURES
// ============================================================================

class TestUser {
  constructor(
    public email: string,
    public password: string,
    public firstName: string,
    public lastName: string,
    public role: 'visitor' | 'exhibitor' | 'partner' | 'admin'
  ) {}
}

// Utilisateurs de test
const testUsers = {
  visitor: new TestUser(
    `visitor_${Date.now()}@test.com`,
    'Test123!@#',
    'Jean',
    'Dupont',
    'visitor'
  ),
  exhibitor: new TestUser(
    `exhibitor_${Date.now()}@test.com`,
    'Test123!@#',
    'Marie',
    'Martin',
    'exhibitor'
  ),
  partner: new TestUser(
    `partner_${Date.now()}@test.com`,
    'Test123!@#',
    'Pierre',
    'Bernard',
    'partner'
  ),
  admin: new TestUser(
    'admin@siports.com',
    'Admin123!@#',
    'Admin',
    'SIPORTS',
    'admin'
  )
};

// Helper: Inscription
async function register(page: Page, user: TestUser, userType: string) {
  await page.goto('/register');

  // Remplir le formulaire
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  await page.fill('input[name="firstName"]', user.firstName);
  await page.fill('input[name="lastName"]', user.lastName);

  // Sélectionner le type d'utilisateur
  await page.click(`[data-testid="user-type-${userType}"]`);

  // Accepter les CGU
  await page.check('input[name="acceptTerms"]');

  // Soumettre
  await page.click('button[type="submit"]');

  // Attendre la redirection
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

// Helper: Connexion
async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

// Helper: Déconnexion
async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/', { timeout: 5000 });
}

// ============================================================================
// TESTS: AUTHENTIFICATION
// ============================================================================

test.describe('1. AUTHENTIFICATION & INSCRIPTION', () => {

  test('1.1 - Inscription Visiteur complète', async ({ page }) => {
    await register(page, testUsers.visitor, 'visitor');

    // Vérifier la redirection vers le dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Vérifier le message de bienvenue
    await expect(page.locator('text=Bienvenue')).toBeVisible();
  });

  test('1.2 - Inscription Exposant complète', async ({ page }) => {
    await register(page, testUsers.exhibitor, 'exhibitor');

    // Vérifier la création du profil exposant
    await expect(page.locator('text=Profil Exposant')).toBeVisible();
  });

  test('1.3 - Connexion avec email/password', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    // Vérifier la connexion réussie
    await expect(page.locator(`text=${testUsers.visitor.firstName}`)).toBeVisible();
  });

  test('1.4 - Déconnexion', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);
    await logout(page);

    // Vérifier retour à la page d'accueil
    await expect(page).toHaveURL('/');
  });

  test('1.5 - Mot de passe oublié', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Mot de passe oublié');

    await page.fill('input[name="email"]', testUsers.visitor.email);
    await page.click('button[type="submit"]');

    // Vérifier le message de confirmation
    await expect(page.locator('text=Email envoyé')).toBeVisible();
  });

  test('1.6 - Validation formulaire inscription (champs requis)', async ({ page }) => {
    await page.goto('/register');
    await page.click('button[type="submit"]');

    // Vérifier les messages d'erreur
    await expect(page.locator('text=Email requis')).toBeVisible();
    await expect(page.locator('text=Mot de passe requis')).toBeVisible();
  });
});

// ============================================================================
// TESTS: PROFIL VISITEUR
// ============================================================================

test.describe('2. PROFIL VISITEUR COMPLET', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);
  });

  test('2.1 - Compléter le profil visiteur', async ({ page }) => {
    await page.goto('/profile/edit');

    // Informations personnelles
    await page.fill('input[name="company"]', 'Entreprise Test');
    await page.fill('input[name="position"]', 'Développeur');
    await page.fill('input[name="phone"]', '+33612345678');
    await page.fill('textarea[name="bio"]', 'Bio de test pour le visiteur');

    // Secteurs d'intérêt
    await page.check('input[value="Technologie"]');
    await page.check('input[value="Innovation"]');

    // Objectifs de visite
    await page.check('input[value="Découvrir de nouveaux produits"]');
    await page.check('input[value="Réseautage"]');

    // Sauvegarder
    await page.click('button[type="submit"]');

    // Vérifier la sauvegarde
    await expect(page.locator('text=Profil mis à jour')).toBeVisible();
  });

  test('2.2 - Upload photo de profil', async ({ page }) => {
    await page.goto('/profile/edit');

    // Upload une image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/avatar.jpg');

    // Attendre l'upload
    await page.waitForSelector('img[alt*="Profile"]', { timeout: 10000 });

    // Vérifier l'image affichée
    const img = page.locator('img[alt*="Profile"]');
    await expect(img).toBeVisible();
  });

  test('2.3 - Configurer les préférences de notifications', async ({ page }) => {
    await page.goto('/profile/settings');

    // Activer/Désactiver notifications
    await page.check('input[name="emailNotifications"]');
    await page.check('input[name="pushNotifications"]');
    await page.uncheck('input[name="smsNotifications"]');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Préférences sauvegardées')).toBeVisible();
  });

  test('2.4 - Voir le profil public', async ({ page }) => {
    await page.goto('/profile/me');

    // Vérifier les informations publiques
    await expect(page.locator(`text=${testUsers.visitor.firstName}`)).toBeVisible();
    await expect(page.locator(`text=${testUsers.visitor.lastName}`)).toBeVisible();
  });
});

// ============================================================================
// TESTS: PROFIL EXPOSANT
// ============================================================================

test.describe('3. PROFIL EXPOSANT COMPLET', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);
  });

  test('3.1 - Créer profil entreprise exposant', async ({ page }) => {
    await page.goto('/exhibitor/profile/edit');

    // Informations entreprise
    await page.fill('input[name="companyName"]', 'TechCorp Solutions');
    await page.fill('input[name="description"]', 'Leader en solutions technologiques');
    await page.fill('input[name="website"]', 'https://techcorp.com');
    await page.fill('input[name="email"]', 'contact@techcorp.com');
    await page.fill('input[name="phone"]', '+33612345678');

    // Adresse
    await page.fill('input[name="address"]', '123 Rue de la Tech');
    await page.fill('input[name="city"]', 'Paris');
    await page.fill('input[name="postalCode"]', '75001');
    await page.fill('input[name="country"]', 'France');

    // Secteur d'activité
    await page.selectOption('select[name="sector"]', 'Technologie');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Profil créé avec succès')).toBeVisible();
  });

  test('3.2 - Ajouter un produit', async ({ page }) => {
    await page.goto('/exhibitor/products');
    await page.click('text=Ajouter un produit');

    // Informations produit
    await page.fill('input[name="name"]', 'Produit Innovant X1');
    await page.fill('textarea[name="description"]', 'Description complète du produit');
    await page.fill('input[name="price"]', '999.99');

    // Catégorie
    await page.selectOption('select[name="category"]', 'Technologie');

    // Upload image produit
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/product.jpg');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Produit ajouté')).toBeVisible();
  });

  test('3.3 - Configurer disponibilités rendez-vous', async ({ page }) => {
    await page.goto('/exhibitor/availability');

    // Sélectionner des créneaux
    await page.click('[data-date="2026-02-05"][data-time="09:00"]');
    await page.click('[data-date="2026-02-05"][data-time="10:00"]');
    await page.click('[data-date="2026-02-05"][data-time="14:00"]');

    await page.click('button:has-text("Sauvegarder disponibilités")');

    await expect(page.locator('text=Disponibilités mises à jour')).toBeVisible();
  });

  test('3.4 - Voir les demandes de rendez-vous', async ({ page }) => {
    await page.goto('/exhibitor/appointments');

    // Vérifier l'affichage du calendrier
    await expect(page.locator('[data-testid="appointment-calendar"]')).toBeVisible();
  });

  test('3.5 - Upload logo entreprise', async ({ page }) => {
    await page.goto('/exhibitor/profile/edit');

    const logoInput = page.locator('input[name="logo"]');
    await logoInput.setInputFiles('./tests/fixtures/logo.png');

    await page.waitForSelector('img[alt*="Logo"]', { timeout: 10000 });
    await expect(page.locator('img[alt*="Logo"]')).toBeVisible();
  });
});

// ============================================================================
// TESTS: MINISITE BUILDER
// ============================================================================

test.describe('4. MINISITE BUILDER COMPLET', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);
  });

  test('4.1 - Créer un minisite depuis zéro', async ({ page }) => {
    await page.goto('/exhibitor/minisite/new');

    // Étape 1: Informations de base
    await page.fill('input[name="siteName"]', 'Mon MiniSite TechCorp');
    await page.fill('textarea[name="tagline"]', 'Innovation & Excellence');
    await page.selectOption('select[name="template"]', 'modern');
    await page.click('button:has-text("Suivant")');

    // Étape 2: Couleurs et style
    await page.fill('input[name="primaryColor"]', '#0066CC');
    await page.fill('input[name="secondaryColor"]', '#FF6600');
    await page.click('button:has-text("Suivant")');

    // Étape 3: Sections
    await page.check('input[value="hero"]');
    await page.check('input[value="about"]');
    await page.check('input[value="products"]');
    await page.check('input[value="contact"]');
    await page.click('button:has-text("Créer MiniSite")');

    // Vérifier la création
    await expect(page.locator('text=MiniSite créé avec succès')).toBeVisible();
  });

  test('4.2 - Éditer section Hero', async ({ page }) => {
    await page.goto('/exhibitor/minisite/edit');

    // Cliquer sur section Hero
    await page.click('[data-section="hero"]');

    // Éditer le titre
    await page.click('[data-editable="hero-title"]');
    await page.fill('input[data-editing="hero-title"]', 'Bienvenue chez TechCorp');
    await page.click('button:has-text("Sauver")');

    // Éditer le sous-titre
    await page.click('[data-editable="hero-subtitle"]');
    await page.fill('textarea[data-editing="hero-subtitle"]', 'Leaders en innovation technologique');
    await page.click('button:has-text("Sauver")');

    // Upload image hero
    const heroImage = page.locator('input[data-upload="hero-image"]');
    await heroImage.setInputFiles('./tests/fixtures/hero-banner.jpg');

    await expect(page.locator('text=Section mise à jour')).toBeVisible();
  });

  test('4.3 - Ajouter section produits', async ({ page }) => {
    await page.goto('/exhibitor/minisite/edit');

    await page.click('button:has-text("Ajouter une section")');
    await page.click('button:has-text("Produits")');

    // Sélectionner des produits à afficher
    await page.check('input[data-product-id="1"]');
    await page.check('input[data-product-id="2"]');
    await page.check('input[data-product-id="3"]');

    await page.click('button:has-text("Ajouter les produits")');

    await expect(page.locator('[data-section="products"]')).toBeVisible();
  });

  test('4.4 - Configurer formulaire de contact', async ({ page }) => {
    await page.goto('/exhibitor/minisite/edit');

    await page.click('[data-section="contact"]');

    // Activer champs
    await page.check('input[name="enableNameField"]');
    await page.check('input[name="enablePhoneField"]');
    await page.check('input[name="enableCompanyField"]');
    await page.check('input[name="enableMessageField"]');

    // Email de notification
    await page.fill('input[name="notificationEmail"]', 'contact@techcorp.com');

    await page.click('button:has-text("Sauvegarder")');

    await expect(page.locator('text=Formulaire configuré')).toBeVisible();
  });

  test('4.5 - Prévisualiser le minisite', async ({ page }) => {
    await page.goto('/exhibitor/minisite/edit');

    await page.click('button:has-text("Prévisualiser")');

    // Vérifier l'ouverture de la prévisualisation
    await expect(page.locator('[data-testid="minisite-preview"]')).toBeVisible();

    // Tester les modes responsive
    await page.click('[data-preview-mode="mobile"]');
    await expect(page.locator('[data-viewport="mobile"]')).toBeVisible();

    await page.click('[data-preview-mode="tablet"]');
    await expect(page.locator('[data-viewport="tablet"]')).toBeVisible();

    await page.click('[data-preview-mode="desktop"]');
    await expect(page.locator('[data-viewport="desktop"]')).toBeVisible();
  });

  test('4.6 - Publier le minisite', async ({ page }) => {
    await page.goto('/exhibitor/minisite/edit');

    await page.click('button:has-text("Publier")');

    // Confirmer la publication
    await page.click('button:has-text("Confirmer")');

    await expect(page.locator('text=MiniSite publié')).toBeVisible();

    // Vérifier l'URL publique
    const publicUrl = await page.locator('[data-testid="minisite-url"]').textContent();
    expect(publicUrl).toContain('techcorp');
  });
});

// ============================================================================
// TESTS: RENDEZ-VOUS & NETWORKING
// ============================================================================

test.describe('5. RENDEZ-VOUS & NETWORKING', () => {

  test('5.1 - Visiteur : Rechercher un exposant', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Recherche
    await page.fill('input[placeholder*="Rechercher"]', 'TechCorp');
    await page.click('button:has-text("Rechercher")');

    // Vérifier les résultats
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible();
  });

  test('5.2 - Visiteur : Demander un rendez-vous', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors/techcorp');

    await page.click('button:has-text("Demander un rendez-vous")');

    // Sélectionner date et heure
    await page.click('[data-date="2026-02-05"]');
    await page.click('[data-time="10:00"]');

    // Message
    await page.fill('textarea[name="message"]', 'Je souhaite discuter de vos solutions');

    await page.click('button:has-text("Envoyer la demande")');

    await expect(page.locator('text=Demande envoyée')).toBeVisible();
  });

  test('5.3 - Exposant : Accepter un rendez-vous', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/exhibitor/appointments');

    // Trouver la demande en attente
    const pendingAppointment = page.locator('[data-status="pending"]').first();
    await pendingAppointment.click();

    // Accepter
    await page.click('button:has-text("Accepter")');

    await expect(page.locator('text=Rendez-vous confirmé')).toBeVisible();
  });

  test('5.4 - Visiteur : Voir calendrier personnel', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/calendar');

    // Vérifier l'affichage du calendrier
    await expect(page.locator('[data-testid="personal-calendar"]')).toBeVisible();

    // Vérifier le rendez-vous confirmé
    await expect(page.locator('[data-status="confirmed"]')).toBeVisible();
  });

  test('5.5 - Annuler un rendez-vous', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/calendar');

    // Cliquer sur un rendez-vous
    const appointment = page.locator('[data-appointment-id]').first();
    await appointment.click();

    // Annuler
    await page.click('button:has-text("Annuler")');
    await page.fill('textarea[name="cancellationReason"]', 'Conflit d\'horaire');
    await page.click('button:has-text("Confirmer l\'annulation")');

    await expect(page.locator('text=Rendez-vous annulé')).toBeVisible();
  });
});

// À SUIVRE: Tests pour Chat, Recommandations, Admin, etc.

export { testUsers, register, login, logout };
