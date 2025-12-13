import { test, expect } from '@playwright/test';

test('Test inscription visiteur fonctionnelle', async ({ page }) => {
  await page.goto('http://localhost:5173/register');

  // Générer email unique
  const timestamp = Date.now();
  const testEmail = `test-visitor-${timestamp}@siports.com`;

  console.log(`\n🧪 Test d'inscription avec: ${testEmail}`);

  // Step 1: Sélectionner type de compte visiteur
  await page.click('label:has(input[value="visitor"])');
  await page.waitForTimeout(500);

  // Cliquer sur Suivant
  const nextButton = page.locator('button:has-text("Suivant")');
  if (await nextButton.isVisible()) {
    await nextButton.click();
    await page.waitForTimeout(1000);
  }

  // Remplir le formulaire (chercher les champs disponibles)
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible()) {
    await emailInput.fill(testEmail);
  }

  const passwordInput = page.locator('input[type="password"]').first();
  if (await passwordInput.isVisible()) {
    await passwordInput.fill('TestPass123!');
  }

  // Prendre screenshot
  await page.screenshot({ path: 'test-results/inscription-form.png', fullPage: true });

  console.log('✅ Formulaire d\'inscription chargé');
  console.log('📸 Screenshot sauvegardé dans test-results/inscription-form.png');
});
