import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useAuthStore from '../../store/authStore';
import { ROUTES } from '../../lib/routes';
import { useDashboardStore } from '../../store/dashboardStore';
import { useRef } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useAppointmentStore } from '../../store/appointmentStore';
import PublicAvailabilityCalendar from '../calendar/PublicAvailabilityCalendar';
import PersonalAppointmentsCalendar from '../calendar/PersonalAppointmentsCalendar';
import { Calendar, Zap, Building2, Eye, MessageSquare, Download, TrendingUp, Sparkles, ArrowRight, Clock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVisitorDisplayName } from '../../utils/visitorHelpers';
import { getDisplayName } from '../../utils/userHelpers';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DEFAULT_SALON_CONFIG, formatSalonDates, formatSalonLocation, formatSalonHours } from '../../config/salonInfo';
import { ErrorMessage } from '../common/ErrorMessage';
import { LevelBadge, QuotaSummaryCard } from '../common/QuotaWidget';
import { getExhibitorLevelByArea, getExhibitorQuota } from '../../config/exhibitorQuotas';
import { Users, FileText, Award, Scan } from 'lucide-react';
import { MiniSiteSetupModal } from '../exhibitor/MiniSiteSetupModal';
import ExhibitorMiniSiteScrapper from '../exhibitor/ExhibitorMiniSiteScrapper';
import { supabase } from '../../lib/supabase';
import { LineChartCard, BarChartCard, PieChartCard } from './charts';
import { MoroccanPattern } from '../ui/MoroccanDecor';

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
  const { t } = useTranslation();
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'availability' | 'appointments'>('availability');
  const [modal, setModal] = useState<{title: string, content: React.ReactNode} | null>(null);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingAppointment, setProcessingAppointment] = useState<string | null>(null);
  const [showMiniSiteSetup, setShowMiniSiteSetup] = useState(false);
  const [showMiniSiteScrapper, setShowMiniSiteScrapper] = useState(false);

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
          .maybeSingle();

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

  // FIXED: Real data only - no more hardcoded simulated values
  // Display empty state when no data is available instead of fake data
  const visitorEngagementData = React.useMemo(() => {
    const realData = dashboardStats?.weeklyEngagement || [];
    // Return real data only, never simulate fake metrics
    return realData;
  }, [dashboardStats?.weeklyEngagement]);

  // FIXED: Utiliser les vraies données de rendez-vous filtrées par l'exposant actuel
  const myAppointments = React.useMemo(() => {
    if (!user?.id || !appointments) return [];
    // Filtrer par exhibitorUserId (user_id de l'exhibitor) ou exhibitor.user_id
    return appointments.filter(a => 
      (a as any).exhibitorUserId === user.id || 
      (a as any).exhibitor?.user_id === user.id
    );
  }, [appointments, user?.id]);

  const appointmentStatusData = React.useMemo(() => [
    { name: 'Confirmés', value: myAppointments?.filter(a => a.status === 'confirmed').length || 0, color: '#10b981' },
    { name: 'En attente', value: myAppointments?.filter(a => a.status === 'pending').length || 0, color: '#f59e0b' },
    { name: 'Terminés', value: myAppointments?.filter(a => a.status === 'completed').length || 0, color: '#3b82f6' },
  ], [myAppointments]);

  // FIXED: Real metrics only - no fallback to fake data
  const activityBreakdownData = React.useMemo(() => [
    { name: 'Vues Mini-Site', value: dashboardStats?.miniSiteViews?.value || 0 },
    { name: 'Téléchargements', value: dashboardStats?.catalogDownloads?.value || 0 },
    { name: 'Messages', value: dashboardStats?.messages?.value || 0 },
    { name: 'Connexions', value: dashboardStats?.connections?.value || 0 },
  ], [dashboardStats]);

  // Indicateur si aucune donnée réelle n'est disponible
  const hasRealData = React.useMemo(() => {
    const totalActivity = activityBreakdownData.reduce((sum, item) => sum + item.value, 0);
    const totalAppointments = appointmentStatusData.reduce((sum, item) => sum + item.value, 0);
    return totalActivity > 0 || totalAppointments > 0;
  }, [activityBreakdownData, appointmentStatusData]);

  // CRITICAL #12 FIX: Utiliser myAppointments déjà filtré par exhibitorUserId
  const receivedAppointments = myAppointments;
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  // Debug: Log pour vérifier la récupération des données
  useEffect(() => {
    console.log('📊 Dashboard Data Debug:', {
      totalAppointments: appointments?.length || 0,
      myAppointments: myAppointments.length,
      pending: pendingAppointments.length,
      confirmed: confirmedAppointments.length,
      userId: user?.id
    });
  }, [appointments, myAppointments, pendingAppointments, confirmedAppointments, user?.id]);

  const handleAccept = async (appointmentId: string) => {
    // Role validation: Verify user owns this appointment via exhibitorUserId
    const appointment = appointments.find(a => a.id === appointmentId);
    const exhibitorUserId = (appointment as any)?.exhibitorUserId || (appointment as any)?.exhibitor?.user_id;
    if (!appointment || !user?.id || exhibitorUserId !== user.id) {
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
    // Role validation: Verify user owns this appointment via exhibitorUserId
    const appointment = appointments.find(a => a.id === appointmentId);
    const exhibitorUserId = (appointment as any)?.exhibitorUserId || (appointment as any)?.exhibitor?.user_id;
    if (!appointment || !user?.id || exhibitorUserId !== user.id) {
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
      // Note: 'rejected' status handled via appointment cancellation workflow
      // Uses 'cancelled' status which is semantically appropriate
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
      icon: <Eye className="h-6 w-6 text-blue-600" />,
      change: dashboardStats?.miniSiteViews?.growth || '--',
      changeType: dashboardStats?.miniSiteViews?.growthType || 'neutral',
      type: 'miniSiteViews' as const,
      color: 'blue'
    },
    {
      title: 'Demandes de RDV',
      value: dashboardStats?.appointments?.value?.toString() || '0',
      icon: <Calendar className="h-6 w-6 text-indigo-600" />,
      change: dashboardStats?.appointments?.growth || '--',
      changeType: dashboardStats?.appointments?.growthType || 'neutral',
      type: 'appointments' as const,
      color: 'indigo'
    },
    {
      title: 'Téléchargements',
      value: dashboardStats?.catalogDownloads?.value?.toString() || '0',
      icon: <Download className="h-6 w-6 text-purple-600" />,
      change: dashboardStats?.catalogDownloads?.growth || '--',
      changeType: dashboardStats?.catalogDownloads?.growthType || 'neutral',
      type: 'downloads' as const,
      color: 'purple'
    },
    {
      title: 'Messages',
      value: dashboardStats?.messages?.value?.toString() || '0',
      icon: <MessageSquare className="h-6 w-6 text-teal-600" />,
      change: dashboardStats?.messages?.growth || '--',
      changeType: dashboardStats?.messages?.growthType || 'neutral',
      type: 'messages' as const,
      color: 'teal'
    }
  ];

  const quickActions = [
    {
      title: 'Créer Mini-Site avec IA',
      description: 'Générez automatiquement votre mini-site depuis votre site web',
      icon: '✨',
      action: () => setShowMiniSiteScrapper(true),
      variant: 'default' as const
    },
    {
      title: 'Réseautage IA',
      description: 'Découvrez des connexions pertinentes avec l\'IA',
      icon: '🤖',
      link: ROUTES.NETWORKING,
      variant: 'outline' as const
    },
    {
      title: 'Modifier mon Mini-Site',
      description: 'Personnalisez votre présence digitale',
      icon: '🎨',
      link: ROUTES.MINISITE_EDITOR,
      variant: 'outline' as const
    },
    {
      title: 'Mon Profil Exposant',
      description: 'Mettez à jour vos informations',
      icon: '👤',
      link: ROUTES.PROFILE,
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
    <div className="min-h-screen bg-gray-50">
      {/* Header avec gradient premium et glass morphism */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent rounded-2xl shadow-2xl mx-4 mt-4 mb-6 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <MoroccanPattern className="opacity-15" color="white" scale={0.8} />
        
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <Building2 className="h-10 w-10 text-siports-gold" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{t('exhibitor.my_booth')}</h1>
                <p className="text-blue-100">{t('dashboard.welcome')} {user?.profile?.firstName || 'Exposant'}, {t('exhibitor.booth_location')} ✨</p>
                <div className="mt-3 flex items-center space-x-3">
                  <Badge variant="info" size="md" className="bg-white/20 text-white border-white/30">
                    {user?.profile?.company || 'Entreprise'}
                  </Badge>
                  <Badge variant="success" size="md" className="bg-green-500/20 text-green-100 border-green-400/30">
                    {t('admin.verified')} ✓
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

      {/* Boutons d'accès rapide */}
      <div className="max-w-7xl mx-auto px-4 mt-4 flex flex-wrap justify-end gap-3">
        <Link to={ROUTES.BADGE}>
          <Button variant="outline" size="lg" className="border-2 border-siports-primary text-siports-primary hover:bg-siports-primary hover:text-white">
            🎫 Mon Badge Virtuel
          </Button>
        </Link>
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
            title={t('dashboard.exhibitor_quotas')}
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

        {/* Section Système de Double Calendrier - ORGANISATION PREMIUM */}
        <div className="mb-20">
          <div className="bg-slate-900 rounded-[3rem] p-12 shadow-2xl overflow-hidden relative border border-white/5">
            {/* Pattern de fond premium */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.2em]">SIPORT • Business Center</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                  Gestion Calendaire <span className="text-blue-400">Hub</span>
                </h2>
                <p className="text-blue-100/60 text-lg font-medium italic">
                  Centralisez vos disponibilités et gérez vos rendez-vous stratégiques dans un espace dédié haut de gamme.
                </p>
              </div>

              {/* Sélecteur de Tab Premium */}
              <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                    activeTab === 'availability' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Mes Disponibilités</span>
                </button>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                    activeTab === 'appointments' 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Agenda Personnel</span>
                </button>
              </div>
            </div>

            <div className="relative min-h-[600px]">
              <AnimatePresence mode="wait">
                {activeTab === 'availability' ? (
                  <motion.div
                    key="availability-tab"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-1 border border-white/10"
                  >
                    <PublicAvailabilityCalendar 
                      userId={user?.id || ''} 
                      isEditable={true}
                      standalone={false}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="appointments-tab"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-1 border border-white/10"
                  >
                    <PersonalAppointmentsCalendar 
                      userType="exhibitor"
                      standalone={false} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
            title={t('dashboard.visitor_engagement_7days')}
            data={visitorEngagementData}
            dataKeys={[
              { key: 'visits', color: '#3b82f6', name: 'Visites' },
              { key: 'interactions', color: '#10b981', name: 'Interactions' }
            ]}
            height={300}
            showArea={true}
          />

          {/* Row 2: Statut RDV et Activités - Hauteurs équilibrées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartCard
              title="Statut des Rendez-vous"
              data={appointmentStatusData}
              colors={['#10b981', '#f59e0b', '#3b82f6']}
              height={400}
              showPercentage={true}
            />

            <BarChartCard
              title="Répartition des Activités"
              data={activityBreakdownData}
              dataKey="value"
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
              height={400}
            />
          </div>
        </div>

        {/* Actions Rapides - Pleine largeur */}
        <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white mb-8">
              <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white relative">
                {/* Motif Marocain Subtil */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                      <Zap className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-white mb-1">
                        Actions Rapides
                      </h3>
                      <div className="flex items-center space-x-2 text-blue-200/80">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <p className="text-sm font-medium">Accès direct à vos outils essentiels</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center space-x-2 bg-white/5 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">Premium</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="group"
                    >
                      {action.link ? (
                        <Link to={action.link} className="block">
                          <div className="relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-400/50 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full -ml-12 -mb-12"></div>
                            <div className="relative flex items-start space-x-4">
                              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md">
                                <span className="text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{action.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1.5 leading-tight text-base">{action.title}</div>
                                <div className="text-xs text-gray-600 group-hover:text-gray-800 leading-relaxed break-words">{action.description}</div>
                              </div>
                              <ArrowRight className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300 mt-1" />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <button 
                          onClick={action.action}
                          className="w-full text-left"
                        >
                          <div className="relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-400/50 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/5 to-transparent rounded-full -ml-12 -mb-12"></div>
                            <div className="relative flex items-start space-x-4">
                              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md">
                                <span className="text-3xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{action.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-1.5 leading-tight text-base">{action.title}</div>
                                <div className="text-xs text-gray-600 group-hover:text-gray-800 leading-relaxed break-words">{action.description}</div>
                              </div>
                              <ArrowRight className="flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300 mt-1" />
                            </div>
                          </div>
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>

        {/* Rendez-vous reçus - Pleine largeur */}
        <Card className="siports-glass-card overflow-hidden mb-8">
              <div className="p-6 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Rendez-vous reçus</h3>
                    <p className="text-xs text-gray-500">Gérez vos demandes et confirmations</p>
                  </div>
                </div>
                {isAppointmentsLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="text-gray-600 font-medium">Chargement des rendez-vous...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {pendingAppointments.length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Aucune demande en attente</p>
                        <p className="text-xs text-gray-400 mt-1">Les nouvelles demandes apparaîtront ici</p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6">
                        {pendingAppointments.map((app: any, index: number) => (
                          <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300"
                          >
                            <div className="absolute top-2 right-2">
                              <Badge variant="warning" className="text-xs font-bold animate-pulse">Nouveau</Badge>
                            </div>
                            <div className="flex items-start space-x-4 mb-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {getVisitorDisplayName(app).charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                                  Demande de {getVisitorDisplayName(app)}
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed break-words">{app.message || 'Aucun message'}</div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-md hover:shadow-lg transition-all"
                                onClick={() => handleAccept(app.id)}
                                disabled={processingAppointment === app.id}
                              >
                                {processingAppointment === app.id ? '⏳ Confirmation...' : '✓ Accepter'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="flex-1 font-bold shadow-md hover:shadow-lg transition-all"
                                onClick={() => handleReject(app.id)}
                                disabled={processingAppointment === app.id}
                              >
                                {processingAppointment === app.id ? '⏳ Refus...' : '✕ Refuser'}
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    {confirmedAppointments.length > 0 && (
                      <>
                        <div className="flex items-center space-x-2 mb-4 mt-8">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Rendez-vous confirmés</h4>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>
                        <div className="space-y-3">
                          {confirmedAppointments.map((app: any, index: number) => (
                            <motion.div
                              key={app.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="group relative bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-100 hover:border-green-300"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                  {getVisitorDisplayName(app).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                      Avec {getVisitorDisplayName(app)}
                                    </div>
                                    <Badge variant="success" className="font-bold">✓ Confirmé</Badge>
                                  </div>
                                  <div className="text-sm text-gray-600 break-words">{app.message || 'Aucun message'}</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </Card>

        {/* Activité Récente avec animations */}
        <Card className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-8">
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

        {/* Section Informations Importantes */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="siports-glass-card border-l-4 border-l-siports-gold overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-siports-gold/5 to-transparent rounded-full blur-3xl"></div>
            <div className="p-6 relative">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Informations Importantes</h3>
                  <p className="text-xs text-gray-500">Détails essentiels du salon</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-3">
                      <Calendar className="h-5 w-5 text-blue-100" />
                      <h4 className="font-bold text-white text-sm uppercase tracking-wide">{DEFAULT_SALON_CONFIG.name}</h4>
                    </div>
                    <p className="text-sm text-blue-50 leading-relaxed">{formatSalonDates(DEFAULT_SALON_CONFIG)}</p>
                    <p className="text-sm text-blue-100 font-medium mt-1">{formatSalonLocation(DEFAULT_SALON_CONFIG)}</p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative bg-gradient-to-br from-green-500 to-emerald-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="h-5 w-5 text-green-100" />
                      <h4 className="font-bold text-white text-sm uppercase tracking-wide">Stand Ouverture</h4>
                    </div>
                    <p className="text-sm text-green-50 leading-relaxed">{formatSalonHours(DEFAULT_SALON_CONFIG)}</p>
                    <p className="text-xs text-green-100 mt-2">Tous les jours du salon</p>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative bg-gradient-to-br from-purple-500 to-pink-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-3">
                      <Target className="h-5 w-5 text-purple-100" />
                      <h4 className="font-bold text-white text-sm uppercase tracking-wide">Objectif 2026</h4>
                    </div>
                    <p className="text-2xl font-black text-white mb-1">{DEFAULT_SALON_CONFIG.expectedVisitors.toLocaleString()}</p>
                    <p className="text-sm text-purple-100">visiteurs attendus</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

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
                  <span>{user?.profile?.company || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact :</span>
                  <span>{getDisplayName(user)}</span>
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

      {/* AI Mini-Site Scrapper Modal */}
      {showMiniSiteScrapper && user?.id && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create Mini-Site with AI</h2>
                  <p className="text-sm text-gray-600">Automatically generate your mini-site from your website</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowMiniSiteScrapper(false)}
                className="rounded-full"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <ExhibitorMiniSiteScrapper
                exhibitorId={user.id}
                userId={user.id}
                onSuccess={() => {
                  setShowMiniSiteScrapper(false);
                  fetchDashboard();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
