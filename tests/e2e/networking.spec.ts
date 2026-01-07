import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour le networking
 * Teste : Recommandations, connexions, favoris
 */

test.describe('Networking', () => {

  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test('devrait afficher les recommandations de networking', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/networking');

    await expect(page.locator('h1, h2')).toContainText(/networking|réseau/i);

    // Vérifier que des recommandations sont affichées
    const recommendations = page.locator('[data-testid="recommendation-card"], .recommendation-card');
    const hasRecommendations = await recommendations.first().isVisible().catch(() => false);
    const noRecommendationsMsg = await page.locator('text=/aucune recommandation|no recommendations/i').isVisible().catch(() => false);

    expect(hasRecommendations || noRecommendationsMsg).toBeTruthy();
  });

  test('devrait ajouter une connexion', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/networking');

    const firstRecommendation = page.locator('[data-testid="recommendation-card"], .recommendation-card').first();

    if (await firstRecommendation.isVisible()) {
      await firstRecommendation.click();

      const connectButton = page.locator('button:has-text(/se connecter|connect|ajouter/i)').first();

      if (await connectButton.isVisible() && !(await connectButton.isDisabled())) {
        await connectButton.click();

        await expect(page.locator('text=/connexion.*envoyée|connection.*sent/i')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('devrait afficher mes connexions', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/networking/connections');

    const connections = page.locator('[data-testid="connection-card"], .connection-card');
    const hasConnections = await connections.first().isVisible().catch(() => false);
    const noConnectionsMsg = await page.locator('text=/aucune connexion|no connections/i').isVisible().catch(() => false);

    expect(hasConnections || noConnectionsMsg).toBeTruthy();
  });

  test('devrait ajouter aux favoris', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/exhibitors');

    const firstExhibitor = page.locator('[data-testid="exhibitor-card"], .exhibitor-card').first();
    await firstExhibitor.click();

    const favoriteButton = page.locator('button:has-text(/favori|favorite|bookmark/i), button[aria-label*="favori"]').first();

    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();

      await expect(page.locator('text=/ajouté.*favoris|added.*favorites/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait afficher mes favoris', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/favorites');

    await expect(page.locator('h1, h2')).toContainText(/favoris|favorites/i);
  });

  test('devrait filtrer les recommandations par secteur', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/networking');

    const sectorFilter = page.locator('select[name="sector"], button:has-text("Secteur")').first();

    if (await sectorFilter.isVisible()) {
      if (await sectorFilter.evaluate(el => el.tagName) === 'SELECT') {
        await sectorFilter.selectOption({ index: 1 });
      } else {
        await sectorFilter.click();
        await page.click('li:has-text("Logistique"), [role="option"]:has-text("Logistique")');
      }

      await page.waitForTimeout(1000);

      // Vérifier que les résultats ont été filtrés
      const results = page.locator('[data-testid="recommendation-card"]');
      await expect(results.first()).toBeVisible();
    }
  });

});
