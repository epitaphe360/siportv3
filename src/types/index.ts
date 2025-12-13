export interface User {
  id: string;
  email: string;
  name: string;
  type: 'exhibitor' | 'partner' | 'visitor' | 'admin';
  visitor_level?: 'free' | 'basic' | 'premium' | 'vip';
  profile: UserProfile;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  visitorType?: 'individual' | 'freelancer' | 'company'; // Nouveau champ pour distinguer le type de visiteur
  company?: string;
  position?: string;
  professionalStatus?: string; // Statut professionnel pour particuliers/freelancers
  businessSector?: string; // Secteur d'activité pour freelancers
  country: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  bio?: string;
  interests: string[];
  objectives: string[];
  companyDescription?: string;
  sectors: string[];
  products: string[];
  videos: string[];
  images: string[];
  participationObjectives: string[];
  thematicInterests: string[];
  companySize?: string;
  geographicLocation?: string;
  collaborationTypes: string[];
  expertise: string[];
  visitObjectives?: string[];
  competencies?: string[];
  // Networking system fields
  passType?: 'free' | 'basic' | 'premium' | 'vip';
  status?: 'active' | 'pending' | 'suspended' | 'rejected';
  // Exhibitor specific fields
  standNumber?: string; // Numéro de stand pour les exposants
}

export interface Exhibitor {
  id: string;
  userId: string;
  companyName: string;
  category: ExhibitorCategory;
  sector: string;
  description: string;
  logo?: string;
  website?: string;
  products: Product[];
  availability: TimeSlot[];
  miniSite: MiniSite | null;
  verified: boolean;
  featured: boolean;
  contactInfo: ContactInfo;
  certifications: string[];
  establishedYear?: number;
  employeeCount?: string;
  revenue?: string;
  markets: string[];
  standNumber?: string; // Numéro de stand pour la carte interactive
}

export interface Partner {
  id: string;
  userId: string;
  organizationName: string;
  partnerType: 'institutional' | 'platinum' | 'gold' | 'silver' | 'bronze';
  sector: string;
  country: string;
  website?: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactPosition: string;
  sponsorshipLevel: string;
  contractValue?: string;
  contributions: string[];
  establishedYear?: number;
  employees?: string;
  logo?: string;
  featured: boolean;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  zipCode?: string;
}

export type ExhibitorCategory = 
  | 'institutional' 
  | 'port-industry' 
  | 'port-operations' 
  | 'academic';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  specifications?: string;
  brochure?: string;
  price?: number;
  featured: boolean;
  technicalSpecs: TechnicalSpec[];
}

export interface TechnicalSpec {
  name: string;
  value: string;
  unit?: string;
}

export interface MiniSite {
  id: string;
  exhibitorId: string;
  theme: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  sections: MiniSiteSection[];
  published: boolean;
  views: number;
  lastUpdated: Date;
}

export interface MiniSiteSection {
  id: string;
  type: 'hero' | 'about' | 'products' | 'news' | 'gallery' | 'team' | 'certifications';
  title: string;
  content: unknown;
  order: number;
  visible: boolean;
}

export interface TimeSlot {
  id: string;
  // userId links the timeslot to the owner (exhibitor/partner user id)
  userId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'in-person' | 'virtual' | 'hybrid';
  maxBookings: number;
  currentBookings: number;
  available: boolean;
  location?: string;
}

export interface Appointment {
  id: string;
  exhibitorId: string;
  visitorId: string;
  timeSlotId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message?: string;
  notes?: string;
  rating?: number;
  createdAt: Date;
  meetingType: 'in-person' | 'virtual' | 'hybrid';
  meetingLink?: string;
  // Relations pour affichage
  exhibitor?: {
    id: string;
    name: string;
    companyName?: string;
    avatar?: string;
  };
  visitor?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'system';
  timestamp: Date;
  read: boolean;
  translated?: boolean;
  originalLanguage?: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NetworkingRecommendation {
  id: string;
  userId: string;
  recommendedUserId: string;
  score: number;
  reasons: string[];
  category: string;
  viewed: boolean;
  contacted: boolean;
  mutualConnections: number;
  recommendedUser: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'conference' | 'workshop' | 'networking' | 'exhibition';
  // DB uses start_date and end_date (timestamptz)
  startDate: Date;
  endDate: Date;
  capacity?: number;
  registered: number;
  // Optional fields from DB
  location?: string;
  pavilionId?: string;
  organizerId?: string;
  featured: boolean;
  imageUrl?: string;
  registrationUrl?: string;
  tags: string[];
  // Legacy/computed fields for backward compatibility
  date?: Date;  // Alias for startDate
  startTime?: string;  // Computed from startDate
  endTime?: string;  // Computed from endDate
  speakers?: Speaker[];  // Legacy field
  category?: string;  // Legacy field
  virtual?: boolean;  // Legacy field
  meetingLink?: string;  // Legacy field
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  avatar?: string;
  linkedin?: string;
  expertise: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  featured: boolean;
  image?: string;
  readTime: number;
}

export interface Dashboard {
  stats: DashboardStats;
  recentActivity: Activity[];
  upcomingEvents: Event[];
  recommendations: NetworkingRecommendation[];
}

export interface DashboardStats {
  profileViews: number;
  connections: number;
  appointments: number;
  messages: number;
  catalogDownloads?: number;
  miniSiteViews?: number;
}

export interface Activity {
  id: string;
  type: 'profile_view' | 'message' | 'appointment' | 'connection' | 'download';
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface RegistrationData {
  // Step 1: General Information
  accountType: 'exhibitor' | 'partner' | 'visitor';
  companyName: string;
  sector: string;
  country: string;
  website?: string;
  registrationNumber?: string;
  
  // Step 2: Contact Information
  firstName: string;
  lastName: string;
  position: string;
  email: string;
  phone: string;
  linkedin?: string;
  
  // Step 3: Detailed Information
  description: string;
  products: string[];
  targetMarkets: string[];
  employeeCount: string;
  revenue?: string;
  certifications: string[];
  
  // Step 4: Documents
  logo?: File;
  brochure?: File;
  certificate?: File;
  catalog?: File;
  
  // Step 5: Objectives
  objectives: string[];
  partnershipTypes: string[];
  geographicInterests: string[];
  budget?: string;
  availability: string[];
}

export interface ChatBot {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  capabilities: string[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registrationType: string;
  status: string;
  registrationDate: Date;
  attendedAt?: Date;
  notes?: string;
  specialRequirements?: string;
  createdAt: Date;
  updatedAt: Date;
}