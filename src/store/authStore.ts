import { create } from 'zustand';
import { SupabaseService } from '../services/supabaseService';
import GoogleAuthService from '../services/googleAuth';
import LinkedInAuthService from '../services/linkedinAuth';
import { User, UserProfile } from '../types';

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
  login: (email: string, password: string) => Promise<void>;
  signUp: (credentials: { email: string, password: string }, profileData: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  register: (userData: RegistrationData) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
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
  
  login: async (email: string, password: string) => {
    set({ isLoading: true });

    try {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      console.log('🔄 Connexion via Supabase pour:', email);

      const user = await SupabaseService.signIn(email, password);

      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      if (user.status && user.status !== 'active') {
        throw new Error('Votre compte est en attente de validation');
      }

      console.log('✅ Utilisateur authentifié:', user.email);

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
      // Ici, vous appelleriez votre service Supabase pour créer l'utilisateur
      // const { data, error } = await supabase.auth.signUp(credentials);
      // if (error) throw error;

      // Puis, insérer le profil dans votre table 'profiles'
      // await supabase.from('profiles').insert([{ id: data.user.id, ...profileData }]);
      
      console.log("Simulating sign up for:", credentials.email, "with data:", profileData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simule l'appel réseau

      return { error: null };
    } catch (error) {
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
      const user = await GoogleAuthService.signInWithGoogle();
      set({ 
        user, 
        token: 'google-token', 
        isAuthenticated: true,
        isGoogleLoading: false 
      });
    } catch (error) {
      set({ isGoogleLoading: false });
      throw error;
    }
  },

  loginWithLinkedIn: async () => {
    set({ isLinkedInLoading: true });
    
    try {
      const user = await LinkedInAuthService.signInWithLinkedIn();
      set({ 
        user, 
        token: 'linkedin-token', 
        isAuthenticated: true,
        isLinkedInLoading: false 
      });
    } catch (error) {
      set({ isLinkedInLoading: false });
      throw error;
    }
  },
  
  logout: () => set({ 
    user: null,
    token: null,
    isAuthenticated: false
  }),
  
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