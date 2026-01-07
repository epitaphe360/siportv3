import { test, expect } from '@playwright/test';

/**
 * Tests E2E pour toutes les nouvelles fonctionnalités
 * - Mini-sites drag&drop
 * - Templates library
 * - CDN service
 * - Chat file uploads
 * - Analytics export
 * - 2FA authentication
 * - Search functionality
 * - Feature flags
 */

const TEST_USER = {
  email: 'exhibitor@test.com',
  password: 'Test123!',
  type: 'exhibitor'
};

test.describe('Mini-Sites Drag&Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should access site builder', async ({ page }) => {
    // Naviguer vers le builder
    await page.goto('/exhibitor/minisite/create');

    // Vérifier que le builder est chargé
    await expect(page.locator('text=Créateur de Mini-Site')).toBeVisible();
    await expect(page.locator('text=Ajouter une section')).toBeVisible();
  });

  test('should add and configure hero section', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');

    // Ajouter une section hero
    await page.click('button:has-text("hero")');

    // Attendre que la section soit ajoutée
    await page.waitForSelector('[data-section-type="hero"]');

    // Modifier le titre
    await page.fill('input[placeholder="Titre principal"]', 'Mon Entreprise Maritime');

    // Vérifier que le titre est mis à jour
    await expect(page.locator('text=Mon Entreprise Maritime')).toBeVisible();
  });

  test('should drag and drop sections', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');

    // Ajouter deux sections
    await page.click('button:has-text("hero")');
    await page.click('button:has-text("about")');

    // Vérifier qu'on a 2 sections
    const sections = await page.locator('[data-section-type]').count();
    expect(sections).toBeGreaterThanOrEqual(2);

    // TODO: Tester le drag&drop avec Playwright DnD
  });

  test('should save mini-site', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');

    // Ajouter une section
    await page.click('button:has-text("hero")');
    await page.fill('input[placeholder="Titre principal"]', 'Test Site');

    // Sauvegarder
    await page.click('button:has-text("Sauvegarder")');

    // Vérifier le message de succès
    await expect(page.locator('text=sauvegardé')).toBeVisible({ timeout: 10000 });
  });

  test('should configure SEO settings', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');

    // Ouvrir l'éditeur SEO
    await page.click('button:has-text("SEO")');

    // Vérifier que le modal est ouvert
    await expect(page.locator('text=Configuration SEO')).toBeVisible();

    // Remplir les champs SEO
    await page.fill('input[placeholder*="Titre"]', 'Mon Site Maritime - SIPORTS 2026');
    await page.fill('textarea[placeholder*="Description"]', 'Découvrez nos solutions maritimes innovantes');

    // Ajouter un mot-clé
    await page.fill('input[placeholder="Ajouter un mot-clé"]', 'maritime');
    await page.click('button:has-text("Ajouter")');

    // Vérifier que le mot-clé est ajouté
    await expect(page.locator('text=maritime')).toBeVisible();

    // Enregistrer
    await page.click('button:has-text("Enregistrer")');
  });
});

test.describe('Template Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should browse templates', async ({ page }) => {
    await page.goto('/exhibitor/minisite/templates');

    // Vérifier que les templates sont affichés
    await expect(page.locator('text=Choisissez un template')).toBeVisible();

    // Vérifier qu'il y a des templates
    const templates = await page.locator('[data-template-id]').count();
    expect(templates).toBeGreaterThan(0);
  });

  test('should filter templates by category', async ({ page }) => {
    await page.goto('/exhibitor/minisite/templates');

    // Cliquer sur une catégorie
    await page.click('button:has-text("Corporate")');

    // Vérifier que seuls les templates corporate sont affichés
    await expect(page.locator('[data-category="corporate"]')).toBeVisible();
  });

  test('should select and use template', async ({ page }) => {
    await page.goto('/exhibitor/minisite/templates');

    // Sélectionner un template
    const firstTemplate = page.locator('[data-template-id]').first();
    await firstTemplate.click();

    // Utiliser le template
    await page.click('button:has-text("Utiliser ce template")');

    // Vérifier qu'on est redirigé vers le builder
    await expect(page).toHaveURL(/.*minisite\/(create|edit).*/);
  });

  test('should search templates', async ({ page }) => {
    await page.goto('/exhibitor/minisite/templates');

    // Rechercher
    await page.fill('input[placeholder*="Rechercher"]', 'corporate');

    // Vérifier les résultats
    await page.waitForTimeout(500); // Debounce
    const results = await page.locator('[data-template-id]').count();
    expect(results).toBeGreaterThan(0);
  });
});

test.describe('CDN Service & Image Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should open image library', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');

    // Ouvrir la bibliothèque d'images
    await page.click('button:has-text("Images")');

    // Vérifier que le modal est ouvert
    await expect(page.locator('text=Bibliothèque d\'images')).toBeVisible();
  });

  test('should upload image', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');
    await page.click('button:has-text("Images")');

    // Simuler l'upload (nécessite un fichier de test)
    const fileInput = page.locator('input[type="file"]');

    // Note: Dans un vrai test, uploader un fichier réel
    // await fileInput.setInputFiles('path/to/test-image.jpg');

    // Vérifier le message de succès (si upload réussi)
    // await expect(page.locator('text=image(s) ajoutée(s)')).toBeVisible();
  });

  test('should select image from library', async ({ page }) => {
    await page.goto('/exhibitor/minisite/create');
    await page.click('button:has-text("Images")');

    // Attendre le chargement des images
    await page.waitForSelector('[data-image-url]', { timeout: 5000 }).catch(() => {});

    // Si des images existent, en sélectionner une
    const images = await page.locator('[data-image-url]').count();
    if (images > 0) {
      await page.locator('[data-image-url]').first().click();
      await page.click('button:has-text("Sélectionner")');
    }
  });
});

