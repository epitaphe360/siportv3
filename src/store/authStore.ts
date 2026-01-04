import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SupabaseService } from '../services/supabaseService';
import { supabase } from '../lib/supabase';
import OAuthService from '../services/oauthService';
import { User, UserProfile } from '../types';
import { resetAllStores } from './resetStores';

/**
 * Interface pour les données d'inscription
 */
interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType?: 'admin' | 'exhibitor' | 'partner' | 'visitor' | 'security';
  companyName?: string;
  position?: string;
  country?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  description?: string;
  objectives?: string[];
  [key: string]: unknown; // Pour les champs additionnels
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isLinkedInLoading: boolean;

  // Actions
  login: (email: string, password: string, options?: { rememberMe?: boolean }) => Promise<void>;
  signUp: (credentials: { email: string, password: string }, profileData: Partial<UserProfile>, recaptchaToken?: string) => Promise<{ error: Error | null; user?: User | null }>;
  register: (userData: RegistrationData, recaptchaToken?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

// Helper: profile minimal par défaut pour satisfaire l'interface UserProfile
const minimalUserProfile = (overrides: Partial<User['profile']> = {}): User['profile'] => ({
  firstName: overrides.firstName ?? '',
  lastName: overrides.lastName ?? '',
  avatar: overrides.avatar,
  company: overrides.company ?? '',
  position: overrides.position ?? '',
  country: overrides.country ?? '',
  phone: overrides.phone,
  linkedin: overrides.linkedin,
  website: overrides.website,
  bio: overrides.bio ?? '',
  interests: overrides.interests ?? [],
  objectives: overrides.objectives ?? [],
  companyDescription: overrides.companyDescription,
  sectors: overrides.sectors ?? [],
  products: overrides.products ?? [],
  videos: overrides.videos ?? [],
  images: overrides.images ?? [],
  participationObjectives: overrides.participationObjectives ?? [],
  thematicInterests: overrides.thematicInterests ?? [],
  companySize: overrides.companySize,
  geographicLocation: overrides.geographicLocation,
  collaborationTypes: overrides.collaborationTypes ?? [],
  expertise: overrides.expertise ?? [],
  visitObjectives: overrides.visitObjectives ?? [],
  competencies: overrides.competencies ?? []
});

// Production authentication only via Supabase


const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isGoogleLoading: false,
  isLinkedInLoading: false,
  
  login: async (email: string, password: string, options?: { rememberMe?: boolean }) => {
    set({ isLoading: true });

    try {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }


      // ✅ Passer l'option rememberMe à signIn
      const user = await SupabaseService.signIn(email, password, options);

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // ✅ Permettre la connexion avec pending_payment (accès limité au dashboard)
      // Bloquer uniquement les status: 'pending', 'rejected', 'suspended'
      if (user.status && !['active', 'pending_payment'].includes(user.status)) {
        throw new Error('Votre compte est en attente de validation');
      }


      set({
        user,
        token: user.id,
        isAuthenticated: true,
        isLoading: false
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      console.error('❌ Erreur de connexion:', error);
      set({ isLoading: false });
      throw new Error(errorMessage);
    }
  },

  signUp: async (credentials, profileData, recaptchaToken) => {
    try {

      // Valider les données
      if (!credentials.email || !credentials.password) {
        throw new Error('Email et mot de passe requis');
      }

      if (credentials.password.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }

      // Créer l'utilisateur via SupabaseService
      const newUser = await SupabaseService.signUp(
        credentials.email,
        credentials.password,
        {
          name: profileData.firstName && profileData.lastName
            ? `${profileData.firstName} ${profileData.lastName}`.trim()
            : profileData.name || '',
          type: profileData.role || 'visitor',
          // ✅ Status selon le type: partner/exhibitor → pending_payment, visitor → active
          status: (profileData.role === 'partner' || profileData.role === 'exhibitor') 
            ? 'pending_payment' 
            : profileData.status || 'active',
          profile: {
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            company: profileData.company || '',
            position: profileData.position || '',
            phone: profileData.phone || '',
            ...profileData
          }
        },
        recaptchaToken // 🔐 Passer le token reCAPTCHA
      );

      if (!newUser) {
        throw new Error('Échec de la création de l\'utilisateur');
      }


      // Créer demande d'inscription pour exposants et partenaires
      if (profileData.role === 'exhibitor' || profileData.role === 'partner') {

        // ✅ Ne pas bloquer l'inscription si la création de demande échoue (erreur RLS possible)
        try {
          await SupabaseService.createRegistrationRequest({
            userType: profileData.role,
            email: credentials.email,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            companyName: profileData.companyName || profileData.company || '',
            phone: profileData.phone || '',
            profileData: profileData
          });
        } catch (regRequestError) {
          console.warn('⚠️ Erreur création demande inscription (non bloquante):', regRequestError);
          // Ne pas bloquer l'inscription - le compte est déjà créé
        }

        // Envoyer email de notification
        try {
          await SupabaseService.sendRegistrationEmail({
            to: credentials.email,
            name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
            userType: profileData.role
          });
        } catch (emailError) {
          console.warn('⚠️ Erreur envoi email:', emailError);
          // Ne pas bloquer l'inscription si l'email échoue
        }
      }

      return { error: null, user: newUser };
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { error: error as Error, user: null };
    }
  },

  register: async (userData: RegistrationData, recaptchaToken?: string) => {
    set({ isLoading: true });

    try {
      // Validation des données requises
      if (!userData.email || !userData.firstName || !userData.lastName || !userData.password) {
        throw new Error('Email, prénom, nom et mot de passe sont requis');
      }


      const userType = (['admin','exhibitor','partner','visitor','security'].includes(userData.accountType ?? '') ? userData.accountType! : 'visitor') as User['type'];

      // Préparer les données utilisateur avec le niveau visiteur par défaut (FREE)
      const signUpData: any = {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        type: userType,
        profile: minimalUserProfile({
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.companyName ?? '',
          position: userData.position ?? '',
          country: userData.country ?? '',
          phone: userData.phone,
          linkedin: userData.linkedin,
          website: userData.website,
          bio: userData.description ?? '',
          objectives: userData.objectives ?? []
        })
      };

      // ✅ Ajouter le niveau visiteur (par défaut 'free' pour les nouveaux visiteurs)
      if (userType === 'visitor') {
        signUpData.visitor_level = 'free';
      }

      // Appeler la fonction signUp de SupabaseService qui gère Auth + profil
      const newUser = await SupabaseService.signUp(
        userData.email,
        userData.password,
        signUpData,
        recaptchaToken // 🔐 Passer le token reCAPTCHA
      );

      if (!newUser) {
        throw new Error('Échec de la création de l\'utilisateur');
      }

      // ✅ Mettre à jour l'utilisateur dans le store pour les visiteurs (auto-login)
      if (userType === 'visitor') {
        set({ 
          user: newUser, 
          isAuthenticated: true,
          isLoading: false 
        });
      }

      // Créer une demande d'inscription pour exposants et partenaires
      if (userType === 'exhibitor' || userType === 'partner') {
        await SupabaseService.createRegistrationRequest({
          userType: userType,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          companyName: userData.companyName ?? '',
          position: userData.position ?? '',
          phone: userData.phone ?? '',
          profileData: userData
        });

        // Envoyer l'email de confirmation (ne pas bloquer si échec)
        try {
          await SupabaseService.sendRegistrationEmail({
            userType: userType as 'exhibitor' | 'partner',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            companyName: userData.companyName ?? ''
          });
          console.log('✅ Email de confirmation envoyé');
        } catch (emailError) {
          // L'email a échoué mais l'inscription est valide
          console.warn('⚠️ Impossible d\'envoyer l\'email de confirmation:', emailError);
          // Ne pas bloquer l'inscription
        }

      }

      set({ isLoading: false });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'inscription';
      console.error('❌ Erreur lors de l\'inscription:', error);
      set({ isLoading: false });
      throw new Error(errorMessage);
    }
  },

  loginWithGoogle: async () => {
    set({ isGoogleLoading: true });

    try {

      // Initiate OAuth flow - this will redirect the user
      await OAuthService.signInWithGoogle();

      // Note: The OAuth flow redirects, so code after this may not execute
      // The actual login completion happens after OAuth callback

    } catch (error: any) {
      console.error('❌ Google OAuth error:', error);
      set({ isGoogleLoading: false });
      throw new Error(error.message || 'Erreur lors de la connexion avec Google');
    }
  },

  loginWithLinkedIn: async () => {
    set({ isLinkedInLoading: true });

    try {

      // Initiate OAuth flow - this will redirect the user
      await OAuthService.signInWithLinkedIn();

      // Note: The OAuth flow redirects, so code after this may not execute
      // The actual login completion happens after OAuth callback

    } catch (error: any) {
      console.error('❌ LinkedIn OAuth error:', error);
      set({ isLinkedInLoading: false });
      throw new Error(error.message || 'Erreur lors de la connexion avec LinkedIn');
    }
  },

  handleOAuthCallback: async () => {
    set({ isLoading: true });

    try {

      // Get user from OAuth session
      const user = await OAuthService.handleOAuthCallback();

      if (!user) {
        throw new Error('Impossible de récupérer les informations utilisateur après OAuth');
      }

      // Get session for token
      const session = await OAuthService.getCurrentSession();

      if (!session) {
        throw new Error('Impossible de récupérer la session OAuth');
      }


      set({
        user,
        token: session.access_token,
        isAuthenticated: true,
        isLoading: false,
        isGoogleLoading: false,
        isLinkedInLoading: false
      });

    } catch (error: any) {
      console.error('❌ Error handling OAuth callback:', error);
      set({
        isLoading: false,
        isGoogleLoading: false,
        isLinkedInLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      console.log('✅ Déconnexion Supabase réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion Supabase:', error);
    }

    // CRITIQUE: Nettoyer TOUS les stores avant de déconnecter
    // Empêche les fuites de données sur ordinateurs partagés
    resetAllStores();
    
    // CRITICAL: Nettoyage complet du localStorage et sessionStorage
    try {
      localStorage.removeItem('siport-auth-storage');
      localStorage.removeItem('sb-eqjoqgpbxhsfgcovipgu-auth-token');
      sessionStorage.clear();
      console.log('✅ LocalStorage et sessionStorage nettoyés');
    } catch (error) {
      console.error('❌ Erreur nettoyage storage:', error);
    }

    // Ensuite, réinitialiser authStore
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isGoogleLoading: false,
      isLinkedInLoading: false
    });
  },
  
  setUser: (user) => set({ 
    user,
    isAuthenticated: !!user, // ✅ CRITICAL: Also update isAuthenticated when setting user
    token: user ? 'local-session' : null // ✅ Set a token to mark authenticated state
  }),

  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) throw new Error('Utilisateur non connecté');

    set({ isLoading: true });

    try {
      // ✅ Fusionner les données de manière robuste
      const mergedProfile = {
        ...user.profile,
        ...profileData
      };

      // ✅ Envoyer la mise à jour vers Supabase
      const updatedUser = await SupabaseService.updateUser(user.id, {
        ...user,
        profile: mergedProfile
      });

      if (!updatedUser) {
        throw new Error('Impossible de mettre à jour le profil - réponse vide du serveur');
      }

      // ✅ Mettre à jour le store avec les données mises à jour
      set({ user: updatedUser, isLoading: false });

      // ✅ Vérifier que les données sont bien sauvegardées
      console.log('✅ Profil mis à jour avec succès:', {
        sectors: updatedUser.profile.sectors?.length || 0,
        interests: updatedUser.profile.interests?.length || 0,
        objectives: updatedUser.profile.objectives?.length || 0,
        bio: updatedUser.profile.bio?.substring(0, 50) || 'vide'
      });
    } catch (error: unknown) {
      set({ isLoading: false });
      console.error('❌ Erreur mise à jour profil:', error);
      throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour du profil');
    }
  }
}),
    {
      name: 'siport-auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
        // Ne PAS persister les états de loading
      }),
      // CRITICAL FIX: Validation au chargement du store depuis localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.user?.type === 'admin' && state?.isAuthenticated) {
          // SECURITY: Si un admin est détecté dans localStorage, on marque pour vérification
          // La vérification complète sera faite par initAuth.ts avec Supabase
          // CRITICAL: Ne pas faire confiance au localStorage pour les admins
          // Forcer une vérification Supabase via initAuth
          // On ne déconnecte pas immédiatement car initAuth le fera si invalide
        }

        // Nettoyer les états de loading qui auraient pu être persistés par erreur
        if (state) {
          state.isLoading = false;
          state.isGoogleLoading = false;
          state.isLinkedInLoading = false;
        }
      }
    }
  )
);

// SECURITY: Nettoyage préventif du localStorage si détection de données corrompues
(function cleanupCorruptedAuth() {
  try {
    const stored = localStorage.getItem('siport-auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Si isAuthenticated est true mais pas d'user, c'est corrompu
      if (parsed?.state?.isAuthenticated && !parsed?.state?.user?.id) {
        console.error('❌ Données auth corrompues détectées, nettoyage...');
        localStorage.removeItem('siport-auth-storage');
      }
      // Si user.type est admin mais pas de token valide
      if (parsed?.state?.user?.type === 'admin' && !parsed?.state?.token) {
        console.error('❌ Session admin sans token détectée, nettoyage...');
        localStorage.removeItem('siport-auth-storage');
      }
    }
  } catch (e) {
    // Ignore les erreurs de parsing
  }
})();

export { useAuthStore };
export default useAuthStore;