import { supabase } from '../lib/supabase';
import useAuthStore from '../store/authStore';
import { SupabaseService } from '../services/supabaseService';

/**
 * Initialize auth state from Supabase session
 * Call this at app startup to restore user session
 */
export async function initializeAuth() {
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase non configuré');
      return;
    }

    // Check if there's an active Supabase session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ Erreur lors de la vérification de session:', error);
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
      return;
    }

    // Get full user profile from database
    const userProfile = await SupabaseService.getUserByEmail(session.user.email!);

    if (userProfile) {
      // Restore auth state in store
      useAuthStore.setState({
        user: userProfile,
        token: userProfile.id,
        isAuthenticated: true,
        isLoading: false
      });

      console.log('✅ Session restaurée:', userProfile.email);
    }
  } catch (error) {
    console.error('❌ Erreur initialisation auth:', error);
  }
}
