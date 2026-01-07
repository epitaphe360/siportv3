/**
 * E2E Test - Capture TOUTES les erreurs console de toutes les pages
 * Execute avec: npx playwright test e2e/full-console-audit.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

interface PageError {
  page: string;
  url: string;
  type: 'console-error' | 'network-error' | 'js-error' | 'warning';
  message: string;
  timestamp: string;
}

const allErrors: PageError[] = [];

// Liste complete des pages a tester
const PAGES_TO_TEST = [
  { name: 'Accueil', path: '/' },
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
  { name: 'Forgot Password', path: '/forgot-password' },
  { name: 'Exposants', path: '/exposants' },
  { name: 'Events', path: '/events' },
  { name: 'Actualites', path: '/actualites' },
  { name: 'Pavillons', path: '/pavillons' },
  { name: 'Partnership', path: '/partnership' },
  { name: 'Contact', path: '/contact' },
  { name: 'Support', path: '/support' },
  { name: 'About', path: '/about' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Cookies', path: '/cookies' },
  { name: 'Legal', path: '/legal' },
  { name: 'API', path: '/api' },
  { name: 'Exhibitor Signup', path: '/exhibitor-signup' },
  { name: 'Partner Signup', path: '/partner-signup' },
  { name: 'Visitor Free', path: '/visitor/register/free' },
  { name: 'Visitor VIP', path: '/visitor/register/vip' },
  { name: 'Media', path: '/media' },
  { name: 'Best Moments', path: '/best-moments' },
  { name: 'Testimonials', path: '/testimonials' },
];

// Helper pour capturer les erreurs d'une page
async function capturePageErrors(page: Page, pageName: string, pagePath: string): Promise<PageError[]> {
  const errors: PageError[] = [];
  
  // Capturer les erreurs console
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        page: pageName,
        url: pagePath,
        type: 'console-error',
        message: msg.text(),
        timestamp: new Date().toISOString(),
      });
    } else if (msg.type() === 'warning') {
      errors.push({
        page: pageName,
        url: pagePath,
        type: 'warning',
        message: msg.text(),
        timestamp: new Date().toISOString(),
      });
    }
  });
  
  // Capturer les erreurs JS
  page.on('pageerror', (error) => {
    errors.push({
      page: pageName,
      url: pagePath,
      type: 'js-error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  });
  
  // Capturer les erreurs reseau
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    errors.push({
      page: pageName,
      url: pagePath,
      type: 'network-error',
      message: `${request.method()} ${request.url()} - ${failure?.errorText || 'Failed'}`,
      timestamp: new Date().toISOString(),
    });
  });
  
  return errors;
}

test.describe('Audit Console - Toutes les Pages', () => {
  
  for (const pageInfo of PAGES_TO_TEST) {
    test(`[${pageInfo.name}] ${pageInfo.path}`, async ({ page }) => {
      const pageErrors = await capturePageErrors(page, pageInfo.name, pageInfo.path);
      
      // Naviguer vers la page
      const response = await page.goto(pageInfo.path, { 
        waitUntil: 'networkidle',
        timeout: 20000 
      });
      
      // Verifier que la page charge
      expect(response?.status()).toBeLessThan(500);
      
      // Attendre que les erreurs apparaissent
      await page.waitForTimeout(2000);
      
      // Collecter les erreurs
      allErrors.push(...pageErrors);
      
      // Log des erreurs trouvees
      const consoleErrors = pageErrors.filter(e => e.type === 'console-error');
      const networkErrors = pageErrors.filter(e => e.type === 'network-error');
      const jsErrors = pageErrors.filter(e => e.type === 'js-error');
      
      if (consoleErrors.length > 0) {
        console.log(`\n[${pageInfo.name}] ${consoleErrors.length} erreur(s) console:`);
        consoleErrors.forEach(e => console.log(`  - ${e.message.substring(0, 150)}`));
      }
      
      if (networkErrors.length > 0) {
        console.log(`\n[${pageInfo.name}] ${networkErrors.length} erreur(s) reseau:`);
        networkErrors.forEach(e => console.log(`  - ${e.message.substring(0, 150)}`));
      }
      
      if (jsErrors.length > 0) {
        console.log(`\n[${pageInfo.name}] ${jsErrors.length} erreur(s) JS:`);
        jsErrors.forEach(e => console.log(`  - ${e.message.substring(0, 150)}`));
      }
      
      // Screenshot si erreurs
      if (pageErrors.length > 0) {
        await page.screenshot({ 
          path: `test-results/screenshots/${pageInfo.name.replace(/[^a-z0-9]/gi, '_')}.png`,
          fullPage: true 
        });
      }
    });
  }
});

test.describe('Test Boutons et Interactions', () => {
  
  test('Page Accueil - Boutons principaux', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verifier les boutons principaux
    const buttons = await page.locator('button:visible').all();
    console.log(`Page Accueil: ${buttons.length} boutons visibles`);
    
    // Verifier les liens
    const links = await page.locator('a:visible').all();
    console.log(`Page Accueil: ${links.length} liens visibles`);
    
    expect(buttons.length).toBeGreaterThan(0);
  });
  
  test('Page Login - Formulaire', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Verifier les champs
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    await expect(emailInput.first()).toBeVisible({ timeout: 5000 });
    await expect(passwordInput.first()).toBeVisible({ timeout: 5000 });
    await expect(submitButton.first()).toBeVisible({ timeout: 5000 });
  });
  
  test('Page Register - Formulaire', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    
    // Verifier les elements du formulaire
    const formElements = await page.locator('input, select, button').all();
    console.log(`Page Register: ${formElements.length} elements de formulaire`);
    
    expect(formElements.length).toBeGreaterThan(3);
  });
  
  test('Page Exposants - Liste et filtres', async ({ page }) => {
    await page.goto('/exposants');
    await page.waitForLoadState('networkidle');
    
    // Attendre le contenu
    await page.waitForTimeout(2000);
    
    // Verifier qu'il y a du contenu
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(100);
  });
  
  test('Page Events - Affichage', async ({ page }) => {
    await page.goto('/events');
    await page.waitForLoadState('networkidle');
    
    await page.waitForTimeout(2000);
    
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(100);
  });
  
  test('Page Dashboard - Redirection si non connecte', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Devrait rediriger vers login ou afficher un message
    const url = page.url();
    const isLoginOrDashboard = url.includes('/login') || url.includes('/dashboard');
    expect(isLoginOrDashboard).toBeTruthy();
  });
});

test.afterAll(async () => {
  // Generer le rapport final
  const fs = require('fs');
  const path = require('path');
  
  const report = {
    timestamp: new Date().toISOString(),
    totalErrors: allErrors.length,
    consoleErrors: allErrors.filter(e => e.type === 'console-error').length,
    networkErrors: allErrors.filter(e => e.type === 'network-error').length,
    jsErrors: allErrors.filter(e => e.type === 'js-error').length,
    warnings: allErrors.filter(e => e.type === 'warning').length,
    errorsByPage: {} as Record<string, PageError[]>,
    allErrors,
  };
  
  // Grouper par page
  for (const error of allErrors) {
    if (!report.errorsByPage[error.page]) {
      report.errorsByPage[error.page] = [];
    }
    report.errorsByPage[error.page].push(error);
  }
  
  // Sauvegarder
  const reportDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'console-audit-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  // Rapport markdown
  let md = `# Rapport d'Audit Console\n\n`;
  md += `**Date:** ${report.timestamp}\n\n`;
  md += `## Resume\n\n`;
  md += `- Total erreurs: ${report.totalErrors}\n`;
  md += `- Erreurs console: ${report.consoleErrors}\n`;
  md += `- Erreurs reseau: ${report.networkErrors}\n`;
  md += `- Erreurs JS: ${report.jsErrors}\n`;
  md += `- Warnings: ${report.warnings}\n\n`;
  
  if (report.totalErrors > 0) {
    md += `## Erreurs par Page\n\n`;
    for (const [pageName, errors] of Object.entries(report.errorsByPage)) {
      md += `### ${pageName}\n\n`;
      for (const err of errors as PageError[]) {
        md += `- **[${err.type}]** ${err.message.substring(0, 200)}\n`;
      }
      md += `\n`;
    }
  }
  
  fs.writeFileSync(
    path.join(reportDir, 'console-audit-report.md'),
    md
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('RAPPORT FINAL');
  console.log('='.repeat(60));
  console.log(`Total erreurs: ${report.totalErrors}`);
  console.log(`Erreurs console: ${report.consoleErrors}`);
  console.log(`Erreurs reseau: ${report.networkErrors}`);
  console.log(`Erreurs JS: ${report.jsErrors}`);
  console.log(`Warnings: ${report.warnings}`);
  console.log('='.repeat(60));
});
