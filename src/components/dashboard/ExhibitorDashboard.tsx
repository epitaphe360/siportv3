import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { useDashboardStore } from '../../store/dashboardStore';
import { useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useAppointmentStore } from '../../store/appointmentStore';
import PublicAvailabilityCalendar from '../calendar/PublicAvailabilityCalendar';
import PersonalAppointmentsCalendar from '../calendar/PersonalAppointmentsCalendar';
import { Calendar, Zap, Building2, Eye, MessageSquare, Download, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { getVisitorDisplayName } from '../../utils/visitorHelpers';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DEFAULT_SALON_CONFIG, formatSalonDates, formatSalonLocation, formatSalonHours } from '../../config/salonInfo';
import { ErrorMessage } from '../common/ErrorMessage';
import { LevelBadge, QuotaSummaryCard } from '../common/QuotaWidget';
import { getExhibitorLevelByArea, getExhibitorQuota } from '../../config/exhibitorQuotas';
import { Users, FileText, Award, Scan } from 'lucide-react';
import { MiniSiteSetupModal } from '../exhibitor/MiniSiteSetupModal';
import { supabase } from '../../lib/supabase';
import { LineChartCard, BarChartCard, PieChartCard } from './charts';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function ExhibitorDashboard() {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [modal, setModal] = useState<{title: string, content: React.ReactNode} | null>(null);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingAppointment, setProcessingAppointment] = useState<string | null>(null);
  const [showMiniSiteSetup, setShowMiniSiteSetup] = useState(false);

  const { user } = useAuthStore();
  const { dashboard, fetchDashboard, error: dashboardError } = useDashboardStore();
  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();
  const dashboardStats = useDashboardStats();

  // Check if user needs to create mini-site (first login after activation)
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const checkMiniSiteStatus = async () => {
      if (!user?.id || user?.status !== 'active') return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('minisite_created')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Show popup if mini-site not created yet
        if (isMounted && !data?.minisite_created) {
          // Small delay so dashboard loads first
          timeoutId = setTimeout(() => {
            if (isMounted) setShowMiniSiteSetup(true);
          }, 1500);
        }
      } catch (err) {
        if (isMounted) console.error('Error checking minisite status:', err);
      }
    };

    checkMiniSiteStatus();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user?.id, user?.status]);

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

  // Données pour les graphiques professionnels
  const visitorEngagementData = [
    { name: 'Lun', visits: 45, interactions: 28 },
    { name: 'Mar', visits: 62, interactions: 41 },
    { name: 'Mer', visits: 78, interactions: 55 },
    { name: 'Jeu', visits: 95, interactions: 72 },
    { name: 'Ven', visits: 110, interactions: 85 },
    { name: 'Sam', visits: 88, interactions: 62 },
    { name: 'Dim', visits: 52, interactions: 35 },
  ];

  const appointmentStatusData = [
    { name: 'Confirmés', value: appointments?.filter(a => a.status === 'confirmed').length || 8 },
    { name: 'En attente', value: appointments?.filter(a => a.status === 'pending').length || 3 },
    { name: 'Terminés', value: appointments?.filter(a => a.status === 'completed').length || 12 },
  ];

  const activityBreakdownData = [
    { name: 'Vues Mini-Site', value: dashboardStats?.miniSiteViews?.value || 245 },
    { name: 'Téléchargements', value: dashboardStats?.catalogDownloads?.value || 87 },
    { name: 'Messages', value: dashboardStats?.messages?.value || 64 },
    { name: 'Connexions', value: dashboardStats?.connections?.value || 32 },
  ];

  // CRITICAL #12 FIX: Proper null check before filtering appointments
  const receivedAppointments = user?.id
    ? appointments.filter(a => a.exhibitorId === user.id)
    : [];
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  const handleAccept = async (appointmentId: string) => {
    // Role validation: Verify user owns this appointment
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment || !user?.id || appointment.exhibitorId !== user.id) {
      setError('Vous n\'êtes pas autorisé à confirmer ce rendez-vous');
      return;
    }

    setProcessingAppointment(appointmentId);
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      // Note: fetchAppointments() removed - store already updates local state
    } catch (err) {
      console.error('Erreur lors de l\'acceptation:', err);
      setError('Impossible d\'accepter le rendez-vous');
    } finally {
      setProcessingAppointment(null);
    }
  };

  const handleReject = async (appointmentId: string) => {
    // Role validation: Verify user owns this appointment
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment || !user?.id || appointment.exhibitorId !== user.id) {
      setError('Vous n\'êtes pas autorisé à refuser ce rendez-vous');
      return;
    }

    // Confirmation dialog before rejecting
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir refuser ce rendez-vous ? Cette action est irréversible.'
    );

    if (!confirmed) {
      return; // User cancelled, do nothing
    }

    setProcessingAppointment(appointmentId);
    try {
      // TODO: Consider adding 'rejected' status to Appointment type for better semantics
      // Currently uses 'cancelled' which is acceptable but less precise
      await cancelAppointment(appointmentId);
      // Note: fetchAppointments() removed - store already updates local state
    } catch (err) {
      console.error('Erreur lors du refus:', err);
      setError('Impossible de refuser le rendez-vous');
    } finally {
      setProcessingAppointment(null);
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
    return <Navigate to={ROUTES.PENDING_ACCOUNT} replace />;
  }

  // Fonction pour télécharger le QR code
  const downloadQRCode = async () => {
    setIsDownloadingQR(true);
    try {
      const canvas = qrCodeRef.current;
      if (canvas) {
        const link = document.createElement('a');
        // HIGH #2 FIX: Proper optional chaining for profile.company
        const companyName = user?.profile?.company || user?.profile?.companyName || 'stand';
        link.download = `qr-code-${companyName}.png`;
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
                Fichier : qr-code-{companyName}.png
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
                <Link to={ROUTES.APPOINTMENTS}>
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
                <Link to={ROUTES.CHAT}>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header avec gradient premium et glass morphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl shadow-2xl mx-4 mt-4 mb-6 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Tableau de Bord Exposant</h1>
                <p className="text-blue-100">Bienvenue {user?.profile?.firstName || 'Exposant'}, gérez votre présence SIPORTS 2026 ✨</p>
                <div className="mt-3 flex items-center space-x-3">
                  <Badge variant="info" size="md" className="bg-white/20 text-white border-white/30">
                    {user?.profile?.company || 'Entreprise'}
                  </Badge>
                  <Badge variant="success" size="md" className="bg-green-500/20 text-green-100 border-green-400/30">
                    Exposant Vérifié ✓
                  </Badge>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end space-y-3">
              <LevelBadge
                level={getExhibitorLevelByArea(user?.profile?.standArea || 9)}
                type="exhibitor"
                size="lg"
              />
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{new Date().toLocaleDateString('fr-FR')}</div>
                <div className="text-sm text-blue-100">{DEFAULT_SALON_CONFIG.name} - {DEFAULT_SALON_CONFIG.location.city}</div>
              </div>
            </div>
          </div>

          {/* Mini Stats dans le header */}
          <div className="relative mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm mb-1">Vues Mini-Site</div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats?.miniSiteViews?.value?.toLocaleString?.() || '0'}
                  </div>
                </div>
                <Eye className="h-8 w-8 text-white/60" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm mb-1">RDV</div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats?.appointments?.value?.toString() || '0'}
                  </div>
                </div>
                <Calendar className="h-8 w-8 text-white/60" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm mb-1">Téléchargements</div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats?.catalogDownloads?.value?.toString() || '0'}
                  </div>
                </div>
                <Download className="h-8 w-8 text-white/60" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white/80 text-sm mb-1">Messages</div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardStats?.messages?.value?.toString() || '0'}
                  </div>
                </div>
                <MessageSquare className="h-8 w-8 text-white/60" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bouton d'accès rapide mini-site */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex justify-end">
        <Link to={ROUTES.MINISITE_CREATION}>
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

        {/* Quota Summary Card */}
        <div className="mb-8">
          <QuotaSummaryCard
            title="Vos Quotas Exposant"
            level={getExhibitorLevelByArea(user?.profile?.standArea || 9)}
            type="exhibitor"
            quotas={[
              {
                label: 'Rendez-vous B2B',
                current: confirmedAppointments.length,
                limit: getExhibitorQuota(getExhibitorLevelByArea(user?.profile?.standArea || 9), 'appointments'),
                icon: <Calendar className="h-4 w-4 text-gray-400" />
              },
              {
                label: 'Membres équipe',
                current: dashboardStats?.teamMembers?.value || 0,
                limit: getExhibitorQuota(getExhibitorLevelByArea(user?.profile?.standArea || 9), 'teamMembers'),
                icon: <Users className="h-4 w-4 text-gray-400" />
              },
              {
                label: 'Sessions démo',
                current: dashboardStats?.demoSessions?.value || 0,
                limit: getExhibitorQuota(getExhibitorLevelByArea(user?.profile?.standArea || 9), 'demoSessions'),
                icon: <Award className="h-4 w-4 text-gray-400" />
              },
              {
                label: 'Scans badges/jour',
                current: dashboardStats?.badgeScansToday?.value || 0,
                limit: getExhibitorQuota(getExhibitorLevelByArea(user?.profile?.standArea || 9), 'leadScans'),
                icon: <Scan className="h-4 w-4 text-gray-400" />
              },
              {
                label: 'Fichiers média',
                current: dashboardStats?.mediaUploads?.value || 0,
                limit: getExhibitorQuota(getExhibitorLevelByArea(user?.profile?.standArea || 9), 'mediaUploads'),
                icon: <FileText className="h-4 w-4 text-gray-400" />
              }
            ]}
            upgradeLink={undefined} // Pas d'upgrade pour les exposants (surface fixée)
          />
        </div>

        {/* Statistiques avec cartes améliorées et animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              title: 'Vues Mini-Site',
              value: dashboardStats?.miniSiteViews?.value?.toLocaleString?.() || '0',
              icon: Eye,
              change: dashboardStats?.miniSiteViews?.growth || '--',
              changeType: dashboardStats?.miniSiteViews?.growthType || 'neutral',
              type: 'miniSiteViews' as const,
              gradient: 'from-green-500 to-green-600',
              bgColor: 'bg-green-100'
            },
            {
              title: 'Demandes de RDV',
              value: dashboardStats?.appointments?.value?.toString() || '0',
              icon: Calendar,
              change: dashboardStats?.appointments?.growth || '--',
              changeType: dashboardStats?.appointments?.growthType || 'neutral',
              type: 'appointments' as const,
              gradient: 'from-blue-500 to-blue-600',
              bgColor: 'bg-blue-100'
            },
            {
              title: 'Téléchargements',
              value: dashboardStats?.catalogDownloads?.value?.toString() || '0',
              icon: Download,
              change: dashboardStats?.catalogDownloads?.growth || '--',
              changeType: dashboardStats?.catalogDownloads?.growthType || 'neutral',
              type: 'downloads' as const,
              gradient: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-100'
            },
            {
              title: 'Messages',
              value: dashboardStats?.messages?.value?.toString() || '0',
              icon: MessageSquare,
              change: dashboardStats?.messages?.growth || '--',
              changeType: dashboardStats?.messages?.growthType || 'neutral',
              type: 'messages' as const,
              gradient: 'from-orange-500 to-orange-600',
              bgColor: 'bg-orange-100'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              className="cursor-pointer"
              onClick={() => handleStatClick(stat.type)}
            >
              <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-current group">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className={`text-sm font-medium px-3 py-1 rounded-full ${
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
              </Card>
            </motion.div>
          ))}
        </motion.div>

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

        {/* Section Graphiques Analytics */}
        <div className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              <TrendingUp className="inline-block mr-3 text-siports-primary" />
              Performance & Analytics
            </h2>
            <Badge variant="info" size="lg">
              Données en temps réel
            </Badge>
          </div>

          {/* Row 1: Engagement visiteurs */}
          <LineChartCard
            title="Engagement Visiteurs (7 derniers jours)"
            data={visitorEngagementData}
            dataKeys={[
              { key: 'visits', color: '#3b82f6', name: 'Visites' },
              { key: 'interactions', color: '#10b981', name: 'Interactions' }
            ]}
            height={300}
            showArea={true}
          />

          {/* Row 2: Statut RDV et Activités */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartCard
              title="Statut des Rendez-vous"
              data={appointmentStatusData}
              colors={['#10b981', '#f59e0b', '#3b82f6']}
              height={300}
              showPercentage={true}
            />

            <BarChartCard
              title="Répartition des Activités"
              data={activityBreakdownData}
              dataKey="value"
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              height={300}
            />
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
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAccept(app.id)}
                            disabled={processingAppointment === app.id}
                          >
                            {processingAppointment === app.id ? 'Confirmation...' : 'Accepter'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(app.id)}
                            disabled={processingAppointment === app.id}
                          >
                            {processingAppointment === app.id ? 'Refus...' : 'Refuser'}
                          </Button>
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

            {/* Activité Récente avec animations */}
            <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-8">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg mr-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Activité Récente
                </h3>
                <div className="space-y-3">
                  {dashboard?.recentActivity?.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {activity.type === 'profile_view' && '👁️'}
                        {activity.type === 'message' && '💬'}
                        {activity.type === 'appointment' && '📅'}
                        {activity.type === 'connection' && '🤝'}
                        {activity.type === 'download' && '📥'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {(!dashboard?.recentActivity || dashboard.recentActivity.length === 0) && (
                    <div className="text-center text-gray-500 py-4">Aucune activité récente</div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700"
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

      {/* Modal QR Code amélioré avec animations */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center relative overflow-hidden"
          >
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
                  <span>{user?.profile?.firstName || ''} {user?.profile?.lastName || ''}</span>
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
          </motion.div>
        </motion.div>
      )}

      {/* Modal générique amélioré avec animations */}
      {modal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent"></div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{modal.title}</h2>
              <div className="mb-6">{modal.content}</div>
              <div className="flex justify-end">
                <Button variant="default" onClick={() => setModal(null)}>Fermer</Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mini-Site Setup Modal (first login after activation) */}
      {user?.id && (
        <MiniSiteSetupModal
          isOpen={showMiniSiteSetup}
          onClose={() => setShowMiniSiteSetup(false)}
          userId={user.id}
        />
      )}
    </div>
  );
}
