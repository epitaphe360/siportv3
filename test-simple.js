/**
 * Script de test simplifié - Version rapide
 * Test des pages principales et capture des erreurs
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9323';

// Pages à tester
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/register', name: 'Register' },
  { path: '/exhibitors', name: 'Exhibitors' },
  { path: '/products', name: 'Products' },
  { path: '/subscription', name: 'Subscription' },
  { path: '/contact', name: 'Contact' },
];

async function testPages() {
  console.log('\n========================================');
  console.log('TEST RAPIDE DES PAGES PRINCIPALES');
  console.log('========================================\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  const errors = [];
  
  // Capturer les erreurs console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'error',
        text: msg.text(),
        url: page.url()
      });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({
      type: 'crash',
      text: error.message,
      url: page.url()
    });
  });
  
  page.on('requestfailed', request => {
    errors.push({
      type: 'network',
      text: `Failed: ${request.url()}`,
      url: page.url()
    });
  });

  // Tester chaque page
  for (const { path: pagePath, name } of PAGES) {
    try {
      console.log(`\nTest: ${name} (${pagePath})`);
      const start = Date.now();
      
      await page.goto(`${BASE_URL}${pagePath}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      await page.waitForTimeout(2000);
      
      const loadTime = Date.now() - start;
      console.log(`  ✓ Chargé en ${loadTime}ms`);
      
      // Prendre une capture
      const screenshotDir = path.join(process.cwd(), 'test-screenshots');
      if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir, { recursive: true });
      }
      
      await page.screenshot({ 
        path: path.join(screenshotDir, `${name.replace(/\s+/g, '-')}.png`),
        fullPage: true 
      });
      
    } catch (error) {
      console.log(`  ✗ Erreur: ${error.message}`);
      errors.push({
        type: 'crash',
        text: error.message,
        url: `${BASE_URL}${pagePath}`
      });
    }
  }

  await browser.close();

  // Rapport final
  console.log('\n========================================');
  console.log('RÉSUMÉ');
  console.log('========================================');
  console.log(`Pages testées: ${PAGES.length}`);
  console.log(`Erreurs détectées: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\nERREURS:');
    errors.forEach((err, i) => {
      console.log(`\n${i + 1}. [${err.type.toUpperCase()}]`);
      console.log(`   ${err.text}`);
      console.log(`   Sur: ${err.url}`);
    });
    
    // Sauvegarder le rapport
    const reportPath = path.join(process.cwd(), 'test-report-simple.json');
    fs.writeFileSync(reportPath, JSON.stringify({ errors, pages: PAGES, date: new Date().toISOString() }, null, 2));
    console.log(`\nRapport sauvegardé: ${reportPath}`);
  } else {
    console.log('\n✓ Aucune erreur détectée!');
  }
  
  console.log('\n========================================\n');
}

testPages().catch(console.error);
