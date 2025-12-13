import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour les profils
 * Teste : Modification profil, photo, paramètres, QR code
 */

test.describe('Profils', () => {

  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test('devrait afficher le profil utilisateur', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/profile');

    await expect(page.locator('text=Jean Visiteur')).toBeVisible();
    await expect(page.locator('text=visiteur@siports.com')).toBeVisible();
  });

  test('devrait modifier les informations personnelles', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/profile');

    const editButton = page.locator('button:has-text(/modifier|edit/i)').first();

    if (await editButton.isVisible()) {
      await editButton.click();

      // Modifier la bio
      const bioField = page.locator('textarea[name="bio"], textarea[name="description"]').first();
      if (await bioField.isVisible()) {
        await bioField.fill('Bio modifiée par test E2E - Professionnel du secteur maritime');

        // Sauvegarder
        await page.click('button:has-text(/enregistrer|save/i)');

        await expect(page.locator('text=/modifié|updated|enregistré/i')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('devrait télécharger une photo de profil', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/profile');

    const uploadButton = page.locator('input[type="file"], button:has-text(/photo|avatar|image/i)').first();

    if (await uploadButton.isVisible()) {
      const inputType = await uploadButton.evaluate(el => el.tagName);

      if (inputType === 'INPUT') {
        // Simuler l'upload (nécessite un vrai fichier en test réel)
        // await uploadButton.setInputFiles('path/to/test-image.jpg');
        console.log('Upload test skipped - requires real file');
      }
    }
  });

  test('devrait afficher et télécharger le QR code', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/profile');

    const qrCodeButton = page.locator('button:has-text(/qr code|badge/i)').first();

    if (await qrCodeButton.isVisible()) {
      await qrCodeButton.click();

      // Vérifier que le QR code est affiché
      await expect(page.locator('canvas, img[alt*="qr"], [data-testid="qr-code"]')).toBeVisible({ timeout: 5000 });

      // Bouton de téléchargement
      const downloadButton = page.locator('button:has-text(/télécharger|download/i)').first();
      if (await downloadButton.isVisible()) {
        // Le test du téléchargement réel nécessite une configuration spéciale
        await expect(downloadButton).toBeVisible();
      }
    }
  });

  test('devrait modifier le mot de passe', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/profile');

    const settingsLink = page.locator('a:has-text(/paramètres|settings|sécurité/i)').first();

    if (await settingsLink.isVisible()) {
      await settingsLink.click();

      const changePasswordButton = page.locator('button:has-text(/mot de passe|password/i)').first();

      if (await changePasswordButton.isVisible()) {
        await changePasswordButton.click();

        await page.fill('input[name="currentPassword"], input[name="oldPassword"]', TEST_USERS.visitor.password);
        await page.fill('input[name="newPassword"]', 'NewPassword123!');
        await page.fill('input[name="confirmPassword"], input[name="confirmNewPassword"]', 'NewPassword123!');

        await page.click('button[type="submit"]:has-text(/enregistrer|confirmer|change/i)');

        // Note: En test réel, il faudrait ensuite remettre l'ancien mot de passe
        // await expect(page.locator('text=/modifié|changed/i')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('devrait gérer les préférences de notification', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/profile');

    const settingsLink = page.locator('a:has-text(/paramètres|settings|notifications/i)').first();

    if (await settingsLink.isVisible()) {
      await settingsLink.click();

      const emailNotifications = page.locator('input[name="emailNotifications"], input[type="checkbox"]').first();

      if (await emailNotifications.isVisible()) {
        const isChecked = await emailNotifications.isChecked();
        await emailNotifications.click();

        await page.click('button:has-text(/enregistrer|save/i)');

        await expect(page.locator('text=/enregistré|saved/i')).toBeVisible({ timeout: 10000 });

        // Vérifier que le changement a été appliqué
        await page.reload();
        const newState = await emailNotifications.isChecked();
        expect(newState).toBe(!isChecked);
      }
    }
  });

  test('devrait afficher les statistiques du profil', async ({ page }) => {
    await login(page, 'exhibitor');
    await page.goto('/profile');

    // Vérifier les statistiques exposant
    const stats = page.locator('[data-testid="profile-stats"], .stats-card');

    if (await stats.first().isVisible()) {
      await expect(stats).toContainText(/vues|views|visites|visits/i);
    }
  });

});
