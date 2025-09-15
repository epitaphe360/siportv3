import { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  UserCheck,
  UserX,
  FileText,
  Shield,
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  MoreVertical,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');

  // Données mockées pour l'activité système
  const activities = [
    {
      id: '1',
      type: 'user_registration',
      description: 'Nouveau compte utilisateur créé - Marie Martin (Partenaire)',
      timestamp: new Date(Date.now() - 3600000),
      severity: 'info',
      user: 'System',
      details: {
        userId: 'user_123',
        email: 'marie.martin@tech-nav.com',
        role: 'partner'
      }
    },
    {
      id: '2',
      type: 'exhibitor_validation',
      description: 'Exposant approuvé - Port Maritime Marseille',
      timestamp: new Date(Date.now() - 7200000),
      severity: 'success',
      user: 'Admin System',
      details: {
        exhibitorId: 'exhib_456',
        standNumber: 'A12',
        category: 'Infrastructure Portuaire'
      }
    },
    {
      id: '3',
      type: 'content_moderation',
      description: 'Contenu signalé modéré - Mini-site Maritime Solutions',
      timestamp: new Date(Date.now() - 10800000),
      severity: 'warning',
      user: 'Modérateur Content',
      details: {
        contentId: 'content_789',
        reason: 'Contenu inapproprié',
        action: 'Modéré'
      }
    },
    {
      id: '4',
      type: 'security_alert',
      description: 'Tentative de connexion échouée - IP: 192.168.1.100',
      timestamp: new Date(Date.now() - 14400000),
      severity: 'error',
      user: 'Security System',
      details: {
        ipAddress: '192.168.1.100',
        attempts: 5,
        userAgent: 'Chrome/91.0'
      }
    },
    {
      id: '5',
      type: 'event_registration',
      description: 'Inscription à un événement - 45 participants pour "Conférence Innovation"',
      timestamp: new Date(Date.now() - 18000000),
      severity: 'info',
      user: 'Event System',
      details: {
        eventId: 'event_101',
        registrations: 45,
        capacity: 500
      }
    },
    {
      id: '6',
      type: 'system_backup',
      description: 'Sauvegarde automatique du système terminée avec succès',
      timestamp: new Date(Date.now() - 21600000),
      severity: 'success',
      user: 'System',
      details: {
        backupSize: '2.4 GB',
        duration: '15 minutes',
        status: 'Success'
      }
    },
    {
      id: '7',
      type: 'user_suspension',
      description: 'Compte utilisateur suspendu - Violation des conditions d\'utilisation',
      timestamp: new Date(Date.now() - 25200000),
      severity: 'warning',
      user: 'Admin System',
      details: {
        userId: 'user_999',
        reason: 'Violation CGU',
        duration: '7 jours'
      }
    },
    {
      id: '8',
      type: 'api_rate_limit',
      description: 'Limite de taux API dépassée pour l\'application partenaire',
      timestamp: new Date(Date.now() - 28800000),
      severity: 'warning',
      user: 'API Gateway',
      details: {
        appId: 'app_456',
        requests: 1200,
        limit: 1000,
        resetTime: '1 heure'
      }
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || activity.type === selectedType;
    const matchesSeverity = !selectedSeverity || activity.severity === selectedSeverity;

    return matchesSearch && matchesType && matchesSeverity;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return Users;
      case 'exhibitor_validation': return Building2;
      case 'content_moderation': return FileText;
      case 'security_alert': return Shield;
      case 'event_registration': return Calendar;
      case 'system_backup': return RefreshCw;
      case 'user_suspension': return UserX;
      case 'api_rate_limit': return AlertTriangle;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'text-blue-600';
      case 'exhibitor_validation': return 'text-green-600';
      case 'content_moderation': return 'text-yellow-600';
      case 'security_alert': return 'text-red-600';
      case 'event_registration': return 'text-purple-600';
      case 'system_backup': return 'text-indigo-600';
      case 'user_suspension': return 'text-orange-600';
      case 'api_rate_limit': return 'text-pink-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Badge variant="error">Erreur</Badge>;
      case 'warning':
        return <Badge variant="warning">Avertissement</Badge>;
      case 'success':
        return <Badge variant="success">Succès</Badge>;
      case 'info':
        return <Badge variant="info">Info</Badge>;
      default:
        return <Badge variant="info">{severity}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user_registration': return 'Inscription utilisateur';
      case 'exhibitor_validation': return 'Validation exposant';
      case 'content_moderation': return 'Modération contenu';
      case 'security_alert': return 'Alerte sécurité';
      case 'event_registration': return 'Inscription événement';
      case 'system_backup': return 'Sauvegarde système';
      case 'user_suspension': return 'Suspension utilisateur';
      case 'api_rate_limit': return 'Limite API';
      default: return type;
    }
  };

  const handleActivityAction = (activityId: string, action: string) => {
    console.log(`Action ${action} pour l'activité ${activityId}`);
    // Ici vous pouvez implémenter les actions réelles
  };

  const activityTypes = [
    { value: 'user_registration', label: 'Inscription utilisateur' },
    { value: 'exhibitor_validation', label: 'Validation exposant' },
    { value: 'content_moderation', label: 'Modération contenu' },
    { value: 'security_alert', label: 'Alerte sécurité' },
    { value: 'event_registration', label: 'Inscription événement' },
    { value: 'system_backup', label: 'Sauvegarde système' },
    { value: 'user_suspension', label: 'Suspension utilisateur' },
    { value: 'api_rate_limit', label: 'Limite API' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Activité Système</h1>
              <p className="text-gray-600 mt-2">
                Surveillance et historique des activités SIPORTS
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activités Totales</p>
                  <p className="text-3xl font-bold text-gray-900">{activities.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertes Sécurité</p>
                  <p className="text-3xl font-bold text-red-600">
                    {activities.filter(a => a.type === 'security_alert').length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validations</p>
                  <p className="text-3xl font-bold text-green-600">
                    {activities.filter(a => a.severity === 'success').length}
                  </p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avertissements</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {activities.filter(a => a.severity === 'warning').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les activités..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les sévérités</option>
                <option value="error">Erreur</option>
                <option value="warning">Avertissement</option>
                <option value="success">Succès</option>
                <option value="info">Info</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Activities List */}
        <Card>
          <div className="p-6">
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.type);
                const iconColor = getActivityColor(activity.type);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="p-2 rounded-lg bg-gray-100">
                      <ActivityIcon className={`h-5 w-5 ${iconColor}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {getTypeLabel(activity.type)}
                        </h3>
                        {getSeverityBadge(activity.severity)}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDate(activity.timestamp)}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>

                      {/* Détails supplémentaires */}
                      <div className="mt-2 text-xs text-gray-600">
                        {activity.type === 'user_registration' && activity.details && (
                          <span>ID: {activity.details.userId} • Email: {activity.details.email}</span>
                        )}
                        {activity.type === 'exhibitor_validation' && activity.details && (
                          <span>Stand: {activity.details.standNumber} • Catégorie: {activity.details.category}</span>
                        )}
                        {activity.type === 'security_alert' && activity.details && (
                          <span>IP: {activity.details.ipAddress} • Tentatives: {activity.details.attempts}</span>
                        )}
                        {activity.type === 'event_registration' && activity.details && (
                          <span>Inscriptions: {activity.details.registrations}/{activity.details.capacity}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleActivityAction(activity.id, 'view')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleActivityAction(activity.id, 'more')}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune activité trouvée
                </h3>
                <p className="text-gray-600">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
