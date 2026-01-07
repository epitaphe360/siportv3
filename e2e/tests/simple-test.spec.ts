import { test, expect } from '@playwright/test';

// Configure timeouts
test.setTimeout(120000); // 120 secondes par test

test.describe('Simple Test', () => {
  test('should pass', async ({ page }) => {
    expect(1 + 1).toBe(2);
  });
});
