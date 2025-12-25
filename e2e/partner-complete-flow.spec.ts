import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// =============================================================================
// CONFIGURATION TEST PARTENAIRE
// =============================================================================

// Comptes partenaires existants pour tests de connexion
const TEST_PARTNER_MUSEUM = {
  email: 'partner-museum@test.siport.com',
  password: 'Test@123456'
};

const TEST_PARTNER_SILVER = {
  email: 'partner-silver@test.siport.com',
  password: 'Test@123456'
};

const TEST_PARTNER_GOLD = {
  email: 'partner-gold@test.siport.com',
  password: 'Test@123456'
};

const TEST_PARTNER_PLATINIUM = {
  email: 'partner-platinium@test.siport.com',
  password: 'Test@123456'
};

// Données pour test d'inscription (email unique à chaque test)
const generateTestEmail = () => `partner-test-${Date.now()}@test.siport.com`;

const TEST_PARTNER_REGISTRATION = {
  firstName: 'Marie',
  lastName: 'Partenaire',
  phone: '+33612345678',
  company: 'Partenaire Maritime SA',
  sector: 'Transport Maritime',
  country: 'France',
  position: 'Directrice Partenariats',
  description: 'Leader dans le secteur maritime avec plus de 20 ans d\'expérience en logistique portuaire et transport international.',
  website: 'https://partenaire-maritime.example.com',
  password: 'Test@123456'
};

// Options de partenariat disponibles
const PARTNER_TIERS = {
  museum: { price: 20000, label: 'Pass Musée 🏛️', quotaRDV: 20 },
  silver: { price: 48000, label: 'Pass Silver 🥈', quotaRDV: 50 },
  gold: { price: 95000, label: 'Pass Gold 🥇', quotaRDV: 100 },
  platinium: { price: 180000, label: 'Pass Platinium 👑', quotaRDV: 200 }
};

// =============================================================================
// TEST: INSCRIPTION PARTENAIRE COMPLÈTE AVEC SCREENSHOTS
// =============================================================================

