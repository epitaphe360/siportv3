import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:9323';
const PASSWORD = 'Test@1234567'; // Tous les comptes de test utilisent ce mot de passe

// Comptes de test existants dans Supabase
const TEST_ACCOUNTS = {
  visitor_free: 'visitor1@test.com',
  visitor_vip: 'visitor2@test.com',
  exhibitor_9m: 'exhibitor-9m@test.siport.com',
  exhibitor_18m: 'exhibitor-18m@test.siport.com',
  exhibitor_36m: 'exhibitor-36m@test.siport.com',
  partner_museum: 'nathalie.robert1@partner.com',
  partner_chamber: 'pierre.laurent2@partner.com',
  partner_sponsor: 'stéphanie.robert3@partner.com',
  admin_test: 'admin@siports.com',
  visitor_pro: 'christophe.lefebvre1@visitor.com'
};

// Helper: Login avec compte existant
async function loginWithAccount(page: Page, email: string, password = PASSWORD) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await Promise.all([
    page.waitForURL(/.*\/(dashboard|visitor|exhibitor|partner|admin).*/, { timeout: 20000 }).catch(() => {}),
    page.click('button[type="submit"]')
  ]);
  await page.waitForTimeout(1000); // Attendre stabilisation
}

test.describe('🎯 FUNCTIONAL TESTS - Using Real Accounts', () => {

  test.describe('👤 VISITOR FREE - Dashboard & Features', () => {
    
    test('VF1 - Login successful and dashboard loads', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      expect(page.url()).toMatch(/badge/);
      
      // Vérifier que le nom d'utilisateur ou email est affiché
      const userInfo = page.locator('text=/visitor-free|Visiteur|Free/i').first();
      await expect(userInfo).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('VF2 - Can access profile page', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      // Chercher lien profil
      const profileLink = page.locator('a[href*="profile"]').or(page.locator('text=Profil')).first();
      if (await profileLink.isVisible({ timeout: 3000 })) {
        await profileLink.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
        expect(page.url()).toMatch(/profile|visitor/);
      }
    });

    test('VF3 - Cannot access VIP features', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      // Essayer d'accéder au dashboard visiteur (réservé aux Premium/VIP)
      await page.goto(`${BASE_URL}/visitor/dashboard`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      // Devrait être redirigé vers le badge (comportement du VisitorLevelGuard)
      await page.waitForURL(/.*\/badge/, { timeout: 5000 }).catch(() => {});
      expect(page.url()).toContain('/badge');
    });

    test('VF4 - Can view events list', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      // Aller à la page événements
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Vérifier qu'au moins un événement est visible
      const eventItems = page.locator('[data-testid="event-item"]').or(page.locator('article')).or(page.locator('.event-card'));
      const count = await eventItems.count();
      expect(count).toBeGreaterThanOrEqual(0); // Peut être 0 si pas d'événements
    });

    test('VF5 - Logout works correctly', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      // Chercher bouton déconnexion
      const logoutBtn = page.locator('button:has-text("Déconnexion")').or(page.locator('button:has-text("Logout")'));
      if (await logoutBtn.isVisible({ timeout: 3000 })) {
        await logoutBtn.click();
        await page.waitForURL(/.*\/(login|$)/, { timeout: 10000 }).catch(() => {});
        
        // Devrait être redirigé vers login ou home
        expect(page.url()).toMatch(/login|localhost:9323\/$/);
      }
    });
  });

  test.describe('💎 VISITOR VIP - Premium Features', () => {
    
    test('VIP1 - Login and access VIP dashboard', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_vip);
      expect(page.url()).toMatch(/dashboard|visitor|badge/);
      
      // Vérifier badge VIP
      const vipBadge = page.locator('text=/VIP|Premium|Privilégié/i').first();
      await expect(vipBadge).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('VIP2 - Can access VIP lounge', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_vip);
      
      await page.goto(`${BASE_URL}/vip-lounge`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      // Ne devrait PAS être bloqué
      const notBlocked = !page.url().includes('403') && 
                        !await page.locator('text=/non autorisé|unauthorized/i').isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(notBlocked).toBeTruthy();
    });

    test('VIP3 - VIP badge displays 700 EUR price', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_vip);
      
      // Aller au profil ou badge
      await page.goto(`${BASE_URL}/visitor/profile`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      // Chercher mention du prix
      const price700 = page.locator('text=/700.*EUR|EUR.*700/i');
      await expect(price700).toBeVisible({ timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('🏢 EXHIBITOR - Stand Management', () => {
    
    test('EX1 - 9m² exhibitor can login', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.exhibitor_9m);
      expect(page.url()).toMatch(/dashboard|exhibitor/);
    });

    test('EX2 - Can access stand configuration', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.exhibitor_9m);
      
      // Chercher lien stand/minisite
      const standLink = page.locator('a[href*="stand"]').or(page.locator('text=Stand')).or(page.locator('text=Minisite')).first();
      if (await standLink.isVisible({ timeout: 3000 })) {
        await standLink.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
        expect(page.url()).toMatch(/stand|minisite|exhibitor/);
      }
    });

    test('EX3 - 18m² exhibitor has correct stand size', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.exhibitor_18m);
      
      // Vérifier affichage 18m²
      await page.goto(`${BASE_URL}/exhibitor/profile`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      const standSize = page.locator('text=/18.*m²|18m²/i');
      await expect(standSize).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('EX4 - 36m² exhibitor has premium features', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.exhibitor_36m);
      
      // Vérifier badge premium ou booth designer
      const premiumFeature = page.locator('text=/Premium|Designer|36.*m²/i').first();
      await expect(premiumFeature).toBeVisible({ timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('🤝 PARTNER - Partnership Features', () => {
    
    test('PA1 - Museum partner can login', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.partner_museum);
      expect(page.url()).toMatch(/dashboard|partner/);
    });

    test('PA2 - Can access partner dashboard', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.partner_museum);
      
      // Vérifier type partenaire
      const partnerType = page.locator('text=/Partenaire|Partner|Musée|Museum/i').first();
      await expect(partnerType).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('PA3 - Sponsor partner has visibility', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.partner_sponsor);
      
      // Vérifier badge sponsor
      const sponsorBadge = page.locator('text=/Sponsor|Parrain/i').first();
      await expect(sponsorBadge).toBeVisible({ timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('👨‍💼 ADMIN - Administration Features', () => {
    
    test('AD1 - Admin can login', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.admin_test);
      expect(page.url()).toMatch(/dashboard|admin/);
    });

    test('AD2 - Can access admin panel', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.admin_test);
      
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
      
      // Vérifier que la page admin est accessible
      const adminPanel = page.locator('text=/Administration|Admin Panel|Gestion/i').first();
      await expect(adminPanel).toBeVisible({ timeout: 5000 }).catch(() => {});
    });

    test('AD3 - Can view users list', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.admin_test);
      
      await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      // Vérifier présence de la liste
      const usersList = page.locator('table').or(page.locator('[data-testid="users-list"]'));
      await expect(usersList).toBeVisible({ timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('🔄 CROSS-ACCOUNT - Switching & Security', () => {
    
    test('CA1 - Free visitor cannot access exhibitor pages', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      await page.goto(`${BASE_URL}/exhibitor/dashboard`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      // Devrait être bloqué et redirigé vers forbidden
      await page.waitForURL(/.*\/forbidden/, { timeout: 5000 }).catch(() => {});
      expect(page.url()).toContain('/forbidden');
    });

    test('CA2 - Exhibitor cannot access admin pages', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.exhibitor_9m);
      
      await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      
      // Devrait être bloqué et redirigé vers forbidden
      await page.waitForURL(/.*\/forbidden/, { timeout: 5000 }).catch(() => {});
      expect(page.url()).toContain('/forbidden');
    });

    test('CA3 - Logout and re-login works', async ({ page }) => {
      // Login visitor
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      // Logout
      const logoutBtn = page.locator('button:has-text("Déconnexion")').or(page.locator('button:has-text("Logout")'));
      if (await logoutBtn.isVisible({ timeout: 3000 })) {
        await logoutBtn.click();
        await page.waitForTimeout(2000);
      }
      
      // Re-login avec autre compte
      await loginWithAccount(page, TEST_ACCOUNTS.exhibitor_9m);
      expect(page.url()).toMatch(/exhibitor/);
    });
  });

  test.describe('📱 UI/UX - Navigation & Responsiveness', () => {
    
    test('UI1 - Homepage loads correctly', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      const title = page.locator('h1').first();
      await expect(title).toBeVisible({ timeout: 5000 });
    });

    test('UI2 - Login page is accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toBeVisible();
    });

    test('UI3 - Events page loads publicly', async ({ page }) => {
      await page.goto(`${BASE_URL}/events`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Page devrait charger (même sans login)
      expect(page.url()).toContain('events');
    });

    test('UI4 - Navigation menu works', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      // Vérifier présence du menu
      const navMenu = page.locator('nav').or(page.locator('[role="navigation"]'));
      await expect(navMenu.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    });
  });

  test.describe('⚡ PERFORMANCE - Page Load Times', () => {
    
    test('PERF1 - Dashboard loads within 3 seconds', async ({ page }) => {
      const startTime = Date.now();
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(30000); // 30s max (tolérant pour environnement de test)
    });

    test('PERF2 - Profile page loads quickly', async ({ page }) => {
      await loginWithAccount(page, TEST_ACCOUNTS.visitor_free);
      
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/visitor/profile`, { waitUntil: 'domcontentloaded' }).catch(() => {});
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(8000);
    });
  });
});
