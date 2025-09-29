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

// Utilisateurs de test pour développement uniquement
const TEST_CREDENTIALS = {
  'admin@siports.com': { password: 'admin123', type: 'admin' as const },
  'exposant@siports.com': { password: 'expo123', type: 'exhibitor' as const },
  'partenaire@siports.com': { password: 'partner123', type: 'partner' as const },
  'visiteur@siports.com': { password: 'visitor123', type: 'visitor' as const },
};


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
      // Validation des entrées
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      // Connexion directe via Supabase
      
      // Vérification des credentials de test pour développement
      const testCred = TEST_CREDENTIALS[email as keyof typeof TEST_CREDENTIALS];
      if (testCred && password === testCred.password) {
        // Créer un utilisateur temporaire pour le test
        const testUser: User = {
          id: `test-${Date.now()}`,
          email,
          name: email.split('@')[0],
          type: testCred.type,
          status: 'active',
          profile: minimalUserProfile({
            firstName: email.split('@')[0],
            lastName: 'Test',
            country: 'Morocco'
          }),
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set({ 
          user: testUser, 
          token: 'test-token', 
          isAuthenticated: true,
          isLoading: false 
        });
        return;
      }

      // Tentative de connexion via Supabase
      try {
        console.log('🔄 Tentative de connexion Supabase pour:', email);
        const user = await SupabaseService.getUserByEmail(email);
        
        if (user) {
          console.log('✅ Utilisateur Supabase trouvé:', user.email);
          set({ 
            user, 
            token: 'supabase-token', 
            isAuthenticated: true,
            isLoading: false 
          });
          return;
        }
      } catch (supabaseError) {
        console.warn('⚠️ Erreur Supabase lors de la connexion:', supabaseError);
      }
      
      // Si aucune méthode n'a fonctionné
      throw new Error('Email ou mot de passe incorrect');
      
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      set({ isLoading: false });
      throw new Error(error?.message || 'Erreur de connexion');
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

  register: async (userData: Record<string, unknown>) => {
    set({ isLoading: true });
    
    try {
      const ud = userData as Record<string, unknown>;
      
      // Validation des données requises
      if (!ud.email || !ud.firstName || !ud.lastName) {
        throw new Error('Email, prénom et nom sont requis');
      }

      console.log('🔄 Création d\'utilisateur avec Supabase...');
      
      const newUser = await SupabaseService.createUser({
        email: String(ud.email),
        name: `${String(ud.firstName)} ${String(ud.lastName)}`.trim(),
        type: (['admin','exhibitor','partner','visitor'].includes(String(ud.accountType)) ? String(ud.accountType) : 'visitor') as User['type'],
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
      });
      
      console.log('✅ Utilisateur créé avec succès:', newUser.email);
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