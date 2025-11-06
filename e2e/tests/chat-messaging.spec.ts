import { test, expect } from '@playwright/test';
import { testUsers, login } from './helpers';

/**
 * ============================================================================
 * TESTS E2E: CHAT & MESSAGERIE
 * ============================================================================
 */

test.describe('6. CHAT & MESSAGERIE', () => {

  test('6.1 - Envoyer un message direct', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/networking');

    // Trouver un exposant
    await page.click('[data-testid="exhibitor-card"]').first();
    await page.click('button:has-text("Envoyer un message")');

    // Écrire le message
    await page.fill('textarea[name="message"]', 'Bonjour, je suis intéressé par vos produits');
    await page.click('button:has-text("Envoyer")');

    await expect(page.locator('text=Message envoyé')).toBeVisible();
  });

  test('6.2 - Chat en temps réel', async ({ page, context }) => {
    // Ouvrir 2 pages (2 utilisateurs)
    const page1 = page;
    const page2 = await context.newPage();

    // Utilisateur 1: Visiteur
    await login(page1, testUsers.visitor.email, testUsers.visitor.password);
    await page1.goto('/chat');

    // Utilisateur 2: Exposant
    await login(page2, testUsers.exhibitor.email, testUsers.exhibitor.password);
    await page2.goto('/chat');

    // User 1 envoie un message
    await page1.click(`[data-chat-with="${testUsers.exhibitor.email}"]`);
    await page1.fill('input[name="message"]', 'Hello from visitor!');
    await page1.press('input[name="message"]', 'Enter');

    // Vérifier réception sur User 2
    await expect(page2.locator('text=Hello from visitor!')).toBeVisible({ timeout: 5000 });

    // User 2 répond
    await page2.fill('input[name="message"]', 'Hello back!');
    await page2.press('input[name="message"]', 'Enter');

    // Vérifier réception sur User 1
    await expect(page1.locator('text=Hello back!')).toBeVisible({ timeout: 5000 });
  });

  test('6.3 - Upload fichier dans le chat', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/chat');
    await page.click('[data-chat-with]').first();

    // Upload un fichier
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/document.pdf');

    // Attendre l'upload
    await expect(page.locator('[data-file-name="document.pdf"]')).toBeVisible({ timeout: 10000 });
  });

  test('6.4 - Notifications de messages', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Simuler réception d'un message
    // (Normalement via WebSocket, ici on simule)

    // Vérifier le badge de notification
    await expect(page.locator('[data-testid="messages-badge"]')).toBeVisible();
  });

  test('6.5 - Historique des conversations', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/chat');

    // Vérifier la liste des conversations
    await expect(page.locator('[data-testid="conversation-list"]')).toBeVisible();

    // Rechercher une conversation
    await page.fill('input[placeholder*="Rechercher"]', 'TechCorp');

    await expect(page.locator('text=TechCorp')).toBeVisible();
  });

  test('6.6 - Marquer comme lu/non lu', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/chat');

    const conversation = page.locator('[data-conversation]').first();

    // Menu contextuel
    await conversation.click({ button: 'right' });
    await page.click('text=Marquer comme non lu');

    // Vérifier l'indicateur non lu
    await expect(conversation.locator('[data-unread="true"]')).toBeVisible();
  });
});
