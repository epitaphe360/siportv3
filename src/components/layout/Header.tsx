import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Calendar,
  MessageCircle,
  Bell,
  Video,
  Mic,
  Play,
} from 'lucide-react';
import { ROUTES } from '../../lib/routes';
import { Button } from '../ui/Button';
import useAuthStore from '../../store/authStore';
import { LanguageSelector } from '../ui/LanguageSelector';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useTranslation } from '../../hooks/useTranslation';
import { MoroccanPattern } from '../ui/MoroccanDecor';
import { isAuthInitialized } from '../../lib/initAuth';

// OPTIMIZATION: Memoized Header component to prevent unnecessary re-renders
export const Header: React.FC = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const { t } = useTranslation();

  // ✅ CRITICAL: Ne pas afficher "Se connecter" pendant l'initialisation
  const authReady = isAuthInitialized() && !isLoading;

  // OPTIMIZATION: Memoized callbacks to prevent re-creating functions on every render
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);
  const toggleProfile = useCallback(() => setIsProfileOpen(prev => !prev), []);
  const toggleInfoMenu = useCallback(() => setIsInfoMenuOpen(prev => !prev), []);
  const toggleMediaMenu = useCallback(() => setIsMediaMenuOpen(prev => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);
  const closeInfoMenu = useCallback(() => setIsInfoMenuOpen(false), []);
  const closeMediaMenu = useCallback(() => setIsMediaMenuOpen(false), []);

  const handleLogout = useCallback(() => {
    logout();
    setIsProfileOpen(false);
  }, [logout]);

  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);

  const navigation = [
    { name: t('nav.home'), href: ROUTES.HOME },
    { name: t('nav.exhibitors'), href: ROUTES.EXHIBITORS },
    { name: t('nav.partners'), href: ROUTES.PARTNERS },
    // Cacher le réseautage pour les visiteurs free
    ...(isFreeVisitor ? [] : [{ name: t('nav.networking'), href: ROUTES.NETWORKING }]),
  ];

  const infoMenuItems = [
    { name: t('nav.pavilions'), href: ROUTES.PAVILIONS, description: t('menu.pavilions_desc') },
    { name: t('nav.events'), href: ROUTES.EVENTS, description: t('menu.events_desc') },
    { name: t('nav.news'), href: ROUTES.NEWS, description: t('menu.news_desc') },
    { name: t('nav.accommodation'), href: '/hebergement', description: t('menu.accommodation_desc') },
    { name: t('nav.subscriptions'), href: ROUTES.VISITOR_SUBSCRIPTION, description: t('menu.subscriptions_desc') }
  ];

  const mediaMenuItems = [
    { name: t('media.webinars'), href: ROUTES.WEBINARS, description: t('media.webinars_desc'), icon: Video },
    { name: t('media.podcasts'), href: ROUTES.PODCASTS, description: t('media.podcasts_desc'), icon: Mic },
    { name: t('media.capsules'), href: ROUTES.CAPSULES_INSIDE, description: t('media.capsules_desc'), icon: Play },
    { name: t('media.live_studio'), href: ROUTES.LIVE_STUDIO, description: t('media.live_studio_desc'), icon: Video },
    { name: t('media.best_moments'), href: ROUTES.BEST_MOMENTS, description: t('media.best_moments_desc'), icon: Play },
    { name: t('media.testimonials'), href: ROUTES.TESTIMONIALS, description: t('media.testimonials_desc'), icon: Video },
    { name: t('media.library'), href: ROUTES.MEDIA_LIBRARY, description: t('media.library_desc'), icon: Play },
  ];
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
      {/* Pattern Zellige Subtil en fond */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 font-sans">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Premium */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-4 group">
            <div className="relative">
              <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-12 w-auto flex items-center">
                <img
                  src="/salon-logo01.png"
                  alt="SIPORTS Logo"
                  className="h-full w-auto object-contain brightness-100"
                />
              </div>
            </div>
            <div className="flex flex-col border-l border-slate-200 pl-4 py-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">SIPORTS 2026</span>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                 <span className="text-[11px] text-slate-900 font-black uppercase tracking-widest">Live Experience</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Luxe */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="relative px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all group"
              >
                {item.name}
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
            
            {/* Divider Vertical Minimaliste */}
            <div className="w-[1px] h-6 bg-slate-200 mx-4" />

            {/* Media Dropdown Premium */}
            <div className="relative" onMouseEnter={() => setIsMediaMenuOpen(true)} onMouseLeave={() => setIsMediaMenuOpen(false)}>
              <button
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 group"
              >
                <Video className="w-4 h-4 text-blue-500" />
                <span>{t('media.menu_title')}</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>
              
              {/* Dropdown Content */}
              {isMediaMenuOpen && (
                <div className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50">
                  {mediaMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-start px-4 py-3 hover:bg-slate-50 transition-colors group"
                        onMouseEnter={() => setIsMediaMenuOpen(true)}
                        onMouseLeave={() => setIsMediaMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-slate-400 group-hover:text-blue-600" />
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-xs text-slate-500">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Dropdown Premium */}
            <div className="relative">
              <button
                onMouseEnter={() => setIsInfoMenuOpen(true)}
                onMouseLeave={() => setIsInfoMenuOpen(false)}
                className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 group"
              >
                <span>Information</span>
                <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </button>

              {/* Info Dropdown Content */}
              {isInfoMenuOpen && (
                <div
                  onMouseEnter={() => setIsInfoMenuOpen(true)}
                  onMouseLeave={() => setIsInfoMenuOpen(false)}
                  className="absolute left-0 mt-0 w-64 bg-white rounded-lg shadow-2xl border border-slate-200 py-2 z-50"
                >
                  {infoMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                      onClick={() => setIsInfoMenuOpen(false)}
                    >
                      <div>
                        <div className="font-medium text-slate-900">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Actions & Profile Luxe */}
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center gap-4">
               <LanguageSelector />
               <ThemeToggle />
            </div>

            {isAuthenticated ? (
              <>
              {/* Notifications */}
              <button data-testid="notifications-button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Messages */}
                <Link 
                  to={ROUTES.MESSAGES} 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                    2
                  </span>
                </Link>

                {/* Calendar */}
                <Link aria-label="Calendar" 
                  to={ROUTES.APPOINTMENTS} 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    data-testid="user-menu"
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.profile?.firstName || 'Mon compte'}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* Menu Admin */}
                      {user?.type === 'admin' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Mon Profil Admin
                          </Link>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Tableau de Bord Admin
                          </Link>
                          <Link
                            to={ROUTES.ADMIN_PAYMENT_VALIDATION}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Validation Paiements
                          </Link>
                          <Link
                            to={ROUTES.METRICS}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Métriques & Performance
                          </Link>
                          <Link
                            to="/security/scanner"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🔍 Scanner QR (Sécurité)
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 Mon Badge Digital
                          </Link>
                          <hr className="my-1" />
                          <div className="px-4 py-2 text-xs text-red-600 font-medium">
                            Zone Administrateur
                          </div>
                        </>
                      )}

                      {/* Menu Exposant */}
                      {user?.type === 'exhibitor' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Mon Profil
                          </Link>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Tableau de Bord Exposant
                          </Link>
                          <Link
                            to={ROUTES.MINISITE_EDITOR}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Éditeur de Mini-Site
                          </Link>
                          <Link
                            to={ROUTES.CALENDAR}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Mes Créneaux RDV
                          </Link>
                          <Link
                            to={ROUTES.CHAT}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Messages & Contact
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 Mon Badge Digital
                          </Link>
                        </>
                      )}

                      {/* Menu Partenaire */}
                      {user?.type === 'partner' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Mon Profil
                          </Link>
                          <Link
                            to={ROUTES.DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Tableau de Bord Partenaire
                          </Link>
                          <Link
                            to={ROUTES.NETWORKING}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Networking VIP
                          </Link>
                          <Link
                            to="/partner/payment-selection"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            💳 Abonnement Partenaire
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 Mon Badge Digital
                          </Link>
                        </>
                      )}

                      {/* Menu Visiteur */}
                      {user?.type === 'visitor' && (
                        <>
                          <Link
                            to={ROUTES.PROFILE}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Mon Profil
                          </Link>
                          <Link
                            to={ROUTES.VISITOR_DASHBOARD}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Tableau de Bord Visiteur
                          </Link>
                          <Link
                            to={ROUTES.VISITOR_SETTINGS}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Paramètres Visiteur
                          </Link>
                          <Link
                            to={ROUTES.APPOINTMENTS}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            Mes Rendez-vous
                          </Link>
                          <Link
                            to="/badge/digital"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={closeProfile}
                          >
                            🎫 Mon Badge Digital
                          </Link>
                        </>
                      )}

                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !authReady ? (
              // ✅ CRITICAL: Afficher un loader pendant l'initialisation de l'authentification
              <div className="flex items-center space-x-3">
                <div className="animate-pulse flex items-center space-x-2">
                  <div className="h-8 w-24 bg-gray-200 rounded"></div>
                  <div className="h-8 w-28 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" size="sm" className="border-siports-primary text-siports-primary hover:bg-siports-primary hover:text-white">
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
                  <Button size="sm" className="bg-siports-primary hover:bg-siports-dark text-white">
                    {t('nav.register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              ))}

              {/* Mobile Media Menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center">
                  <Video className="w-4 h-4 mr-2" />
                  Média
                </div>
                {mediaMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-start px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      <Icon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-gray-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Info Menu */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('nav.information')}
                </div>
                {infoMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={closeMenu}
                  >
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
});