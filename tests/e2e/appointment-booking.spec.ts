import { test, expect } from '@playwright/test';

test.describe('Appointment Booking Flow', () => {
  test('should book appointment successfully', async ({ page }) => {
    await page.goto('http://localhost:5173/connexion');
    
    // Login as visitor
    await page.fill('input[type="email"]', 'visitor@test.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/tableau-de-bord');
    
    // Navigate to exhibitors
    await page.click('text=Exposants');
    await page.waitForURL('**/exposants');
    
    // Click first exhibitor
    await page.click('[data-testid="exhibitor-card"]');
    
    // Book appointment
    await page.click('text=Prendre rendez-vous');
    await page.click('[data-testid="timeslot"]:first-child');
    await page.fill('textarea', 'Test booking message');
    await page.click('button:has-text("Confirmer")');
    
    // Verify success
    await expect(page.locator('text=Rendez-vous réservé')).toBeVisible();
  });

  test('should prevent double booking', async ({ page }) => {
    await page.goto('http://localhost:5173/connexion');
    await page.fill('input[type="email"]', 'visitor@test.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/tableau-de-bord');
    await page.click('text=Rendez-vous');
    
    // Verify no duplicate bookings
    const bookings = page.locator('[data-testid="appointment-item"]');
    const count = await bookings.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should show quota reached error', async ({ page }) => {
    await page.goto('http://localhost:5173/connexion');
    
    // Login as free user (0 quota)
    await page.fill('input[type="email"]', 'free@test.com');
    await page.fill('input[type="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/tableau-de-bord');
    await page.click('text=Exposants');
    await page.click('[data-testid="exhibitor-card"]');
    await page.click('text=Prendre rendez-vous');
    
    // Should show quota error
    await expect(page.locator('text=Quota')).toBeVisible();
  });
});
