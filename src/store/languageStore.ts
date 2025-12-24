import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n/config';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
}

export const supportedLanguages: Language[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    rtl: false
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇲🇦',
    rtl: true
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false
  }
];

interface LanguageState {
  currentLanguage: string;
  isLoading: boolean;
  
  // Actions
  setLanguage: (languageCode: string) => Promise<void>;
  getCurrentLanguage: () => Language;
  getAvailableLanguages: () => Language[];
  translateText: (key: string, fallback?: string) => string;
}

// Dictionnaire de traductions
const translations: Record<string, Record<string, string>> = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.exhibitors': 'Exposants',
    'nav.partners': 'Partenaires',
    'nav.networking': 'Réseautage',
    'nav.information': 'Informations',
    'nav.pavilions': 'Pavillons',
    'nav.events': 'Événements',
    'nav.news': 'Actualités',
    'nav.login': 'Connexion',
    'nav.register': 'Inscription',
    'nav.logout': 'Déconnexion',
    
    // Hero Section
    'hero.title': 'Salon International des Ports',
    'hero.subtitle': 'La plateforme de référence pour l\'écosystème portuaire mondial. Connectez-vous avec plus de 6 000 professionnels de 40 pays et découvrez les innovations qui façonnent l\'avenir des ports.',
    'hero.cta.exhibitor': 'Devenir Exposant',
    'hero.cta.discover': 'Découvrir les Exposants',
    'hero.countdown.title': 'Ouverture dans :',
    'hero.countdown.subtitle': 'Le plus grand salon portuaire international',
    'hero.stats.location': 'El Jadida, Maroc',
    'hero.stats.participants': 'Participants',
    'hero.stats.exhibitors': 'Exposants',
    
    // Time units
    'time.day': 'Jour',
    'time.days': 'Jours',
    'time.hour': 'Heure',
    'time.hours': 'Heures',
    'time.minute': 'Minute',
    'time.minutes': 'Minutes',
    'time.second': 'Seconde',
    'time.seconds': 'Secondes',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.contact': 'Contact',
    'common.download': 'Télécharger',
    'common.share': 'Partager',
    
    // Menu descriptions
    'menu.pavilions_desc': 'Espaces thématiques',
    'menu.events_desc': 'Conférences & ateliers',
    'menu.news_desc': 'Nouvelles du secteur',
    'menu.subscriptions_desc': 'Offres & tarifs',
    
    // Footer
    'footer.copyright': '© {year} SIPORTS. Tous droits réservés.',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.cookies': 'Cookies',
    'footer.contact': 'Nous contacter',
    'footer.about': '\xc0 propos de SIPORTS'
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.exhibitors': 'Exhibitors',
    'nav.partners': 'Partners',
    'nav.networking': 'Networking',
    'nav.information': 'Information',
    'nav.pavilions': 'Pavilions',
    'nav.events': 'Events',
    'nav.news': 'News',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Hero Section
    'hero.title': 'International Ports Exhibition',
    'hero.subtitle': 'The reference platform for the global port ecosystem. Connect with over 6,000 professionals from 40 countries and discover the innovations shaping the future of ports.',
    'hero.cta.exhibitor': 'Become Exhibitor',
    'hero.cta.discover': 'Discover Exhibitors',
    'hero.countdown.title': 'Opening in:',
    'hero.countdown.subtitle': 'The largest international port exhibition',
    'hero.stats.location': 'El Jadida, Morocco',
    'hero.stats.participants': 'Participants',
    'hero.stats.exhibitors': 'Exhibitors',
    
    // Time units
    'time.day': 'Day',
    'time.days': 'Days',
    'time.hour': 'Hour',
    'time.hours': 'Hours',
    'time.minute': 'Minute',
    'time.minutes': 'Minutes',
    'time.second': 'Second',
    'time.seconds': 'Seconds',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.contact': 'Contact',
    'common.download': 'Download',
    'common.share': 'Share',
    
    // Menu descriptions
    'menu.pavilions_desc': 'Thematic spaces',
    'menu.events_desc': 'Conferences & workshops',
    'menu.news_desc': 'Industry news',
    'menu.subscriptions_desc': 'Offers & rates',
    
    // Footer
    'footer.copyright': '\u00a9 {year} SIPORTS. All rights reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.cookies': 'Cookies',
    'footer.contact': 'Contact Us',
    'footer.about': 'About SIPORTS'
  },
  
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.exhibitors': 'العارضون',
    'nav.partners': 'الشركاء',
    'nav.networking': 'التواصل',
    'nav.information': 'المعلومات',
    'nav.pavilions': 'الأجنحة',
    'nav.events': 'الفعاليات',
    'nav.news': 'الأخبار',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'التسجيل',
    'nav.logout': 'تسجيل الخروج',
    
    // Hero Section
    'hero.title': 'المعرض الدولي للموانئ',
    'hero.subtitle': 'المنصة المرجعية للنظام البيئي العالمي للموانئ. تواصل مع أكثر من 6000 محترف من 40 دولة واكتشف الابتكارات التي تشكل مستقبل الموانئ.',
    'hero.cta.exhibitor': 'كن عارضاً',
    'hero.cta.discover': 'اكتشف العارضين',
    'hero.countdown.title': 'الافتتاح خلال:',
    'hero.countdown.subtitle': 'أكبر معرض دولي للموانئ',
    'hero.stats.location': 'الجديدة، المغرب',
    'hero.stats.participants': 'المشاركون',
    'hero.stats.exhibitors': 'العارضون',
    
    // Time units
    'time.day': 'يوم',
    'time.days': 'أيام',
    'time.hour': 'ساعة',
    'time.hours': 'ساعات',
    'time.minute': 'دقيقة',
    'time.minutes': 'دقائق',
    'time.second': 'ثانية',
    'time.seconds': 'ثوان',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.contact': 'اتصال',
    'common.download': 'تحميل',
    'common.share': 'مشاركة',
    
    // Menu descriptions
    'menu.pavilions_desc': 'المساحات الموضوعية',
    'menu.events_desc': 'المؤتمرات والورش',
    'menu.news_desc': 'أخبار الصناعة',
    'menu.subscriptions_desc': 'العروض والأسعار',
    
    // Footer
    'footer.copyright': '© {year} SIPORTS. جميع الحقوق محفوظة.',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الاستخدام',
    'footer.cookies': 'ملفات تعريف الارتباط',
    'footer.contact': 'اتصل بنا',
    'footer.about': 'عن SIPORTS'
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.exhibitors': 'Expositores',
    'nav.partners': 'Socios',
    'nav.networking': 'Networking',
    'nav.information': 'Información',
    'nav.pavilions': 'Pabellones',
    'nav.events': 'Eventos',
    'nav.news': 'Noticias',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    
    // Hero Section
    'hero.title': 'Salón Internacional de Puertos',
    'hero.subtitle': 'La plataforma de referencia para el ecosistema portuario mundial. Conéctate con más de 6,000 profesionales de 40 países y descubre las innovaciones que dan forma al futuro de los puertos.',
    'hero.cta.exhibitor': 'Ser Expositor',
    'hero.cta.discover': 'Descubrir Expositores',
    'hero.countdown.title': 'Apertura en:',
    'hero.countdown.subtitle': 'La mayor exposición portuaria internacional',
    'hero.stats.location': 'El Jadida, Marruecos',
    'hero.stats.participants': 'Participantes',
    'hero.stats.exhibitors': 'Expositores',
    
    // Time units
    'time.day': 'Día',
    'time.days': 'Días',
    'time.hour': 'Hora',
    'time.hours': 'Horas',
    'time.minute': 'Minuto',
    'time.minutes': 'Minutos',
    'time.second': 'Segundo',
    'time.seconds': 'Segundos',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.view': 'Ver',
    'common.contact': 'Contacto',
    'common.download': 'Descargar',
    'common.share': 'Compartir',
    
    // Menu descriptions
    'menu.pavilions_desc': 'Espacios temáticos',
    'menu.events_desc': 'Conferencias y talleres',
    'menu.news_desc': 'Noticias de la industria',
    'menu.subscriptions_desc': 'Ofertas y tarifas',
    
    // Footer
    'footer.copyright': '© {year} SIPORTS. Todos los derechos reservados.',
    'footer.privacy': 'Política de privacidad',
    'footer.terms': 'Términos de uso',
    'footer.cookies': 'Cookies',
    'footer.contact': 'Contáctenos',
    'footer.about': 'Acerca de SIPORTS'
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',
      isLoading: false,

      setLanguage: async (languageCode: string) => {
        console.log('🌍 setLanguage appelé avec:', languageCode);
        set({ isLoading: true });

        try {
          // Vérifier que la langue est supportée
          const language = supportedLanguages.find(lang => lang.code === languageCode);
          if (!language) {
            throw new Error(`Langue non supportée: ${languageCode}`);
          }

          console.log('🌍 Langue trouvée:', language.nativeName);

          // Synchroniser avec i18next
          try {
            await i18n.changeLanguage(languageCode);
            console.log('🌍 i18next mis à jour');
          } catch (i18nError) {
            console.warn('⚠️ i18next changeLanguage failed (non-blocking):', i18nError);
          }

          // Mettre à jour la direction du texte pour l'arabe
          document.documentElement.dir = language.rtl ? 'rtl' : 'ltr';
          document.documentElement.lang = languageCode;
          
          // Mettre à jour le titre de la page
          const titleKey = 'hero.title';
          const translatedTitle = translations[languageCode]?.[titleKey] || translations.fr[titleKey] || 'SIPORTS';
          document.title = `${translatedTitle} - SIPORTS 2026`;

          // IMPORTANT: Mettre à jour l'état en dernier pour déclencher le re-render
          set({ currentLanguage: languageCode, isLoading: false });
          console.log('✅ Langue changée avec succès vers:', languageCode);
          
        } catch (_error) {
          console.error('❌ Erreur lors du changement de langue:', _error);
          set({ isLoading: false });
          throw _error;
        }
      },

      getCurrentLanguage: () => {
        const { currentLanguage } = get();
        return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
      },

      getAvailableLanguages: () => {
        return supportedLanguages;
      },

      translateText: (key: string, fallback?: string) => {
        const { currentLanguage } = get();
        const languageTranslations = translations[currentLanguage] || translations.fr;
        return languageTranslations[key] || fallback || key;
      }
    }),
    {
      name: 'siports-language-storage',
      partialize: (state) => ({ currentLanguage: state.currentLanguage })
    }
  )
);