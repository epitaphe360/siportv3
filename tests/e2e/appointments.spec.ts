import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour les rendez-vous
 * Teste : Prise de rendez-vous, annulation, gestion du calendrier
 */

test.describe('Rendez-vous', () => {

  // Helper function pour se connecter
  async function login(page: any, userType: 'admin' | 'visitor' | 'exhibitor' | 'partner') {
    const user = TEST_USERS[userType];
    await page.goto('/login');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  }

  test.describe('Prise de rendez-vous', () => {

    test('un visiteur devrait pouvoir prendre rendez-vous avec un exposant', async ({ page }) => {
      await login(page, 'visitor');

      // Aller sur la page des exposants
      await page.goto('/exhibitors');

      // Cliquer sur le premier exposant
      const firstExhibitor = page.locator('[data-testid="exhibitor-card"], .exhibitor-card').first();
      await firstExhibitor.click();

      // Attendre le chargement de la page de détails
      await page.waitForTimeout(1000);

      // Cliquer sur "Prendre rendez-vous"
      const appointmentButton = page.locator('button:has-text(/rendez-vous|appointment|réserver/i)').first();

      if (await appointmentButton.isVisible()) {
        await appointmentButton.click();

        // Sélectionner une date et heure disponible
        const availableSlot = page.locator('[data-testid="time-slot"]:not([disabled]), .time-slot:not(.disabled)').first();

        if (await availableSlot.isVisible()) {
          await availableSlot.click();

          // Ajouter des notes (optionnel)
          const notesField = page.locator('textarea[name="notes"]');
          if (await notesField.isVisible()) {
            await notesField.fill('Rendez-vous de test E2E - Discussion partenariat');
          }

          // Confirmer la réservation
          await page.click('button:has-text(/confirmer|réserver|book/i)');

          // Vérifier le message de succès
          await expect(page.locator('text=/rendez-vous.*confirmé|appointment.*confirmed/i')).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test('devrait afficher mes rendez-vous', async ({ page }) => {
      await login(page, 'visitor');
      await page.goto('/appointments');

      await expect(page.locator('h1, h2')).toContainText(/rendez-vous|appointments/i);

      // Vérifier qu'il y a au moins un rendez-vous affiché (ou message "Aucun rendez-vous")
      const hasAppointments = await page.locator('[data-testid="appointment-item"], .appointment-card').first().isVisible().catch(() => false);
      const noAppointmentsMessage = await page.locator('text=/aucun rendez-vous|no appointments/i').isVisible().catch(() => false);

      expect(hasAppointments || noAppointmentsMessage).toBeTruthy();
    });

  });

  test.describe('Annulation de rendez-vous', () => {

    test('devrait pouvoir annuler un rendez-vous', async ({ page }) => {
      await login(page, 'visitor');
      await page.goto('/appointments');

      // Cliquer sur le premier rendez-vous
      const firstAppointment = page.locator('[data-testid="appointment-item"], .appointment-card').first();

      if (await firstAppointment.isVisible()) {
        await firstAppointment.click();

        // Cliquer sur le bouton annuler
        const cancelButton = page.locator('button:has-text(/annuler|cancel/i)').first();

        if (await cancelButton.isVisible()) {
          await cancelButton.click();

          // Confirmer l'annulation
          const confirmButton = page.locator('button:has-text(/confirmer|oui|yes/i)').first();
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }

          // Vérifier le message de confirmation
          await expect(page.locator('text=/annulé|cancelled/i')).toBeVisible({ timeout: 10000 });
        }
      }
    });

  });

  test.describe('Gestion du calendrier (Exposant)', () => {

    test('un exposant devrait voir ses créneaux disponibles', async ({ page }) => {
      await login(page, 'exhibitor');
      await page.goto('/appointments');

      // Aller sur la gestion du calendrier
      const calendarLink = page.locator('a:has-text(/calendrier|calendar|disponibilités/i)').first();

      if (await calendarLink.isVisible()) {
        await calendarLink.click();

        // Vérifier que le calendrier est affiché
        await expect(page.locator('[data-testid="calendar"], .calendar')).toBeVisible({ timeout: 5000 });
      }
    });

    test('un exposant devrait pouvoir définir ses disponibilités', async ({ page }) => {
      await login(page, 'exhibitor');
      await page.goto('/appointments');

      const availabilityButton = page.locator('button:has-text(/disponibilités|availability|créneaux/i)').first();

      if (await availabilityButton.isVisible()) {
        await availabilityButton.click();

        // Sélectionner un jour
        const daySlot = page.locator('[data-testid="day-slot"], .day-slot').first();
        if (await daySlot.isVisible()) {
          await daySlot.click();

          // Définir les heures de début et fin
          const startTime = page.locator('input[name="startTime"], select[name="startTime"]').first();
          const endTime = page.locator('input[name="endTime"], select[name="endTime"]').first();

          if (await startTime.isVisible()) {
            await startTime.fill('09:00');
            await endTime.fill('18:00');

            // Enregistrer
            await page.click('button:has-text(/enregistrer|save/i)');

            await expect(page.locator('text=/enregistré|saved/i')).toBeVisible({ timeout: 10000 });
          }
        }
      }
    });

  });

});
