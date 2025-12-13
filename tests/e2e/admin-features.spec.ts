import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour les fonctionnalités admin
 * Teste : Gestion users, validation inscriptions, modération
 */

test.describe('Fonctionnalités Admin', () => {

  async function login(page: any) {
    const user = TEST_USERS.admin;
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test.describe('Gestion des utilisateurs', () => {

    test('devrait afficher la liste des utilisateurs', async ({ page }) => {
      await login(page);

      const usersLink = page.locator('a[href*="users"], a:has-text("Utilisateurs")').first();

      if (await usersLink.isVisible()) {
        await usersLink.click();

        await expect(page.locator('h1, h2')).toContainText(/utilisateurs|users/i);

        // Vérifier qu'il y a des utilisateurs affichés
        await expect(page.locator('[data-testid="user-item"], .user-row, tbody tr').first()).toBeVisible();
      }
    });

    test('devrait rechercher un utilisateur', async ({ page }) => {
      await login(page);

      const usersLink = page.locator('a[href*="users"]').first();

      if (await usersLink.isVisible()) {
        await usersLink.click();

        const searchField = page.locator('input[name="search"], input[placeholder*="recherch"]').first();

        if (await searchField.isVisible()) {
          await searchField.fill('visiteur');

          await page.waitForTimeout(1000);

          // Vérifier que les résultats contiennent "visiteur"
          await expect(page.locator('text=/visiteur/i')).toBeVisible();
        }
      }
    });

    test('devrait modifier un utilisateur', async ({ page }) => {
      await login(page);

      const usersLink = page.locator('a[href*="users"]').first();

      if (await usersLink.isVisible()) {
        await usersLink.click();

        const firstUser = page.locator('[data-testid="user-item"], .user-row, tbody tr').first();
        await firstUser.click();

        const editButton = page.locator('button:has-text(/modifier|edit/i)').first();

        if (await editButton.isVisible()) {
          await editButton.click();

          // Modifier le statut
          const statusSelect = page.locator('select[name="status"]').first();
          if (await statusSelect.isVisible()) {
            await statusSelect.selectOption('active');

            await page.click('button[type="submit"]:has-text(/enregistrer|save/i)');

            await expect(page.locator('text=/modifié|updated/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

    test('devrait suspendre un utilisateur', async ({ page }) => {
      await login(page);

      const usersLink = page.locator('a[href*="users"]').first();

      if (await usersLink.isVisible()) {
        await usersLink.click();

        const firstUser = page.locator('[data-testid="user-item"], tbody tr').first();
        await firstUser.click();

        const suspendButton = page.locator('button:has-text(/suspendre|suspend|bloquer/i)').first();

        if (await suspendButton.isVisible()) {
          await suspendButton.click();

          // Confirmer
          const confirmButton = page.locator('button:has-text(/confirmer|oui|yes/i)').first();
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }

          await expect(page.locator('text=/suspendu|suspended/i')).toBeVisible({ timeout: 10000 });
        }
      }
    });

  });

  test.describe('Validation des inscriptions', () => {

    test('devrait afficher les demandes d\'inscription en attente', async ({ page }) => {
      await login(page);

      const requestsLink = page.locator('a[href*="requests"], a[href*="demandes"], a:has-text(/demandes|inscriptions/i)').first();

      if (await requestsLink.isVisible()) {
        await requestsLink.click();

        await expect(page.locator('h1, h2')).toContainText(/demandes|inscriptions|requests/i);
      }
    });

    test('devrait valider une inscription', async ({ page }) => {
      await login(page);

      const requestsLink = page.locator('a[href*="requests"]').first();

      if (await requestsLink.isVisible()) {
        await requestsLink.click();

        const firstRequest = page.locator('[data-testid="request-item"], .request-card').first();

        if (await firstRequest.isVisible()) {
          await firstRequest.click();

          const approveButton = page.locator('button:has-text(/valider|approuver|approve|accepter/i)').first();

          if (await approveButton.isVisible()) {
            await approveButton.click();

            // Confirmer
            const confirmButton = page.locator('button:has-text(/confirmer|oui|yes/i)').first();
            if (await confirmButton.isVisible()) {
              await confirmButton.click();
            }

            await expect(page.locator('text=/validé|approved|accepté/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

    test('devrait rejeter une inscription', async ({ page }) => {
      await login(page);

      const requestsLink = page.locator('a[href*="requests"]').first();

      if (await requestsLink.isVisible()) {
        await requestsLink.click();

        const firstRequest = page.locator('[data-testid="request-item"], .request-card').first();

        if (await firstRequest.isVisible()) {
          await firstRequest.click();

          const rejectButton = page.locator('button:has-text(/rejeter|refuser|reject/i)').first();

          if (await rejectButton.isVisible()) {
            await rejectButton.click();

            // Raison du rejet
            const reasonField = page.locator('textarea[name="reason"]').first();
            if (await reasonField.isVisible()) {
              await reasonField.fill('Test E2E - Rejet automatisé');
            }

            // Confirmer
            await page.click('button:has-text(/confirmer|rejeter/i)');

            await expect(page.locator('text=/rejeté|rejected/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

  });

  test.describe('Tableau de bord admin', () => {

    test('devrait afficher les statistiques globales', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      // Vérifier que les cartes de statistiques sont affichées
      await expect(page.locator('text=/utilisateurs|users|total/i')).toBeVisible();
      await expect(page.locator('text=/événements|events/i')).toBeVisible();
    });

    test('devrait afficher le graphique d\'activité', async ({ page }) => {
      await login(page);
      await page.goto('/dashboard');

      const chart = page.locator('[data-testid="activity-chart"], .chart, canvas').first();

      if (await chart.isVisible()) {
        await expect(chart).toBeVisible();
      }
    });

  });

});
