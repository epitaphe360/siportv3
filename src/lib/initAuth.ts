import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { SupabaseService } from '../services/supabaseService';

/**
 * Initialize auth state from Supabase session
 * Call this at app startup to restore user session
 */
export async function initializeAuth() {
  try {
    console.log('🔑 Initialisation de l''authentification...');
    
    // CRITICAL: Vérifier et nettoyer le localStorage si des données invalides
    const storedAuth = localStorage.getItem('siport-auth-storage');
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        // Si le store contient un admin mais pas de session Supabase active, c'est suspect
        if (parsed.state?.user?.type === 'admin') {
          console.warn('⚠️ Détection d''un admin en localStorage, vérification Supabase...');
        }
      } catch (e) {
        console.error('❌ localStorage corrompu, nettoyage...');
        localStorage.removeItem('siport-auth-storage');
      }
    }
    
    if (!supabase) {
      console.warn('⚠️ Supabase non configuré');
      return;
    }

    // Check if there's an active Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erreur lors de la vérification de session:', error);
      // En cas d'erreur, nettoyer le store pour éviter les sessions fantômes
      if (useAuthStore.getState().isAuthenticated) {
        console.warn('⚠️ Erreur session Supabase, nettoyage du store...');
        useAuthStore.getState().logout();
      }
      return;
    }

    if (!session?.user) {
      // No active session
      // CRITICAL FIX: If store thinks we are logged in, but Supabase says no, we must logout
      // This prevents "ghost" sessions where localStorage has data but the token is invalid
      if (useAuthStore.getState().isAuthenticated) {
        console.warn('⚠️ Session invalide ou expirée détectée au démarrage, nettoyage du store...');
        useAuthStore.getState().logout();
      }
      console.log('ℹ️ Aucune session active');
      return;
    }

    // Get full user profile from database
    const userProfile = await SupabaseService.getUserByEmail(session.user.email!);

    if (userProfile) {
      // CRITICAL: Vérification supplémentaire pour les admins
      if (userProfile.type === 'admin') {
        // Vérifier que l'utilisateur est réellement admin dans la DB
        const { data: dbUser } = await supabase
          .from('users')
          .select('type, email')
          .eq('id', userProfile.id)
          .single();
          
        if (!dbUser || dbUser.type !== 'admin') {
          console.error('❌ Tentative de connexion admin non autorisée!');
          useAuthStore.getState().logout();
          return;
        }
        console.warn('👑 Admin authentifié:', dbUser.email);
      }
      
      // Restore auth state in store
      useAuthStore.setState({
        user: userProfile,
        token: userProfile.id,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('✅ Session restaurée:', userProfile.email, '- Type:', userProfile.type);
    } else {
      console.warn('⚠️ Profil utilisateur introuvable, déconnexion...');
      useAuthStore.getState().logout();
    }
  } catch (error) {
    console.error('❌ Erreur initialisation auth:', error);
    // En cas d'erreur fatale, nettoyer le store
    useAuthStore.getState().logout();
  }
}
