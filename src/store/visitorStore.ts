import { create } from 'zustand';

interface VisitorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  visitorType?: 'individual' | 'freelancer' | 'company'; // Nouveau champ pour distinguer le type de visiteur
  company?: string; // Optionnel pour les particuliers
  position?: string; // Optionnel pour les particuliers
  professionalStatus?: string; // Statut professionnel pour particuliers/freelancers
  businessSector?: string; // Secteur d'activité pour freelancers
  country: string;
  phone: string;
  avatar?: string;
  passType: 'free' | 'basic' | 'premium' | 'vip';
  registrationStatus: 'pending' | 'confirmed' | 'cancelled';
  
  // Spécifique aux visiteurs
  sectorsOfInterest: string[];
  visitObjectives: string[];
  competencies: string[];
  expertises: string[];
  
  // Préférences
  thematicInterests: string[];
  preferredLanguage: string;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

interface Appointment {
  id: string;
  title: string;
  company: string;
  contactPerson: string;
  date: Date;
  time: string;
  duration: number;
  location: string;
  type: 'b2b' | 'conference' | 'workshop' | 'networking';
  status: 'pending' | 'confirmed' | 'cancelled';
  description?: string;
  meetingLink?: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  speaker: string;
  category: string;
  capacity: number;
  registered: number;
}

interface FavoriteExhibitor {
  id: string;
  name: string;
  sector: string;
  description: string;
  logo: string;
  pavilion: string;
  standNumber: string;
  website?: string;
}

interface Connection {
  id: string;
  name: string;
  company: string;
  position: string;
  avatar: string;
  type: 'exhibitor' | 'visitor' | 'partner';
  connectedAt: Date;
  lastInteraction?: Date;
}

interface Message {
  id: string;
  senderName: string;
  senderAvatar: string;
  preview: string;
  timestamp: Date;
  read: boolean;
  type: 'direct' | 'group' | 'system';
}

interface Notification {
  id: string;
  type: 'appointment' | 'message' | 'system' | 'reminder';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface SalonInfo {
  name: string;
  dates: {
    start: Date;
    end: Date;
  };
  location: {
    venue: string;
    city: string;
    country: string;
    address: string;
  };
  hours: {
    opening: string;
    closing: string;
  };
  stats: {
    exhibitors: number;
    visitors: number;
    conferences: number;
    countries: number;
  };
}

interface VisitorAgenda {
  appointments: Appointment[];
  guaranteedMeetings: {
    total: number;
    used: number;
    remaining: number;
  };
  personalEvents: unknown[];
}

interface VisitorState {
  visitorProfile: VisitorProfile | null;
  agenda: VisitorAgenda;
  favoriteExhibitors: FavoriteExhibitor[];
  registeredSessions: Session[];
  connections: Connection[];
  messages: Message[];
  notifications: Notification[];
  salonInfo: SalonInfo;
  isLoading: boolean;
  
  // Actions
  fetchVisitorData: () => Promise<void>;
  updateProfile: (profileData: Partial<VisitorProfile>) => Promise<void>;
  addToFavorites: (exhibitorId: string) => Promise<void>;
  removeFromFavorites: (exhibitorId: string) => Promise<void>;
  registerForSession: (sessionId: string) => Promise<void>;
  unregisterFromSession: (sessionId: string) => Promise<void>;
  sendMeetingRequest: (exhibitorId: string, message: string, preferredDate: Date) => Promise<void>;
  acceptMeetingRequest: (requestId: string) => Promise<void>;
  rejectMeetingRequest: (requestId: string) => Promise<void>;
  sendMessage: (recipientId: string, message: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => void;
  updateNotificationPreferences: (preferences: Partial<VisitorProfile['notificationPreferences']>) => Promise<void>;
}

// Mock data
const mockVisitorProfile: VisitorProfile = {
  id: 'visitor1',
  firstName: 'Marie',
  lastName: 'Dubois',
  email: 'marie.dubois@maritime-consulting.fr',
  visitorType: 'company', // Par défaut entreprise pour cet exemple
  company: 'Maritime Consulting France',
  position: 'Consultante Senior',
  professionalStatus: '',
  businessSector: '',
  country: 'France',
  phone: '+33 1 23 45 67 89',
  avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
  passType: 'premium',
  registrationStatus: 'confirmed',
  sectorsOfInterest: [
    'Port Operations',
    'Digital Transformation',
    'Sustainability',
    'Maritime Technology'
  ],
  visitObjectives: [
    'Recherche de fournisseurs',
    'Veille technologique',
    'Opportunités de partenariat',
    'Formation continue'
  ],
  competencies: [
    'Gestion de projet portuaire',
    'Analyse de performance',
    'Consulting stratégique',
    'Transformation digitale'
  ],
  expertises: [
    'Port Management',
    'Supply Chain',
    'Digital Strategy',
    'Process Optimization'
  ],
  thematicInterests: [
    'Technologies maritimes',
    'Énergies renouvelables',
    'Logistique portuaire',
    'Innovation digitale'
  ],
  preferredLanguage: 'fr',
  notificationPreferences: {
    email: true,
    push: true,
    inApp: true
  }
};

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Rendez-vous avec Port Solutions Inc.',
    company: 'Port Solutions Inc.',
    contactPerson: 'Sarah Johnson',
    date: new Date('2026-02-05T14:00:00'),
    time: '14:00',
    duration: 30,
    location: 'Stand A-12',
    type: 'b2b',
    status: 'confirmed',
    description: 'Discussion sur les solutions de gestion portuaire'
  },
  {
    id: '2',
    title: 'Conférence: Digitalisation des Ports',
    company: 'SIPORTS',
    contactPerson: 'Dr. Ahmed El Mansouri',
    date: new Date('2026-02-06T10:30:00'),
    time: '10:30',
    duration: 90,
    location: 'Auditorium Principal',
    type: 'conference',
    status: 'confirmed',
    description: 'Table ronde sur les enjeux de la digitalisation'
  },
  {
    id: '3',
    title: 'Atelier: Ports Durables',
    company: 'Green Port Initiative',
    contactPerson: 'Dr. Maria Santos',
    date: new Date('2026-02-07T09:00:00'),
    time: '09:00',
    duration: 120,
    location: 'Salle Workshop B',
    type: 'workshop',
    status: 'pending',
    description: 'Atelier pratique sur la transition énergétique'
  }
];

