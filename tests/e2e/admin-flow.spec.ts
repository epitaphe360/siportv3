import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test('should approve registration request', async ({ page }) => {
    await page.goto('http://localhost:9323/connexion');
    
    // Login as admin
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/**');
    
    // Navigate to registration requests
    await page.click('text=Demandes');
    
    // Click approve on first pending request
    await page.click('[data-testid="approve-button"]:first-child');
    
    // Verify success
    await expect(page.locator('text=approuvée')).toBeVisible();
  });

  test('should create event', async ({ page }) => {
    await page.goto('http://localhost:9323/connexion');
    
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'AdminPass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/admin/**');
    
    // Navigate to events
    await page.click('text=Événements');
    await page.click('text=Créer un événement');
    
    // Fill form
    await page.fill('input[name="title"]', 'Test Event');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.selectOption('select[name="type"]', 'webinar');
    await page.fill('input[type="date"]', '2025-12-31');
    await page.fill('input[name="startTime"]', '10:00');
    await page.fill('input[name="endTime"]', '11:00');
    
    // Submit
    await page.click('button[type="submit"]:has-text("Créer")');
    
    // Verify success
    await expect(page.locator('text=créé')).toBeVisible();
  });
});
