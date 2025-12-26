import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:9323';

// Créer un email unique à chaque test
const generateTestEmail = () => `visitor-free-${Date.now()}@test.siport.com`;

// Comptes de test pour les visiteurs FREE
const TEST_VISITOR_FREE = {
  password: 'Test@1234567'
};

// Fonction pour valider l'email via Supabase Admin
async function validateUserEmail(email: string): Promise<boolean> {
  console.log(`⏳ Validation de l'email: ${email}`);
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`🔍 Tentative ${attempt}/5 de récupération de l'utilisateur...`);
    
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.log(`❌ Erreur: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      continue;
    }
    
    const user = users?.users?.find(u => u.email === email);
    
    if (user) {
      console.log(`✅ Utilisateur trouvé: ${user.id}`);
      console.log(`📧 Email confirmé actuel: ${user.email_confirmed_at ? 'OUI' : 'NON'}`);
      
      if (!user.email_confirmed_at) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true
        });
        
        if (updateError) {
          console.log(`❌ Erreur validation: ${updateError.message}`);
          return false;
        }
        console.log(`✅ Email validé !`);
      } else {
        console.log(`✅ Email déjà validé !`);
      }
      return true;
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`❌ Utilisateur non trouvé après 5 tentatives`);
  return false;
}

test.describe('👤 VISITEUR FREE - SCÉNARIO COMPLET', () => {
  test.setTimeout(120000); // 2 minutes pour le test complet

  test('SCÉNARIO: Choix Plan -> Inscription -> Succès -> Login -> Dashboard -> Badge', async ({ page }) => {
    
    const visitorEmail = generateTestEmail();
    console.log(`📧 Email généré : ${visitorEmail}`);
    
    // --- ÉTAPE 1: CHOIX DU PLAN (ABONNEMENT) ---
    console.log('📍 ÉTAPE 1: Choix du plan (Page publique)');
    await page.goto(`${BASE_URL}/visitor/subscription`);
    await page.waitForLoadState('domcontentloaded');

    // Vérifier que les offres sont visibles
    const freeCardTitle = page.locator('h3:has-text("Visiteur Gratuit")');
    await expect(freeCardTitle).toBeVisible();

    // Hover sur le plan gratuit pour la photo
    const freeButton = page.locator('button:has-text("S\'inscrire gratuitement")').first();
    await freeButton.hover();
    await page.waitForTimeout(500);

    // 📸 SCREENSHOT 1: Choix du plan
    await page.screenshot({ path: 'screenshots/inscription-free/1-choix-plan.png', fullPage: true });

    // Cliquer sur "S'inscrire gratuitement"
    await freeButton.click();
    
    // --- ÉTAPE 2: INSCRIPTION ---
    console.log('📍 ÉTAPE 2: Formulaire d\'inscription');
    // Vérifier la redirection vers /register
    await page.waitForURL(/\/register/);
    await expect(page.locator('h1:has-text("Créer un compte")')).toBeVisible();

    // 📸 SCREENSHOT 2a: Page inscription vide (pré-remplie visiteur)
    await page.screenshot({ path: 'screenshots/inscription-free/2a-inscription-vide.png', fullPage: true });

    // Remplir le wizard
    // Étape 1: Type (déjà sélectionné ou à cliquer)
    const visitorLabel = page.locator('[data-testid="account-type-visitor"]');
    if (await visitorLabel.isVisible()) {
        await visitorLabel.click();
    }
    
    // 📸 SCREENSHOT 2b: Type de compte
    await page.screenshot({ path: 'screenshots/inscription-free/2b-inscription-type.png', fullPage: true });

    await page.locator('button:has-text("Suivant")').first().click();
    
    // Étape 2: Entreprise
    await expect(page.locator('text=Informations sur votre organisation')).toBeVisible();
    await page.locator('select[name="sector"]').selectOption('Logistique');
    await page.locator('select[name="country"]').selectOption('FR');
    
    // 📸 SCREENSHOT 2c: Entreprise
    await page.screenshot({ path: 'screenshots/inscription-free/2c-inscription-entreprise.png', fullPage: true });
    
    await page.locator('button:has-text("Suivant")').first().click();

    // Étape 3: Contact
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await page.locator('input[name="firstName"]').fill('Jean');
    await page.locator('input[name="lastName"]').fill('Dupont');
    await page.locator('input[name="email"]').fill(visitorEmail);
    await page.locator('input[name="phone"]').fill('+33612345678');
    await page.locator('select[name="position"]').selectOption('Étudiant');

    // 📸 SCREENSHOT 2d: Contact
    await page.screenshot({ path: 'screenshots/inscription-free/2d-inscription-contact.png', fullPage: true });

    await page.locator('button:has-text("Suivant")').first().click();

    // Étape 4: Profil
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await page.locator('textarea[name="description"]').fill('Visiteur intéressé par le salon.');
    await page.locator('input[type="checkbox"]').first().check();

    // 📸 SCREENSHOT 2e: Profil
    await page.screenshot({ path: 'screenshots/inscription-free/2e-inscription-profil.png', fullPage: true });

    await page.locator('button:has-text("Suivant")').first().click();

    // Étape 5: Sécurité
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await page.locator('input[name="password"]').fill(TEST_VISITOR_FREE.password);
    await page.locator('input[name="confirmPassword"]').fill(TEST_VISITOR_FREE.password);

    // 📸 SCREENSHOT 2f: Sécurité
    await page.screenshot({ path: 'screenshots/inscription-free/2f-inscription-securite.png', fullPage: true });

    // Soumettre
    await page.locator('button:has-text("Créer mon compte")').click();

    // --- ÉTAPE 3: PAGE DE CONFIRMATION ---
    console.log('📍 ÉTAPE 3: Page de confirmation');
    // Attendre la redirection vers /signup-confirmation ou message de succès
    await page.waitForTimeout(3000);
    
    // Vérifier si on est sur la page de confirmation ou s'il y a un message de succès
    const currentUrl = page.url();
    console.log(`📍 URL actuelle: ${currentUrl}`);
    
    // 📸 SCREENSHOT 3: Page de confirmation
    await page.screenshot({ path: 'screenshots/inscription-free/3-inscription-confirmation.png', fullPage: true });
    
    console.log('✅ Inscription terminée');
    
    // --- VALIDATION EMAIL VIA API ---
    console.log('📧 Validation automatique de l\'email...');
    await page.waitForTimeout(3000);
    
    try {
      const validated = await validateUserEmail(visitorEmail);
      if (validated) {
        console.log('✅ Email validé avec succès !');
      } else {
        console.log('⚠️ Email non validé - le test continue quand même');
      }
    } catch (error) {
      console.log('⚠️ Erreur validation email:', error);
    }
    
    await page.waitForTimeout(2000);

    // --- ÉTAPE 4: CONNEXION ---
    console.log('📍 ÉTAPE 4: Page de connexion');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Remplir le login
    await page.locator('input[type="email"]').first().fill(visitorEmail);
    await page.locator('input[type="password"]').first().fill(TEST_VISITOR_FREE.password);

    // 📸 SCREENSHOT 4: Connexion
    await page.screenshot({ path: 'screenshots/inscription-free/4-connexion.png', fullPage: true });

    await page.locator('button[type="submit"]').first().click();

    // --- ÉTAPE 5: TABLEAU DE BORD ---
    console.log('📍 ÉTAPE 5: Tableau de bord');
    // Attendre redirection dashboard
    await page.waitForURL(/\/dashboard|visitor/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Attendre chargement widgets

    // 📸 SCREENSHOT 5: Dashboard
    await page.screenshot({ path: 'screenshots/inscription-free/5-dashboard.png', fullPage: true });

    // --- ÉTAPE 6: BADGE ---
    console.log('📍 ÉTAPE 6: Badge');
    await page.goto(`${BASE_URL}/badge`);
    await page.waitForLoadState('networkidle');
    
    // Générer si besoin
    const generateBtn = page.getByRole('button', { name: /Générer|Generate/i });
    if (await generateBtn.isVisible()) {
      await generateBtn.click();
      await page.waitForTimeout(2000);
    }
    
    await page.waitForTimeout(2000); // Attendre rendu QR code

    // 📸 SCREENSHOT 6: Badge
    await page.screenshot({ path: 'screenshots/inscription-free/6-badge.png', fullPage: true });

    console.log('✅ SCÉNARIO TERMINÉ AVEC SUCCÈS');
  });

});
