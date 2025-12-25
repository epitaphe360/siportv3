import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        dashboard: 'Tableau de bord',
        exhibitors: 'Exposants',
        partners: 'Partenaires',
        pavilions: 'Pavillons',
        information: 'Informations',
        events: 'Événements',
        news: 'Actualités',
        subscriptions: 'Abonnements',
        appointments: 'Rendez-vous',
        chat: 'Messagerie',
        networking: 'Networking',
        profile: 'Mon Profil'
      },
      menu: {
        pavilions_desc: 'Découvrez les pavillons du salon',
        events_desc: 'Calendrier des événements',
        news_desc: 'Actualités et nouveautés',
        subscriptions_desc: 'Gérez vos abonnements'
      },
      exhibitor_levels: {
        basic_9: '9m² Basic',
        standard_18: '18m² Standard',
        premium_36: '36m² Premium',
        elite_54plus: '54m²+ Elite'
      },
      auth: {
        login: 'Connexion',
        register: 'Inscription',
        logout: 'Déconnexion',
        email: 'Email',
        password: 'Mot de passe',
        remember_me: 'Se souvenir de moi',
        forgot_password: 'Mot de passe oublié?'
      },
      appointments: {
        book: 'Réserver',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        quota_reached: 'Quota atteint ({{current}}/{{max}})',
        booking_success: 'Rendez-vous réservé avec succès',
        no_slots: 'Aucun créneau disponible'
      },
      common: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        search: 'Rechercher'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        dashboard: 'Dashboard',
        exhibitors: 'Exhibitors',
        partners: 'Partners',
        pavilions: 'Pavilions',
        information: 'Information',
        events: 'Events',
        news: 'News',
        subscriptions: 'Subscriptions',
        appointments: 'Appointments',
        chat: 'Messages',
        networking: 'Networking',
        profile: 'My Profile'
      },
      menu: {
        pavilions_desc: 'Discover the show pavilions',
        events_desc: 'Calendar of events',
        news_desc: 'News and updates',
        subscriptions_desc: 'Manage your subscriptions'
      },
      exhibitor_levels: {
        basic_9: '9m² Basic',
        standard_18: '18m² Standard',
        premium_36: '36m² Premium',
        elite_54plus: '54m²+ Elite'
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        remember_me: 'Remember me',
        forgot_password: 'Forgot password?'
      },
      appointments: {
        book: 'Book',
        cancel: 'Cancel',
        confirm: 'Confirm',
        quota_reached: 'Quota reached ({{current}}/{{max}})',
        booking_success: 'Appointment booked successfully',
        no_slots: 'No slots available'
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search'
      }
    }
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        dashboard: 'Panel de control',
        exhibitors: 'Expositores',
        partners: 'Socios',
        pavilions: 'Pabellones',
        information: 'Información',
        events: 'Eventos',
        news: 'Noticias',
        subscriptions: 'Suscripciones',
        appointments: 'Citas',
        chat: 'Mensajes',
        networking: 'Networking',
        profile: 'Mi Perfil'
      },
      menu: {
        pavilions_desc: 'Descubre los pabellones de la feria',
        events_desc: 'Calendario de eventos',
        news_desc: 'Noticias y actualizaciones',
        subscriptions_desc: 'Gestiona tus suscripciones'
      },
      exhibitor_levels: {
        basic_9: '9m² Básico',
        standard_18: '18m² Estándar',
        premium_36: '36m² Premium',
        elite_54plus: '54m²+ Elite'
      },
      auth: {
        login: 'Iniciar sesión',
        register: 'Registrarse',
        logout: 'Cerrar sesión',
        email: 'Correo electrónico',
        password: 'Contraseña',
        remember_me: 'Recuérdame',
        forgot_password: '¿Olvidaste tu contraseña?'
      },
      appointments: {
        book: 'Reservar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        quota_reached: 'Cuota alcanzada ({{current}}/{{max}})',
        booking_success: 'Cita reservada con éxito',
        no_slots: 'No hay espacios disponibles'
      },
      common: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        search: 'Buscar'
      }
    }
  },
  ar: {
    translation: {
      nav: {
        home: 'الرئيسية',
        dashboard: 'لوحة التحكم',
        exhibitors: 'العارضون',
        partners: 'الشركاء',
        pavilions: 'الأجنحة',
        information: 'المعلومات',
        events: 'الفعاليات',
        news: 'الأخبار',
        subscriptions: 'الاشتراكات',
        appointments: 'المواعيد',
        chat: 'الرسائل',
        networking: 'التواصل',
        profile: 'ملفي الشخصي'
      },
      menu: {
        pavilions_desc: 'اكتشف أجنحة المعرض',
        events_desc: 'تقويم الفعاليات',
        news_desc: 'الأخبار والتحديثات',
        subscriptions_desc: 'إدارة اشتراكاتك'
      },
      exhibitor_levels: {
        basic_9: 'أساسي 9م²',
        standard_18: 'معياري 18م²',
        premium_36: 'متميز 36م²',
        elite_54plus: 'نخبة 54م²+'
      },
      auth: {
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        logout: 'تسجيل الخروج',
        email: 'البريد الإلكتروني',
        password: 'كلمة المرور',
        remember_me: 'تذكرني',
        forgot_password: 'هل نسيت كلمة المرور؟'
      },
      appointments: {
        book: 'احجز',
        cancel: 'إلغاء',
        confirm: 'تأكيد',
        quota_reached: 'تم الوصول للحد الأقصى ({{current}}/{{max}})',
        booking_success: 'تم حجز الموعد بنجاح',
        no_slots: 'لا توجد فترات زمنية متاحة'
      },
      common: {
        loading: 'جاري التحميل...',
        error: 'خطأ',
        success: 'نجح',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        search: 'بحث'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'es', 'ar'],

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;
