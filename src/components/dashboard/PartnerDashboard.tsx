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
  Zap,
  FileText,
  Activity,
  Sparkles,
  Shield
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDashboardStore } from '../../store/dashboardStore';
import { LineChartCard, BarChartCard, PieChartCard } from './charts';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { CreditCard as Edit } from 'lucide-react';
import { getVisitorDisplayName } from '../../utils/visitorHelpers';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { ErrorMessage, LoadingMessage } from '../common/ErrorMessage';
import { LevelBadge, QuotaSummaryCard } from '../common/QuotaWidget';
import { getPartnerQuota, getPartnerTierConfig } from '../../config/partnerTiers';
import PartnerProfileCreationModal from '../partner/PartnerProfileCreationModal';
import { supabase } from '../../lib/supabase';
import type { PartnerTier } from '../../config/partnerTiers';

export default function PartnerDashboard() {
  // ✅ CORRECTION: Tous les hooks DOIVENT être appelés avant tout return conditionnel
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { dashboard, isLoading, error: dashboardError, fetchDashboard } = useDashboardStore();
  const dashboardStats = useDashboardStats();

  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();

  const [error, setError] = useState<string | null>(null);
  const [processingAppointment, setProcessingAppointment] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);


  useEffect(() => {
    if (!user || user.type !== 'partner') return;

    const loadData = async () => {
      try {
        await fetchDashboard();
      } catch (err) {
        console.error('Erreur lors du chargement du dashboard:', err);
        setError('Impossible de charger le tableau de bord');
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Intentionally fetch only on mount

  useEffect(() => {
    if (!user || user.type !== 'partner') return;

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
  }, [user]); // Intentionally fetch only on mount

  // Vérifier si le profil partenaire existe
  useEffect(() => {
    if (!user || user.type !== 'partner' || user.status !== 'active') return;

    const checkProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('partner_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erreur vérification profil:', error);
        }

        setHasProfile(!!data);
        
        // Si pas de profil et compte activé, afficher le modal
        if (!data && user.status === 'active') {
          setShowProfileModal(true);
        }
      } catch (err) {
        console.error('Erreur:', err);
        setHasProfile(false);
      }
    };

    checkProfile();
  }, [user]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
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

  // RBAC: Verify user is a partner - APRÈS tous les hooks
  if (!user || user.type !== 'partner') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center bg-white rounded-2xl shadow-2xl">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès Non Autorisé</h2>
            <p className="text-gray-600 mb-6">
              Ce tableau de bord est réservé aux partenaires SIPORTS 2026.
            </p>
            <Link to={ROUTES.DASHBOARD}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Retour au Tableau de Bord
              </Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    );
  }

  // FIX: Partners receive appointments when they are the target (exhibitorId), not when they are the visitor
  const receivedAppointments = appointments.filter(a => user && user.id && a.exhibitorId === user.id);
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  // Données pour les graphiques partenaire
  const brandExposureData = [
    { name: 'Lun', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.12) : 28, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.15) : 12 },
    { name: 'Mar', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.14) : 35, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.18) : 15 },
    { name: 'Mer', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.16) : 42, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.22) : 19 },
    { name: 'Jeu', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.13) : 31, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.16) : 14 },
    { name: 'Ven', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.18) : 48, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.25) : 22 },
    { name: 'Sam', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.15) : 38, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.19) : 16 },
    { name: 'Dim', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.12) : 29, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.14) : 11 }
  ];

  const engagementChannelsData = [
    { name: 'Profil', value: dashboardStats?.profileViews?.value || 245, color: '#8b5cf6' },
    { name: 'Messages', value: dashboardStats?.messages?.value || 89, color: '#06b6d4' },
    { name: 'RDV', value: dashboardStats?.appointments?.value || 42, color: '#f97316' },
    { name: 'Téléchargements', value: dashboardStats?.documentDownloads?.value || 58, color: '#10b981' }
  ];

  const roiMetricsData = [
    { name: 'Connexions', value: dashboardStats?.connections?.value || 156 },
    { name: 'Leads Qualifiés', value: dashboardStats?.leadExports?.value || 87 },
    { name: 'RDV Confirmés', value: confirmedAppointments.length || 24 },
    { name: 'Messages', value: dashboardStats?.messages?.value || 89 }
  ];

  // Filter appointments where partner is involved (as partner, not as exhibitor)
  // Note: Partners typically receive appointments through partnership relationships
  // This filter may need adjustment based on your data model

  const handleAccept = async (appointmentId: string) => {
    // Role validation: Verify partner is the target of this appointment
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
    // Role validation: Verify partner is the target of this appointment
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
      await cancelAppointment(appointmentId);
      // Note: fetchAppointments() removed - store already updates local state
    } catch (err) {
      console.error('Erreur lors du refus:', err);
      setError('Impossible de refuser le rendez-vous');
    } finally {
      setProcessingAppointment(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <LoadingMessage message="Chargement du tableau de bord partenaire..." />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard && dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <ErrorMessage message={dashboardError} />
          <Button
            onClick={() => fetchDashboard()}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Activity className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const partnerTier = (user.partner_tier || user.profile?.partner_tier || 'museum') as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages d'erreur */}
        {(error || dashboardError) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <ErrorMessage
              message={error || dashboardError || 'Une erreur est survenue'}
              onDismiss={() => setError(null)}
            />
          </motion.div>
        )}

        {/* Header Premium Partenaire */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-8 mb-6 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            <div className="relative flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                  <Crown className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {t('partner.my_profile')}
                  </h1>
                  <p className="text-pink-100">
                    {t('dashboard.welcome')} {user?.profile?.firstName || 'Partenaire'}, tier {partnerTier.toUpperCase()} ✨
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">Actif</span>
                </div>
                <LevelBadge
                  level={partnerTier}
                  type="partner"
                  size="lg"
                />
              </div>
            </div>

            {/* Mini Stats dans le header */}
            <div className="relative mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm mb-1">Visibilité</div>
                    <div className="text-2xl font-bold text-white">
                      {dashboardStats?.profileViews.value.toLocaleString() || '0'}
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-white/60" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm mb-1">Connexions</div>
                    <div className="text-2xl font-bold text-white">
                      {dashboardStats?.connections.value || '0'}
                    </div>
                  </div>
                  <Handshake className="h-8 w-8 text-white/60" />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm mb-1">Rendez-vous</div>
                    <div className="text-2xl font-bold text-white">
                      {dashboardStats?.appointments.value || '0'}
                    </div>
                  </div>
                  <Calendar className="h-8 w-8 text-white/60" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quota Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <QuotaSummaryCard
            title={t('partner.my_booth')}
            level={partnerTier}
            type="partner"
            quotas={[
              {
                label: t('admin.b2b_appointments'),
                current: confirmedAppointments.length,
                limit: getPartnerQuota(partnerTier as PartnerTier, 'appointments'),
                icon: <Calendar className="h-4 w-4 text-gray-400" />
              },
              {
                label: t('partner.contacts'),
                current: dashboardStats?.teamMembers?.value || 0,
                limit: getPartnerQuota(partnerTier as PartnerTier, 'teamMembers'),
                icon: <Users className="h-4 w-4 text-gray-400" />
              },
              {
                label: t('admin.media_files'),
                current: dashboardStats?.mediaUploads?.value || 0,
                limit: getPartnerQuota(partnerTier as PartnerTier, 'mediaUploads'),
                icon: <FileText className="h-4 w-4 text-gray-400" />
              },
              {
                label: t('partner.analytics'),
                current: dashboardStats?.leadExports?.value || 0,
                limit: getPartnerQuota(partnerTier as PartnerTier, 'leadExports'),
                icon: <TrendingUp className="h-4 w-4 text-gray-400" />
              }
            ]}
            upgradeLink={ROUTES.PARTNER_UPGRADE}
          />
        </motion.div>

        {/* Stats Cards Partenaire avec animations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            {
              label: 'Visibilité Partenaire',
              value: dashboardStats?.profileViews.value.toLocaleString() || '0',
              growth: dashboardStats?.profileViews.growth || '--',
              icon: Crown,
              gradient: 'from-purple-500 to-purple-600',
              bg: 'bg-purple-100'
            },
            {
              label: 'Connexions Établies',
              value: dashboardStats?.connections.value || '0',
              growth: dashboardStats?.connections.growth || '--',
              icon: Handshake,
              gradient: 'from-orange-500 to-orange-600',
              bg: 'bg-orange-100'
            },
            {
              label: 'Rendez-vous',
              value: dashboardStats?.appointments.value || '0',
              growth: dashboardStats?.appointments.growth || '--',
              icon: Calendar,
              gradient: 'from-blue-500 to-blue-600',
              bg: 'bg-blue-100'
            },
            {
              label: 'Messages',
              value: dashboardStats?.messages.value || '0',
              growth: dashboardStats?.messages.growth || '--',
              icon: TrendingUp,
              gradient: 'from-green-500 to-emerald-600',
              bg: 'bg-green-100'
            }
          ].map((stat, index) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-current group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge variant="success" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.growth}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Actions Rapides Partenaire */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('partner.my_events')}
                </h3>
              </div>

              <div className="space-y-3">
                <Link to={ROUTES.PARTNER_PROFILE_EDIT} className="block">
                  <Button className="w-full justify-start bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all">
                    <Globe className="h-4 w-4 mr-3" />
                    {t('admin.edit_profile')}
                  </Button>
                </Link>

                <Link to={ROUTES.PARTNER_MEDIA_UPLOAD} className="block">
                  <Button className="w-full justify-start border-2 hover:bg-gray-50" variant="outline">
                    <Edit className="h-4 w-4 mr-3" />
                    {t('admin.media_management')}
                  </Button>
                </Link>

                <Link to={ROUTES.PARTNER_NETWORKING} className="block">
                  <Button className="w-full justify-start border-2 hover:bg-gray-50" variant="outline">
                    <Users className="h-4 w-4 mr-3" />
                    {t('partner.event_registration')}
                  </Button>
                </Link>

                <Link to={ROUTES.PARTNER_ANALYTICS} className="block">
                  <Button className="w-full justify-start border-2 hover:bg-gray-50" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-3" />
                    {t('partner.analytics')}
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
              <div className="flex items-center space-x-2 mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-pink-600 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Impact de votre Partenariat
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-900 font-medium mb-1">
                        Analytics Avancées
                      </p>
                      <p className="text-xs text-gray-600">
                        Les métriques d'impact détaillées seront disponibles prochainement pour mesurer votre ROI.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={ROUTES.PARTNER_ANALYTICS}>
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Voir les Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* 📊 SECTION ANALYTICS PARTENAIRE - Graphiques Professionnels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics & ROI</h2>
                <p className="text-sm text-gray-600">Performance de votre partenariat en temps réel</p>
              </div>
            </div>
            <Badge className="bg-purple-100 text-purple-700 border-purple-300">
              Mise à jour en direct
            </Badge>
          </div>

          {/* Graphique ligne: Exposition de marque (7 jours) */}
          <div className="mb-6">
            <LineChartCard
              title="Exposition de Marque (7 derniers jours)"
              data={brandExposureData}
              dataKeys={[
                { key: 'impressions', color: '#8b5cf6', name: 'Impressions' },
                { key: 'interactions', color: '#f97316', name: 'Interactions' }
              ]}
              height={300}
            />
          </div>

          {/* Grille: Graphique circulaire + Barres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PieChartCard
              title="Canaux d'Engagement"
              data={engagementChannelsData}
              height={300}
            />
            <BarChartCard
              title="Métriques ROI"
              data={roiMetricsData}
              dataKey="value"
              color="#8b5cf6"
              height={300}
            />
          </div>
        </motion.div>

        {/* Bloc Rendez-vous */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Rendez-vous reçus</h3>
            </div>
            {isAppointmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-500 mt-4">Chargement...</p>
              </div>
            ) : (
              <>
                {pendingAppointments.length === 0 && (
                  <div className="text-center py-6">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune demande en attente</p>
                  </div>
                )}
                {pendingAppointments.map((app: any, index: number) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between border-b py-4 last:border-b-0 hover:bg-gray-50 px-3 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center">
                        <Badge variant="warning" className="mr-2">Nouveau</Badge>
                        Demande de {getVisitorDisplayName(app)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{app.message || 'Aucun message'}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
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
                  </motion.div>
                ))}

                <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-green-500" />
                  Rendez-vous confirmés
                </h4>
                {confirmedAppointments.length === 0 ? (
                  <div className="text-center py-4">
                    <Award className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Aucun rendez-vous confirmé</p>
                  </div>
                ) : (
                  confirmedAppointments.map((app: any, index: number) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between border-b py-4 last:border-b-0 hover:bg-green-50 px-3 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          Avec {getVisitorDisplayName(app)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{app.message || 'Aucun message'}</div>
                      </div>
                      <Badge variant="success" className="shadow-sm">
                        <Award className="h-3 w-3 mr-1" />
                        Confirmé
                      </Badge>
                    </motion.div>
                  ))
                )}
              </>
            )}
          </Card>
        </motion.div>

        {/* Activité Récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
            </div>
            <div className="space-y-3">
              {dashboard?.recentActivity?.slice(0, 5).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
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
                <div className="text-center py-6">
                  <Zap className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Aucune activité récente</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

      {/* Modal de création de profil partenaire */}
      {user?.status === 'active' && (
        <PartnerProfileCreationModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onComplete={() => {
            setHasProfile(true);
            setShowProfileModal(false);
          }}
        />
      )}
      </div>
    </div>
  );
}
