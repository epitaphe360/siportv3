import { create } from 'zustand';
import { Event, Speaker, EventRegistration } from '../types';
import useAuthStore from './authStore';

interface EventState {
  events: Event[];
  featuredEvents: Event[];
  registeredEvents: string[];
  userEventRegistrations: EventRegistration[];
  isLoading: boolean;
  
  // Actions
  fetchEvents: () => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  unregisterFromEvent: (eventId: string) => Promise<void>;
  getEventsByCategory: (category: string) => Event[];
  getUpcomingEvents: () => Event[];
  fetchUserEventRegistrations: () => Promise<void>;
}

const mockSpeakers: Speaker[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Directrice Innovation',
    company: 'Global Port Solutions',
    bio: 'Experte en digitalisation portuaire avec plus de 15 ans d\'expérience',
    avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    expertise: ['Digital Transformation', 'Port Operations', 'IoT']
  },
  {
    id: '2',
    name: 'Ahmed El Mansouri',
    title: 'Directeur Technique',
    company: 'Autorité Portuaire de Casablanca',
    bio: 'Spécialiste en infrastructure portuaire et développement durable',
    avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
    expertise: ['Infrastructure', 'Sustainability', 'Port Management']
  }
];

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Digitalisation des Ports : Enjeux et Opportunités',
    description: 'Table ronde sur les technologies émergentes dans le secteur portuaire et leur impact sur l\'efficacité opérationnelle.',
    type: 'roundtable',
    date: new Date('2026-02-05T14:00:00'),
    startTime: '14:00',
    endTime: '15:30',
    capacity: 50,
    registered: 32,
    speakers: [mockSpeakers[0]],
    category: 'Digital Transformation',
    virtual: false,
    featured: true,
    location: 'Salle de conférence A',
    tags: ['digitalisation', 'innovation', 'technologie']
  },
  {
    id: '2',
    title: 'Speed Networking : Opérateurs Portuaires',
    description: 'Session de réseautage rapide dédiée aux opérateurs et gestionnaires de terminaux portuaires.',
    type: 'networking',
    date: new Date('2026-02-06T10:30:00'),
    startTime: '10:30',
    endTime: '12:00',
    capacity: 80,
    registered: 65,
    speakers: [],
    category: 'Networking',
    virtual: false,
    featured: true,
    location: 'Espace networking B',
    tags: ['networking', 'opérateurs', 'partenariats']
  },
  {
    id: '3',
    title: 'Ports Durables : Transition Énergétique',
    description: 'Webinaire sur les stratégies de transition énergétique dans les ports et les solutions innovantes.',
    type: 'webinar',
    date: new Date('2026-02-07T16:00:00'),
    startTime: '16:00',
    endTime: '17:00',
    capacity: 200,
    registered: 145,
    speakers: [mockSpeakers[1]],
    category: 'Sustainability',
    virtual: true,
    featured: false,
    meetingLink: 'https://meet.google.com/sustainability-ports',
    tags: ['durabilité', 'énergie', 'environnement']
  },
  {
    id: '4',
    title: 'Atelier : Gestion des Données Portuaires',
    description: 'Atelier pratique sur l\'utilisation des données pour optimiser les opérations portuaires.',
    type: 'workshop',
    date: new Date('2026-02-06T09:00:00'),
    startTime: '09:00',
    endTime: '11:00',
    capacity: 25,
    registered: 18,
    speakers: [mockSpeakers[0]],
    category: 'Data Management',
    virtual: false,
    featured: false,
    location: 'Salle d\'atelier C',
    tags: ['données', 'analytics', 'optimisation']
  },
  {
    id: '5',
    title: 'Conférence : L\'Avenir du Transport Maritime',
    description: 'Conférence magistrale sur les tendances futures du transport maritime et l\'impact sur les ports.',
    type: 'conference',
    date: new Date('2026-02-05T09:00:00'),
    startTime: '09:00',
    endTime: '10:00',
    capacity: 300,
    registered: 280,
    speakers: [mockSpeakers[0], mockSpeakers[1]],
    category: 'Maritime Transport',
    virtual: false,
    featured: true,
    location: 'Auditorium principal',
    tags: ['transport', 'maritime', 'avenir']
  }
];

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  featuredEvents: [],
  registeredEvents: [],
  userEventRegistrations: [],
  isLoading: false,

  fetchEvents: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const featuredEvents = mockEvents.filter(event => event.featured);
      set({ 
        events: mockEvents,
        featuredEvents,
        isLoading: false 
      });
    } catch {
      set({ isLoading: false });
    }
  },

  registerForEvent: async (eventId) => {
    const { user, isAuthenticated } = useAuthStore.getState();
    
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour vous inscrire à un événement.');
    }

    const { registeredEvents, events } = get();
    if (!registeredEvents.includes(eventId)) {
      const updatedEvents = events.map(event =>
        event.id === eventId
          ? { ...event, registered: event.registered + 1 }
          : event
      );
      
      set({ 
        registeredEvents: [...registeredEvents, eventId],
        events: updatedEvents
      });
    }
  },

  unregisterFromEvent: async (eventId) => {
    const { user, isAuthenticated } = useAuthStore.getState();
    
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour vous désinscrire d\'un événement.');
    }

    const { registeredEvents, events } = get();
    const updatedRegistered = registeredEvents.filter(id => id !== eventId);
    const updatedEvents = events.map(event =>
      event.id === eventId
        ? { ...event, registered: Math.max(0, event.registered - 1) }
        : event
    );
    
    set({ 
      registeredEvents: updatedRegistered,
      events: updatedEvents
    });
  },

  getEventsByCategory: (category) => {
    const { events } = get();
    return events.filter(event => event.category === category);
  },

  getUpcomingEvents: () => {
    const { events } = get();
    const now = new Date();
    return events
      .filter(event => event.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  },

  fetchUserEventRegistrations: async () => {
    const { user, isAuthenticated } = useAuthStore.getState();
    
    if (!isAuthenticated || !user) {
      set({ userEventRegistrations: [] });
      return;
    }

    set({ isLoading: true });
    try {
      // In a real implementation, this would call SupabaseService.getEventRegistrations
      // For now, we'll use mock data
      const mockRegistrations: EventRegistration[] = mockEvents
        .filter(event => get().registeredEvents.includes(event.id))
        .map(event => ({
          id: `reg-${event.id}`,
          eventId: event.id,
          userId: user.id,
          registrationType: 'attendee',
          status: 'confirmed',
          registrationDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      
      set({ 
        userEventRegistrations: mockRegistrations,
        isLoading: false 
      });
    } catch {
      set({ isLoading: false });
    }
  }
}));