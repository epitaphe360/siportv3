import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour les fonctionnalités exposant
 * Teste : Produits, mini-site, analytics
 */

test.describe('Fonctionnalités Exposant', () => {

  async function login(page: any) {
    const user = TEST_USERS.exhibitor;
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test.describe('Gestion des produits', () => {

    test('devrait afficher la liste des produits', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      const productsLink = page.locator('a[href*="product"], a:has-text("Produits")').first();

      if (await productsLink.isVisible()) {
        await productsLink.click();

        await expect(page.locator('h1, h2')).toContainText(/produits|products/i);
      }
    });

    test('devrait créer un nouveau produit', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      const productsLink = page.locator('a[href*="product"]').first();

      if (await productsLink.isVisible()) {
        await productsLink.click();

        const newProductButton = page.locator('button:has-text(/nouveau|ajouter|créer/i)').first();

        if (await newProductButton.isVisible()) {
          await newProductButton.click();

          await page.fill('input[name="name"], input[name="title"]', 'Produit Test E2E');
          await page.fill('textarea[name="description"]', 'Description du produit de test automatisé E2E');
          await page.fill('input[name="price"]', '999.99');

          await page.click('button[type="submit"]:has-text(/créer|enregistrer/i)');

          await expect(page.locator('text=/produit.*créé|product.*created/i')).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('devrait modifier un produit existant', async ({ page }) => {
      await login(page);

      const productsLink = page.locator('a[href*="product"]').first();

      if (await productsLink.isVisible()) {
        await productsLink.click();

        const firstProduct = page.locator('[data-testid="product-item"], .product-card').first();

        if (await firstProduct.isVisible()) {
          await firstProduct.click();

          const editButton = page.locator('button:has-text(/modifier|edit/i)').first();

          if (await editButton.isVisible()) {
            await editButton.click();

            await page.fill('input[name="name"], input[name="title"]', 'Produit Modifié - Test E2E');

            await page.click('button[type="submit"]:has-text(/enregistrer|save/i)');

            await expect(page.locator('text=/modifié|updated/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

    test('devrait supprimer un produit', async ({ page }) => {
      await login(page);

      const productsLink = page.locator('a[href*="product"]').first();

      if (await productsLink.isVisible()) {
        await productsLink.click();

        const firstProduct = page.locator('[data-testid="product-item"], .product-card').first();

        if (await firstProduct.isVisible()) {
          await firstProduct.click();

          const deleteButton = page.locator('button:has-text(/supprimer|delete/i)').first();

          if (await deleteButton.isVisible()) {
            await deleteButton.click();

            // Confirmer
            const confirmButton = page.locator('button:has-text(/confirmer|oui|yes/i)').first();
            if (await confirmButton.isVisible()) {
              await confirmButton.click();
            }

            await expect(page.locator('text=/supprimé|deleted/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

  });

  test.describe('Mini-site exposant', () => {

    test('devrait afficher le mini-site', async ({ page }) => {
      await login(page);

      const miniSiteLink = page.locator('a[href*="mini-site"]').first();

      if (await miniSiteLink.isVisible()) {
        await miniSiteLink.click();

        await expect(page.locator('text=Expo Test SA')).toBeVisible();
      }
    });

    test('devrait modifier les informations du mini-site', async ({ page }) => {
      await login(page);

      const miniSiteLink = page.locator('a[href*="mini-site"]').first();

      if (await miniSiteLink.isVisible()) {
        await miniSiteLink.click();

        const editButton = page.locator('button:has-text(/modifier|edit|personnaliser/i)').first();

        if (await editButton.isVisible()) {
          await editButton.click();

          const descriptionField = page.locator('textarea[name="description"], textarea[name="about"]').first();
          if (await descriptionField.isVisible()) {
            await descriptionField.fill('Description mise à jour par test E2E automatisé');

            await page.click('button[type="submit"]:has-text(/enregistrer|save/i)');

            await expect(page.locator('text=/enregistré|saved/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

  });

  test.describe('Analytics exposant', () => {

    test('devrait afficher les statistiques', async ({ page }) => {
      await login(page);

      const analyticsLink = page.locator('a[href*="analytics"], a[href*="statistiques"]').first();

      if (await analyticsLink.isVisible()) {
        await analyticsLink.click();

        // Vérifier que les métriques sont affichées
        await expect(page.locator('text=/vues|views|visiteurs|visitors/i')).toBeVisible();
      }
    });

    test('devrait filtrer les statistiques par période', async ({ page }) => {
      await login(page);

      const analyticsLink = page.locator('a[href*="analytics"]').first();

      if (await analyticsLink.isVisible()) {
        await analyticsLink.click();

        const periodFilter = page.locator('select[name="period"], button:has-text(/période|derniers/i)').first();

        if (await periodFilter.isVisible()) {
          if (await periodFilter.evaluate(el => el.tagName) === 'SELECT') {
            await periodFilter.selectOption('30d');
          } else {
            await periodFilter.click();
            await page.click('li:has-text("30 jours"), [role="option"]:has-text("30")');
          }

          await page.waitForTimeout(1000);

          // Les statistiques devraient être rechargées
          await expect(page.locator('[data-testid="stats-chart"], .chart')).toBeVisible();
        }
      }
    });

  });

});
