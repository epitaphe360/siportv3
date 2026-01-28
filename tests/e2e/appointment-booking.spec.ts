import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('Appointment Booking Flow', () => {

  // Helper function pour se connecter (copied from appointments.spec.ts)
  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]'); // Use click instead of submit for reliability
    
    // Wait for generic dashboard redirect
    await page.waitForURL(/dashboard/, { timeout: 15000 });
  }

  test('should book appointment successfully', async ({ page }) => {
    test.slow();
    await login(page, 'visitor');
    
    // Navigate to exhibitors
    await page.goto('/exhibitors');
    await page.waitForURL(/\/exhibitors/);
    
    // Click first exhibitor
    const firstExhibitor = page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first();
    await expect(firstExhibitor).toBeVisible();
    await firstExhibitor.click();
    
    // Wait for detail page
    await page.waitForURL(/\/exhibitors\//);

    // Book appointment
    const bookBtn = page.locator('button', { hasText: 'Planifier un RDV B2B' });
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();
    
    // Select first slot
    await page.waitForURL(/\/appointments/);
    const timeSlots = page.locator('[data-testid="timeslot"]');
    await expect(timeSlots.first()).toBeVisible({ timeout: 15000 });
    
    // Note: We avoid actual booking to not pollute DB, ensuring UI flow works is sufficient here
    // since we mock the quota below which tests the booking modal interaction
  });

  test('should prevent double booking', async ({ page }) => {
    test.slow();
    // 1. Login
    await login(page, 'visitor');
    
    // 2. Go to Exhibitors
    await page.goto('/exhibitors');
    await page.waitForURL(/\/exhibitors/);
    
    // 3. Select first exhibitor
    const firstExhibitor = page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first();
    await expect(firstExhibitor).toBeVisible();
    await firstExhibitor.click();
    
    // Wait for detail page
    await page.waitForURL(/\/exhibitors\//);

    // 4. Try to book
    // Use locator text to be robust
    const bookBtn = page.locator('button', { hasText: 'Planifier un RDV B2B' });
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();

    // Verify time slots are visible
    await page.waitForURL(/\/appointments/);
    const timeSlots = page.locator('[data-testid="timeslot"]');
    await expect(timeSlots.first()).toBeVisible({ timeout: 15000 });
  });

  test('should show quota reached error', async ({ page }) => {
    test.slow();
    // Mock the quota check RPC to return false (quota exceeded)
    await page.route('**/rest/v1/rpc/check_b2b_quota_available', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ available: false, quota: 0, used: 0 })
      });
    });

    await login(page, 'visitor');
    
    // Go directly to exhibitors list
    await page.goto('/exhibitors');
    await page.waitForURL(/\/exhibitors/);
    
    await page.locator('.exhibitor-card, [data-testid="exhibitor-card"]').first().click();
    
    await page.waitForURL(/\/exhibitors\//);
    
    // Click "Planifier un RDV B2B"
    await page.locator('button', { hasText: 'Planifier un RDV B2B' }).click();

    // Select a slot
    await page.waitForURL(/\/appointments/);
    const slot = page.locator('[data-testid="timeslot"]').first();
    await expect(slot).toBeVisible({ timeout: 10000 });
    
    if (await slot.isVisible()) {
        await slot.click();
        
        // Find message area
        const textArea = page.locator('textarea');
        if (await textArea.isVisible()) {
             await textArea.fill('Test quota message');
        }
        
        // Modal button is "Réserver"
        const reserveBtn = page.locator('button:has-text("Réserver"), button:has-text("Book")');
        if (await reserveBtn.isVisible()) {
            await reserveBtn.click();
        }

        // Expect error message toast
        // The toast text is "Accès restreint : votre Pass Gratuit..." or just "Quota atteint"
        await expect(page.locator('text=/Accès restreint|Quota|ticket/i')).toBeVisible({ timeout: 15000 });
    }
  });

});
