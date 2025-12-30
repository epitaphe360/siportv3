import React, { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { lazyRetry } from './utils/lazyRetry';
const MiniSiteCreationPage = lazyRetry(() => import('./pages/MiniSiteCreationPage'));
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { SkipToContent } from './components/common/SkipToContent';

// Lazy load pages
const HomePage = lazyRetry(() => import('./pages/HomePage'));
const ExhibitorsPage = lazyRetry(() => import('./pages/ExhibitorsPage'));
const NetworkingPage = lazyRetry(() => import('./pages/NetworkingPage'));
const LoginPage = lazyRetry(() => import('./components/auth/LoginPage'));
const DemoAccountsPage = lazyRetry(() => import('./pages/DemoAccountsPage'));
const RegisterPage = lazyRetry(() => import('./components/auth/RegisterPage'));
const ForgotPasswordPage = lazyRetry(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = lazyRetry(() => import('./components/profile/ProfilePage'));
const DashboardPage = lazyRetry(() => import('./components/dashboard/DashboardPage'));
const EventsPage = lazyRetry(() => import('./components/events/EventsPage'));
const ChatInterface = lazyRetry(() => import('./components/chat/ChatInterface'));
const AppointmentCalendar = lazyRetry(() => import('./components/appointments/AppointmentCalendar'));
const MiniSitePreview = lazyRetry(() => import('./components/minisite/MiniSitePreviewSimple'));
const ExhibitorDetailPage = lazyRetry(() => import('./pages/ExhibitorDetailPage'));
const ProfileEdit = lazyRetry(() => import('./pages/exhibitor/ProfileEdit'));
const ActivityPage = lazyRetry(() => import('./pages/admin/ActivityPage'));
const ResetPasswordPage = lazyRetry(() => import('./pages/ResetPasswordPage'));
const PartnersPage = lazyRetry(() => import('./pages/PartnersPage'));
const PartnerDetailPage = lazyRetry(() => import('./pages/PartnerDetailPage'));
const PavillonsPage = lazyRetry(() => import('./components/pavilions/PavillonsPage'));
const MetricsPage = lazyRetry(() => import('./components/metrics/MetricsPage'));
const DetailedProfilePage = lazyRetry(() => import('./components/profile/DetailedProfilePage'));
const ProfileMatchingPage = lazyRetry(() => import('./pages/ProfileMatchingPage'));
const VisitorDashboard = lazyRetry(() => import('./components/visitor/VisitorDashboard'));
const TestFlowPage = lazyRetry(() => import('./pages/dev/TestFlowPage'));
const VisitorProfileSettings = lazyRetry(() => import('./components/visitor/VisitorProfileSettings'));
const AdminDashboard = lazyRetry(() => import('./components/dashboard/AdminDashboard'));
const ExhibitorDashboard = lazyRetry(() => import('./components/dashboard/ExhibitorDashboard'));
const PartnerDashboard = lazyRetry(() => import('./components/dashboard/PartnerDashboard'));
const ExhibitorValidation = lazyRetry(() => import('./components/admin/ExhibitorValidation'));
const ModerationPanel = lazyRetry(() => import('./components/admin/ModerationPanel'));
const MiniSiteEditor = lazyRetry(() => import('./components/minisite/MiniSiteEditor'));
const NewsPage = lazyRetry(() => import('./pages/NewsPage'));
const ArticleDetailPage = lazyRetry(() => import('./pages/ArticleDetailPage'));
const ExhibitorCreationSimulator = lazyRetry(() => import('./components/admin/ExhibitorCreationSimulator'));
const PartnerCreationForm = lazyRetry(() => import('./components/admin/PartnerCreationForm'));
const NewsArticleCreationForm = lazyRetry(() => import('./components/admin/NewsArticleCreationForm'));
const EventCreationForm = lazyRetry(() => import('./components/admin/EventCreationForm'));
const EventManagementPage = lazyRetry(() => import('./components/admin/EventManagementPage'));
const UserManagementPage = lazyRetry(() => import('./pages/UserManagementPage'));
const ExhibitorSignUpPage = lazyRetry(() => import('./pages/auth/ExhibitorSignUpPage'));
const PartnerSignUpPage = lazyRetry(() => import('./pages/auth/PartnerSignUpPage'));
const SignUpSuccessPage = lazyRetry(() => import('./pages/auth/SignUpSuccessPage'));
const SignupConfirmationPage = lazyRetry(() => import('./pages/auth/SignupConfirmationPage'));
const PendingAccountPage = lazyRetry(() => import('./pages/auth/PendingAccountPage'));
const OAuthCallbackPage = lazyRetry(() => import('./pages/auth/OAuthCallbackPage'));
const SubscriptionPage = lazyRetry(() => import('./pages/SubscriptionPage'));
// VisitorSubscriptionPage removed - route was duplicated with SubscriptionPage
const VisitorUpgradePage = lazyRetry(() => import('./pages/VisitorUpgradePage'));
const VisitorPaymentPage = lazyRetry(() => import('./pages/VisitorPaymentPage'));
const PaymentSuccessPage = lazyRetry(() => import('./pages/visitor/PaymentSuccessPage'));
const PaymentInstructionsPage = lazyRetry(() => import('./pages/visitor/PaymentInstructionsPage'));
const PaymentValidationPage = lazyRetry(() => import('./pages/admin/PaymentValidationPage'));
const BadgePage = lazyRetry(() => import('./pages/BadgePage'));
const PartnerUpgradePage = lazyRetry(() => import('./pages/PartnerUpgradePage'));
const BadgeScannerPage = lazyRetry(() => import('./pages/BadgeScannerPage'));
const PartnerBankTransferPage = lazyRetry(() => import('./pages/partner/PartnerBankTransferPage'));
const PartnerPaymentSelectionPage = lazyRetry(() => import('./pages/partner/PartnerPaymentSelectionPage'));
const DigitalBadge = lazyRetry(() => import('./components/badge/DigitalBadge'));
const QRScanner = lazyRetry(() => import('./components/security/QRScanner'));

// Visitor registration pages
const VisitorFreeRegistration = lazyRetry(() => import('./pages/visitor/VisitorFreeRegistration'));
const VisitorVIPRegistration = lazyRetry(() => import('./pages/visitor/VisitorVIPRegistration'));

// Admin pages
const PavillonsAdminPage = lazyRetry(() => import('./pages/admin/PavillonsPage'));
const CreatePavilionPage = lazyRetry(() => import('./pages/admin/CreatePavilionPage'));
const AddDemoProgramPage = lazyRetry(() => import('./pages/admin/AddDemoProgramPage'));
const ContentManagementPage = lazyRetry(() => import('./pages/admin/ContentManagementPage'));
const CreateUserPage = lazyRetry(() => import('./pages/admin/CreateUserPage'));
const AdminPartnersPage = lazyRetry(() => import('./pages/admin/PartnersPage'));
const MarketingDashboard = lazyRetry(() => import('./pages/MarketingDashboard'));

// New pages for footer links
const ContactPage = lazyRetry(() => import('./pages/ContactPage'));
const ContactSuccessPage = lazyRetry(() => import('./pages/ContactSuccessPage'));
const PartnershipPage = lazyRetry(() => import('./pages/PartnershipPage'));
const SupportPage = lazyRetry(() => import('./pages/SupportPage'));
const APIPage = lazyRetry(() => import('./pages/APIPage'));
const PrivacyPage = lazyRetry(() => import('./pages/PrivacyPage'));
const TermsPage = lazyRetry(() => import('./pages/TermsPage'));
const CookiesPage = lazyRetry(() => import('./pages/CookiesPage'));
const AvailabilitySettingsPage = lazyRetry(() => import('./pages/AvailabilitySettingsPage'));
const VenuePage = lazyRetry(() => import('./pages/VenuePage'));

// Partner pages
const PartnerActivityPage = lazyRetry(() => import('./pages/partners/PartnerActivityPage'));
const PartnerAnalyticsPage = lazyRetry(() => import('./pages/partners/PartnerAnalyticsPage'));
const PartnerEventsPage = lazyRetry(() => import('./pages/partners/PartnerEventsPage'));
const PartnerLeadsPage = lazyRetry(() => import('./pages/partners/PartnerLeadsPage'));
const PartnerMediaPage = lazyRetry(() => import('./pages/partners/PartnerMediaPage'));
const PartnerNetworkingPage = lazyRetry(() => import('./pages/partners/PartnerNetworkingPage'));
const PartnerProfileEditPage = lazyRetry(() => import('./pages/partners/PartnerProfileEditPage'));
const PartnerSatisfactionPage = lazyRetry(() => import('./pages/partners/PartnerSatisfactionPage'));
const PartnerSupportPageComponent = lazyRetry(() => import('./pages/partners/PartnerSupportPage'));

// Error pages
const UnauthorizedPage = lazyRetry(() => import('./pages/UnauthorizedPage'));
const ForbiddenPage = lazyRetry(() => import('./pages/ForbiddenPage'));

// Media pages
const WebinarsPage = lazyRetry(() => import('./pages/media/WebinarsPage').then(m => ({ default: m.WebinarsPage })));
const PodcastsPage = lazyRetry(() => import('./pages/media/PodcastsPage').then(m => ({ default: m.PodcastsPage })));
const CapsulesPage = lazyRetry(() => import('./pages/media/CapsulesPage').then(m => ({ default: m.CapsulesPage })));
const LiveStudioPage = lazyRetry(() => import('./pages/media/LiveStudioPage').then(m => ({ default: m.LiveStudioPage })));
const BestMomentsPage = lazyRetry(() => import('./pages/media/BestMomentsPage').then(m => ({ default: m.BestMomentsPage })));
const TestimonialsPage = lazyRetry(() => import('./pages/media/TestimonialsPage').then(m => ({ default: m.TestimonialsPage })));
const MediaLibraryPage = lazyRetry(() => import('./pages/media/MediaLibraryPage').then(m => ({ default: m.MediaLibraryPage })));
const MediaDetailPage = lazyRetry(() => import('./pages/media/MediaDetailPage').then(m => ({ default: m.MediaDetailPage })));

// Admin Media pages
const MediaManagementPage = lazyRetry(() => import('./pages/admin/media/MediaManagementPage'));
const CreateMediaPage = lazyRetry(() => import('./pages/admin/media/CreateMediaPage'));

// Partner Media pages
const PartnerMediaUploadPage = lazyRetry(() => import('./pages/partners/PartnerMediaUploadPage'));
const PartnerMediaAnalyticsPage = lazyRetry(() => import('./pages/partners/PartnerMediaAnalyticsPage'));

import { ChatBot } from './components/chatbot/ChatBot';
import { ChatBotToggle } from './components/chatbot/ChatBotToggle';
import { useLanguageStore } from './store/languageStore';
import { ROUTES } from './lib/routes';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { initializeAuth } from './lib/initAuth';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import cleanup functions for dev debugging (not used in production)
if (import.meta.env.DEV) {
  import('./lib/cleanupAuth').then(({ cleanupAuth, checkAuthStatus }) => {
    // Make available in browser console for debugging
    (window as any).cleanupAuth = cleanupAuth;
    (window as any).checkAuthStatus = checkAuthStatus;
    console.log('🛠️ Dev tools disponibles: checkAuthStatus(), cleanupAuth()');
  });
}


const App = () => {
  const [isChatBotOpen, setIsChatBotOpen] = React.useState(false);
  const { currentLanguage, getCurrentLanguage } = useLanguageStore();

  // Initialize auth from Supabase session on app start
  React.useEffect(() => {
    // Run async init without blocking
    initializeAuth().catch(err => {
      console.error('Erreur initialisation auth:', err);
    });
  }, []);

  // BUGFIX: Removed getCurrentLanguage from deps to prevent unnecessary re-renders
  // Appliquer la direction du texte selon la langue
  React.useEffect(() => {
    const currentLang = useLanguageStore.getState().getCurrentLanguage();
    document.documentElement.dir = currentLang.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.code;
  }, [currentLanguage]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <SkipToContent />
        <Header />
        <main id="main-content" className="flex-1">
          <Suspense fallback={<div className="flex justify-center items-center h-full"><div>Chargement...</div></div>}>
            <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.EXHIBITORS} element={<ExhibitorsPage />} />
            <Route path={ROUTES.EXHIBITOR_DETAIL} element={<ExhibitorDetailPage />} />
            <Route path={ROUTES.PARTNERS} element={<PartnersPage />} />
            <Route path={ROUTES.PARTNER_DETAIL} element={<PartnerDetailPage />} />
            <Route path={ROUTES.PAVILIONS} element={<PavillonsPage />} />
            <Route path={ROUTES.METRICS} element={<MetricsPage />} />
            <Route path={ROUTES.NETWORKING} element={<NetworkingPage />} />
            <Route path={ROUTES.EVENTS} element={<EventsPage />} />
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.DEMO_ACCOUNTS} element={<DemoAccountsPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.REGISTER_VISITOR} element={<RegisterPage />} />
            <Route path={ROUTES.REGISTER_EXHIBITOR} element={<ExhibitorSignUpPage />} />
            <Route path={ROUTES.REGISTER_PARTNER} element={<PartnerSignUpPage />} />
            <Route path={ROUTES.VISITOR_FREE_REGISTRATION} element={<VisitorFreeRegistration />} />
            <Route path={ROUTES.VISITOR_VIP_REGISTRATION} element={<VisitorVIPRegistration />} />
            <Route path={ROUTES.SIGNUP_SUCCESS} element={<SignUpSuccessPage />} />
            <Route path={ROUTES.SIGNUP_CONFIRMATION} element={<SignupConfirmationPage />} />
            <Route path={ROUTES.PENDING_ACCOUNT} element={<PendingAccountPage />} />
            <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallbackPage />} />
            <Route path={ROUTES.VISITOR_SUBSCRIPTION} element={<SubscriptionPage />} />
            {/* Protected routes - require authentication */}
            <Route path={ROUTES.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE_DETAILED} element={<ProtectedRoute><DetailedProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.PROFILE_MATCHING} element={<ProtectedRoute><ProfileMatchingPage /></ProtectedRoute>} />
            <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path={ROUTES.EXHIBITOR_PROFILE} element={<ProtectedRoute requiredRole="exhibitor"><ProfilePage /></ProtectedRoute>} />
            <Route path={`${ROUTES.EXHIBITOR_PROFILE}/edit`} element={<ProtectedRoute requiredRole="exhibitor"><ProfileEdit /></ProtectedRoute>} />
            <Route path={ROUTES.EXHIBITOR_DASHBOARD} element={<ProtectedRoute requiredRole="exhibitor"><ExhibitorDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_DASHBOARD} element={<ProtectedRoute requiredRole="visitor"><VisitorDashboard /></ProtectedRoute>} />
            {/* Partner routes - NEW */}
            <Route path={ROUTES.PARTNER_DASHBOARD} element={<ProtectedRoute requiredRole="partner"><PartnerDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_PROFILE} element={<ProtectedRoute requiredRole="partner"><ProfilePage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_SETTINGS} element={<ProtectedRoute requiredRole="partner"><VisitorProfileSettings /></ProtectedRoute>} />

            {/* Pages partenaires détaillées */}
            <Route path={ROUTES.PARTNER_ACTIVITY} element={<ProtectedRoute requiredRole="partner"><PartnerActivityPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_ANALYTICS} element={<ProtectedRoute requiredRole="partner"><PartnerAnalyticsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_EVENTS} element={<ProtectedRoute requiredRole="partner"><PartnerEventsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_LEADS} element={<ProtectedRoute requiredRole="partner"><PartnerLeadsPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_MEDIA} element={<ProtectedRoute requiredRole="partner"><PartnerMediaPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_NETWORKING} element={<ProtectedRoute requiredRole="partner"><PartnerNetworkingPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_PROFILE_EDIT} element={<ProtectedRoute requiredRole="partner"><PartnerProfileEditPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_SATISFACTION} element={<ProtectedRoute requiredRole="partner"><PartnerSatisfactionPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_SUPPORT_PAGE} element={<ProtectedRoute requiredRole="partner"><PartnerSupportPageComponent /></ProtectedRoute>} />

            {/* Pages erreur */}
            <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
            <Route path={ROUTES.FORBIDDEN} element={<ForbiddenPage />} />

            {/* SECURED: Dev route now requires admin role */}
            <Route path={ROUTES.DEV_TEST_FLOW} element={<ProtectedRoute requiredRole="admin"><TestFlowPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_SETTINGS} element={<ProtectedRoute requiredRole="visitor"><VisitorProfileSettings /></ProtectedRoute>} />
            {/* BUG FIX: Route VISITOR_SUBSCRIPTION dupliquée - supprimée car déjà définie ligne 180 comme route publique */}
            <Route path={ROUTES.VISITOR_UPGRADE} element={<ProtectedRoute requiredRole="visitor"><VisitorUpgradePage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_PAYMENT} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><VisitorPaymentPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_PAYMENT_SUCCESS} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><PaymentSuccessPage /></ProtectedRoute>} />
            <Route path={ROUTES.VISITOR_PAYMENT_INSTRUCTIONS} element={<ProtectedRoute requiredRole="visitor" allowPendingPayment={true}><PaymentInstructionsPage /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE} element={<ProtectedRoute><BadgePage /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE_DIGITAL} element={<ProtectedRoute><DigitalBadge /></ProtectedRoute>} />
            <Route path={ROUTES.BADGE_SCANNER} element={<ProtectedRoute><BadgeScannerPage /></ProtectedRoute>} />
            {/* FIXED: Permettre aux admins d'accéder au scanner QR (pas seulement 'security') */}
            <Route path={ROUTES.SECURITY_SCANNER} element={<ProtectedRoute requiredRole={['admin', 'exhibitor', 'partner']}><QRScanner /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_UPGRADE} element={<ProtectedRoute requiredRole="partner"><PartnerUpgradePage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_PAYMENT_SELECTION} element={<ProtectedRoute requiredRole="partner"><PartnerPaymentSelectionPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_BANK_TRANSFER} element={<ProtectedRoute requiredRole="partner"><PartnerBankTransferPage /></ProtectedRoute>} />
            <Route path={ROUTES.MESSAGES} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
            <Route path={ROUTES.CHAT} element={<ProtectedRoute><ChatInterface /></ProtectedRoute>} />
            <Route path={ROUTES.APPOINTMENTS} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
            <Route path={ROUTES.CALENDAR} element={<ProtectedRoute><AppointmentCalendar /></ProtectedRoute>} />
            <Route path={ROUTES.MINISITE_CREATION} element={<ProtectedRoute requiredRole="exhibitor"><MiniSiteCreationPage /></ProtectedRoute>} />
            <Route path={ROUTES.MINISITE_EDITOR} element={<ProtectedRoute requiredRole="exhibitor"><MiniSiteEditor /></ProtectedRoute>} />
            <Route path={ROUTES.MINISITE_PREVIEW} element={<MiniSitePreview />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

            {/* Admin routes - require admin role */}
            <Route path={ROUTES.ADMIN_CREATE_EXHIBITOR} element={<ProtectedRoute requiredRole="admin"><ExhibitorCreationSimulator /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_PARTNER} element={<ProtectedRoute requiredRole="admin"><PartnerCreationForm /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_NEWS} element={<ProtectedRoute requiredRole="admin"><NewsArticleCreationForm /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_EVENT} element={<ProtectedRoute requiredRole="admin"><EventCreationForm /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_EVENTS} element={<ProtectedRoute requiredRole="admin"><EventManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_ACTIVITY} element={<ProtectedRoute requiredRole="admin"><ActivityPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_VALIDATION} element={<ProtectedRoute requiredRole="admin"><ExhibitorValidation /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_MODERATION} element={<ProtectedRoute requiredRole="admin"><ModerationPanel /></ProtectedRoute>} />
            <Route path={ROUTES.NEWS} element={<NewsPage />} />
            <Route path={ROUTES.NEWS_DETAIL} element={<ArticleDetailPage />} />
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PAYMENT_VALIDATION} element={<ProtectedRoute requiredRole="admin"><PaymentValidationPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute requiredRole="admin"><UserManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_USER} element={<ProtectedRoute requiredRole="admin"><CreateUserPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PARTNERS} element={<ProtectedRoute requiredRole="admin"><AdminPartnersPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PAVILIONS} element={<ProtectedRoute requiredRole="admin"><PavillonsAdminPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CREATE_PAVILION} element={<ProtectedRoute requiredRole="admin"><CreatePavilionPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_PAVILION_ADD_DEMO} element={<ProtectedRoute requiredRole="admin"><AddDemoProgramPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_CONTENT} element={<ProtectedRoute requiredRole="admin"><ContentManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.MARKETING_DASHBOARD} element={<ProtectedRoute requiredRole="admin"><MarketingDashboard /></ProtectedRoute>} />

            {/* New routes for footer links */}
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.CONTACT_SUCCESS} element={<ContactSuccessPage />} />
            <Route path={ROUTES.PARTNERSHIP} element={<PartnershipPage />} />
            <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
            <Route path={ROUTES.API} element={<APIPage />} />
            <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
            <Route path={ROUTES.TERMS} element={<TermsPage />} />
            <Route path={ROUTES.COOKIES} element={<CookiesPage />} />
            <Route path={ROUTES.AVAILABILITY_SETTINGS} element={<AvailabilitySettingsPage />} />
            <Route path={ROUTES.VENUE} element={<VenuePage />} />

            {/* Media routes - public access */}
            <Route path={ROUTES.WEBINARS} element={<WebinarsPage />} />
            <Route path={ROUTES.WEBINAR_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.PODCASTS} element={<PodcastsPage />} />
            <Route path={ROUTES.PODCAST_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.CAPSULES_INSIDE} element={<CapsulesPage />} />
            <Route path={ROUTES.CAPSULE_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.LIVE_STUDIO} element={<LiveStudioPage />} />
            <Route path={ROUTES.LIVE_STUDIO_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.BEST_MOMENTS} element={<BestMomentsPage />} />
            <Route path={ROUTES.BEST_MOMENTS_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.TESTIMONIALS} element={<TestimonialsPage />} />
            <Route path={ROUTES.TESTIMONIAL_DETAIL} element={<MediaDetailPage />} />
            <Route path={ROUTES.MEDIA_LIBRARY} element={<MediaLibraryPage />} />

            {/* Partner Media routes - protected */}
            <Route path={ROUTES.PARTNER_MEDIA_UPLOAD} element={<ProtectedRoute requiredRole="partner"><PartnerMediaUploadPage /></ProtectedRoute>} />
            <Route path={ROUTES.PARTNER_MEDIA_ANALYTICS} element={<ProtectedRoute requiredRole="partner"><PartnerMediaAnalyticsPage /></ProtectedRoute>} />

            {/* Admin Media routes - protected */}
            <Route path={ROUTES.ADMIN_MEDIA_MANAGE} element={<ProtectedRoute requiredRole="admin"><MediaManagementPage /></ProtectedRoute>} />
            <Route path={ROUTES.ADMIN_MEDIA_CREATE} element={<ProtectedRoute requiredRole="admin"><CreateMediaPage /></ProtectedRoute>} />

            {/* 404 catch-all route - must be last */}
            <Route path="*" element={<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
              <a href={ROUTES.HOME} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Retour à l'accueil
              </a>
            </div>} />
          </Routes>
        </Suspense>
      </main>
      <Footer />

      {/* ChatBot */}
      <ChatBot
        isOpen={isChatBotOpen}
        onToggle={() => setIsChatBotOpen(!isChatBotOpen)}
      />

      {/* ChatBot Toggle Button */}
      {!isChatBotOpen && (
        <ChatBotToggle
          onClick={() => setIsChatBotOpen(true)}
          hasUnreadMessages={false}
        />
      )}
      <Toaster position="top-right" />
    </div>
    </ErrorBoundary>
  );
}

export default App;