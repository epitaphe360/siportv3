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
  Shield,
  CreditCard
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDashboardStore } from '../../store/dashboardStore';
import { LineChartCard, BarChartCard, PieChartCard } from './charts';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Edit, LayoutDashboard, Share2 } from 'lucide-react';
import { getVisitorDisplayName } from '../../utils/visitorHelpers';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { ErrorMessage, LoadingMessage } from '../common/ErrorMessage';
import { LevelBadge, QuotaSummaryCard } from '../common/QuotaWidget';
import { getPartnerQuota, getPartnerTierConfig } from '../../config/partnerTiers';
import PartnerProfileCreationModal from '../partner/PartnerProfileCreationModal';
import PartnerProfileScrapper from '../partner/PartnerProfileScrapper';
import PartnerProfileEditor from '../partner/PartnerProfileEditor';
import { supabase } from '../../lib/supabase';
import type { PartnerTier } from '../../config/partnerTiers';
import { MoroccanPattern } from '../ui/MoroccanDecor';
import PublicAvailabilityCalendar from '../calendar/PublicAvailabilityCalendar';

export default function PartnerDashboard() {
  // ✅ CORRECTION: Tous les hooks DOIVENT être appelés avant tout return conditionnel
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const { dashboard, isLoading, error: dashboardError, fetchDashboard } = useDashboardStore();
  const dashboardStats = useDashboardStats();

  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'networking' | 'analytics'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [processingAppointment, setProcessingAppointment] = useState<string | null>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [showScrapperModal, setShowScrapperModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);


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
    // MODIFIED: Restreindre l'accès si pending_payment
    if (!user || user.type !== 'partner') return;

    if (user.status === 'pending_payment') return;

    // Si actif, vérifier profil
    if (user.status === 'active') {
      const checkProfile = async () => {
        try {
          const { data, error } = await supabase
            .from('partner_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

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
    }
  }, [user]);

  // 🔒 SECURITY: Bloquer l'accès au Dashboard si le paiement n'est pas fait
  if (user?.status === 'pending_payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6">
             <CreditCard className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t('partner.activation_required')}</h2>
          <p className="text-lg text-gray-600">
            {t('partner.payment_validation_needed')}
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link to="/partner/payment-selection">
              <Button className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-8 py-4 rounded-xl text-lg hover:shadow-lg hover:scale-105 transition-all">
                {t('partner.finalize_payment')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('partner.access_denied')}</h2>
            <p className="text-gray-600 mb-6">
              {t('partner.reserved_partners')}
            </p>
            <Link to={ROUTES.DASHBOARD}>
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                {t('common.back_to_dashboard')}
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
    { name: 'Lun', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.12) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.15) : 0 },
    { name: 'Mar', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.14) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.18) : 0 },
    { name: 'Mer', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.16) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.22) : 0 },
    { name: 'Jeu', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.13) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.16) : 0 },
    { name: 'Ven', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.18) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.25) : 0 },
    { name: 'Sam', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.15) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.19) : 0 },
    { name: 'Dim', impressions: dashboardStats?.profileViews?.value ? Math.floor(dashboardStats.profileViews.value * 0.12) : 0, interactions: dashboardStats?.connections?.value ? Math.floor(dashboardStats.connections.value * 0.14) : 0 }
  ];

  const engagementChannelsData = [
    { name: 'Profil', value: dashboardStats?.profileViews?.value || 0, color: '#8b5cf6' },
    { name: 'Messages', value: dashboardStats?.messages?.value || 0, color: '#06b6d4' },
    { name: 'RDV', value: dashboardStats?.appointments?.value || 0, color: '#f97316' },
    { name: 'Téléchargements', value: dashboardStats?.documentDownloads?.value || 0, color: '#10b981' }
  ];

  const roiMetricsData = [
    { name: 'Connexions', value: dashboardStats?.connections?.value || 0 },
    { name: 'Leads Qualifiés', value: dashboardStats?.leadExports?.value || 0 },
    { name: 'RDV Confirmés', value: confirmedAppointments.length },
    { name: 'Messages', value: dashboardStats?.messages?.value || 0 }
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
    <div className="min-h-screen bg-slate-50 pt-32">
      {/* Premium Hero Header */}
      <div className="bg-slate-900 pt-12 pb-24 relative overflow-hidden">
        <MoroccanPattern className="opacity-10" color="white" scale={1.2} />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-purple-900/40" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 backdrop-blur-xl rounded-2xl border border-indigo-400/30">
                  <Award className="h-8 w-8 text-indigo-300" />
                </div>
                <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30 backdrop-blur-md px-4 py-1.5 text-sm font-bold">
                  PARTENAIRE {partnerTier.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                Business <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 italic">Networking Hub</span>
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">
                Gérez vos opportunités d'affaires et maximisez votre impact lors de l'événement SIPORT 2026.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to={ROUTES.BADGE}>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.2)] px-8 py-6 rounded-2xl font-bold transition-all hover:scale-105">
                  🎫 Mon Badge Virtuel
                </Button>
              </Link>
              <Link to={ROUTES.PARTNER_ANALYTICS}>
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-[0_0_20px_rgba(79,70,229,0.4)] px-8 py-6 rounded-2xl font-bold transition-all hover:scale-105">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Performance ROI
                </Button>
              </Link>
              <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700/50">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-slate-200 font-bold uppercase tracking-wider text-sm">{t('partner.dashboard_live')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-20">
        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-2xl p-2 rounded-[2.5rem] shadow-2xl border border-white/50 mb-10 flex flex-col md:inline-flex md:flex-row flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
            { id: 'profile', label: 'Mon Stand & Profil', icon: Edit },
            { id: 'networking', label: 'Rendez-vous', icon: Calendar },
            { id: 'analytics', label: 'Analytics ROI', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center justify-center md:justify-start gap-3 px-8 py-4 rounded-[2rem] font-bold transition-all duration-300 w-full md:w-auto ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🔔 Alerte pour les comptes en attente de paiement */}
        {user.status === 'pending_payment' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2.5rem] shadow-xl p-10 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20">
              <CreditCard className="w-32 h-32 rotate-12" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-3xl font-black italic uppercase tracking-wider">{t('partner.payment_validation_required')}</h3>
              </div>
              <p className="text-xl text-white/90 mb-8 max-w-2xl font-medium">
                {t('partner.payment_activation_message')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/partner/payment-selection">
                  <Button className="bg-white text-orange-600 hover:bg-orange-50 font-black px-10 py-7 rounded-2xl shadow-xl transition-all hover:scale-105">
                    {t('partner.make_payment')}
                  </Button>
                </Link>
                <Link to="/support">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 px-8 py-7 rounded-2xl font-bold">
                    Contacter le support
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Vues Profil', value: dashboardStats?.profileViews.value.toLocaleString() || '0', icon: Crown, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
                    { label: 'Connexions', value: dashboardStats?.connections.value || '0', icon: Handshake, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                    { label: 'Rendez-vous', value: dashboardStats?.appointments.value || '0', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                    { label: 'Messages', value: dashboardStats?.messages.value || '0', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
                  ].map((stat) => (
                    <Card key={stat.label} className={`p-8 bg-white border-2 ${stat.border} rounded-[2rem] hover:shadow-xl transition-all group`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-4 ${stat.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                          <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        </div>
                      </div>
                      <p className="text-slate-500 font-bold uppercase tracking-wider text-xs mb-1">{stat.label}</p>
                      <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                    </Card>
                  ))}
                </div>

                {/* Quota & Activities Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2">
                    <QuotaSummaryCard
                      title="Quotas & Avantages"
                      level={partnerTier}
                      type="partner"
                      className="rounded-[2.5rem] shadow-xl overflow-hidden"
                      quotas={[
                        { label: 'Rendez-vous B2B', current: confirmedAppointments.length, limit: getPartnerQuota(partnerTier as PartnerTier, 'appointments'), icon: <Calendar className="h-4 w-4" /> },
                        { label: 'Membres Équipe', current: dashboardStats?.teamMembers?.value || 0, limit: getPartnerQuota(partnerTier as PartnerTier, 'teamMembers'), icon: <Users className="h-4 w-4" /> },
                        { label: 'Fichiers Media', current: dashboardStats?.mediaUploads?.value || 0, limit: getPartnerQuota(partnerTier as PartnerTier, 'mediaUploads'), icon: <FileText className="h-4 w-4" /> }
                      ]}
                    />
                  </div>
                  <div>
                    <Card className="p-8 h-full bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                      <MoroccanPattern className="opacity-10" color="white" scale={0.5} />
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          <Zap className="h-6 w-6 text-amber-400" />
                          Activités Récentes
                        </h3>
                        <div className="space-y-6">
                          {dashboard?.recentActivity?.slice(0, 4).map((activity) => (
                            <div key={activity.id} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                              <div className="text-2xl">{activity.type === 'profile_view' ? '👁️' : activity.type === 'message' ? '💬' : '📅'}</div>
                              <div>
                                <p className="text-sm font-medium">{activity.description}</p>
                                <p className="text-xs text-slate-400 mt-1">{new Date(activity.timestamp).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-10 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 h-full flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-indigo-100 rounded-[2rem] flex items-center justify-center mb-6">
                    <Sparkles className="h-12 w-12 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-4">{t('partner.ai_generation')}</h3>
                  <p className="text-slate-600 mb-8 max-w-sm">
                    Laissez notre IA analyser votre site web et remplir automatiquement votre profil partenaire avec vos logos, descriptions et services.
                  </p>
                  <Button
                    onClick={() => setShowScrapperModal(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-8 rounded-2xl shadow-xl transition-all hover:scale-[1.02]"
                  >
                    <Sparkles className="h-5 w-5 mr-3" />
                    Auto-Fill avec SIPORT AI
                  </Button>
                </Card>

                <Card className="p-10 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100 h-full flex flex-col">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                    <LayoutDashboard className="h-6 w-6 text-indigo-500" />
                    Gestion Manuelle
                  </h3>
                  <div className="space-y-4 flex-1">
                    <Button
                      onClick={() => setShowEditorModal(true)}
                      variant="outline"
                      className="w-full justify-between py-8 px-8 rounded-2xl border-2 hover:bg-slate-50 group font-bold"
                    >
                      <div className="flex items-center gap-4">
                        <Edit className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                        Modifier les informations de base
                      </div>
                      <Shield className="h-5 w-5 text-slate-300" />
                    </Button>
                    <Link to={ROUTES.PARTNER_MEDIA_UPLOAD} className="block">
                      <Button
                        variant="outline"
                        className="w-full justify-between py-8 px-8 rounded-2xl border-2 hover:bg-slate-50 group font-bold"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                          Catalogue Média & Documents
                        </div>
                        <Shield className="h-5 w-5 text-slate-300" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'networking' && (
              <div className="space-y-10">
                <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100">
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4 bg-slate-50/50">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">{t('partner.appointments_management')}</h2>
                      <p className="text-slate-500 font-medium">{t('partner.appointments_description')}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2 font-bold rounded-xl">
                      {confirmedAppointments.length} Rendez-vous Confirmés
                    </Badge>
                  </div>
                  
                  <div className="p-4 md:p-10">
                    <PublicAvailabilityCalendar 
                      standalone={false}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="p-8 bg-white rounded-[2.5rem] shadow-xl border-2 border-indigo-50 overflow-hidden">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">{t('partner.pending')}</h3>
                        <p className="text-sm text-slate-500">{t('partner.pending_requests', { count: pendingAppointments.length })}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {pendingAppointments.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-slate-400 font-medium">{t('partner.no_pending_requests')}</p>
                          <p className="text-xs text-slate-300 mt-1">{t('partner.pending_requests_appear_here')}</p>
                        </div>
                      ) : (
                        pendingAppointments.map((app, index) => (
                          <motion.div 
                            key={app.id} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-gradient-to-br from-slate-50 to-white hover:from-amber-50 hover:to-orange-50 rounded-2xl border-2 border-slate-100 hover:border-amber-200 p-6 transition-all duration-300 hover:shadow-lg"
                          >
                            <div className="flex items-start space-x-4 mb-4">
                              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {getVisitorDisplayName(app).charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-1">{getVisitorDisplayName(app)}</p>
                                <p className="text-sm text-slate-500 break-words">{app.message || "Pas de message"}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                onClick={() => handleAccept(app.id)}
                                disabled={processingAppointment === app.id}
                              >
                                {processingAppointment === app.id ? "⏳ ..." : "✓ Accepter"}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="flex-1 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                                onClick={() => handleReject(app.id)}
                                disabled={processingAppointment === app.id}
                              >
                                {processingAppointment === app.id ? "⏳ ..." : "✕ Refuser"}
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-xl relative overflow-hidden">
                    <MoroccanPattern className="opacity-10" color="white" scale={0.6} />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-6 flex items-center gap-4">
                        <Share2 className="h-6 w-6 text-indigo-400" />
                        Partager mon lien RDV
                      </h3>
                      <p className="text-slate-300 mb-6">{t('partner.share_calendar_description')}</p>
                      <Button variant="outline" className="w-full py-6 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold">
                        Copier mon lien de Stand Virtuel
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <LineChartCard
                      title="Visibilité de la Marque (7 jours)"
                      data={brandExposureData}
                      dataKeys={[
                        { key: 'impressions', color: '#6366f1', name: 'Impressions' },
                        { key: 'interactions', color: '#ec4899', name: 'Interactions' }
                      ]}
                      height={400}
                    />
                  </div>
                  <PieChartCard
                    title="Canaux d'Engagement"
                    data={engagementChannelsData}
                    height={400}
                  />
                </div>
                <Card className="p-10 bg-white rounded-[2.5rem] shadow-xl border-2 border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black text-slate-900">{t('partner.global_roi_performance')}</h3>
                    <Button variant="outline" className="rounded-xl">{t('partner.export_pdf_report')}</Button>
                  </div>
                  <BarChartCard
                    title="Répartition des Métriques"
                    data={roiMetricsData}
                    dataKey="value"
                    color="#6366f1"
                    height={300}
                  />
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Modals are remains below */}
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

      {/* Modal AI Scrapper */}
      {showScrapperModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('partner.autofill_profile_ai')}</h2>
                  <p className="text-sm text-gray-600">{t('partner.autofill_description')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowScrapperModal(false)}
                className="rounded-full"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <PartnerProfileScrapper
                partnerId={user?.id || ''}
                onSuccess={() => {
                  setShowScrapperModal(false);
                  setHasProfile(true);
                  fetchDashboard();
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Profile Editor */}
      {showEditorModal && (
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
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('partner.edit_profile_manually')}</h2>
                  <p className="text-sm text-gray-600">{t('partner.update_company_info')}</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowEditorModal(false)}
                className="rounded-full"
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <PartnerProfileEditor
                partnerId={user?.id || ''}
                onSuccess={() => {
                  setShowEditorModal(false);
                  setHasProfile(true);
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