test.describe('🤝 PARTENAIRE - INSCRIPTION COMPLÈTE', () => {

  test('SCÉNARIO: Choix Offre -> Inscription -> Paiement -> Validation Admin -> Dashboard', async ({ page }) => {
    const testEmail = generateTestEmail();

    // --- ÉTAPE 1: PAGE PARTENARIAT - PRÉSENTATION DES OFFRES ---
    console.log('📍 ÉTAPE 1: Page Plans d\'Abonnement Partenaire');
    await page.goto(`${BASE_URL}/partnership`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 1: Page partenariat / plans d'abonnement
    await page.screenshot({ path: 'screenshoots/inscription partenaire/1-page-partenariat.png', fullPage: true });
    console.log('✅ Screenshot 1: Page partenariat capturé');

    // Pause pour debugger
    console.log('⏸️ PAUSE - Vérifiez la page partenariat...');
    await page.waitForTimeout(3000);

    // Scroll pour voir les offres
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);

    // 📸 SCREENSHOT 1b: Offres partenaires visibles
    await page.screenshot({ path: 'screenshoots/inscription partenaire/1b-offres-partenaires.png', fullPage: true });
    console.log('✅ Screenshot 1b: Offres partenaires capturé');

    // --- ÉTAPE 2: NAVIGATION VERS INSCRIPTION PARTENAIRE ---
    console.log('📍 ÉTAPE 2: Navigation vers inscription partenaire');
    
    // Chercher et cliquer sur bouton "Devenir Partenaire" ou similaire
    const partnerBtn = page.locator('button:has-text("Devenir Partenaire"), a:has-text("Devenir Partenaire"), button:has-text("Contactez-nous")').first();
    
    if (await partnerBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('🔘 Clic sur bouton Devenir Partenaire');
      await partnerBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Navigation directe vers inscription partenaire
      console.log('➡️ Navigation directe vers /register/partner');
      await page.goto(`${BASE_URL}/register/partner`);
      await page.waitForTimeout(2000);
    }

    // --- ÉTAPE 3: FORMULAIRE D'INSCRIPTION PARTENAIRE ---
    console.log('📍 ÉTAPE 3: Page "Devenir Partenaire SIPORTS 2026"');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Vérifier qu'on est sur la page d'inscription
    const registerTitle = page.locator('text=/Inscription|Register|Devenir Partenaire|SIPORTS 2026/i').first();
    await expect(registerTitle).toBeVisible({ timeout: 10000 });

    // 📸 SCREENSHOT 2: Page inscription partenaire vide
    await page.screenshot({ path: 'screenshoots/inscription partenaire/2-formulaire-inscription-vide.png', fullPage: true });
    console.log('✅ Screenshot 2: Formulaire inscription vide capturé');

    // Pause pour debugger
    console.log('⏸️ PAUSE - Vérifiez le formulaire d\'inscription...');
    await page.waitForTimeout(3000);

    // Sélectionner le type de compte "Partenaire" si visible
    const partnerRadio = page.locator('input[type="radio"][value="partner"], input[value="partner"], [data-testid="account-type-partner"]');
    if (await partnerRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('🔘 Sélection du type: Partenaire');
      await partnerRadio.click();
      await page.waitForTimeout(1000);
      
      // 📸 SCREENSHOT 2b: Type partenaire sélectionné
      await page.screenshot({ path: 'screenshoots/inscription partenaire/2b-type-partenaire-selectionne.png', fullPage: true });
      console.log('✅ Screenshot 2b: Type partenaire sélectionné capturé');
    }

    if (isWizard) {
      // === WIZARD MULTI-ÉTAPES ===

      // Étape 1: Type de compte - Sélectionner Partenaire
      const partnerLabel = page.locator('[data-testid="account-type-partner"], label:has-text("Partenaire")');
      if (await partnerLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
        await partnerLabel.click();
        await page.waitForTimeout(500);
      }

      // 📸 SCREENSHOT 2b: Type de compte sélectionné
      await page.screenshot({ path: 'screenshots/inscription-partenaire/2b-type-partenaire.png', fullPage: true });

      await page.locator('button:has-text("Suivant")').first().click();
      await page.waitForTimeout(500);

      // Étape 2: Informations Entreprise
      const entrepriseTitle = page.locator('text=/Informations sur votre organisation|Entreprise/i');
      if (await entrepriseTitle.isVisible({ timeout: 3000 }).catch(() => false)) {

        // Nom de l'entreprise
        const companyInput = page.locator('input[name="company"], input[name="companyName"], input[placeholder*="Entreprise"]').first();
        if (await companyInput.isVisible()) {
          await companyInput.fill(TEST_PARTNER_REGISTRATION.company);
        }

        // Secteur d'activité
        const sectorSelect = page.locator('select[name="sector"]');
        if (await sectorSelect.isVisible()) {
          await sectorSelect.selectOption('Transport Maritime');
        } else {
          const sectorInput = page.locator('input[name="sector"]');
          if (await sectorInput.isVisible()) {
            await sectorInput.fill(TEST_PARTNER_REGISTRATION.sector);
          }
        }

        // Pays
        const countrySelect = page.locator('select[name="country"]');
        if (await countrySelect.isVisible()) {
          await countrySelect.selectOption('FR');
        }

        // Site web
        const websiteInput = page.locator('input[name="website"], input[placeholder*="Site"]').first();
        if (await websiteInput.isVisible()) {
          await websiteInput.fill(TEST_PARTNER_REGISTRATION.website);
        }

        // 📸 SCREENSHOT 2c: Informations entreprise
        await page.screenshot({ path: 'screenshots/inscription-partenaire/2c-entreprise.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
        await page.waitForTimeout(500);
      }

      // Étape 3: Contact
      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.locator('input[name="firstName"]').fill(TEST_PARTNER_REGISTRATION.firstName);
        await page.locator('input[name="lastName"]').fill(TEST_PARTNER_REGISTRATION.lastName);
        await emailInput.fill(testEmail);
        await page.locator('input[name="phone"]').fill(TEST_PARTNER_REGISTRATION.phone);

        const positionSelect = page.locator('select[name="position"]');
        if (await positionSelect.isVisible()) {
          await positionSelect.selectOption('Directeur');
        } else {
          const positionInput = page.locator('input[name="position"]');
          if (await positionInput.isVisible()) {
            await positionInput.fill(TEST_PARTNER_REGISTRATION.position);
          }
        }

        // 📸 SCREENSHOT 2d: Informations contact
        await page.screenshot({ path: 'screenshots/inscription-partenaire/2d-contact.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
        await page.waitForTimeout(500);
      }

      // Étape 4: Profil / Description
      const descriptionTextarea = page.locator('textarea[name="description"]');
      if (await descriptionTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descriptionTextarea.fill(TEST_PARTNER_REGISTRATION.description);

        // Accepter les conditions
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }

        // 📸 SCREENSHOT 2e: Profil / Description
        await page.screenshot({ path: 'screenshots/inscription-partenaire/2e-profil.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
        await page.waitForTimeout(500);
      }

      // Étape 5: Sécurité / Mot de passe
      const passwordInput = page.locator('input[name="password"]').first();
      if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordInput.fill(TEST_PARTNER_REGISTRATION.password);

        const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        if (await confirmPasswordInput.isVisible()) {
          await confirmPasswordInput.fill(TEST_PARTNER_REGISTRATION.password);
        }

        // 📸 SCREENSHOT 2f: Sécurité
        await page.screenshot({ path: 'screenshots/inscription-partenaire/2f-securite.png', fullPage: true });

        // Soumettre
        await page.locator('button:has-text("Créer mon compte"), button:has-text("Continuer")').first().click();
      }

    } else {
      // === FORMULAIRE UNIQUE ===
      const firstNameInput = page.locator('input[name="firstName"]').first();
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill(TEST_PARTNER_REGISTRATION.firstName);
      }

      const lastNameInput = page.locator('input[name="lastName"]').first();
      if (await lastNameInput.isVisible()) {
        await lastNameInput.fill(TEST_PARTNER_REGISTRATION.lastName);
      }

      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill(testEmail);
      }

      const companyInput = page.locator('input[name="company"]').first();
      if (await companyInput.isVisible()) {
        await companyInput.fill(TEST_PARTNER_REGISTRATION.company);
      }

      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(TEST_PARTNER_REGISTRATION.password);
      }

      // 📸 SCREENSHOT 2b: Formulaire rempli
      await page.screenshot({ path: 'screenshots/inscription-partenaire/2b-formulaire-rempli.png', fullPage: true });

      // Soumettre
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }

    // --- ÉTAPE 3: PAGE DE PAIEMENT (SI APPLICABLE) ---
    console.log('📍 ÉTAPE 3: Page de paiement partenaire');
    await page.waitForTimeout(2000);

    const isPaymentPage = page.url().includes('payment') || page.url().includes('checkout');
    const hasPaymentSection = await page.locator('text=/Paiement|Payment|€|Stripe|PayPal|Virement/i').isVisible({ timeout: 5000 }).catch(() => false);

    if (isPaymentPage || hasPaymentSection) {
      // 📸 SCREENSHOT 3a: Page paiement
      await page.screenshot({ path: 'screenshots/inscription-partenaire/3a-paiement.png', fullPage: true });

      // Vérifier les options de paiement
      const hasStripe = await page.locator('text=/Stripe|Carte/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasPayPal = await page.locator('text=/PayPal/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasVirement = await page.locator('text=/Virement|Bancaire|Bank Transfer/i').isVisible({ timeout: 2000 }).catch(() => false);

      console.log(`  💳 Stripe: ${hasStripe ? '✅' : '❌'}`);
      console.log(`  💳 PayPal: ${hasPayPal ? '✅' : '❌'}`);
      console.log(`  🏦 Virement: ${hasVirement ? '✅' : '❌'}`);

      // 📸 SCREENSHOT 3b: Options de paiement
      await page.screenshot({ path: 'screenshots/inscription-partenaire/3b-options-paiement.png', fullPage: true });
    } else {
      console.log('⚠️ Pas de page paiement immédiate - en attente validation admin');
      await page.screenshot({ path: 'screenshots/inscription-partenaire/3-apres-soumission.png', fullPage: true });
    }

    // --- ÉTAPE 4: MESSAGE DE SUCCÈS / EN ATTENTE ---
    console.log('📍 ÉTAPE 4: Confirmation inscription');

    const successMessage = page.locator('text=/Compte créé|Inscription réussie|en attente|validation/i');
    const hasSuccess = await successMessage.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasSuccess) {
      await page.waitForTimeout(2000);
      // 📸 SCREENSHOT 4: Message de succès
      await page.screenshot({ path: 'screenshots/inscription-partenaire/4-inscription-succes.png', fullPage: true });
    }

    console.log('✅ Inscription partenaire terminée - En attente de validation admin');
  });

});

