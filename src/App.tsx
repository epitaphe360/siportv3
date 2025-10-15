import React, { Suspense } from 'react';
const MiniSiteCreationPage = React.lazy(() => import('./pages/MiniSiteCreationPage'));
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Lazy load pages
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ExhibitorsPage = React.lazy(() => import('./pages/ExhibitorsPage'));
const NetworkingPage = React.lazy(() => import('./pages/NetworkingPage'));
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./components/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const ProfilePage = React.lazy(() => import('./components/profile/ProfilePage'));
const DashboardPage = React.lazy(() => import('./components/dashboard/DashboardPage'));
const EventsPage = React.lazy(() => import('./components/events/EventsPage'));
const ChatInterface = React.lazy(() => import('./components/chat/ChatInterface'));
const AppointmentCalendar = React.lazy(() => import('./components/appointments/AppointmentCalendar'));
const MiniSitePreview = React.lazy(() => import('./components/minisite/MiniSitePreview'));
const ExhibitorDetailPage = React.lazy(() => import('./pages/ExhibitorDetailPage'));
const ProfileEdit = React.lazy(() => import('./pages/exhibitor/ProfileEdit'));
const ActivityPage = React.lazy(() => import('./pages/admin/ActivityPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
const PartnersPage = React.lazy(() => import('./pages/PartnersPage'));
const PartnerDetailPage = React.lazy(() => import('./pages/PartnerDetailPage'));
const PavillonsPage = React.lazy(() => import('./components/pavilions/PavillonsPage'));
const MetricsPage = React.lazy(() => import('./components/metrics/MetricsPage'));
const DetailedProfilePage = React.lazy(() => import('./components/profile/DetailedProfilePage'));
const VisitorDashboard = React.lazy(() => import('./components/visitor/VisitorDashboard'));
const TestFlowPage = React.lazy(() => import('./pages/dev/TestFlowPage'));
const VisitorProfileSettings = React.lazy(() => import('./components/visitor/VisitorProfileSettings'));
const AdminDashboard = React.lazy(() => import('./components/dashboard/AdminDashboard'));
const ExhibitorDashboard = React.lazy(() => import('./components/dashboard/ExhibitorDashboard'));
const ExhibitorValidation = React.lazy(() => import('./components/admin/ExhibitorValidation'));
const ModerationPanel = React.lazy(() => import('./components/admin/ModerationPanel'));
const MiniSiteEditor = React.lazy(() => import('./components/minisite/MiniSiteEditor'));
const NewsPage = React.lazy(() => import('./pages/NewsPage'));
const ArticleDetailPage = React.lazy(() => import('./pages/ArticleDetailPage'));
const ExhibitorCreationSimulator = React.lazy(() => import('./components/admin/ExhibitorCreationSimulator'));
const PartnerCreationForm = React.lazy(() => import('./components/admin/PartnerCreationForm'));
const NewsArticleCreationForm = React.lazy(() => import('./components/admin/NewsArticleCreationForm'));
const UserManagementPage = React.lazy(() => import('./pages/UserManagementPage'));
const ExhibitorSignUpPage = React.lazy(() => import('./pages/auth/ExhibitorSignUpPage'));
const PartnerSignUpPage = React.lazy(() => import('./pages/auth/PartnerSignUpPage'));
const SignUpSuccessPage = React.lazy(() => import('./pages/auth/SignUpSuccessPage'));
const PendingAccountPage = React.lazy(() => import('./pages/auth/PendingAccountPage'));

// Admin pages
const PavillonsAdminPage = React.lazy(() => import('./pages/admin/PavillonsPage'));
const CreatePavilionPage = React.lazy(() => import('./pages/admin/CreatePavilionPage'));
const AddDemoProgramPage = React.lazy(() => import('./pages/admin/AddDemoProgramPage'));
const ContentManagementPage = React.lazy(() => import('./pages/admin/ContentManagementPage'));
const CreateUserPage = React.lazy(() => import('./pages/admin/CreateUserPage'));
const AdminPartnersPage = React.lazy(() => import('./pages/admin/PartnersPage'));

// New pages for footer links
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PartnershipPage = React.lazy(() => import('./pages/PartnershipPage'));
const SupportPage = React.lazy(() => import('./pages/SupportPage'));
const APIPage = React.lazy(() => import('./pages/APIPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const CookiesPage = React.lazy(() => import('./pages/CookiesPage'));
const AvailabilitySettingsPage = React.lazy(() => import('./pages/AvailabilitySettingsPage'));
const VenuePage = React.lazy(() => import('./pages/VenuePage'));

import { ChatBot } from './components/chatbot/ChatBot';
import { ChatBotToggle } from './components/chatbot/ChatBotToggle';
import { useLanguageStore } from './store/languageStore';
import { ROUTES } from './lib/routes';


const App = () => {
  const [isChatBotOpen, setIsChatBotOpen] = React.useState(false);
  const { currentLanguage, getCurrentLanguage } = useLanguageStore();

  // Appliquer la direction du texte selon la langue
  React.useEffect(() => {
    const currentLang = getCurrentLanguage();
    document.documentElement.dir = currentLang.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang.code;
  }, [currentLanguage, getCurrentLanguage]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
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
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.REGISTER_EXHIBITOR} element={<ExhibitorSignUpPage />} />
            <Route path={ROUTES.REGISTER_PARTNER} element={<PartnerSignUpPage />} />
            <Route path={ROUTES.SIGNUP_SUCCESS} element={<SignUpSuccessPage />} />
            <Route path={ROUTES.PENDING_ACCOUNT} element={<PendingAccountPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.PROFILE_DETAILED} element={<DetailedProfilePage />} />
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.EXHIBITOR_PROFILE} element={<ProfilePage />} />
            <Route path={`${ROUTES.EXHIBITOR_PROFILE}/edit`} element={<ProfileEdit />} />
            <Route path={ROUTES.EXHIBITOR_DASHBOARD} element={<ExhibitorDashboard />} />
            <Route path={ROUTES.VISITOR_DASHBOARD} element={<VisitorDashboard />} />
            <Route path="/dev/test-flow" element={<TestFlowPage />} />
            <Route path={ROUTES.VISITOR_SETTINGS} element={<VisitorProfileSettings />} />
            <Route path={ROUTES.MESSAGES} element={<ChatInterface />} />
            <Route path={ROUTES.CHAT} element={<ChatInterface />} />
            <Route path={ROUTES.APPOINTMENTS} element={<AppointmentCalendar />} />
            <Route path={ROUTES.CALENDAR} element={<AppointmentCalendar />} />
            <Route path={ROUTES.MINISITE_CREATION} element={<MiniSiteCreationPage />} />
            <Route path={ROUTES.MINISITE_EDITOR} element={<MiniSiteEditor />} />
            <Route path={ROUTES.MINISITE_PREVIEW} element={<MiniSitePreview />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.ADMIN_CREATE_EXHIBITOR} element={<ExhibitorCreationSimulator />} />
            <Route path={ROUTES.ADMIN_CREATE_PARTNER} element={<PartnerCreationForm />} />
            <Route path={ROUTES.ADMIN_CREATE_NEWS} element={<NewsArticleCreationForm />} />
            <Route path={ROUTES.ADMIN_ACTIVITY} element={<ActivityPage />} />
            <Route path={ROUTES.ADMIN_VALIDATION} element={<ExhibitorValidation />} />
            <Route path={ROUTES.ADMIN_MODERATION} element={<ModerationPanel />} />
            <Route path={ROUTES.NEWS} element={<NewsPage />} />
            <Route path={ROUTES.NEWS_DETAIL} element={<ArticleDetailPage />} />
            <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN_USERS} element={<UserManagementPage />} />
            <Route path={ROUTES.ADMIN_CREATE_USER} element={<CreateUserPage />} />
            <Route path="/admin/partners" element={<AdminPartnersPage />} />
            <Route path={ROUTES.ADMIN_PAVILIONS} element={<PavillonsAdminPage />} />
            <Route path={ROUTES.ADMIN_CREATE_PAVILION} element={<CreatePavilionPage />} />
            <Route path={ROUTES.ADMIN_PAVILION_ADD_DEMO} element={<AddDemoProgramPage />} />
            <Route path={ROUTES.ADMIN_CONTENT} element={<ContentManagementPage />} />

            {/* New routes for footer links */}
            <Route path={ROUTES.CONTACT} element={<ContactPage />} />
            <Route path={ROUTES.PARTNERSHIP} element={<PartnershipPage />} />
            <Route path={ROUTES.SUPPORT} element={<SupportPage />} />
            <Route path={ROUTES.API} element={<APIPage />} />
            <Route path={ROUTES.PRIVACY} element={<PrivacyPage />} />
            <Route path={ROUTES.TERMS} element={<TermsPage />} />
            <Route path={ROUTES.COOKIES} element={<CookiesPage />} />
            <Route path={ROUTES.AVAILABILITY_SETTINGS} element={<AvailabilitySettingsPage />} />
            <Route path={ROUTES.VENUE} element={<VenuePage />} />
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
    </div>
  );
}

export default App;