import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour la navigation
 * Teste : Tous les dashboards, menus, liens principaux
 */

test.describe('Navigation', () => {

  // Helper function pour se connecter
  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test.describe('Dashboard Visiteur', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, 'visitor');
    });

    test('devrait afficher le dashboard visiteur', async ({ page }) => {
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('h1, h2')).toContainText(/dashboard|tableau de bord/i);
    });

    test('devrait naviguer vers la page Events', async ({ page }) => {
      await page.click('a[href="/events"], a:has-text("Événements")');
      await expect(page).toHaveURL(/\/events/);
      await expect(page.locator('h1, h2')).toContainText(/événements|events/i);
    });

    test('devrait naviguer vers la page Exposants', async ({ page }) => {
      await page.click('a[href="/exhibitors"], a:has-text("Exposants")');
      await expect(page).toHaveURL(/\/exhibitors/);
      await expect(page.locator('h1, h2')).toContainText(/exposants|exhibitors/i);
    });

    test('devrait naviguer vers la page Networking', async ({ page }) => {
      await page.click('a[href="/networking"], a:has-text("Networking")');
      await expect(page).toHaveURL(/\/networking/);
    });

    test('devrait naviguer vers la page Rendez-vous', async ({ page }) => {
      await page.click('a[href="/appointments"], a:has-text(/rendez-vous|appointments/i)');
      await expect(page).toHaveURL(/\/appointments/);
    });

    test('devrait naviguer vers la page Profil', async ({ page }) => {
      await page.click('a[href="/profile"], a:has-text("Profil")');
      await expect(page).toHaveURL(/\/profile/);
      await expect(page.locator('text=Jean Visiteur')).toBeVisible();
    });

  });

  test.describe('Dashboard Exposant', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, 'exhibitor');
    });

    test('devrait afficher le dashboard exposant', async ({ page }) => {
      await expect(page).toHaveURL('/dashboard');
    });

    test('devrait naviguer vers la gestion des produits', async ({ page }) => {
      const productsLink = page.locator('a[href*="product"], a:has-text("Produits")').first();
      if (await productsLink.isVisible()) {
        await productsLink.click();
        await expect(page).toHaveURL(/product/);
      }
    });

    test('devrait naviguer vers le mini-site', async ({ page }) => {
      const miniSiteLink = page.locator('a[href*="mini-site"], a:has-text("Mini-site")').first();
      if (await miniSiteLink.isVisible()) {
        await miniSiteLink.click();
        await expect(page).toHaveURL(/mini-site/);
      }
    });

    test('devrait naviguer vers les rendez-vous', async ({ page }) => {
      await page.click('a[href="/appointments"], a:has-text(/rendez-vous/i)');
      await expect(page).toHaveURL(/\/appointments/);
    });

  });

  test.describe('Dashboard Admin', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, 'admin');
    });

    test('devrait afficher le dashboard admin', async ({ page }) => {
      await expect(page).toHaveURL('/dashboard');
    });

    test('devrait naviguer vers la gestion des utilisateurs', async ({ page }) => {
      const usersLink = page.locator('a[href*="users"], a:has-text("Utilisateurs")').first();
      if (await usersLink.isVisible()) {
        await usersLink.click();
        await expect(page).toHaveURL(/users/);
      }
    });

    test('devrait naviguer vers la gestion des événements', async ({ page }) => {
      await page.click('a[href="/events"], a:has-text("Événements")');
      await expect(page).toHaveURL(/\/events/);
    });

    test('devrait naviguer vers les demandes d\'inscription', async ({ page }) => {
      const requestsLink = page.locator('a[href*="requests"], a:has-text(/demandes|requests/i)').first();
      if (await requestsLink.isVisible()) {
        await requestsLink.click();
        await expect(page).toHaveURL(/requests/);
      }
    });

  });

  test.describe('Navigation publique', () => {

    test('devrait afficher la page d\'accueil', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('text=/SIPORTS|bienvenue/i')).toBeVisible();
    });

    test('devrait naviguer vers la page de login', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/login"], a:has-text(/connexion|login/i)');
      await expect(page).toHaveURL('/login');
    });

    test('devrait naviguer vers la page d\'inscription', async ({ page }) => {
      await page.goto('/');
      await page.click('a[href="/register"], a:has-text(/inscription|register/i)');
      await expect(page).toHaveURL(/\/register/);
    });

    test('tous les liens principaux devraient fonctionner', async ({ page }) => {
      await page.goto('/');

      // Récupérer tous les liens
      const links = await page.locator('a[href^="/"]').all();

      console.log(`Found ${links.length} internal links to test`);

      // Tester chaque lien (limité aux 10 premiers pour ne pas être trop long)
      for (let i = 0; i < Math.min(links.length, 10); i++) {
        const link = links[i];
        const href = await link.getAttribute('href');

        if (href && !href.includes('#')) {
          console.log(`Testing link: ${href}`);

          // Ouvrir dans un nouvel onglet pour ne pas perdre la page
          const [newPage] = await Promise.all([
            page.context().waitForEvent('page'),
            link.click({ modifiers: ['Meta'] }) // Cmd+Click ou Ctrl+Click
          ]);

          // Attendre le chargement
          await newPage.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});

          // Vérifier qu'il n'y a pas d'erreur 404
          const title = await newPage.title();
          expect(title).not.toContain('404');

          await newPage.close();
        }
      }
    });

  });

});
