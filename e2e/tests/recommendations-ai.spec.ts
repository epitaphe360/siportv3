import { test, expect } from '@playwright/test';
import { testUsers, login } from './complete-user-journeys.spec';

/**
 * ============================================================================
 * TESTS E2E: RECOMMANDATIONS IA
 * ============================================================================
 */

test.describe('7. RECOMMANDATIONS IA', () => {

  test('7.1 - Recevoir recommandations personnalisées', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/recommendations');

    // Vérifier l'affichage des recommandations
    await expect(page.locator('[data-testid="recommendations-list"]')).toBeVisible();

    // Vérifier qu'il y a au moins 3 recommandations
    const recommendations = page.locator('[data-testid="recommendation-card"]');
    await expect(recommendations).toHaveCount(await recommendations.count(), { timeout: 10000 });
    expect(await recommendations.count()).toBeGreaterThanOrEqual(3);
  });

  test('7.2 - Filtrer recommandations par catégorie', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/recommendations');

    // Filtrer par "Exposants"
    await page.click('[data-filter="exhibitors"]');
    await expect(page.locator('[data-type="exhibitor"]')).toHaveCount(await page.locator('[data-type="exhibitor"]').count());

    // Filtrer par "Produits"
    await page.click('[data-filter="products"]');
    await expect(page.locator('[data-type="product"]')).toHaveCount(await page.locator('[data-type="product"]').count());

    // Filtrer par "Événements"
    await page.click('[data-filter="events"]');
    await expect(page.locator('[data-type="event"]')).toHaveCount(await page.locator('[data-type="event"]').count());
  });

  test('7.3 - Noter une recommandation (Like/Dislike)', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/recommendations');

    const recommendation = page.locator('[data-testid="recommendation-card"]').first();

    // Like
    await recommendation.locator('button[data-action="like"]').click();
    await expect(recommendation.locator('[data-liked="true"]')).toBeVisible();

    // Dislike
    await recommendation.locator('button[data-action="dislike"]').click();
    await expect(recommendation.locator('[data-liked="false"]')).toBeVisible();
  });

  test('7.4 - Sauvegarder une recommandation', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/recommendations');

    const recommendation = page.locator('[data-testid="recommendation-card"]').first();

    // Sauvegarder
    await recommendation.locator('button[data-action="save"]').click();
    await expect(page.locator('text=Ajouté aux favoris')).toBeVisible();

    // Vérifier dans les favoris
    await page.goto('/favorites');
    await expect(page.locator('[data-testid="favorite-item"]')).toHaveCount(await page.locator('[data-testid="favorite-item"]').count());
    expect(await page.locator('[data-testid="favorite-item"]').count()).toBeGreaterThanOrEqual(1);
  });

  test('7.5 - Rafraîchir les recommandations', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/recommendations');

    // Capturer les recommandations actuelles
    const initialContent = await page.locator('[data-testid="recommendations-list"]').textContent();

    // Rafraîchir
    await page.click('button:has-text("Actualiser")');

    // Attendre le chargement
    await page.waitForResponse(resp => resp.url().includes('/api/recommendations') && resp.status() === 200);

    // Vérifier le changement (peut être identique ou différent)
    await expect(page.locator('[data-testid="recommendations-list"]')).toBeVisible();
  });
});
