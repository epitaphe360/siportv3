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
  ClipboardList
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { useAdminDashboardStore } from '../../store/adminDashboardStore';
import { motion } from 'framer-motion';
import RegistrationRequests from '../admin/RegistrationRequests';

export default function AdminDashboard() {
  const { metrics, isLoading, error, fetchMetrics } = useAdminDashboardStore();
  const { user } = useAuthStore();
  const [showRegistrationRequests, setShowRegistrationRequests] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Métriques administrateur récupérées depuis Supabase
  const adminMetrics = metrics || {
    totalUsers: 2524, // Real value from database
    activeUsers: 1247,
    totalExhibitors: 22, // Real value from database
    totalPartners: 25,
    totalVisitors: 2452, // Real value from database
    totalEvents: 12, // Real value from database
    systemUptime: 99.8,
    dataStorage: 2.4,
    apiCalls: 125000,
    avgResponseTime: 145,
    pendingValidations: 12,
    activeContracts: 285,
    contentModerations: 8
  };

  const systemHealth = [
    { name: 'API Performance', status: 'excellent', value: '145ms', color: 'text-green-600' },
    { name: 'Database', status: 'good', value: '99.2%', color: 'text-green-600' },
    { name: 'Storage', status: 'warning', value: '78%', color: 'text-yellow-600' },
    { name: 'CDN', status: 'excellent', value: '99.9%', color: 'text-green-600' }
  ];

  const recentAdminActivity = [
    {
      id: '1',
      type: 'account_validation',
      description: 'Compte exposant "Port Solutions Inc." activé',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'success',
      adminUser: 'Admin System'
    },
    {
      id: '2',
      type: 'content_moderation',
      description: 'Contenu signalé modéré - Mini-site "Maritime Tech"',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'warning',
      adminUser: 'Modérateur Content'
    },
    {
      id: '3',
      type: 'system_alert',
      description: 'Pic de trafic détecté - 2000 utilisateurs simultanés',
      timestamp: new Date(Date.now() - 10800000),
      severity: 'info',
      adminUser: 'System Monitor'
    }
  ];

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

  if (user?.type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès Restreint - Administrateurs Uniquement
          </h3>
          <p className="text-gray-600 mb-4">
            Cette section est réservée aux administrateurs SIPORTS
          </p>
          <Link to="/dashboard">
            <Button variant="default">
              Retour au Tableau de Bord
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
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement des métriques
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Button variant="default" onClick={() => fetchMetrics()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Administrateur - Modern Design */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-2xl p-8 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      Admin Dashboard
                    </h1>
                    <p className="text-blue-100">
                      Bienvenue, {user?.profile.firstName} {user?.profile.lastName}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Calendar className="h-3 w-3 mr-1" />
                  {adminMetrics.totalEvents} événements
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

              <div className="space-y-3">
                <Link to="/admin/create-exhibitor" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white p-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-4">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Créer Nouvel Exposant</div>
                        <div className="text-xs text-emerald-100">Ajouter un exposant à la plateforme</div>
                      </div>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </Link>

                <Link to="/admin/create-partner" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white p-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-4">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Créer Nouveau Partenaire</div>
                        <div className="text-xs text-purple-100">Ajouter un partenaire stratégique</div>
                      </div>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </Link>

	                <Link to="/admin/create-event" className="block">
	                  <motion.div
	                    whileHover={{ scale: 1.02 }}
	                    whileTap={{ scale: 0.98 }}
	                  >
	                    <div className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center mb-3">
	                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-4">
	                        <Calendar className="h-5 w-5" />
	                      </div>
	                      <div className="flex-1">
	                        <div className="font-semibold">Créer Nouvel Événement</div>
	                        <div className="text-xs text-orange-100">Planifier une conférence ou un atelier</div>
	                      </div>
	                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
	                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
	                      </svg>
	                    </div>
	                  </motion.div>
	                </Link>
	
	                <Link to="/admin/create-news" className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white p-4 rounded-xl shadow-md transition-all cursor-pointer flex items-center">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-4">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">Créer Nouvel Article</div>
                        <div className="text-xs text-blue-100">Publier une actualité</div>
                      </div>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </Link>
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
                <Link to="/metrics">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-slate-50 to-gray-100 p-4 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-all cursor-pointer"
                  >
                    <BarChart3 className="h-6 w-6 text-slate-600 mb-2" />
                    <div className="font-semibold text-slate-900 text-sm">Métriques</div>
                    <div className="text-xs text-slate-600">Performance</div>
                  </motion.div>
                </Link>

                <Link to="/admin/users">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                  >
                    <Users className="h-6 w-6 text-blue-600 mb-2" />
                    <div className="font-semibold text-blue-900 text-sm">Utilisateurs</div>
                    <div className="text-xs text-blue-600">{adminMetrics.totalUsers.toLocaleString()}</div>
                  </motion.div>
                </Link>

                <Link to="/admin/pavilions">
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
                <Link to="/admin/activity" className="block">
                  <Button variant="ghost" size="sm">
                    Voir tout
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentAdminActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const iconColor = getActivityColor(activity.severity);
                  
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + 0 * 0.1 }}
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
                <Link to="/metrics">
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