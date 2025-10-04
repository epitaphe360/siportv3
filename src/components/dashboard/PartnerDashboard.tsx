import { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  Calendar, 
  TrendingUp,
  Star,
  Handshake,
  Globe,
  Target,
  BarChart3,
  Crown,
  Zap
} from 'lucide-react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDashboardStore } from '../../store/dashboardStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard as Edit } from 'lucide-react';
import { getVisitorDisplayName } from '../../utils/visitorHelpers';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { ErrorMessage, LoadingMessage } from '../common/ErrorMessage';

export default function PartnerDashboard() {
  const { user } = useAuthStore();
  const { dashboard, isLoading, error: dashboardError, fetchDashboard } = useDashboardStore();
  const dashboardStats = useDashboardStats();

  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();

  const [error, setError] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchDashboard();
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        setError('Impossible de charger le tableau de bord');
      }
    };
    loadData();
  }, [fetchDashboard]);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        await fetchAppointments();
      } catch (err) {
        console.error('Erreur lors du chargement des rendez-vous:', err);
        setError('Impossible de charger les rendez-vous');
      }
    };
    loadAppointments();
  }, [fetchAppointments]);

  const receivedAppointments = appointments.filter(a => user && a.exhibitorId === user.id);
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  const handleAccept = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      await fetchAppointments();
    } catch (err) {
      console.error('Erreur lors de l\'acceptation:', err);
      setError('Impossible d\'accepter le rendez-vous');
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      await fetchAppointments();
    } catch (err) {
      console.error('Erreur lors du refus:', err);
      setError('Impossible de refuser le rendez-vous');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingMessage message="Chargement du tableau de bord partenaire..." />
        </div>
      </div>
    );
  }

  if (!dashboard && dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <ErrorMessage message={dashboardError} />
          <Button onClick={() => fetchDashboard()} className="mt-4">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages d'erreur */}
        {(error || dashboardError) && (
          <ErrorMessage 
            message={error || dashboardError || 'Une erreur est survenue'} 
            onDismiss={() => setError(null)}
          />
        )}

        {/* Header Partenaire */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de Bord Partenaire
                </h1>
                <p className="text-gray-600">
                  Bienvenue {user?.profile.firstName}, suivez votre impact SIPORTS 2026
                </p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 font-medium">Espace Partenaire</span>
                <Badge className="bg-purple-100 text-purple-800" size="sm">
                  Partenaire Officiel
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards Partenaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visibilité Partenaire</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.profileViews.value.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">{dashboardStats?.profileViews.growth || '--'}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connexions Établies</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.connections.value || '0'}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Handshake className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">{dashboardStats?.connections.growth || '--'}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rendez-vous</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.appointments.value || '0'}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">{dashboardStats?.appointments.growth || '--'}</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Messages</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboardStats?.messages.value || '0'}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">{dashboardStats?.messages.growth || '--'}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Actions Rapides Partenaire */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Gestion de votre Partenariat
                </h3>
                
                <div className="space-y-4">
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-3" />
                      Modifier mon Profil Partenaire
                    </Button>
                  </Link>
                  
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Edit className="h-4 w-4 mr-3" />
                      Modifier mon Contenu
                    </Button>
                  </Link>
                  
                  <Link to="/networking" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-3" />
                      Réseautage VIP Exclusif
                    </Button>
                  </Link>
                  
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-3" />
                      ROI & Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Impact de votre Partenariat
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Les métriques d'impact détaillées seront disponibles prochainement.
                    </p>
                    <p className="text-xs text-gray-500">
                      Nous travaillons sur un système de tracking complet pour mesurer l'impact de votre partenariat.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Link to="/partners">
                      <Button className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Voir les Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bloc Rendez-vous reçus/confirmés pour Partenaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Rendez-vous reçus
              </h3>
              {isAppointmentsLoading ? (
                <LoadingMessage message="Chargement des rendez-vous..." />
              ) : (
                <>
                  {pendingAppointments.length === 0 && (
                    <div className="text-center text-gray-500 py-4">Aucune demande en attente</div>
                  )}
                  {pendingAppointments.map((app: any) => (
                    <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">
                          Demande de {getVisitorDisplayName(app)}
                        </div>
                        <div className="text-xs text-gray-600">{app.message || 'Aucun message'}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleAccept(app.id)}>Accepter</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>Refuser</Button>
                      </div>
                    </div>
                  ))}
                  
                  <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Rendez-vous confirmés</h4>
                  {confirmedAppointments.length === 0 ? (
                    <div className="text-center text-gray-500 py-2">Aucun rendez-vous confirmé</div>
                  ) : (
                    confirmedAppointments.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-900">
                            Avec {getVisitorDisplayName(app)}
                          </div>
                          <div className="text-xs text-gray-600">{app.message || 'Aucun message'}</div>
                        </div>
                        <Badge variant="success">Confirmé</Badge>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Activité Récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-purple-600" />
                Activité Récente
              </h3>
              <div className="space-y-4">
                {dashboard?.recentActivity?.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {activity.type === 'profile_view' && '👁️'}
                      {activity.type === 'message' && '💬'}
                      {activity.type === 'appointment' && '📅'}
                      {activity.type === 'connection' && '🤝'}
                      {activity.type === 'download' && '📥'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) && (
                  <div className="text-center text-gray-500 py-4">Aucune activité récente</div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
