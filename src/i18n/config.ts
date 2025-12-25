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
      },
      partner: {
        back_to_dashboard: 'Retour au tableau de bord',
        priority: 'Prioritaire',
        details: 'Détails',
        status: {
          upcoming: 'À venir',
          draft: 'Brouillon'
        },
        events: {
          title: 'Événements Sponsorisés',
          subtitle: 'Gérez vos événements partenaires et suivez leur impact',
          program: 'Programme Événements Partenaires',
          available: 'Événements disponibles',
          loading: 'Chargement des événements...',
          none: 'Aucun événement disponible pour le moment.',
          registered: 'inscrits',
          capacity: 'Capacité'
        },
        leads: {
          title: 'Leads & Prospects',
          subtitle: 'Gérez vos leads qualifiés et suivez leur progression dans le pipeline commercial',
          premium_program: 'Programme Leads Premium',
          conversion_rate: '12% Taux de Conversion',
          generated: 'Leads générés',
          qualified: 'Leads qualifiés',
          conversion: 'Taux de conversion',
          estimated_value: 'Valeur estimée',
          recent: 'Leads Récents',
          exhibitor: 'Exposant',
          visitor: 'Visiteur',
          other: 'Autre',
          connected: 'Connecté',
          pending: 'En attente',
          rejected: 'Rejeté',
          active_followup: 'Suivi actif',
          awaiting_response: 'En attente de réponse',
          sources: {
            events: 'Événements SIPORTS',
            networking: 'Networking Partenaires',
            referrals: 'Références Clients',
            marketing: 'Campagnes Marketing'
          },
          funnel: {
            generated: 'Leads Générés',
            qualified: 'Qualifiés',
            proposal: 'Proposition',
            negotiation: 'Négociation',
            conversion: 'Conversion'
          },
          tips: {
            title: 'Conseils de Gestion des Leads',
            qualification: 'Qualification Rapide',
            qualification_desc: 'Contactez les leads chauds dans les 24h pour maximiser vos chances de conversion',
            followup: 'Suivi Régulier',
            followup_desc: "Planifiez des points de suivi hebdomadaires pour maintenir l'engagement",
            personalization: 'Personnalisation',
            personalization_desc: 'Adaptez vos propositions aux besoins spécifiques de chaque prospect',
            measure: 'Mesure des Résultats',
            measure_desc: 'Analysez régulièrement vos taux de conversion pour optimiser votre approche'
          }
        },
        activity: {
          title: 'Activité Partenaire',
          subtitle: 'Suivez toutes vos interactions et engagements SIPORTS',
          full_history: 'Historique Complet des Activités',
          realtime: 'Temps Réel',
          history: 'Historique des Activités',
          no_activity: 'Aucune activité trouvée',
          try_filters: 'Essayez de modifier vos filtres de recherche',
          just_now: "À l'instant",
          hours_ago: 'Il y a {{count}}h',
          days_ago: 'Il y a {{count}}j',
          stats: {
            total: 'Activités totales',
            today: "Aujourd'hui",
            this_week: 'Cette semaine'
          },
          filter: {
            all: 'Toutes les activités',
            networking: 'Réseautage',
            communication: 'Communication',
            events: 'Événements',
            sponsorship: 'Sponsoring',
            engagement: 'Engagement',
            content: 'Contenu',
            meetings: 'Rendez-vous',
            system: 'Système'
          },
          type: {
            connection: 'Connexion',
            message: 'Message',
            event: 'Événement',
            sponsorship: 'Sponsoring',
            consultation: 'Consultation',
            content: 'Contenu',
            alert: 'Alerte',
            meeting: 'Rendez-vous'
          },
          connection_established: 'Nouvelle connexion établie',
          connected_with: 'Vous êtes maintenant connecté avec Port Solutions Inc.',
          new_message: 'Nouveau message reçu',
          message_from: 'TechMarine Solutions vous a envoyé un message',
          event_participation: 'Participation à un événement',
          participated_in: 'Vous avez participé à la conférence "Digital Transformation in Ports"',
          sponsoring_activated: 'Sponsoring activé',
          logo_displayed: "Votre logo est maintenant affiché sur la page d'accueil",
          profile_viewed: 'Profil consulté',
          views_today: "Votre profil a été consulté 15 fois aujourd'hui",
          content_shared: 'Contenu partagé',
          article_shared: 'Votre article "Innovation in Maritime Technology" a été partagé',
          system_alert: 'Alerte système',
          metrics_update: 'Mise à jour de vos métriques de performance disponible',
          meeting_scheduled: 'Rendez-vous programmé',
          meeting_confirmed: 'RDV confirmé avec LogiFlow Systems demain à 14h'
        },
        calendar: {
          title: 'Calendrier des Rendez-vous',
          create_slot: 'Nouveau Créneau',
          slot_date_restriction: 'Les créneaux doivent être créés entre le 1er et le 3 avril 2026',
          date_outside_salon: 'La date doit être comprise entre le 1er et le 3 avril 2026'
        }
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
      },
      partner: {
        back_to_dashboard: 'Back to dashboard',
        priority: 'Priority',
        details: 'Details',
        status: {
          upcoming: 'Upcoming',
          draft: 'Draft'
        },
        events: {
          title: 'Sponsored Events',
          subtitle: 'Manage your partner events and track their impact',
          program: 'Partner Events Program',
          available: 'Available events',
          loading: 'Loading events...',
          none: 'No events available at the moment.',
          registered: 'registered',
          capacity: 'Capacity'
        },
        leads: {
          title: 'Leads & Prospects',
          subtitle: 'Manage your qualified leads and track their progress through the sales pipeline',
          premium_program: 'Premium Leads Program',
          conversion_rate: '12% Conversion Rate',
          generated: 'Generated leads',
          qualified: 'Qualified leads',
          conversion: 'Conversion rate',
          estimated_value: 'Estimated value',
          recent: 'Recent Leads',
          exhibitor: 'Exhibitor',
          visitor: 'Visitor',
          other: 'Other',
          connected: 'Connected',
          pending: 'Pending',
          rejected: 'Rejected',
          active_followup: 'Active follow-up',
          awaiting_response: 'Awaiting response'
        },
        activity: {
          title: 'Partner Activity',
          subtitle: 'Track all your interactions and engagements at SIPORTS',
          full_history: 'Complete Activity History',
          realtime: 'Real-Time',
          history: 'Activity History',
          no_activity: 'No activity found',
          try_filters: 'Try adjusting your search filters'
        },
        calendar: {
          title: 'Appointment Calendar',
          create_slot: 'New Slot',
          slot_date_restriction: 'Slots must be created between April 1-3, 2026',
          date_outside_salon: 'Date must be between April 1-3, 2026'
        }
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
