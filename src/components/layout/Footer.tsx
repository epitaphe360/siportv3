import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import {
  Anchor,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube
} from 'lucide-react';

// OPTIMIZATION: Memoized Footer component to prevent unnecessary re-renders
export const Footer: React.FC = memo(() => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-siports-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-siports-primary p-3 rounded-xl">
                <Anchor className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold font-heading">SIPORTS</span>
                <span className="text-sm text-siports-light block leading-none font-medium">2026</span>
              </div>
            </div>
            <p className="text-white/80 text-sm mb-6 leading-relaxed">
              Salon International des Ports - La plateforme de référence pour l'écosystème portuaire mondial.
            </p>
            <div className="flex space-x-4">
              <a aria-label="Facebook" 
                href="https://facebook.com/siports2026" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg text-white/80 hover:text-white hover:bg-siports-primary transition-all duration-200"
                title={t('social.follow_facebook')}
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a aria-label="Twitter" 
                href="https://twitter.com/siports2026" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg text-white/80 hover:text-white hover:bg-siports-primary transition-all duration-200"
                title={t('social.follow_twitter')}
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a aria-label="Linkedin" 
                href="https://linkedin.com/company/siports2026" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg text-white/80 hover:text-white hover:bg-siports-primary transition-all duration-200"
                title={t('social.follow_linkedin')}
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a aria-label="Youtube" 
                href="https://youtube.com/@siports2026" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg text-white/80 hover:text-white hover:bg-siports-primary transition-all duration-200"
                title={t('social.youtube_channel')}
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.HOME} className="text-gray-400 hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to={ROUTES.EXHIBITORS} className="text-gray-400 hover:text-white transition-colors">
                  Exposants
                </Link>
              </li>
              <li>
                <Link to={ROUTES.NETWORKING} className="text-gray-400 hover:text-white transition-colors">
                  Réseautage
                </Link>
              </li>
              <li>
                <Link to={ROUTES.EVENTS} className="text-gray-400 hover:text-white transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to={ROUTES.NEWS} className="text-gray-400 hover:text-white transition-colors">
                  Actualités
                </Link>
              </li>
            </ul>
          </div>

          {/* Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Média</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.WEBINARS} className="text-gray-400 hover:text-white transition-colors">
                  Webinaires
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PODCASTS} className="text-gray-400 hover:text-white transition-colors">
                  Podcasts
                </Link>
              </li>
              <li>
                <Link to={ROUTES.CAPSULES_INSIDE} className="text-gray-400 hover:text-white transition-colors">
                  Capsules Inside
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LIVE_STUDIO} className="text-gray-400 hover:text-white transition-colors">
                  Live Studio
                </Link>
              </li>
              <li>
                <Link to={ROUTES.MEDIA_LIBRARY} className="text-gray-400 hover:text-white transition-colors">
                  Bibliothèque
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to={ROUTES.REGISTER_EXHIBITOR} className="text-gray-400 hover:text-white transition-colors">
                  Devenir Exposant
                </Link>
              </li>
              <li>
                <Link to={ROUTES.PARTNERSHIP} className="text-gray-400 hover:text-white transition-colors">
                  Partenariat
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SUPPORT} className="text-gray-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link to={ROUTES.API} className="text-gray-400 hover:text-white transition-colors">
                  API Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-white/80 text-sm">
                  El Jadida, Maroc<br />
                  1-3 Avril 2026
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <a 
                  href="mailto:contact@siportevent.com" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  contact@siportevent.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a 
                  href="tel:+212123456789" 
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  +212 1 23 45 67 89
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm">
            {t('footer.copyright').replace('{year}', currentYear.toString())}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to={ROUTES.PRIVACY} className="text-white/60 hover:text-white text-sm transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to={ROUTES.TERMS} className="text-white/60 hover:text-white text-sm transition-colors">
              {t('footer.terms')}
            </Link>
            <Link to={ROUTES.COOKIES} className="text-white/60 hover:text-white text-sm transition-colors">
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});