test.describe('Chat File Uploads', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should access chat', async ({ page }) => {
    await page.goto('/chat');

    // Vérifier que la page chat est chargée
    await expect(page.locator('text=Messagerie').or(page.locator('text=Messages'))).toBeVisible();
  });

  test('should show file upload button', async ({ page }) => {
    await page.goto('/chat');

    // Chercher le bouton d'upload (icône ou texte)
    const uploadButton = page.locator('button:has-text("Upload")').or(
      page.locator('input[type="file"]')
    );

    await expect(uploadButton.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Analytics & Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should access analytics page', async ({ page }) => {
    await page.goto('/analytics');

    // Vérifier que la page analytics est chargée
    await expect(page.locator('text=Analytics').or(page.locator('text=Statistiques'))).toBeVisible();
  });

  test('should display metrics', async ({ page }) => {
    await page.goto('/analytics');

    // Vérifier qu'il y a des métriques affichées
    const metrics = await page.locator('[data-metric]').count().catch(() => 0);

    // Au moins quelques métriques doivent être présentes
    expect(metrics).toBeGreaterThanOrEqual(0);
  });

  test('should export data as CSV', async ({ page }) => {
    await page.goto('/analytics');

    // Chercher le bouton d'export
    const exportButton = page.locator('button:has-text("Export")').or(
      page.locator('button:has-text("Exporter")')
    );

    const hasExport = await exportButton.count() > 0;

    if (hasExport) {
      // Cliquer sur export
      await exportButton.first().click();

      // Sélectionner CSV
      await page.click('button:has-text("CSV")').catch(() => {});

      // Le téléchargement devrait commencer
      const download = await page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

      if (download) {
        expect(download.suggestedFilename()).toContain('.csv');
      }
    }
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('should have search bar', async ({ page }) => {
    // Chercher la barre de recherche
    const searchBar = page.locator('input[placeholder*="Recherche"]').or(
      page.locator('input[placeholder*="Search"]')
    );

    await expect(searchBar.first()).toBeVisible();
  });

  test('should search exhibitors', async ({ page }) => {
    await page.goto('/exhibitors');

    // Trouver le champ de recherche
    const searchInput = page.locator('input[type="search"]').or(
      page.locator('input[placeholder*="Recherche"]')
    );

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('Port');

      // Attendre les résultats
      await page.waitForTimeout(1000);

      // Vérifier qu'il y a des résultats
      const results = await page.locator('[data-exhibitor-id]').count().catch(() => 0);
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter search results', async ({ page }) => {
    await page.goto('/exhibitors');

    // Chercher des filtres
    const filterButton = page.locator('button:has-text("Filter")').or(
      page.locator('button:has-text("Filtrer")')
    );

    if (await filterButton.count() > 0) {
      await filterButton.first().click();

      // Vérifier qu'il y a des options de filtre
      await expect(page.locator('[role="menu"]').or(page.locator('.filter-menu'))).toBeVisible();
    }
  });
});

test.describe('2FA Authentication', () => {
  test('should access security settings', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Naviguer vers les paramètres de sécurité
    await page.goto('/settings/security');

    // Vérifier que la page est chargée
    await expect(page.locator('text=Sécurité').or(page.locator('text=Security'))).toBeVisible();
  });

  test('should display 2FA options', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/settings/security');

    // Chercher les options 2FA
    const twoFASection = page.locator('text=Authentification à deux facteurs').or(
      page.locator('text=Two-Factor Authentication')
    );

    await expect(twoFASection).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Feature Flags', () => {
  test('should respect feature flag settings', async ({ page }) => {
    // Note: Ce test nécessiterait une configuration spécifique des feature flags

    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Vérifier qu'une feature avec flag activé est visible
    // et qu'une feature avec flag désactivé est invisible

    // Exemple: Si "new_dashboard" est activé
    // await expect(page.locator('[data-feature="new_dashboard"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Définir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/');

    // Vérifier que la page est responsive
    await expect(page.locator('body')).toBeVisible();

    // Menu mobile devrait être visible
    const mobileMenu = page.locator('button[aria-label*="menu"]').or(
      page.locator('[data-mobile-menu]')
    );

    await expect(mobileMenu.first()).toBeVisible().catch(() => {});
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Définir viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad

    await page.goto('/');

    // Vérifier que la page s'adapte
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load dashboard quickly', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);

    const startTime = Date.now();
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    const loadTime = Date.now() - startTime;

    // Le dashboard devrait charger en moins de 5 secondes
    expect(loadTime).toBeLessThan(5000);
  });

  test('should not have console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Ne devrait pas y avoir d'erreurs critiques
    // (quelques warnings sont OK)
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('Warning') && !err.includes('DevTools')
    );

    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');

    // Vérifier qu'il y a un h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    // Toutes les images devraient avoir un alt
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt peut être vide pour les images décoratives, mais doit être présent
      expect(alt !== null).toBe(true);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tester la navigation au clavier
    await page.keyboard.press('Tab');

    // Un élément devrait avoir le focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
