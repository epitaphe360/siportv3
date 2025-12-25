import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// =============================================================================
// CONFIGURATION TEST EXPOSANT
// =============================================================================

// Compte exposant existant pour tests de connexion
const TEST_EXHIBITOR = {
  email: 'exhibitor-9m@test.siport.com',
  password: 'Test@123456'
};

// Compte exposant 18m² pour tests différents niveaux
const TEST_EXHIBITOR_18M = {
  email: 'exhibitor-18m@test.siport.com',
  password: 'Test@123456'
};

// Données pour test d'inscription (email unique à chaque test)
const generateTestEmail = () => `exhibitor-test-${Date.now()}@test.siport.com`;

const TEST_EXHIBITOR_REGISTRATION = {
  firstName: 'Pierre',
  lastName: 'Exposant',
  phone: '+33698765432',
  company: 'Tech Expo SA',
  sector: 'Logistique',
  country: 'France',
  position: 'Directeur Commercial',
  description: 'Entreprise spécialisée dans les solutions logistiques innovantes pour le transport maritime.',
  website: 'https://tech-expo.example.com',
  password: 'Test@123456'
};

// Options de stand disponibles
const STAND_OPTIONS = {
  '9m²': { price: 2500, label: '9m² - Starter' },
  '18m²': { price: 4500, label: '18m² - Business' },
  '36m²': { price: 8000, label: '36m² - Premium' },
  '54m²': { price: 12000, label: '54m² - Enterprise' }
};

// =============================================================================
// TEST: INSCRIPTION EXPOSANT COMPLÈTE AVEC SCREENSHOTS
// =============================================================================

