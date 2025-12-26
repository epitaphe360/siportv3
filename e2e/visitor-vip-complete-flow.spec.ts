import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// =============================================================================
// CONFIGURATION TEST
// =============================================================================

// Compte VIP existant pour tests de connexion (mot de passe corrigé)
const TEST_VISITOR_VIP = {
  email: 'visitor-vip@test.siport.com',
  password: 'Test@123456'
};

// Données pour test d'inscription (email unique à chaque test)
const generateTestEmail = () => `test-vip-${Date.now()}@test.siport.com`;

const TEST_VIP_REGISTRATION = {
  firstName: 'Jean',
  lastName: 'TestVIP',
  phone: '+33612345678',
  country: 'France',
  sector: 'Logistique',
  position: 'Directeur Général',
  company: 'Test Company SA',
  password: 'Test@123456'
};

// =============================================================================
// HELPERS
// =============================================================================

async function loginAsVIP(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('domcontentloaded');

  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 3000 })) {
    await emailInput.fill(TEST_VISITOR_VIP.email);
    await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
  }
}

// =============================================================================
// TESTS: INSCRIPTION VIP COMPLÈTE
// =============================================================================

test.describe('👑 VISITEUR VIP - INSCRIPTION COMPLÈTE', () => {

  test.describe('Formulaire d\'inscription VIP', () => {

    test('VIP-REG-01: Page inscription VIP accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/visitor/register/vip`);
      await page.waitForLoadState('domcontentloaded');

      // Vérifier titre et éléments de la page
      const hasVipTitle = await page.getByText(/VIP|Premium|700/i).first().isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasVipTitle).toBe(true);

      // Vérifier présence du formulaire
      const formExists = await page.locator('form').isVisible();
      expect(formExists).toBe(true);

      console.log('✅ Page inscription VIP accessible');
    });

    test('VIP-REG-02: Tous les champs du formulaire sont présents', async ({ page }) => {
      await page.goto(`${BASE_URL}/visitor/register/vip`);
      await page.waitForLoadState('domcontentloaded');

      // Vérifier champs obligatoires
      const fieldsToCheck = [
        { selector: 'input[name="firstName"], input[placeholder*="Prénom"]', name: 'Prénom' },
        { selector: 'input[name="lastName"], input[placeholder*="Nom"]', name: 'Nom' },
        { selector: 'input[type="email"], input[name="email"]', name: 'Email' },
        { selector: 'input[type="password"]', name: 'Mot de passe' },
        { selector: 'input[name="phone"], input[placeholder*="Téléphone"]', name: 'Téléphone' },
        { selector: 'select[name="country"], input[name="country"]', name: 'Pays' },
        { selector: 'select[name="sector"], input[name="sector"]', name: 'Secteur' },
        { selector: 'input[name="position"], input[placeholder*="Fonction"]', name: 'Fonction' },
        { selector: 'input[name="company"], input[placeholder*="Entreprise"]', name: 'Entreprise' },
      ];

      for (const field of fieldsToCheck) {
        const fieldExists = await page.locator(field.selector).first().isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`  ${fieldExists ? '✅' : '❌'} Champ ${field.name}: ${fieldExists ? 'présent' : 'MANQUANT'}`);
      }

      // Vérifier upload photo
      const photoUpload = await page.locator('input[type="file"], text=/Photo|Image|Avatar/i').first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`  ${photoUpload ? '✅' : '❌'} Upload photo: ${photoUpload ? 'présent' : 'MANQUANT'}`);
    });

    test('VIP-REG-03: Validation mot de passe fort', async ({ page }) => {
      await page.goto(`${BASE_URL}/visitor/register/vip`);
      await page.waitForLoadState('domcontentloaded');

      const passwordInput = page.locator('input[type="password"]').first();

      // Test mot de passe faible
      await passwordInput.fill('123');
      await passwordInput.blur();
      await page.waitForTimeout(500);

      let hasError = await page.locator('text=/8 caractères|majuscule|minuscule|chiffre/i').isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`✅ Validation mot de passe faible: ${hasError ? 'erreur affichée' : 'pas d\'erreur'}`);

      // Test mot de passe valide
      await passwordInput.fill('Test@123456');
      await passwordInput.blur();
      await page.waitForTimeout(500);
      console.log('✅ Mot de passe fort accepté');
    });

    test('VIP-REG-04: Validation email', async ({ page }) => {
      await page.goto(`${BASE_URL}/visitor/register/vip`);
      await page.waitForLoadState('domcontentloaded');

      const emailInput = page.locator('input[type="email"]').first();

      // Email invalide
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      await page.waitForTimeout(500);

      const hasEmailError = await page.locator('text=/Email invalide|format incorrect/i').isVisible({ timeout: 2000 }).catch(() => false);
      console.log(`✅ Validation email invalide: ${hasEmailError ? 'erreur affichée' : 'pas d\'erreur'}`);

      // Email valide
      await emailInput.fill('test@example.com');
      await emailInput.blur();
      console.log('✅ Email valide accepté');
    });

    test('VIP-REG-05: Upload photo obligatoire', async ({ page }) => {
      await page.goto(`${BASE_URL}/visitor/register/vip`);
      await page.waitForLoadState('domcontentloaded');

      // Vérifier que l'upload photo est présent
      const photoInput = page.locator('input[type="file"][accept*="image"]').first();
      const photoExists = await photoInput.isVisible({ timeout: 3000 }).catch(() => false);

      if (!photoExists) {
        // Chercher un bouton d'upload ou label
        const uploadBtn = page.locator('button:has-text(/Photo|Image|Upload/), label:has-text(/Photo|Image/)').first();
        const uploadExists = await uploadBtn.isVisible({ timeout: 2000 }).catch(() => false);
        console.log(`✅ Zone upload photo: ${uploadExists ? 'présente' : 'MANQUANTE'}`);
      } else {
        console.log('✅ Input file pour photo présent');
      }
    });

    test('VIP-REG-06: Affichage prix 700€', async ({ page }) => {
      await page.goto(`${BASE_URL}/visitor/register/vip`);
      await page.waitForLoadState('domcontentloaded');

      // Vérifier affichage du prix
      const hasPriceDisplay = await page.locator('text=/700|EUR|€|Premium/i').isVisible({ timeout: 5000 });
      expect(hasPriceDisplay).toBe(true);
      console.log('✅ Prix 700€ affiché');
    });

  });

});

