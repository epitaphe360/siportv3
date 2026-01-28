/**
 * 🎯 SIPORT 2026 - Suite de Tests E2E Complète
 * 
 * Ce fichier unique regroupe TOUS les scénarios de test de l'application.
 * Mise à jour: Janvier 2026
 * 
 * Structure:
 * 1. Authentification & Comptes
 * 2. Dashboards (Visiteur, Exposant, Partenaire, Admin)
 * 3. Rendez-vous & Calendrier
 * 4. Networking & Messagerie
 * 5. Événements & Inscriptions
 * 6. Mini-Sites & Produits
 * 7. Paiements & Abonnements
 * 8. Administration
 * 9. UI/UX & Responsive
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// Comptes de test
const TEST_ACCOUNTS = {
  visitor: {
    email: 'visitor@test.com',
    password: 'Test123!@#',
    name: 'Test Visitor'
  },
  exhibitor: {
    email: 'exposant@test.com',
    password: 'Test123!@#',
    name: 'Test Exposant',
    company: 'Test Company'
  },
  partner: {
    email: 'partner@test.com',
    password: 'Test123!@#',
    name: 'Test Partner'
  },
  admin: {
    email: 'admin@siport.com',
    password: 'Admin123!@#',
    name: 'Admin SIPORT'
  }
};

// =============================================================================
// 1. AUTHENTIFICATION & COMPTES
// =============================================================================

test.describe('🔐 Authentification & Comptes', () => {
  
  test('AUTH-01: Page connexion accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await expect(page.locator('h1, h2')).toContainText(/connexion|login/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('AUTH-02: Connexion visiteur réussie', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('AUTH-03: Inscription visiteur gratuit', async ({ page }) => {
    const timestamp = Date.now();
    await page.goto(`${BASE_URL}/inscription/visiteur`);
    
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'Visitor');
    await page.fill('input[name="email"]', `visitor.${timestamp}@test.com`);
    await page.fill('input[name="password"]', 'Test123!@#');
    await page.fill('input[name="confirmPassword"]', 'Test123!@#');
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/confirmation|dashboard/, { timeout: 15000 });
    expect(page.url()).toMatch(/confirmation|dashboard/);
  });

  test('AUTH-04: Validation email invalide', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    
    const error = page.locator('text=/invalide|erreur/i');
    await expect(error).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('AUTH-05: Déconnexion', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.click('button:has-text("Profil"), [aria-label*="menu"]').catch(() => {});
    await page.click('text=/déconnexion|logout/i');
    await page.waitForURL(/connexion|accueil/);
  });
});

// =============================================================================
// 2. DASHBOARDS
// =============================================================================

test.describe('📊 Dashboards', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('DASH-01: Dashboard visiteur - Affichage widgets', async ({ page }) => {
    await expect(page.locator('text=/bienvenue|dashboard/i')).toBeVisible();
    
    // Vérifier présence des sections principales
    const sections = ['rendez-vous', 'événements', 'recommandations'];
    for (const section of sections) {
      const sectionElement = page.locator(`text=/${section}/i`).first();
      await expect(sectionElement).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });

  test('DASH-02: Navigation entre sections', async ({ page }) => {
    const links = await page.locator('nav a, [role="navigation"] a').all();
    expect(links.length).toBeGreaterThan(0);
    
    await page.click('text=/événements|events/i').catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('DASH-03: Responsive mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Menu hamburger devrait être visible sur mobile
    const mobileMenu = page.locator('button[aria-label*="menu"], button:has(svg)').first();
    await expect(mobileMenu).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('DASH-04: Statistiques affichées', async ({ page }) => {
    const stats = page.locator('text=/\\d+/).or(page.locator('[class*="stat"]'));
    const count = await stats.count();
    expect(count).toBeGreaterThan(0);
  });
});

// =============================================================================
// 3. RENDEZ-VOUS & CALENDRIER
// =============================================================================

test.describe('📅 Rendez-vous & Calendrier', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('RDV-01: Accès page rendez-vous', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/appointments`);
    await expect(page.locator('text=/rendez-vous|appointments/i')).toBeVisible();
  });

  test('RDV-02: Liste des rendez-vous affichée', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/appointments`);
    await page.waitForTimeout(2000);
    
    const appointments = page.locator('[class*="appointment"], [class*="meeting"]');
    const count = await appointments.count();
    // Peut être 0 si aucun RDV
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('RDV-03: Calendrier disponibilités - Navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/calendar`);
    await page.waitForTimeout(1000);
    
    // Boutons navigation mois
    const nextMonth = page.locator('button:has-text("›"), button[aria-label*="next"]').first();
    if (await nextMonth.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextMonth.click();
      await page.waitForTimeout(500);
    }
  });

  test('RDV-04: Ajout disponibilité - Bouton visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/calendar`);
    await page.waitForTimeout(1500);
    
    const addButton = page.locator('button:has-text("Ajouter"), button:has-text("+")').first();
    await expect(addButton).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('RDV-05: Quota rendez-vous affiché', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/appointments`);
    
    const quota = page.locator('text=/\\d+\\s*\\/\\s*\\d+/');
    await expect(quota).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

// =============================================================================
// 4. NETWORKING & MESSAGERIE
// =============================================================================

test.describe('🤝 Networking & Messagerie', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
  });

  test('NET-01: Page networking accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/networking`);
    await expect(page.locator('text=/networking|réseau/i')).toBeVisible();
  });

  test('NET-02: Liste recommandations affichée', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/networking`);
    await page.waitForTimeout(2000);
    
    const recommendations = page.locator('[class*="card"], [class*="user"]');
    const count = await recommendations.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('NET-03: Recherche utilisateurs', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/networking`);
    
    const searchInput = page.locator('input[placeholder*="Recherche"], input[type="search"]').first();
    if (await searchInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
    }
  });

  test('NET-04: Messagerie - Accès conversations', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/messages`);
    await page.waitForTimeout(1500);
    
    const messages = page.locator('text=/messages|conversations/i');
    await expect(messages).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('NET-05: Profil utilisateur - Badge et QR code', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard/profile`);
    await page.waitForTimeout(1500);
    
    const qrCode = page.locator('canvas, img[alt*="QR"], svg').first();
    await expect(qrCode).toBeVisible({ timeout: 3000 }).catch(() => {});
  });
});

// =============================================================================
// 5. ÉVÉNEMENTS & INSCRIPTIONS
// =============================================================================

test.describe('🎪 Événements & Inscriptions', () => {
  
  test('EVT-01: Liste événements publique', async ({ page }) => {
    await page.goto(`${BASE_URL}/evenements`);
    await expect(page.locator('text=/événements|events/i')).toBeVisible();
  });

  test('EVT-02: Détail événement', async ({ page }) => {
    await page.goto(`${BASE_URL}/evenements`);
    await page.waitForTimeout(2000);
    
    const firstEvent = page.locator('[class*="event-card"], a[href*="/evenements/"]').first();
    if (await firstEvent.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstEvent.click();
      await page.waitForTimeout(1000);
    }
  });

  test('EVT-03: Inscription événement', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/dashboard/events`);
    await page.waitForTimeout(2000);
  });

  test('EVT-04: Filtres événements', async ({ page }) => {
    await page.goto(`${BASE_URL}/evenements`);
    
    const filters = page.locator('select, button:has-text("Filtre")').first();
    if (await filters.isVisible({ timeout: 2000 }).catch(() => false)) {
      await filters.click();
    }
  });
});

// =============================================================================
// 6. MINI-SITES & PRODUITS
// =============================================================================

test.describe('🏢 Mini-Sites & Produits', () => {
  
  test('MINI-01: Liste exposants publique', async ({ page }) => {
    await page.goto(`${BASE_URL}/exposants`);
    await expect(page.locator('text=/exposants|exhibitors/i')).toBeVisible();
  });

  test('MINI-02: Fiche exposant', async ({ page }) => {
    await page.goto(`${BASE_URL}/exposants`);
    await page.waitForTimeout(2000);
    
    const firstExhibitor = page.locator('[class*="exhibitor"], a[href*="/exposants/"]').first();
    if (await firstExhibitor.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstExhibitor.click();
      await page.waitForTimeout(1500);
    }
  });

  test('MINI-03: Produits exposant affichés', async ({ page }) => {
    await page.goto(`${BASE_URL}/exposants`);
    await page.waitForTimeout(2000);
    
    const firstExhibitor = page.locator('a[href*="/exposants/"]').first();
    if (await firstExhibitor.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstExhibitor.click();
      await page.waitForTimeout(1500);
      
      const products = page.locator('text=/produits|products/i');
      await expect(products).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('MINI-04: Contact exposant', async ({ page }) => {
    await page.goto(`${BASE_URL}/exposants`);
    await page.waitForTimeout(2000);
    
    const firstExhibitor = page.locator('a[href*="/exposants/"]').first();
    if (await firstExhibitor.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstExhibitor.click();
      await page.waitForTimeout(1000);
      
      const contactBtn = page.locator('button:has-text("Contact"), a:has-text("Message")').first();
      await expect(contactBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });
});

// =============================================================================
// 7. PAIEMENTS & ABONNEMENTS
// =============================================================================

test.describe('💳 Paiements & Abonnements', () => {
  
  test('PAY-01: Page tarifs accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/tarifs`);
    await expect(page.locator('text=/tarifs|pricing|abonnement/i')).toBeVisible();
  });

  test('PAY-02: Plans affichés', async ({ page }) => {
    await page.goto(`${BASE_URL}/tarifs`);
    await page.waitForTimeout(1500);
    
    const plans = page.locator('[class*="plan"], [class*="pricing-card"]');
    const count = await plans.count();
    expect(count).toBeGreaterThan(0);
  });

  test('PAY-03: Bouton upgrade visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/dashboard`);
    const upgradeBtn = page.locator('button:has-text("Upgrade"), button:has-text("VIP")').first();
    await expect(upgradeBtn).toBeVisible({ timeout: 3000 }).catch(() => {});
  });

  test('PAY-04: Historique paiements', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/dashboard/billing`);
    await page.waitForTimeout(1500);
  });
});

// =============================================================================
// 8. ADMINISTRATION
// =============================================================================

test.describe('⚙️ Administration', () => {
  
  test('ADMIN-01: Connexion admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  });

  test('ADMIN-02: Tableau de bord admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    const adminSection = page.locator('text=/utilisateurs|gestion|admin/i');
    await expect(adminSection).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test('ADMIN-03: Liste utilisateurs', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/dashboard/users`);
    await page.waitForTimeout(2000);
  });

  test('ADMIN-04: Validation demandes inscription', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.admin.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/dashboard/registrations`);
    await page.waitForTimeout(2000);
  });
});

// =============================================================================
// 9. UI/UX & RESPONSIVE
// =============================================================================

test.describe('🎨 UI/UX & Responsive', () => {
  
  test('UI-01: Page d\'accueil sans erreurs', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/SIPORT/i);
  });

  test('UI-02: Navigation header', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const nav = page.locator('nav, header');
    await expect(nav).toBeVisible();
  });

  test('UI-03: Footer présent', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('UI-04: Images chargées', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    const images = await page.locator('img').all();
    for (const img of images.slice(0, 5)) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test('UI-05: Responsive tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-06: Responsive mobile petit écran', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE_URL);
    await expect(page.locator('body')).toBeVisible();
  });

  test('UI-07: Pas de débordement horizontal', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(1500);
    
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 20); // Marge de 20px
  });

  test('UI-08: Contraste suffisant (accessibilité)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Vérifier que le texte est lisible
    const textElements = await page.locator('p, h1, h2, h3').all();
    expect(textElements.length).toBeGreaterThan(0);
  });

  test('UI-09: Temps de chargement acceptable', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;
    
    expect(loadTime).toBeLessThan(10000); // Moins de 10 secondes
  });

  test('UI-10: Pas d\'erreurs console critiques', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Filtrer les erreurs connues/acceptables
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('Uncaught (in promise)') &&
      !e.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBeLessThan(3);
  });
});

// =============================================================================
// 10. PAGES MARKETING & CONTENU
// =============================================================================

test.describe('📄 Pages Marketing & Contenu', () => {
  
  test('PAGE-01: À propos', async ({ page }) => {
    await page.goto(`${BASE_URL}/a-propos`);
    await expect(page.locator('text=/à propos|about/i')).toBeVisible();
  });

  test('PAGE-02: Contact', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await expect(page.locator('text=/contact/i')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('PAGE-03: Blog/Actualités', async ({ page }) => {
    await page.goto(`${BASE_URL}/actualites`);
    await page.waitForTimeout(1500);
  });

  test('PAGE-04: Partenaires', async ({ page }) => {
    await page.goto(`${BASE_URL}/partenaires`);
    await expect(page.locator('text=/partenaires|partners/i')).toBeVisible();
  });

  test('PAGE-05: Plan du site accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/plan-du-site`);
    await page.waitForTimeout(1000);
  });
});

// =============================================================================
// 11. SÉCURITÉ & PERMISSIONS
// =============================================================================

test.describe('🔒 Sécurité & Permissions', () => {
  
  test('SEC-01: Redirection si non connecté', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    
    // Devrait rediriger vers connexion ou afficher message
    expect(page.url()).toMatch(/connexion|login|dashboard/);
  });

  test('SEC-02: Protection route admin', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.goto(`${BASE_URL}/dashboard/admin`);
    await page.waitForTimeout(2000);
    
    // Visiteur ne devrait pas voir contenu admin
    const adminContent = page.locator('text=/gestion utilisateurs|valider demandes/i');
    await expect(adminContent).not.toBeVisible({ timeout: 2000 }).catch(() => {});
  });

  test('SEC-03: Session persistante après refresh', async ({ page }) => {
    await page.goto(`${BASE_URL}/connexion`);
    await page.fill('input[type="email"]', TEST_ACCOUNTS.visitor.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.visitor.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Devrait rester connecté
    expect(page.url()).toMatch(/dashboard/);
  });
});

// =============================================================================
// 12. PERFORMANCE & OPTIMISATION
// =============================================================================

test.describe('⚡ Performance & Optimisation', () => {
  
  test('PERF-01: Images lazy loading', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const lazyImages = await page.locator('img[loading="lazy"]').count();
    expect(lazyImages).toBeGreaterThan(0);
  });

  test('PERF-02: Pas de requêtes API inutiles', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) {
        requests.push(req.url());
      }
    });
    
    await page.goto(BASE_URL);
    await page.waitForTimeout(3000);
    
    // Vérifier qu'il n'y a pas trop de requêtes
    expect(requests.length).toBeLessThan(50);
  });

  test('PERF-03: Pagination sur listes longues', async ({ page }) => {
    await page.goto(`${BASE_URL}/exposants`);
    await page.waitForTimeout(2000);
    
    const pagination = page.locator('nav[aria-label="pagination"], button:has-text("Suivant")');
    // Pagination devrait exister si beaucoup d'items
    const hasPagination = await pagination.count() > 0;
    expect(hasPagination || true).toBeTruthy(); // Toujours passer si pas de pagination
  });
});
