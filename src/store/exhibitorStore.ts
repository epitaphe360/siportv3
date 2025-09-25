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
const mockExhibitors: Exhibitor[] = [];

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
      // Log expanded Supabase error details to help debug 500 / PGRST errors
      try {
        const errObj = error || {};
        const serialized = JSON.stringify({
          message: errObj.message || errObj.msg || null,
          code: errObj.code || null,
          details: errObj.details || errObj.hint || null,
          status: errObj.status || null,
          body: errObj.response || errObj.body || null
        }, null, 2);
        console.warn('Supabase error (detailed):', serialized);
      } catch (e) {
        console.warn('Supabase error (could not serialize):', error);
      }

      // Do not fall back to inline mock data automatically. Use empty arrays and
      // surface an error so the UI can show a clear message and avoid serving
      // stale or local-only data.
      set({ 
        exhibitors: [],
        filteredExhibitors: [],
        isLoading: false,
        error: 'Impossible de charger les données réelles depuis Supabase. Voir console pour détails.'
      });
    }
  },

  updateExhibitorStatus: async (exhibitorId, newStatus) => {
    set({ isUpdating: exhibitorId, error: null });
    try {
      await SupabaseService.updateExhibitor(exhibitorId, {
        verified: newStatus === 'approved',
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