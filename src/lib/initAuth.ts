import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { SupabaseService } from '../services/supabaseService';

/**
 * Initialize auth state from Supabase session
 * Call this at app startup to restore user session
 */
export async function initializeAuth() {
  try {
    console.log("[AUTH] Initialisation de l'authentification...");
    
    // CRITICAL: Verifier et nettoyer le localStorage si donnees invalides
    const storedAuth = localStorage.getItem('siport-auth-storage');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        // Si le store contient un admin mais pas de session Supabase active, suspect
        if (parsed.state?.user?.type === 'admin') {
          console.warn('[AUTH] Detection admin en localStorage, verification Supabase...');
        }
      } catch (e) {
        console.error('[AUTH] localStorage corrompu, nettoyage...');
        localStorage.removeItem('siport-auth-storage');
      }
    }
    
    if (!supabase) {
      console.warn('[AUTH] Supabase non configure');
      return;
    }

    // Check if there is an active Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[AUTH] Erreur verification session:', error);
      // En cas erreur, nettoyer le store pour eviter les sessions fantomes
      if (useAuthStore.getState().isAuthenticated) {
        console.warn('[AUTH] Erreur session Supabase, nettoyage du store...');
        useAuthStore.getState().logout();
      }
      return;
    }

    if (!session?.user) {
      // No active session
      // CRITICAL FIX: If store thinks we are logged in, but Supabase says no, we must logout
      // This prevents ghost sessions where localStorage has data but the token is invalid
      // EXCEPTION: Don't logout if user was just created (within last 5 seconds)
      const storedUser = useAuthStore.getState().user;
      const createdAt = storedUser?.createdAt ? new Date(storedUser.createdAt).getTime() : 0;
      const now = Date.now();
      const wasJustCreated = (now - createdAt) < 5000; // Within 5 seconds
      
      if (useAuthStore.getState().isAuthenticated && !wasJustCreated) {
        console.warn('[AUTH] Session invalide ou expiree detectee au demarrage, nettoyage du store...');
        useAuthStore.getState().logout();
      } else if (wasJustCreated) {
        console.log('[AUTH] Utilisateur récemment créé, pas de déconnexion');
      }
      console.log('[AUTH] Aucune session active');
      return;
    }

    // Get full user profile from database
    const userProfile = await SupabaseService.getUserByEmail(session.user.email!);

    if (userProfile) {
      // CRITICAL: Verification supplementaire pour les admins
      if (userProfile.type === 'admin') {
        // Verifier que utilisateur est reellement admin dans la DB
        const { data: dbUser } = await supabase
          .from('users')
          .select('type, email')
          .eq('id', userProfile.id)
          .single();
          
        if (!dbUser || dbUser.type !== 'admin') {
          console.error('[AUTH] Tentative de connexion admin non autorisee!');
          useAuthStore.getState().logout();
          return;
        }
        console.warn('[AUTH] Admin authentifie:', dbUser.email);
      }
      
      // Restore auth state in store
      useAuthStore.setState({
        user: userProfile,
        token: userProfile.id,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('[AUTH] Session restauree:', userProfile.email, '- Type:', userProfile.type);
    } else {
      console.warn('[AUTH] Profil utilisateur introuvable, deconnexion...');
      useAuthStore.getState().logout();
    }
  } catch (error) {
    console.error('[AUTH] Erreur initialisation auth:', error);
    // En cas erreur fatale, nettoyer le store
    useAuthStore.getState().logout();
  }
}
