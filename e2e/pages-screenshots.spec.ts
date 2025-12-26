import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots', 'pages-screenshots');

// Créer le dossier de screenshots s'il n'existe pas
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Fonction utilitaire pour prendre un screenshot
async function takeScreenshot(page, name: string) {
  const filename = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`✓ Screenshot saved: ${name}`);
}

test.describe('Pages Screenshots', () => {
  test('capture public pages', async ({ page }) => {
    // HOME
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '01-home');

    // EXHIBITORS
    await page.goto('/exhibitors');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '02-exhibitors');

    // PARTNERS
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '03-partners');

    // NEWS
    await page.goto('/news');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '04-news');

    // MEDIA
    await page.goto('/media');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '05-media');

    // NETWORKING
    await page.goto('/networking');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '06-networking');

    // CONTACT
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '07-contact');

    // VENUE
    await page.goto('/venue');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '08-venue');

    // PARTNERSHIP
    await page.goto('/partnership');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '09-partnership');

    // SUPPORT
    await page.goto('/support');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '10-support');

    // PRIVACY
    await page.goto('/privacy');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '11-privacy');

    // TERMS
    await page.goto('/terms');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '12-terms');

    // COOKIES
    await page.goto('/cookies');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '13-cookies');
  });

  test('capture auth pages', async ({ page }) => {
    // LOGIN
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '20-login');

    // REGISTER
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '21-register');

    // FORGOT PASSWORD
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '22-forgot-password');

    // UNAUTHORIZED
    await page.goto('/unauthorized');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '23-unauthorized');

    // FORBIDDEN
    await page.goto('/forbidden');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '24-forbidden');
  });

  test('capture registration pages', async ({ page }) => {
    // VISITOR FREE REGISTRATION
    await page.goto('/visitor/register/free');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '30-visitor-free-registration');

    // VISITOR VIP REGISTRATION
    await page.goto('/visitor/register/vip');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '31-visitor-vip-registration');

    // EXHIBITOR REGISTRATION
    await page.goto('/register/exhibitor');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '32-exhibitor-registration');

    // PARTNER REGISTRATION
    await page.goto('/register/partner');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '33-partner-registration');

    // VISITOR SUBSCRIPTION
    await page.goto('/visitor/subscription');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '34-visitor-subscription');

    // PARTNER UPGRADE
    await page.goto('/partner/upgrade');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '35-partner-upgrade');
  });

  test('capture media pages', async ({ page }) => {
    // WEBINARS
    await page.goto('/media/webinars');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '40-webinars');

    // PODCASTS
    await page.goto('/media/podcasts');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '41-podcasts');

    // INSIDE SIPORT
    await page.goto('/media/inside-siport');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '42-inside-siport');

    // TESTIMONIALS
    await page.goto('/media/testimonials');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '43-testimonials');

    // BEST MOMENTS
    await page.goto('/media/best-moments');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '44-best-moments');
  });

  test('capture other important pages', async ({ page }) => {
    // BADGE
    await page.goto('/badge');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '50-badge');

    // BADGE DIGITAL
    await page.goto('/badge/digital');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '51-badge-digital');

    // BADGE SCANNER
    await page.goto('/badge/scanner');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '52-badge-scanner');

    // AVAILABILITY SETTINGS
    await page.goto('/availability/settings');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '53-availability-settings');

    // API PAGE
    await page.goto('/api');
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '54-api');
  });
});
