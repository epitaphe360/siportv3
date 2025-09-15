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

// Mock users pour la démonstration
const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@siports.com',
    name: 'Admin SIPORTS',
    type: 'admin',
    status: 'active',
    profile: minimalUserProfile({
      firstName: 'Admin',
      lastName: 'SIPORTS',
      company: 'SIPORTS Organization',
      position: 'Administrateur',
      country: 'Morocco',
      bio: 'Administrateur de la plateforme SIPORTS 2026'
    }),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  },
  {
    id: 'exhibitor-1',
    email: 'exposant@siports.com',
    name: 'Sarah Johnson',
    type: 'exhibitor',
    status: 'active',
    profile: minimalUserProfile({
      firstName: 'Sarah',
      lastName: 'Johnson',
      company: 'Port Solutions Inc.',
      position: 'CEO',
      country: 'Netherlands',
      bio: 'Expert en solutions portuaires',
      interests: ['Port Operations', 'Digital Transformation'],
      objectives: ['Showcase innovations', 'Find partners']
    }),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  },
  {
    id: 'partner-1',
    email: 'partenaire@siports.com',
    name: 'Ahmed El Mansouri',
    type: 'partner',
    status: 'active',
    profile: minimalUserProfile({
      firstName: 'Ahmed',
      lastName: 'El Mansouri',
      company: 'Autorité Portuaire Casablanca',
      position: 'Directeur Technique',
      country: 'Morocco',
      bio: 'Directeur technique avec expertise portuaire',
      interests: ['Infrastructure', 'Sustainability'],
      objectives: ['International cooperation', 'Technology adoption']
    }),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date()
  },
  {
    id: 'visitor-1',
    email: 'visiteur@siports.com',
    name: 'Marie Dubois',
    type: 'visitor',
    status: 'active',
    profile: minimalUserProfile({
      firstName: 'Marie',
      lastName: 'Dubois',
      company: 'Maritime Consulting France',
      position: 'Consultante Senior',
      country: 'France',
      bio: 'Consultante en solutions maritimes',
      interests: ['Consulting', 'Innovation'],
      objectives: ['Find suppliers', 'Technology scouting']
    }),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date()
  }
];


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
      // Pour la démo, vérifier les comptes de test
      const mockUser = mockUsers.find(u => u.email === email);
      
      if (mockUser && password === 'demo123') {
        set({ 
          user: mockUser, 
          token: 'mock-token', 
          isAuthenticated: true,
          isLoading: false 
        });
        return;
      }
      
      // Essayer de récupérer l'utilisateur depuis Supabase
      const user = await SupabaseService.getUserByEmail(email);
      
      if (user) {
        set({ 
          user, 
          token: 'supabase-token', 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        throw new Error('Email ou mot de passe incorrect');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
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
  await SupabaseService.createUser({
        email: String(ud.email ?? ''),
        name: `${String(ud.firstName ?? '')} ${String(ud.lastName ?? '')}`.trim(),
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
      
      set({ isLoading: false });
      // Ne pas connecter automatiquement, laisser l'utilisateur se connecter
      // On peut stocker un indicateur ou juste terminer silencieusement
    } catch (error) {
      set({ isLoading: false });
      throw error;
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