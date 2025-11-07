
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Users, Brain, MessageCircle, Calendar, User as UserIcon, Plus, Zap, Search,
  Heart, CheckCircle, Clock, Eye, BarChart3, TrendingUp, Handshake, Star, Briefcase, Mic, Building2, UserPlus, MapPin
} from 'lucide-react';
import { useNetworkingStore } from '@/store/networkingStore';
import useAuthStore from '@/store/authStore';
import { NetworkingRecommendation, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { CONFIG } from '@/lib/config';
import { ROUTES } from '@/lib/routes';
import UserProfileView from '@/components/profile/UserProfileView';
import { useAppointmentStore } from '@/store/appointmentStore';
import { SupabaseService } from '@/services/supabaseService';

export default function NetworkingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
    connections,
    favorites,
    pendingConnections,
    aiInsights,
    showAppointmentModal,
    selectedExhibitorForRDV,
    selectedTimeSlot,
    appointmentMessage,
    generateRecommendations,
    addToFavorites,
    removeFromFavorites,
  handleConnect,
  handleMessage,
  loadAIInsights,
    setShowAppointmentModal,
    setSelectedExhibitorForRDV,
    setSelectedTimeSlot,
    setAppointmentMessage,
  } = useNetworkingStore();

  const [activeTab, setActiveTab] = React.useState<keyof typeof CONFIG.tabIds>(CONFIG.tabIds.recommendations);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchFilters, setSearchFilters] = React.useState({
    sector: '',
    userType: '',
    location: ''
  });
  const [searchResults, setSearchResults] = React.useState<User[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = React.useState<User | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecommendations();
      // Charger les données de réseautage
      const store = useNetworkingStore.getState();
      store.loadConnections();
      store.loadFavorites();
      store.loadPendingConnections();
      store.loadDailyUsage();
      store.updatePermissions();
    }
  }, [isAuthenticated, user, fetchRecommendations]);

  const handleSearch = async () => {
    if (!searchTerm.trim() && !searchFilters.sector && !searchFilters.userType && !searchFilters.location) {
      toast.error('Veuillez saisir un terme de recherche ou sélectionner au moins un filtre');
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await SupabaseService.searchUsers({
        searchTerm: searchTerm.trim(),
        sector: searchFilters.sector,
        userType: searchFilters.userType,
        location: searchFilters.location,
        limit: 50
      });
      
      setSearchResults(results);
      setActiveTab(CONFIG.tabIds.search);
      
      if (results.length === 0) {
        toast.info('Aucun résultat trouvé pour votre recherche');
      } else {
        toast.success(`${results.length} profil(s) trouvé(s)`);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewProfile = (userName: string, company: string, user?: User) => {
    if (user) {
      setSelectedUserProfile(user);
    } else {
      // If no user object provided, try to find it in recommendations
      const foundUser = recommendations.find(rec =>
        `${rec.recommendedUser.profile.firstName} ${rec.recommendedUser.profile.lastName}` === userName &&
        rec.recommendedUser.profile.company === company
      )?.recommendedUser;

      if (foundUser) {
        setSelectedUserProfile(foundUser);
      } else {
        toast.error('Profil utilisateur non trouvé');
      }
    }
  };

  const handleBookAppointment = (profile: User) => {
    if (!isAuthenticated) {
      toast.error('Connexion requise pour prendre rendez-vous');
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent('/networking?action=book_appointment')}`);
      return;
    }
    setSelectedExhibitorForRDV(profile);
    setShowAppointmentModal(true);
  };

  // Subscribe to appointment store to get time slots for selected exhibitor
  const { timeSlots, fetchTimeSlots } = useAppointmentStore();

  // When the appointment modal is shown for a selected exhibitor, fetch their time slots
  React.useEffect(() => {
    if (showAppointmentModal && selectedExhibitorForRDV) {
      // clear any previously selected slot
      setSelectedTimeSlot('');
      // fetch exhibitor slots (best-effort)
      try {
        fetchTimeSlots(selectedExhibitorForRDV.id);
      } catch {
        // ignore errors, UI will fallback to empty list
        // console.warn('Failed to fetch exhibitor time slots', e);
      }
    }
  }, [showAppointmentModal, selectedExhibitorForRDV, fetchTimeSlots, setSelectedTimeSlot]);

  const handleConfirmAppointment = async () => {
    if (!selectedExhibitorForRDV) {
      toast.error('Aucun exposant sélectionné');
      return;
    }
    if (!selectedTimeSlot) {
      toast.error('Veuillez sélectionner un créneau horaire');
      return;
    }
    
    // Quotas B2B selon visitor_level
    const level = user?.visitor_level || 'free';
    const quotas: Record<string, number> = {
      free: 0,
      basic: 2,
      premium: 5,
      vip: 99 // VIP illimité
    };
    
    // Récupérer les VRAIS rendez-vous depuis appointmentStore
    const appointmentStore = useAppointmentStore.getState();
    const userAppointments = appointmentStore.appointments.filter(
      (a: any) => a.visitorId === user?.id && a.status === 'confirmed'
    );
    
    if (userAppointments.length >= quotas[level]) {
      toast.error(`Quota atteint : vous avez déjà ${quotas[level]} RDV B2B confirmés pour votre niveau.`);
      return;
    }
    
    // Try to call the canonical booking flow
    appointmentStore.bookAppointment(selectedTimeSlot, appointmentMessage)
      .then(() => {
        toast.success(`Demande de RDV envoyée à ${selectedExhibitorForRDV.profile.firstName} ${selectedExhibitorForRDV.profile.lastName}`);
        setShowAppointmentModal(false);
        setSelectedExhibitorForRDV(null);
        setSelectedTimeSlot('');
        setAppointmentMessage('');
      })
      .catch((err: unknown) => {
        console.error('Booking failed', err);
        toast.error(err?.message || 'Échec de la réservation');
      });
  };

  const handleFavoriteToggle = (userId: string, userName: string, isFavorite: boolean) => {
    if (isFavorite) {
      removeFromFavorites(userId);
      toast.success(`Retiré des favoris : ${userName}`);
    } else {
      addToFavorites(userId);
      toast.success(`Ajouté aux favoris : ${userName}`);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-white min-h-screen flex flex-col justify-between">
        {/* Bannière d'accueil */}
        <div className="w-full bg-blue-900 py-12 px-4 text-center text-white shadow-lg">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">SIPORTS 2026 Networking</h1>
          <p className="text-lg md:text-2xl font-medium mb-4 max-w-2xl mx-auto">
            Un carrefour d’affaires et de coopération portuaire
          </p>
          <p className="text-md md:text-lg max-w-2xl mx-auto opacity-80">
            Rencontrez les autorités portuaires, logisticiens, investisseurs, centres de formation et institutions venus de plus de 4 continents. Profitez de rencontres B2B ciblées, espaces lounge VIP, sessions de pitch et afterworks pour générer des synergies concrètes.
          </p>
        </div>
        {/* Bloc connexion obligatoire */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-10 rounded-2xl shadow-2xl bg-white/90 max-w-lg w-full text-center border border-blue-100">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">Connexion requise</h2>
              <p className="text-gray-700 mb-6">
                La connexion est obligatoire pour accéder au networking SIPORTS 2026.<br />
                Merci de vous connecter ou de créer un compte pour profiter des opportunités de réseautage.
              </p>
            </motion.div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Se connecter
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="border-blue-700 text-blue-700 hover:bg-blue-50">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un compte
                </Button>
              </Link>
            </div>
          </Card>
        </div>
        {/* Section opportunités */}
        <div className="bg-white py-10 px-4 mt-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">Des opportunités de réseautage sur-mesure</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform">
              <Handshake className="h-10 w-10 text-blue-700 mb-2" />
              <span className="font-semibold text-blue-900">Espace B2B pré-programmé</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform">
              <Star className="h-10 w-10 text-yellow-500 mb-2" />
              <span className="font-semibold text-blue-900">Afterworks & réceptions</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform">
              <Briefcase className="h-10 w-10 text-blue-700 mb-2" />
              <span className="font-semibold text-blue-900">Tables rondes sectorielles</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform">
              <Building2 className="h-10 w-10 text-blue-700 mb-2" />
              <span className="font-semibold text-blue-900">Zone Lounge Business & VIP</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform">
              <Mic className="h-10 w-10 text-blue-700 mb-2" />
              <span className="font-semibold text-blue-900">Sessions de pitch</span>
            </div>
            <div className="flex flex-col items-center p-6 bg-blue-50 rounded-xl shadow hover:scale-105 transition-transform">
              <Users className="h-10 w-10 text-blue-700 mb-2" />
              <span className="font-semibold text-blue-900">Espaces d’échanges</span>
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="bg-blue-900 text-white py-6 mt-8 text-center text-sm opacity-90">
          <div className="mb-2">© 2026 - SIPORTS : Salon International des Ports et de leur Écosystème – Tous droits réservés.</div>
          <div className="flex justify-center gap-4 mb-2">
            <a href="https://siportevent.com/conditions-generales-2/" className="hover:underline">Conditions Générales</a>
            <a href="https://siportevent.com/politique-de-confidentialite/" className="hover:underline">Confidentialité</a>
            <a href="https://siportevent.com/mentions-legales/" className="hover:underline">Mentions Légales</a>
          </div>
          <div>Contact : <a href="mailto:contact@siportevent.com" className="underline">contact@siportevent.com</a></div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Bannière avec image de fond améliorée */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 overflow-hidden">
        {/* Overlay avec motif géométrique */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>

        {/* Bulles décoratives animées */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/20">
                <img
                  src="/siports-logo.jpg"
                  alt="SIPORTS Logo"
                  className="h-16 w-auto filter brightness-0 invert"
                />
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Réseautage Intelligent
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl font-light mb-10 max-w-3xl mx-auto leading-relaxed text-blue-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Connectez-vous avec les bons professionnels grâce à notre IA de matching nouvelle génération
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-blue-500/30 p-2 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-100" />
                </div>
                <span className="text-lg font-semibold">IA Matching Avancé</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-green-500/30 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-green-100" />
                </div>
                <span className="text-lg font-semibold">+500 Professionnels</span>
              </div>
              <div className="flex items-center space-x-3 bg-white/15 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="bg-yellow-500/30 p-2 rounded-lg">
                  <Handshake className="h-6 w-6 text-yellow-100" />
                </div>
                <span className="text-lg font-semibold">Opportunités Business</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation améliorée avec design moderne */}
      <div className="bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-8">
            <nav className="flex flex-wrap justify-center gap-3 lg:gap-4">
              {[
                { id: 'recommendations', label: 'Recommandations IA', icon: Brain, color: 'blue', bgGradient: 'from-blue-500 to-blue-600' },
                { id: 'search', label: 'Recherche Avancée', icon: Search, color: 'green', bgGradient: 'from-green-500 to-green-600' },
                { id: 'connections', label: 'Mes Connexions', icon: Users, color: 'purple', bgGradient: 'from-purple-500 to-purple-600' },
                { id: 'favorites', label: 'Mes Favoris', icon: Heart, color: 'red', bgGradient: 'from-red-500 to-red-600' },
                { id: 'insights', label: 'Insights IA', icon: TrendingUp, color: 'orange', bgGradient: 'from-orange-500 to-orange-600' }
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as keyof typeof CONFIG.tabIds)}
                  className={`group relative flex items-center space-x-3 px-6 py-4 rounded-2xl font-semibold transition-all duration-300 overflow-hidden ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.bgGradient} text-white shadow-2xl scale-105`
                      : 'text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-200'
                  }`}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Effet de brillance animé au survol */}
                  {activeTab !== tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></div>
                  )}

                  <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? '' : 'group-hover:scale-110 transition-transform'}`} />
                  <span className="hidden sm:inline relative z-10">{tab.label}</span>

                  {/* Badge indicateur actif */}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === CONFIG.tabIds.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Statistiques rapides améliorées */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre Tableau de Bord</h2>
                <p className="text-gray-600">Suivez vos progrès en temps réel</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-blue-500 p-3 rounded-full">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">{recommendations.length}</div>
                  <div className="text-sm font-medium text-blue-800">Recommandations IA</div>
                  <div className="text-xs text-blue-600 mt-1">Personnalisées pour vous</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-green-500 p-3 rounded-full">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{connections.length}</div>
                  <div className="text-sm font-medium text-green-800">Connexions</div>
                  <div className="text-xs text-green-600 mt-1">Actives et fructueuses</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-purple-500 p-3 rounded-full">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">{favorites.length}</div>
                  <div className="text-sm font-medium text-purple-800">Favoris</div>
                  <div className="text-xs text-purple-600 mt-1">Contacts privilégiés</div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-orange-500 p-3 rounded-full">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-600 mb-2">{pendingConnections.length}</div>
                  <div className="text-sm font-medium text-orange-800">En attente</div>
                  <div className="text-xs text-orange-600 mt-1">Demandes en cours</div>
                </motion.div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Analyse IA en cours...</span>
              </div>
            ) : error ? (
              <Card className="p-6 text-center border-red-200 bg-red-50">
                <div className="text-red-600 mb-2">Erreur de chargement</div>
                <div className="text-sm text-gray-600">{error}</div>
                <Button
                  onClick={() => fetchRecommendations()}
                  className="mt-4"
                  size="sm"
                >
                  Réessayer
                </Button>
              </Card>
            ) : recommendations.length === 0 ? (
              <Card className="text-center p-8">
                <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Activez l'IA pour votre réseau</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Notre IA analyse votre profil pour trouver les meilleurs contacts professionnels adaptés à vos intérêts et objectifs.
                </p>
                <Button
                  onClick={() => {
                    if (user) {
                      generateRecommendations(user.id);
                      toast.success('IA activée, recommandations générées !');
                    }
                  }}
                  size="lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Générer les Recommandations IA
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Recommandations personnalisées
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchRecommendations()}
                  >
                    Actualiser
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {recommendations.map((rec, index) => {
                    const profile = rec.recommendedUser;
                    const isFavorite = favorites.includes(profile.id);
                    const isConnected = connections.includes(profile.id);
                    const isPending = pendingConnections.includes(profile.id);

                    return (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="group"
                      >
                        <Card className="p-8 hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden relative">
                          {/* Image de fond décorative */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>

                          <div className="relative z-10">
                            <div className="flex items-start space-x-6 mb-6">
                              <div className="relative">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                                  <AvatarImage src={profile.profile.avatar} alt={`${profile.profile.firstName} ${profile.profile.lastName}`} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl">
                                    {profile.profile.firstName[0]}{profile.profile.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                {/* Badge de score */}
                                <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getCompatibilityColor(rec.score)}`}>
                                    {rec.score}%
                                  </div>
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h4 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                      {`${profile.profile.firstName} ${profile.profile.lastName}`}
                                    </h4>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{profile.profile.position}</p>
                                    <p className="text-sm text-gray-500">{profile.profile.company}</p>
                                  </div>
                                </div>

                                {/* Indicateur de compatibilité */}
                                <div className="flex items-center space-x-2 mb-4">
                                  <div className={`w-3 h-3 rounded-full ${
                                    rec.score >= 80 ? 'bg-green-500' :
                                    rec.score >= 60 ? 'bg-blue-500' :
                                    rec.score >= 40 ? 'bg-yellow-500' : 'bg-gray-500'
                                  }`}></div>
                                  <span className="text-sm font-semibold text-gray-700">
                                    {getCompatibilityLabel(rec.score)} match
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Citation mise en avant */}
                            <div className="mb-6">
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-l-4 border-blue-400">
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                  "{rec.reasons[0]}"
                                </p>
                              </div>
                            </div>

                            {/* Intérêts communs */}
                            {profile.profile.interests && profile.profile.interests.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-sm font-bold uppercase text-gray-500 mb-3 flex items-center">
                                  <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                  Intérêts communs
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                  {profile.profile.interests.slice(0, 4).map(interest => (
                                    <Badge key={interest} className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors px-3 py-1 rounded-full text-xs font-medium">
                                      {interest}
                                    </Badge>
                                  ))}
                                  {profile.profile.interests.length > 4 && (
                                    <Badge className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                                      +{profile.profile.interests.length - 4}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Actions principales */}
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-3">
                                {isConnected ? (
                                  <Button size="sm" variant="outline" disabled className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 h-12 rounded-xl">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Connecté
                                  </Button>
                                ) : isPending ? (
                                  <Button size="sm" variant="outline" disabled className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100 h-12 rounded-xl">
                                    <Clock className="h-4 w-4 mr-2" />
                                    En attente
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConnect(profile.id, `${profile.profile.firstName} ${profile.profile.lastName}`)}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all h-12 rounded-xl"
                                  >
                                    <Users className="h-4 w-4 mr-2" />
                                    Connecter
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBookAppointment(profile)}
                                  className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 h-12 rounded-xl"
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  RDV
                                </Button>
                              </div>

                              {/* Actions secondaires */}
                              <div className="flex justify-center space-x-4 pt-2 border-t border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMessage(`${profile.profile.firstName} ${profile.profile.lastName}`, profile.profile.company || '')}
                                  className="hover:bg-blue-50 text-blue-600 rounded-lg p-3"
                                >
                                  <MessageCircle className="h-5 w-5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFavoriteToggle(profile.id, `${profile.profile.firstName} ${profile.profile.lastName}`, isFavorite)}
                                  className={`rounded-lg p-3 transition-colors ${
                                    isFavorite
                                      ? 'text-red-500 hover:bg-red-50'
                                      : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
                                  }`}
                                >
                                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewProfile(`${profile.profile.firstName} ${profile.profile.lastName}`, profile.profile.company || '', profile)}
                                  className="hover:bg-gray-50 text-gray-600 rounded-lg p-3"
                                >
                                  <Eye className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === CONFIG.tabIds.search && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Bannière de recherche */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-500 p-4 rounded-full">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Recherche Avancée</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Trouvez les professionnels qui correspondent exactement à vos critères grâce à notre moteur de recherche intelligent
                </p>
              </div>
            </div>

            {/* Filtres de recherche avancés */}
            <Card className="p-8 shadow-xl border-0 bg-white rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <Search className="h-4 w-4 mr-2 text-blue-500" />
                    Mots-clés
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Technologies, secteurs, compétences..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-green-500" />
                    Secteur d'activité
                  </label>
                  <select 
                    value={searchFilters.sector}
                    onChange={(e) => setSearchFilters({...searchFilters, sector: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Tous les secteurs</option>
                    <option value="portuaire">Portuaire</option>
                    <option value="logistique">Logistique</option>
                    <option value="transport">Transport</option>
                    <option value="technologie">Technologie</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <UserIcon className="h-4 w-4 mr-2 text-purple-500" />
                    Type de profil
                  </label>
                  <select 
                    value={searchFilters.userType}
                    onChange={(e) => setSearchFilters({...searchFilters, userType: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Tous types</option>
                    <option value="exhibitor">Exposant</option>
                    <option value="visitor">Visiteur</option>
                    <option value="partner">Partenaire</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                    Localisation
                  </label>
                  <select 
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Toutes régions</option>
                    <option value="europe">Europe</option>
                    <option value="afrique">Afrique</option>
                    <option value="asie">Asie</option>
                    <option value="amerique">Amérique</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleSearch} className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Search className="h-5 w-5 mr-3" />
                  Rechercher
                </Button>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  toast.info('Filtres réinitialisés');
                }} className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 transition-all">
                  Réinitialiser
                </Button>
              </div>
            </Card>

            {/* Résultats de recherche */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Résultats de recherche ({searchResults.length})
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Trier par pertinence
                    </Button>
                    <Button variant="outline" size="sm">
                      Filtrer
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {searchResults.map((profile, index) => {
                    const isConnected = connections.includes(profile.id);
                    const isFavorite = favorites.includes(profile.id);
                    const isPending = pendingConnections.includes(profile.id);

                    return (
                      <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={profile.profile.avatar} />
                              <AvatarFallback>
                                {profile.profile.firstName[0]}{profile.profile.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {`${profile.profile.firstName} ${profile.profile.lastName}`}
                              </h4>
                              <p className="text-sm text-gray-600 truncate">{profile.profile.position}</p>
                              <p className="text-sm text-gray-500 truncate">{profile.profile.company}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex justify-between items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewProfile(`${profile.profile.firstName} ${profile.profile.lastName}`, profile.profile.company || '', profile)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir profil
                            </Button>
                            {isConnected ? (
                              <Button size="sm" variant="outline" disabled className="bg-green-50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connecté
                              </Button>
                            ) : isPending ? (
                              <Button size="sm" variant="outline" disabled className="bg-yellow-50">
                                <Clock className="h-3 w-3 mr-1" />
                                En attente
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleConnect(profile.id, `${profile.profile.firstName} ${profile.profile.lastName}`)}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Connecter
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* État vide */}
            {searchTerm && searchResults.length === 0 && (
              <Card className="text-center p-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun résultat trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Essayez d'autres mots-clés ou ajustez vos filtres de recherche.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Effacer la recherche
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.connections && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Bannière des connexions */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-500 p-4 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Mes Connexions</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Gérez votre réseau professionnel et suivez l'évolution de vos relations business
                </p>
              </div>
            </div>

            {/* Statistiques des connexions améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-green-500 p-4 rounded-full">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">{connections.length}</div>
                <div className="text-lg font-medium text-green-800">Connexions actives</div>
                <div className="text-sm text-green-600 mt-1">Relations établies</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 p-4 rounded-full">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{pendingConnections.length}</div>
                <div className="text-lg font-medium text-blue-800">Demandes en attente</div>
                <div className="text-sm text-blue-600 mt-1">En cours de validation</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-500 p-4 rounded-full">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">{favorites.length}</div>
                <div className="text-lg font-medium text-purple-800">Favoris</div>
                <div className="text-sm text-purple-600 mt-1">Contacts privilégiés</div>
              </motion.div>
            </div>

            {/* Filtres et actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900">Mes Connexions</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiques
                </Button>
                <Button variant="outline" size="sm">
                  Exporter
                </Button>
              </div>
            </div>

            {/* Liste des connexions */}
            {connections.length === 0 ? (
              <Card className="text-center p-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune connexion active</h3>
                <p className="text-gray-600 mb-6">
                  Commencez à réseauter en consultant les recommandations IA ou en utilisant la recherche avancée.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setActiveTab(CONFIG.tabIds.recommendations)}>
                    <Brain className="h-4 w-4 mr-2" />
                    Voir recommandations
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab(CONFIG.tabIds.search)}>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Connexions actives */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Connexions actives ({connections.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.slice(0, 6).map((connectionId) => {
                      // Mock data - en réalité, il faudrait récupérer les données des connexions
                      const mockProfile = {
                        id: connectionId,
                        profile: {
                          firstName: 'Jean',
                          lastName: 'Dupont',
                          position: 'Directeur Commercial',
                          company: 'Port de Marseille',
                          avatar: null
                        }
                      };

                      return (
                        <Card key={connectionId} className="p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {mockProfile.profile.firstName[0]}{mockProfile.profile.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {mockProfile.profile.firstName} {mockProfile.profile.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">{mockProfile.profile.position}</p>
                              <p className="text-sm text-gray-500">{mockProfile.profile.company}</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Calendar className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Demandes en attente */}
                {pendingConnections.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                      Demandes en attente ({pendingConnections.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pendingConnections.slice(0, 4).map((pendingId) => (
                        <Card key={pendingId} className="p-4 border-yellow-200 bg-yellow-50">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">Demande envoyée</h4>
                              <p className="text-sm text-gray-600">En attente de réponse</p>
                            </div>
                            <Badge className="text-yellow-700 border-yellow-300">
                              En attente
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.insights && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Bannière des insights */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-8 border border-orange-100">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-500 p-4 rounded-full">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Insights IA Personnalisés</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Découvrez des analyses approfondies de votre réseau professionnel et recevez des recommandations stratégiques basées sur l'intelligence artificielle.
                </p>
              </div>
            </div>

            {/* Métriques principales améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 p-4 rounded-full">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{recommendations.length}</div>
                <div className="text-lg font-medium text-blue-800">Recommandations IA</div>
                <div className="text-sm text-blue-600 mt-1">Suggestions personnalisées</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-green-500 p-4 rounded-full">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round((connections.length / Math.max(recommendations.length + connections.length, 1)) * 100)}%
                </div>
                <div className="text-lg font-medium text-green-800">Taux de conversion</div>
                <div className="text-sm text-green-600 mt-1">Efficacité réseau</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl border border-purple-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-purple-500 p-4 rounded-full">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {recommendations.reduce((acc, rec) => acc + rec.score, 0) / Math.max(recommendations.length, 1) | 0}%
                </div>
                <div className="text-lg font-medium text-purple-800">Score moyen</div>
                <div className="text-sm text-purple-600 mt-1">Qualité des matches</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-orange-500 p-4 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {new Set(recommendations.flatMap(r => r.recommendedUser.profile.interests || [])).size}
                </div>
                <div className="text-lg font-medium text-orange-800">Intérêts identifiés</div>
                <div className="text-sm text-orange-600 mt-1">Domaines d'intérêt</div>
              </motion.div>
            </div>

            {/* Bouton génération d'insights amélioré */}
            <Card className="text-center p-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-0 shadow-xl rounded-2xl overflow-hidden relative">
              {/* Image de fond décorative */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full -mr-20 -mt-20 opacity-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full -ml-16 -mb-16 opacity-20"></div>

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full shadow-lg">
                    <Brain className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Analyse IA de votre réseau
                </h3>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                  Générez des insights personnalisés sur vos connexions, vos opportunités de networking et vos axes d'amélioration grâce à notre intelligence artificielle avancée.
                </p>
                <Button onClick={loadAIInsights} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  <Zap className="h-6 w-6 mr-3" />
                  Générer les Insights IA
                </Button>
              </div>
            </Card>

            {/* Résultats des insights */}
            {aiInsights && (
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Analyse de votre réseau
                      </h3>
                      <p className="text-gray-700 mb-4">{aiInsights.summary}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Points forts</h4>
                          <ul className="space-y-1">
                            {aiInsights.suggestions.slice(0, 3).map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Opportunités</h4>
                          <ul className="space-y-1">
                            {aiInsights.suggestions.slice(3).map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Graphiques et visualisations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Répartition par secteur</h4>
                    <div className="space-y-3">
                      {[
                        { sector: 'Portuaire', count: 12, percentage: 40 },
                        { sector: 'Logistique', count: 8, percentage: 27 },
                        { sector: 'Technologie', count: 6, percentage: 20 },
                        { sector: 'Finance', count: 4, percentage: 13 }
                      ].map((item) => (
                        <div key={item.sector} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.sector}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-8">{item.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Évolution du réseau</h4>
                    <div className="text-center py-8">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        +{connections.length * 2}
                      </div>
                      <div className="text-sm text-gray-600">Nouvelles connexions ce mois</div>
                      <div className="mt-4 flex justify-center space-x-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{connections.length}</div>
                          <div className="text-gray-500">Actives</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-600">{pendingConnections.length}</div>
                          <div className="text-gray-500">En attente</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-purple-600">{favorites.length}</div>
                          <div className="text-gray-500">Favoris</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.favorites && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Bannière des favoris */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 border border-red-100">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-500 p-4 rounded-full">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Mes Favoris</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {favorites.length} contact{favorites.length !== 1 ? 's' : ''} marqué{favorites.length !== 1 ? 's' : ''} comme favori{favorites.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Statistiques des favoris améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border border-red-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-red-500 p-4 rounded-full">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-red-600 mb-2">{favorites.length}</div>
                <div className="text-lg font-medium text-red-800">Contacts favoris</div>
                <div className="text-sm text-red-600 mt-1">Relations privilégiées</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl border border-green-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-green-500 p-4 rounded-full">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {favorites.filter(f => connections.includes(f)).length}
                </div>
                <div className="text-lg font-medium text-green-800">Déjà connectés</div>
                <div className="text-sm text-green-600 mt-1">Relations actives</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border border-blue-200 text-center shadow-lg"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500 p-4 rounded-full">
                    <UserPlus className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {favorites.filter(f => !connections.includes(f)).length}
                </div>
                <div className="text-lg font-medium text-blue-800">À contacter</div>
                <div className="text-sm text-blue-600 mt-1">Opportunités à saisir</div>
              </motion.div>
            </div>

            {/* Liste des favoris */}
            {favorites.length === 0 ? (
              <Card className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun favori pour le moment
                </h3>
                <p className="text-gray-600 mb-6">
                  Marquez des contacts comme favoris pour les retrouver facilement ici.
                </p>
                <Button onClick={() => setActiveTab(CONFIG.tabIds.recommendations)} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Découvrir des recommandations
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((favoriteId) => {
                  // Mock data - en réalité, il faudrait récupérer les données des utilisateurs
                  const mockFavorite = {
                    id: favoriteId,
                    name: 'Utilisateur Favori',
                    title: 'Directeur Commercial',
                    company: 'Entreprise Example',
                    avatar: null,
                    profile: {
                      interests: ['Technologie', 'Innovation']
                    }
                  };

                  const isConnected = connections.includes(favoriteId);
                  const isPending = pendingConnections.includes(favoriteId);

                  return (
                    <motion.div
                      key={favoriteId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={mockFavorite.avatar || undefined} alt={mockFavorite.name} />
                            <AvatarFallback>
                              {mockFavorite.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {mockFavorite.name}
                              </h3>
                              <Heart className="h-5 w-5 text-red-500 fill-current" />
                            </div>

                            <p className="text-sm text-gray-600 mb-2">{mockFavorite.title}</p>
                            <p className="text-sm text-gray-500 mb-3">{mockFavorite.company}</p>

                            <div className="flex flex-wrap gap-1 mb-4">
                              {mockFavorite.profile?.interests?.slice(0, 2).map((interest, index) => (
                                <Badge key={index} className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {isConnected ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Connecté
                                  </Badge>
                                ) : isPending ? (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <Clock className="h-3 w-3 mr-1" />
                                    En attente
                                  </Badge>
                                ) : (
                                  <Badge>
                                    <UserPlus className="h-3 w-3 mr-1" />
                                    À contacter
                                  </Badge>
                                )}
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewProfile(mockFavorite.name, mockFavorite.company)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {!isConnected && !isPending && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleConnect(favoriteId, mockFavorite.name)}
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {showAppointmentModal && selectedExhibitorForRDV && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Prendre RDV avec {selectedExhibitorForRDV.profile.firstName} {selectedExhibitorForRDV.profile.lastName}
            </h3>
            
            {/* Sélection du créneau horaire */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choisir un créneau horaire
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un créneau</option>
                {Array.isArray(timeSlots) && timeSlots.length > 0 ? (
                  timeSlots.map((slot) => {
                    const dateObj = slot.date ? new Date(slot.date as any) : null;
                    const dateLabel = dateObj ? dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : String(slot.date || '');
                    const locationPart = slot.location ? ` • ${slot.location}` : '';
                    const availability = slot.available === false ? ' (Complet)' : '';
                    return (
                      <option key={slot.id} value={slot.id}>
                        {`${dateLabel} - ${slot.startTime}${locationPart}${availability}`}
                      </option>
                    );
                  })
                ) : (
                  // graceful fallback when no slots available
                  <option value="" disabled>Aucun créneau disponible</option>
                )}
              </select>
            </div>
            
            {/* Champ message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={appointmentMessage}
                onChange={(e) => setAppointmentMessage(e.target.value)}
                placeholder="Décrivez brièvement l'objet de votre rendez-vous..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleConfirmAppointment}
                className="flex-1"
                disabled={!selectedTimeSlot}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Envoyer la Demande
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowAppointmentModal(false);
                  setSelectedTimeSlot('');
                  setAppointmentMessage('');
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {selectedUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <UserProfileView
              user={selectedUserProfile}
              showBooking={true}
              onClose={() => setSelectedUserProfile(null)}
              onConnect={(userId) => handleConnect(userId, `${selectedUserProfile.profile.firstName} ${selectedUserProfile.profile.lastName}`)}
              onMessage={(userName) => handleMessage(userName, selectedUserProfile.profile.company || '')}
            />
          </div>
        </div>
      )}
    </div>
  );
};