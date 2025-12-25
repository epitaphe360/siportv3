import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// Comptes de test pour les visiteurs FREE
// NOTE: Compte RÉEL enregistré en base de données (plus de compte fantôme/aléatoire)
const TEST_VISITOR_FREE = {
  email: 'visitor-free-demo-v13@test.siport.com',
  password: 'Test@1234567'
};

test.describe('👤 VISITEUR FREE - SCÉNARIO COMPLET', () => {
  test.setTimeout(60000); // Augmenter le timeout global à 60s

  test('SCÉNARIO: Choix Plan -> Inscription -> Succès -> Login -> Dashboard -> Badge', async ({ page }) => {
    
    // --- ÉTAPE 1: CHOIX DU PLAN (ABONNEMENT) ---
    console.log('📍 ÉTAPE 1: Choix du plan (Page publique)');
    await page.goto(`${BASE_URL}/visitor/subscription`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier que les offres sont visibles
    const freeCardTitle = page.locator('h3:has-text("Visiteur Gratuit")');
    await expect(freeCardTitle).toBeVisible();

    // Hover sur le plan gratuit pour la photo
    const freeButton = page.locator('button:has-text("S\'inscrire gratuitement")').first();
    await freeButton.hover();
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT 1: Choix du plan
    await page.screenshot({ path: 'screenshots/inscription-free/1-choix-plan.png', fullPage: true });

    // Cliquer sur "S'inscrire gratuitement"
    await freeButton.click();
    
    // --- ÉTAPE 2: INSCRIPTION ---
    console.log('📍 ÉTAPE 2: Formulaire d\'inscription');
    // Vérifier la redirection vers /register
    await page.waitForURL(/\/register/);
    await expect(page.locator('h1:has-text("Créer un compte")')).toBeVisible();

    // 📸 SCREENSHOT 2a: Page inscription vide (pré-remplie visiteur)
    await page.screenshot({ path: 'screenshots/inscription-free/2a-inscription-vide.png', fullPage: true });

    // Remplir le wizard
    // Étape 1: Type (déjà sélectionné ou à cliquer)
    const visitorLabel = page.locator('[data-testid="account-type-visitor"]');
    if (await visitorLabel.isVisible()) {
        await visitorLabel.click();
    }
    
    // 📸 SCREENSHOT 2b: Type de compte
    await page.screenshot({ path: 'screenshots/inscription-free/2b-inscription-type.png', fullPage: true });

    await page.locator('button:has-text("Suivant")').first().click();
    
    // Étape 2: Entreprise
    await expect(page.locator('text=Informations sur votre organisation')).toBeVisible();
    await page.locator('select[name="sector"]').selectOption('Logistique');
    await page.locator('select[name="country"]').selectOption('FR');
    
    // 📸 SCREENSHOT 2c: Entreprise
    await page.screenshot({ path: 'screenshots/inscription-free/2c-inscription-entreprise.png', fullPage: true });
    
    await page.locator('button:has-text("Suivant")').first().click();

    // Étape 3: Contact
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.locator('input[name="firstName"]').fill('Jean');
    await page.locator('input[name="lastName"]').fill('Dupont');
    await page.locator('input[name="email"]').fill(TEST_VISITOR_FREE.email);
    await page.locator('input[name="phone"]').fill('+33612345678');
    await page.locator('select[name="position"]').selectOption('Étudiant');

    // 📸 SCREENSHOT 2d: Contact
    await page.screenshot({ path: 'screenshots/inscription-free/2d-inscription-contact.png', fullPage: true });

    await page.locator('button:has-text("Suivant")').first().click();

    // Étape 4: Profil
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await page.locator('textarea[name="description"]').fill('Visiteur intéressé par le salon.');
    await page.locator('input[type="checkbox"]').first().check();

    // 📸 SCREENSHOT 2e: Profil
    await page.screenshot({ path: 'screenshots/inscription-free/2e-inscription-profil.png', fullPage: true });

    await page.locator('button:has-text("Suivant")').first().click();

    // Étape 5: Sécurité
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await page.locator('input[name="password"]').fill(TEST_VISITOR_FREE.password);
    await page.locator('input[name="confirmPassword"]').fill(TEST_VISITOR_FREE.password);

    // 📸 SCREENSHOT 2f: Sécurité
    await page.screenshot({ path: 'screenshots/inscription-free/2f-inscription-securite.png', fullPage: true });

    // Soumettre
    await page.locator('button:has-text("Créer mon compte")').click();

    // --- ÉTAPE 3: SUCCÈS (POPUP) ---
    console.log('📍 ÉTAPE 3: Popup de succès');
    const successPopup = page.locator('text=Compte créé avec succès');
    await expect(successPopup).toBeVisible({ timeout: 15000 });
    
    // Attendre que l'animation soit bien visible
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 3: Popup Succès
    await page.screenshot({ path: 'screenshots/inscription-free/3-inscription-succes-popup.png', fullPage: true });

    // --- ÉTAPE 4: CONNEXION ---
    console.log('📍 ÉTAPE 4: Page de connexion');
    // Attendre la redirection automatique vers /login
    await page.waitForURL(/\/login/, { timeout: 10000 });
    
    // Remplir le login
    await page.locator('input[type="email"]').first().fill(TEST_VISITOR_FREE.email);
    await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);

    // 📸 SCREENSHOT 4: Connexion
    await page.screenshot({ path: 'screenshots/inscription-free/4-connexion.png', fullPage: true });

    await page.locator('button[type="submit"]').first().click();

    // --- ÉTAPE 5: TABLEAU DE BORD ---
    console.log('📍 ÉTAPE 5: Tableau de bord');
    // Attendre redirection dashboard
    await page.waitForURL(/\/dashboard|visitor/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Attendre chargement widgets

    // 📸 SCREENSHOT 5: Dashboard
    await page.screenshot({ path: 'screenshots/inscription-free/5-dashboard.png', fullPage: true });

    // --- ÉTAPE 6: BADGE ---
    console.log('📍 ÉTAPE 6: Badge');
    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('networkidle');
    
    // Générer si besoin
    const generateBtn = page.getByRole('button', { name: /Générer|Generate/i });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.waitForTimeout(2000); // Attendre rendu QR code

    // 📸 SCREENSHOT 6: Badge
    await page.screenshot({ path: 'screenshots/inscription-free/6-badge.png', fullPage: true });

    console.log('✅ SCÉNARIO TERMINÉ AVEC SUCCÈS');
  });

});
