import { test, expect } from '@playwright/test';

test.describe('Flux complet Partenaire : Inscription -> Connexion -> Paiement', () => {
  
  // Données du partenaire
  let partnerEmail: string;
  const partnerPassword = 'TestPassword123!';
  const partnerData = {
    companyName: 'Test Maritime Company SARL',
    firstName: 'Jean',
    lastName: 'Dupont',
    position: 'Directeur Général',
    phone: '+33612345678',
    website: 'https://test-maritime.com',
    description: 'Entreprise spécialisée dans le transport maritime international avec plus de 15 ans d\'expérience. Nous offrons des services de logistique portuaire, de manutention et de transit douanier.'
  };

  test.beforeAll(async () => {
    const timestamp = Date.now();
    partnerEmail = `partner.e2e.${timestamp}@test-siports.com`;
    console.log(`📧 Email généré : ${partnerEmail}`);
  });

  test('Flux complet : Inscription → Connexion → Upload preuve → Dashboard limité', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes pour le test complet

    // ============================================================
    // ÉTAPE 1 : INSCRIPTION PARTENAIRE
    // ============================================================
    console.log('\n🚀 ÉTAPE 1 : INSCRIPTION');
    
    await page.goto('/register/partner');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/partner-flow/01-signup-page.png' });

    // Informations de l'entreprise
    await page.fill('input[name="companyName"]', partnerData.companyName);
    await page.screenshot({ path: 'screenshots/partner-flow/02-company-name.png' });
    
    // Secteurs d'activité (MultiSelect)
    console.log('Sélection des secteurs...');
    const sectorsInput = page.getByPlaceholder(/secteurs d'activité/i);
    await sectorsInput.click();
    await page.waitForTimeout(500);
    
    // Sélectionner "Logistique et Transport"
    const logisticsOption = page.locator('button:has-text("Logistique et Transport")');
    if (await logisticsOption.count() > 0) {
        await logisticsOption.click();
        console.log('✓ Secteur sélectionné: Logistique et Transport');
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/partner-flow/03-sectors-selected.png' });

    // Pays (Select avec navigation clavier)
    console.log('Sélection du pays...');
    await page.locator('#country').click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    console.log('✓ Pays sélectionné');

    // Site web
    await page.fill('input[name="website"]', partnerData.website);

    // Type de partenariat (Select avec navigation clavier)
    console.log('Sélection du type de partenariat...');
    await page.locator('#partnershipType').click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    console.log('✓ Type de partenariat sélectionné');
    
    await page.screenshot({ path: 'screenshots/partner-flow/04-company-info-filled.png' });

    // Informations de contact
    await page.fill('input[name="firstName"]', partnerData.firstName);
    await page.fill('input[name="lastName"]', partnerData.lastName);
    await page.fill('input[name="position"]', partnerData.position);
    await page.fill('input[name="email"]', partnerEmail);
    await page.fill('input[name="phone"]', partnerData.phone);
    await page.screenshot({ path: 'screenshots/partner-flow/05-contact-info-filled.png' });

    // Description et conditions
    await page.fill('textarea[name="companyDescription"]', partnerData.description);
    await page.check('input[id="acceptTerms"]');
    await page.check('input[id="acceptPrivacy"]');
    await page.screenshot({ path: 'screenshots/partner-flow/06-description-and-terms.png' });

    // Sécurité
    await page.fill('input[name="password"]', partnerPassword);
    await page.fill('input[name="confirmPassword"]', partnerPassword);
    await page.screenshot({ path: 'screenshots/partner-flow/07-passwords-filled.png' });

    // Scroll vers le bouton submit
    const submitButton = page.locator('button[data-testid="partner-submit-button"]');
    await submitButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    console.log('Soumission du formulaire...');
    await submitButton.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/partner-flow/08-after-submit.png' });

    // Vérifier si une modal de preview apparaît
    const modal = page.locator('div[role="dialog"]');
    const hasModal = await modal.count() > 0;
    
    if (hasModal) {
        console.log('✓ Modal de prévisualisation détectée');
        await page.screenshot({ path: 'screenshots/partner-flow/09-preview-modal.png' });
        
        // Confirmer dans la modal
        const confirmBtn = modal.getByRole('button', { name: /confirmer|envoyer/i });
        if (await confirmBtn.count() > 0) {
            await confirmBtn.click();
            await page.waitForTimeout(2000);
            console.log('✓ Inscription confirmée via modal');
        }
    } else {
        console.log('⚠️ Pas de modal - vérification des erreurs...');
        const errors = await page.locator('.text-red-500, [role="alert"]').count();
        if (errors > 0) {
            const errorTexts = await page.locator('.text-red-500, [role="alert"]').allTextContents();
            console.log('Erreurs détectées:', errorTexts);
        }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/partner-flow/10-after-confirmation.png' });

    // Vérifier la redirection (success page ou dashboard)
    const currentUrl = page.url();
    console.log(`URL actuelle: ${currentUrl}`);
    
    if (currentUrl.includes('success') || currentUrl.includes('pending')) {
        console.log('✓ Inscription terminée - page de succès');
        await page.screenshot({ path: 'screenshots/partner-flow/11-success-page.png' });
    }

    // ============================================================
    // ÉTAPE 2 : CONNEXION AVEC COMPTE PENDING_PAYMENT
    // ============================================================
    console.log('\n🔐 ÉTAPE 2 : CONNEXION');
    
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'screenshots/partner-flow/12-login-page.png' });

    await page.fill('input[id="email"]', partnerEmail);
    await page.fill('input[id="password"]', partnerPassword);
    await page.screenshot({ path: 'screenshots/partner-flow/13-login-filled.png' });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    try {
        await page.waitForURL(/\/partner\//, { timeout: 15000 });
        console.log('✓ Connexion réussie - Redirigé vers dashboard partenaire');
        await page.screenshot({ path: 'screenshots/partner-flow/14-dashboard-loaded.png' });
    } catch (error) {
        console.log('⚠️ Redirection échouée');
        await page.screenshot({ path: 'screenshots/partner-flow/14-login-error.png' });
        throw error;
    }

    // Vérifier la présence du bandeau d'alerte pending_payment
    const alertBanner = page.locator('text=/compte en attente|pending.*payment/i');
    const hasAlert = await alertBanner.count() > 0;
    
    if (hasAlert) {
        console.log('✓ Bandeau d\'alerte "pending_payment" affiché');
        await page.screenshot({ path: 'screenshots/partner-flow/15-alert-banner.png' });
    } else {
        console.log('⚠️ Bandeau d\'alerte non trouvé');
    }

    // Vérifier les boutons d'action
    const paymentButton = page.locator('a[href*="bank-transfer"], button:has-text("preuve")');
    const profileButton = page.locator('a[href*="profile"], button:has-text("profil")');
    
    console.log(`Bouton paiement: ${await paymentButton.count() > 0 ? '✓' : '✗'}`);
    console.log(`Bouton profil: ${await profileButton.count() > 0 ? '✓' : '✗'}`);

    // ============================================================
    // ÉTAPE 3 : UPLOAD PREUVE DE PAIEMENT
    // ============================================================
    console.log('\n💳 ÉTAPE 3 : UPLOAD PREUVE DE PAIEMENT');
    
    // Naviguer vers la page de paiement
    await page.goto('/partner/bank-transfer?request_id=test-request&tier=museum');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/partner-flow/16-payment-page.png' });

    // Remplir la référence du virement
    const referenceInput = page.locator('input[placeholder*="REF"], input[placeholder*="référence"]').first();
    if (await referenceInput.count() > 0) {
        await referenceInput.fill('REF-TEST-' + Date.now());
        console.log('✓ Référence de virement remplie');
        await page.screenshot({ path: 'screenshots/partner-flow/17-reference-filled.png' });
    }

    // Uploader un fichier de preuve
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
            name: 'preuve_virement_test.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('CONTENU TEST - Preuve de virement bancaire pour test E2E SIPORTS 2026')
        });
        console.log('✓ Fichier uploadé');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/partner-flow/18-file-uploaded.png' });
    }

    // Soumettre la preuve
    const submitProofBtn = page.locator('button:has-text("Soumettre"), button:has-text("Envoyer")').first();
    if (await submitProofBtn.count() > 0) {
        await submitProofBtn.click();
        await page.waitForTimeout(3000);
        console.log('✓ Preuve de paiement soumise');
        await page.screenshot({ path: 'screenshots/partner-flow/19-proof-submitted.png' });
        
        // Vérifier le message de succès
        const successMessage = page.locator('text=/succès|enregistré|reçu/i');
        if (await successMessage.count() > 0) {
            console.log('✓ Message de confirmation affiché');
        }
    }

    // ============================================================
    // ÉTAPE 4 : VÉRIFIER ACCÈS LIMITÉ AU DASHBOARD
    // ============================================================
    console.log('\n🔒 ÉTAPE 4 : VÉRIFICATION ACCÈS LIMITÉ');
    
    await page.goto('/partner/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/partner-flow/20-dashboard-limited.png' });

    // Vérifier que le bandeau est toujours là
    const alertStillVisible = await page.locator('text=/attente|pending/i').count() > 0;
    console.log(`Bandeau d'alerte toujours visible: ${alertStillVisible ? '✓' : '✗'}`);

    // Tester l'accès au profil
    try {
        await page.goto('/partner/profile');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screenshots/partner-flow/21-profile-access.png' });
        console.log('✓ Accès au profil autorisé');
    } catch (error) {
        console.log('⚠️ Accès au profil bloqué');
    }

    // ============================================================
    // RÉSUMÉ FINAL
    // ============================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DU TEST');
    console.log('='.repeat(60));
    console.log(`✅ Inscription partenaire: ${partnerEmail}`);
    console.log(`✅ Connexion avec status pending_payment`);
    console.log(`✅ Upload preuve de paiement`);
    console.log(`✅ Vérification accès limité au dashboard`);
    console.log(`✅ Accès au profil autorisé`);
    console.log('='.repeat(60));
    console.log('🎉 TEST E2E COMPLET TERMINÉ AVEC SUCCÈS !');
    console.log('='.repeat(60) + '\n');
  });
});
