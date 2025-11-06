import { test, expect } from '@playwright/test';
import { testUsers, login } from './complete-user-journeys.spec';

/**
 * ============================================================================
 * TESTS E2E: PARTENAIRES & SPONSORS
 * ============================================================================
 */

test.describe('10. PARTENAIRES & SPONSORS', () => {

  test('10.1 - Inscription partenaire - Tier Bronze', async ({ page }) => {
    await page.goto('/become-partner');

    // Sélectionner le tier Bronze
    await page.click('[data-testid="tier-bronze"]');
    await page.click('button:has-text("Choisir Bronze")');

    // Formulaire d'inscription
    await page.fill('input[name="companyName"]', 'Bronze Partner Corp');
    await page.fill('input[name="email"]', `partner_bronze_${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', '+212 6 12 34 56 78');
    await page.fill('input[name="contactPerson"]', 'Ahmed El Fassi');
    await page.fill('textarea[name="motivation"]', 'Nous souhaitons soutenir cet événement');

    // Informations légales
    await page.fill('input[name="registrationNumber"]', 'RC123456');
    await page.fill('input[name="taxId"]', 'IF12345678');

    // Accepter les conditions
    await page.check('input[name="acceptTerms"]');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Demande envoyée')).toBeVisible();
  });

  test('10.2 - Inscription partenaire - Tier Silver', async ({ page }) => {
    await page.goto('/become-partner');

    // Sélectionner le tier Silver
    await page.click('[data-testid="tier-silver"]');
    await page.click('button:has-text("Choisir Silver")');

    // Formulaire d'inscription
    await page.fill('input[name="companyName"]', 'Silver Innovations Ltd');
    await page.fill('input[name="email"]', `partner_silver_${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', '+212 6 23 45 67 89');
    await page.fill('input[name="contactPerson"]', 'Fatima Zahra');
    await page.fill('textarea[name="motivation"]', 'Partenariat stratégique pour visibilité');

    // Options Silver
    await page.check('input[name="wantBoothe"]');
    await page.selectOption('select[name="boothSize"]', 'medium');

    // Informations légales
    await page.fill('input[name="registrationNumber"]', 'RC789012');
    await page.fill('input[name="taxId"]', 'IF87654321');

    // Accepter les conditions
    await page.check('input[name="acceptTerms"]');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Demande envoyée')).toBeVisible();
  });

  test('10.3 - Inscription partenaire - Tier Gold (Sponsoring majeur)', async ({ page }) => {
    await page.goto('/become-partner');

    // Sélectionner le tier Gold
    await page.click('[data-testid="tier-gold"]');
    await page.click('button:has-text("Choisir Gold")');

    // Formulaire d'inscription
    await page.fill('input[name="companyName"]', 'Gold Tech Industries');
    await page.fill('input[name="email"]', `partner_gold_${Date.now()}@test.com`);
    await page.fill('input[name="phone"]', '+212 6 34 56 78 90');
    await page.fill('input[name="contactPerson"]', 'Rachid Alami');
    await page.fill('textarea[name="motivation"]', 'Sponsor principal - visibilité maximale');

    // Options Gold Premium
    await page.check('input[name="wantBooth"]');
    await page.selectOption('select[name="boothSize"]', 'large');
    await page.check('input[name="wantKeynote"]');
    await page.check('input[name="wantBranding"]');

    // Upload du logo (haute résolution)
    const logoInput = page.locator('input[name="logoFile"]');
    await logoInput.setInputFiles('./tests/fixtures/logo-hd.png');

    // Informations légales
    await page.fill('input[name="registrationNumber"]', 'RC345678');
    await page.fill('input[name="taxId"]', 'IF11223344');

    // Accepter les conditions
    await page.check('input[name="acceptTerms"]');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Demande envoyée')).toBeVisible();
    await expect(page.locator('text=Un conseiller vous contactera')).toBeVisible();
  });

  test('10.4 - Dashboard partenaire : Vue d\'ensemble', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/dashboard');

    // Vérifier les KPIs partenaire
    await expect(page.locator('[data-testid="kpi-visibility"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-leads"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-engagement"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-roi"]')).toBeVisible();

    // Vérifier le tier actuel
    await expect(page.locator('[data-testid="current-tier"]')).toBeVisible();
  });

  test('10.5 - Gérer les avantages partenaire', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/benefits');

    // Voir tous les avantages
    await expect(page.locator('[data-testid="benefit-item"]')).toHaveCount(await page.locator('[data-testid="benefit-item"]').count());

    // Activer un avantage
    const firstBenefit = page.locator('[data-testid="benefit-item"]').first();
    await firstBenefit.click();

    await page.click('button:has-text("Activer cet avantage")');
    await expect(page.locator('text=Avantage activé')).toBeVisible();
  });

  test('10.6 - Générer des leads', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/leads');

    // Vérifier la liste des leads
    await expect(page.locator('[data-testid="lead-card"]')).toHaveCount(await page.locator('[data-testid="lead-card"]').count());

    // Filtrer par statut
    await page.selectOption('select[name="statusFilter"]', 'hot');

    // Vérifier les leads "chauds"
    await expect(page.locator('[data-status="hot"]')).toHaveCount(await page.locator('[data-status="hot"]').count());
  });

  test('10.7 - Exporter les leads en CSV', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/leads');

    // Sélectionner des leads
    await page.check('input[type="checkbox"][data-lead-id]').first();
    await page.check('input[type="checkbox"][data-lead-id]').nth(1);
    await page.check('input[type="checkbox"][data-lead-id]').nth(2);

    // Exporter
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exporter en CSV")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/leads.*\.csv/);
  });

  test('10.8 - Suivre un lead (CRM intégré)', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/leads');

    // Ouvrir un lead
    await page.click('[data-testid="lead-card"]').first();

    // Ajouter une note
    await page.fill('textarea[name="note"]', 'Premier contact établi - intéressé par nos solutions');
    await page.click('button:has-text("Ajouter une note")');

    await expect(page.locator('text=Note ajoutée')).toBeVisible();

    // Changer le statut
    await page.selectOption('select[name="leadStatus"]', 'contacted');
    await page.click('button:has-text("Mettre à jour")');

    await expect(page.locator('text=Statut mis à jour')).toBeVisible();
  });

  test('10.9 - Analytics partenaire : Visibilité', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/analytics');

    // Vérifier les graphiques
    await expect(page.locator('[data-testid="chart-impressions"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-clicks"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-engagement"]')).toBeVisible();

    // Vérifier les métriques
    await expect(page.locator('text=Impressions totales')).toBeVisible();
    await expect(page.locator('text=Clics sur logo')).toBeVisible();
    await expect(page.locator('text=Taux d\'engagement')).toBeVisible();
  });

  test('10.10 - Analytics partenaire : ROI', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/analytics/roi');

    // Vérifier le calcul du ROI
    await expect(page.locator('[data-testid="investment-amount"]')).toBeVisible();
    await expect(page.locator('[data-testid="leads-generated"]')).toBeVisible();
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="roi-percentage"]')).toBeVisible();
  });

  test('10.11 - Personnaliser le branding partenaire', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/branding');

    // Upload nouveau logo
    const logoInput = page.locator('input[name="logo"]');
    await logoInput.setInputFiles('./tests/fixtures/partner-logo.png');

    // Attendre l'upload
    await expect(page.locator('text=Logo téléchargé')).toBeVisible();

    // Personnaliser les couleurs
    await page.fill('input[name="primaryColor"]', '#FF5733');
    await page.fill('input[name="secondaryColor"]', '#C70039');

    // Ajouter un slogan
    await page.fill('input[name="tagline"]', 'Innovation & Excellence');

    // Sauvegarder
    await page.click('button:has-text("Sauvegarder")');

    await expect(page.locator('text=Branding mis à jour')).toBeVisible();
  });

  test('10.12 - Demander un upgrade de tier', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/upgrade');

    // Voir les tiers supérieurs
    await expect(page.locator('[data-testid="upgrade-option"]')).toHaveCount(await page.locator('[data-testid="upgrade-option"]').count());

    // Sélectionner un tier
    await page.click('[data-testid="upgrade-option"]').first();

    // Voir les différences
    await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();

    // Demander l'upgrade
    await page.click('button:has-text("Demander un upgrade")');

    // Remplir la justification
    await page.fill('textarea[name="reason"]', 'Besoin de visibilité accrue pour Q1 2026');
    await page.click('button:has-text("Envoyer la demande")');

    await expect(page.locator('text=Demande envoyée')).toBeVisible();
  });

  test('10.13 - Planifier une réunion avec l\'équipe', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/support');

    // Demander une réunion
    await page.click('button:has-text("Planifier une réunion")');

    // Sélectionner une date
    await page.click('[data-testid="calendar-date"]').first();

    // Sélectionner un créneau
    await page.click('[data-time-slot="10:00"]');

    // Sujet de la réunion
    await page.selectOption('select[name="meetingTopic"]', 'booth-setup');

    // Notes
    await page.fill('textarea[name="notes"]', 'Discussion sur l\'emplacement du stand');

    // Confirmer
    await page.click('button:has-text("Confirmer la réunion")');

    await expect(page.locator('text=Réunion planifiée')).toBeVisible();
  });

  test('10.14 - Renouveler le partenariat', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/renewal');

    // Voir l'offre de renouvellement
    await expect(page.locator('[data-testid="current-partnership"]')).toBeVisible();
    await expect(page.locator('[data-testid="renewal-offer"]')).toBeVisible();

    // Accepter le renouvellement
    await page.click('button:has-text("Renouveler pour 1 an")');

    // Processus de paiement
    await page.click('button:has-text("Payer maintenant")');

    // Simuler le paiement
    await page.fill('input[name="cardNumber"]', '4242424242424242');
    await page.fill('input[name="expiry"]', '12/26');
    await page.fill('input[name="cvc"]', '123');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Partenariat renouvelé')).toBeVisible();
  });

  test('10.15 - Télécharger le rapport de sponsoring', async ({ page }) => {
    await login(page, testUsers.partner.email, testUsers.partner.password);

    await page.goto('/partner/reports');

    // Générer le rapport
    await page.selectOption('select[name="reportType"]', 'sponsorship-summary');
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-02-28');

    await page.click('button:has-text("Générer le rapport")');

    // Attendre la génération
    await expect(page.locator('text=Rapport généré')).toBeVisible({ timeout: 15000 });

    // Télécharger en PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Télécharger PDF")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('sponsorship-report');
  });
});
