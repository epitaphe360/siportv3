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
        search: 'Rechercher',
        view: 'Voir',
        download: 'Télécharger',
        upload: 'Upload',
        close: 'Fermer',
        confirm: 'Confirmer',
        back: 'Retour',
        next: 'Suivant',
        previous: 'Précédent',
        filter: 'Filtrer',
        export: 'Exporter',
        import: 'Importer',
        refresh: 'Actualiser'
      },
      dashboard: {
        title: 'Tableau de bord',
        welcome: 'Bienvenue',
        overview: 'Vue d\'ensemble',
        statistics: 'Statistiques',
        recent_activity: 'Activité récente',
        quick_actions: 'Actions rapides',
        notifications: 'Notifications',
        settings: 'Paramètres',
        logout: 'Déconnexion'
      },
      admin: {
        title: 'Administration',
        users: 'Utilisateurs',
        moderation: 'Modération',
        analytics: 'Analytics',
        reports: 'Rapports',
        settings: 'Paramètres',
        logs: 'Journaux',
        payments: 'Paiements',
        content: 'Contenus',
        total_users: 'Total utilisateurs',
        active_users: 'Utilisateurs actifs',
        revenue: 'Revenus',
        growth: 'Croissance'
      },
      exhibitor: {
        title: 'Espace Exposant',
        dashboard: 'Tableau de bord',
        products: 'Mes produits',
        appointments: 'Rendez-vous',
        minisite: 'Mon mini-site',
        analytics: 'Mes statistiques',
        leads: 'Mes leads',
        messages: 'Messages',
        calendar: 'Calendrier',
        profile: 'Mon profil',
        subscription: 'Mon abonnement'
      },
      visitor: {
        title: 'Espace Visiteur',
        dashboard: 'Tableau de bord',
        exhibitors: 'Exposants',
        events: 'Événements',
        appointments: 'Mes rendez-vous',
        favorites: 'Mes favoris',
        networking: 'Networking',
        badge: 'Mon badge',
        subscription: 'Abonnement Premium',
        level: 'Niveau',
        upgrade: 'Passer Premium'
      },
      media: {
        title: 'Médiathèque',
        webinars: 'Webinaires',
        podcasts: 'Podcasts',
        videos: 'Vidéos',
        live: 'En direct',
        capsules: 'Capsules Inside',
        testimonials: 'Témoignages',
        categories: 'Catégories',
        trending: 'Tendances',
        latest: 'Nouveautés',
        watch: 'Regarder',
        listen: 'Écouter',
        share: 'Partager',
        like: 'J\'aime',
        views: 'vues',
        duration: 'Durée'
      },
      notifications: {
        title: 'Notifications',
        mark_all_read: 'Tout marquer comme lu',
        no_notifications: 'Aucune notification',
        new: 'Nouveau',
        unread: 'Non lu',
        settings: 'Paramètres de notification',
        email_notifications: 'Notifications par email',
        push_notifications: 'Notifications push',
        sms_notifications: 'Notifications SMS',
        preferences: 'Préférences'
      },
      security: {
        title: 'Sécurité',
        two_factor: 'Authentification à deux facteurs',
        enable_2fa: 'Activer 2FA',
        disable_2fa: 'Désactiver 2FA',
        totp: 'Application d\'authentification',
        sms: 'SMS',
        email: 'Email',
        backup_codes: 'Codes de secours',
        password: 'Mot de passe',
        change_password: 'Changer le mot de passe',
        sessions: 'Sessions actives',
        api_keys: 'Clés API',
        audit_logs: 'Journaux d\'audit'
      },
      analytics: {
        title: 'Analytics',
        overview: 'Vue d\'ensemble',
        visitors: 'Visiteurs',
        pageviews: 'Pages vues',
        conversions: 'Conversions',
        revenue: 'Revenus',
        export: 'Exporter',
        period: 'Période',
        today: 'Aujourd\'hui',
        week: 'Cette semaine',
        month: 'Ce mois',
        year: 'Cette année',
        custom: 'Personnalisé'
      },
      payments: {
        title: 'Paiements',
        methods: 'Méthodes de paiement',
        history: 'Historique',
        invoices: 'Factures',
        refunds: 'Remboursements',
        pending: 'En attente',
        completed: 'Complété',
        failed: 'Échoué',
        amount: 'Montant',
        date: 'Date',
        status: 'Statut',
        download_invoice: 'Télécharger la facture'
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
        search: 'Search',
        view: 'View',
        download: 'Download',
        upload: 'Upload',
        close: 'Close',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        refresh: 'Refresh'
      },
      dashboard: {
        title: 'Dashboard',
        welcome: 'Welcome',
        overview: 'Overview',
        statistics: 'Statistics',
        recent_activity: 'Recent Activity',
        quick_actions: 'Quick Actions',
        notifications: 'Notifications',
        settings: 'Settings',
        logout: 'Logout'
      },
      admin: {
        title: 'Administration',
        users: 'Users',
        moderation: 'Moderation',
        analytics: 'Analytics',
        reports: 'Reports',
        settings: 'Settings',
        logs: 'Logs',
        payments: 'Payments',
        content: 'Content',
        total_users: 'Total Users',
        active_users: 'Active Users',
        revenue: 'Revenue',
        growth: 'Growth'
      },
      exhibitor: {
        title: 'Exhibitor Space',
        dashboard: 'Dashboard',
        products: 'My Products',
        appointments: 'Appointments',
        minisite: 'My Minisite',
        analytics: 'My Analytics',
        leads: 'My Leads',
        messages: 'Messages',
        calendar: 'Calendar',
        profile: 'My Profile',
        subscription: 'My Subscription'
      },
      visitor: {
        title: 'Visitor Space',
        dashboard: 'Dashboard',
        exhibitors: 'Exhibitors',
        events: 'Events',
        appointments: 'My Appointments',
        favorites: 'My Favorites',
        networking: 'Networking',
        badge: 'My Badge',
        subscription: 'Premium Subscription',
        level: 'Level',
        upgrade: 'Upgrade to Premium'
      },
      media: {
        title: 'Media Library',
        webinars: 'Webinars',
        podcasts: 'Podcasts',
        videos: 'Videos',
        live: 'Live',
        capsules: 'Inside Capsules',
        testimonials: 'Testimonials',
        categories: 'Categories',
        trending: 'Trending',
        latest: 'Latest',
        watch: 'Watch',
        listen: 'Listen',
        share: 'Share',
        like: 'Like',
        views: 'views',
        duration: 'Duration'
      },
      notifications: {
        title: 'Notifications',
        mark_all_read: 'Mark all as read',
        no_notifications: 'No notifications',
        new: 'New',
        unread: 'Unread',
        settings: 'Notification Settings',
        email_notifications: 'Email Notifications',
        push_notifications: 'Push Notifications',
        sms_notifications: 'SMS Notifications',
        preferences: 'Preferences'
      },
      security: {
        title: 'Security',
        two_factor: 'Two-Factor Authentication',
        enable_2fa: 'Enable 2FA',
        disable_2fa: 'Disable 2FA',
        totp: 'Authenticator App',
        sms: 'SMS',
        email: 'Email',
        backup_codes: 'Backup Codes',
        password: 'Password',
        change_password: 'Change Password',
        sessions: 'Active Sessions',
        api_keys: 'API Keys',
        audit_logs: 'Audit Logs'
      },
      analytics: {
        title: 'Analytics',
        overview: 'Overview',
        visitors: 'Visitors',
        pageviews: 'Page Views',
        conversions: 'Conversions',
        revenue: 'Revenue',
        export: 'Export',
        period: 'Period',
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year',
        custom: 'Custom'
      },
      payments: {
        title: 'Payments',
        methods: 'Payment Methods',
        history: 'History',
        invoices: 'Invoices',
        refunds: 'Refunds',
        pending: 'Pending',
        completed: 'Completed',
        failed: 'Failed',
        amount: 'Amount',
        date: 'Date',
        status: 'Status',
        download_invoice: 'Download Invoice'
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
        search: 'Buscar',
        view: 'Ver',
        download: 'Descargar',
        upload: 'Subir',
        close: 'Cerrar',
        confirm: 'Confirmar',
        back: 'Volver',
        next: 'Siguiente',
        previous: 'Anterior',
        filter: 'Filtrar',
        export: 'Exportar',
        import: 'Importar',
        refresh: 'Actualizar'
      },
      dashboard: {
        title: 'Panel de Control',
        welcome: 'Bienvenido',
        overview: 'Resumen',
        statistics: 'Estadísticas',
        recent_activity: 'Actividad Reciente',
        quick_actions: 'Acciones Rápidas',
        notifications: 'Notificaciones',
        settings: 'Configuración',
        logout: 'Cerrar Sesión'
      },
      admin: {
        title: 'Administración',
        users: 'Usuarios',
        moderation: 'Moderación',
        analytics: 'Analíticas',
        reports: 'Informes',
        settings: 'Configuración',
        logs: 'Registros',
        payments: 'Pagos',
        content: 'Contenido',
        total_users: 'Total Usuarios',
        active_users: 'Usuarios Activos',
        revenue: 'Ingresos',
        growth: 'Crecimiento'
      },
      exhibitor: {
        title: 'Espacio Expositor',
        dashboard: 'Panel de Control',
        products: 'Mis Productos',
        appointments: 'Citas',
        minisite: 'Mi Minisite',
        analytics: 'Mis Estadísticas',
        leads: 'Mis Leads',
        messages: 'Mensajes',
        calendar: 'Calendario',
        profile: 'Mi Perfil',
        subscription: 'Mi Suscripción'
      },
      visitor: {
        title: 'Espacio Visitante',
        dashboard: 'Panel de Control',
        exhibitors: 'Expositores',
        events: 'Eventos',
        appointments: 'Mis Citas',
        favorites: 'Mis Favoritos',
        networking: 'Networking',
        badge: 'Mi Credencial',
        subscription: 'Suscripción Premium',
        level: 'Nivel',
        upgrade: 'Actualizar a Premium'
      },
      media: {
        title: 'Mediateca',
        webinars: 'Webinars',
        podcasts: 'Podcasts',
        videos: 'Videos',
        live: 'En Vivo',
        capsules: 'Cápsulas Inside',
        testimonials: 'Testimonios',
        categories: 'Categorías',
        trending: 'Tendencias',
        latest: 'Últimas',
        watch: 'Ver',
        listen: 'Escuchar',
        share: 'Compartir',
        like: 'Me Gusta',
        views: 'vistas',
        duration: 'Duración'
      },
      notifications: {
        title: 'Notificaciones',
        mark_all_read: 'Marcar todas como leídas',
        no_notifications: 'Sin notificaciones',
        new: 'Nuevo',
        unread: 'No leído',
        settings: 'Configuración de Notificaciones',
        email_notifications: 'Notificaciones por Email',
        push_notifications: 'Notificaciones Push',
        sms_notifications: 'Notificaciones SMS',
        preferences: 'Preferencias'
      },
      security: {
        title: 'Seguridad',
        two_factor: 'Autenticación de Dos Factores',
        enable_2fa: 'Activar 2FA',
        disable_2fa: 'Desactivar 2FA',
        totp: 'Aplicación de Autenticación',
        sms: 'SMS',
        email: 'Email',
        backup_codes: 'Códigos de Respaldo',
        password: 'Contraseña',
        change_password: 'Cambiar Contraseña',
        sessions: 'Sesiones Activas',
        api_keys: 'Claves API',
        audit_logs: 'Registros de Auditoría'
      },
      analytics: {
        title: 'Analíticas',
        overview: 'Resumen',
        visitors: 'Visitantes',
        pageviews: 'Páginas Vistas',
        conversions: 'Conversiones',
        revenue: 'Ingresos',
        export: 'Exportar',
        period: 'Período',
        today: 'Hoy',
        week: 'Esta Semana',
        month: 'Este Mes',
        year: 'Este Año',
        custom: 'Personalizado'
      },
      payments: {
        title: 'Pagos',
        methods: 'Métodos de Pago',
        history: 'Historial',
        invoices: 'Facturas',
        refunds: 'Reembolsos',
        pending: 'Pendiente',
        completed: 'Completado',
        failed: 'Fallido',
        amount: 'Cantidad',
        date: 'Fecha',
        status: 'Estado',
        download_invoice: 'Descargar Factura'
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
        search: 'بحث',
        view: 'عرض',
        download: 'تحميل',
        upload: 'رفع',
        close: 'إغلاق',
        confirm: 'تأكيد',
        back: 'رجوع',
        next: 'التالي',
        previous: 'السابق',
        filter: 'تصفية',
        export: 'تصدير',
        import: 'استيراد',
        refresh: 'تحديث'
      },
      dashboard: {
        title: 'لوحة التحكم',
        welcome: 'مرحباً',
        overview: 'نظرة عامة',
        statistics: 'الإحصائيات',
        recent_activity: 'النشاط الأخير',
        quick_actions: 'إجراءات سريعة',
        notifications: 'الإشعارات',
        settings: 'الإعدادات',
        logout: 'تسجيل الخروج'
      },
      admin: {
        title: 'الإدارة',
        users: 'المستخدمون',
        moderation: 'الإشراف',
        analytics: 'التحليلات',
        reports: 'التقارير',
        settings: 'الإعدادات',
        logs: 'السجلات',
        payments: 'المدفوعات',
        content: 'المحتوى',
        total_users: 'إجمالي المستخدمين',
        active_users: 'المستخدمون النشطون',
        revenue: 'الإيرادات',
        growth: 'النمو'
      },
      exhibitor: {
        title: 'مساحة العارض',
        dashboard: 'لوحة التحكم',
        products: 'منتجاتي',
        appointments: 'المواعيد',
        minisite: 'موقعي المصغر',
        analytics: 'إحصائياتي',
        leads: 'عملائي المحتملون',
        messages: 'الرسائل',
        calendar: 'التقويم',
        profile: 'ملفي الشخصي',
        subscription: 'اشتراكي'
      },
      visitor: {
        title: 'مساحة الزائر',
        dashboard: 'لوحة التحكم',
        exhibitors: 'العارضون',
        events: 'الفعاليات',
        appointments: 'مواعيدي',
        favorites: 'مفضلاتي',
        networking: 'التواصل',
        badge: 'شارتي',
        subscription: 'الاشتراك المميز',
        level: 'المستوى',
        upgrade: 'الترقية إلى مميز'
      },
      media: {
        title: 'مكتبة الوسائط',
        webinars: 'الندوات عبر الإنترنت',
        podcasts: 'البودكاست',
        videos: 'الفيديوهات',
        live: 'البث المباشر',
        capsules: 'كبسولات Inside',
        testimonials: 'الشهادات',
        categories: 'الفئات',
        trending: 'الأكثر رواجاً',
        latest: 'الأحدث',
        watch: 'مشاهدة',
        listen: 'استماع',
        share: 'مشاركة',
        like: 'إعجاب',
        views: 'مشاهدات',
        duration: 'المدة'
      },
      notifications: {
        title: 'الإشعارات',
        mark_all_read: 'تحديد الكل كمقروء',
        no_notifications: 'لا توجد إشعارات',
        new: 'جديد',
        unread: 'غير مقروء',
        settings: 'إعدادات الإشعارات',
        email_notifications: 'إشعارات البريد الإلكتروني',
        push_notifications: 'الإشعارات الفورية',
        sms_notifications: 'إشعارات الرسائل النصية',
        preferences: 'التفضيلات'
      },
      security: {
        title: 'الأمان',
        two_factor: 'المصادقة الثنائية',
        enable_2fa: 'تفعيل المصادقة الثنائية',
        disable_2fa: 'إلغاء المصادقة الثنائية',
        totp: 'تطبيق المصادقة',
        sms: 'الرسائل النصية',
        email: 'البريد الإلكتروني',
        backup_codes: 'رموز النسخ الاحتياطي',
        password: 'كلمة المرور',
        change_password: 'تغيير كلمة المرور',
        sessions: 'الجلسات النشطة',
        api_keys: 'مفاتيح API',
        audit_logs: 'سجلات المراجعة'
      },
      analytics: {
        title: 'التحليلات',
        overview: 'نظرة عامة',
        visitors: 'الزوار',
        pageviews: 'مشاهدات الصفحة',
        conversions: 'التحويلات',
        revenue: 'الإيرادات',
        export: 'تصدير',
        period: 'الفترة',
        today: 'اليوم',
        week: 'هذا الأسبوع',
        month: 'هذا الشهر',
        year: 'هذا العام',
        custom: 'مخصص'
      },
      payments: {
        title: 'المدفوعات',
        methods: 'طرق الدفع',
        history: 'السجل',
        invoices: 'الفواتير',
        refunds: 'المبالغ المستردة',
        pending: 'قيد الانتظار',
        completed: 'مكتمل',
        failed: 'فشل',
        amount: 'المبلغ',
        date: 'التاريخ',
        status: 'الحالة',
        download_invoice: 'تحميل الفاتورة'
      },
      partner: {
        back_to_dashboard: 'العودة إلى لوحة التحكم',
        priority: 'ذو أولوية',
        details: 'التفاصيل',
        status: {
          upcoming: 'قادم',
          draft: 'مسودة'
        },
        events: {
          title: 'الفعاليات المدعومة',
          subtitle: 'إدارة فعاليات الشراكة وتتبع تأثيرها',
          program: 'برنامج فعاليات الشراكة',
          available: 'الفعاليات المتاحة',
          loading: 'جاري تحميل الفعاليات...',
          none: 'لا توجد فعاليات متاحة في الوقت الحالي.',
          registered: 'مسجلون',
          capacity: 'السعة'
        },
        leads: {
          title: 'العملاء المحتملون والآفاق',
          subtitle: 'إدارة عملائك المؤهلين وتتبع تقدمهم في مسار المبيعات',
          premium_program: 'برنامج العملاء المحتملين المميز',
          conversion_rate: '12% معدل التحويل',
          generated: 'العملاء المحتملون المُنشأون',
          qualified: 'العملاء المؤهلون',
          conversion: 'معدل التحويل',
          estimated_value: 'القيمة المقدرة',
          recent: 'العملاء المحتملون الأخيرون',
          exhibitor: 'عارض',
          visitor: 'زائر',
          other: 'آخر',
          connected: 'متصل',
          pending: 'قيد الانتظار',
          rejected: 'مرفوض',
          active_followup: 'متابعة نشطة',
          awaiting_response: 'في انتظار الرد',
          sources: {
            events: 'فعاليات SIPORTS',
            networking: 'تواصل الشركاء',
            referrals: 'إحالات العملاء',
            marketing: 'الحملات التسويقية'
          },
          funnel: {
            generated: 'العملاء المُنشأون',
            qualified: 'المؤهلون',
            proposal: 'اقتراح',
            negotiation: 'التفاوض',
            conversion: 'التحويل'
          },
          tips: {
            title: 'نصائح لإدارة العملاء المحتملين',
            qualification: 'تأهيل سريع',
            qualification_desc: 'تواصل مع العملاء المهتمين خلال 24 ساعة لزيادة فرص التحويل',
            followup: 'متابعة منتظمة',
            followup_desc: 'جدولة نقاط متابعة أسبوعية للحفاظ على التفاعل',
            personalization: 'التخصيص',
            personalization_desc: 'تكييف مقترحاتك مع الاحتياجات المحددة لكل عميل محتمل',
            measure: 'قياس النتائج',
            measure_desc: 'تحليل معدلات التحويل بانتظام لتحسين نهجك'
          }
        },
        activity: {
          title: 'نشاط الشريك',
          subtitle: 'تتبع جميع تفاعلاتك ومشاركاتك في SIPORTS',
          full_history: 'السجل الكامل للأنشطة',
          realtime: 'الوقت الفعلي',
          history: 'سجل الأنشطة',
          no_activity: 'لم يتم العثور على نشاط',
          try_filters: 'جرب تعديل مرشحات البحث',
          just_now: 'الآن',
          hours_ago: 'منذ {{count}} ساعة',
          days_ago: 'منذ {{count}} يوم',
          stats: {
            total: 'إجمالي الأنشطة',
            today: 'اليوم',
            this_week: 'هذا الأسبوع'
          },
          filter: {
            all: 'جميع الأنشطة',
            networking: 'التواصل',
            communication: 'الاتصالات',
            events: 'الفعاليات',
            sponsorship: 'الرعاية',
            engagement: 'المشاركة',
            content: 'المحتوى',
            meetings: 'الاجتماعات',
            system: 'النظام'
          },
          type: {
            connection: 'اتصال',
            message: 'رسالة',
            event: 'فعالية',
            sponsorship: 'رعاية',
            consultation: 'استشارة',
            content: 'محتوى',
            alert: 'تنبيه',
            meeting: 'اجتماع'
          },
          connection_established: 'تم إنشاء اتصال جديد',
          connected_with: 'أنت الآن متصل مع Port Solutions Inc.',
          new_message: 'رسالة جديدة واردة',
          message_from: 'أرسل لك TechMarine Solutions رسالة',
          event_participation: 'المشاركة في فعالية',
          participated_in: 'لقد شاركت في مؤتمر "التحول الرقمي في الموانئ"',
          sponsoring_activated: 'تم تفعيل الرعاية',
          logo_displayed: 'يتم الآن عرض شعارك على الصفحة الرئيسية',
          profile_viewed: 'تمت مشاهدة الملف الشخصي',
          views_today: 'تمت مشاهدة ملفك الشخصي 15 مرة اليوم',
          content_shared: 'تمت مشاركة المحتوى',
          article_shared: 'تمت مشاركة مقالتك "الابتكار في تكنولوجيا البحرية"',
          system_alert: 'تنبيه النظام',
          metrics_update: 'تحديث مقاييس الأداء متاح',
          meeting_scheduled: 'تم جدولة اجتماع',
          meeting_confirmed: 'تم تأكيد الاجتماع مع LogiFlow Systems غداً الساعة 14:00'
        },
        calendar: {
          title: 'تقويم المواعيد',
          create_slot: 'فترة جديدة',
          slot_date_restriction: 'يجب إنشاء الفترات بين 1 و 3 أبريل 2026',
          date_outside_salon: 'يجب أن يكون التاريخ بين 1 و 3 أبريل 2026'
        }
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
