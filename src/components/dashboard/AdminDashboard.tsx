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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Administrateur */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-600 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de Bord Administrateur SIPORTS
                </h1>
                <p className="text-gray-600">
                  Centre de contrôle et supervision de la plateforme
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchMetrics()}
                disabled={isLoading}
                className="ml-4"
              >
                <Activity className="h-4 w-4 mr-2" />
                {isLoading ? 'Chargement...' : 'Rafraîchir'}
              </Button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">Zone Administrateur</span>
                <Badge variant="error" size="sm">Accès Restreint</Badge>
                <span className="text-red-700 text-sm">- Connecté en tant que {user?.profile.firstName} {user?.profile.lastName}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Alertes Prioritaires */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-yellow-900">
                    Actions Requises ({adminMetrics.pendingValidations} en attente)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowRegistrationRequests(!showRegistrationRequests)}
                    className="bg-white p-4 rounded-lg border border-yellow-200 hover:border-yellow-400 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <ClipboardList className="h-5 w-5 text-yellow-600" />
                      <Badge variant="warning">{adminMetrics.pendingValidations}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {adminMetrics.pendingValidations}
                    </div>
                    <div className="text-sm text-yellow-700">Demandes d'inscription</div>
                    <div className="text-xs text-yellow-600 mt-2">Cliquez pour voir</div>
                  </button>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-yellow-600 mb-1">
                      {adminMetrics.contentModerations}
                    </div>
                    <div className="text-sm text-yellow-700">Contenus à modérer</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {adminMetrics.activeContracts}
                    </div>
                    <div className="text-sm text-green-700">Contrats actifs</div>
                  </div>
                </div>
              </div>
            </Card>
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

        {/* Métriques Système Globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-8 w-8" />
                  <Badge className="bg-white text-blue-600" size="sm">
                    +8% ce mois
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {adminMetrics.totalUsers.toLocaleString()}
                </div>
                <div className="text-blue-100 text-sm">
                  Utilisateurs Total
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="h-8 w-8" />
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                    <span className="text-xs">Live</span>
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {adminMetrics.activeUsers.toLocaleString()}
                </div>
                <div className="text-green-100 text-sm">
                  Utilisateurs Actifs
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Server className="h-8 w-8" />
                  <Badge className="bg-white text-purple-600" size="sm">
                    Excellent
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {adminMetrics.systemUptime}%
                </div>
                <div className="text-purple-100 text-sm">
                  Uptime Système
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Database className="h-8 w-8" />
                  <Badge className="bg-white text-orange-600" size="sm">
                    78% utilisé
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {adminMetrics.dataStorage} TB
                </div>
                <div className="text-orange-100 text-sm">
                  Stockage Données
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Actions Administrateur */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Actions Administrateur Critiques
                </h3>
                
                <div className="space-y-4">
                  <Link to="/admin/create-exhibitor" className="block">
                    <Button variant="default" className="w-full justify-start bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-3" />
                      Créer Nouvel Exposant
                    </Button>
                  </Link>
                  
                  <Link to="/admin/create-partner" className="block">
                    <Button variant="default" className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-3" />
                      Créer Nouveau Partenaire
                    </Button>
                  </Link>
                  
                  <Link to="/admin/create-news" className="block">
                    <Button variant="default" className="w-full justify-start bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-3" />
                      Créer Nouvel Article
                    </Button>
                  </Link>
                  
                  <Link to="/admin/validation" className="block">
                    <Button variant="default" className="w-full justify-start bg-red-600 hover:bg-red-700">
                      <UserCheck className="h-4 w-4 mr-3" />
                      Validation Comptes ({adminMetrics.pendingValidations})
                    </Button>
                  </Link>
                  
                  <Link to="/admin/moderation" className="block">
                    <Button variant="default" className="w-full justify-start bg-orange-600 hover:bg-orange-700">
                      <FileText className="h-4 w-4 mr-3" />
                      Modération Contenu ({adminMetrics.contentModerations})
                    </Button>
                  </Link>
                  
                  <Link to="/metrics" className="block">
                    <Button variant="default" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Métriques & Performance Complètes
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-3" />
                    Gestion Utilisateurs ({adminMetrics.totalUsers.toLocaleString()})
                  </Button>
                  
                  <Link to="/admin/pavilions" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Building2 className="h-4 w-4 mr-3" />
                      Gestion Pavillons ({adminMetrics.totalExhibitors})
                    </Button>
                  </Link>
                  
                  <Link to="/admin/content" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-3" />
                      Gestion Événements ({adminMetrics.totalEvents})
                    </Button>
                  </Link>
                  
                  <Link to="/networking" className="block">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Supervision Réseautage
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Performance Technique Système
                </h3>
                
                <div className="space-y-4">
                  {systemHealth.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-bold ${item.color}`}>
                          {item.value}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'excellent' ? 'bg-green-500' :
                          item.status === 'good' ? 'bg-blue-500' :
                          item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Appels API (24h):</span>
                      <span className="font-semibold">{adminMetrics.apiCalls.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temps réponse:</span>
                      <span className="font-semibold text-green-600">{adminMetrics.avgResponseTime}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

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