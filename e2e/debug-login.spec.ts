import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

test.describe('Debug Login', () => {
  test('should load login page and show form', async ({ page }) => {
    console.log('Navigating to:', `${BASE_URL}/login`);
    
    // Try to navigate with detailed error handling
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
      console.log('Page loaded successfully');
      console.log('Current URL:', page.url());
      
      // Take a screenshot
      await page.screenshot({ path: 'e2e/debug-login.png', fullPage: true });
      console.log('Screenshot saved to e2e/debug-login.png');
      
      // Get page HTML
      const html = await page.content();
      console.log('Page HTML length:', html.length);
      console.log('Page title:', await page.title());
      
      // Try to find email input
      const emailInput = await page.locator('input[type="email"]').count();
      console.log('Email inputs found:', emailInput);
      
      // Try to find all inputs
      const allInputs = await page.locator('input').count();
      console.log('Total inputs found:', allInputs);
      
      // List all input types
      const inputs = await page.locator('input').all();
      for (const input of inputs) {
        const type = await input.getAttribute('type');
        const id = await input.getAttribute('id');
        console.log(`Input: type=${type}, id=${id}`);
      }
      
      // Check if we're actually on the login page
      expect(emailInput).toBeGreaterThan(0);
      
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  });
});
