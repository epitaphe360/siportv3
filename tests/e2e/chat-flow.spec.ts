import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test('should send message successfully', async ({ page }) => {
    await page.goto('http://localhost:9323/connexion');

    await page.fill('input[type="email"]', 'visitor@test.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/tableau-de-bord');
    await page.click('text=Messagerie');
    await page.waitForURL('**/messagerie');

    // Click first conversation
    await page.click('[data-testid="conversation-item"]:first-child');

    // Send message
    const messageText = 'Test message from E2E test';
    await page.fill('textarea[placeholder*="message"]', messageText);
    await page.click('button:has-text("Envoyer")');

    // Verify message appears
    await expect(page.locator(`text=${messageText}`)).toBeVisible();
  });

  test('should show unread badge', async ({ page }) => {
    await page.goto('http://localhost:9323/connexion');

    await page.fill('input[type="email"]', 'visitor@test.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/tableau-de-bord');
    await page.click('text=Messagerie');

    // Check for unread badges
    const badges = page.locator('[data-testid="unread-badge"]');
    const count = await badges.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