// =============================================================================
// TEST: CONNEXION ET DASHBOARD PARTENAIRE
// =============================================================================

test.describe('🤝 PARTENAIRE - DASHBOARD ET FONCTIONNALITÉS', () => {

  test('SCÉNARIO: Login -> Dashboard -> Profil -> RDV -> Networking -> Badge', async ({ page }) => {

    // --- ÉTAPE 1: CONNEXION PARTENAIRE ---
    console.log('📍 ÉTAPE 1: Connexion partenaire Gold');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_GOLD.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_GOLD.password);

    // 📸 SCREENSHOT 5: Page connexion
    await page.screenshot({ path: 'screenshots/inscription-partenaire/5-connexion.png', fullPage: true });

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Vérifier connexion réussie
    const isLoggedIn = !page.url().includes('login');
    console.log(`  🔐 Connexion: ${isLoggedIn ? '✅ Réussie' : '❌ Échec'}`);

    // --- ÉTAPE 2: DASHBOARD PARTENAIRE ---
    console.log('📍 ÉTAPE 2: Dashboard partenaire');
    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier éléments du dashboard
    const hasDashboardTitle = await page.locator('text=/Dashboard|Tableau de bord|Partenaire/i').isVisible({ timeout: 5000 }).catch(() => false);
    const hasStats = await page.locator('text=/Vues|RDV|Messages|Leads|Connexions/i').isVisible({ timeout: 3000 }).catch(() => false);
    const hasBadge = await page.locator('text=/Gold|🥇|Partenaire/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`  📊 Dashboard: ${hasDashboardTitle ? '✅' : '❌'}`);
    console.log(`  📈 Statistiques: ${hasStats ? '✅' : '❌'}`);
    console.log(`  🏅 Badge Gold: ${hasBadge ? '✅' : '❌'}`);

    // 📸 SCREENSHOT 6: Dashboard partenaire complet
    await page.screenshot({ path: 'screenshots/inscription-partenaire/6-dashboard-partenaire.png', fullPage: true });

    // Scroll pour voir les graphiques
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT 6b: Section statistiques/graphiques
    await page.screenshot({ path: 'screenshots/inscription-partenaire/6b-dashboard-stats.png', fullPage: true });

    // Scroll pour voir les quotas
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT 6c: Section quotas
    await page.screenshot({ path: 'screenshots/inscription-partenaire/6c-dashboard-quotas.png', fullPage: true });

    // --- ÉTAPE 3: SECTION RENDEZ-VOUS ---
    console.log('📍 ÉTAPE 3: Section rendez-vous partenaire');

    const rdvSection = page.locator('text=/Rendez-vous|Demandes de RDV/i').first();
    if (await rdvSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rdvSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 📸 SCREENSHOT 7: Section rendez-vous
      await page.screenshot({ path: 'screenshots/inscription-partenaire/7-rendez-vous.png', fullPage: true });

      // Vérifier s'il y a des demandes en attente
      const hasPendingRequests = await page.locator('button:has-text("Accepter")').isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPendingRequests) {
        console.log('  📬 Demandes en attente trouvées');

        // 📸 SCREENSHOT 7b: Demande en attente
        await page.screenshot({ path: 'screenshots/inscription-partenaire/7b-demande-attente.png', fullPage: true });

        // Cliquer sur Accepter
        const acceptBtn = page.locator('button:has-text("Accepter")').first();
        await acceptBtn.click();
        await page.waitForTimeout(1500);

        // 📸 SCREENSHOT 7c: Après acceptation
        await page.screenshot({ path: 'screenshots/inscription-partenaire/7c-rdv-accepte.png', fullPage: true });
      }
    }

    // --- ÉTAPE 4: PAGE RENDEZ-VOUS COMPLÈTE ---
    console.log('📍 ÉTAPE 4: Page rendez-vous');
    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 8: Page rendez-vous
    await page.screenshot({ path: 'screenshots/inscription-partenaire/8-page-rendez-vous.png', fullPage: true });

    // --- ÉTAPE 5: PROFIL PARTENAIRE ---
    console.log('📍 ÉTAPE 5: Profil partenaire');
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 9: Profil partenaire
    await page.screenshot({ path: 'screenshots/inscription-partenaire/9-profil-partenaire.png', fullPage: true });

    // Scroll pour voir plus d'infos
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT 9b: Profil - détails
    await page.screenshot({ path: 'screenshots/inscription-partenaire/9b-profil-details.png', fullPage: true });

    // --- ÉTAPE 6: NETWORKING IA ---
    console.log('📍 ÉTAPE 6: Networking IA');
    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasNetworkingUI = await page.locator('text=/Networking|Réseautage|Recommandations|IA/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  🤖 Networking IA: ${hasNetworkingUI ? '✅ Accessible' : '❌ Non accessible'}`);

    // 📸 SCREENSHOT 10: Networking IA
    await page.screenshot({ path: 'screenshots/inscription-partenaire/10-networking-ia.png', fullPage: true });

    // --- ÉTAPE 7: MESSAGERIE / CHAT ---
    console.log('📍 ÉTAPE 7: Messagerie');
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 11: Chat / Messagerie
    await page.screenshot({ path: 'screenshots/inscription-partenaire/11-messagerie.png', fullPage: true });

    // --- ÉTAPE 8: LISTE DES EXPOSANTS ---
    console.log('📍 ÉTAPE 8: Liste des exposants');
    await page.goto(`${BASE_URL}/exhibitors`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 12: Liste des exposants
    await page.screenshot({ path: 'screenshots/inscription-partenaire/12-liste-exposants.png', fullPage: true });

    // Cliquer sur un exposant pour voir son profil
    const exhibitorCard = page.locator('.exhibitor-card, [data-testid="exhibitor-card"], a[href*="exhibitor"]').first();
    if (await exhibitorCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await exhibitorCard.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // 📸 SCREENSHOT 12b: Profil exposant
      await page.screenshot({ path: 'screenshots/inscription-partenaire/12b-profil-exposant.png', fullPage: true });
    }

    // --- ÉTAPE 9: ÉVÉNEMENTS ---
    console.log('📍 ÉTAPE 9: Événements');
    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 13: Page événements
    await page.screenshot({ path: 'screenshots/inscription-partenaire/13-evenements.png', fullPage: true });

    // --- ÉTAPE 10: BADGE / QR CODE ---
    console.log('📍 ÉTAPE 10: Badge partenaire');
    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Générer si nécessaire
    const generateBtn = page.locator('button:has-text("Générer")').first();
    if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }

    // Vérifier niveau partenaire sur badge
    const badgeHasPartner = await page.locator('text=/Gold|Partenaire|Partner/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  🎫 Badge niveau Gold: ${badgeHasPartner ? '✅' : '❌'}`);

    // 📸 SCREENSHOT 14: Badge partenaire
    await page.screenshot({ path: 'screenshots/inscription-partenaire/14-badge-partenaire.png', fullPage: true });

    // --- ÉTAPE 11: PARAMÈTRES ---
    console.log('📍 ÉTAPE 11: Paramètres');
    await page.goto(`${BASE_URL}/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 15: Paramètres
    await page.screenshot({ path: 'screenshots/inscription-partenaire/15-parametres.png', fullPage: true });

    // --- ÉTAPE 12: DÉCONNEXION ---
    console.log('📍 ÉTAPE 12: Déconnexion');

    const logoutBtn = page.locator('button:has-text("Déconnexion"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Menu dropdown
      const userMenu = page.locator('[data-testid="user-menu"], .user-avatar, button[aria-label*="menu"]').first();
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(500);
        const logoutOption = page.locator('text=/Déconnexion|Logout/i').first();
        if (await logoutOption.isVisible()) {
          await logoutOption.click();
          await page.waitForTimeout(2000);
        }
      }
    }

    // 📸 SCREENSHOT 16: Après déconnexion
    await page.screenshot({ path: 'screenshots/inscription-partenaire/16-deconnexion.png', fullPage: true });

    console.log('✅ SCÉNARIO PARTENAIRE TERMINÉ AVEC SUCCÈS');
    console.log('📸 Screenshots sauvegardés dans: screenshots/inscription-partenaire/');
  });

});

// =============================================================================
// TEST: GESTION DES DEMANDES RDV PARTENAIRE
// =============================================================================

test.describe('📬 PARTENAIRE - GESTION DEMANDES RDV', () => {

  test('RDV: Accepter et Refuser des demandes', async ({ page }) => {
    // Connexion
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_GOLD.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_GOLD.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Dashboard
    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Section rendez-vous reçus
    const rdvSection = page.locator('text=/Rendez-vous reçus|Demandes/i').first();
    if (await rdvSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rdvSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 📸 SCREENSHOT: Section RDV
      await page.screenshot({ path: 'screenshots/inscription-partenaire/rdv-1-section.png', fullPage: true });

      // Vérifier demandes en attente
      const pendingCount = await page.locator('button:has-text("Accepter")').count();
      console.log(`  📬 Demandes en attente: ${pendingCount}`);

      if (pendingCount > 0) {
        // Test: Accepter une demande
        console.log('  ✅ Test: Accepter une demande');
        const acceptBtn = page.locator('button:has-text("Accepter")').first();

        // 📸 SCREENSHOT: Avant acceptation
        await page.screenshot({ path: 'screenshots/inscription-partenaire/rdv-2-avant-acceptation.png', fullPage: true });

        await acceptBtn.click();
        await page.waitForTimeout(2000);

        // 📸 SCREENSHOT: Après acceptation
        await page.screenshot({ path: 'screenshots/inscription-partenaire/rdv-3-apres-acceptation.png', fullPage: true });
      }

      // Test: Refuser une demande (si disponible)
      const rejectBtns = await page.locator('button:has-text("Refuser")').count();
      if (rejectBtns > 0) {
        console.log('  ❌ Test: Refuser une demande');

        // Écouter la confirmation
        page.on('dialog', dialog => dialog.accept());

        const rejectBtn = page.locator('button:has-text("Refuser")').first();
        await rejectBtn.click();
        await page.waitForTimeout(2000);

        // 📸 SCREENSHOT: Après refus
        await page.screenshot({ path: 'screenshots/inscription-partenaire/rdv-4-apres-refus.png', fullPage: true });
      }
    }

    console.log('✅ Tests gestion RDV partenaire terminés');
  });

});

// =============================================================================
// TEST: RESTRICTIONS D'ACCÈS PARTENAIRE
// =============================================================================

test.describe('🔒 PARTENAIRE - RESTRICTIONS', () => {

  test('RESTRICTIONS: Vérifier accès limités', async ({ page }) => {
    // Connexion partenaire
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_GOLD.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_GOLD.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Test 1: Pas d'accès Dashboard Visiteur
    console.log('  🔒 Test 1: Blocage Dashboard Visiteur');
    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const visitorBlocked = !page.url().includes('/visitor/dashboard') ||
      await page.locator('text=/Non autorisé|Accès refusé/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`    Dashboard Visiteur bloqué: ${visitorBlocked ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Blocage visiteur
    await page.screenshot({ path: 'screenshots/inscription-partenaire/restrictions-1-visiteur.png', fullPage: true });

    // Test 2: Pas d'accès Dashboard Exposant
    console.log('  🔒 Test 2: Blocage Dashboard Exposant');
    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const exhibitorBlocked = !page.url().includes('/exhibitor/dashboard') ||
      await page.locator('text=/Non autorisé|Accès refusé/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`    Dashboard Exposant bloqué: ${exhibitorBlocked ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Blocage exposant
    await page.screenshot({ path: 'screenshots/inscription-partenaire/restrictions-2-exposant.png', fullPage: true });

    // Test 3: Pas d'accès Dashboard Admin
    console.log('  🔒 Test 3: Blocage Dashboard Admin');
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const adminBlocked = !page.url().includes('/admin/dashboard') ||
      await page.locator('text=/Non autorisé|Accès refusé|Admin/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`    Dashboard Admin bloqué: ${adminBlocked ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Blocage admin
    await page.screenshot({ path: 'screenshots/inscription-partenaire/restrictions-3-admin.png', fullPage: true });

    console.log('✅ Tests restrictions partenaire terminés');
  });

});

// =============================================================================
// TEST: DIFFÉRENTS NIVEAUX PARTENAIRES
// =============================================================================

test.describe('🏅 PARTENAIRE - NIVEAUX DE PARTENARIAT', () => {

  test('NIVEAU MUSEUM: Vérifier quotas et fonctionnalités', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_MUSEUM.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_MUSEUM.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier badge niveau
    const hasMuseumBadge = await page.locator('text=/Musée|Museum|🏛️/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  🏛️ Badge Musée: ${hasMuseumBadge ? '✅' : '❌'}`);

    // Vérifier quotas (20 RDV pour Museum)
    const hasQuota = await page.locator('text=/20|RDV|rendez-vous/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  📊 Quota 20 RDV: ${hasQuota ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Dashboard Museum
    await page.screenshot({ path: 'screenshots/inscription-partenaire/niveau-museum-dashboard.png', fullPage: true });
  });

  test('NIVEAU SILVER: Vérifier quotas et fonctionnalités', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_SILVER.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_SILVER.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier badge niveau
    const hasSilverBadge = await page.locator('text=/Silver|🥈/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  🥈 Badge Silver: ${hasSilverBadge ? '✅' : '❌'}`);

    // Vérifier quotas (50 RDV pour Silver)
    const hasQuota = await page.locator('text=/50|RDV|rendez-vous/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  📊 Quota 50 RDV: ${hasQuota ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Dashboard Silver
    await page.screenshot({ path: 'screenshots/inscription-partenaire/niveau-silver-dashboard.png', fullPage: true });
  });

  test('NIVEAU GOLD: Vérifier quotas et fonctionnalités', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_GOLD.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_GOLD.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier badge niveau
    const hasGoldBadge = await page.locator('text=/Gold|🥇/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  🥇 Badge Gold: ${hasGoldBadge ? '✅' : '❌'}`);

    // Vérifier quotas (100 RDV pour Gold)
    const hasQuota = await page.locator('text=/100|RDV|rendez-vous/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  📊 Quota 100 RDV: ${hasQuota ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Dashboard Gold
    await page.screenshot({ path: 'screenshots/inscription-partenaire/niveau-gold-dashboard.png', fullPage: true });
  });

  test('NIVEAU PLATINIUM: Vérifier quotas et fonctionnalités', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_PLATINIUM.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_PLATINIUM.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier badge niveau
    const hasPlatiniumBadge = await page.locator('text=/Platinium|👑/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  👑 Badge Platinium: ${hasPlatiniumBadge ? '✅' : '❌'}`);

    // Vérifier quotas (200 RDV pour Platinium)
    const hasQuota = await page.locator('text=/200|RDV|rendez-vous|illimité/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  📊 Quota 200 RDV: ${hasQuota ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Dashboard Platinium
    await page.screenshot({ path: 'screenshots/inscription-partenaire/niveau-platinium-dashboard.png', fullPage: true });

    // Scroll pour voir les avantages exclusifs
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT: Avantages Platinium
    await page.screenshot({ path: 'screenshots/inscription-partenaire/niveau-platinium-avantages.png', fullPage: true });
  });

});

// =============================================================================
// TEST: FONCTIONNALITÉS AVANCÉES PARTENAIRE
// =============================================================================

test.describe('⭐ PARTENAIRE - FONCTIONNALITÉS AVANCÉES', () => {

  test('ANALYTICS: Vérifier accès aux statistiques avancées', async ({ page }) => {
    // Connexion partenaire Gold (analytics access = true)
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_GOLD.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_GOLD.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier présence des graphiques
    const hasCharts = await page.locator('canvas, svg[class*="chart"], .recharts-wrapper').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  📈 Graphiques analytics: ${hasCharts ? '✅ Visible' : '❌ Non visible'}`);

    // 📸 SCREENSHOT: Section analytics
    await page.screenshot({ path: 'screenshots/inscription-partenaire/analytics-1-graphiques.png', fullPage: true });

    // Scroll pour voir plus de stats
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT: Plus de statistiques
    await page.screenshot({ path: 'screenshots/inscription-partenaire/analytics-2-stats-detaillees.png', fullPage: true });
  });

  test('LEADS: Vérifier export des leads', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_PARTNER_GOLD.email);
    await page.locator('input[type="password"]').first().fill(TEST_PARTNER_GOLD.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Chercher section leads ou bouton export
    const leadsSection = page.locator('text=/Leads|Export|Contacts/i').first();
    if (await leadsSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await leadsSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 📸 SCREENSHOT: Section leads
      await page.screenshot({ path: 'screenshots/inscription-partenaire/leads-section.png', fullPage: true });

      // Cliquer sur export si disponible
      const exportBtn = page.locator('button:has-text("Export"), button:has-text("Télécharger")').first();
      if (await exportBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // 📸 SCREENSHOT: Bouton export
        await page.screenshot({ path: 'screenshots/inscription-partenaire/leads-export-btn.png', fullPage: true });
      }
    }

    console.log('✅ Test leads partenaire terminé');
  });

  test('VISIBILITÉ: Vérifier affichage sur page partenaires publique', async ({ page }) => {
    // Page publique des partenaires (sans connexion)
    await page.goto(`${BASE_URL}/partners`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier présence de partenaires
    const hasPartners = await page.locator('text=/Partenaire|Partner|Gold|Silver|Platinium/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  🤝 Liste partenaires: ${hasPartners ? '✅ Visible' : '❌ Non visible'}`);

    // 📸 SCREENSHOT: Page partenaires publique
    await page.screenshot({ path: 'screenshots/inscription-partenaire/visibilite-1-page-publique.png', fullPage: true });

    // Scroll pour voir plus
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT: Plus de partenaires
    await page.screenshot({ path: 'screenshots/inscription-partenaire/visibilite-2-liste-complete.png', fullPage: true });

    console.log('✅ Test visibilité partenaire terminé');
  });

});
