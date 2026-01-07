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

// OPTIMIZATION: Memoized Header component to prevent unnecessary re-renders
export const Header: React.FC = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();

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

  const navigation = [
    { name: t('nav.home'), href: ROUTES.HOME },
    { name: t('nav.exhibitors'), href: ROUTES.EXHIBITORS },
    { name: t('nav.partners'), href: ROUTES.PARTNERS },
    { name: t('nav.networking'), href: ROUTES.NETWORKING },
  ];

  const infoMenuItems = [
    { name: t('nav.pavilions'), href: ROUTES.PAVILIONS, description: t('menu.pavilions_desc') },
    { name: t('nav.events'), href: ROUTES.EVENTS, description: t('menu.events_desc') },
    { name: t('nav.news'), href: ROUTES.NEWS, description: t('menu.news_desc') },
    { name: 'Subscriptions', href: ROUTES.VISITOR_SUBSCRIPTION, description: t('menu.subscriptions_desc') }
  ];

  const mediaMenuItems = [
    { name: 'Webinaires', href: ROUTES.WEBINARS, description: 'Webinaires sponsorisés en replay', icon: Video },
    { name: 'Podcasts', href: ROUTES.PODCASTS, description: 'SIPORT Talks - Épisodes audio', icon: Mic },
    { name: 'Capsules Inside', href: ROUTES.CAPSULES_INSIDE, description: 'Capsules vidéo Inside SIPORT', icon: Play },
    { name: 'Live Studio', href: ROUTES.LIVE_STUDIO, description: 'Meet The Leaders - Interviews live', icon: Video },
    { name: 'Best Moments', href: ROUTES.BEST_MOMENTS, description: 'Meilleurs moments du salon', icon: Play },
    { name: 'Testimonials', href: ROUTES.TESTIMONIALS, description: 'Témoignages vidéo', icon: Video },
    { name: 'Bibliothèque Média', href: ROUTES.MEDIA_LIBRARY, description: 'Tous les contenus médias', icon: Play },
  ];
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 border-t-4 border-t-siports-gold relative">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <MoroccanPattern className="w-full h-full text-siports-primary" scale={0.5} />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex items-center space-x-2">
            <div className="h-12 w-auto">
              <img
                src="/salon-logo01.png"
                alt="SIPORTS Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  const t = e.currentTarget as HTMLImageElement;
                  // fallback to a tiny transparent svg to avoid broken image icon
                  t.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-siports-primary leading-none">v3.0</span>
              <span className="text-[10px] text-gray-400 font-medium">LIVE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-siports-gray-700 hover:text-siports-primary px-4 py-2 text-sm font-medium transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-siports-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </Link>
            ))}
            
            {/* Media Menu Dropdown */}
            <div className="relative">
              <button
                onClick={toggleMediaMenu}
                className="text-siports-gray-700 hover:text-siports-primary px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-1 relative group"
              >
                <Video className="w-4 h-4" />
                <span>Média</span>
                <svg className={`w-4 h-4 transition-transform ${isMediaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-siports-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </button>

              {isMediaMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-siports-lg border border-siports-gray-200 py-3 z-50">
                  {mediaMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={closeMediaMenu}
                        className="flex items-start px-6 py-3 text-sm text-siports-gray-700 hover:bg-siports-gray-50 hover:text-siports-primary transition-colors border-l-4 border-transparent hover:border-siports-primary"
                      >
                        <Icon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{item.name}</div>
                          <div className="text-xs text-siports-gray-500 mt-1">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Info Menu Dropdown */}
            <div className="relative">
              <button
                onClick={toggleInfoMenu}
                className="text-siports-gray-700 hover:text-siports-primary px-4 py-2 text-sm font-medium transition-colors flex items-center space-x-1 relative group"
              >
                <span>{t('nav.information')}</span>
                <svg className={`w-4 h-4 transition-transform ${isInfoMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-siports-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </button>

              {isInfoMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-siports-lg border border-siports-gray-200 py-3 z-50">
                  {infoMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={closeInfoMenu}
                      className="block px-6 py-3 text-sm text-siports-gray-700 hover:bg-siports-gray-50 hover:text-siports-primary transition-colors border-l-4 border-transparent hover:border-siports-primary"
                    >
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-siports-gray-500 mt-1">{item.description}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {/* Métriques uniquement pour les admins */}
            {user?.type === 'admin' && (
              <Link
                to={ROUTES.METRICS}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Métriques
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

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