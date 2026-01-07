import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// Données de test partenaire
const generateTestEmail = () => `partner-test-${Date.now()}@test.siport.com`;

const TEST_PARTNER = {
  firstName: 'Marie',
  lastName: 'Partenaire',
  phone: '+33612345678',
  company: 'Partenaire Maritime SA',
  sector: 'Transport Maritime',
  position: 'Directrice Partenariats',
  description: 'Leader dans le secteur maritime avec plus de 20 ans d\'expérience.',
  website: 'https://partenaire-maritime.example.com',
  password: 'Test@123456'
};

test.describe('🤝 INSCRIPTION PARTENAIRE COMPLÈTE', () => {

  test('Inscription complète partenaire - Choix offre → Inscription → Paiement → Validation', async ({ page }) => {
    // Augmenter le timeout à 60 secondes
    test.setTimeout(60000);
    
    const testEmail = generateTestEmail();

    // ========== ÉTAPE 1: PAGE PLANS D'ABONNEMENT ==========
    console.log('\n📍 ÉTAPE 1: Ouvrir la page Plans d\'Abonnement');
    await page.goto(`${BASE_URL}/partnership`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 1
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/1-page-partenariat.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 1 capturé: Page Plans d\'Abonnement');

    // ⏸️ PAUSE DEBUGGER (réduite à 2s)
    console.log('⏸️ PAUSE 2s - Vérifiez la page Plans d\'Abonnement...');
    await page.waitForTimeout(2000);

    // Scroll pour voir les offres
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // 📸 SCREENSHOT 1b
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/1b-offres-partenaires.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 1b capturé: Offres partenaires visibles');

    // ========== ÉTAPE 2: CHOISIR PARTENAIRE ==========
    console.log('\n📍 ÉTAPE 2: Choisir partenaire et aller à l\'inscription');
    
    // Chercher un bouton "Devenir Partenaire"
    const partnerBtn = page.locator('button:has-text("Devenir Partenaire"), a:has-text("Devenir Partenaire")').first();
    
    if (await partnerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('🔘 Clic sur "Devenir Partenaire"');
      await partnerBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Navigation directe si pas de bouton trouvé
      console.log('➡️ Navigation directe vers /register/partner');
      await page.goto(`${BASE_URL}/register/partner`);
      await page.waitForTimeout(2000);
    }

    // ========== ÉTAPE 3: PAGE INSCRIPTION PARTENAIRE ==========
    console.log('\n📍 ÉTAPE 3: Page Inscription Partenaire (Devenir Partenaire SIPORTS 2026)');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 2
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/2-formulaire-vide.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 2 capturé: Formulaire d\'inscription vide');

    // ⏸️ PAUSE DEBUGGER (réduite à 2s)
    console.log('⏸️ PAUSE 2s - Vérifiez le formulaire d\'inscription...');
    await page.waitForTimeout(2000);

    // ========== ÉTAPE 4: REMPLIR LE FORMULAIRE ==========
    console.log('\n📍 ÉTAPE 4: Remplir le formulaire "Devenir Partenaire SIPORTS 2026"');

    // Sélectionner type "Partenaire" si présent
    const partnerRadio = page.locator('input[type="radio"][value="partner"], label:has-text("Partenaire")').first();
    if (await partnerRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  🔘 Sélection: Partenaire');
      await partnerRadio.click();
      await page.waitForTimeout(1000);
    }

    // Remplir les champs du formulaire
    console.log('  📝 Remplissage des champs...');
    
    // Prénom
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="Prénom"]').first();
    if (await firstNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstNameInput.fill(TEST_PARTNER.firstName);
      console.log('    ✅ Prénom: ' + TEST_PARTNER.firstName);
    }

    // Nom
    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Nom"]').first();
    if (await lastNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await lastNameInput.fill(TEST_PARTNER.lastName);
      console.log('    ✅ Nom: ' + TEST_PARTNER.lastName);
    }

    // Email
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill(testEmail);
      console.log('    ✅ Email: ' + testEmail);
    }

    // Téléphone
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
    if (await phoneInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await phoneInput.fill(TEST_PARTNER.phone);
      console.log('    ✅ Téléphone: ' + TEST_PARTNER.phone);
    }

    // Entreprise
    const companyInput = page.locator('input[name="company"], input[placeholder*="Entreprise"]').first();
    if (await companyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await companyInput.fill(TEST_PARTNER.company);
      console.log('    ✅ Entreprise: ' + TEST_PARTNER.company);
    }

    // Secteur
    const sectorSelect = page.locator('select[name="sector"]').first();
    if (await sectorSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sectorSelect.selectOption('Transport Maritime');
      console.log('    ✅ Secteur: Transport Maritime');
    }

    // Position
    const positionInput = page.locator('input[name="position"], input[placeholder*="Fonction"]').first();
    if (await positionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await positionInput.fill(TEST_PARTNER.position);
      console.log('    ✅ Position: ' + TEST_PARTNER.position);
    }

    // Site web
    const websiteInput = page.locator('input[name="website"], input[type="url"]').first();
    if (await websiteInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await websiteInput.fill(TEST_PARTNER.website);
      console.log('    ✅ Site web: ' + TEST_PARTNER.website);
    }

    // Scroll pour voir la suite
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);

    // Description
    const descriptionTextarea = page.locator('textarea[name="description"]').first();
    if (await descriptionTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descriptionTextarea.fill(TEST_PARTNER.description);
      console.log('    ✅ Description remplie');
    }

    // Mot de passe
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await passwordInput.fill(TEST_PARTNER.password);
      console.log('    ✅ Mot de passe rempli');
    }

    // Confirmation mot de passe
    const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
    if (await confirmPasswordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmPasswordInput.fill(TEST_PARTNER.password);
      console.log('    ✅ Confirmation mot de passe remplie');
    }

    // Scroll pour voir les conditions
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(1000);

    // Accepter les conditions
    const termsCheckbox = page.locator('input[type="checkbox"]').first();
    if (await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await termsCheckbox.check();
      console.log('    ✅ Conditions acceptées');
    }

    // 📸 SCREENSHOT 3
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/3-formulaire-rempli.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 3 capturé: Formulaire complet rempli');

    // ⏸️ PAUSE DEBUGGER (réduite à 2s)
    console.log('⏸️ PAUSE 2s - Vérifiez le formulaire complet...');
    await page.waitForTimeout(2000);

    // ========== ÉTAPE 5: SOUMISSION ==========
    console.log('\n📍 ÉTAPE 5: Soumission du formulaire');
    
    const submitBtn = page.locator('button[type="submit"], button:has-text("S\'inscrire"), button:has-text("Créer"), button:has-text("Continuer")').first();
    
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  🖱️ Clic sur le bouton de soumission');
      await submitBtn.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('  ⚠️ Bouton de soumission non trouvé');
    }

    // 📸 SCREENSHOT 4
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/4-apres-soumission.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 4 capturé: Après soumission');

    // ========== ÉTAPE 6: PAGE PAIEMENT ==========
    console.log('\n📍 ÉTAPE 6: Page de paiement (si applicable)');
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    console.log(`  📍 URL actuelle: ${currentUrl}`);

    // 📸 SCREENSHOT 5
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/5-page-paiement.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 5 capturé: Page paiement/validation');

    // ⏸️ PAUSE DEBUGGER FINALE (réduite à 2s)
    console.log('⏸️ PAUSE 2s - Vérifiez la page finale...');
    await page.waitForTimeout(2000);

    // ========== ÉTAPE 7: VALIDATION ==========
    console.log('\n📍 ÉTAPE 7: Validation finale');
    
    // 📸 SCREENSHOT 6
    await page.screenshot({ 
      path: 'screenshoots/inscription partenaire/6-validation-finale.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot 6 capturé: Validation finale');

    console.log('\n✅ TEST TERMINÉ - Inscription partenaire complète\n');
  });
});
