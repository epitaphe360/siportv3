import { test, expect, devices } from '@playwright/test';
import { testUsers, login } from './helpers';

// Configure timeouts
test.setTimeout(120000); // 120 secondes par test

/**
 * ============================================================================
 * TESTS E2E: MOBILE & RESPONSIVE
 * ============================================================================
 */

// Configuration mobile
test.use(devices['iPhone 12']);

test.describe('12. MOBILE & RESPONSIVE', () => {

  test('12.1 - Navigation mobile : Menu hamburger', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Ouvrir le menu hamburger
    await page.click('[data-testid="mobile-menu-button"]');

    // Vérifier que le menu est ouvert
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Vérifier les liens du menu
    await expect(page.locator('[data-testid="mobile-menu"] a:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"] a:has-text("Événements")')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu"] a:has-text("Exposants")')).toBeVisible();

    // Fermer le menu
    await page.click('[data-testid="mobile-menu-close"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).not.toBeVisible();
  });

  test('12.2 - Navigation mobile : Swipe entre pages', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Swipe vers la gauche (simulé avec touch)
    const eventsList = page.locator('[data-testid="events-list"]');
    await eventsList.evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 300, clientY: 100 } as Touch] }));
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 100, clientY: 100 } as Touch] }));
      el.dispatchEvent(new TouchEvent('touchend'));
    });

    // Vérifier le changement de contenu
    await page.waitForTimeout(500);
    await expect(eventsList).toBeVisible();
  });

  test('12.3 - Formulaire mobile : Inscription', async ({ page }) => {
    await page.goto('/register');

    // Viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Remplir le formulaire
    await page.fill('input[name="email"]', `mobile_user_${Date.now()}@test.com`);
    await page.fill('input[name="password"]', 'Mobile123!@#');
    await page.fill('input[name="confirmPassword"]', 'Mobile123!@#');
    await page.fill('input[name="firstName"]', 'Mobile');
    await page.fill('input[name="lastName"]', 'User');

    // Scroll pour voir le reste du formulaire
    await page.evaluate(() => window.scrollBy(0, 200));

    await page.click('[data-testid="user-type-visitor"]');
    await page.check('input[name="acceptTerms"]');

    // Soumettre
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Bienvenue')).toBeVisible({ timeout: 10000 });
  });

  test('12.4 - Touch interactions : Tap et long press', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Tap sur une carte
    const firstCard = page.locator('[data-testid="exhibitor-card"]').first();
    await firstCard.tap();

    // Vérifier la navigation
    await expect(page).toHaveURL(/.*\/exhibitor\/.*/);

    // Retour
    await page.goBack();

    // Long press (simulé)
    await firstCard.evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 100, clientY: 100 } as Touch] }));
    });
    await page.waitForTimeout(1000);
    await firstCard.evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchend'));
    });

    // Vérifier le menu contextuel
    await expect(page.locator('[data-testid="context-menu"]')).toBeVisible();
  });

  test('12.5 - Mobile : Upload photo de profil', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/profile/edit');

    // Simuler l'upload depuis mobile (capture photo)
    await page.click('button:has-text("Changer la photo")');

    // Sur mobile, on a le choix entre appareil photo et galerie
    await expect(page.locator('button:has-text("Prendre une photo")')).toBeVisible();
    await expect(page.locator('button:has-text("Choisir depuis galerie")')).toBeVisible();

    // Choisir depuis galerie (simulé avec un fichier)
    await page.click('button:has-text("Choisir depuis galerie")');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('./tests/fixtures/avatar-mobile.jpg');

    await expect(page.locator('text=Photo mise à jour')).toBeVisible();
  });

  test('12.6 - Mobile : Chat avec notifications', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/chat');

    // Ouvrir une conversation
    await page.click('[data-testid="conversation"]').first();

    // Envoyer un message
    await page.fill('input[name="message"]', 'Message depuis mobile');

    // Sur mobile, on utilise souvent le bouton d'envoi plutôt que Enter
    await page.click('button[aria-label="Send"]');

    await expect(page.locator('text=Message depuis mobile')).toBeVisible();
  });

  test('12.7 - Mobile : Géolocalisation pour événements proches', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    // Simuler l'autorisation de géolocalisation
    await page.context().grantPermissions(['geolocation']);
    await page.setGeolocation({ latitude: 33.5731, longitude: -7.5898 }); // Casablanca

    await page.goto('/events/nearby');

    // Vérifier que la géolocalisation fonctionne
    await expect(page.locator('[data-testid="nearby-events"]')).toBeVisible();
    await expect(page.locator('text=Événements à proximité')).toBeVisible();
  });

  test('12.8 - Mobile : Scanner QR code', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/scan-qr');

    // Sur mobile, on a accès à la caméra pour scanner
    await page.click('button:has-text("Activer la caméra")');

    // Simuler l'autorisation caméra
    await page.context().grantPermissions(['camera']);

    // Simuler la saisie manuelle du code (car on ne peut pas scanner vraiment)
    await page.click('button:has-text("Entrer le code manuellement")');
    await page.fill('input[name="qrCode"]', 'SIPORT2026-VISITOR-12345');
    await page.click('button:has-text("Valider")');

    await expect(page.locator('text=Code validé')).toBeVisible();
  });

  test('12.9 - Mobile : Calendrier avec vue journalière', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Sur mobile, la vue par défaut est souvent "jour"
    await expect(page.locator('[data-testid="calendar-view-day"]')).toBeVisible();

    // Swipe pour changer de jour
    const calendar = page.locator('[data-testid="calendar"]');
    await calendar.evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 300, clientY: 200 } as Touch] }));
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 100, clientY: 200 } as Touch] }));
      el.dispatchEvent(new TouchEvent('touchend'));
    });

    // Attendre le changement
    await page.waitForTimeout(500);
  });

  test('12.10 - Mobile : Bottom navigation', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Vérifier la navigation en bas
    await expect(page.locator('[data-testid="bottom-nav"]')).toBeVisible();

    // Vérifier les onglets
    await expect(page.locator('[data-testid="bottom-nav"] button[data-tab="home"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottom-nav"] button[data-tab="events"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottom-nav"] button[data-tab="chat"]')).toBeVisible();
    await expect(page.locator('[data-testid="bottom-nav"] button[data-tab="profile"]')).toBeVisible();

    // Naviguer entre les onglets
    await page.click('[data-testid="bottom-nav"] button[data-tab="events"]');
    await expect(page).toHaveURL(/.*\/events/);

    await page.click('[data-testid="bottom-nav"] button[data-tab="chat"]');
    await expect(page).toHaveURL(/.*\/chat/);
  });

  test('12.11 - Mobile : Pull to refresh', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Simuler le pull to refresh
    const content = page.locator('[data-testid="dashboard-content"]');
    await content.evaluate(el => {
      el.dispatchEvent(new TouchEvent('touchstart', { touches: [{ clientX: 200, clientY: 100 } as Touch] }));
      el.dispatchEvent(new TouchEvent('touchmove', { touches: [{ clientX: 200, clientY: 300 } as Touch] }));
      el.dispatchEvent(new TouchEvent('touchend'));
    });

    // Vérifier l'indicateur de rafraîchissement
    await expect(page.locator('[data-testid="refresh-indicator"]')).toBeVisible({ timeout: 5000 });

    // Attendre la fin du rafraîchissement
    await page.waitForTimeout(2000);
  });

  test('12.12 - Mobile : Keyboard avoidance', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/chat');

    // Ouvrir une conversation
    await page.click('[data-testid="conversation"]').first();

    // Focus sur l'input (ouvre le clavier virtuel)
    await page.click('input[name="message"]');

    // Vérifier que le contenu remonte
    const messageInput = page.locator('input[name="message"]');
    const boundingBox = await messageInput.boundingBox();

    // L'input devrait être visible au-dessus du clavier
    expect(boundingBox?.y).toBeLessThan(500);
  });

  test('12.13 - Tablet : Split view', async ({ page }) => {
    // Passer en mode tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Sur tablette, on peut avoir une vue divisée (liste + détails)
    await page.click('[data-testid="exhibitor-card"]').first();

    // Vérifier que la vue est divisée
    await expect(page.locator('[data-testid="exhibitors-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="exhibitor-details"]')).toBeVisible();
  });

  test('12.14 - Responsive : Breakpoints', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Test mobile (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

    // Test tablet (768px)
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Test desktop (1920px)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="full-sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-grid"]')).toHaveClass(/grid-cols-3/);
  });

  test('12.15 - Mobile : Offline mode', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/dashboard');

    // Passer en mode offline
    await page.context().setOffline(true);

    // Tenter de charger une page
    await page.goto('/events');

    // Vérifier le message offline
    await expect(page.locator('text=Vous êtes hors ligne')).toBeVisible();

    // Vérifier que le contenu en cache est disponible
    await expect(page.locator('[data-testid="cached-content"]')).toBeVisible();

    // Repasser en ligne
    await page.context().setOffline(false);

    // Rafraîchir
    await page.reload();

    // Vérifier que tout fonctionne
    await expect(page.locator('[data-testid="events-list"]')).toBeVisible();
  });

  test('12.16 - Mobile : Share functionality', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Ouvrir un exposant
    await page.click('[data-testid="exhibitor-card"]').first();

    // Cliquer sur partager
    await page.click('button[aria-label="Share"]');

    // Sur mobile, on a différentes options de partage
    await expect(page.locator('[data-testid="share-menu"]')).toBeVisible();
    await expect(page.locator('text=WhatsApp')).toBeVisible();
    await expect(page.locator('text=Email')).toBeVisible();
    await expect(page.locator('text=Copier le lien')).toBeVisible();

    // Copier le lien
    await page.click('button:has-text("Copier le lien")');
    await expect(page.locator('text=Lien copié')).toBeVisible();
  });

  test('12.17 - Mobile : Orientation change', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/events');

    // Portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="events-list"]')).toBeVisible();

    // Passer en paysage
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(500);

    // Vérifier que le layout s'adapte
    await expect(page.locator('[data-testid="events-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="events-list"]')).toHaveClass(/landscape/);
  });

  test('12.18 - Mobile : Performance et lazy loading', async ({ page }) => {
    await login(page, testUsers.visitor.email, testUsers.visitor.password);

    await page.goto('/exhibitors');

    // Vérifier que seules les premières images sont chargées
    const firstImages = await page.locator('img[data-lazy="false"]').count();
    expect(firstImages).toBeLessThanOrEqual(10);

    // Scroll vers le bas
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);

    // Vérifier que plus d'images sont chargées
    const moreImages = await page.locator('img[data-lazy="false"]').count();
    expect(moreImages).toBeGreaterThan(firstImages);
  });
});
