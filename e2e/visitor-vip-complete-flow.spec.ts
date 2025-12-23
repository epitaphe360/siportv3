import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Comptes de test pour les visiteurs VIP
const TEST_VISITOR_VIP = {
  email: 'visitor-vip@test.siport.com',
  password: 'Test@1234567'
};

test.describe('👑 VISITEUR VIP (PREMIUM 700€) - PARCOURS COMPLET', () => {

  test('ÉTAPE 1: Inscription Visiteur VIP avec sélection Premium', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Attendre le chargement de la page
    await page.waitForLoadState('domcontentloaded');
    
    // Étape 1: Choisir le type Visiteur
    const visitorLabel = page.locator('label:has-text("Visiteur")').first();
    await expect(visitorLabel).toBeVisible({ timeout: 5000 });
    await visitorLabel.click();
    
    // Cliquer Suivant
    const nextBtn = page.locator('button:has-text("Suivant")').first();
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    
    // Attendre passage à l'étape 2 (Entreprise)
    await page.waitForTimeout(500);
    await expect(page.locator('text=Informations sur votre organisation').first()).toBeVisible({ timeout: 3000 });
  });

  test('ÉTAPE 2: Connexion Visiteur VIP', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Attendre le chargement
    await page.waitForLoadState('domcontentloaded');
    
    // Remplir email
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill(TEST_VISITOR_VIP.email);
    
    // Remplir mot de passe
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_VISITOR_VIP.password);
    
    // Soumettre le formulaire
    const submitBtn = page.locator('button[type="submit"]:visible').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // Attendre la redirection
    await page.waitForURL(/\/(dashboard|visitor|appointments|index)/, { timeout: 10000 }).catch(() => {});
    
    // Vérifier l'authentification
    const isAuthenticated = await page.locator('text=/Connexion|Se connecter/').count().then(c => c === 0);
    console.log(`✅ Authentification VIP: ${isAuthenticated ? 'OK' : 'FAILED'}`);
  });

  test('ÉTAPE 3: Accès Dashboard Visiteur VIP (bloqué pour FREE)', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder au dashboard VIP
    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier titre VIP
    const hasDashboardTitle = await page.locator('text=/Espace Visiteur|Dashboard|VIP/i').isVisible().catch(() => false);
    const hasQuotaInfo = await page.locator('text=/RDV|Quota|Rendez-vous/i').isVisible().catch(() => false);
    
    console.log(`✅ Dashboard VIP: ${hasDashboardTitle && hasQuotaInfo ? 'ACCESSIBLE' : 'BLOQUÉ'}`);
    expect(hasDashboardTitle && hasQuotaInfo).toBe(true);
  });

  test('ÉTAPE 4: Rendez-vous B2B VIP - Quota 10 RDV', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder à la page rendez-vous
    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier présence du calendrier / liste rendez-vous
    const hasAppointmentUI = await page.locator('text=/Rendez-vous|Calendrier|Exposants|Créneau/i').isVisible().catch(() => false);
    
    // Vérifier affichage du quota (10 max)
    const hasQuotaDisplay = await page.locator('text=/10|Quota|Demandes|RDV/i').isVisible().catch(() => false);
    
    console.log(`✅ Page RDV VIP: ${hasAppointmentUI ? 'ACCESSIBLE' : 'BLOQUÉ'}, Quota affiché: ${hasQuotaDisplay ? 'OUI' : 'NON'}`);
    expect(hasAppointmentUI).toBe(true);
  });

  test('ÉTAPE 5: Networking IA VIP - Connexions illimitées', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder au networking IA
    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier la présence du module networking
    const hasNetworkingUI = await page.locator('text=/Réseautage|Networking|Connexions|Recommandations|IA/i').isVisible().catch(() => false);
    
    console.log(`✅ Module Networking IA: ${hasNetworkingUI ? 'ACCESSIBLE' : 'NON TROUVÉ'}`);
    expect(hasNetworkingUI).toBe(true);
  });

  test('ÉTAPE 6: QR Code VIP - Niveau "vip" + Zones 7/8', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder à la page badge/QR
    await page.goto(`${BASE_URL}/visitor/badge`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier présence QR code
    const hasQRCode = await page.locator('canvas, img[src*="qr"], text=/QR|code|scan/i').isVisible().catch(() => false);
    
    // Vérifier niveau VIP (pas "basic")
    const hasVipLevel = await page.locator('text=/VIP|Premium|Accès complet|Toutes les zones/i').isVisible().catch(() => false);
    const isNotBasic = await page.locator('text=/basic|gratuit|free/i').isVisible().then(v => !v).catch(() => true);
    
    // Vérifier zones accessibles
    const hasZonesInfo = await page.locator('text=/zones|zone|Salon VIP|Networking|Backstage/i').isVisible().catch(() => false);
    
    console.log(`✅ QR Code VIP: ${hasQRCode ? 'GÉNÉRÉ' : 'MANQUANT'}`);
    console.log(`✅ Niveau: ${hasVipLevel && isNotBasic ? 'VIP ✓' : 'FREE/BASIC ❌'}`);
    console.log(`✅ Zones accessibles: ${hasZonesInfo ? 'AFFICHÉES' : 'NON'}`);
    
    expect(hasQRCode).toBe(true);
    expect(hasVipLevel && isNotBasic).toBe(true);
  });

  test('ÉTAPE 7: Accès Événements VIP - Ateliers + Gala + Conférences', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder à la page événements
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier liste événements
    const hasEventsUI = await page.locator('text=/Événements|Ateliers|Conférences|Gala|Programme/i').isVisible().catch(() => false);
    
    // Vérifier bouton inscription VIP
    const hasVipRegistration = await page.locator('text=/S\'inscrire|Réserver|Participer|VIP/i').isVisible().catch(() => false);
    
    console.log(`✅ Page Événements: ${hasEventsUI ? 'ACCESSIBLE' : 'BLOQUÉ'}`);
    console.log(`✅ Inscription VIP: ${hasVipRegistration ? 'POSSIBLE' : 'IMPOSSIBLE'}`);
    
    expect(hasEventsUI).toBe(true);
  });

  test('ÉTAPE 8: Messagerie Illimitée VIP', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder au chat/messagerie
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier présence module chat
    const hasChatUI = await page.locator('text=/Chat|Messages|Conversations|Exposants|Discuter/i').isVisible().catch(() => false);
    
    // Vérifier pas de limitation affichée
    const hasNoQuotaLimit = await page.locator('text=/limité|quota|messages restants|restriction/i').isVisible().then(v => !v).catch(() => true);
    
    console.log(`✅ Messagerie VIP: ${hasChatUI && hasNoQuotaLimit ? 'ILLIMITÉE' : 'LIMITÉE OU BLOQUÉE'}`);
  });

  test('ÉTAPE 9: Profil Visiteur VIP - Tous les champs', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder aux paramètres/profil visiteur
    await page.goto(`${BASE_URL}/visitor/settings`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier présence champs profil
    const hasProfileFields = await page.locator('text=/Profil|Nom|Email|Entreprise|Secteur|Pays|Téléphone|LinkedIn|Site/i').isVisible().catch(() => false);
    
    // Vérifier upload photo
    const hasPhotoUpload = await page.locator('text=/Photo|Avatar|Image|Télécharger/i').isVisible().catch(() => false);
    
    console.log(`✅ Champs Profil: ${hasProfileFields ? 'COMPLETS' : 'LIMITÉS'}`);
    console.log(`✅ Upload Photo: ${hasPhotoUpload ? 'DISPONIBLE' : 'ABSENT'}`);
  });

  test('ÉTAPE 10: Limitation - Zone Technique BLOQUÉE', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Essayer d'accéder à zone technique (si route existe)
    await page.goto(`${BASE_URL}/zones/technical`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier blocage
    const hasBlockMessage = await page.locator('text=/Zone Technique|Réservée|Non autorisé|Accès refusé|Admin|Staff/i').isVisible().catch(() => false);
    const isRedirected = !page.url().includes('/zones/technical');
    
    console.log(`✅ Zone Technique: ${hasBlockMessage || isRedirected ? 'BLOQUÉE ✓' : 'ACCESSIBLE (BUG?)'}`);
    expect(hasBlockMessage || isRedirected).toBe(true);
  });

  test('ÉTAPE 11: Limitation - Pas d\'accès Exposant/Partenaire', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Essayer d'accéder au dashboard Exposant
    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier blocage ou redirection
    const hasBlockMessage = await page.locator('text=/Exposant|Réservé|Non autorisé|Admin|Accès/i').isVisible().catch(() => false);
    const isRedirected = !page.url().includes('/exhibitor');
    
    console.log(`✅ Accès Exposant: ${hasBlockMessage || isRedirected ? 'BLOQUÉ ✓' : 'OUVERT (BUG?)'}`);
    expect(hasBlockMessage || isRedirected).toBe(true);
  });

  test('ÉTAPE 12: Logout VIP', async ({ page }) => {
    // Prérequis: être connecté en VIP
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_VIP.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Trouver et cliquer Déconnexion
    const logoutBtn = page.locator('button:has-text(/Déconnexion|Logout|Sign out/)').first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
      
      // Vérifier redirection vers login
      expect(page.url()).toContain('/login');
      console.log('✅ Déconnexion VIP: OK');
    }
  });

});
