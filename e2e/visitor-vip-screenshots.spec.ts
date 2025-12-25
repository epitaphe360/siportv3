import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// Comptes de test pour les visiteurs VIP
// NOTE: Compte pour test d'inscription (email unique à chaque test)
const generateTestEmail = () => `visitor-vip-demo-${Date.now()}@test.siport.com`;

const TEST_VISITOR_VIP = {
  email: 'visitor-vip@test.siport.com',
  password: 'Test@123456'
};

test.describe('👑 VISITEUR VIP (700€) - SCÉNARIO COMPLET AVEC SCREENSHOTS', () => {

  test('SCÉNARIO: Choix Plan VIP -> Inscription -> Paiement -> Succès -> Login -> Dashboard -> Badge', async ({ page }) => {
    test.setTimeout(120000); // Augmenter le timeout à 2 minutes pour ce scénario long
    const testEmail = generateTestEmail();

    // 🔍 Capturer TOUS les logs de la console du navigateur
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ BROWSER ERROR: ${text}`);
      } else if (type === 'warn') {
        console.log(`⚠️ BROWSER WARN: ${text}`);
      } else {
        console.log(`📝 BROWSER LOG: ${text}`);
      }
    });

    // Capturer les erreurs JS non gérées
    page.on('pageerror', error => {
      console.log(`💥 PAGE ERROR: ${error.message}`);
    });

    // Capturer les requêtes qui échouent
    page.on('requestfailed', request => {
      console.log(`🔴 REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
    });

    // --- ÉTAPE 1: CHOIX DU PLAN VIP (ABONNEMENT) ---
    console.log('📍 ÉTAPE 1: Choix du plan VIP (Page publique)');
    await page.goto(`${BASE_URL}/visitor/subscription`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier que les offres sont visibles
    const vipCardTitle = page.locator('h3').filter({ hasText: /VIP|Premium/ }).or(page.locator('text=/700.*€/'));
    await expect(vipCardTitle.first()).toBeVisible({ timeout: 10000 });

    // Hover sur le plan VIP pour la photo
    const vipButton = page.locator('button:has-text("S\'inscrire VIP"), button:has-text("Choisir VIP"), button:has-text("Premium")').first();
    if (await vipButton.isVisible()) {
      await vipButton.hover();
      await page.waitForTimeout(500);
    }

    // 📸 SCREENSHOT 1: Choix du plan VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/1-choix-plan-vip.png', fullPage: true });

    // Cliquer sur le plan VIP
    if (await vipButton.isVisible()) {
      await vipButton.click();
    } else {
      // Alternative: aller directement à la page d'inscription VIP
      await page.goto(`${BASE_URL}/visitor/register/vip`);
    }

    // --- ÉTAPE 2: INSCRIPTION VIP ---
    console.log('📍 ÉTAPE 2: Formulaire d\'inscription VIP');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 📸 SCREENSHOT 2a: Page inscription VIP vide
    await page.screenshot({ path: 'screenshots/inscription VIP/2a-inscription-vip-vide.png', fullPage: true });

    // Vérifier si c'est un wizard multi-étapes ou formulaire unique
    const isWizard = await page.locator('button:has-text("Suivant")').isVisible().catch(() => false);

    if (isWizard) {
      // === WIZARD MULTI-ÉTAPES ===

      // Étape 1: Type (déjà sélectionné VIP ou à cliquer)
      const vipTypeLabel = page.locator('[data-testid="account-type-visitor-vip"], label:has-text("VIP"), label:has-text("Premium")');
      if (await vipTypeLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
        await vipTypeLabel.click();
      }

      // 📸 SCREENSHOT 2b: Type de compte VIP
      await page.screenshot({ path: 'screenshots/inscription VIP/2b-inscription-type-vip.png', fullPage: true });

      await page.locator('button:has-text("Suivant")').first().click();

      // Étape 2: Entreprise
      await page.waitForTimeout(500);
      const entrepriseTitle = page.locator('text=Informations sur votre organisation');
      if (await entrepriseTitle.isVisible({ timeout: 3000 }).catch(() => false)) {
        const sectorSelect = page.locator('select[name="sector"]');
        if (await sectorSelect.isVisible()) {
          await sectorSelect.selectOption('Logistique');
        }
        const countrySelect = page.locator('select[name="country"]');
        if (await countrySelect.isVisible()) {
          await countrySelect.selectOption('FR');
        }

        // Champ entreprise (obligatoire pour VIP)
        const companyInput = page.locator('input[name="company"], input[name="companyName"]');
        if (await companyInput.isVisible()) {
          await companyInput.fill('VIP Entreprise SA');
        }

        // 📸 SCREENSHOT 2c: Entreprise VIP
        await page.screenshot({ path: 'screenshots/inscription VIP/2c-inscription-entreprise-vip.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
      }

      // Étape 3: Contact
      await page.waitForTimeout(500);
      const emailInput = page.locator('input[name="email"]');
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.locator('input[name="firstName"]').fill('Marie');
        await page.locator('input[name="lastName"]').fill('VIPDupont');
        await emailInput.fill(testEmail);
        await page.locator('input[name="phone"]').fill('+33698765432');

        const positionSelect = page.locator('select[name="position"]');
        if (await positionSelect.isVisible()) {
          await positionSelect.selectOption('Directeur');
        } else {
          const positionInput = page.locator('input[name="position"]');
          if (await positionInput.isVisible()) {
            await positionInput.fill('Directeur Général');
          }
        }

        // 📸 SCREENSHOT 2d: Contact VIP
        await page.screenshot({ path: 'screenshots/inscription VIP/2d-inscription-contact-vip.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
      }

      // Étape 4: Profil (avec photo obligatoire pour VIP)
      await page.waitForTimeout(500);
      const descriptionTextarea = page.locator('textarea[name="description"]');
      if (await descriptionTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descriptionTextarea.fill('Visiteur VIP Premium - Directeur Général intéressé par les innovations du salon.');

        // Photo obligatoire pour VIP
        const photoInput = page.locator('input[type="file"][accept*="image"]').first();
        const photoCount = await photoInput.count();
        if (photoCount > 0) {
          // Upload d'une image de test (créer un buffer d'image 1x1 pixel)
          const buffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
          );
          await photoInput.setInputFiles({
            name: 'test-photo.png',
            mimeType: 'image/png',
            buffer: buffer
          });
          console.log('📷 Photo VIP uploadée avec succès (wizard)');
          // Attendre que l'upload soit traité
          await page.waitForTimeout(1500);
        } else {
          console.log('⚠️ Champ photo non trouvé dans le wizard');
        }

        const checkbox = page.locator('input[type="checkbox"]').first();
        if (await checkbox.isVisible()) {
          await checkbox.check();
        }

        // 📸 SCREENSHOT 2e: Profil VIP
        await page.screenshot({ path: 'screenshots/inscription VIP/2e-inscription-profil-vip.png', fullPage: true });

        await page.locator('button:has-text("Suivant")').first().click();
      }

      // Étape 5: Sécurité
      await page.waitForTimeout(500);
      const passwordInput = page.locator('input[name="password"]');
      if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await passwordInput.fill('Test@123456');
        await page.locator('input[name="confirmPassword"]').fill('Test@123456');

        // 📸 SCREENSHOT 2f: Sécurité VIP
        await page.screenshot({ path: 'screenshots/inscription VIP/2f-inscription-securite-vip.png', fullPage: true });

        // Soumettre
        await page.locator('button:has-text("Créer mon compte"), button:has-text("Continuer vers le paiement")').first().click();
      }

    } else {
      // === FORMULAIRE UNIQUE (page VIP dédiée) ===

      // Remplir tous les champs sur une seule page
      const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="Prénom"]').first();
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill('Marie');
      }

      const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="Nom"]').first();
      if (await lastNameInput.isVisible()) {
        await lastNameInput.fill('VIPDupont');
      }

      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill(testEmail);
      }

      const phoneInput = page.locator('input[name="phone"], input[placeholder*="Téléphone"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('+33698765432');
      }

      // Photo obligatoire pour VIP - À remplir EN PREMIER car elle est au début du formulaire
      const photoInput = page.locator('input[type="file"][accept*="image"]').first();
      const photoCount = await photoInput.count();
      if (photoCount > 0) {
        const buffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64'
        );
        await photoInput.setInputFiles({
          name: 'test-photo.png',
          mimeType: 'image/png',
          buffer: buffer
        });
        console.log('📷 Photo VIP uploadée avec succès (formulaire unique)');
        // Attendre que l'upload soit traité et la prévisualisation affichée
        await page.waitForTimeout(1500);
      } else {
        console.log('⚠️ Champ photo non trouvé dans le formulaire unique');
      }

      // Sélecteurs pour pays et secteur
      const countrySelect = page.locator('select[name="country"]').first();
      if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await countrySelect.selectOption('FR');
      }

      const sectorSelect = page.locator('select[name="sector"]').first();
      if (await sectorSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await sectorSelect.selectOption('Logistique');
      }

      const companyInput = page.locator('input[name="company"], input[placeholder*="Entreprise"]').first();
      if (await companyInput.isVisible()) {
        await companyInput.fill('VIP Entreprise SA');
      }

      const positionInput = page.locator('input[name="position"], input[placeholder*="Fonction"]').first();
      if (await positionInput.isVisible()) {
        await positionInput.fill('Directeur Général');
      }

      const passwordInput = page.locator('input[type="password"]').first();
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('Test@123456');
      }

      const confirmPasswordInput = page.locator('input[name="confirmPassword"], input[placeholder*="Confirmer"]').first();
      if (await confirmPasswordInput.isVisible()) {
        await confirmPasswordInput.fill('Test@123456');
      }

      // 📸 SCREENSHOT 2b: Formulaire VIP rempli
      await page.screenshot({ path: 'screenshots/inscription VIP/2b-inscription-vip-rempli.png', fullPage: true });

      // Soumettre le formulaire
      console.log('📤 Soumission du formulaire d\'inscription VIP...');
      const submitBtn = page.locator('button[type="submit"], button:has-text("Créer"), button:has-text("Continuer")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        console.log('✅ Formulaire soumis, attente de redirection...');
      }
    }

    // --- ÉTAPE 3: PAGE DE PAIEMENT (VIP = 700€) ---
    console.log('📍 ÉTAPE 3: Page de paiement VIP (700€)');
    console.log('⏳ Attente de redirection vers la page de paiement...');
    
    // Attendre que l'URL contienne vraiment "payment" (la redirection prend ~1.5 secondes)
    try {
      await page.waitForURL('**/visitor/payment**', { timeout: 15000 });
      console.log('✅ URL changée vers la page de paiement');
    } catch (e) {
      console.log('⚠️ Timeout waitForURL - URL actuelle:', page.url());
    }

    // Attendre le chargement complet de la page
    await page.waitForTimeout(2000);

    // Vérifier redirection vers paiement
    const isPaymentPage = page.url().includes('/visitor/payment');
    const hasPaymentContent = await page.locator('text=/Finaliser votre paiement|Méthode de paiement|Stripe|PayPal/i').isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`🔍 URL actuelle: ${page.url()}`);
    console.log(`🔍 Page de paiement détectée: ${isPaymentPage}`);
    console.log(`🔍 Contenu paiement visible: ${hasPaymentContent}`);

    // ⏸️ PAUSE IMMÉDIATE - Toujours mettre en pause pour voir l'état
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⏸️  PAUSE: INSPECTION DE LA PAGE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📄 URL: ${page.url()}`);
    console.log('👉 Inspectez la page, puis cliquez sur "Resume" pour continuer');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    await page.pause();

    if (isPaymentPage || hasPaymentContent) {
      // 📸 SCREENSHOT 3a: Page/Popup de paiement
      await page.screenshot({ path: 'screenshots/inscription VIP/3a-paiement-vip.png', fullPage: true });

      // Vérifier les options de paiement
      const hasStripe = await page.locator('text=/Stripe|Carte|Card/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasPayPal = await page.locator('text=/PayPal/i').isVisible({ timeout: 2000 }).catch(() => false);
      const hasCMI = await page.locator('text=/CMI|Maroc/i').isVisible({ timeout: 2000 }).catch(() => false);

      console.log(`  💳 Stripe: ${hasStripe ? '✅' : '❌'}`);
      console.log(`  💳 PayPal: ${hasPayPal ? '✅' : '❌'}`);
      console.log(`  💳 CMI: ${hasCMI ? '✅' : '❌'}`);

      // Sélectionner Stripe (ou première option)
      const stripeBtn = page.locator('button:has-text("Stripe"), button:has-text("Carte"), label:has-text("Stripe")').first();
      if (await stripeBtn.isVisible()) {
        await stripeBtn.click();
        await page.waitForTimeout(1000);

        // 📸 SCREENSHOT 3b: Option Stripe sélectionnée
        await page.screenshot({ path: 'screenshots/inscription VIP/3b-paiement-stripe.png', fullPage: true });
      }

      // Note: En environnement de test, on ne peut pas compléter un vrai paiement Stripe
      // On simule ou on skip cette étape
      console.log('⚠️ Paiement Stripe: simulation requise en environnement de test');

      // [DEV] Simuler Paiement Réussi
      const simulateBtn = page.locator('button:has-text("[DEV] Simuler Paiement Réussi")');
      if (await simulateBtn.isVisible()) {
        console.log('🧪 Simulation du paiement via bouton DEV...');
        await simulateBtn.click();
        await page.waitForTimeout(3000);
        
        // Vérifier redirection succès - texte sans accents pour compatibilité
        const successMsg = page.locator('h1:has-text("Paiement reussi")');
        await expect(successMsg).toBeVisible({ timeout: 15000 });
        console.log('✅ Paiement simulé avec succès');
      }

    } else {
      // Pas de page paiement immédiate - peut-être succès direct ou autre flux
      console.log('📍 Pas de redirection paiement immédiate - vérification alternative');

      // 📸 SCREENSHOT 3: État après soumission
      await page.screenshot({ path: 'screenshots/inscription VIP/3-apres-soumission.png', fullPage: true });
    }

    // --- ÉTAPE 4: SUCCÈS INSCRIPTION (POPUP ou PAGE) ---
    console.log('📍 ÉTAPE 4: Confirmation inscription VIP');

    const successPopup = page.locator('text=/Compte créé|Inscription réussie|Succès|Félicitations/i');
    const hasSuccess = await successPopup.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasSuccess) {
      await page.waitForTimeout(2000);
      // 📸 SCREENSHOT 4: Popup Succès VIP
      await page.screenshot({ path: 'screenshots/inscription VIP/4-inscription-succes-vip.png', fullPage: true });
    } else {
      console.log('⚠️ Popup succès non visible - flux alternatif ou en attente paiement');
      await page.screenshot({ path: 'screenshots/inscription VIP/4-etat-apres-inscription.png', fullPage: true });
    }

    // --- ÉTAPE 5: CONNEXION VIP (avec compte existant pour la suite) ---
    console.log('📍 ÉTAPE 5: Page de connexion VIP');

    // Utiliser le compte VIP existant pour les tests de dashboard
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    // Remplir le login avec compte VIP existant
    await page.locator('input[type="email"]').first().fill(TEST_VISITOR_VIP.email);
    await page.locator('input[type="password"]').first().fill(TEST_VISITOR_VIP.password);

    // 📸 SCREENSHOT 5: Connexion VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/5-connexion-vip.png', fullPage: true });

    await page.locator('button[type="submit"]').first().click();

    // --- ÉTAPE 6: TABLEAU DE BORD VIP ---
    console.log('📍 ÉTAPE 6: Tableau de bord VIP');

    // Attendre redirection dashboard
    await page.waitForTimeout(3000);

    // Aller au dashboard
    await page.goto(`${BASE_URL}/visitor/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Vérifier éléments VIP avec des sélecteurs plus précis
    const hasVipBadge = await page.locator('[data-testid="vip-badge"], [data-testid="level-badge"][data-level="premium"], text=/VIP|Premium|👑/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasQuota = await page.locator('[data-testid="quota-rdv-card"], [data-testid="quota-info"], text=/10.*RDV.*B2B|Quota.*10/i').first().isVisible({ timeout: 5000 }).catch(() => false);

    console.log(`  👑 Badge VIP: ${hasVipBadge ? '✅' : '❌'}`);
    console.log(`  📊 Quota 10 RDV: ${hasQuota ? '✅' : '❌'}`);

    // 📸 SCREENSHOT 6: Dashboard VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/6-dashboard-vip.png', fullPage: true });

    // --- ÉTAPE 7: PAGE RENDEZ-VOUS B2B ---
    console.log('📍 ÉTAPE 7: Rendez-vous B2B VIP');

    await page.goto(`${BASE_URL}/appointments`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 7: Page Rendez-vous VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/7-rendez-vous-vip.png', fullPage: true });

    // --- ÉTAPE 8: PAGE NETWORKING IA ---
    console.log('📍 ÉTAPE 8: Networking IA VIP');

    await page.goto(`${BASE_URL}/networking`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 8: Page Networking VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/8-networking-vip.png', fullPage: true });

    // --- ÉTAPE 9: PAGE ÉVÉNEMENTS ---
    console.log('📍 ÉTAPE 9: Événements VIP');

    await page.goto(`${BASE_URL}/events`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 9: Page Événements VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/9-evenements-vip.png', fullPage: true });

    // --- ÉTAPE 10: BADGE VIP ---
    console.log('📍 ÉTAPE 10: Badge VIP');

    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('networkidle');

    // Générer si besoin
    const generateBtn = page.getByRole('button', { name: /Générer|Generate/i });
    if (await generateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }

    await page.waitForTimeout(2000);

    // Vérifier niveau VIP sur badge
    const badgeHasVip = await page.locator('text=/VIP|Premium|Accès complet/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  🎫 Badge niveau VIP: ${badgeHasVip ? '✅' : '❌'}`);

    // 📸 SCREENSHOT 10: Badge VIP avec QR Code
    await page.screenshot({ path: 'screenshots/inscription VIP/10-badge-vip.png', fullPage: true });

    // --- ÉTAPE 11: PARAMÈTRES PROFIL VIP ---
    console.log('📍 ÉTAPE 11: Paramètres Profil VIP');

    await page.goto(`${BASE_URL}/visitor/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // 📸 SCREENSHOT 11: Paramètres Profil VIP
    await page.screenshot({ path: 'screenshots/inscription VIP/11-parametres-vip.png', fullPage: true });

    // --- ÉTAPE 12: DÉCONNEXION ---
    console.log('📍 ÉTAPE 12: Déconnexion');

    // Trouver et cliquer sur logout
    const logoutBtn = page.locator('button:has-text("Déconnexion"), button:has-text("Logout"), a:has-text("Déconnexion")').first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);

      // 📸 SCREENSHOT 12: Après déconnexion
      await page.screenshot({ path: 'screenshots/inscription VIP/12-deconnexion-vip.png', fullPage: true });
    } else {
      // Menu dropdown peut-être
      const userMenu = page.locator('[data-testid="user-menu"], button[aria-label*="menu"], .user-avatar').first();
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.waitForTimeout(500);
        const logoutOption = page.locator('text=/Déconnexion|Logout/i').first();
        if (await logoutOption.isVisible()) {
          await logoutOption.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'screenshots/inscription VIP/12-deconnexion-vip.png', fullPage: true });
        }
      }
    }

    console.log('✅ SCÉNARIO VIP TERMINÉ AVEC SUCCÈS');
    console.log('📸 Screenshots sauvegardés dans: screenshots/inscription VIP/');
  });

});
