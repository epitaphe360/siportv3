import { test, expect } from '@playwright/test';

test('test simple', async ({ page }) => {
  await page.goto('http://localhost:9323');
  await page.waitForTimeout(1000);
  console.log('✓ Test simple fonctionne');
});
