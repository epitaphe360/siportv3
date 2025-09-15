import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { AppointmentCalendarWidget } from '../appointments/AppointmentCalendarWidget';
import { useAppointmentStore } from '../../store/appointmentStore';


export default function ExhibitorDashboard() {
  const [showQRModal, setShowQRModal] = useState(false);
  const [modal, setModal] = useState<{title: string, content: React.ReactNode} | null>(null);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const { user } = useAuthStore();
  const { dashboard, fetchDashboard } = useDashboardStore();
  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filtrer les rendez-vous reçus (où l'exposant est le user connecté)
  const receivedAppointments = appointments.filter((a: any) => user && a.exhibitorId === user.id);
  const pendingAppointments = receivedAppointments.filter((a: any) => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter((a: any) => a.status === 'confirmed');

  const handleAccept = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed');
    fetchAppointments();
  };
  const handleReject = async (appointmentId: string) => {
    await cancelAppointment(appointmentId);
    fetchAppointments();
  };

  useEffect(() => {
    if (user?.status === 'pending') {
      // The user is pending, do nothing here, let the render handle it.
      return;
    }
    fetchDashboard();
  }, [fetchDashboard, user?.status]);

  if (user?.status === 'pending') {
    return <Navigate to="/pending-account" replace />;
  }

  // Fonction pour télécharger le QR code
  const downloadQRCode = async () => {
    setIsDownloadingQR(true);
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-code-${user?.profile.company || 'stand'}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        // Afficher un message de succès
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
            <p className="text-sm text-gray-500 mt-2">
              Veuillez réessayer ou contacter le support.
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
                {activity.type === 'profile_view' && '�️'}
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
                  Votre mini-site a été consulté {dashboard?.stats?.miniSiteViews?.toLocaleString() || '2,156'} fois ce mois-ci.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Pages les plus consultées : Accueil, Produits, Contact</p>
                <p>• Provenance : Site web SIPORTS, QR codes, réseaux sociaux</p>
                <p>• Durée moyenne de visite : 3 minutes 24 secondes</p>
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
                <h4 className="font-semibold text-green-900">📅 Rendez-vous Programmés</h4>
                <p className="text-green-700 mt-2">
                  Vous avez {dashboard?.stats?.appointments || '8'} demandes de rendez-vous en attente.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/appointments">
                  <Button variant="outline" className="w-full">
                    Voir tous les rendez-vous
                  </Button>
                </Link>
                <Link to="/calendar">
                  <Button variant="outline" className="w-full">
                    Ouvrir le calendrier
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
                  {dashboard?.stats?.catalogDownloads || '89'} téléchargements de vos documents ce mois-ci.
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>• Catalogue produit : 45 téléchargements</p>
                <p>• Brochure entreprise : 32 téléchargements</p>
                <p>• Fiche technique : 12 téléchargements</p>
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
                <h4 className="font-semibold text-orange-900">💬 Messages Reçus</h4>
                <p className="text-orange-700 mt-2">
                  Vous avez {dashboard?.stats?.messages || '15'} messages non lus.
                </p>
              </div>
              <div className="space-y-2">
                <Link to="/messages">
                  <Button variant="outline" className="w-full">
                    Voir tous les messages
                  </Button>
                </Link>
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
      value: dashboard?.stats?.miniSiteViews?.toLocaleString() || '2,156',
      icon: '👁️',
      change: '+12%',
      changeType: 'positive' as const,
      type: 'miniSiteViews' as const
    },
    {
      title: 'Demandes de RDV',
      value: dashboard?.stats?.appointments?.toString() || '8',
      icon: '📅',
      change: '+5',
      changeType: 'positive' as const,
      type: 'appointments' as const
    },
    {
      title: 'Téléchargements',
      value: dashboard?.stats?.catalogDownloads?.toString() || '89',
      icon: '📥',
      change: '+8',
      changeType: 'positive' as const,
      type: 'downloads' as const
    },
    {
      title: 'Messages',
      value: dashboard?.stats?.messages?.toString() || '15',
      icon: '💬',
      change: '+3',
      changeType: 'neutral' as const,
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
    {
      title: 'Mes Disponibilités',
      description: 'Gérez vos créneaux de rendez-vous',
      icon: '�',
      link: '/availability/settings',
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
                <div className="text-sm opacity-75">SIPORTS 2026 - El Jadida</div>
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
                        : 'bg-blue-100 text-blue-800'
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions Rapides */}
          <div className="lg:col-span-2">
            <Card className="siports-glass-card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-2">⚡</span>
                  Actions Rapides
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <div key={index} className="group">
                      {action.link ? (
                        <Link to={action.link} className="block">
                          <div className="p-4 border border-gray-200 rounded-xl hover:border-siports-primary hover:shadow-md transition-all duration-300 group-hover:bg-siports-primary/5">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="text-2xl">{action.icon}</span>
                              <div>
                                <h4 className="font-semibold text-gray-900">{action.title}</h4>
                                <p className="text-sm text-gray-600">{action.description}</p>
                              </div>
                            </div>
                            <Button 
                              className="w-full" 
                              variant={action.variant}
                              size="sm"
                            >
                              Accéder
                            </Button>
                          </div>
                        </Link>
                      ) : (
                        <div 
                          className="p-4 border border-gray-200 rounded-xl hover:border-siports-primary hover:shadow-md transition-all duration-300 group-hover:bg-siports-primary/5 cursor-pointer"
                          onClick={action.action}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{action.icon}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{action.title}</h4>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                          </div>
                          <Button 
                            className="w-full" 
                            variant={action.variant}
                            size="sm"
                          >
                            Ouvrir
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <AppointmentCalendarWidget />

            {/* Bloc Rendez-vous reçus */}
            <Card className="siports-glass-card">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">📅</span>
                  Rendez-vous reçus
                </h3>
                {isAppointmentsLoading ? (
                  <div className="text-center py-6 text-gray-500">Chargement...</div>
                ) : (
                  <>
                    {pendingAppointments.length === 0 && (
                      <div className="text-center text-gray-500 py-4">Aucune demande en attente</div>
                    )}
                    {pendingAppointments.map(app => (
                      <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                        <div>
                          <div className="font-medium text-gray-900">Demande de {app.visitorId}</div>
                          <div className="text-xs text-gray-600">{app.message}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="default" onClick={() => handleAccept(app.id)}>Accepter</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>Refuser</Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Rendez-vous confirmés</h4>
                {confirmedAppointments.length === 0 ? (
                  <div className="text-center text-gray-500 py-2">Aucun rendez-vous confirmé</div>
                ) : (
                  confirmedAppointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">Avec {app.visitorId}</div>
                        <div className="text-xs text-gray-600">{app.message}</div>
                      </div>
                      <Badge variant="success">Confirmé</Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Activité Récente */}
            <Card className="siports-glass-card">
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
                  <h4 className="font-semibold text-blue-900 mb-2">📅 Salon SIPORTS 2026</h4>
                  <p className="text-sm text-blue-700">5-7 Février 2026 • El Jadida, Maroc</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">⏰ Stand Ouverture</h4>
                  <p className="text-sm text-green-700">Tous les jours de 9h à 18h</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">🎯 Objectif 2026</h4>
                  <p className="text-sm text-purple-700">6,300 visiteurs attendus</p>
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
                  value={`SIPORTS2026-EXHIBITOR-${user?.id}`}
                  size={200}
                  level="H"
                  includeMargin={true}
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
                  <span>A-12</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Valide jusqu'au :</span>
                  <span>7 Février 2026 18:00</span>
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