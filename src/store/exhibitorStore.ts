import { create } from 'zustand';
import { Exhibitor, TimeSlot } from '../types';
import { SupabaseService } from '../services/supabaseService';

interface ExhibitorState {
  exhibitors: Exhibitor[];
  filteredExhibitors: Exhibitor[];
  selectedExhibitor: Exhibitor | null;
  filters: {
    category: string;
    sector: string;
    country: string;
    search: string;
  };
  isLoading: boolean;
  isUpdating: string | null; // ID of the exhibitor being updated
  error: string | null;
  fetchExhibitors: () => Promise<void>;
  setFilters: (filters: Partial<ExhibitorState['filters']>) => void;
  selectExhibitor: (id: string) => void;
  updateAvailability: (exhibitorId: string, slots: TimeSlot[]) => void;
  updateExhibitorStatus: (exhibitorId: string, newStatus: 'approved' | 'rejected') => Promise<void>;
}

// Removed large inline mock dataset. The application now relies on Supabase for real data.

export const useExhibitorStore = create<ExhibitorState>((set, get) => ({
  exhibitors: [],
  filteredExhibitors: [],
  selectedExhibitor: null,
  filters: {
    category: '',
    sector: '',
    country: '',
    search: ''
  },
  isLoading: false,
  isUpdating: null,
  error: null,

  fetchExhibitors: async () => {
    set({ isLoading: true, error: null });
    try {
      // Requête Supabase avec relation explicite
      const exhibitors = await SupabaseService.getExhibitors();
      set({ 
        exhibitors, 
        filteredExhibitors: exhibitors,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Erreur lors du chargement des exposants:', error);
      
      // Message d'erreur simple et clair
      const errorMessage = error?.message || 'Erreur de connexion à la base de données';
      
      set({ 
        exhibitors: [],
        filteredExhibitors: [],
        isLoading: false,
        error: null  // Don't show error to user when Supabase is not configured
      });
    }
  },

	  updateExhibitorStatus: async (exhibitorId, newStatus) => {
	    set({ isUpdating: exhibitorId, error: null });
	    try {
	      const isVerified = newStatus === 'approved';
	      const userStatus = isVerified ? 'active' : 'rejected';
	
	      // Récupérer les données de l'exposant pour l'email
	      const exhibitorToUpdate = get().exhibitors.find(ex => ex.id === exhibitorId);
	      if (!exhibitorToUpdate) throw new Error('Exposant non trouvé dans le store');
	
	      // 1. Mettre à jour le statut 'verified' de l'exposant
	      await SupabaseService.updateExhibitor(exhibitorId, {
	        verified: isVerified,
	      });
	
	      // 2. Mettre à jour le statut de l'utilisateur (dans la table 'users')
	      await SupabaseService.updateUserStatus(exhibitorId, userStatus);
	
	      // 3. Envoyer l'email de validation/rejet
	      await SupabaseService.sendValidationEmail({
	        email: exhibitorToUpdate.contactInfo?.email || 'contact@siports.com', // Utiliser l'email de contact
	        firstName: 'Admin', // Placeholder, l'email doit être générique
	        lastName: 'Admin', // Placeholder
	        companyName: exhibitorToUpdate.companyName,
	        status: newStatus,
	      });
	
	      set(state => {
        const updateExhibitor = (ex: Exhibitor) => 
          ex.id === exhibitorId 
            ? { ...ex, verified: newStatus === 'approved' } 
            : ex;
        
        return {
          exhibitors: state.exhibitors.map(updateExhibitor),
          filteredExhibitors: state.filteredExhibitors.map(updateExhibitor),
          isUpdating: null
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      set({ isUpdating: null, error: errorMessage });
      // Optionnel: Revert state on error
    }
  },

  setFilters: (newFilters) => {
    const { exhibitors } = get();
    const filters = { ...get().filters, ...newFilters };
    
    const filtered = exhibitors.filter(exhibitor => {
      const matchesCategory = !filters.category || exhibitor.category === filters.category;
      const matchesSector = !filters.sector || exhibitor.sector.toLowerCase().includes(filters.sector.toLowerCase());
      const matchesSearch = !filters.search || 
        exhibitor.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        exhibitor.description.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesCategory && matchesSector && matchesSearch;
    });

    set({ filters, filteredExhibitors: filtered });
  },

  selectExhibitor: (id) => {
    const { exhibitors } = get();
    const exhibitor = exhibitors.find(e => e.id === id) || null;
    console.log('Selecting exhibitor with ID:', id, 'Found:', exhibitor);
    set({ selectedExhibitor: exhibitor });
  },

  updateAvailability: (exhibitorId, slots) => {
    const { exhibitors } = get();
    const updatedExhibitors = exhibitors.map(exhibitor =>
      exhibitor.id === exhibitorId
        ? { ...exhibitor, availability: slots }
        : exhibitor
    );
    set({ exhibitors: updatedExhibitors });
  }
}));