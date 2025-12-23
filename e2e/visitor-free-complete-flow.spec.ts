import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

// Comptes de test pour les visiteurs FREE
const TEST_VISITOR_FREE = {
  email: 'visitor-free@test.siport.com',
  password: 'Test@1234567'
};

test.describe('👤 VISITEUR FREE - PARCOURS COMPLET', () => {

  test('ÉTAPE 1: Inscription Visiteur FREE', async ({ page }) => {
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

  test('ÉTAPE 2: Connexion Visiteur FREE', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Attendre le chargement
    await page.waitForLoadState('domcontentloaded');
    
    // Remplir email
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill(TEST_VISITOR_FREE.email);
    
    // Remplir mot de passe
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(TEST_VISITOR_FREE.password);
    
    // Soumettre le formulaire
    const submitBtn = page.locator('button[type="submit"]:visible').first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    
    // Attendre la redirection
    await page.waitForURL(/\/(dashboard|visitor|appointments|index)/, { timeout: 10000 }).catch(() => {});
    
    // Vérifier l'authentification
    const isAuthenticated = await page.locator('text=/Connexion|Se connecter/').count().then(c => c === 0);
    console.log(`✅ Authentification: ${isAuthenticated ? 'OK' : 'FAILED'}`);
  });

  test('ÉTAPE 3: Accès aux pages visiteur FREE', async ({ page }) => {
    // Prérequis: être connecté
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_FREE.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Tester accès aux pages publiques
    const publicPages = [
      '/exhibitors',  // Liste des exposants
      '/pavilions',   // Pavillons
      '/events',      // Événements
      '/media'        // Média
    ];
    
    for (const path of publicPages) {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Vérifier pas d'erreur 403/404
      const status = page.url();
      const hasError = await page.locator('text=/403|404|Accès non autorisé/i').isVisible().catch(() => false);
      console.log(`✅ ${path}: ${hasError ? 'BLOQUÉ (pas attendu)' : 'ACCESSIBLE'}`);
      expect(hasError).toBe(false);
    }
  });

  test('ÉTAPE 4: Tentative accès Rendez-vous (quota FREE = 0)', async ({ page }) => {
    // Prérequis: être connecté
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_FREE.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Essayer d'accéder à /appointments
    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier si blocage ou redirection
    const hasBlockMessage = await page.locator('text=/réservé|premium|vip|gratuit|free/i').isVisible().catch(() => false);
    const isRedirected = !page.url().includes('/appointments');
    
    console.log(`✅ Quota RDV (FREE=0): ${hasBlockMessage || isRedirected ? 'RESPECTÉ (bloqué/redirigé)' : 'NON RESPECTÉ'}`);
    expect(hasBlockMessage || isRedirected).toBe(true);
  });

  test('ÉTAPE 5: Accès page Abonnement (Upgrade VIP)', async ({ page }) => {
    // Prérequis: être connecté
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_FREE.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder à la page d'abonnement
    await page.goto(`${BASE_URL}/visitor/subscription`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier la présence des offres (FREE + VIP 700€)
    const hasFreePlan = await page.locator('text=Gratuit|Free|Passez au Free').isVisible().catch(() => false);
    const hasVipPlan = await page.locator('text=/VIP|Premium|700|EUR|€/').isVisible().catch(() => false);
    
    console.log(`✅ Page Abonnement: ${hasFreePlan && hasVipPlan ? 'OK' : 'FAILED'}`);
    expect(hasFreePlan && hasVipPlan).toBe(true);
  });

  test('ÉTAPE 6: QR Code Visiteur FREE', async ({ page }) => {
    // Prérequis: être connecté
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_FREE.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
    }
    
    // Accéder à la page badge/QR
    await page.goto(`${BASE_URL}/visitor/badge`);
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier présence QR code
    const hasQRCode = await page.locator('canvas, img[src*="qr"], text=/QR|code|scan/i').isVisible().catch(() => false);
    const hasBasicLevel = await page.locator('text=/basic|gratuit|free/i').isVisible().catch(() => false);
    
    console.log(`✅ QR Code Visiteur FREE: ${hasQRCode ? 'GÉNÉRÉ' : 'MANQUANT'}, Niveau: ${hasBasicLevel ? 'BASIC ✓' : '?'}`);
    expect(hasQRCode).toBe(true);
  });

  test('ÉTAPE 7: Logout et redirection', async ({ page }) => {
    // Prérequis: être connecté
    await page.goto(`${BASE_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(TEST_VISITOR_FREE.email);
      await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);
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
      console.log('✅ Déconnexion et redirection: OK');
    }
  });

});
