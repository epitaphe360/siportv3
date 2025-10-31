import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useAppointmentStore } from '../../store/appointmentStore';
import PublicAvailabilityCalendar from '../calendar/PublicAvailabilityCalendar';
import PersonalAppointmentsCalendar from '../calendar/PersonalAppointmentsCalendar';
import { Calendar, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { getVisitorDisplayName } from '../../utils/visitorHelpers';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DEFAULT_SALON_CONFIG, formatSalonDates, formatSalonLocation, formatSalonHours } from '../../config/salonInfo';
import { ErrorMessage } from '../common/ErrorMessage';

export default function ExhibitorDashboard() {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [modal, setModal] = useState<{title: string, content: React.ReactNode} | null>(null);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, error: dashboardError } = useDashboardStore();
  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();
  const dashboardStats = useDashboardStats();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally fetch only on mount

  // Filtrer les rendez-vous reçus (où l'exposant est le user connecté)
  const receivedAppointments = appointments.filter(a => user && a.exhibitorId === user.id);
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  const handleAccept = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      // Note: fetchAppointments() removed - store already updates local state
    } catch (err) {
      console.error('Erreur lors de l\'acceptation:', err);
      setError('Impossible d\'accepter le rendez-vous');
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      // Note: fetchAppointments() removed - store already updates local state
    } catch (err) {
      console.error('Erreur lors du refus:', err);
      setError('Impossible de refuser le rendez-vous');
    }
  };

  // Auto-clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (user?.status === 'pending') {
      return;
    }

    const loadDashboard = async () => {
      try {
        await fetchDashboard();
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        setError('Impossible de charger le tableau de bord');
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.status]); // Refetch when user status changes

  if (user?.status === 'pending') {
    return <Navigate to="/pending-account" replace />;
  }

  // Fonction pour télécharger le QR code
  const downloadQRCode = async () => {
    setIsDownloadingQR(true);
    try {
      const canvas = qrCodeRef.current;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-code-${user?.profile.company || 'stand'}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        setModal({
          title: 'Téléchargement Réussi',
          content: (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-gray-700">
                Le QR code de votre stand a été téléchargé avec succès !
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Fichier : qr-code-{user?.profile.company || 'stand'}.png
              </p>
            </div>
          )
        });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      setModal({
        title: 'Erreur de Téléchargement',
        content: (
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <p className="text-gray-700">
              Une erreur s'est produite lors du téléchargement du QR code.
            </p>
          </div>
        )
      });
    } finally {
      setIsDownloadingQR(false);
    }
  };

  // Fonction pour afficher toutes les activités
  const handleViewAllActivities = () => {
    setModal({
      title: 'Historique Complet des Activités',
      content: (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {dashboard?.recentActivity?.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex-shrink-0 w-10 h-10 bg-siports-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                {activity.type === 'profile_view' && '👁️'}
                {activity.type === 'message' && '💬'}
                {activity.type === 'appointment' && '📅'}
                {activity.type === 'connection' && '🤝'}
                {activity.type === 'download' && '📥'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('fr-FR')}
                  </p>
                  {activity.userName && (
                    <Badge variant="info" size="sm">
                      {activity.userName}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-600">Aucune activité récente trouvée.</p>
            </div>
          )}
        </div>
      )
    });
  };

  // Fonction pour gérer les clics sur les statistiques
  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'miniSiteViews':
        setModal({
          title: 'Détails des Vues Mini-Site',
          content: (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900">📊 Statistiques des Vues</h4>
                <p className="text-blue-700 mt-2">
                  Votre mini-site a été consulté {dashboardStats?.miniSiteViews.value.toLocaleString() || '0'} fois.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Consultez les analytics détaillées dans la section Mini-Site.</p>
              </div>
            </div>
          )
        });
        break;
      case 'appointments':
        setModal({
          title: 'Demandes de Rendez-vous',
          content: (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900">📅 Rendez-vous</h4>
                <p className="text-green-700 mt-2">
                  Vous avez {dashboardStats?.appointments.value || '0'} rendez-vous.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/appointments">
                  <Button variant="outline" className="w-full">
                    Voir tous les rendez-vous
                  </Button>
                </Link>
              </div>
            </div>
          )
        });
        break;
      case 'downloads':
        setModal({
          title: 'Téléchargements de Documents',
          content: (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900">📥 Documents Téléchargés</h4>
                <p className="text-purple-700 mt-2">
                  {dashboardStats?.catalogDownloads.value || '0'} téléchargements de vos documents.
                </p>
              </div>
            </div>
          )
        });
        break;
      case 'messages':
        setModal({
          title: 'Messages et Communications',
          content: (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900">💬 Messages</h4>
                <p className="text-orange-700 mt-2">
                  Vous avez {dashboardStats?.messages.value || '0'} messages non lus.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/chat">
                  <Button variant="outline" className="w-full">
                    Ouvrir le chat
                  </Button>
                </Link>
              </div>
            </div>
          )
        });
        break;
    }
  };

  const stats = [
    {
      title: 'Vues Mini-Site',
      value: dashboardStats?.miniSiteViews?.value?.toLocaleString?.() || '0',
      icon: '👁️',
      change: dashboardStats?.miniSiteViews?.growth || '--',
      changeType: dashboardStats?.miniSiteViews?.growthType || 'neutral',
      type: 'miniSiteViews' as const
    },
    {
      title: 'Demandes de RDV',
      value: dashboardStats?.appointments?.value?.toString() || '0',
      icon: '📅',
      change: dashboardStats?.appointments?.growth || '--',
      changeType: dashboardStats?.appointments?.growthType || 'neutral',
      type: 'appointments' as const
    },
    {
      title: 'Téléchargements',
      value: dashboardStats?.catalogDownloads?.value?.toString() || '0',
      icon: '📥',
      change: dashboardStats?.catalogDownloads?.growth || '--',
      changeType: dashboardStats?.catalogDownloads?.growthType || 'neutral',
      type: 'downloads' as const
    },
    {
      title: 'Messages',
      value: dashboardStats?.messages?.value?.toString() || '0',
      icon: '💬',
      change: dashboardStats?.messages?.growth || '--',
      changeType: dashboardStats?.messages?.growthType || 'neutral',
      type: 'messages' as const
    }
  ];

  const quickActions = [
    {
      title: 'Réseautage IA',
      description: 'Découvrez des connexions pertinentes avec l\'IA',
      icon: '🤖',
      link: '/networking',
      variant: 'default' as const
    },
    {
      title: 'Modifier mon Mini-Site',
      description: 'Personnalisez votre présence digitale',
      icon: '🎨',
      link: '/minisite/editor',
      variant: 'outline' as const
    },
    {
      title: 'Mon Profil Exposant',
      description: 'Mettez à jour vos informations',
      icon: '👤',
      link: '/profile',
      variant: 'outline' as const
    },
    {
      title: 'QR Code Stand',
      description: 'Générez votre QR code personnalisé',
      icon: '📱',
      action: () => setShowQRModal(true),
      variant: 'outline' as const
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-siports-light via-white to-siports-secondary/20">
      {/* Header avec gradient SIPORTS */}
      <div className="bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tableau de Bord Exposant</h1>
              <p className="text-xl opacity-90">Bienvenue {user?.profile.firstName}, gérez votre présence SIPORTS 2026</p>
              <div className="mt-4 flex items-center space-x-3">
                <Badge variant="info" size="md" className="bg-white/20 text-white border-white/30">
                  {user?.profile.company}
                </Badge>
                <Badge variant="success" size="md" className="bg-green-500/20 text-green-100 border-green-400/30">
                  Exposant Vérifié
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <div className="text-2xl font-bold">{new Date().toLocaleDateString('fr-FR')}</div>
                <div className="text-sm opacity-75">{DEFAULT_SALON_CONFIG.name} - {DEFAULT_SALON_CONFIG.location.city}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton d'accès rapide mini-site */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex justify-end">
        <Link to="/minisite-creation">
          <Button variant="default" size="lg">
            🎨 Créer / Modifier mon mini-site exposant
          </Button>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-6">
        {/* Messages d'erreur */}
        {(error || dashboardError) && (
          <ErrorMessage 
            message={error || dashboardError || 'Une erreur est survenue'} 
            onDismiss={() => setError(null)}
          />
        )}

        {/* Statistiques avec cartes améliorées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="cursor-pointer"
              onClick={() => handleStatClick(stat.type)}
            >
              <Card className="siports-glass-card hover:shadow-siports-lg transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{stat.icon}</div>
                    <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.changeType === 'positive' 
                        ? 'bg-green-100 text-green-800' 
                        : stat.changeType === 'negative'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Section Système de Double Calendrier */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <Calendar className="inline-block mr-3 text-siports-primary" />
              Gestion Calendaire Avancée
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Votre système complet de gestion des rendez-vous : définissez vos disponibilités publiques et suivez tous vos rendez-vous personnels
            </p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Calendrier Public des Disponibilités */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PublicAvailabilityCalendar 
                userId={user?.id || ''} 
                isEditable={true}
              />
            </motion.div>

            {/* Calendrier Personnel des Rendez-vous */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PersonalAppointmentsCalendar userType="exhibitor" />
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions Rapides */}
          <div className="lg:col-span-2">
            <Card className="siports-glass-card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Zap className="mr-3 text-siports-primary" />
                  Actions Rapides
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div 
                      key={index} 
                      className="group"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {action.link ? (
                        <Link to={action.link}>
                          <Button variant={action.variant} className="w-full h-auto py-4 justify-start">
                            <div className="flex items-start space-x-3">
                              <span className="text-2xl">{action.icon}</span>
                              <div className="text-left">
                                <div className="font-semibold">{action.title}</div>
                                <div className="text-xs opacity-75">{action.description}</div>
                              </div>
                            </div>
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          variant={action.variant} 
                          className="w-full h-auto py-4 justify-start"
                          onClick={action.action}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{action.icon}</span>
                            <div className="text-left">
                              <div className="font-semibold">{action.title}</div>
                              <div className="text-xs opacity-75">{action.description}</div>
                            </div>
                          </div>
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Rendez-vous reçus */}
            <Card className="siports-glass-card mt-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Rendez-vous reçus
                </h3>
                {isAppointmentsLoading ? (
                  <div className="text-center py-6 text-gray-500">Chargement...</div>
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

            {/* Activité Récente */}
            <Card className="siports-glass-card mt-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">📈</span>
                  Activité Récente
                </h3>
                <div className="space-y-4">
                  {dashboard?.recentActivity?.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-siports-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button 
                    variant="ghost" 
                    className="w-full text-siports-primary"
                    onClick={handleViewAllActivities}
                  >
                    Voir toute l'activité
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Section Informations Importantes */}
        <div className="mt-8">
          <Card className="siports-glass-card border-l-4 border-l-siports-gold">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">📢</span>
                <h3 className="text-xl font-bold text-gray-900">Informations Importantes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">📅 {DEFAULT_SALON_CONFIG.name}</h4>
                  <p className="text-sm text-blue-700">{formatSalonDates(DEFAULT_SALON_CONFIG)} • {formatSalonLocation(DEFAULT_SALON_CONFIG)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">⏰ Stand Ouverture</h4>
                  <p className="text-sm text-green-700">{formatSalonHours(DEFAULT_SALON_CONFIG)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 Objectif 2026</h4>
                  <p className="text-sm text-purple-700">{DEFAULT_SALON_CONFIG.expectedVisitors.toLocaleString()} visiteurs attendus</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal QR Code amélioré */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent"></div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Stand Exposant</h2>
              <p className="text-gray-600 mb-6">Scannez ce code pour accéder rapidement à votre stand</p>
              
              <div className="bg-gray-50 p-4 rounded-xl inline-block mb-6">
                  <QRCode
                    value={user?.id ? `SIPORTS2026-EXHIBITOR-${user.id}` : 'INVALID-USER'}
                    size={200}
                    level="H"
                    includeMargin={true}
                    ref={qrCodeRef}
                  />
              </div>
              
              <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Entreprise :</span>
                  <span>{user?.profile.company}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact :</span>
                  <span>{user?.profile.firstName} {user?.profile.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email :</span>
                  <span>{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Stand :</span>
                  <span>{user?.profile?.standNumber || 'Non attribué'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valide jusqu'au :</span>
                  <span>{DEFAULT_SALON_CONFIG.dates.end} 18:00</span>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={downloadQRCode}
                  disabled={isDownloadingQR}
                >
                  {isDownloadingQR ? '⏳ Téléchargement...' : '📥 Télécharger'}
                </Button>
                <Button 
                  className="flex-1"
                  variant="default"
                  onClick={() => setShowQRModal(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal générique amélioré */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent"></div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{modal.title}</h2>
              <div className="mb-6">{modal.content}</div>
              <div className="flex justify-end">
                <Button variant="default" onClick={() => setModal(null)}>Fermer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
