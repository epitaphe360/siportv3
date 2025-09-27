import { test, expect } from '@playwright/test';

test('dev test flow creates appointments and shows journal', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/dev/test-flow');
  await page.waitForSelector('button:has-text("Lancer le test")');
  await page.click('button:has-text("Lancer le test")');
  // wait for journal entry to appear
  await page.waitForSelector('div:has-text("#1")');
  // take screenshot
  await page.screenshot({ path: 'e2e-dev-flow.png', fullPage: true });
  // assert that appointments block contains "Test booking 1"
  const content = await page.locator('pre').first().innerText();
  expect(content).toContain('Test booking 1');
});
