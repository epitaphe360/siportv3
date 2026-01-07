import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

/**
 * Tests E2E pour l'authentification
 * Teste : Login, Logout, Inscription (Visitor, Exhibitor, Partner)
 */

test.describe('Authentification', () => {

  test.describe('Login', () => {

    test('devrait se connecter avec un compte visiteur', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', TEST_USERS.visitor.email);
      await page.fill('input[type="password"]', TEST_USERS.visitor.password);

      await page.click('button[type="submit"]');

      // Attendre la redirection vers le dashboard
      await page.waitForURL('/dashboard', { timeout: 10000 });

      // Vérifier que l'utilisateur est connecté
      await expect(page.locator('text=Jean Visiteur')).toBeVisible({ timeout: 5000 });
    });

    test('devrait se connecter avec un compte exposant', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', TEST_USERS.exhibitor.email);
      await page.fill('input[type="password"]', TEST_USERS.exhibitor.password);

      await page.click('button[type="submit"]');

      await page.waitForURL('/dashboard', { timeout: 10000 });
      await expect(page.locator('text=Marie Exposant')).toBeVisible({ timeout: 5000 });
    });

    test('devrait se connecter avec un compte admin', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', TEST_USERS.admin.email);
      await page.fill('input[type="password"]', TEST_USERS.admin.password);

      await page.click('button[type="submit"]');

      await page.waitForURL('/dashboard', { timeout: 10000 });
      await expect(page.locator('text=Admin')).toBeVisible({ timeout: 5000 });
    });

    test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
      await page.goto('/login');

      await page.fill('input[type="email"]', 'invalide@test.com');
      await page.fill('input[type="password"]', 'MauvaisMotDePasse123!');

      await page.click('button[type="submit"]');

      // Attendre le message d'erreur
      await expect(page.locator('text=/incorrect|invalide|erreur/i')).toBeVisible({ timeout: 5000 });
    });

    test('devrait se connecter avec OAuth Google', async ({ page }) => {
      await page.goto('/login');

      // Vérifier que le bouton OAuth Google existe
      const googleButton = page.locator('button:has-text("Google")');
      await expect(googleButton).toBeVisible();

      // Note: Test OAuth nécessite configuration credentials réels
      // Ce test vérifie uniquement la présence du bouton
    });

  });

  test.describe('Logout', () => {

    test('devrait se déconnecter correctement', async ({ page }) => {
      // Se connecter d'abord
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_USERS.visitor.email);
      await page.fill('input[type="password"]', TEST_USERS.visitor.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard', { timeout: 10000 });

      // Cliquer sur le bouton de déconnexion
      const logoutButton = page.locator('button:has-text(/d.connexion|logout/i)').first();
      await logoutButton.click();

      // Vérifier la redirection vers la page de login
      await page.waitForURL('/login', { timeout: 10000 });

      // Vérifier qu'on ne peut plus accéder au dashboard
      await page.goto('/dashboard');
      await page.waitForURL('/login', { timeout: 10000 });
    });

  });

  test.describe('Inscription Visiteur', () => {

    test('devrait créer un compte visiteur avec succès', async ({ page }) => {
      await page.goto('/register');

      const newUser = TEST_USERS.newVisitor;

      // Étape 1: Sélectionner le type de compte
      await page.click('input[value="visitor"]');
      await page.click('button:has-text("Suivant")');

      // Étape 2: Informations entreprise
      await page.fill('input[name="companyName"]', newUser.company);
      await page.selectOption('select[name="sector"]', 'Consulting');
      await page.selectOption('select[name="country"]', newUser.country);
      await page.click('button:has-text("Suivant")');

      // Étape 3: Informations personnelles
      await page.fill('input[name="firstName"]', newUser.firstName);
      await page.fill('input[name="lastName"]', newUser.lastName);
      await page.selectOption('select[name="position"]', newUser.position);
      await page.fill('input[name="email"]', newUser.email);
      await page.fill('input[name="phone"]', newUser.phone);
      await page.click('button:has-text("Suivant")');

      // Étape 4: Description et objectifs
      await page.fill('textarea[name="description"]', newUser.description);
      for (const objective of newUser.objectives) {
        await page.check(`input[type="checkbox"][value="${objective}"]`);
      }
      await page.click('button:has-text("Suivant")');

      // Étape 5: Mot de passe
      await page.fill('input[name="password"]', newUser.password);
      await page.fill('input[name="confirmPassword"]', newUser.password);
      await page.click('button[type="submit"]');

      // Attendre le message de succès
      await expect(page.locator('text=/inscription.*réussie/i')).toBeVisible({ timeout: 10000 });
    });

  });

  test.describe('Inscription Exposant', () => {

    test('devrait créer un compte exposant avec succès', async ({ page }) => {
      await page.goto('/auth/exhibitor-signup');

      const newExhibitor = TEST_USERS.newExhibitor;

      await page.fill('input[name="companyName"]', newExhibitor.companyName);
      await page.fill('input[name="firstName"]', newExhibitor.firstName);
      await page.fill('input[name="lastName"]', newExhibitor.lastName);
      await page.fill('input[name="email"]', newExhibitor.email);
      await page.fill('input[name="phone"]', newExhibitor.phone);
      await page.fill('input[name="position"]', newExhibitor.position);
      await page.selectOption('select[name="country"]', newExhibitor.country);
      await page.fill('input[name="website"]', newExhibitor.website!);
      await page.fill('textarea[name="companyDescription"]', newExhibitor.companyDescription);
      await page.fill('input[name="password"]', newExhibitor.password);
      await page.fill('input[name="confirmPassword"]', newExhibitor.password);

      // Accepter les conditions
      await page.check('input[name="acceptTerms"]');
      await page.check('input[name="acceptPrivacy"]');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/inscription.*réussie/i')).toBeVisible({ timeout: 10000 });
    });

  });

  test.describe('Inscription Partenaire', () => {

    test('devrait créer un compte partenaire avec succès', async ({ page }) => {
      await page.goto('/auth/partner-signup');

      const newPartner = TEST_USERS.newPartner;

      await page.fill('input[name="companyName"]', newPartner.companyName);
      await page.fill('input[name="firstName"]', newPartner.firstName);
      await page.fill('input[name="lastName"]', newPartner.lastName);
      await page.fill('input[name="email"]', newPartner.email);
      await page.fill('input[name="phone"]', newPartner.phone);
      await page.fill('input[name="position"]', newPartner.position);
      await page.selectOption('select[name="country"]', newPartner.country);
      await page.fill('input[name="website"]', newPartner.website!);
      await page.fill('textarea[name="companyDescription"]', newPartner.companyDescription);
      await page.fill('input[name="password"]', newPartner.password);
      await page.fill('input[name="confirmPassword"]', newPartner.password);

      // Accepter les conditions
      await page.check('input[name="acceptTerms"]');
      await page.check('input[name="acceptPrivacy"]');

      await page.click('button[type="submit"]');

      await expect(page.locator('text=/inscription.*réussie/i')).toBeVisible({ timeout: 10000 });
    });

  });

});
