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
    'footer.about': '\xc0 propos de SIPORTS',
    
    // Home - Featured Exhibitors
    'home.featured_exhibitors_title': 'Exposants à la Une',
    'home.featured_exhibitors_desc': 'Découvrez les leaders de l\'industrie portuaire qui participent au salon SIPORTS 2026',
    'home.verified': 'Vérifié',
    'home.view_profile': 'Voir le Profil',
    'home.book_appointment': 'Prendre RDV',
    'home.discover_all': 'Découvrir tous les Exposants',
    
    // Home - Featured Partners
    'home.featured_partners_title': 'Partenaires à la Une',
    'home.featured_partners_desc': 'Découvrez les organisations stratégiques qui soutiennent l\'excellence du salon SIPORTS 2026',
    'home.partner_tier': 'Partenaire {tier}',
    
    // Home - Networking Section
    'home.networking_label': 'Réseautage Intelligent',
    'home.networking_title': 'Connectez-vous avec les bons partenaires',
    'home.networking_desc': 'Notre plateforme utilise l\'intelligence artificielle pour vous mettre en relation avec les professionnels les plus pertinents selon vos objectifs et votre secteur d\'activité.',
    'home.feature_matching': 'IA de Matching',
    'home.feature_matching_desc': 'Algorithme intelligent qui analyse vos objectifs et recommande les contacts les plus pertinents.',
    'home.feature_chat': 'Chat Assisté',
    'home.feature_chat_desc': 'Messagerie instantanée avec chatbot IA pour faciliter vos premiers échanges.',
    'home.feature_appointments': 'Rendez-vous Intelligents',
    'home.feature_appointments_desc': 'Planification automatique avec gestion des disponibilités et suggestions de créneaux.',
    'home.feature_global': 'Réseautage Global',
    'home.feature_global_desc': 'Connectez-vous avec des professionnels de 40 pays dans l\'écosystème portuaire.',
    'home.cta_networking': 'Commencer le Réseautage',
    'home.cta_member': 'Devenir Membre',
    'home.cta_ai': 'Découvrir l\'IA',
    'home.stats_professionals': 'Professionnels connectés',
    'home.stats_countries': 'Pays représentés',
    'home.stats_exhibitors': 'Exposants actifs',
    'home.stats_satisfaction': 'Taux de satisfaction'
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
    'footer.about': 'About SIPORTS',
    
    // Home - Featured Exhibitors
    'home.featured_exhibitors_title': 'Featured Exhibitors',
    'home.featured_exhibitors_desc': 'Discover the leaders of the port industry participating in SIPORTS 2026',
    'home.verified': 'Verified',
    'home.view_profile': 'View Profile',
    'home.book_appointment': 'Book Appointment',
    'home.discover_all': 'Discover All Exhibitors',
    
    // Home - Featured Partners
    'home.featured_partners_title': 'Featured Partners',
    'home.featured_partners_desc': 'Discover the strategic organizations supporting the excellence of SIPORTS 2026',
    'home.partner_tier': 'Partner {tier}',
    
    // Home - Networking Section
    'home.networking_label': 'Smart Networking',
    'home.networking_title': 'Connect with the right partners',
    'home.networking_desc': 'Our platform uses artificial intelligence to connect you with the most relevant professionals according to your objectives and sector of activity.',
    'home.feature_matching': 'AI Matching',
    'home.feature_matching_desc': 'Intelligent algorithm that analyzes your objectives and recommends the most relevant contacts.',
    'home.feature_chat': 'Assisted Chat',
    'home.feature_chat_desc': 'Instant messaging with AI chatbot to facilitate your first exchanges.',
    'home.feature_appointments': 'Smart Appointments',
    'home.feature_appointments_desc': 'Automatic scheduling with availability management and time slot suggestions.',
    'home.feature_global': 'Global Networking',
    'home.feature_global_desc': 'Connect with professionals from 40 countries in the port ecosystem.',
    'home.cta_networking': 'Start Networking',
    'home.cta_member': 'Become a Member',
    'home.cta_ai': 'Discover AI',
    'home.stats_professionals': 'Connected Professionals',
    'home.stats_countries': 'Countries Represented',
    'home.stats_exhibitors': 'Active Exhibitors',
    'home.stats_satisfaction': 'Satisfaction Rate'
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
    'footer.about': 'عن SIPORTS',
    
    // Home - Featured Exhibitors
    'home.featured_exhibitors_title': 'العارضون المميزون',
    'home.featured_exhibitors_desc': 'اكتشف قادة صناعة الموانئ الذين يشاركون في معرض SIPORTS 2026',
    'home.verified': 'تم التحقق',
    'home.view_profile': 'عرض الملف الشخصي',
    'home.book_appointment': 'حجز موعد',
    'home.discover_all': 'اكتشف جميع العارضين',
    
    // Home - Featured Partners
    'home.featured_partners_title': 'الشركاء المميزون',
    'home.featured_partners_desc': 'اكتشف المنظمات الاستراتيجية التي تدعم تميز معرض SIPORTS 2026',
    'home.partner_tier': 'شريك {tier}',
    
    // Home - Networking Section
    'home.networking_label': 'التواصل الذكي',
    'home.networking_title': 'تواصل مع الشركاء المناسبين',
    'home.networking_desc': 'تستخدم منصتنا الذكاء الاصطناعي لربطك مع المحترفين الأكثر ملاءمة وفقاً لأهدافك وقطاع نشاطك.',
    'home.feature_matching': 'مطابقة ذكية',
    'home.feature_matching_desc': 'خوارزمية ذكية تحلل أهدافك وتوصي بأكثر الجهات المناسبة.',
    'home.feature_chat': 'دردشة مدعومة',
    'home.feature_chat_desc': 'رسائل فورية مع روبوت ذكي لتسهيل تبادلاتك الأولى.',
    'home.feature_appointments': 'مواعيد ذكية',
    'home.feature_appointments_desc': 'جدولة تلقائية مع إدارة المتاح واقتراحات فترات زمنية.',
    'home.feature_global': 'التواصل العالمي',
    'home.feature_global_desc': 'تواصل مع المحترفين من 40 دول في النظام البيئي للموانئ.',
    'home.cta_networking': 'ابدأ التواصل',
    'home.cta_member': 'كن عضواً',
    'home.cta_ai': 'اكتشف الذكاء الاصطناعي',
    'home.stats_professionals': 'المحترفون المتصلون',
    'home.stats_countries': 'الدول الممثلة',
    'home.stats_exhibitors': 'العارضون النشطون',
    'home.stats_satisfaction': 'معدل الرضا'
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
    'footer.about': 'Acerca de SIPORTS',
    
    // Home - Featured Exhibitors
    'home.featured_exhibitors_title': 'Expositores Destacados',
    'home.featured_exhibitors_desc': 'Descubre los líderes de la industria portuaria que participan en SIPORTS 2026',
    'home.verified': 'Verificado',
    'home.view_profile': 'Ver Perfil',
    'home.book_appointment': 'Reservar Cita',
    'home.discover_all': 'Descubrir Todos los Expositores',
    
    // Home - Featured Partners
    'home.featured_partners_title': 'Socios Destacados',
    'home.featured_partners_desc': 'Descubre las organizaciones estratégicas que apoyan la excelencia de SIPORTS 2026',
    'home.partner_tier': 'Socio {tier}',
    
    // Home - Networking Section
    'home.networking_label': 'Redes Inteligentes',
    'home.networking_title': 'Conéctate con los socios adecuados',
    'home.networking_desc': 'Nuestra plataforma utiliza inteligencia artificial para conectarte con los profesionales más relevantes según tus objetivos y sector de actividad.',
    'home.feature_matching': 'Emparejamiento IA',
    'home.feature_matching_desc': 'Algoritmo inteligente que analiza tus objetivos y recomienda los contactos más pertinentes.',
    'home.feature_chat': 'Chat Asistido',
    'home.feature_chat_desc': 'Mensajería instantánea con chatbot IA para facilitar tus primeros intercambios.',
    'home.feature_appointments': 'Citas Inteligentes',
    'home.feature_appointments_desc': 'Programación automática con gestión de disponibilidad y sugerencias de horarios.',
    'home.feature_global': 'Redes Globales',
    'home.feature_global_desc': 'Conéctate con profesionales de 40 países en el ecosistema portuario.',
    'home.cta_networking': 'Comenzar Redes',
    'home.cta_member': 'Convertirse en Miembro',
    'home.cta_ai': 'Descubre la IA',
    'home.stats_professionals': 'Profesionales Conectados',
    'home.stats_countries': 'Países Representados',
    'home.stats_exhibitors': 'Expositores Activos',
    'home.stats_satisfaction': 'Tasa de Satisfacción'
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