const mockFavoriteExhibitors: FavoriteExhibitor[] = [
  {
    id: '1',
    name: 'Port Solutions Inc.',
    sector: 'Port Management',
    description: 'Leading provider of integrated port management solutions',
    logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
    pavilion: 'Industrie Portuaire',
    standNumber: 'A-12',
    website: 'https://portsolutions.com'
  },
  {
    id: '2',
    name: 'Maritime Tech Solutions',
    sector: 'Equipment Manufacturing',
    description: 'Innovative manufacturer of port equipment and automation systems',
    logo: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200',
    pavilion: 'Performance & Exploitation',
    standNumber: 'B-08',
    website: 'https://maritimetech.com'
  },
  {
    id: '3',
    name: 'Green Port Initiative',
    sector: 'Sustainability',
    description: 'Promoting sustainable port development worldwide',
    logo: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200',
    pavilion: 'Académique & Formation',
    standNumber: 'C-15'
  }
];

const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    company: 'Port Solutions Inc.',
    position: 'CEO',
    avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'exhibitor',
    connectedAt: new Date('2024-01-15'),
    lastInteraction: new Date('2024-01-20')
  },
  {
    id: '2',
    name: 'Ahmed El Mansouri',
    company: 'Autorité Portuaire Casablanca',
    position: 'Directeur Technique',
    avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'partner',
    connectedAt: new Date('2024-01-18'),
    lastInteraction: new Date('2024-01-22')
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    senderName: 'Sarah Johnson',
    senderAvatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
    preview: 'Merci pour votre intérêt pour nos solutions. Je confirme notre RDV de demain à 14h.',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    type: 'direct'
  },
  {
    id: '2',
    senderName: 'SIPORTS Organisateurs',
    senderAvatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=100',
    preview: 'Nouveau: Programme des conférences mis à jour avec 5 nouvelles sessions.',
    timestamp: new Date(Date.now() - 7200000),
    read: true,
    type: 'system'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'reminder',
    title: 'Rappel de rendez-vous',
    message: 'Votre rendez-vous avec Port Solutions Inc. commence dans 1 heure',
    timestamp: new Date(Date.now() - 1800000),
    read: false,
    actionUrl: '/appointments/1'
  },
  {
    id: '2',
    type: 'system',
    title: 'Nouveau contenu disponible',
    message: 'Maritime Tech Solutions a publié son nouveau catalogue produits',
    timestamp: new Date(Date.now() - 3600000),
    read: false,
    actionUrl: '/exhibitors/2'
  },
  {
    id: '3',
    type: 'message',
    title: 'Nouveau message',
    message: 'Sarah Johnson vous a envoyé un message',
    timestamp: new Date(Date.now() - 5400000),
    read: true,
    actionUrl: '/messages/1'
  }
];

const mockSalonInfo: SalonInfo = {
  name: 'SIPORTS 2026',
  dates: {
    start: new Date('2026-02-05T09:30:00'),
    end: new Date('2026-02-07T18:00:00')
  },
  location: {
    venue: 'Mohammed VI Exhibition Center',
    city: 'El Jadida',
    country: 'Maroc',
    address: 'Route de Casablanca, El Jadida 24000, Maroc'
  },
  hours: {
    opening: '09:30',
    closing: '18:00'
  },
  stats: {
    exhibitors: 330,
    visitors: 6300,
    conferences: 40,
    countries: 42
  }
};

