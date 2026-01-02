
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import {
  Users, Brain, MessageCircle, Calendar, User as UserIcon, Plus, Zap, Search,
  Heart, CheckCircle, Clock, Eye, BarChart3, TrendingUp, Handshake, Star, Briefcase, Mic, Building2, UserPlus, MapPin,
  Target, Sparkles, Shield, Globe, ArrowRight, Info
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie
} from 'recharts';
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
import { getVisitorQuota } from '@/config/quotas';
import { LevelBadge } from '@/components/common/QuotaWidget';

export default function NetworkingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    // Permettre la recherche sans filtres obligatoires (affiche tous les résultats si aucun filtre)
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
        rec.recommendedUser?.profile &&
        `${rec.recommendedUser.profile.firstName || ''} ${rec.recommendedUser.profile.lastName || ''}` === userName &&
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
    
    // Quotas B2B selon visitor_level - utilise le système centralisé
    const level = user?.visitor_level || 'free';
    const quota = getVisitorQuota(level); // Depuis quotas.ts

    // Récupérer les VRAIS rendez-vous depuis appointmentStore
    const appointmentStore = useAppointmentStore.getState();
    const userAppointments = appointmentStore.appointments.filter(
      (a: any) => a.visitorId === user?.id && a.status === 'confirmed'
    );

    // Vérifier le quota (999999 = illimité pour premium)
    if (quota !== 999999 && userAppointments.length >= quota) {
      if (quota === 0) {
        toast.error(
          `Accès restreint : votre Pass Gratuit ne permet pas de prendre de rendez-vous B2B. ` +
          `Passez au Pass Premium VIP pour des RDV B2B illimités !`,
          { duration: 5000 }
        );
      } else {
        toast.error(`Quota atteint : vous avez déjà ${quota} RDV B2B confirmés pour votre niveau.`);
      }
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
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-slate-600';
  };

  const getCompatibilityBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'bg-blue-50 border-blue-100';
    if (score >= 40) return 'bg-amber-50 border-amber-100';
    return 'bg-slate-50 border-slate-100';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Très Bon';
    if (score >= 40) return 'Moyen';
    return 'Faible';
  };

  // Composant pour le score de compatibilité circulaire
  const CompatibilityScore = ({ score }: { score: number }) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#64748b';
    return (
      <div className="relative w-16 h-16">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-gray-100"
            strokeDasharray="100, 100"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            strokeDasharray={`${score}, 100`}
            strokeWidth="3"
            strokeLinecap="round"
            stroke={color}
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{score}%</span>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-[#0a192f] min-h-screen flex flex-col">
        {/* Hero Section Ultra-Moderne (Même style que la version connectée) */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Background avec effet de particules/réseau */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 z-10"></div>
            <div className="absolute inset-0 opacity-30 z-0" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            
            {/* Éléments décoratifs animés */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">{t('networking.ai_powered')}</span>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-none">
                {t('networking.hero_title')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                  {t('networking.hero_subtitle')}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                Connectez-vous avec les leaders de l'industrie portuaire mondiale. <br className="hidden md:block" />
                Accédez à des opportunités de matching exclusives.
              </p>

              {/* Bloc connexion obligatoire style Glassmorphism */}
              <div className="max-w-lg mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                <h2 className="text-2xl font-bold text-white mb-4">{t('networking.login_required')}</h2>
                <p className="text-blue-100/70 mb-8 leading-relaxed">
                  {t('networking.hub_restricted')}
                  {' '}
                  {t('networking.discover_recommendations')}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={ROUTES.LOGIN} className="flex-1">
                    <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-none shadow-lg shadow-blue-900/20">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {t('networking.login_button')}
                    </Button>
                  </Link>
                  <Link to={ROUTES.VISITOR_SUBSCRIPTION} className="flex-1">
                    <Button variant="outline" size="lg" className="w-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('networking.signup_button')}
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Section opportunités style sombre */}
        <div className="bg-[#0a192f] border-t border-white/5 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-12 text-center">L'écosystème SIPORTS à votre portée</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Handshake, label: "Espace B2B pré-programmé", desc: "Rencontres ciblées avec des décideurs" },
                { icon: Star, label: "Afterworks & réceptions", desc: "Networking informel et convivial" },
                { icon: Briefcase, label: "Tables rondes sectorielles", desc: "Échanges d'expertise approfondis" },
                { icon: Building2, label: "Zone Lounge Business & VIP", desc: "Espaces de travail et de détente" },
                { icon: Mic, label: "Sessions de pitch", desc: "Découvrez les innovations du secteur" },
                { icon: Users, label: "Espaces d'échanges", desc: "Plus de 6000 professionnels attendus" }
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                  <item.icon className="h-12 w-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-white text-lg mb-2">{item.label}</span>
                  <p className="text-blue-100/50 text-sm text-center">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer simplifié© */}
        <footer className="bg-[#050c1a] text-white/40 py-12 border-t border-white/5 text-center text-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6">© 2026 - SIPORTS : Salon International des Ports et de leur Écosystème — Tous droits réservés.</div>
            <div className="flex justify-center gap-8 mb-6">
              <a href="https://siportevent.com/conditions-generales-2/" className="hover:text-white transition-colors">Conditions Générales</a>
              <a href="https://siportevent.com/politique-de-confidentialite/" className="hover:text-white transition-colors">Confidentialité©</a>
              <a href="https://siportevent.com/mentions-legales/" className="hover:text-white transition-colors">Mentions Légales</a>
            </div>
            <div className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10">
              Contact : <a href="mailto:contact@siportevent.com" className="text-blue-400 hover:underline">contact@siportevent.com</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section Ultra-Moderne */}
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#0a192f]">
        {/* Background avec effet de particules/réseau (CSS pur) */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/80 to-slate-900/90 z-10"></div>
          <div className="absolute inset-0 opacity-30 z-0" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}></div>
          
          {/* Éléments décoratifs animés */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-md border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">Propulsé par l'IA SIPORTS v3.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tight leading-none">
              Réseautage <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                Intelligent
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Connectez-vous avec les leaders de l'industrie portuaire mondiale grâce à notre algorithme de matching prédictif.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group cursor-default">
                <div className="bg-blue-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">Matching Précis</div>
                  <div className="text-blue-200/60 text-xs">Basé sur vos intérêts</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group cursor-default">
                <div className="bg-indigo-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">Réseau Global</div>
                  <div className="text-blue-200/60 text-xs">+50 pays représentés</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group cursor-default">
                <div className="bg-cyan-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold">Accès Sécurisé</div>
                  <div className="text-blue-200/60 text-xs">Profils vérifiés</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Vague décorative en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent z-30"></div>
      </div>

      {/* Navigation Sticky avec Glassmorphism */}
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-4">
            <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
              {[
                { id: 'recommendations', label: 'IA Match', icon: Brain, color: 'blue' },
                { id: 'search', label: 'Recherche', icon: Search, color: 'emerald' },
                { id: 'connections', label: 'Réseau', icon: Users, color: 'indigo' },
                { id: 'favorites', label: 'Favoris', icon: Heart, color: 'rose' },
                { id: 'insights', label: 'Analyses', icon: TrendingUp, color: 'amber' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as keyof typeof CONFIG.tabIds)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${
                    activeTab === tab.id 
                      ? tab.color === 'blue' ? 'text-blue-600' :
                        tab.color === 'emerald' ? 'text-emerald-600' :
                        tab.color === 'indigo' ? 'text-indigo-600' :
                        tab.color === 'rose' ? 'text-rose-600' : 'text-amber-600'
                      : ''
                  }`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                        tab.color === 'blue' ? 'bg-blue-600' :
                        tab.color === 'emerald' ? 'bg-emerald-600' :
                        tab.color === 'indigo' ? 'bg-indigo-600' :
                        tab.color === 'rose' ? 'bg-rose-600' : 'bg-amber-600'
                      }`}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === CONFIG.tabIds.recommendations && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Dashboard de Networking */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Votre Activité</h2>
                    <p className="text-slate-500">Aperçu de vos interactions récentes</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Matches IA', value: recommendations.length, icon: Brain, color: 'blue' },
                    { label: 'Connexions', value: connections.length, icon: Users, color: 'emerald' },
                    { label: 'Favoris', value: favorites.length, icon: Heart, color: 'rose' },
                    { label: 'En attente', value: pendingConnections.length, icon: Clock, color: 'amber' }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-blue-200 transition-colors group">
                      <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                        stat.color === 'rose' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-2">Networking Score</h3>
                  <p className="text-blue-100/70 text-sm mb-6">Votre influence sur le salon</p>
                  
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path className="text-white/10" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path className="text-white" strokeDasharray="75, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black">75</span>
                        <span className="text-[10px] font-bold uppercase opacity-60">Points</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="opacity-70">Profil complété</span>
                      <span className="font-bold">100%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="opacity-70">Engagement</span>
                      <span className="font-bold">65%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className="bg-white h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <span className="mt-6 text-slate-500 font-medium animate-pulse">Analyse de votre profil par l'IA...</span>
              </div>
            ) : error ? (
              <Card className="p-12 text-center border-rose-100 bg-rose-50/50 rounded-3xl">
                <div className="bg-rose-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Info className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Oups ! Quelque chose s'est mal passé</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">{error}</p>
                <Button
                  onClick={() => fetchRecommendations()}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl"
                >
                  Réessayer l'analyse
                </Button>
              </Card>
            ) : recommendations.length === 0 ? (
              <Card className="text-center p-16 bg-white rounded-3xl shadow-xl border-slate-100">
                <div className="bg-blue-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Brain className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4">Activez votre Réseau IA</h3>
                <p className="text-slate-500 mb-10 max-w-xl mx-auto text-lg">
                  Notre intelligence artificielle analyse vos compétences et vos objectifs pour vous présenter les partenaires les plus pertinents.
                </p>
                
                {/* Appel à compléter le profil */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 mb-8 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <span className="font-bold text-purple-900">Améliorez votre matching</span>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    Complétez votre profil pour obtenir des recommandations plus pertinentes
                  </p>
                  <Link 
                    to={ROUTES.PROFILE_MATCHING}
                    className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all hover:shadow-lg"
                  >
                    <UserIcon className="h-4 w-4" />
                    Compléter mon profil
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <Button
                  onClick={async () => {
                    if (user) {
                      toast.loading('Génération des recommandations IA en cours...');
                      try {
                        await generateRecommendations(user.id);
                        toast.dismiss();
                        toast.success('✨ Recommandations IA générées avec succès !');
                      } catch (error) {
                        toast.dismiss();
                        toast.error('Erreur lors de la génération des recommandations');
                        console.error('Erreur generateRecommendations:', error);
                      }
                    } else {
                      toast.error('Vous devez être connecté');
                    }
                  }}
                  disabled={isLoading}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="h-5 w-5 mr-3" />
                  {isLoading ? 'Génération en cours...' : 'Générer mes Recommandations'}
                </Button>
              </Card>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">
                      Recommandations IA
                    </h2>
                    <p className="text-slate-500">Basé sur votre profil et vos intérêts</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fetchRecommendations()}
                    className="rounded-xl border-slate-200 hover:bg-slate-50"
                  >
                    Actualiser la liste
                  </Button>
                </div>

                <div data-testid="user-list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {recommendations.map((rec, index) => {
                    const profile = rec.recommendedUser;
                    const isFavorite = favorites.includes(profile.id);
                    const isConnected = connections.includes(profile.id);
                    const isPending = pendingConnections.includes(profile.id);

                    return (
                      <motion.div
                        key={profile.id}
                        data-testid="user-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -10 }}
                        className="group"
                      >
                        <Card className="h-full flex flex-col bg-white hover:shadow-2xl transition-all duration-500 border-slate-100 rounded-[2rem] overflow-hidden relative">
                          {/* Header de la carte avec score */}
                          <div className={`h-24 w-full absolute top-0 left-0 opacity-10 ${getCompatibilityBg(rec.score)}`}></div>
                          
                          <div className="p-8 pt-10 relative z-10 flex-1">
                            <div className="flex justify-between items-start mb-6">
                              <div className="relative">
                                <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                                  <AvatarImage src={profile.profile.avatar} alt={`${profile.profile.firstName} ${profile.profile.lastName}`} />
                                  <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black text-xl">
                                    {profile.profile?.firstName?.[0] || 'U'}{profile.profile?.lastName?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg">
                                  <div className={`w-4 h-4 rounded-full border-2 border-white ${isConnected ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                </div>
                              </div>
                              
                              <CompatibilityScore score={rec.score} />
                            </div>

                            <div className="mb-6">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-black text-xl text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {`${profile.profile.firstName} ${profile.profile.lastName}`}
                                </h4>
                                {profile.visitor_level && (
                                  <LevelBadge level={profile.visitor_level} type="visitor" size="sm" />
                                )}
                              </div>
                              <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">{profile.profile.position}</p>
                              <p className="text-sm text-slate-500 flex items-center">
                                <Building2 className="h-3 w-3 mr-1.5 opacity-50" />
                                {profile.profile.company}
                              </p>
                            </div>

                            {/* Raison du match */}
                            <div className={`p-4 rounded-2xl border mb-6 ${getCompatibilityBg(rec.score)}`}>
                              <div className="flex items-start space-x-3">
                                <Sparkles className={`h-4 w-4 mt-0.5 flex-shrink-0 ${getCompatibilityColor(rec.score)}`} />
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                  {rec.reasons?.[0] || 'Correspondance de profil'}
                                </p>
                              </div>
                            </div>

                            {/* Intérêts */}
                            {profile.profile.interests && profile.profile.interests.length > 0 && (
                              <div className="mb-8">
                                <div className="flex flex-wrap gap-2">
                                  {profile.profile.interests.slice(0, 3).map(interest => (
                                    <span key={interest} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                      {interest}
                                    </span>
                                  ))}
                                  {profile.profile.interests.length > 3 && (
                                    <span className="text-[10px] font-black text-slate-400 py-1">
                                      +{profile.profile.interests.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
                            <div className="flex-1">
                              {isConnected ? (
                                <Button size="sm" variant="outline" disabled className="w-full bg-emerald-50 border-emerald-200 text-emerald-700 rounded-xl h-11">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Connecté
                                </Button>
                              ) : isPending ? (
                                <Button size="sm" variant="outline" disabled className="w-full bg-amber-50 border-amber-200 text-amber-700 rounded-xl h-11">
                                  <Clock className="h-4 w-4 mr-2" />
                                  En attente
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleConnect(profile.id, `${profile.profile.firstName} ${profile.profile.lastName}`)}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg rounded-xl h-11 font-bold"
                                >
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Connecter
                                </Button>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleFavoriteToggle(profile.id, `${profile.profile.firstName} ${profile.profile.lastName}`, isFavorite)}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isFavorite 
                                    ? 'bg-rose-50 border-rose-200 text-rose-500' 
                                    : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                                }`}
                              >
                                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => handleViewProfile(`${profile.profile.firstName} ${profile.profile.lastName}`, profile.profile.company || '', profile)}
                                className="p-2.5 rounded-xl border bg-white border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Header Recherche Moderne */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-emerald-500 p-6 rounded-[2rem] shadow-lg shadow-emerald-200">
                  <Search className="h-10 w-10 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-slate-900 mb-2">Explorateur de Réseau</h2>
                  <p className="text-slate-500 text-lg">Trouvez les partenaires stratégiques parmi des milliers de profils vérifiés.</p>
                </div>
              </div>
            </div>

            {/* Filtres de recherche avancés - Style Carte Moderne */}
            <Card className="p-10 shadow-2xl shadow-slate-200/50 border-0 bg-white rounded-[3rem]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Search className="h-3 w-3 mr-2 text-blue-500" />
                    Mots-clés
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="IA, Logistique, 5G..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Building2 className="h-3 w-3 mr-2 text-emerald-500" />
                    Secteur
                  </label>
                  <select 
                    value={searchFilters.sector}
                    onChange={(e) => setSearchFilters({...searchFilters, sector: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-medium appearance-none"
                  >
                    <option value="">Tous les secteurs</option>
                    <option value="portuaire">Portuaire</option>
                    <option value="logistique">Logistique</option>
                    <option value="transport">Transport</option>
                    <option value="technologie">Technologie</option>
                    <option value="finance">Finance</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <UserIcon className="h-3 w-3 mr-2 text-indigo-500" />
                    Type
                  </label>
                  <select 
                    value={searchFilters.userType}
                    onChange={(e) => setSearchFilters({...searchFilters, userType: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium appearance-none"
                  >
                    <option value="">Tous types</option>
                    <option value="exhibitor">Exposant</option>
                    <option value="visitor">Visiteur</option>
                    <option value="partner">Partenaire</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <MapPin className="h-3 w-3 mr-2 text-rose-500" />
                    Région
                  </label>
                  <select 
                    value={searchFilters.location}
                    onChange={(e) => setSearchFilters({...searchFilters, location: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none font-medium appearance-none"
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
                <Button 
                  onClick={handleSearch} 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-4 rounded-2xl font-black shadow-xl transition-all transform hover:scale-105"
                >
                  <Search className="h-5 w-5 mr-3" />
                  Lancer la Recherche
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    toast.info('Filtres réinitialisés');
                  }} 
                  className="px-10 py-4 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 font-bold transition-all"
                >
                  Réinitialiser
                </Button>
              </div>
            </Card>

            {/* Résultats de recherche - Style Grille Moderne */}
            {searchResults.length > 0 && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900">
                    Résultats ({searchResults.length})
                  </h3>
                </div>

                <div data-testid="search-results" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {searchResults.map((profile, index) => {
                    const isConnected = connections.includes(profile.id);
                    const isFavorite = favorites.includes(profile.id);
                    const isPending = pendingConnections.includes(profile.id);

                    return (
                      <motion.div
                        key={profile.id}
                        data-testid="user-result"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 bg-white hover:shadow-2xl transition-all duration-300 border-slate-100 rounded-[2rem]">
                          <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-16 w-16 border-2 border-slate-100">
                              <AvatarImage src={profile.profile.avatar} />
                              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                {profile.profile?.firstName?.[0] || 'U'}{profile.profile?.lastName?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-slate-900 truncate">
                                {`${profile.profile.firstName} ${profile.profile.lastName}`}
                              </h4>
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider truncate">{profile.profile.position}</p>
                              <p className="text-xs text-slate-400 truncate">{profile.profile.company}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewProfile(`${profile.profile.firstName} ${profile.profile.lastName}`, profile.profile.company || '', profile)}
                              className="flex-1 rounded-xl border-slate-200 h-10 font-bold"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Profil
                            </Button>
                            {isConnected ? (
                              <Button size="sm" variant="outline" disabled className="flex-1 bg-emerald-50 border-emerald-100 text-emerald-600 rounded-xl h-10">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            ) : isPending ? (
                              <Button size="sm" variant="outline" disabled className="flex-1 bg-amber-50 border-amber-100 text-amber-600 rounded-xl h-10">
                                <Clock className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleConnect(profile.id, `${profile.profile.firstName} ${profile.profile.lastName}`)}
                                className="flex-1 bg-slate-900 text-white rounded-xl h-10 font-bold"
                              >
                                <UserPlus className="h-4 w-4 mr-2" />
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
              <Card className="text-center p-20 bg-white rounded-[3rem] shadow-xl border-slate-100">
                <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Search className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Aucun résultat trouvé</h3>
                <p className="text-slate-500 mb-10 max-w-md mx-auto">
                  Essayez d'autres mots-clés ou ajustez vos filtres de recherche pour trouver des partenaires.
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')} className="rounded-xl">
                  Effacer la recherche
                </Button>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.connections && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Header Réseau Moderne */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-indigo-500 p-6 rounded-[2rem] shadow-lg shadow-indigo-200">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-slate-900 mb-2">Mon Réseau Business</h2>
                  <p className="text-slate-500 text-lg">Gérez vos relations et transformez vos contacts en opportunités.</p>
                </div>
              </div>
            </div>

            {/* Statistiques du Réseau */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center space-x-6">
                <div className="bg-emerald-100 p-4 rounded-2xl">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{connections.length}</div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Actifs</div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center space-x-6">
                <div className="bg-amber-100 p-4 rounded-2xl">
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{pendingConnections.length}</div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">En attente</div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center space-x-6">
                <div className="bg-rose-100 p-4 rounded-2xl">
                  <Heart className="h-8 w-8 text-rose-600" />
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900">{favorites.length}</div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Favoris</div>
                </div>
              </div>
            </div>

            {/* Liste des connexions - Style Moderne */}
            {connections.length === 0 ? (
              <Card className="text-center p-20 bg-white rounded-[3rem] shadow-xl border-slate-100">
                <div className="bg-slate-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Users className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Votre réseau est encore vide</h3>
                <p className="text-slate-500 mb-10 max-w-md mx-auto">
                  Commencez à explorer les profils recommandés par notre IA pour bâtir votre écosystème.
                </p>
                <Button 
                  onClick={() => setActiveTab(CONFIG.tabIds.recommendations)}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl"
                >
                  Découvrir des Profils
                </Button>
              </Card>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {connections.map((connectionId) => {
                    // Mock data
                    const mockProfile = {
                      id: connectionId,
                      profile: {
                        firstName: 'Expert',
                        lastName: 'Portuaire',
                        position: 'Directeur Stratégie',
                        company: 'Global Logistics Hub',
                        avatar: null
                      }
                    };

                    return (
                      <Card key={connectionId} className="p-6 bg-white hover:shadow-xl transition-all duration-300 border-slate-100 rounded-[2rem] flex items-center gap-6">
                        <Avatar className="h-16 w-16 border-2 border-slate-100">
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-black">EP</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 truncate">
                            {mockProfile.profile.firstName} {mockProfile.profile.lastName}
                          </h4>
                          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider truncate">{mockProfile.profile.position}</p>
                          <p className="text-xs text-slate-400 truncate">{mockProfile.profile.company}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <MessageCircle className="h-5 w-5" />
                          </button>
                          <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                            <Calendar className="h-5 w-5" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.insights && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Bannière des insights Ultra-Moderne */}
            <div className="relative bg-slate-900 rounded-[3rem] p-12 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-transparent z-10"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
              
              <div className="relative z-20 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-xs font-black uppercase tracking-widest">Analyse Prédictive</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                    Insights <br />
                    <span className="text-blue-400">Stratégiques</span>
                  </h2>
                  <p className="text-blue-100/60 text-lg max-w-xl mb-8">
                    Découvrez la structure de votre réseau et identifiez les opportunités de croissance grâce à notre moteur d'analyse comportementale.
                  </p>
                  <Button 
                    onClick={loadAIInsights} 
                    size="lg" 
                    className="bg-white text-slate-900 hover:bg-blue-50 px-10 py-4 rounded-2xl font-black shadow-xl transition-all transform hover:scale-105"
                  >
                    <Brain className="h-5 w-5 mr-3" />
                    Lancer l'Analyse IA
                  </Button>
                </div>
                
                <div className="w-full md:w-1/3 aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Animation de scan IA (CSS) */}
                    <div className="absolute inset-0 border-2 border-blue-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-4 border-2 border-indigo-500/20 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TrendingUp className="h-24 w-24 text-blue-400 opacity-50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résultats des insights avec Graphiques */}
            {aiInsights ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Radar Chart - Répartition des Secteurs */}
                  <Card className="lg:col-span-2 p-8 bg-white rounded-[2.5rem] shadow-xl border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Écosystème de Réseau</h3>
                        <p className="text-slate-500 text-sm">Répartition par secteurs d'activité</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-2xl">
                        <Target className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                          { subject: 'Portuaire', A: 120, fullMark: 150 },
                          { subject: 'Logistique', A: 98, fullMark: 150 },
                          { subject: 'Technologie', A: 86, fullMark: 150 },
                          { subject: 'Finance', A: 65, fullMark: 150 },
                          { subject: 'Formation', A: 45, fullMark: 150 },
                          { subject: 'Institutionnel', A: 90, fullMark: 150 },
                        ]}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                          <Radar
                            name="Mon Réseau"
                            dataKey="A"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.3}
                          />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  {/* Score de Qualité */}
                  <div className="space-y-8">
                    <Card className="p-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] shadow-xl text-white">
                      <h3 className="text-lg font-bold mb-6">Qualité des Matches</h3>
                      <div className="flex items-end justify-between mb-4">
                        <div className="text-5xl font-black">88%</div>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">TOP 5%</div>
                      </div>
                      <p className="text-emerald-100 text-sm leading-relaxed">
                        Votre profil attire des décideurs de haut niveau. Continuez à enrichir vos expériences.
                      </p>
                    </Card>

                    <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-slate-100">
                      <h3 className="text-slate-900 font-black mb-6">Croissance</h3>
                      <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: 'Lun', val: 4 },
                            { name: 'Mar', val: 7 },
                            { name: 'Mer', val: 5 },
                            { name: 'Jeu', val: 9 },
                            { name: 'Ven', val: 12 },
                          ]}>
                            <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                              { [0,1,2,3,4].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 4 ? '#3b82f6' : '#e2e8f0'} />
                              ))}
                            </Bar>
                            <Tooltip cursor={{fill: 'transparent'}} content={() => null} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-slate-400 text-xs font-bold uppercase">Activité Hebdo</span>
                        <span className="text-emerald-500 text-xs font-black">+24%</span>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Analyse Textuelle IA */}
                <Card className="p-10 bg-white rounded-[3rem] shadow-xl border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
                  <div className="flex flex-col md:flex-row gap-10">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Synthèse de l'IA</h3>
                      </div>
                      <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        {aiInsights.summary}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h4 className="font-black text-slate-900 mb-4 flex items-center">
                            <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                            Points Forts
                          </h4>
                          <ul className="space-y-3">
                            {aiInsights.suggestions.slice(0, 2).map((s) => (
                              <li key={s} className="text-sm text-slate-600 flex items-start">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h4 className="font-black text-slate-900 mb-4 flex items-center">
                            <ArrowRight className="h-4 w-4 text-blue-500 mr-2" />
                            Recommandations
                          </h4>
                          <ul className="space-y-3">
                            {aiInsights.suggestions.slice(2, 4).map((s) => (
                              <li key={s} className="text-sm text-slate-600 flex items-start">
                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              /* État vide Insights */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale pointer-events-none">
                <Card className="p-8 h-64 bg-white rounded-3xl"></Card>
                <Card className="p-8 h-64 bg-white rounded-3xl"></Card>
                <Card className="p-8 h-64 bg-white rounded-3xl"></Card>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.favorites && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {/* Header Favoris Moderne */}
            <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="bg-rose-500 p-6 rounded-[2rem] shadow-lg shadow-rose-200">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-slate-900 mb-2">Mes Favoris</h2>
                  <p className="text-slate-500 text-lg">Gardez un œil sur les profils qui comptent le plus pour vous.</p>
                </div>
              </div>
            </div>

            {favorites.length === 0 ? (
              <Card className="text-center p-20 bg-white rounded-[3rem] shadow-xl border-slate-100">
                <div className="bg-rose-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <Heart className="h-12 w-12 text-rose-200" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">Aucun favori enregistré</h3>
                <p className="text-slate-500 mb-10 max-w-md mx-auto">
                  Cliquez sur le cœur des profils qui vous intéressent pour les retrouver ici instantanément.
                </p>
                <Button 
                  onClick={() => setActiveTab(CONFIG.tabIds.recommendations)}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl"
                >
                  Explorer les Profils
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((favoriteId) => {
                  // Mock data
                  const mockFavorite = {
                    id: favoriteId,
                    name: 'Contact Privilégié',
                    title: 'Directeur Innovation',
                    company: 'Smart Port Solutions',
                    avatar: null
                  };

                  return (
                    <motion.div
                      key={favoriteId}
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-8 bg-white hover:shadow-2xl transition-all duration-500 border-slate-100 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6">
                          <Heart className="h-6 w-6 text-rose-500 fill-current" />
                        </div>
                        
                        <Avatar className="h-20 w-20 mb-6 border-4 border-slate-50 shadow-lg">
                          <AvatarFallback className="bg-rose-100 text-rose-600 font-black text-xl">CP</AvatarFallback>
                        </Avatar>

                        <h3 className="text-xl font-black text-slate-900 mb-1">{mockFavorite.name}</h3>
                        <p className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-1">{mockFavorite.title}</p>
                        <p className="text-sm text-slate-400 mb-8">{mockFavorite.company}</p>

                        <div className="flex gap-3">
                          <Button 
                            onClick={() => handleViewProfile(mockFavorite.name, mockFavorite.company)}
                            className="flex-1 bg-slate-900 text-white rounded-xl h-12 font-black"
                          >
                            Voir Profil
                          </Button>
                          <button 
                            onClick={() => handleFavoriteToggle(favoriteId, mockFavorite.name, true)}
                            className="p-3 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all"
                          >
                            <Plus className="h-6 w-6 rotate-45" />
                          </button>
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


