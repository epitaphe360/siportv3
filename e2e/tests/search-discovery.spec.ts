import { test, expect } from '@playwright/test';
import { testUsers, login } from './complete-user-journeys.spec';

/**
 * ============================================================================
 * TESTS E2E: RECHERCHE & DÉCOUVERTE
 * ============================================================================
 */

test.describe('11. RECHERCHE & DÉCOUVERTE', () => {

  test('11.1 - Recherche globale simple', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Ouvrir la recherche globale
    await page.click('input[placeholder*="Rechercher"]');

    // Rechercher un terme
    await page.fill('input[placeholder*="Rechercher"]', 'Innovation');
    await page.press('input[placeholder*="Rechercher"]', 'Enter');

    // Vérifier les résultats
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount(await page.locator('[data-testid="result-item"]').count());
  });

  test('11.2 - Recherche avec autocomplétion', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Taper dans le champ de recherche
    await page.click('input[placeholder*="Rechercher"]');
    await page.fill('input[placeholder*="Rechercher"]', 'Tech');

    // Attendre les suggestions
    await page.waitForTimeout(500);

    // Vérifier les suggestions
    await expect(page.locator('[data-testid="autocomplete-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggestion-item"]')).toHaveCount(await page.locator('[data-testid="suggestion-item"]').count());

    // Cliquer sur une suggestion
    await page.click('[data-testid="suggestion-item"]').first();

    // Vérifier la redirection
    await expect(page).toHaveURL(/.*\/(exhibitor|event|product)/);
  });

  test('11.3 - Recherche avancée : Exposants', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search/advanced');

    // Sélectionner le type
    await page.click('[data-testid="search-type-exhibitors"]');

    // Filtres
    await page.selectOption('select[name="category"]', 'technology');
    await page.selectOption('select[name="pavilion"]', 'innovation');
    await page.fill('input[name="tags"]', 'AI, IoT, Cloud');

    // Rechercher
    await page.click('button:has-text("Rechercher")');

    // Vérifier les résultats
    await expect(page.locator('[data-testid="exhibitor-result"]')).toHaveCount(await page.locator('[data-testid="exhibitor-result"]').count());
  });

  test('11.4 - Recherche avancée : Événements', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search/advanced');

    // Sélectionner le type
    await page.click('[data-testid="search-type-events"]');

    // Filtres par date
    await page.fill('input[name="startDate"]', '2026-02-05');
    await page.fill('input[name="endDate"]', '2026-02-07');

    // Filtres par catégorie
    await page.check('input[value="conference"]');
    await page.check('input[value="workshop"]');

    // Filtres par lieu
    await page.selectOption('select[name="location"]', 'pavilion-a');

    // Rechercher
    await page.click('button:has-text("Rechercher")');

    // Vérifier les résultats
    await expect(page.locator('[data-testid="event-result"]')).toHaveCount(await page.locator('[data-testid="event-result"]').count());
  });

  test('11.5 - Recherche avancée : Produits', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search/advanced');

    // Sélectionner le type
    await page.click('[data-testid="search-type-products"]');

    // Filtres
    await page.fill('input[name="productName"]', 'Smart');
    await page.selectOption('select[name="priceRange"]', '1000-5000');
    await page.check('input[value="available"]');

    // Rechercher
    await page.click('button:has-text("Rechercher")');

    // Vérifier les résultats
    await expect(page.locator('[data-testid="product-result"]')).toHaveCount(await page.locator('[data-testid="product-result"]').count());
  });

  test('11.6 - Filtrer les résultats de recherche', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search?q=Innovation');

    // Ouvrir les filtres
    await page.click('button:has-text("Filtres")');

    // Appliquer des filtres
    await page.check('input[name="filter-exhibitors"]');
    await page.selectOption('select[name="sort"]', 'relevance');

    // Appliquer
    await page.click('button:has-text("Appliquer")');

    // Vérifier que les résultats sont filtrés
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount(await page.locator('[data-testid="result-item"]').count());
  });

  test('11.7 - Trier les résultats', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search?q=Tech');

    // Trier par pertinence
    await page.selectOption('select[name="sort"]', 'relevance');
    await page.waitForTimeout(500);

    // Trier par date
    await page.selectOption('select[name="sort"]', 'date');
    await page.waitForTimeout(500);

    // Trier par popularité
    await page.selectOption('select[name="sort"]', 'popularity');
    await page.waitForTimeout(500);

    // Vérifier que les résultats changent d'ordre
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount(await page.locator('[data-testid="result-item"]').count());
  });

  test('11.8 - Sauvegarder une recherche', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search/advanced');

    // Configurer une recherche complexe
    await page.click('[data-testid="search-type-exhibitors"]');
    await page.selectOption('select[name="category"]', 'technology');
    await page.fill('input[name="tags"]', 'AI, Blockchain');

    // Sauvegarder
    await page.click('button:has-text("Sauvegarder cette recherche")');
    await page.fill('input[name="searchName"]', 'Exposants Tech AI');
    await page.click('button:has-text("Enregistrer")');

    await expect(page.locator('text=Recherche sauvegardée')).toBeVisible();
  });

  test('11.9 - Charger une recherche sauvegardée', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search/saved');

    // Vérifier les recherches sauvegardées
    await expect(page.locator('[data-testid="saved-search"]')).toHaveCount(await page.locator('[data-testid="saved-search"]').count());

    // Charger une recherche
    await page.click('[data-testid="saved-search"]').first();

    // Vérifier que les filtres sont appliqués
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('11.10 - Historique de recherche', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Effectuer plusieurs recherches
    await page.fill('input[placeholder*="Rechercher"]', 'Innovation');
    await page.press('input[placeholder*="Rechercher"]', 'Enter');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder*="Rechercher"]', 'Tech');
    await page.press('input[placeholder*="Rechercher"]', 'Enter');
    await page.waitForTimeout(1000);

    // Ouvrir l'historique
    await page.click('input[placeholder*="Rechercher"]');

    // Vérifier l'historique
    await expect(page.locator('[data-testid="search-history"]')).toBeVisible();
    await expect(page.locator('text=Innovation')).toBeVisible();
    await expect(page.locator('text=Tech')).toBeVisible();
  });

  test('11.11 - Effacer l\'historique de recherche', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/settings/privacy');

    // Effacer l'historique
    await page.click('button:has-text("Effacer l\'historique de recherche")');
    await page.click('button:has-text("Confirmer")');

    await expect(page.locator('text=Historique effacé')).toBeVisible();

    // Vérifier que l'historique est vide
    await page.goto('/dashboard');
    await page.click('input[placeholder*="Rechercher"]');
    await expect(page.locator('[data-testid="search-history"]')).toHaveCount(0);
  });

  test('11.12 - Découvrir : Trending', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/discover/trending');

    // Vérifier les tendances
    await expect(page.locator('[data-testid="trending-item"]')).toHaveCount(await page.locator('[data-testid="trending-item"]').count());

    // Vérifier les catégories
    await expect(page.locator('text=Exposants populaires')).toBeVisible();
    await expect(page.locator('text=Événements à venir')).toBeVisible();
    await expect(page.locator('text=Produits phares')).toBeVisible();
  });

  test('11.13 - Découvrir : Nouveautés', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/discover/new');

    // Vérifier les nouveautés
    await expect(page.locator('[data-testid="new-item"]')).toHaveCount(await page.locator('[data-testid="new-item"]').count());

    // Filtrer par catégorie
    await page.click('button:has-text("Nouveaux exposants")');
    await expect(page.locator('[data-type="exhibitor"]')).toHaveCount(await page.locator('[data-type="exhibitor"]').count());
  });

  test('11.14 - Découvrir : Pour vous', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/discover/for-you');

    // Vérifier les recommandations personnalisées
    await expect(page.locator('[data-testid="recommendation"]')).toHaveCount(await page.locator('[data-testid="recommendation"]').count());

    // Vérifier que les recommandations sont basées sur le profil
    await expect(page.locator('text=Basé sur vos intérêts')).toBeVisible();
  });

  test('11.15 - Découvrir : Par catégorie', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/discover/categories');

    // Vérifier les catégories
    await expect(page.locator('[data-testid="category-card"]')).toHaveCount(await page.locator('[data-testid="category-card"]').count());

    // Cliquer sur une catégorie
    await page.click('[data-testid="category-card"]').first();

    // Vérifier le contenu de la catégorie
    await expect(page.locator('[data-testid="category-content"]')).toBeVisible();
  });

  test('11.16 - Recherche par tags', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Cliquer sur un tag
    await page.click('[data-testid="tag-badge"]').first();

    // Vérifier les résultats
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount(await page.locator('[data-testid="result-item"]').count());
  });

  test('11.17 - Recherche multi-critères combinée', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search/advanced');

    // Combiner plusieurs types
    await page.check('input[name="type-exhibitors"]');
    await page.check('input[name="type-events"]');
    await page.check('input[name="type-products"]');

    // Ajouter des mots-clés
    await page.fill('input[name="keywords"]', 'Innovation Tech AI');

    // Date range
    await page.fill('input[name="dateFrom"]', '2026-02-05');
    await page.fill('input[name="dateTo"]', '2026-02-07');

    // Location
    await page.selectOption('select[name="pavilion"]', 'innovation');

    // Rechercher
    await page.click('button:has-text("Rechercher")');

    // Vérifier les résultats mixtes
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount(await page.locator('[data-testid="result-item"]').count());
    await expect(page.locator('[data-type="exhibitor"]')).toHaveCount(await page.locator('[data-type="exhibitor"]').count());
    await expect(page.locator('[data-type="event"]')).toHaveCount(await page.locator('[data-type="event"]').count());
  });

  test('11.18 - Export des résultats de recherche', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search?q=Tech');

    // Attendre les résultats
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount(await page.locator('[data-testid="result-item"]').count());

    // Exporter en PDF
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exporter en PDF")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/search-results.*\.pdf/);
  });
});