const mockRegisteredSessions: Session[] = [
  {
    id: '1',
    title: 'Digitalisation des Ports : Enjeux et Opportunités',
    description: 'Table ronde sur les technologies émergentes dans le secteur portuaire',
    date: new Date('2026-02-05T14:00:00'),
    startTime: '14:00',
    endTime: '15:30',
    location: 'Salle de conférence A',
    speaker: 'Dr. Sarah Johnson',
    category: 'Digital Transformation',
    capacity: 50,
    registered: 32
  },
  {
    id: '2',
    title: 'Ports Durables : Transition Énergétique',
    description: 'Stratégies de transition énergétique dans les ports',
    date: new Date('2026-02-06T16:00:00'),
    startTime: '16:00',
    endTime: '17:00',
    location: 'Auditorium Principal',
    speaker: 'Dr. Ahmed El Mansouri',
    category: 'Sustainability',
    capacity: 200,
    registered: 145
  }
];

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitorProfile: null,
  agenda: {
    appointments: [],
    guaranteedMeetings: { total: 5, used: 2, remaining: 3 },
    personalEvents: []
  },
  favoriteExhibitors: [],
  registeredSessions: [],
  connections: [],
  messages: [],
  notifications: [],
  salonInfo: mockSalonInfo,
  isLoading: false,

  fetchVisitorData: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set({
        visitorProfile: mockVisitorProfile,
        agenda: {
          appointments: mockAppointments,
          guaranteedMeetings: { total: 5, used: 2, remaining: 3 },
          personalEvents: []
        },
        favoriteExhibitors: mockFavoriteExhibitors,
        registeredSessions: mockRegisteredSessions,
        connections: mockConnections,
        messages: mockMessages,
        notifications: mockNotifications,
        isLoading: false
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profileData: Partial<VisitorProfile>) => {
    const { visitorProfile } = get();
    if (visitorProfile) {
      set({
        visitorProfile: { ...visitorProfile, ...profileData }
      });
    }
  },

  addToFavorites: async (exhibitorId: string) => {
    // Mock implementation - would call API
    const newFavorite: FavoriteExhibitor = {
      id: exhibitorId,
      name: 'Nouvel Exposant',
      sector: 'Technology',
      description: 'Description de l\'exposant',
      logo: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
      pavilion: 'Industrie Portuaire',
      standNumber: 'A-XX'
    };
    
    const { favoriteExhibitors } = get();
    set({ favoriteExhibitors: [...favoriteExhibitors, newFavorite] });
  },

  removeFromFavorites: async (exhibitorId: string) => {
    const { favoriteExhibitors } = get();
    set({ 
      favoriteExhibitors: favoriteExhibitors.filter(e => e.id !== exhibitorId) 
    });
  },

  registerForSession: async (_sessionId: string) => {
  // Mock implementation (no-op)
  void _sessionId;
  },

  unregisterFromSession: async (sessionId: string) => {
    const { registeredSessions } = get();
    set({ 
      registeredSessions: registeredSessions.filter(s => s.id !== sessionId) 
    });
  },

  sendMeetingRequest: async (_exhibitorId: string, _message: string, preferredDate: Date) => {
    // Mock implementation
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      title: 'Nouveau rendez-vous',
      company: 'Exposant',
      contactPerson: 'Contact',
      date: preferredDate,
      time: '14:00',
      duration: 30,
      location: 'À définir',
      type: 'b2b',
      status: 'pending',
  description: _message
    };

  // Ensure unused params are referenced to satisfy linter
  void _exhibitorId;
  const { agenda } = get();
    set({
      agenda: {
        ...agenda,
        appointments: [...agenda.appointments, newAppointment]
      }
    });
  },

  acceptMeetingRequest: async (requestId: string) => {
    const { agenda } = get();
    const updatedAppointments = agenda.appointments.map(app =>
      app.id === requestId ? { ...app, status: 'confirmed' as const } : app
    );
    
    set({
      agenda: { ...agenda, appointments: updatedAppointments }
    });
  },

  rejectMeetingRequest: async (requestId: string) => {
    const { agenda } = get();
    const updatedAppointments = agenda.appointments.map(app =>
      app.id === requestId ? { ...app, status: 'cancelled' as const } : app
    );
    
    set({
      agenda: { ...agenda, appointments: updatedAppointments }
    });
  },

  sendMessage: async (_recipientId: string, _message: string) => {
  // Mock implementation (no-op)
  void _recipientId; void _message;
  },

  markNotificationAsRead: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
  },

  updateNotificationPreferences: async (preferences: Partial<VisitorProfile['notificationPreferences']>) => {
    const { visitorProfile } = get();
    if (visitorProfile) {
      set({
        visitorProfile: {
          ...visitorProfile,
          notificationPreferences: { ...visitorProfile.notificationPreferences, ...preferences }
        }
      });
    }
  }
}));