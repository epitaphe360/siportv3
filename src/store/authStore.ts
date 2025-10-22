import { create } from 'zustand';
import { SupabaseService } from '../services/supabaseService';
import GoogleAuthService from '../services/googleAuth';
import LinkedInAuthService from '../services/linkedinAuth';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isLinkedInLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signUp: (credentials: { email: string, password: string }, profileData: Record<string, unknown>) => Promise<{ error: Error | null }>;
  register: (userData: Record<string, unknown>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithLinkedIn: () => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  updateProfile: (profileData: Record<string, unknown>) => Promise<void>;
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

    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      set({ isLoading: false });
      throw new Error(error?.message || 'Erreur de connexion');
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

  register: async (userData: Record<string, unknown>) => {
    set({ isLoading: true });

    try {
      const ud = userData as Record<string, unknown>;

      // Validation des données requises
      if (!ud.email || !ud.firstName || !ud.lastName || !ud.password) {
        throw new Error('Email, prénom, nom et mot de passe sont requis');
      }

      console.log('🔄 Création d\'utilisateur avec Supabase Auth...');

      const userType = (['admin','exhibitor','partner','visitor'].includes(String(ud.accountType)) ? String(ud.accountType) : 'visitor') as User['type'];

      // Appeler la fonction signUp de SupabaseService qui gère Auth + profil
      const newUser = await SupabaseService.signUp(
        String(ud.email),
        String(ud.password),
        {
          name: `${String(ud.firstName)} ${String(ud.lastName)}`.trim(),
          type: userType,
          profile: minimalUserProfile({
            firstName: String(ud.firstName ?? ''),
            lastName: String(ud.lastName ?? ''),
            company: String(ud.companyName ?? ''),
            position: String(ud.position ?? ''),
            country: String(ud.country ?? ''),
            phone: String(ud.phone ?? ''),
            linkedin: String(ud.linkedin ?? ''),
            website: String(ud.website ?? ''),
            bio: String(ud.description ?? ''),
            objectives: (Array.isArray(ud.objectives) ? (ud.objectives as string[]) : [])
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
          email: String(ud.email),
          firstName: String(ud.firstName),
          lastName: String(ud.lastName),
          company: String(ud.companyName ?? ''),
          position: String(ud.position ?? ''),
          phone: String(ud.phone ?? ''),
          ...ud
        });

        // Envoyer l'email de confirmation
        console.log('📧 Envoi de l\'email de confirmation...');
        await SupabaseService.sendRegistrationEmail({
          userType: userType as 'exhibitor' | 'partner',
          email: String(ud.email),
          firstName: String(ud.firstName),
          lastName: String(ud.lastName),
          companyName: String(ud.companyName ?? '')
        });

        console.log('✅ Email de confirmation envoyé');
      }

      set({ isLoading: false });

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'inscription:', error);
      set({ isLoading: false });
      throw new Error(error?.message || 'Erreur lors de l\'inscription');
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

  updateProfile: async (profileData: Record<string, unknown>) => {
    const { user } = get();
    if (!user) throw new Error('Utilisateur non connecté');
    
    set({ isLoading: true });
    
    try {
      const pd = profileData as Record<string, unknown>;
      const updatedUser = await SupabaseService.updateUser(user.id, {
        ...user,
        profile: { ...user.profile, ...pd }
      });
      
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));

export { useAuthStore };
export default useAuthStore;