/**
 * E2E Helper: Email Validation pour Supabase
 * 
 * Cette fonction permet de confirmer l'email d'un utilisateur
 * nouvellement créé dans Supabase pour les tests e2e.
 */

// Configuration Supabase (utiliser les variables d'environnement ou valeurs par défaut)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

interface User {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  user_metadata: Record<string, unknown>;
}

interface ListUsersResponse {
  users: User[];
}

/**
 * Confirme l'email d'un utilisateur dans Supabase
 * @param email - L'email de l'utilisateur à confirmer
 * @returns true si la confirmation a réussi, false sinon
 */
export async function confirmUserEmail(email: string): Promise<boolean> {
  try {
    console.log(`🔐 Confirmation email pour: ${email}`);

    // 1. Récupérer la liste des utilisateurs
    const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!listResponse.ok) {
      console.error('❌ Erreur récupération utilisateurs:', listResponse.status, await listResponse.text());
      return false;
    }

    const data: ListUsersResponse = await listResponse.json();
    const user = data.users.find((u: User) => u.email === email);

    if (!user) {
      console.error(`❌ Utilisateur non trouvé: ${email}`);
      return false;
    }

    console.log(`   📧 Utilisateur trouvé: ${user.id}`);
    console.log(`   📅 Créé le: ${user.created_at}`);
    console.log(`   ✉️ Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);

    // Si déjà confirmé, pas besoin de continuer
    if (user.email_confirmed_at) {
      console.log('   ✅ Email déjà confirmé');
      return true;
    }

    // 2. Confirmer l'email de l'utilisateur
    const confirmResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        email_confirm: true
      })
    });

    if (!confirmResponse.ok) {
      console.error('❌ Erreur confirmation email:', confirmResponse.status, await confirmResponse.text());
      return false;
    }

    console.log('   ✅ Email confirmé avec succès!');
    return true;

  } catch (error) {
    console.error('❌ Erreur lors de la confirmation email:', error);
    return false;
  }
}

/**
 * Vérifie si un utilisateur existe dans Supabase
 * @param email - L'email de l'utilisateur à vérifier
 * @returns L'utilisateur s'il existe, null sinon
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data: ListUsersResponse = await response.json();
    return data.users.find((u: User) => u.email === email) || null;

  } catch (error) {
    console.error('❌ Erreur recherche utilisateur:', error);
    return null;
  }
}

/**
 * Supprime un utilisateur de test de Supabase
 * Utile pour nettoyer après les tests
 * @param email - L'email de l'utilisateur à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteTestUser(email: string): Promise<boolean> {
  try {
    // Ne supprimer que les utilisateurs de test
    if (!email.includes('@test.siport.com')) {
      console.warn('⚠️ Refus de supprimer un utilisateur non-test:', email);
      return false;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`   ℹ️ Utilisateur non trouvé (déjà supprimé?): ${email}`);
      return true;
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!response.ok) {
      console.error('❌ Erreur suppression utilisateur:', response.status);
      return false;
    }

    console.log(`   🗑️ Utilisateur supprimé: ${email}`);
    return true;

  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    return false;
  }
}

/**
 * Attend que l'utilisateur soit créé dans Supabase
 * (avec polling et timeout)
 * @param email - L'email de l'utilisateur à attendre
 * @param timeoutMs - Timeout en millisecondes (défaut: 10000)
 * @param intervalMs - Intervalle de polling en millisecondes (défaut: 1000)
 * @returns true si l'utilisateur existe, false si timeout
 */
export async function waitForUserCreation(
  email: string,
  timeoutMs: number = 10000,
  intervalMs: number = 1000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const user = await findUserByEmail(email);
    if (user) {
      console.log(`   ✅ Utilisateur créé après ${Date.now() - startTime}ms`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  console.error(`   ❌ Timeout: utilisateur non créé après ${timeoutMs}ms`);
  return false;
}

/**
 * Fonction complète: attend la création + confirme l'email
 * @param email - L'email de l'utilisateur
 * @param waitTimeout - Timeout d'attente création (défaut: 10000)
 * @returns true si tout a réussi, false sinon
 */
export async function waitAndConfirmEmail(
  email: string,
  waitTimeout: number = 10000
): Promise<boolean> {
  console.log(`🔄 Attente et confirmation email: ${email}`);

  // 1. Attendre que l'utilisateur soit créé
  const userCreated = await waitForUserCreation(email, waitTimeout);
  if (!userCreated) {
    return false;
  }

  // 2. Confirmer l'email
  const emailConfirmed = await confirmUserEmail(email);
  return emailConfirmed;
}
