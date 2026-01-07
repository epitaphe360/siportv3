import { test, expect } from '@playwright/test';
import { testUsers, login } from './helpers';

// Configure timeouts
test.setTimeout(120000); // 120 secondes par test

/**
 * ============================================================================
 * TESTS E2E: ÉVÉNEMENTS & PAVILLONS
 * ============================================================================
 */

test.describe('9. ÉVÉNEMENTS & PAVILLONS', () => {

  test('9.1 - Consulter le calendrier des événements', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Vérifier le calendrier
    await expect(page.locator('[data-testid="events-calendar"]')).toBeVisible();

    // Vérifier les vues (jour, semaine, mois)
    await expect(page.locator('button:has-text("Jour")')).toBeVisible();
    await expect(page.locator('button:has-text("Semaine")')).toBeVisible();
    await expect(page.locator('button:has-text("Mois")')).toBeVisible();

    // Vérifier qu'il y a des événements
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount(await page.locator('[data-testid="event-card"]').count());
  });

  test('9.2 - Filtrer événements par catégorie', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Filtrer par conférences
    await page.click('button:has-text("Catégories")');
    await page.check('input[value="conference"]');

    // Vérifier que seuls les conférences sont affichées
    const events = page.locator('[data-testid="event-card"]');
    const count = await events.count();

    for (let i = 0; i < count; i++) {
      await expect(events.nth(i).locator('[data-category="conference"]')).toBeVisible();
    }
  });

  test('9.3 - Voir les détails d\'un événement', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Cliquer sur un événement
    await page.click('[data-testid="event-card"]').first();

    // Vérifier les détails
    await expect(page.locator('[data-testid="event-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-location"]')).toBeVisible();
    await expect(page.locator('[data-testid="event-capacity"]')).toBeVisible();

    // Vérifier les boutons d'action
    await expect(page.locator('button:has-text("S\'inscrire")')).toBeVisible();
    await expect(page.locator('button:has-text("Ajouter au calendrier")')).toBeVisible();
  });

  test('9.4 - S\'inscrire à un événement', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Cliquer sur un événement
    await page.click('[data-testid="event-card"]').first();

    // S'inscrire
    await page.click('button:has-text("S\'inscrire")');

    // Confirmation
    await expect(page.locator('text=Inscription confirmée')).toBeVisible();

    // Vérifier que le bouton a changé
    await expect(page.locator('button:has-text("Inscrit")')).toBeVisible();
  });

  test('9.5 - Annuler inscription à un événement', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Aller sur un événement où on est déjà inscrit
    await page.click('[data-testid="event-card"][data-registered="true"]').first();

    // Annuler l'inscription
    await page.click('button:has-text("Annuler l\'inscription")');
    await page.click('button:has-text("Confirmer")');

    await expect(page.locator('text=Inscription annulée')).toBeVisible();
  });

  test('9.6 - Ajouter événement au calendrier personnel', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Cliquer sur un événement
    await page.click('[data-testid="event-card"]').first();

    // Ajouter au calendrier
    await page.click('button:has-text("Ajouter au calendrier")');

    // Choisir le format
    await page.click('button:has-text("Google Calendar")');

    // Vérifier l'ouverture dans un nouvel onglet (simulé)
    await expect(page.locator('text=Ajouté au calendrier')).toBeVisible();
  });

  test('9.7 - Check-in à l\'événement', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events/my-events');

    // Événement d'aujourd'hui
    const todayEvent = page.locator('[data-testid="event-card"][data-date="today"]').first();
    await todayEvent.click();

    // Check-in
    await page.click('button:has-text("Check-in")');

    // Scanner QR code (simulé)
    await page.click('button:has-text("Entrer le code manuellement")');
    await page.fill('input[name="checkInCode"]', 'EVENT2026-1234');
    await page.click('button:has-text("Valider")');

    await expect(page.locator('text=Check-in réussi')).toBeVisible();
  });

  test('9.8 - Voir la liste des participants', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/events');

    // Cliquer sur un événement
    await page.click('[data-testid="event-card"]').first();

    // Voir les participants
    await page.click('button:has-text("Participants")');

    // Vérifier la liste
    await expect(page.locator('[data-testid="participants-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="participant-card"]')).toHaveCount(await page.locator('[data-testid="participant-card"]').count());
  });

  test('9.9 - Consulter les pavillons', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions');

    // Vérifier la liste des pavillons
    await expect(page.locator('[data-testid="pavilion-card"]')).toHaveCount(await page.locator('[data-testid="pavilion-card"]').count());

    // Vérifier les informations
    const firstPavilion = page.locator('[data-testid="pavilion-card"]').first();
    await expect(firstPavilion.locator('[data-testid="pavilion-name"]')).toBeVisible();
    await expect(firstPavilion.locator('[data-testid="pavilion-capacity"]')).toBeVisible();
  });

  test('9.10 - Voir le plan d\'un pavillon', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions');

    // Cliquer sur un pavillon
    await page.click('[data-testid="pavilion-card"]').first();

    // Vérifier le plan interactif
    await expect(page.locator('[data-testid="pavilion-floor-plan"]')).toBeVisible();

    // Vérifier les stands
    await expect(page.locator('[data-testid="stand-marker"]')).toHaveCount(await page.locator('[data-testid="stand-marker"]').count());
  });

  test('9.11 - Naviguer sur le plan interactif', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions/innovation');

    // Zoomer
    await page.click('button[aria-label="Zoom in"]');
    await page.click('button[aria-label="Zoom in"]');

    // Dézoomer
    await page.click('button[aria-label="Zoom out"]');

    // Centrer
    await page.click('button[aria-label="Center map"]');

    // Cliquer sur un stand
    await page.click('[data-stand="A01"]');

    // Vérifier l'info-bulle
    await expect(page.locator('[data-testid="stand-popup"]')).toBeVisible();
    await expect(page.locator('text=Stand A01')).toBeVisible();
  });

  test('9.12 - Chercher un stand spécifique', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions/innovation');

    // Rechercher un exposant
    await page.fill('input[placeholder*="Rechercher un exposant"]', 'TechCorp');
    await page.click('button:has-text("Rechercher")');

    // Vérifier que le plan se centre sur le stand
    await expect(page.locator('[data-stand][data-highlighted="true"]')).toBeVisible();
    await expect(page.locator('text=TechCorp Solutions')).toBeVisible();
  });

  test('9.13 - Trouver l\'itinéraire vers un stand', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions/innovation');

    // Cliquer sur un stand
    await page.click('[data-stand="B15"]');

    // Demander l'itinéraire
    await page.click('button:has-text("Itinéraire")');

    // Choisir le point de départ
    await page.selectOption('select[name="startPoint"]', 'entrance-main');

    // Calculer
    await page.click('button:has-text("Calculer l\'itinéraire")');

    // Vérifier l'affichage de l'itinéraire
    await expect(page.locator('[data-testid="route-path"]')).toBeVisible();
    await expect(page.locator('text=Distance:')).toBeVisible();
    await expect(page.locator('text=Temps estimé:')).toBeVisible();
  });

  test('9.14 - Marquer un stand comme favori', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions/innovation');

    // Cliquer sur un stand
    await page.click('[data-stand="C03"]');

    // Ajouter aux favoris
    await page.click('button[aria-label="Add to favorites"]');

    await expect(page.locator('text=Ajouté aux favoris')).toBeVisible();

    // Vérifier dans la liste des favoris
    await page.goto('/favorites');
    await expect(page.locator('text=Stand C03')).toBeVisible();
  });

  test('9.15 - Voir les événements d\'un pavillon', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions/innovation');

    // Cliquer sur l'onglet événements
    await page.click('button:has-text("Événements du pavillon")');

    // Vérifier la liste
    await expect(page.locator('[data-testid="pavilion-event"]')).toHaveCount(await page.locator('[data-testid="pavilion-event"]').count());
  });

  test('9.16 - Planifier une visite (multi-stands)', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/pavilions/innovation');

    // Activer le mode planification
    await page.click('button:has-text("Planifier ma visite")');

    // Sélectionner plusieurs stands
    await page.click('[data-stand="A01"]');
    await page.click('[data-stand="A05"]');
    await page.click('[data-stand="B10"]');

    // Optimiser l'itinéraire
    await page.click('button:has-text("Optimiser l\'itinéraire")');

    // Vérifier l'itinéraire optimisé
    await expect(page.locator('[data-testid="optimized-route"]')).toBeVisible();
    await expect(page.locator('text=3 stands sélectionnés')).toBeVisible();
    await expect(page.locator('text=Durée estimée:')).toBeVisible();

    // Sauvegarder la visite
    await page.click('button:has-text("Sauvegarder")');
    await expect(page.locator('text=Visite sauvegardée')).toBeVisible();
  });
});