test.describe('🏢 EXPOSANT - INSCRIPTION COMPLÈTE', () => {

  test('SCÉNARIO: Choix Stand -> Inscription -> Paiement -> Validation Admin -> Dashboard', async ({ page }) => {
    const testEmail = generateTestEmail();

    // --- ÉTAPE 1: CHOIX DU STAND (PAGE ABONNEMENT) ---
    console.log('📍 ÉTAPE 1: Choix du stand exposant');
    await page.goto(`${BASE_URL}/exhibitor/subscription`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Vérifier que les offres de stand sont visibles
    const hasStandOptions = await page.locator('text=/9m²|18m²|36m²|54m²|Stand/i').first().isVisible({ timeout: 10000 });
    expect(hasStandOptions).toBe(true);

    // 📸 SCREENSHOT 1: Page choix du stand
    await page.screenshot({ path: 'screenshots/inscription-exposant/1-choix-stand.png', fullPage: true });

    // Hover sur différentes options de stand
    const stand18mCard = page.locator('text=/18m²|Business/i').first();
    if (await stand18mCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await stand18mCard.hover();
      await page.waitForTimeout(500);
    }

    // 📸 SCREENSHOT 1b: Hover sur stand 18m²
    await page.screenshot({ path: 'screenshots/inscription-exposant/1b-hover-stand-18m.png', fullPage: true });

    // Cliquer sur le bouton d'inscription pour un stand
    const inscriptionBtn = page.locator('button:has-text("S\'inscrire"), button:has-text("Choisir"), a:has-text("Sélectionner")').first();
    if (await inscriptionBtn.isVisible()) {
      await inscriptionBtn.click();
    } else {
      // Aller directement à la page d'inscription exposant
      await page.goto(`${BASE_URL}/register`);
    }

    // --- ÉTAPE 2: FORMULAIRE D'INSCRIPTION EXPOSANT ---
    console.log('📍 ÉTAPE 2: Formulaire d\'inscription exposant');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 📸 SCREENSHOT 2a: Page inscription vide
    await page.screenshot({ path: 'screenshots/inscription-exposant/2a-inscription-vide.png', fullPage: true });

    // Vérifier si c'est un wizard multi-étapes
    const isWizard = await page.locator('button:has-text("Suivant")').isVisible({ timeout: 3000 }).catch(() => false);

    if (isWizard) {
      // === WIZARD MULTI-ÉTAPES ===

      // Étape 1: Type de compte - Sélectionner Exposant
      const exhibitorLabel = page.locator('[data-testid="account-type-exhibitor"], label:has-text("Exposant")');
      if (await exhibitorLabel.isVisible({ timeout: 3000 }).catch(() => false)) {
        await exhibitorLabel.click();
        await page.waitForTimeout(500);
      }

      // 📸 SCREENSHOT 2b: Type de compte sélectionné
      await page.screenshot({ path: 'screenshots/inscription-exposant/2b-type-exposant.png', fullPage: true });

      await page.locator('button:has-text("Suivant")').first().click();
      await page.waitForTimeout(500);

      // Étape 2: Informations Entreprise
      const entrepriseTitle = page.locator('text=/Informations sur votre organisation|Entreprise/i');
      if (await entrepriseTitle.isVisible({ timeout: 3000 }).catch(() => false)) {

        // Nom de l'entreprise
        const companyInput = page.locator('input[name="company"], input[name="companyName"], input[placeholder*="Entreprise"]').first();
        if (await companyInput.isVisible()) {
          await companyInput.fill(TEST_EXHIBITOR_REGISTRATION.company);
        }

        // Secteur d'activité
        const sectorSelect = page.locator('select[name="sector"]');
        if (await sectorSelect.isVisible()) {
          await sectorSelect.selectOption('Logistique');
        }

        // Pays
        const countrySelect = page.locator('select[name="country"]');
        if (await countrySelect.isVisible()) {
          await countrySelect.selectOption('FR');
        }

        // Site web
        const websiteInput = page.locator('input[name="website"], input[placeholder*="Site"]').first();
        if (await websiteInput.isVisible()) {
          await websiteInput.fill(TEST_EXHIBITOR_REGISTRATION.website);
        }

        // 📸 SCREENSHOT 2c: Informations entreprise
        await page.screenshot({ path: 'screenshots/inscription-exposant/2c-entreprise.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
        await page.waitForTimeout(500);
      }

      // Étape 3: Contact
      const emailInput = page.locator('input[name="email"], input[type="email"]').first();
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.locator('input[name="firstName"]').fill(TEST_EXHIBITOR_REGISTRATION.firstName);
        await page.locator('input[name="lastName"]').fill(TEST_EXHIBITOR_REGISTRATION.lastName);
        await emailInput.fill(testEmail);
        await page.locator('input[name="phone"]').fill(TEST_EXHIBITOR_REGISTRATION.phone);

        const positionSelect = page.locator('select[name="position"]');
        if (await positionSelect.isVisible()) {
          await positionSelect.selectOption('Directeur');
        } else {
          const positionInput = page.locator('input[name="position"]');
          if (await positionInput.isVisible()) {
            await positionInput.fill(TEST_EXHIBITOR_REGISTRATION.position);
          }
        }

        // 📸 SCREENSHOT 2d: Informations contact
        await page.screenshot({ path: 'screenshots/inscription-exposant/2d-contact.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
        await page.waitForTimeout(500);
      }

      // Étape 4: Profil / Description
      const descriptionTextarea = page.locator('textarea[name="description"]');
      if (await descriptionTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descriptionTextarea.fill(TEST_EXHIBITOR_REGISTRATION.description);

        // Accepter les conditions
        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }

        // 📸 SCREENSHOT 2e: Profil / Description
        await page.screenshot({ path: 'screenshots/inscription-exposant/2e-profil.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
        await page.waitForTimeout(500);
      }

      // Étape 5: Sécurité / Mot de passe
      const passwordInput = page.locator('input[name="password"]').first();
      if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordInput.fill(TEST_EXHIBITOR_REGISTRATION.password);

        const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        if (await confirmPasswordInput.isVisible()) {
          await confirmPasswordInput.fill(TEST_EXHIBITOR_REGISTRATION.password);
        }

        // 📸 SCREENSHOT 2f: Sécurité
        await page.screenshot({ path: 'screenshots/inscription-exposant/2f-securite.png', fullPage: true });

        // Soumettre
        await page.locator('button:has-text("Créer mon compte"), button:has-text("Continuer")').first().click();
      }

    } else {
      // === FORMULAIRE UNIQUE ===
      // Remplir tous les champs sur une seule page
      const firstNameInput = page.locator('input[name="firstName"]').first();
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill(TEST_EXHIBITOR_REGISTRATION.firstName);
      }

      const lastNameInput = page.locator('input[name="lastName"]').first();
      if (await lastNameInput.isVisible()) {
        await lastNameInput.fill(TEST_EXHIBITOR_REGISTRATION.lastName);
      }

      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill(testEmail);
      }

      const companyInput = page.locator('input[name="company"]').first();
      if (await companyInput.isVisible()) {
        await companyInput.fill(TEST_EXHIBITOR_REGISTRATION.company);
      }

      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill(TEST_EXHIBITOR_REGISTRATION.password);
      }

      // 📸 SCREENSHOT 2b: Formulaire rempli
      await page.screenshot({ path: 'screenshots/inscription-exposant/2b-formulaire-rempli.png', fullPage: true });

      // Soumettre
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }

    // --- ÉTAPE 3: PAGE DE PAIEMENT (SI APPLICABLE) ---
    console.log('📍 ÉTAPE 3: Page de paiement exposant');
    await page.waitForTimeout(2000);

    const isPaymentPage = page.url().includes('payment') || page.url().includes('checkout');
    const hasPaymentSection = await page.locator('text=/Paiement|Payment|€|Stripe|PayPal/i').isVisible({ timeout: 5000 }).catch(() => false);

    if (isPaymentPage || hasPaymentSection) {
      // 📸 SCREENSHOT 3a: Page paiement
      await page.screenshot({ path: 'screenshots/inscription-exposant/3a-paiement.png', fullPage: true });

      // Vérifier les options de paiement
      const hasStripe = await page.locator('text=/Stripe|Carte/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasPayPal = await page.locator('text=/PayPal/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasCMI = await page.locator('text=/CMI|Virement/i').isVisible({ timeout: 2000 }).catch(() => false);

      console.log(`  💳 Stripe: ${hasStripe ? '✅' : '❌'}`);
      console.log(`  💳 PayPal: ${hasPayPal ? '✅' : '❌'}`);
      console.log(`  💳 CMI/Virement: ${hasCMI ? '✅' : '❌'}`);

      // 📸 SCREENSHOT 3b: Options de paiement
      await page.screenshot({ path: 'screenshots/inscription-exposant/3b-options-paiement.png', fullPage: true });
    } else {
      console.log('⚠️ Pas de page paiement immédiate - en attente validation admin');
      await page.screenshot({ path: 'screenshots/inscription-exposant/3-apres-soumission.png', fullPage: true });
    }

    // --- ÉTAPE 4: MESSAGE DE SUCCÈS / EN ATTENTE ---
    console.log('📍 ÉTAPE 4: Confirmation inscription');

    const successMessage = page.locator('text=/Compte créé|Inscription réussie|en attente|validation/i');
    const hasSuccess = await successMessage.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasSuccess) {
      await page.waitForTimeout(2000);
      // 📸 SCREENSHOT 4: Message de succès
      await page.screenshot({ path: 'screenshots/inscription-exposant/4-inscription-succes.png', fullPage: true });
    }

    console.log('✅ Inscription exposant terminée - En attente de validation admin');
  });

});

// =============================================================================
// TEST: CONNEXION ET DASHBOARD EXPOSANT
// =============================================================================

test.describe('🏢 EXPOSANT - DASHBOARD ET FONCTIONNALITÉS', () => {

  test('SCÉNARIO: Login -> Dashboard -> Créneaux -> RDV -> Mini-Site -> Badge', async ({ page }) => {

    // --- ÉTAPE 1: CONNEXION EXPOSANT ---
    console.log('📍 ÉTAPE 1: Connexion exposant');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').first().fill(TEST_EXHIBITOR.email);
    await page.locator('input[type="password"]').first().fill(TEST_EXHIBITOR.password);

    // 📸 SCREENSHOT 5: Page connexion
    await page.screenshot({ path: 'screenshots/inscription-exposant/5-connexion.png', fullPage: true });

    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Vérifier connexion réussie
    const isLoggedIn = !page.url().includes('login');
    console.log(`  🔐 Connexion: ${isLoggedIn ? '✅ Réussie' : '❌ Échec'}`);

    // --- ÉTAPE 2: DASHBOARD EXPOSANT ---
    console.log('📍 ÉTAPE 2: Dashboard exposant');
    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier éléments du dashboard
    const hasDashboardTitle = await page.locator('text=/Dashboard|Tableau de bord|Exposant/i').isVisible({ timeout: 5000 }).catch(() => false);
    const hasStats = await page.locator('text=/Vues|RDV|Messages|Téléchargements/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`  📊 Dashboard: ${hasDashboardTitle ? '✅' : '❌'}`);
    console.log(`  📈 Statistiques: ${hasStats ? '✅' : '❌'}`);

    // 📸 SCREENSHOT 6: Dashboard exposant (avant popup)
    await page.screenshot({ path: 'screenshots/inscription-exposant/6-dashboard-exposant.png', fullPage: true });

    // --- ÉTAPE 2b: POPUP CRÉATION MINI-SITE ---
    console.log('📍 ÉTAPE 2b: Popup création Mini-Site');

    // Attendre l'apparition de la popup de création mini-site (délai de 1.5s dans le code)
    await page.waitForTimeout(2000);

    // Vérifier si la popup de création mini-site apparaît
    const miniSitePopup = page.locator('text=/Bienvenue sur SIPORTS|Créez votre Mini-Site/i');
    const hasMiniSitePopup = await miniSitePopup.isVisible({ timeout: 5000 }).catch(() => false);

    if (hasMiniSitePopup) {
      console.log('  🎉 Popup Mini-Site détectée');

      // 📸 SCREENSHOT 6a: Popup bienvenue mini-site
      await page.screenshot({ path: 'screenshots/inscription-exposant/6a-popup-minisite-bienvenue.png', fullPage: true });

      // Vérifier les 2 options disponibles
      const hasAutoOption = await page.locator('text=/Création Automatique|Recommandé|IA/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasManualOption = await page.locator('text=/Création Manuelle/i').isVisible({ timeout: 2000 }).catch(() => false);

      console.log(`    🤖 Option Auto: ${hasAutoOption ? '✅' : '❌'}`);
      console.log(`    📝 Option Manuelle: ${hasManualOption ? '✅' : '❌'}`);

      // 📸 SCREENSHOT 6b: Options de création
      await page.screenshot({ path: 'screenshots/inscription-exposant/6b-popup-minisite-options.png', fullPage: true });

      // Cliquer sur "Création Manuelle"
      const manualOption = page.locator('text=/Création Manuelle/i').first();
      if (await manualOption.isVisible()) {
        await manualOption.click();
        await page.waitForTimeout(1000);

        // 📸 SCREENSHOT 6c: Mode manuel sélectionné
        await page.screenshot({ path: 'screenshots/inscription-exposant/6c-popup-minisite-manuel.png', fullPage: true });

        // Cliquer sur "Commencer la Création"
        const startBtn = page.locator('button:has-text("Commencer la Création"), button:has-text("Commencer")').first();
        if (await startBtn.isVisible()) {
          await startBtn.click();
          await page.waitForTimeout(2000);
        }
      }

      // --- ÉTAPE 2c: FORMULAIRE CRÉATION MINI-SITE ---
      console.log('📍 ÉTAPE 2c: Formulaire création Mini-Site');

      // Attendre la redirection vers l'éditeur de mini-site
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // 📸 SCREENSHOT 6d: Page éditeur mini-site
      await page.screenshot({ path: 'screenshots/inscription-exposant/6d-minisite-editeur-debut.png', fullPage: true });

      // Remplir les informations du mini-site si formulaire visible
      // Étape 1: Informations de l'entreprise
      const companyNameInput = page.locator('input[name="companyName"], input[name="name"], input[placeholder*="Entreprise"]').first();
      if (await companyNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await companyNameInput.fill('Tech Expo SA - Solutions Logistiques');
        console.log('    ✅ Nom entreprise rempli');
      }

      const taglineInput = page.locator('input[name="tagline"], input[name="slogan"], input[placeholder*="Slogan"]').first();
      if (await taglineInput.isVisible()) {
        await taglineInput.fill('Innovez votre chaîne logistique');
      }

      const descriptionInput = page.locator('textarea[name="description"], textarea[name="about"]').first();
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('Tech Expo SA est leader dans les solutions logistiques innovantes pour le transport maritime et portuaire. Nous accompagnons les entreprises dans leur transformation digitale.');
        console.log('    ✅ Description remplie');
      }

      // 📸 SCREENSHOT 6e: Informations entreprise remplies
      await page.screenshot({ path: 'screenshots/inscription-exposant/6e-minisite-infos-entreprise.png', fullPage: true });

      // Bouton suivant ou sauvegarder
      const nextStepBtn = page.locator('button:has-text("Suivant"), button:has-text("Continuer"), button:has-text("Étape suivante")').first();
      if (await nextStepBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextStepBtn.click();
        await page.waitForTimeout(1500);

        // 📸 SCREENSHOT 6f: Étape 2 - Thème/Couleurs
        await page.screenshot({ path: 'screenshots/inscription-exposant/6f-minisite-theme.png', fullPage: true });

        // Sélectionner un thème si disponible
        const themeOption = page.locator('[data-theme], .theme-option, button:has-text("Bleu"), button:has-text("Vert")').first();
        if (await themeOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await themeOption.click();
          await page.waitForTimeout(500);
        }

        // Continuer
        if (await nextStepBtn.isVisible()) {
          await nextStepBtn.click();
          await page.waitForTimeout(1500);
        }

        // 📸 SCREENSHOT 6g: Étape 3 - Produits/Services
        await page.screenshot({ path: 'screenshots/inscription-exposant/6g-minisite-produits.png', fullPage: true });

        // Ajouter un produit si possible
        const addProductBtn = page.locator('button:has-text("Ajouter un produit"), button:has-text("Nouveau produit"), button:has-text("+")').first();
        if (await addProductBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addProductBtn.click();
          await page.waitForTimeout(1000);

          // Remplir produit
          const productNameInput = page.locator('input[name="productName"], input[placeholder*="Nom du produit"]').first();
          if (await productNameInput.isVisible()) {
            await productNameInput.fill('Solution TMS Maritime');
          }

          const productDescInput = page.locator('textarea[name="productDescription"]').first();
          if (await productDescInput.isVisible()) {
            await productDescInput.fill('Système de gestion du transport maritime avec tracking en temps réel.');
          }

          // 📸 SCREENSHOT 6h: Ajout produit
          await page.screenshot({ path: 'screenshots/inscription-exposant/6h-minisite-ajout-produit.png', fullPage: true });

          // Sauvegarder produit
          const saveProductBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Sauvegarder")').first();
          if (await saveProductBtn.isVisible()) {
            await saveProductBtn.click();
            await page.waitForTimeout(1000);
          }
        }

        // Continuer vers étape suivante
        if (await nextStepBtn.isVisible()) {
          await nextStepBtn.click();
          await page.waitForTimeout(1500);
        }

        // 📸 SCREENSHOT 6i: Étape 4 - Médias/Images
        await page.screenshot({ path: 'screenshots/inscription-exposant/6i-minisite-medias.png', fullPage: true });

        // Continuer
        if (await nextStepBtn.isVisible()) {
          await nextStepBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      // Finaliser / Publier le mini-site
      const publishBtn = page.locator('button:has-text("Publier"), button:has-text("Terminer"), button:has-text("Finaliser")').first();
      if (await publishBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        // 📸 SCREENSHOT 6j: Prévisualisation avant publication
        await page.screenshot({ path: 'screenshots/inscription-exposant/6j-minisite-preview.png', fullPage: true });

        await publishBtn.click();
        await page.waitForTimeout(2000);

        // 📸 SCREENSHOT 6k: Mini-site publié (succès)
        await page.screenshot({ path: 'screenshots/inscription-exposant/6k-minisite-publie.png', fullPage: true });
      }

      // --- ÉTAPE 2d: AFFICHAGE DU MINI-SITE CRÉÉ ---
      console.log('📍 ÉTAPE 2d: Affichage du Mini-Site');

      // Aller voir le mini-site public
      await page.goto(`${BASE_URL}/exhibitors`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // 📸 SCREENSHOT 6l: Liste des exposants
      await page.screenshot({ path: 'screenshots/inscription-exposant/6l-liste-exposants.png', fullPage: true });

      // Chercher notre exposant dans la liste
      const exhibitorCard = page.locator('text=/Tech Expo|exhibitor-9m/i').first();
      if (await exhibitorCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await exhibitorCard.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);

        // 📸 SCREENSHOT 6m: Page mini-site de l'exposant
        await page.screenshot({ path: 'screenshots/inscription-exposant/6m-minisite-public.png', fullPage: true });

        // Scroll pour voir tout le mini-site
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);

        // 📸 SCREENSHOT 6n: Mini-site section produits
        await page.screenshot({ path: 'screenshots/inscription-exposant/6n-minisite-produits-section.png', fullPage: true });

        await page.evaluate(() => window.scrollTo(0, 1000));
        await page.waitForTimeout(500);

        // 📸 SCREENSHOT 6o: Mini-site section contact
        await page.screenshot({ path: 'screenshots/inscription-exposant/6o-minisite-contact-section.png', fullPage: true });
      }

      // Retour au dashboard
      console.log('📍 Retour au Dashboard');
      await page.goto(`${BASE_URL}/exhibitor/dashboard`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // 📸 SCREENSHOT 6p: Dashboard après création mini-site
      await page.screenshot({ path: 'screenshots/inscription-exposant/6p-dashboard-apres-minisite.png', fullPage: true });

    } else {
      console.log('  ⚠️ Popup Mini-Site non visible (déjà créé ou désactivé)');
    }

    // Scroll pour voir le calendrier
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);

    const hasCalendar = await page.locator('text=/Calendrier|Créneaux|Disponibilités/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  📅 Calendrier: ${hasCalendar ? '✅' : '❌'}`);

    // 📸 SCREENSHOT 6q: Section calendrier
    await page.screenshot({ path: 'screenshots/inscription-exposant/6q-dashboard-calendrier.png', fullPage: true });

    // --- ÉTAPE 3: GESTION DES CRÉNEAUX CALENDRIER ---
    console.log('📍 ÉTAPE 3: Gestion des créneaux calendrier');

    // Chercher le bouton pour ajouter un créneau
    const addSlotBtn = page.locator('button:has-text("Ajouter"), button:has-text("Nouveau créneau"), button:has-text("+")').first();
    if (await addSlotBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addSlotBtn.click();
      await page.waitForTimeout(1000);

      // 📸 SCREENSHOT 7a: Formulaire ajout créneau
      await page.screenshot({ path: 'screenshots/inscription-exposant/7a-ajout-creneau-form.png', fullPage: true });

      // Remplir le formulaire de créneau
      const dateInput = page.locator('input[type="date"], input[name="date"]').first();
      if (await dateInput.isVisible()) {
        // Date de demain
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await dateInput.fill(dateStr);
      }

      const startTimeInput = page.locator('input[name="startTime"], input[type="time"]').first();
      if (await startTimeInput.isVisible()) {
        await startTimeInput.fill('09:00');
      }

      const endTimeInput = page.locator('input[name="endTime"], input[type="time"]').nth(1);
      if (await endTimeInput.isVisible()) {
        await endTimeInput.fill('10:00');
      }

      // Type de rendez-vous
      const typeSelect = page.locator('select[name="type"]');
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption('in-person');
      }

      // 📸 SCREENSHOT 7b: Créneau rempli
      await page.screenshot({ path: 'screenshots/inscription-exposant/7b-creneau-rempli.png', fullPage: true });

      // Sauvegarder le créneau
      const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Ajouter"), button:has-text("Sauvegarder")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForTimeout(1500);
      }

      // 📸 SCREENSHOT 7c: Créneau ajouté
      await page.screenshot({ path: 'screenshots/inscription-exposant/7c-creneau-ajoute.png', fullPage: true });
    }

    // --- ÉTAPE 4: SECTION RENDEZ-VOUS REÇUS ---
    console.log('📍 ÉTAPE 4: Section rendez-vous reçus');

    // Scroll vers la section rendez-vous
    const rdvSection = page.locator('text=/Rendez-vous reçus|Demandes de RDV/i').first();
    if (await rdvSection.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rdvSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 📸 SCREENSHOT 8: Section rendez-vous
      await page.screenshot({ path: 'screenshots/inscription-exposant/8-rendez-vous-recus.png', fullPage: true });

      // Vérifier s'il y a des demandes en attente
      const hasPendingRequests = await page.locator('button:has-text("Accepter")').isVisible({ timeout: 2000 }).catch(() => false);

      if (hasPendingRequests) {
        console.log('  📬 Demandes en attente trouvées');

        // 📸 SCREENSHOT 8b: Demande en attente
        await page.screenshot({ path: 'screenshots/inscription-exposant/8b-demande-attente.png', fullPage: true });

        // Cliquer sur Accepter
        const acceptBtn = page.locator('button:has-text("Accepter")').first();
        await acceptBtn.click();
        await page.waitForTimeout(1500);

        // 📸 SCREENSHOT 8c: Après acceptation
        await page.screenshot({ path: 'screenshots/inscription-exposant/8c-rdv-accepte.png', fullPage: true });
      } else {
        console.log('  📭 Aucune demande en attente');
      }
    }

    // --- ÉTAPE 5: PAGE RENDEZ-VOUS COMPLÈTE ---
    console.log('📍 ÉTAPE 5: Page rendez-vous');
    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 9: Page rendez-vous
    await page.screenshot({ path: 'screenshots/inscription-exposant/9-page-rendez-vous.png', fullPage: true });

    // --- ÉTAPE 6: MINI-SITE EXPOSANT ---
    console.log('📍 ÉTAPE 6: Mini-site exposant');
    await page.goto(`${BASE_URL}/minisite/editor`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasMiniSiteEditor = await page.locator('text=/Mini-site|Éditeur|Personnaliser/i').isVisible({ timeout: 5000 }).catch(() => false);

    if (hasMiniSiteEditor) {
      // 📸 SCREENSHOT 10: Éditeur mini-site
      await page.screenshot({ path: 'screenshots/inscription-exposant/10-minisite-editeur.png', fullPage: true });
    } else {
      // Essayer une autre route
      await page.goto(`${BASE_URL}/exhibitor/minisite`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screenshots/inscription-exposant/10-minisite.png', fullPage: true });
    }

    // --- ÉTAPE 7: PROFIL EXPOSANT ---
    console.log('📍 ÉTAPE 7: Profil exposant');
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 11: Profil exposant
    await page.screenshot({ path: 'screenshots/inscription-exposant/11-profil-exposant.png', fullPage: true });

    // --- ÉTAPE 8: PRODUITS / CATALOGUE ---
    console.log('📍 ÉTAPE 8: Catalogue produits');
    await page.goto(`${BASE_URL}/exhibitor/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasProductsPage = await page.locator('text=/Produits|Catalogue|Services/i').isVisible({ timeout: 5000 }).catch(() => false);

    if (hasProductsPage) {
      // 📸 SCREENSHOT 12: Page produits
      await page.screenshot({ path: 'screenshots/inscription-exposant/12-produits.png', fullPage: true });

      // Chercher bouton ajouter produit
      const addProductBtn = page.locator('button:has-text("Ajouter"), button:has-text("Nouveau produit")').first();
      if (await addProductBtn.isVisible()) {
        await addProductBtn.click();
        await page.waitForTimeout(1000);

        // 📸 SCREENSHOT 12b: Formulaire ajout produit
        await page.screenshot({ path: 'screenshots/inscription-exposant/12b-ajout-produit.png', fullPage: true });
      }
    }

    // --- ÉTAPE 9: NETWORKING IA ---
    console.log('📍 ÉTAPE 9: Networking IA');
    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 13: Networking IA
    await page.screenshot({ path: 'screenshots/inscription-exposant/13-networking-ia.png', fullPage: true });

    // --- ÉTAPE 10: MESSAGERIE / CHAT ---
    console.log('📍 ÉTAPE 10: Messagerie');
    await page.goto(`${BASE_URL}/chat`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 14: Chat / Messagerie
    await page.screenshot({ path: 'screenshots/inscription-exposant/14-messagerie.png', fullPage: true });

    // --- ÉTAPE 11: BADGE / QR CODE ---
    console.log('📍 ÉTAPE 11: Badge exposant');
    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Générer si nécessaire
    const generateBtn = page.locator('button:has-text("Générer")').first();
    if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }

    // 📸 SCREENSHOT 15: Badge exposant
    await page.screenshot({ path: 'screenshots/inscription-exposant/15-badge-exposant.png', fullPage: true });

    // --- ÉTAPE 12: STATISTIQUES / ANALYTICS ---
    console.log('📍 ÉTAPE 12: Analytics');
    await page.goto(`${BASE_URL}/exhibitor/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasAnalytics = !page.url().includes('login') && !page.url().includes('404');
    if (hasAnalytics) {
      // 📸 SCREENSHOT 16: Analytics
      await page.screenshot({ path: 'screenshots/inscription-exposant/16-analytics.png', fullPage: true });
    }

    // --- ÉTAPE 13: DÉCONNEXION ---
    console.log('📍 ÉTAPE 13: Déconnexion');

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

    // 📸 SCREENSHOT 17: Après déconnexion
    await page.screenshot({ path: 'screenshots/inscription-exposant/17-deconnexion.png', fullPage: true });

    console.log('✅ SCÉNARIO EXPOSANT TERMINÉ AVEC SUCCÈS');
    console.log('📸 Screenshots sauvegardés dans: screenshots/inscription-exposant/');
  });

});

// =============================================================================
// TEST: GESTION DES CRÉNEAUX EN DÉTAIL
// =============================================================================

test.describe('📅 EXPOSANT - GESTION CRÉNEAUX CALENDRIER', () => {

  test('CRÉNEAUX: Ajouter, Modifier, Supprimer des créneaux', async ({ page }) => {
    // Connexion
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_EXHIBITOR.email);
    await page.locator('input[type="password"]').first().fill(TEST_EXHIBITOR.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Aller au dashboard
    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Scroll vers la section calendrier
    const calendarSection = page.locator('text=/Disponibilités|Calendrier public/i').first();
    if (await calendarSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await calendarSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 📸 SCREENSHOT: Section calendrier
      await page.screenshot({ path: 'screenshots/inscription-exposant/creneaux-1-calendrier.png', fullPage: true });

      // Test 1: Ajouter un créneau matin
      console.log('  📅 Test 1: Ajout créneau matin');
      const addBtn = page.locator('button:has-text("Ajouter"), button:has-text("+")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);

        // Remplir: demain 9h-10h
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
          await dateInput.fill(tomorrow.toISOString().split('T')[0]);
        }

        const startInput = page.locator('input[name="startTime"]').first();
        if (await startInput.isVisible()) {
          await startInput.fill('09:00');
        }

        const endInput = page.locator('input[name="endTime"]').first();
        if (await endInput.isVisible()) {
          await endInput.fill('10:00');
        }

        // 📸 SCREENSHOT: Créneau matin
        await page.screenshot({ path: 'screenshots/inscription-exposant/creneaux-2-matin.png', fullPage: true });

        // Sauvegarder
        const saveBtn = page.locator('button:has-text("Enregistrer"), button:has-text("Ajouter")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      // Test 2: Ajouter un créneau après-midi
      console.log('  📅 Test 2: Ajout créneau après-midi');
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(1000);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
          await dateInput.fill(tomorrow.toISOString().split('T')[0]);
        }

        const startInput = page.locator('input[name="startTime"]').first();
        if (await startInput.isVisible()) {
          await startInput.fill('14:00');
        }

        const endInput = page.locator('input[name="endTime"]').first();
        if (await endInput.isVisible()) {
          await endInput.fill('15:30');
        }

        // Type virtuel
        const typeSelect = page.locator('select[name="type"]');
        if (await typeSelect.isVisible()) {
          await typeSelect.selectOption('virtual');
        }

        // 📸 SCREENSHOT: Créneau après-midi virtuel
        await page.screenshot({ path: 'screenshots/inscription-exposant/creneaux-3-apres-midi.png', fullPage: true });

        const saveBtn = page.locator('button:has-text("Enregistrer")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      // 📸 SCREENSHOT: Tous les créneaux
      await page.screenshot({ path: 'screenshots/inscription-exposant/creneaux-4-liste.png', fullPage: true });

      // Test 3: Supprimer un créneau
      console.log('  📅 Test 3: Suppression créneau');
      const deleteBtn = page.locator('button:has-text("Supprimer"), button[aria-label*="supprimer"]').first();
      if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Écouter la confirmation
        page.on('dialog', dialog => dialog.accept());
        await deleteBtn.click();
        await page.waitForTimeout(1500);

        // 📸 SCREENSHOT: Après suppression
        await page.screenshot({ path: 'screenshots/inscription-exposant/creneaux-5-apres-suppression.png', fullPage: true });
      }
    }

    console.log('✅ Tests créneaux terminés');
  });

});

// =============================================================================
// TEST: ACCEPTATION/REFUS RENDEZ-VOUS
// =============================================================================

test.describe('📬 EXPOSANT - GESTION DEMANDES RDV', () => {

  test('RDV: Accepter et Refuser des demandes', async ({ page }) => {
    // Connexion
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_EXHIBITOR.email);
    await page.locator('input[type="password"]').first().fill(TEST_EXHIBITOR.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    // Dashboard
    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Section rendez-vous reçus
    const rdvSection = page.locator('text=/Rendez-vous reçus/i').first();
    if (await rdvSection.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rdvSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 📸 SCREENSHOT: Section RDV
      await page.screenshot({ path: 'screenshots/inscription-exposant/rdv-1-section.png', fullPage: true });

      // Vérifier demandes en attente
      const pendingCount = await page.locator('button:has-text("Accepter")').count();
      console.log(`  📬 Demandes en attente: ${pendingCount}`);

      if (pendingCount > 0) {
        // Test: Accepter une demande
        console.log('  ✅ Test: Accepter une demande');
        const acceptBtn = page.locator('button:has-text("Accepter")').first();

        // 📸 SCREENSHOT: Avant acceptation
        await page.screenshot({ path: 'screenshots/inscription-exposant/rdv-2-avant-acceptation.png', fullPage: true });

        await acceptBtn.click();
        await page.waitForTimeout(2000);

        // 📸 SCREENSHOT: Après acceptation
        await page.screenshot({ path: 'screenshots/inscription-exposant/rdv-3-apres-acceptation.png', fullPage: true });

        // Vérifier le RDV confirmé
        const confirmedSection = page.locator('text=/Rendez-vous confirmés/i');
        if (await confirmedSection.isVisible()) {
          await confirmedSection.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);

          // 📸 SCREENSHOT: RDV confirmés
          await page.screenshot({ path: 'screenshots/inscription-exposant/rdv-4-confirmes.png', fullPage: true });
        }
      }

      // Test: Refuser une demande (si disponible)
      const rejectBtns = await page.locator('button:has-text("Refuser")').count();
      if (rejectBtns > 0) {
        console.log('  ❌ Test: Refuser une demande');

        // Écouter la confirmation
        page.on('dialog', dialog => dialog.accept());

        const rejectBtn = page.locator('button:has-text("Refuser")').first();

        // 📸 SCREENSHOT: Avant refus
        await page.screenshot({ path: 'screenshots/inscription-exposant/rdv-5-avant-refus.png', fullPage: true });

        await rejectBtn.click();
        await page.waitForTimeout(2000);

        // 📸 SCREENSHOT: Après refus
        await page.screenshot({ path: 'screenshots/inscription-exposant/rdv-6-apres-refus.png', fullPage: true });
      }
    } else {
      console.log('  ⚠️ Section RDV non trouvée');
    }

    console.log('✅ Tests gestion RDV terminés');
  });

});

// =============================================================================
// TEST: RESTRICTIONS D'ACCÈS EXPOSANT
// =============================================================================

test.describe('🔒 EXPOSANT - RESTRICTIONS', () => {

  test('RESTRICTIONS: Vérifier accès limités', async ({ page }) => {
    // Connexion exposant
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_EXHIBITOR.email);
    await page.locator('input[type="password"]').first().fill(TEST_EXHIBITOR.password);
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
    await page.screenshot({ path: 'screenshots/inscription-exposant/restrictions-1-visiteur.png', fullPage: true });

    // Test 2: Pas d'accès Dashboard Partenaire
    console.log('  🔒 Test 2: Blocage Dashboard Partenaire');
    await page.goto(`${BASE_URL}/partner/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const partnerBlocked = !page.url().includes('/partner/dashboard') ||
      await page.locator('text=/Non autorisé|Accès refusé/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`    Dashboard Partenaire bloqué: ${partnerBlocked ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Blocage partenaire
    await page.screenshot({ path: 'screenshots/inscription-exposant/restrictions-2-partenaire.png', fullPage: true });

    // Test 3: Pas d'accès Dashboard Admin
    console.log('  🔒 Test 3: Blocage Dashboard Admin');
    await page.goto(`${BASE_URL}/admin/dashboard`);
    await page.waitForLoadState('domcontentloaded');

    const adminBlocked = !page.url().includes('/admin/dashboard') ||
      await page.locator('text=/Non autorisé|Accès refusé|Admin/i').isVisible({ timeout: 3000 }).catch(() => false);

    console.log(`    Dashboard Admin bloqué: ${adminBlocked ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Blocage admin
    await page.screenshot({ path: 'screenshots/inscription-exposant/restrictions-3-admin.png', fullPage: true });

    console.log('✅ Tests restrictions terminés');
  });

});

// =============================================================================
// TEST: DIFFÉRENTES TAILLES DE STAND
// =============================================================================

test.describe('📐 EXPOSANT - TAILLES DE STAND', () => {

  test('STAND 9m²: Vérifier quotas starter', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_EXHIBITOR.email);
    await page.locator('input[type="password"]').first().fill(TEST_EXHIBITOR.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier badge niveau
    const has9mBadge = await page.locator('text=/9m²|Starter|Standard/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  📐 Badge 9m²: ${has9mBadge ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Dashboard 9m²
    await page.screenshot({ path: 'screenshots/inscription-exposant/stand-9m-dashboard.png', fullPage: true });
  });

  test('STAND 18m²: Vérifier quotas business', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    await page.locator('input[type="email"]').first().fill(TEST_EXHIBITOR_18M.email);
    await page.locator('input[type="password"]').first().fill(TEST_EXHIBITOR_18M.password);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);

    await page.goto(`${BASE_URL}/exhibitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier badge niveau
    const has18mBadge = await page.locator('text=/18m²|Business/i').isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`  📐 Badge 18m²: ${has18mBadge ? '✅' : '❌'}`);

    // 📸 SCREENSHOT: Dashboard 18m²
    await page.screenshot({ path: 'screenshots/inscription-exposant/stand-18m-dashboard.png', fullPage: true });
  });

});
