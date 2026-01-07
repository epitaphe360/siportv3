import { test, expect } from '@playwright/test';

test('Vérifier configuration Supabase', async ({ page }) => {
  const consoleMessages: string[] = [];

  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.goto('http://localhost:9323/login');

  // Attendre que la page se charge
  await page.waitForTimeout(2000);

  // Afficher tous les messages console
  console.log('\n=== CONSOLE LOGS ===');
  consoleMessages.forEach(msg => console.log(msg));

  // Vérifier si le warning Supabase apparaît
  const hasWarning = await page.locator('text=Configuration Supabase invalide').count();
  console.log(`\n⚠️  Warning Supabase visible: ${hasWarning > 0 ? 'OUI' : 'NON'}`);

  // Vérifier les messages console pour Supabase
  const supabaseWarnings = consoleMessages.filter(msg =>
    msg.includes('Supabase') || msg.includes('supabase')
  );

  if (supabaseWarnings.length > 0) {
    console.log('\n=== SUPABASE WARNINGS ===');
    supabaseWarnings.forEach(msg => console.log(msg));
  }
});
