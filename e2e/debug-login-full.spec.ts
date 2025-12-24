import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';

// COMPTES DE TEST RÉELS
const TEST_ACCOUNTS = [
  { email: 'admin-test@test.siport.com', password: 'Test@1234567', role: 'admin' },
  { email: 'visitor-free@test.siport.com', password: 'Test@1234567', role: 'visitor' },
  { email: 'visitor-vip@test.siport.com', password: 'Test@1234567', role: 'visitor-vip' },
  { email: 'exhibitor-9m@test.siport.com', password: 'Test@1234567', role: 'exhibitor' },
  { email: 'partner-museum@test.siport.com', password: 'Test@1234567', role: 'partner' },
];

test.describe('🔍 ANALYSE COMPLÈTE LOGIN E2E', () => {
  
  test('STEP 1: Vérifier que la page /login charge correctement', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Vérifier présence du formulaire
    const emailInput = page.locator('input[id="email"]');
    const passwordInput = page.locator('input[id="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Se connecter")');
    
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(submitButton).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Formulaire de login visible');
  });

  test('STEP 2: Test login avec compte VISITOR FREE', async ({ page }) => {
    const account = TEST_ACCOUNTS.find(a => a.role === 'visitor');
    if (!account) throw new Error('Compte visitor non trouvé');
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Remplir le formulaire
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    
    // Prendre screenshot avant submit
    await page.screenshot({ path: 'e2e/test-results/step2-before-submit.png' });
    
    // Click et attendre la réponse
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('supabase') && resp.url().includes('token'), { timeout: 15000 }).catch(() => null),
      page.click('button[type="submit"], button:has-text("Se connecter")')
    ]);
    
    // Attendre un peu pour voir la réponse
    await page.waitForTimeout(3000);
    
    // Prendre screenshot après submit
    await page.screenshot({ path: 'e2e/test-results/step2-after-submit.png' });
    
    // Vérifier l'URL actuelle
    const currentUrl = page.url();
    console.log(`📍 URL après login: ${currentUrl}`);
    
    // Vérifier s'il y a une erreur affichée
    const errorMessage = await page.locator('[role="alert"], .text-red-500, .error-message').textContent().catch(() => null);
    if (errorMessage) {
      console.log(`❌ Erreur: ${errorMessage}`);
    }
    
    // Vérifier si on est redirigé
    const isLoggedIn = currentUrl.includes('dashboard') || 
                       currentUrl.includes('visitor') || 
                       currentUrl.includes('badge') ||
                       currentUrl.includes('tableau-de-bord');
    
    console.log(`🔐 Login réussi: ${isLoggedIn}`);
    
    // Log de debug
    if (response) {
      console.log(`📡 Réponse Supabase: ${response.status()}`);
      try {
        const body = await response.json();
        console.log('Response:', JSON.stringify(body).substring(0, 200));
      } catch { /* JSON parse peut échouer, ignoré */ }
    }
  });

  test('STEP 3: Test login avec compte ADMIN', async ({ page }) => {
    const account = TEST_ACCOUNTS.find(a => a.role === 'admin');
    if (!account) throw new Error('Compte admin non trouvé');
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.fill('input[id="email"]', account.email);
    await page.fill('input[id="password"]', account.password);
    
    // Écouter les requêtes réseau
    page.on('response', response => {
      if (response.url().includes('supabase') || response.url().includes('auth')) {
        console.log(`🌐 ${response.status()} ${response.url().substring(0, 80)}...`);
      }
    });
    
    await page.click('button[type="submit"], button:has-text("Se connecter")');
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`📍 URL après login admin: ${currentUrl}`);
    
    // Screenshot
    await page.screenshot({ path: 'e2e/test-results/step3-admin-login.png' });
    
    // Check for errors
    const pageContent = await page.content();
    if (pageContent.includes('Invalid') || pageContent.includes('Erreur') || pageContent.includes('incorrect')) {
      console.log('❌ Message d\'erreur détecté dans la page');
    }
  });

  test('STEP 4: Vérifier les erreurs console JavaScript', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
      if (msg.type() === 'warning') consoleWarnings.push(msg.text());
    });
    
    page.on('pageerror', error => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Tenter un login
    await page.fill('input[id="email"]', 'visitor-free@test.siport.com');
    await page.fill('input[id="password"]', 'Test@1234567');
    await page.click('button[type="submit"], button:has-text("Se connecter")');
    await page.waitForTimeout(5000);
    
    // Screenshot debug
    await page.screenshot({ path: 'e2e/test-results/step4-debug.png', fullPage: true });
    
    console.log('\n=== ERREURS CONSOLE ===');
    consoleErrors.forEach(e => console.log(`❌ ${e}`));
    
    console.log('\n=== WARNINGS CONSOLE ===');
    consoleWarnings.forEach(w => console.log(`⚠️ ${w}`));
    
    console.log(`\n📊 Total: ${consoleErrors.length} erreurs, ${consoleWarnings.length} warnings`);
  });

  test('STEP 5: Vérifier les requêtes réseau échouées', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('requestfailed', request => {
      failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    });
    
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.fill('input[id="email"]', 'visitor-free@test.siport.com');
    await page.fill('input[id="password"]', 'Test@1234567');
    await page.click('button[type="submit"], button:has-text("Se connecter")');
    await page.waitForTimeout(5000);
    
    console.log('\n=== REQUÊTES ÉCHOUÉES ===');
    if (failedRequests.length === 0) {
      console.log('✅ Aucune requête échouée');
    } else {
      failedRequests.forEach(r => console.log(`❌ ${r}`));
    }
  });

  test('STEP 6: Test avec credentials invalides (doit afficher erreur)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.fill('input[id="email"]', 'fake@fake.com');
    await page.fill('input[id="password"]', 'wrongpassword');
    await page.click('button[type="submit"], button:has-text("Se connecter")');
    await page.waitForTimeout(3000);
    
    // Vérifier qu'on reste sur login et qu'il y a un message d'erreur
    const url = page.url();
    console.log(`📍 URL: ${url}`);
    
    const hasErrorMessage = await page.locator('text=/Invalid|Erreur|incorrect|invalide/i').count() > 0;
    console.log(`📛 Message d'erreur affiché: ${hasErrorMessage}`);
    
    await page.screenshot({ path: 'e2e/test-results/step6-invalid-login.png' });
  });
});
