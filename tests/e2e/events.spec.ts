import { test, expect } from '@playwright/test';
import { TEST_USERS, TEST_EVENT } from '../fixtures/test-users';

/**
 * Tests E2E pour les événements
 * Teste : Création, modification, inscription aux événements
 */

test.describe('Événements', () => {

  // Helper function pour se connecter
  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test.describe('Création d\'événements (Admin)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, 'admin');
    });

    test('devrait créer un nouvel événement', async ({ page }) => {
      await page.goto('/events');

      // Cliquer sur le bouton "Créer un événement"
      const createButton = page.locator('button:has-text(/créer|nouvel événement|new event/i)').first();
      await createButton.click();

      // Remplir le formulaire
      await page.fill('input[name="title"]', TEST_EVENT.title);
      await page.fill('textarea[name="description"]', TEST_EVENT.description);
      await page.selectOption('select[name="type"]', TEST_EVENT.type);

      // Date et heure (format ISO ou autre selon le composant)
      const startDateStr = TEST_EVENT.startDate.toISOString().split('T')[0];
      await page.fill('input[name="startDate"], input[type="date"]', startDateStr);

      await page.fill('input[name="capacity"]', TEST_EVENT.capacity.toString());
      await page.fill('input[name="location"]', TEST_EVENT.location);

      // Soumettre le formulaire
      await page.click('button[type="submit"]:has-text(/créer|enregistrer|save/i)');

      // Vérifier le message de succès
      await expect(page.locator('text=/événement.*créé|event.*created/i')).toBeVisible({ timeout: 10000 });
    });

    test('devrait modifier un événement existant', async ({ page }) => {
      await page.goto('/events');

      // Cliquer sur le premier événement
      const firstEvent = page.locator('[data-testid="event-item"], .event-card').first();
      await firstEvent.click();

      // Cliquer sur le bouton modifier
      const editButton = page.locator('button:has-text(/modifier|edit/i)').first();
      if (await editButton.isVisible()) {
        await editButton.click();

        // Modifier le titre
        await page.fill('input[name="title"]', 'Événement Modifié - Test E2E');

        // Soumettre
        await page.click('button[type="submit"]:has-text(/enregistrer|save/i)');

        // Vérifier le message de succès
        await expect(page.locator('text=/modifié|updated/i')).toBeVisible({ timeout: 10000 });
      }
    });

  });

  test.describe('Inscription aux événements (Visiteur)', () => {

    test.beforeEach(async ({ page }) => {
      await login(page, 'visitor');
    });

    test('devrait afficher la liste des événements', async ({ page }) => {
      await page.goto('/events');

      await expect(page.locator('h1, h2')).toContainText(/événements|events/i);

      // Vérifier qu'il y a au moins un événement affiché
      const eventCards = page.locator('[data-testid="event-item"], .event-card, article');
      await expect(eventCards.first()).toBeVisible({ timeout: 5000 });
    });

    test('devrait s\'inscrire à un événement', async ({ page }) => {
      await page.goto('/events');

      // Cliquer sur le premier événement
      const firstEvent = page.locator('[data-testid="event-item"], .event-card').first();
      await firstEvent.click();

      // Attendre le chargement des détails
      await page.waitForTimeout(1000);

      // Cliquer sur le bouton d'inscription
      const registerButton = page.locator('button:has-text(/s\'inscrire|register|participer/i)').first();

      if (await registerButton.isVisible()) {
        const isDisabled = await registerButton.isDisabled();

        if (!isDisabled) {
          await registerButton.click();

          // Vérifier le message de confirmation
          await expect(page.locator('text=/inscrit|registered|confirmation/i')).toBeVisible({ timeout: 10000 });
        } else {
          console.log('User is already registered for this event');
        }
      }
    });

    test('devrait se désinscrire d\'un événement', async ({ page }) => {
      await page.goto('/events');

      // Aller sur "Mes événements"
      const myEventsLink = page.locator('a:has-text(/mes événements|my events/i)').first();
      if (await myEventsLink.isVisible()) {
        await myEventsLink.click();

        // Cliquer sur le premier événement inscrit
        const firstEvent = page.locator('[data-testid="event-item"], .event-card').first();
        if (await firstEvent.isVisible()) {
          await firstEvent.click();

          // Cliquer sur le bouton de désinscription
          const unregisterButton = page.locator('button:has-text(/se désinscrire|unregister|annuler/i)').first();
          if (await unregisterButton.isVisible()) {
            await unregisterButton.click();

            // Confirmer
            const confirmButton = page.locator('button:has-text(/confirmer|oui|yes/i)').first();
            if (await confirmButton.isVisible()) {
              await confirmButton.click();
            }

            // Vérifier le message de confirmation
            await expect(page.locator('text=/désinscrit|unregistered/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

    test('devrait filtrer les événements par type', async ({ page }) => {
      await page.goto('/events');

      // Cliquer sur le filtre "Conférences"
      const conferenceFilter = page.locator('button:has-text("Conférence"), input[value="conference"]').first();
      if (await conferenceFilter.isVisible()) {
        await conferenceFilter.click();

        // Attendre le rechargement
        await page.waitForTimeout(1000);

        // Vérifier que les événements affichés sont bien des conférences
        const eventTypes = page.locator('[data-event-type], .event-type');
        if (await eventTypes.first().isVisible()) {
          const firstType = await eventTypes.first().textContent();
          expect(firstType?.toLowerCase()).toContain('conf');
        }
      }
    });

  });

  test.describe('Gestion de la capacité', () => {

    test('devrait afficher l\'état de remplissage de l\'événement', async ({ page }) => {
      await login(page, 'visitor');
      await page.goto('/events');

      const firstEvent = page.locator('[data-testid="event-item"], .event-card').first();
      await firstEvent.click();

      // Vérifier que la capacité est affichée
      await expect(page.locator('text=/\d+\/\d+|places|capacity/i')).toBeVisible({ timeout: 5000 });
    });

    test('devrait bloquer l\'inscription si l\'événement est complet', async ({ page }) => {
      await login(page, 'visitor');
      await page.goto('/events');

      // Chercher un événement complet
      const fullEvent = page.locator('[data-testid="event-item"]:has-text(/complet|full/i)').first();

      if (await fullEvent.isVisible()) {
        await fullEvent.click();

        // Le bouton d'inscription devrait être désactivé
        const registerButton = page.locator('button:has-text(/s\'inscrire|register/i)').first();
        await expect(registerButton).toBeDisabled();
      }
    });

  });

});
