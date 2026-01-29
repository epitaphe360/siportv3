import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../lib/routes';
import useAuthStore from '../../store/authStore';
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
import { MoroccanPattern } from '../ui/MoroccanDecor';

// OPTIMIZATION: Memoized Footer component to prevent unnecessary re-renders
export const Footer: React.FC = memo(() => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isFreeVisitor = user?.type === 'visitor' && (user?.visitor_level === 'free' || !user?.visitor_level);

  return (
    <footer className="bg-slate-950 text-white relative overflow-hidden font-sans border-t border-slate-900">

      {/* Background Pattern Premium */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/5">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4">
            <Link to={ROUTES.HOME} className="flex items-center space-x-4 mb-8">
              <div className="relative">
                <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-lg" />
                <Anchor className="h-10 w-10 text-blue-500 relative" />
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tighter text-white">SIPORTS</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] leading-none">Global Event 2026</span>
              </div>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed max-w-sm italic mb-10">
              "Redéfinir l'excellence portuaire à travers l'innovation technologique et le réseautage stratégique mondial."
            </p>
            
            {/* Social Luxe */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'Linkedin' },
                { icon: Youtube, label: 'Youtube' }
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                  title={social.label}
                >
                  <social.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links Grouped */}
          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Navigation</h3>
            <ul className="space-y-4">
              {[
                { label: 'Accueil', href: ROUTES.HOME },
                { label: 'Catalogue Exposants', href: ROUTES.EXHIBITORS },
                ...(isFreeVisitor ? [] : [{ label: 'Réseautage B2B', href: ROUTES.NETWORKING }]),
                { label: 'Conférences', href: ROUTES.EVENTS },
                { label: 'Actualités', href: ROUTES.NEWS }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-white font-bold text-sm tracking-tight transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Plateforme Média</h3>
            <ul className="space-y-4">
              {[
                { label: 'Webinaires', href: ROUTES.WEBINARS },
                { label: 'Podcasts Audio', href: ROUTES.PODCASTS },
                { label: 'Capsules Inside', href: ROUTES.CAPSULES_INSIDE },
                { label: 'Direct Production', href: ROUTES.LIVE_STUDIO },
                { label: 'Bibliothèque', href: ROUTES.MEDIA_LIBRARY }
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-slate-500 hover:text-white font-bold text-sm tracking-tight transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Presence Luxe */}
          <div className="lg:col-span-4">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8">Contact Stratégique</h3>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                   <div className="text-sm font-black text-white uppercase tracking-wider">El Jadida, Maroc</div>
                   <div className="text-[11px] font-bold text-slate-500">Parc d'Exposition Mohammed VI</div>
                   <div className="text-[10px] mt-1 font-black text-blue-400">1-3 AVRIL 2026</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <a href="mailto:contact@siportevent.com" className="text-sm font-bold text-slate-300 hover:text-white hover:underline transition-all">
                  contact@siportevent.com
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="h-10 w-10 shrink-0 bg-slate-500/10 border border-slate-500/20 rounded-xl flex items-center justify-center">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <span className="text-sm font-bold text-slate-300">+212 (0) 522 00 00 00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
            © {currentYear} SIPORTS GLOBAL SYMPOSIUM. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-8">
             <Link to={ROUTES.PRIVACY} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Confidentialité</Link>
             <Link to={ROUTES.TERMS} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Mentions Légales</Link>
             <Link to={ROUTES.COOKIES} className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Cookies</Link>
             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase">System Active</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
});