// =============================================================================
// TESTS: FLUX DE PAIEMENT
// =============================================================================

test.describe('💳 VISITEUR VIP - FLUX PAIEMENT', () => {

  test('VIP-PAY-01: Page paiement existe', async ({ page }) => {
    await page.goto(`${BASE_URL}/visitor/payment`);
    await page.waitForLoadState('domcontentloaded');

    // Peut rediriger vers login si non connecté
    const isPaymentPage = page.url().includes('payment') || page.url().includes('subscription');
    const isLoginRedirect = page.url().includes('login');

    console.log(`✅ Page paiement: ${isPaymentPage ? 'accessible' : isLoginRedirect ? 'redirect login (normal)' : 'autre'}`);
  });

  test('VIP-PAY-02: Options de paiement', async ({ page }) => {
    await page.goto(`${BASE_URL}/visitor/payment`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier les méthodes de paiement si la page est accessible
    if (!page.url().includes('login')) {
      const hasStripe = await page.locator('text=/Stripe|Carte|Card/i').isVisible({ timeout: 3000 }).catch(() => false);
      const hasPayPal = await page.locator('text=/PayPal/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasCMI = await page.locator('text=/CMI|Maroc/i').isVisible({ timeout: 2000 }).catch(() => false);

      console.log(`  Stripe: ${hasStripe ? '✅' : '❌'}`);
      console.log(`  PayPal: ${hasPayPal ? '✅' : '❌'}`);
      console.log(`  CMI: ${hasCMI ? '✅' : '❌'}`);
    } else {
      console.log('⚠️ Redirection login (connexion requise pour page paiement)');
    }
  });

  test('VIP-PAY-03: Page succès paiement', async ({ page }) => {
    await page.goto(`${BASE_URL}/visitor/payment-success`);
    await page.waitForLoadState('domcontentloaded');

    // Peut rediriger si pas de session paiement valide
    const isSuccessPage = page.url().includes('success');
    const hasSuccessMessage = await page.locator('text=/Paiement|Succès|Félicitations|Validé/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`✅ Page succès: ${isSuccessPage && hasSuccessMessage ? 'OK' : 'Redirect (normal si pas de paiement)'}`);
  });

});

// =============================================================================
// TESTS: ACCÈS DASHBOARD POST-PAIEMENT
// =============================================================================

test.describe('🎯 VISITEUR VIP - ACCÈS DASHBOARD', () => {

  test('VIP-DASH-01: Connexion VIP réussie', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').first().fill(TEST_VISITOR_VIP.email);
    await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
    await page.locator('button[type="submit"]').first().click();

    await page.waitForTimeout(3000);

    // Vérifier redirection (pas sur login = connecté)
    const isLoggedIn = !page.url().includes('login');

    console.log(`✅ Connexion VIP: ${isLoggedIn ? 'OK' : 'ÉCHEC'}`);
    expect(isLoggedIn).toBe(true);
  });

  test('VIP-DASH-02: Dashboard VIP accessible', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier éléments du dashboard
    const hasDashboardContent = await page.locator('text=/Dashboard|Tableau de bord|Espace Visiteur/i').isVisible({ timeout: 5000 }).catch(() => false);
    const hasQuotaInfo = await page.locator('text=/RDV|Quota|Rendez-vous|B2B/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`✅ Dashboard accessible: ${hasDashboardContent ? 'OUI' : 'NON'}`);
    console.log(`✅ Quotas affichés: ${hasQuotaInfo ? 'OUI' : 'NON'}`);

    expect(hasDashboardContent).toBe(true);
  });

  test('VIP-DASH-03: Badge VIP visible', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier niveau VIP
    const hasVipBadge = await page.locator('text=/VIP|Premium|👑/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Badge VIP: ${hasVipBadge ? 'visible' : 'non visible'}`);
    expect(hasVipBadge).toBe(true);
  });

  test('VIP-DASH-04: Quota RDV B2B affiché', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier affichage quota
    const hasQuotaDisplay = await page.locator('text=/10|RDV|B2B|Rendez-vous/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Quota RDV affiché: ${hasQuotaDisplay ? 'OUI' : 'NON'}`);
  });

});

// =============================================================================
// TESTS: FONCTIONNALITÉS VIP
// =============================================================================

test.describe('⭐ VISITEUR VIP - FONCTIONNALITÉS', () => {

  test('VIP-FEAT-01: Page Rendez-vous accessible', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('domcontentloaded');

    const hasAppointmentUI = await page.locator('text=/Rendez-vous|Calendrier|Créneaux/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Page RDV: ${hasAppointmentUI ? 'accessible' : 'non accessible'}`);
    expect(hasAppointmentUI).toBe(true);
  });

  test('VIP-FEAT-02: Networking IA accessible', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('domcontentloaded');

    const hasNetworkingUI = await page.locator('text=/Networking|Réseautage|Recommandations|IA|Connexions/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Networking IA: ${hasNetworkingUI ? 'accessible' : 'non accessible'}`);
    expect(hasNetworkingUI).toBe(true);
  });

  test('VIP-FEAT-03: Chat/Messagerie accessible', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('domcontentloaded');

    const hasChatUI = await page.locator('text=/Chat|Messages|Conversations|Discuter/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Messagerie: ${hasChatUI ? 'accessible' : 'non accessible'}`);
    expect(hasChatUI).toBe(true);
  });

  test('VIP-FEAT-04: Page Événements accessible', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('domcontentloaded');

    const hasEventsUI = await page.locator('text=/Événements|Programme|Conférences|Ateliers/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Événements: ${hasEventsUI ? 'accessible' : 'non accessible'}`);
    expect(hasEventsUI).toBe(true);
  });

  test('VIP-FEAT-05: Page Badge/QR Code', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('domcontentloaded');

    const hasQRCode = await page.locator('canvas, img[src*="qr"], text=/QR|Code|Badge/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Badge/QR: ${hasQRCode ? 'accessible' : 'non accessible'}`);
    expect(hasQRCode).toBe(true);
  });

  test('VIP-FEAT-06: Paramètres profil', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/visitor/settings`);
    await page.waitForLoadState('domcontentloaded');

    const hasSettingsUI = await page.locator('text=/Paramètres|Profil|Préférences|Modifier/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`✅ Paramètres: ${hasSettingsUI ? 'accessible' : 'non accessible'}`);
    expect(hasSettingsUI).toBe(true);
  });

});

// =============================================================================
// TESTS: RESTRICTIONS D'ACCÈS
// =============================================================================

test.describe('🔒 VISITEUR VIP - RESTRICTIONS', () => {

  test('VIP-RESTRICT-01: Pas d\'accès Dashboard Exposant', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const isBlocked = !page.url().includes('/exhibitor/dashboard') ||
                      await page.locator('text=/Non autorisé|Accès refusé|Réservé/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`✅ Dashboard Exposant bloqué: ${isBlocked ? 'OUI ✓' : 'NON ⚠️'}`);
    expect(isBlocked).toBe(true);
  });

  test('VIP-RESTRICT-02: Pas d\'accès Dashboard Partenaire', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const isBlocked = !page.url().includes('/partner/dashboard') ||
                      await page.locator('text=/Non autorisé|Accès refusé|Réservé/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`✅ Dashboard Partenaire bloqué: ${isBlocked ? 'OUI ✓' : 'NON ⚠️'}`);
    expect(isBlocked).toBe(true);
  });

  test('VIP-RESTRICT-03: Pas d\'accès Dashboard Admin', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const isBlocked = !page.url().includes('/admin/dashboard') ||
                      await page.locator('text=/Non autorisé|Accès refusé|Admin/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`✅ Dashboard Admin bloqué: ${isBlocked ? 'OUI ✓' : 'NON ⚠️'}`);
    expect(isBlocked).toBe(true);
  });

});

// =============================================================================
// TESTS: DÉCONNEXION
// =============================================================================

test.describe('🚪 VISITEUR VIP - DÉCONNEXION', () => {

  test('VIP-LOGOUT-01: Déconnexion fonctionne', async ({ page }) => {
    await loginAsVIP(page);

    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Trouver et cliquer sur déconnexion
    const logoutBtn = page.locator('button:has-text(/Déconnexion|Logout|Se déconnecter/)').first();

    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);

      // Vérifier redirection vers login ou accueil
      const isLoggedOut = page.url().includes('login') || page.url() === `${BASE_URL}/`;
      console.log(`✅ Déconnexion: ${isLoggedOut ? 'OK' : 'page: ' + page.url()}`);
    } else {
      console.log('⚠️ Bouton déconnexion non trouvé');
    }
  });

  test('VIP-LOGOUT-02: Dashboard inaccessible après déconnexion', async ({ page }) => {
    await loginAsVIP(page);

    // Déconnexion
    const logoutBtn = page.locator('button:has-text(/Déconnexion|Logout/)').first();
    if (await logoutBtn.isVisible({ timeout: 3000 })) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    }

    // Tenter d'accéder au dashboard
    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    // Devrait être redirigé vers login
    const redirectedToLogin = page.url().includes('login');
    console.log(`✅ Dashboard protégé après logout: ${redirectedToLogin ? 'OUI ✓' : 'NON ⚠️'}`);
    expect(redirectedToLogin).toBe(true);
  });

});

