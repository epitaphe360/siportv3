import { test, expect } from '@playwright/test';
import { testUsers, login } from './helpers';

// Configure timeouts
test.setTimeout(120000); // 120 secondes par test

/**
 * ============================================================================
 * TESTS E2E: ANALYTICS & PERFORMANCE
 * ============================================================================
 */

test.describe('13. ANALYTICS & PERFORMANCE', () => {

  test('13.1 - Analytics visiteur : Dashboard personnel', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/analytics/personal');

    // Vérifier les métriques personnelles
    await expect(page.locator('[data-testid="metric-profile-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-connections"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-events-attended"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-messages-sent"]')).toBeVisible();
  });

  test('13.2 - Analytics exposant : Visibilité', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/analytics/exhibitor/visibility');

    // Vérifier les graphiques de visibilité
    await expect(page.locator('[data-testid="chart-profile-views"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-minisite-visits"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-product-views"]')).toBeVisible();

    // Vérifier les KPIs
    await expect(page.locator('text=Vues totales')).toBeVisible();
    await expect(page.locator('text=Visiteurs uniques')).toBeVisible();
    await expect(page.locator('text=Taux de conversion')).toBeVisible();
  });

  test('13.3 - Analytics exposant : Engagement', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/analytics/exhibitor/engagement');

    // Vérifier les métriques d'engagement
    await expect(page.locator('[data-testid="metric-clicks"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-favorites"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-shares"]')).toBeVisible();
    await expect(page.locator('[data-testid="metric-messages-received"]')).toBeVisible();

    // Graphique temporel
    await expect(page.locator('[data-testid="chart-engagement-timeline"]')).toBeVisible();
  });

  test('13.4 - Analytics exposant : Leads', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/analytics/exhibitor/leads');

    // Vérifier le funnel de conversion
    await expect(page.locator('[data-testid="funnel-visitors"]')).toBeVisible();
    await expect(page.locator('[data-testid="funnel-interested"]')).toBeVisible();
    await expect(page.locator('[data-testid="funnel-contacted"]')).toBeVisible();
    await expect(page.locator('[data-testid="funnel-converted"]')).toBeVisible();

    // Taux de conversion
    await expect(page.locator('text=Taux de conversion')).toBeVisible();
  });

  test('13.5 - Analytics : Filtrer par période', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/analytics/exhibitor/visibility');

    // Changer la période
    await page.selectOption('select[name="period"]', 'last-7-days');
    await page.waitForTimeout(1000);

    await page.selectOption('select[name="period"]', 'last-30-days');
    await page.waitForTimeout(1000);

    await page.selectOption('select[name="period"]', 'custom');
    await page.fill('input[name="startDate"]', '2026-02-01');
    await page.fill('input[name="endDate"]', '2026-02-28');
    await page.click('button:has-text("Appliquer")');

    // Vérifier que les données sont mises à jour
    await expect(page.locator('[data-testid="chart-profile-views"]')).toBeVisible();
  });

  test('13.6 - Analytics : Exporter en CSV', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/analytics/exhibitor/visibility');

    // Exporter les données
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exporter CSV")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/analytics.*\.csv/);
  });

  test('13.7 - Analytics : Exporter en PDF', async ({ page }) => {
    await login(page, testUsers.exhibitor.email, testUsers.exhibitor.password);

    await page.goto('/analytics/exhibitor/visibility');

    // Générer le rapport PDF
    await page.click('button:has-text("Générer rapport PDF")');

    // Attendre la génération
    await expect(page.locator('text=Rapport en cours de génération')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await expect(page.locator('text=Rapport prêt')).toBeVisible({ timeout: 10000 });
    await page.click('button:has-text("Télécharger")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/analytics-report.*\.pdf/);
  });

  test('13.8 - Analytics admin : Global stats', async ({ page }) => {
    await login(page, testUsers.admin.email, testUsers.admin.password);

    await page.goto('/admin/analytics/global');

    // KPIs globaux
    await expect(page.locator('[data-testid="kpi-total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-active-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-total-exhibitors"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-total-events"]')).toBeVisible();

    // Graphiques globaux
    await expect(page.locator('[data-testid="chart-registrations"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="chart-revenue"]')).toBeVisible();
  });

  test('13.9 - Performance : Page load time', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    // Mesurer le temps de chargement du dashboard
    const startTime = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const loadTime = Date.now() - startTime;

    // Vérifier que le temps de chargement est acceptable (<3s)
    expect(loadTime).toBeLessThan(3000);

    console.log(`Dashboard loaded in ${loadTime}ms`);
  });

  test('13.10 - Performance : Time to interactive', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    const startTime = Date.now();
    await page.goto('/events');

    // Attendre que la page soit interactive
    await page.waitForSelector('[data-testid="event-card"]');
    const timeToInteractive = Date.now() - startTime;

    // TTI devrait être < 2s
    expect(timeToInteractive).toBeLessThan(2000);

    console.log(`Events page TTI: ${timeToInteractive}ms`);
  });

  test('13.11 - Performance : API response time', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    // Intercepter les requêtes API
    const apiResponses: number[] = [];

    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/')) {
        const timing = response.timing();
        if (timing) {
          apiResponses.push(timing.responseEnd - timing.requestStart);
        }
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Calculer le temps de réponse moyen
    const avgResponseTime = apiResponses.reduce((a, b) => a + b, 0) / apiResponses.length;

    // Les API devraient répondre en moins de 500ms en moyenne
    expect(avgResponseTime).toBeLessThan(500);

    console.log(`Average API response time: ${avgResponseTime.toFixed(2)}ms`);
  });

  test('13.12 - Performance : Bundle size', async ({ page }) => {
    await page.goto('/');

    // Mesurer les ressources chargées
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((r: any) => ({
        name: r.name,
        size: r.transferSize,
        type: r.initiatorType
      }));
    });

    // Filtrer les JS bundles
    const jsBundles = resources.filter(r => r.type === 'script');
    const totalJsSize = jsBundles.reduce((sum, r) => sum + r.size, 0);

    // Total JS devrait être < 1MB
    expect(totalJsSize).toBeLessThan(1024 * 1024);

    console.log(`Total JS bundle size: ${(totalJsSize / 1024).toFixed(2)}KB`);
  });

  test('13.13 - Performance : Memory usage', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Mesurer l'utilisation de la mémoire
    const metrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });

    if (metrics) {
      const usedMemoryMB = metrics.usedJSHeapSize / (1024 * 1024);

      // L'utilisation de la mémoire devrait être < 100MB
      expect(usedMemoryMB).toBeLessThan(100);

      console.log(`Memory usage: ${usedMemoryMB.toFixed(2)}MB`);
    }
  });

  test('13.14 - Performance : Images lazy loading', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Compter les images chargées initialement
    const initialImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => img.complete).length;
    });

    // Scroll vers le bas
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(1000);

    // Compter les images après scroll
    const afterScrollImages = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      return Array.from(images).filter(img => img.complete).length;
    });

    // Plus d'images devraient être chargées après scroll
    expect(afterScrollImages).toBeGreaterThan(initialImages);

    console.log(`Images loaded: initially ${initialImages}, after scroll ${afterScrollImages}`);
  });

  test('13.15 - Performance : Infinite scroll', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Compter les éléments initiaux
    let itemCount = await page.locator('[data-testid="exhibitor-card"]').count();
    const initialCount = itemCount;

    // Scroll vers le bas plusieurs fois
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);

      const newCount = await page.locator('[data-testid="exhibitor-card"]').count();
      expect(newCount).toBeGreaterThan(itemCount);
      itemCount = newCount;
    }

    console.log(`Infinite scroll: ${initialCount} -> ${itemCount} items`);
  });

  test('13.16 - Performance : Search debounce', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/search');

    let apiCallCount = 0;
    page.on('request', request => {
      if (request.url().includes('/api/search')) {
        apiCallCount++;
      }
    });

    // Taper rapidement plusieurs caractères
    const searchInput = page.locator('input[name="search"]');
    await searchInput.fill('T');
    await page.waitForTimeout(100);
    await searchInput.fill('Te');
    await page.waitForTimeout(100);
    await searchInput.fill('Tec');
    await page.waitForTimeout(100);
    await searchInput.fill('Tech');

    // Attendre le debounce
    await page.waitForTimeout(1000);

    // Il ne devrait y avoir qu'un ou deux appels API grâce au debounce
    expect(apiCallCount).toBeLessThanOrEqual(2);

    console.log(`API calls with debounce: ${apiCallCount}`);
  });

  test('13.17 - Performance : Cache effectiveness', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    // Premier chargement
    const firstLoadStart = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const firstLoadTime = Date.now() - firstLoadStart;

    // Naviguer ailleurs puis revenir
    await page.goto('/events');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Retour au dashboard (devrait être en cache)
    const cachedLoadStart = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const cachedLoadTime = Date.now() - cachedLoadStart;

    // Le chargement depuis le cache devrait être significativement plus rapide
    expect(cachedLoadTime).toBeLessThan(firstLoadTime * 0.7);

    console.log(`Load times: first ${firstLoadTime}ms, cached ${cachedLoadTime}ms`);
  });

  test('13.18 - Lighthouse score simulation', async ({ page }) => {
    await page.goto('/');

    // Mesurer différentes métriques de performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    // First Contentful Paint devrait être < 1.8s (bon score Lighthouse)
    expect(metrics.fcp).toBeLessThan(1800);

    // DOM Content Loaded devrait être rapide
    expect(metrics.domContentLoaded).toBeLessThan(1000);

    console.log('Performance metrics:', {
      fcp: `${metrics.fcp.toFixed(2)}ms`,
      dcl: `${metrics.domContentLoaded.toFixed(2)}ms`,
      load: `${metrics.loadComplete.toFixed(2)}ms`
    });
  });
});
