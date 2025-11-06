import { useState, useEffect } from 'react';
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
import { apiService } from '../../services/apiService';
import { useFilterSearch } from '../../hooks/useFilterSearch';

interface ActivityItem {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  metadata: any; // Assuming metadata can be any JSON object
  user_id: string; // Assuming user_id is available for filtering
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getAll('activities');
        setActivities(data as ActivityItem[]);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getSeverityFromType = (type: string): 'info' | 'success' | 'warning' | 'error' => {
    switch (type) {
      case 'security_alert':
      case 'system_error':
        return 'error';
      case 'user_suspension':
      case 'api_rate_limit':
      case 'content_moderation_warning':
        return 'warning';
      case 'exhibitor_validation':
      case 'system_backup_success':
        return 'success';
      default:
        return 'info';
    }
  };

  const { searchTerm, setSearchTerm, selectedFilter: selectedType, setSelectedFilter: setSelectedType, filteredData: filteredActivities } =
    useFilterSearch<ActivityItem>({
      data: activities,
      searchKeys: ['description', 'metadata.user'],
      filterKey: 'activity_type',
    });

  const { selectedFilter: selectedSeverity, setSelectedFilter: setSelectedSeverity, filteredData: filteredActivitiesBySeverity } =
    useFilterSearch<ActivityItem>({
      data: filteredActivities,
      searchKeys: [], // Already filtered by searchTerm
      filterKey: 'activity_type',
      initialFilterValue: selectedSeverity, // Pass current severity to maintain filter
    });

  const finalFilteredActivities = filteredActivitiesBySeverity.filter(activity => {
    return !selectedSeverity || getSeverityFromType(activity.activity_type) === selectedSeverity;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const getSeverityBadge = (severity: 'info' | 'success' | 'warning' | 'error') => {
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
      default: return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const handleActivityAction = (activityId: string, action: string) => {
    console.log(`Action ${action} pour l'activité ${activityId}`);
    // Implement actual actions like viewing details or performing moderation
  };

  const activityTypes = [
    { value: 'user_registration', label: 'Inscription utilisateur' },
    { value: 'exhibitor_validation', label: 'Validation exposant' },
    { value: 'content_moderation', label: 'Modération contenu' },
    { value: 'security_alert', label: 'Alerte sécurité' },
    { value: 'event_registration', label: 'Inscription événement' },
    { value: 'system_backup', label: 'Sauvegarde système' },
    { value: 'user_suspension', label: 'Suspension utilisateur' },
    { value: 'api_rate_limit', label: 'Limite API' },
    { value: 'system_error', label: 'Erreur système' },
    { value: 'content_moderation_warning', label: 'Avertissement modération' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement des activités...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

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
              <Button variant="default" onClick={() => window.location.reload()}>
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
                    {activities.filter(a => getSeverityFromType(a.activity_type) === 'error').length}
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
                    {activities.filter(a => getSeverityFromType(a.activity_type) === 'success').length}
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
                    {activities.filter(a => getSeverityFromType(a.activity_type) === 'warning').length}
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
                <input type="text"
                  placeholder="Rechercher dans les activités..."
                  value={searchTerm}
                  onChange={(e) =
                      aria-label="Rechercher dans les activités..."> setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select value={selectedType}
                onChange={(e) =
                aria-label="Select option"> setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select value={selectedSeverity}
                onChange={(e) =
                aria-label="Select option"> setSelectedSeverity(e.target.value)}
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
              {finalFilteredActivities.map((activity, index) => {
                const ActivityIcon = getActivityIcon(activity.activity_type);
                const iconColor = getActivityColor(activity.activity_type);
                const severity = getSeverityFromType(activity.activity_type);

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
                          {getTypeLabel(activity.activity_type)}
                        </h3>
                        {getSeverityBadge(severity)}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {activity.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDate(activity.created_at)}</span>
                        <span>•</span>
                        <span>{activity.metadata?.user || 'N/A'}</span>
                      </div>

                      {/* Détails supplémentaires */}
                      <div className="mt-2 text-xs text-gray-600">
                        {activity.activity_type === 'user_registration' && activity.metadata && (
                          <span>ID: {activity.metadata.userId} • Email: {activity.metadata.email}</span>
                        )}
                        {activity.activity_type === 'exhibitor_validation' && activity.metadata && (
                          <span>Stand: {activity.metadata.standNumber} • Catégorie: {activity.metadata.category}</span>
                        )}
                        {activity.activity_type === 'security_alert' && activity.metadata && (
                          <span>IP: {activity.metadata.ipAddress} • Tentatives: {activity.metadata.attempts}</span>
                        )}
                        {activity.activity_type === 'event_registration' && activity.metadata && (
                          <span>Inscriptions: {activity.metadata.registrations}/{activity.metadata.capacity}</span>
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

            {finalFilteredActivities.length === 0 && (
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
