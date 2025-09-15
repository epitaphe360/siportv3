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

// Mock data
const mockExhibitors: Exhibitor[] = [
  {
    id: '1',
    userId: '1',
    companyName: 'Port Solutions Inc.',
    category: 'port-operations',
    sector: 'Port Management',
    description: 'Leading provider of integrated port management solutions, specializing in digital transformation and operational efficiency.',
    logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://portsolutions.com',
    products: [
      {
        id: '1',
        name: 'SmartPort Management System',
        description: 'Comprehensive port management platform with real-time analytics',
        category: 'Software',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
        specifications: 'Advanced port management software with AI analytics',
        featured: true,
        technicalSpecs: []
      }
    ],
    availability: [],
    miniSite: {
      id: '1',
      exhibitorId: '1',
      theme: 'modern',
      customColors: {
        primary: '#1e40af',
        secondary: '#3b82f6',
        accent: '#60a5fa'
      },
      sections: [],
      published: true,
      views: 0,
      lastUpdated: new Date('2024-01-15')
    },
    verified: true,
    featured: true,
    contactInfo: {
      email: 'contact@portsolutions.com',
      phone: '+33123456789',
      address: '456 Port Street',
      city: 'Le Havre',
      country: 'France'
    },
    certifications: ['ISO 9001', 'ISO 45001'],
    markets: ['Europe', 'Asia', 'Americas']
  },
  {
    id: '2',
    userId: '2',
    companyName: 'Maritime Tech Solutions',
    category: 'port-industry',
    sector: 'Equipment Manufacturing',
    description: 'Innovative manufacturer of port equipment and automation systems for modern maritime facilities.',
    logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://maritimetech.com',
    products: [
      {
        id: '2',
        name: 'Automated Crane System',
        description: 'Next-generation automated container handling cranes',
        category: 'Equipment',
        images: ['https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400'],
        specifications: 'Load capacity: 65 tons, Reach: 22 containers, Automation level: Level 4',
        featured: true,
        technicalSpecs: []
      }
    ],
    availability: [],
    miniSite: {
      id: '2',
      exhibitorId: '2',
      theme: 'industrial',
      customColors: {
        primary: '#dc2626',
        secondary: '#ef4444',
        accent: '#f87171'
      },
      sections: [],
      published: true,
      views: 890,
      lastUpdated: new Date()
    },
    verified: true,
    featured: false,
    contactInfo: {
      email: 'contact@maritimetech.com',
      phone: '+33123456789',
      address: '123 Industrial Zone',
      city: 'Marseille',
      country: 'France'
    },
    certifications: ['ISO 9001', 'ISO 14001'],
    markets: ['Europe', 'Africa', 'Middle East']
  },
  {
    id: '3',
    userId: '3',
    companyName: 'Global Port Authority',
    category: 'institutional',
    sector: 'Government',
    description: 'International organization promoting sustainable port development and maritime cooperation.',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://globalportauthority.org',
    products: [],
    availability: [],
    miniSite: {
      id: '3',
      exhibitorId: '3',
      theme: 'official',
      customColors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399'
      },
      sections: [],
      published: true,
      views: 2100,
      lastUpdated: new Date('2024-01-10')
    },
    verified: true,
    featured: true,
    contactInfo: {
      email: 'contact@globalportauthority.org',
      phone: '+33123456789',
      address: '789 Government Plaza',
      city: 'Paris',
      country: 'France'
    },
    certifications: ['UN Accreditation', 'ISO 9001'],
    markets: ['Global', 'Europe', 'Asia']
  }
  ,
  {
    id: '4',
    userId: '4',
    companyName: 'EcoPort Technologies',
    category: 'port-operations',
    sector: 'Green Technology',
    description: 'Pionnier des solutions portuaires durables et des technologies vertes pour la transition énergétique des ports.',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    website: 'https://ecoport-tech.com',
    products: [
      {
        id: '4',
        name: 'Green Port Energy System',
        description: 'Système énergétique durable pour ports avec panneaux solaires et éoliennes',
        category: 'Green Technology',
        images: ['https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'],
        specifications: 'Capacité: 50MW, Réduction CO2: 80%, Autonomie énergétique: 95%',
        featured: true,
        technicalSpecs: []
      }
    ],
    availability: [],
    miniSite: {
      id: '4',
      exhibitorId: '4',
      theme: 'eco',
      customColors: {
        primary: '#059669',
        secondary: '#10b981',
        accent: '#34d399'
      },
      sections: [],
      published: true,
      views: 1680,
      lastUpdated: new Date('2024-01-12')
    },
    verified: true,
    featured: true,
    contactInfo: {
      email: 'contact@ecoport-tech.com',
      phone: '+33123456789',
      address: '321 Green Tech Park',
      city: 'Lyon',
      country: 'France'
    },
    certifications: ['ISO 14001', 'GreenTech Certified'],
    markets: ['Europe', 'North America', 'Asia-Pacific']
  }
];

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
      // Try to fetch from Supabase first
      const exhibitors = await SupabaseService.getExhibitors();
      
      set({ 
        exhibitors, 
        filteredExhibitors: exhibitors,
        isLoading: false 
      });
    } catch (error) {
      console.warn('Supabase error, trying server fallback:', error);
      try {
        // Fallback to server endpoint
        const response = await fetch('http://localhost:4002/exhibitors?secret=dev-secret');
        if (!response.ok) throw new Error('Server fallback failed: ' + response.statusText);
        const data = await response.json();
        const raw = data.exhibitors || [];
        // Map raw DB objects into Exhibitor shape
        const exhibitors = raw.map(SupabaseService.mapExhibitorFromDB);
        set({ 
          exhibitors, 
          filteredExhibitors: exhibitors,
          isLoading: false 
        });
      } catch (serverError) {
        console.warn('Server fallback failed, using mock data:', serverError);
        set({ 
          exhibitors: mockExhibitors, 
          filteredExhibitors: mockExhibitors,
          isLoading: false,
          error: 'Could not connect to the database. Displaying sample data.'
        });
      }
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