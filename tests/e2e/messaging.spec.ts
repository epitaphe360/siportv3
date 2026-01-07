import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour la messagerie
 * Teste : Envoi de messages, conversations, notifications
 */

test.describe('Messagerie', () => {

  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test('devrait afficher la liste des conversations', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/messages');

    await expect(page.locator('h1, h2')).toContainText(/messages|conversations/i);
  });

  test('devrait démarrer une nouvelle conversation', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/messages');

    const newMessageButton = page.locator('button:has-text(/nouveau message|new message|composer/i)').first();

    if (await newMessageButton.isVisible()) {
      await newMessageButton.click();

      // Sélectionner un destinataire
      const recipientSelect = page.locator('select[name="recipient"], input[name="recipient"]').first();
      if (await recipientSelect.isVisible()) {
        if (await recipientSelect.evaluate(el => el.tagName) === 'SELECT') {
          await recipientSelect.selectOption({ index: 1 });
        } else {
          await recipientSelect.fill('exposant@siports.com');
        }

        // Écrire le message
        await page.fill('textarea[name="message"], input[name="message"]', 'Test E2E - Message de test automatisé');

        // Envoyer
        await page.click('button:has-text(/envoyer|send/i)');

        await expect(page.locator('text=/envoyé|sent/i')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('devrait répondre à un message', async ({ page }) => {
    await login(page, 'exhibitor');
    await page.goto('/messages');

    const firstConversation = page.locator('[data-testid="conversation-item"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

      // Écrire une réponse
      const replyField = page.locator('textarea[name="reply"], input[name="reply"]').first();
      await replyField.fill('Réponse automatique - Test E2E');

      // Envoyer
      await page.click('button:has-text(/envoyer|send|répondre/i)');

      await expect(page.locator('text=Réponse automatique - Test E2E')).toBeVisible({ timeout: 5000 });
    }
  });

  test('devrait marquer un message comme lu', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/messages');

    const unreadMessage = page.locator('[data-unread="true"], .unread').first();

    if (await unreadMessage.isVisible()) {
      await unreadMessage.click();

      // Attendre que le message soit marqué comme lu
      await page.waitForTimeout(1000);

      // Vérifier que le badge "non lu" a disparu
      const unreadBadge = page.locator('[data-unread="true"], .unread');
      await expect(unreadBadge).not.toBeVisible();
    }
  });

  test('devrait supprimer une conversation', async ({ page }) => {
    await login(page, 'visitor');
    await page.goto('/messages');

    const firstConversation = page.locator('[data-testid="conversation-item"], .conversation-item').first();

    if (await firstConversation.isVisible()) {
      await firstConversation.click();

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
  });

});
