import { test, expect } from '@playwright/test';

test.describe('Diagnostic Users', () => {

  async function tryLogin(page, email, password) {
    console.log(`Trying login: ${email} / ${password}`);
    await page.goto('/login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL(/dashboard/, { timeout: 5000 });
      console.log(`✅ SUCCESS: ${email}`);
      return true;
    } catch {
      console.log(`❌ FAILED: ${email}`);
      return false; 
    }
  }

  test('Check Credentials', async ({ page }) => {
    // New Config (from Seed)
    await tryLogin(page, 'visitor-free@test.siport.com', 'Test@123456');
    await tryLogin(page, 'admin-test@test.siport.com', 'Test@123456');
    await tryLogin(page, 'exhibitor-9m@test.siport.com', 'Test@123456');

    // Old Config (from original file)
    await tryLogin(page, 'visiteur@siports.com', 'TestPassword123!');
    await tryLogin(page, 'admin.siports@siports.com', 'TestPassword123!');
    await tryLogin(page, 'exposant@siports.com', 'TestPassword123!');

    // Marketing (Known good?)
    await tryLogin(page, 'marketing@siports.com', 'Test123456!');
  });
});
