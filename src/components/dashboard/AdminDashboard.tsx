import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Building2,
  Calendar,
  Activity,
  Award,
  Shield,
  Database,
  Server,
  UserCheck,
  FileText,
  AlertTriangle,
  Plus,
  ClipboardList,
  Download,
  TrendingUp,
  Eye,
  MessageCircle,
  Video,
  CheckCircle,
  CreditCard,
  Crown,
  Handshake
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { useAdminDashboardStore } from '../../store/adminDashboardStore';
import { motion } from 'framer-motion';
import RegistrationRequests from '../admin/RegistrationRequests';
import { useNewsStore } from '../../store/newsStore';
import { toast } from 'sonner';
import { StatCard, LineChartCard, BarChartCard, PieChartCard } from './charts';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern } from '../ui/MoroccanDecor';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { metrics, isLoading, error, fetchMetrics } = useAdminDashboardStore();
  const { user } = useAuthStore();
  const { fetchFromOfficialSite } = useNewsStore();
  const [showRegistrationRequests, setShowRegistrationRequests] = useState(false);
  const [isImportingArticles, setIsImportingArticles] = useState(false);

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally fetch only on mount

  // Métriques administrateur récupérées depuis Supabase
  // Display loading state if metrics not yet fetched
  // IMPORTANT: adminMetrics must be declared BEFORE activityData which uses it
  const adminMetrics = metrics || {
    totalUsers: 0,
    activeUsers: 0,
    totalExhibitors: 0,
    totalPartners: 0,
    totalVisitors: 0,
    totalEvents: 0,
    systemUptime: 0,
    dataStorage: 0,
    apiCalls: 0,
    avgResponseTime: 0,
    pendingValidations: 0,
    activeContracts: 0,
    contentModerations: 0
  };

  // Utiliser les vraies données depuis adminMetrics
  const userGrowthData = adminMetrics.userGrowthData || [];
  
  const activityData = [
    { name: 'Connexions', value: adminMetrics.totalConnections || 0 },
    { name: 'RDV Créés', value: adminMetrics.totalAppointments || 0 },
    { name: 'Messages', value: adminMetrics.totalMessages || 0 },
    { name: 'Documents', value: adminMetrics.totalDownloads || 0 },
  ];
  
  // Vérifier si toutes les activités sont à 0
  const hasActivityData = activityData.some(item => item.value > 0);

  // Utiliser les vraies données de trafic depuis les métriques
  const trafficData = adminMetrics.trafficData || [];

  // Distribution des types d'utilisateurs
  const userTypeDistribution = [
    { name: 'Visiteurs', value: adminMetrics.totalVisitors || 0, color: '#3b82f6' },
    { name: 'Exposants', value: adminMetrics.totalExhibitors || 0, color: '#10b981' },
    { name: 'Partenaires', value: adminMetrics.totalPartners || 0, color: '#f59e0b' },
  ];

  const systemHealth = [
    { name: 'API Performance', status: 'excellent', value: `${adminMetrics.avgResponseTime || 45}ms`, color: 'text-green-600' },
    { name: 'Database', status: 'good', value: `${adminMetrics.systemUptime || 99.9}%`, color: 'text-green-600' },
    { name: 'Storage', status: 'warning', value: `${adminMetrics.dataStorage || 0.5} GB`, color: 'text-yellow-600' },
    { name: 'Appels API', status: 'excellent', value: `${(adminMetrics.apiCalls || 1500).toLocaleString()}`, color: 'text-green-600' }
  ];

  // Utiliser les vraies données d'activité récente depuis les métriques
  const recentAdminActivity = adminMetrics.recentActivity || [];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'account_validation': return UserCheck;
      case 'content_moderation': return FileText;
      case 'system_alert': return AlertTriangle;
      case 'user_management': return Users;
      case 'security': return Shield;
      default: return Activity;
    }
  };

  const getActivityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleImportArticles = async () => {
    setIsImportingArticles(true);
    try {
      toast.loading('🔄 Synchronisation des articles depuis siportevent.com...', { id: 'import-articles', duration: 10000 });
      const result = await fetchFromOfficialSite();
      
      if (result && result.success && result.stats) {
        const { inserted, updated, total } = result.stats;
        toast.success(
          `✅ Synchronisation réussie !\n${inserted} nouveau${inserted > 1 ? 'x' : ''} article${inserted > 1 ? 's' : ''}, ${updated} mis à jour sur ${total} trouvé${total > 1 ? 's' : ''}`,
          { 
            id: 'import-articles',
            duration: 6000,
            description: 'Les articles sont maintenant disponibles sur la page Actualités'
          }
        );
      } else {
        toast.success('✅ Articles synchronisés avec succès !', { 
          id: 'import-articles',
          duration: 4000,
          description: 'Consultez la page Actualités pour voir les nouveaux articles'
        });
      }
    } catch (error) {
      console.error('❌ Erreur importation articles:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(
        `❌ Échec de la synchronisation automatique`,
        { 
          id: 'import-articles',
          duration: 8000,
          description: `Utilisez le script manuel : node scripts/sync-siport-news.mjs\n${errorMsg}`
        }
      );
    } finally {
      setIsImportingArticles(false);
    }
  };

  // CRITICAL #1 FIX: Explicit null check for user type validation
  if (!user || user.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t('dashboard.restricted_access')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('dashboard.restricted_message')}
          </p>
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="default">
              {t('dashboard.back_to_dashboard')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={`skeleton-${i}`} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t('dashboard.metrics_error')}
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Button variant="default" onClick={() => fetchMetrics()}>
            {t('dashboard.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Administrateur - Modern Design */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
              {/* Background Pattern */}
              <MoroccanPattern className="opacity-15" color="white" scale={0.8} />
              
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                <div className="flex items-center space-x-4 w-full md:w-auto">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                    <Shield className="h-10 w-10 text-siports-gold" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Admin Dashboard
                    </h1>
                    <p className="text-blue-100">
                      Bienvenue, {user?.profile?.firstName || 'Administrateur'} {user?.profile?.lastName || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">Système Opérationnel</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchMetrics()}
                    disabled={isLoading}
                    className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
                  >
                    <Activity className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </Button>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm mb-1">Uptime Système</div>
                      <div className="text-2xl font-bold text-white">{adminMetrics.systemUptime}%</div>
                    </div>
                    <Server className="h-8 w-8 text-white/60" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm mb-1">Appels API/jour</div>
                      <div className="text-2xl font-bold text-white">{(adminMetrics.apiCalls / 1000).toFixed(0)}K</div>
                    </div>
                    <BarChart3 className="h-8 w-8 text-white/60" />
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white/80 text-sm mb-1">Stockage Utilisé</div>
                      <div className="text-2xl font-bold text-white">{adminMetrics.dataStorage} GB</div>
                    </div>
                    <Database className="h-8 w-8 text-white/60" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alertes Prioritaires - Modern Design */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Actions Requises
                    </h3>
                    <p className="text-orange-100 text-sm">
                      {adminMetrics.pendingValidations + adminMetrics.contentModerations} éléments nécessitent votre attention
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowRegistrationRequests(!showRegistrationRequests)}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer text-left shadow-md hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-amber-500 p-2 rounded-lg">
                        <ClipboardList className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="warning" className="text-base px-3 py-1">
                        {adminMetrics.pendingValidations}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-amber-700 mb-2">
                      {adminMetrics.pendingValidations}
                    </div>
                    <div className="text-sm font-medium text-amber-900 mb-1">
                      Demandes d'inscription
                    </div>
                    <div className="text-xs text-amber-600 flex items-center mt-3">
                      <span>Cliquer pour traiter</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.button>

                  <Link to={ROUTES.ADMIN_PAYMENT_VALIDATION} className="block h-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant="default" className="bg-blue-500 text-white border-none">
                          Action
                        </Badge>
                      </div>
                      <div className="text-xl font-bold text-blue-800 mb-2 mt-4">
                        Validation Paiements
                      </div>
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        Gérer les preuves
                      </div>
                      <div className="text-xs text-blue-600 flex items-center mt-3">
                        <span>Accéder</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>

                  <Link to={ROUTES.ADMIN_EXHIBITORS} className="block h-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-emerald-500 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant="default" className="bg-emerald-500 text-white border-none">
                          Gestion
                        </Badge>
                      </div>
                      <div className="text-xl font-bold text-emerald-800 mb-2 mt-4">
                         Exposants
                      </div>
                      <div className="text-sm font-medium text-emerald-900 mb-1">
                        Liste & Abonnements
                      </div>
                      <div className="text-xs text-emerald-600 flex items-center mt-3">
                        <span>Gérer</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>

                  <Link to={ROUTES.ADMIN_PARTNERS_MANAGE} className="block h-full">
                     <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="h-full bg-gradient-to-br from-purple-50 to-fuchsia-50 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-purple-500 p-2 rounded-lg">
                          <Handshake className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant="default" className="bg-purple-500 text-white border-none">
                          VIP
                        </Badge>
                      </div>
                      <div className="text-xl font-bold text-purple-800 mb-2 mt-4">
                        Partenaires
                      </div>
                      <div className="text-sm font-medium text-purple-900 mb-1">
                        Liste & Packs
                      </div>
                      <div className="text-xs text-purple-600 flex items-center mt-3">
                        <span>Gérer</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>

                  <Link to={ROUTES.ADMIN_VIP_VISITORS} className="block h-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="h-full bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200 hover:border-yellow-400 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="bg-yellow-500 p-2 rounded-lg">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <Badge variant="default" className="bg-yellow-500 text-white border-none">
                          VIP
                        </Badge>
                      </div>
                      <div className="text-xl font-bold text-yellow-800 mb-2 mt-4">
                        Gestion Visiteurs VIP
                      </div>
                      <div className="text-sm font-medium text-yellow-900 mb-1">
                        Consulter la liste
                      </div>
                      <div className="text-xs text-yellow-600 flex items-center mt-3">
                        <span>Voir</span>
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </Link>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-red-500 p-2 rounded-lg">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-red-700 mb-2">
                      {adminMetrics.contentModerations}
                    </div>
                    <div className="text-sm font-medium text-red-900">
                      Contenus à modérer
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      {adminMetrics.activeContracts}
                    </div>
                    <div className="text-sm font-medium text-green-900">
                      Contrats actifs
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Section des demandes d'inscription */}
        {showRegistrationRequests && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <RegistrationRequests />
          </motion.div>
        )}

        {/* Métriques Système Globales - Modern Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistiques Plateforme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-xl shadow-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
                      +8%
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {adminMetrics.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-blue-100 text-sm font-medium">
                    Utilisateurs Total
                  </div>
                  <div className="mt-4 flex items-center text-blue-100 text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    {adminMetrics.activeUsers.toLocaleString()} actifs
                  </div>
                </div>
              </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-xl shadow-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-blue-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-full">
                    +5%
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {adminMetrics.totalExhibitors}
                </div>
                <div className="text-emerald-100 text-sm font-medium">
                  Exposants
                </div>
                <div className="mt-4 flex items-center text-emerald-100 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {(adminMetrics as any).onlineExhibitors || 85} en ligne
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-xl shadow-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    VIP
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {adminMetrics.totalPartners}
                </div>
                <div className="text-purple-100 text-sm font-medium">
                  Partenaires
                </div>
                <div className="mt-4 flex items-center text-purple-100 text-xs">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                  {adminMetrics.activeContracts} contrats actifs
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ y: -5 }}
          >
            <div className="bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600 rounded-xl shadow-lg p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full">
                    +12%
                  </div>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {adminMetrics.totalVisitors.toLocaleString()}
                </div>
                <div className="text-cyan-100 text-sm font-medium">
                  Visiteurs
                </div>
                <div className="mt-4 flex items-center text-cyan-100 text-xs">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {adminMetrics.activeUsers.toLocaleString()} en ligne
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        </div>

        {/* Section Graphiques - Professional Analytics */}
        <div className="mb-8 space-y-6">
          {/* Titre Section */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Analyse & Tendances</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>Données en temps réel</span>
            </div>
          </div>

          {/* Row 1: Graphique de croissance utilisateurs */}
          <LineChartCard
            title="Croissance des Utilisateurs (6 derniers mois)"
            data={userGrowthData}
            dataKeys={[
              { key: 'users', color: '#3b82f6', name: 'Total Utilisateurs' },
              { key: 'exhibitors', color: '#10b981', name: 'Exposants' },
              { key: 'visitors', color: '#8b5cf6', name: 'Visiteurs' }
            ]}
            height={350}
            showArea={true}
            loading={isLoading}
          />

          {/* Row 2: Distribution et Activité */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartCard
              title="Distribution des Utilisateurs"
              data={userTypeDistribution}
              colors={userTypeDistribution.map(d => d.color || '#cbd5e1')}
              height={320}
              loading={isLoading}
              showPercentage={true}
            />

            <BarChartCard
              title="Activité Plateforme (Cette semaine)"
              data={activityData}
              dataKey="value"
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              height={320}
              loading={isLoading}
            />
          </div>

          {/* Row 3: Trafic hebdomadaire */}
          <LineChartCard
            title="Trafic Hebdomadaire"
            data={trafficData}
            dataKeys={[
              { key: 'visits', color: '#3b82f6', name: 'Visites' },
              { key: 'pageViews', color: '#10b981', name: 'Pages vues' }
            ]}
            height={300}
            loading={isLoading}
          />
        </div>

        {/* Actions Administrateur - Modern Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Actions Rapides
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Exposants */}
                <div className="border-l-4 border-emerald-500 pl-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">📦 Exposants</h4>
                  <Link to={ROUTES.ADMIN_CREATE_EXHIBITOR} className="block mb-2">
                    <div className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded text-xs font-medium transition">➕ Créer</div>
                  </Link>
                  <Link to={ROUTES.ADMIN_EXHIBITORS} className="block">
                    <div className="bg-teal-50 hover:bg-teal-100 text-teal-700 p-2 rounded text-xs font-medium transition">📋 Gérer</div>
                  </Link>
                </div>

                {/* Partenaires */}
                <div className="border-l-4 border-purple-500 pl-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">🤝 Partenaires</h4>
                  <Link to={ROUTES.ADMIN_CREATE_PARTNER} className="block mb-2">
                    <div className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-2 rounded text-xs font-medium transition">➕ Créer</div>
                  </Link>
                  <Link to={ROUTES.ADMIN_PARTNERS_MANAGE} className="block">
                    <div className="bg-pink-50 hover:bg-pink-100 text-pink-700 p-2 rounded text-xs font-medium transition">📋 Gérer</div>
                  </Link>
                </div>

                {/* Événements */}
                <div className="border-l-4 border-orange-500 pl-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">📅 Événements</h4>
                  <Link to={ROUTES.ADMIN_CREATE_EVENT} className="block mb-2">
                    <div className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-2 rounded text-xs font-medium transition">➕ Créer</div>
                  </Link>
                  <Link to={ROUTES.ADMIN_EVENTS} className="block">
                    <div className="bg-red-50 hover:bg-red-100 text-red-700 p-2 rounded text-xs font-medium transition">📋 Gérer</div>
                  </Link>
                </div>

                {/* Contenu */}
                <div className="border-l-4 border-blue-500 pl-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">📝 Contenu</h4>
                  <Link to={ROUTES.ADMIN_CREATE_NEWS} className="block mb-2">
                    <div className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-2 rounded text-xs font-medium transition">➕ Créer</div>
                  </Link>
                  <Link to={ROUTES.ADMIN_NEWS} className="block">
                    <div className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 p-2 rounded text-xs font-medium transition">📋 Gérer</div>
                  </Link>
                </div>

                {/* Médias */}
                <div className="border-l-4 border-rose-500 pl-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">🎥 Médias</h4>
                  <Link to={ROUTES.ADMIN_MEDIA_MANAGE} className="block mb-2">
                    <div className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-2 rounded text-xs font-medium transition">📹 Gérer</div>
                  </Link>
                  <Link to={ROUTES.ADMIN_PARTNER_MEDIA_APPROVAL} className="block">
                    <div className="bg-amber-50 hover:bg-amber-100 text-amber-700 p-2 rounded text-xs font-medium transition">✅ Valider</div>
                  </Link>
                </div>

                {/* Synchronisation */}
                <div className="border-l-4 border-indigo-500 pl-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">🔄 Sync</h4>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleImportArticles}
                    className="block"
                  >
                    <div className={`bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-2 rounded text-xs font-medium transition ${isImportingArticles ? 'opacity-70' : ''}`}>
                      {isImportingArticles ? '⏳ Sync...' : '🔄 Sync Articles'}
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-blue-600">
                💡 Manuel: <code className="bg-gray-100 px-1 rounded">node scripts/sync-siport-news.mjs</code>
              </div>
            </div>
          </motion.div>

          {/* Navigation Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-gradient-to-br from-slate-500 to-slate-600 p-3 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Navigation Admin
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link to={ROUTES.METRICS}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
                  >
                    <BarChart3 className="h-6 w-6 text-slate-600 mb-2" />
                    <div className="font-semibold text-slate-900 text-sm">Métriques</div>
                    <div className="text-xs text-slate-600">Performance</div>
                  </motion.div>
                </Link>

                <Link to={ROUTES.ADMIN_USERS}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                  >
                    <Users className="h-6 w-6 text-blue-600 mb-2" />
                    <div className="font-semibold text-blue-900 text-sm">Utilisateurs</div>
                    <div className="text-xs text-blue-600">{adminMetrics.totalUsers.toLocaleString()}</div>
                  </motion.div>
                </Link>

                <Link to={ROUTES.ADMIN_PAVILIONS}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer"
                  >
                    <Building2 className="h-6 w-6 text-green-600 mb-2" />
                    <div className="font-semibold text-green-900 text-sm">Pavillons</div>
                    <div className="text-xs text-green-600">{adminMetrics.totalExhibitors}</div>
                  </motion.div>
                </Link>

	                <Link to={ROUTES.ADMIN_EVENTS}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer"
                  >
	                    <Calendar className="h-6 w-6 text-purple-600 mb-2" />
                    <div className="font-semibold text-purple-900 text-sm">Événements</div>
                    <div className="text-xs text-purple-600">{adminMetrics.totalEvents}</div>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

      {/* Santé Système */}
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Santé Système
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systemHealth.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border-2 border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">{item.name}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'excellent' ? 'bg-green-500 animate-pulse' :
                      item.status === 'good' ? 'bg-blue-500' :
                      item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <div className={`text-2xl font-bold ${item.color} mb-1`}>
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">{item.status}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Appels API (24h)</span>
                <span className="text-lg font-bold text-gray-900">{adminMetrics.apiCalls.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Temps réponse moyen</span>
                <span className="text-lg font-bold text-green-600">{adminMetrics.avgResponseTime}ms</span>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Activité Système Récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Activité Système Récente
                </h3>
                <Link to={ROUTES.ADMIN_ACTIVITY} className="block">
                  <Button variant="ghost" size="sm">
                    Voir tout
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentAdminActivity.map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const iconColor = getActivityColor(activity.severity);

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 rounded-lg bg-white shadow-sm">
                        <ActivityIcon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-xs text-gray-500">
                            {activity.adminUser}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Métriques du Salon */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {adminMetrics.totalExhibitors}
              </div>
              <div className="text-gray-600 text-sm">Exposants Actifs</div>
              <Badge variant="success" size="sm" className="mt-2">
                +10% vs objectif
              </Badge>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="text-center p-6">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {adminMetrics.totalVisitors.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Visiteurs Inscrits</div>
              <Badge variant="success" size="sm" className="mt-2">
                +5% vs objectif
              </Badge>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Card className="text-center p-6">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {adminMetrics.totalPartners}
              </div>
              <div className="text-gray-600 text-sm">Partenaires Officiels</div>
              <Badge variant="success" size="sm" className="mt-2">
                +25% vs objectif
              </Badge>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            <Card className="text-center p-6">
              <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {adminMetrics.totalEvents}
              </div>
              <div className="text-gray-600 text-sm">Conférences & Ateliers</div>
              <Badge variant="success" size="sm" className="mt-2">
                +33% vs objectif
              </Badge>
            </Card>
          </motion.div>
        </div>

        {/* Accès aux Métriques Complètes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <div className="p-8 text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Métriques & Performance Détaillées
              </h3>
              <p className="text-gray-600 mb-6">
                Accédez aux analyses complètes de performance du salon SIPORTS 2026
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link to={ROUTES.METRICS}>
                  <Button variant="default" size="lg" className="bg-red-600 hover:bg-red-700">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Voir les Métriques Complètes
                  </Button>
                </Link>
                <Badge variant="error" size="sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Accès Admin Uniquement
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};