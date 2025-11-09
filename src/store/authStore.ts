import { create } from 'zustand';
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
  accountType?: 'admin' | 'exhibitor' | 'partner' | 'visitor';
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
  signUp: (credentials: { email: string, password: string }, profileData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  register: (userData: RegistrationData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  handleOAuthCallback: () => Promise<void>;
  logout: () => void;
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


const useAuthStore = create<AuthState>((set, get) => ({
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

      console.log('🔄 Connexion via Supabase pour:', email);

      // ✅ Passer l'option rememberMe à signIn
      const user = await SupabaseService.signIn(email, password, options);

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (user.status && user.status !== 'active') {
        throw new Error('Votre compte est en attente de validation');
      }

      console.log('✅ Utilisateur authentifié:', user.email, options?.rememberMe ? '(session persistante)' : '(session temporaire)');

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

  signUp: async (credentials, profileData) => {
    try {
      console.log('🔄 Inscription utilisateur:', credentials.email);

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
          status: profileData.status || 'pending',
          profile: {
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            company: profileData.company || '',
            position: profileData.position || '',
            phone: profileData.phone || '',
            ...profileData
          }
        }
      );

      if (!newUser) {
        throw new Error('Échec de la création de l\'utilisateur');
      }

      console.log('✅ Utilisateur créé:', newUser.email);

      // Créer demande d'inscription pour exposants et partenaires
      if (profileData.role === 'exhibitor' || profileData.role === 'partner') {
        console.log('📝 Création demande d\'inscription...');

        await SupabaseService.createRegistrationRequest({
          userType: profileData.role,
          email: credentials.email,
          name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
          company: profileData.company,
          phone: profileData.phone,
          metadata: profileData
        });

        // Envoyer email de notification
        try {
          await SupabaseService.sendRegistrationEmail({
            to: credentials.email,
            name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
            userType: profileData.role
          });
          console.log('✅ Email de confirmation envoyé');
        } catch (emailError) {
          console.warn('⚠️ Erreur envoi email:', emailError);
          // Ne pas bloquer l'inscription si l'email échoue
        }
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Erreur inscription:', error);
      return { error: error as Error };
    }
  },

  register: async (userData: RegistrationData) => {
    set({ isLoading: true });

    try {
      // Validation des données requises
      if (!userData.email || !userData.firstName || !userData.lastName || !userData.password) {
        throw new Error('Email, prénom, nom et mot de passe sont requis');
      }

      console.log('🔄 Création d\'utilisateur avec Supabase Auth...');

      const userType = (['admin','exhibitor','partner','visitor'].includes(userData.accountType ?? '') ? userData.accountType! : 'visitor') as User['type'];

      // Appeler la fonction signUp de SupabaseService qui gère Auth + profil
      const newUser = await SupabaseService.signUp(
        userData.email,
        userData.password,
        {
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
        }
      );

      if (!newUser) {
        throw new Error('Échec de la création de l\'utilisateur');
      }

      console.log('✅ Utilisateur créé avec succès:', newUser.email);

      // Créer une demande d'inscription pour exposants et partenaires
      if (userType === 'exhibitor' || userType === 'partner') {
        console.log('📝 Création de la demande d\'inscription...');
        await SupabaseService.createRegistrationRequest(newUser.id, {
          type: userType,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          company: userData.companyName ?? '',
          position: userData.position ?? '',
          phone: userData.phone ?? '',
          ...userData
        });

        // Envoyer l'email de confirmation
        console.log('📧 Envoi de l\'email de confirmation...');
        await SupabaseService.sendRegistrationEmail({
          userType: userType as 'exhibitor' | 'partner',
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          companyName: userData.companyName ?? ''
        });

        console.log('✅ Email de confirmation envoyé');
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
      console.log('🔄 Starting Google OAuth flow...');

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
      console.log('🔄 Starting LinkedIn OAuth flow...');

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
      console.log('🔄 Handling OAuth callback...');

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

      console.log('✅ OAuth callback handled successfully:', user.email);

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

  logout: () => {
    // CRITIQUE: Nettoyer TOUS les stores avant de déconnecter
    // Empêche les fuites de données sur ordinateurs partagés
    resetAllStores();

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
    user
  }),

  updateProfile: async (profileData: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) throw new Error('Utilisateur non connecté');

    set({ isLoading: true });

    try {
      const updatedUser = await SupabaseService.updateUser(user.id, {
        ...user,
        profile: { ...user.profile, ...profileData }
      });

      set({ user: updatedUser, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false });
      throw error instanceof Error ? error : new Error('Erreur lors de la mise à jour du profil');
    }
  }
}));

export { useAuthStore };
export default useAuthStore;