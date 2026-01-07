import { test, expect } from '@playwright/test';
import { testUsers, login } from './helpers';

// Configure timeouts
test.setTimeout(120000); // 120 secondes par test

/**
 * ============================================================================
 * TESTS E2E: ADMINISTRATION
 * ============================================================================
 */

test.describe('8. ADMINISTRATION COMPLÈTE', () => {

  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);
  });

  test('8.1 - Dashboard Admin : Vue d\'ensemble', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Vérifier les KPIs
    await expect(page.locator('[data-testid="kpi-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-exhibitors"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-appointments"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-revenue"]')).toBeVisible();

    // Vérifier les graphiques
    await expect(page.locator('[data-testid="chart-registrations"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-activity"]')).toBeVisible();
  });

  test('8.2 - Gestion utilisateurs : Liste & filtres', async ({ page }) => {
    await page.goto('/admin/users');

    // Vérifier la liste
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();

    // Filtrer par rôle
    await page.selectOption('select[name="roleFilter"]', 'visitor');
    await expect(page.locator('[data-role="visitor"]')).toHaveCount(await page.locator('[data-role="visitor"]').count());

    // Recherche
    await page.fill('input[placeholder*="Rechercher"]', 'Jean');
    await expect(page.locator('text=Jean')).toBeVisible();
  });

  test('8.3 - Créer un utilisateur Admin', async ({ page }) => {
    await page.goto('/admin/users/create');

    await page.fill('input[name="email"]', `newadmin_${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'Admin123!@#');
    await page.fill('input[name="firstName"]', 'Nouveau');
    await page.fill('input[name="lastName"]', 'Admin');
    await page.selectOption('select[name="role"]', 'admin');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Utilisateur créé')).toBeVisible();
  });

  test('8.4 - Modifier permissions utilisateur', async ({ page }) => {
    await page.goto('/admin/users');

    // Cliquer sur un utilisateur
    await page.click('[data-testid="user-row"]').first();

    // Modifier le rôle
    await page.selectOption('select[name="role"]', 'exhibitor');

    // Permissions spécifiques
    await page.check('input[name="canCreateEvents"]');
    await page.check('input[name="canModerateContent"]');

    await page.click('button:has-text("Sauvegarder")');

    await expect(page.locator('text=Permissions mises à jour')).toBeVisible();
  });

  test('8.5 - Suspendre/Activer un compte', async ({ page }) => {
    await page.goto('/admin/users');

    const userRow = page.locator('[data-testid="user-row"]').first();
    await userRow.click();

    // Suspendre
    await page.click('button:has-text("Suspendre")');
    await page.fill('textarea[name="reason"]', 'Violation des CGU');
    await page.click('button:has-text("Confirmer")');

    await expect(page.locator('[data-status="suspended"]')).toBeVisible();

    // Réactiver
    await page.click('button:has-text("Réactiver")');
    await expect(page.locator('[data-status="active"]')).toBeVisible();
  });

  test('8.6 - Gestion des exposants : Validation demandes', async ({ page }) => {
    await page.goto('/admin/exhibitors/requests');

    // Vérifier les demandes en attente
    await expect(page.locator('[data-status="pending"]')).toHaveCount(await page.locator('[data-status="pending"]').count());

    // Approuver une demande
    const request = page.locator('[data-status="pending"]').first();
    await request.click();

    await page.click('button:has-text("Approuver")');
    await expect(page.locator('text=Exposant approuvé')).toBeVisible();
  });

  test('8.7 - Créer un événement', async ({ page }) => {
    await page.goto('/admin/events/create');

    await page.fill('input[name="title"]', 'Conférence Innovation 2026');
    await page.fill('textarea[name="description"]', 'Grande conférence sur l\'innovation');

    // Date et heure
    await page.fill('input[name="startDate"]', '2026-02-05');
    await page.fill('input[name="startTime"]', '09:00');
    await page.fill('input[name="endTime"]', '11:00');

    // Lieu
    await page.fill('input[name="location"]', 'Salle Principale A');

    // Catégorie
    await page.selectOption('select[name="category"]', 'conference');

    // Capacité
    await page.fill('input[name="capacity"]', '200');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Événement créé')).toBeVisible();
  });

  test('8.8 - Gérer les pavillons', async ({ page }) => {
    await page.goto('/admin/pavilions');

    // Créer un pavillon
    await page.click('button:has-text("Nouveau Pavillon")');

    await page.fill('input[name="name"]', 'Pavillon Innovation');
    await page.fill('textarea[name="description"]', 'Pavillon dédié aux technologies innovantes');
    await page.fill('input[name="capacity"]', '50');

    // Upload plan
    const planInput = page.locator('input[name="floorPlan"]');
    await planInput.setInputFiles('./tests/fixtures/floor-plan.pdf');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Pavillon créé')).toBeVisible();
  });

  test('8.9 - Attribuer stands aux exposants', async ({ page }) => {
    await page.goto('/admin/pavilions/innovation');

    // Sélectionner un stand
    await page.click('[data-stand="A01"]');

    // Attribuer à un exposant
    await page.selectOption('select[name="exhibitor"]', 'TechCorp Solutions');

    await page.click('button:has-text("Attribuer")');

    await expect(page.locator('text=Stand attribué')).toBeVisible();

    // Vérifier l'occupation
    await expect(page.locator('[data-stand="A01"][data-occupied="true"]')).toBeVisible();
  });

  test('8.10 - Modération du contenu', async ({ page }) => {
    await page.goto('/admin/moderation');

    // Contenu signalé
    await expect(page.locator('[data-status="flagged"]')).toHaveCount(await page.locator('[data-status="flagged"]').count());

    // Examiner un contenu
    const flagged = page.locator('[data-status="flagged"]').first();
    await flagged.click();

    // Approuver
    await page.click('button:has-text("Approuver")');
    await expect(page.locator('text=Contenu approuvé')).toBeVisible();
  });

  test('8.11 - Générer rapport d\'activité', async ({ page }) => {
    await page.goto('/admin/reports');

    // Sélectionner période
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-02-28');

    // Type de rapport
    await page.selectOption('select[name="reportType"]', 'activity');

    // Générer
    await page.click('button:has-text("Générer le rapport")');

    // Attendre la génération
    await expect(page.locator('text=Rapport généré')).toBeVisible({ timeout: 15000 });

    // Télécharger
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Télécharger PDF")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('rapport');
  });

  test('8.12 - Paramètres globaux de l\'événement', async ({ page }) => {
    await page.goto('/admin/settings');

    // Dates de l'événement
    await page.fill('input[name="eventStartDate"]', '2026-02-05');
    await page.fill('input[name="eventEndDate"]', '2026-02-07');

    // Lieu
    await page.fill('input[name="venueName"]', 'Centre de Congrès El Jadida');
    await page.fill('input[name="venueAddress"]', 'El Jadida, Maroc');

    // Capacités
    await page.fill('input[name="maxVisitors"]', '10000');
    await page.fill('input[name="maxExhibitors"]', '200');

    // Fonctionnalités
    await page.check('input[name="enableNetworking"]');
    await page.check('input[name="enableAppointments"]');
    await page.check('input[name="enableChat"]');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Paramètres sauvegardés')).toBeVisible();
  });
});
