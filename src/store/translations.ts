/**
 * Dictionnaire complet des traductions
 * FR, EN, AR, ES pour toutes les pages
 */

export const allTranslations = {
  fr: {
    // Navigation Header
    'nav.home': 'Accueil',
    'nav.exhibitors': 'Exposants',
    'nav.partners': 'Partenaires',
    'nav.networking': 'Réseautage',
    'nav.pavilions': 'Pavillons',
    'nav.events': 'Événements',
    'nav.news': 'Actualités',
    'nav.information': 'Information',
    'nav.login': 'Se connecter',
    'nav.register': 'S\'inscrire',
    'nav.logout': 'Se déconnecter',
    
    // Menu Descriptions
    'menu.pavilions_desc': 'Explorez les pavillons du salon',
    'menu.events_desc': 'Conférences et ateliers',
    'menu.news_desc': 'Dernières actualités de l\'événement',
    'menu.subscriptions_desc': 'Plans d\'abonnement disponibles',

    // Pages générales
    'pages.exhibitors.title': 'Exposants',
    'pages.exhibitors.description': 'Découvrez les entreprises et organisations de l\'industrie portuaire',
    'pages.exhibitors.search': 'Chercher un exposant',
    'pages.exhibitors.filter_category': 'Catégorie',
    'pages.exhibitors.all_categories': 'Toutes les catégories',
    'pages.exhibitors.category_institutional': 'Institutionnel',
    'pages.exhibitors.category_port_industry': 'Industrie Portuaire',
    'pages.exhibitors.category_operations': 'Exploitation & Gestion',
    'pages.exhibitors.category_academic': 'Académique & Formation',
    'pages.exhibitors.category_technology': 'Technologie',
    'pages.exhibitors.category_automation': 'Automatisation',
    'pages.exhibitors.category_equipment': 'Équipement',
    'pages.exhibitors.featured': 'En vedette',
    
    // Sector Translations
    'sector.technology': 'Technologie',
    'sector.port_industry': 'Industrie Portuaire',
    'sector.automation': 'Automatisation',
    'sector.equipment': 'Équipement',
    'sector.operations_management': 'Exploitation & Gestion',
    'pages.exhibitors.verified': 'Vérifié',
    'pages.exhibitors.contact': 'Contacter',
    'pages.exhibitors.view_profile': 'Voir le profil',
    'pages.exhibitors.no_results': 'Aucun exposant trouvé',
    
    'pages.partners.title': 'Partenaires',
    'pages.partners.description': 'Les organisations qui soutiennent SIPORTS 2026',
    'pages.partners.search': 'Chercher un partenaire',
    'pages.partners.filter_tier': 'Type de partenariat',
    'pages.partners.tier_museum': 'Musée',
    'pages.partners.tier_silver': 'Silver',
    'pages.partners.tier_gold': 'Gold',
    'pages.partners.tier_platinium': 'Platinium',
    'pages.partners.view_details': 'Voir détails',
    'pages.partners.no_results': 'Aucun partenaire trouvé',
    
    'pages.events.title': 'Événements',
    'pages.events.description': 'Les conférences, ateliers et activités du salon',
    'pages.events.search': 'Chercher un événement',
    'pages.events.filter_date': 'Date',
    'pages.events.date': 'Date',
    'pages.events.time': 'Heure',
    'pages.events.location': 'Lieu',
    'pages.events.capacity': 'Places disponibles',
    'pages.events.register': 'S\'inscrire',
    'pages.events.registered': 'Inscrit',
    'pages.events.no_results': 'Aucun événement trouvé',
    
    'pages.news.title': 'Actualités',
    'pages.news.description': 'Les dernières nouvelles du salon et de l\'industrie',
    'pages.news.search': 'Chercher une actualité',
    'pages.news.read_more': 'Lire plus',
    'pages.news.published': 'Publié le',
    'pages.news.no_results': 'Aucune actualité trouvée',
    
    // Dashboard Admin
    'admin.title': 'Administration',
    'admin.dashboard': 'Tableau de bord',
    'admin.users_management': 'Gestion des utilisateurs',
    'admin.exhibitors_management': 'Gestion des exposants',
    'admin.partners_management': 'Gestion des partenaires',
    'admin.events_management': 'Gestion des événements',
    'admin.analytics': 'Statistiques',
    'admin.settings': 'Paramètres',
    'admin.total_users': 'Utilisateurs totaux',
    'admin.total_exhibitors': 'Exposants totaux',
    'admin.total_partners': 'Partenaires totaux',
    'admin.pending_approval': 'En attente d\'approbation',
    'admin.approve': 'Approuver',
    'admin.reject': 'Rejeter',
    'admin.edit': 'Modifier',
    'admin.delete': 'Supprimer',
    
    // Dashboard Visitor
    'visitor.dashboard': 'Mon espace',
    'visitor.my_profile': 'Mon profil',
    'visitor.my_appointments': 'Mes rendez-vous',
    'visitor.my_favorites': 'Mes favoris',
    'visitor.upgrade': 'Upgrader mon compte',
    'visitor.subscription_level': 'Niveau d\'abonnement',
    'visitor.member_since': 'Membre depuis',
    'visitor.my_badge': 'Mon badge numérique',
    
    // Dashboard Partner
    'partner.dashboard': 'Mon espace partenaire',
    'partner.my_profile': 'Mon profil',
    'partner.my_events': 'Mes événements',
    'partner.my_booth': 'Mon stand',
    'partner.analytics': 'Mon rapport',
    'partner.contacts': 'Mes contacts',
    
    // Dashboard Exhibitor
    'exhibitor.dashboard': 'Mon espace exposant',
    'exhibitor.my_profile': 'Mon profil',
    'exhibitor.my_booth': 'Mon stand',
    'exhibitor.appointments': 'Mes rendez-vous',
    'exhibitor.analytics': 'Statistiques',
    'exhibitor.booth_size': 'Taille du stand',
    'exhibitor.booth_location': 'Localisation du stand',
    
    // Home Page
    'home.book_appointment': 'Réserver un rendez-vous',
    'home.verified': 'Vérifié',
    'home.featured_partners_title': 'Partenaires à la Une',
    'home.featured_partners_desc': 'Les organisations leaders qui soutiennent SIPORTS 2026',
    'home.discover_all': 'Découvrez tous les partenaires',
    'home.featured_exhibitors_title': 'Exposants à la Une',
    'home.featured_exhibitors_desc': 'Les meilleurs exposants du salon',
    
    // Salon Statistics / Statistiques du Salon
    'salon.exhibitors': 'Exposants',
    'salon.visitors': 'Visiteurs Professionnels',
    'salon.conferences': 'Conférences & Panels',
    'salon.countries': 'Pays Représentés',
    
    // Hero Section
    'hero.title': 'SIPORTS 2026',
    'hero.subtitle': 'Le Salon International Portuaire - Connectez, Innovez, Transformez',
    'hero.countdown.title': 'Prochainement',
    'hero.countdown.subtitle': 'Rejoignez-nous au Centre d\'Exhibition Mohammed VI',
    'hero.stats.location': 'Maroc',
    'hero.stats.participants': 'Participants Professionnels',
    'hero.stats.exhibitors': 'Exposants Internationaux',
    'hero.cta.exhibitor': 'Devenir Exposant',
    'hero.cta.discover': 'Découvrir l\'Événement',
    'time.days': 'Jours',
    'time.hours': 'Heures',
    'time.minutes': 'Minutes',
    'time.seconds': 'Secondes',
    
    // Actions communes
    'actions.save': 'Sauvegarder',
    'actions.cancel': 'Annuler',
    'actions.edit': 'Modifier',
    'actions.delete': 'Supprimer',
    'actions.add': 'Ajouter',
    'actions.view': 'Voir',
    'actions.download': 'Télécharger',
    'actions.share': 'Partager',
    'actions.close': 'Fermer',
    'actions.back': 'Retour',
    'actions.next': 'Suivant',
    'actions.previous': 'Précédent',
    'actions.submit': 'Envoyer',
    'actions.loading': 'Chargement...',
    'actions.success': 'Succès',
    'actions.error': 'Erreur',
    
    // Messages
    'messages.confirm_delete': 'Êtes-vous sûr de vouloir supprimer ?',
    'messages.confirm_action': 'Êtes-vous sûr ?',
    'messages.saved': 'Sauvegardé avec succès',
    'messages.deleted': 'Supprimé avec succès',
    'messages.error': 'Une erreur s\'est produite',
    'messages.no_data': 'Aucune donnée disponible',
    
    // Profils
    'profile.name': 'Nom',
    'profile.email': 'Email',
    'profile.phone': 'Téléphone',
    'profile.company': 'Entreprise',
    'profile.sector': 'Secteur',
    'profile.description': 'Description',
    'profile.website': 'Site web',
    'profile.location': 'Localisation',
    'profile.logo': 'Logo',
    'profile.about': 'À propos',
    
    // Networking
    'networking.title': 'Réseautage',
    'networking.find_contacts': 'Trouvez les bons contacts',
    'networking.smart_matching': 'Matching intelligent',
    'networking.send_message': 'Envoyer un message',
    'networking.request_meeting': 'Demander un rendez-vous',
    'networking.messages': 'Messages',
    'networking.meetings': 'Rendez-vous',
    'networking.recommendations': 'Recommandations',
    
    // Dashboards
    'dashboard.admin_title': 'Tableau de Bord Admin',
    'dashboard.admin_subtitle': 'Gérer tous les ressources SIPORTS 2026',
    'dashboard.restricted_access': 'Accès Restreint - Administrateurs Uniquement',
    'dashboard.restricted_message': 'Cette section est réservée aux administrateurs SIPORTS',
    'dashboard.back_to_dashboard': 'Retour au Tableau de Bord',
    'dashboard.welcome': 'Bienvenue dans',
    'dashboard.loading_metrics': 'Chargement des métriques...',
    'dashboard.metrics_error': 'Erreur de chargement des métriques',
    'dashboard.retry': 'Réessayer',
    'dashboard.total_users': 'Utilisateurs Totaux',
    'dashboard.active_users': 'Utilisateurs Actifs',
    'dashboard.total_exhibitors': 'Exposants Totaux',
    'dashboard.total_partners': 'Partenaires Totaux',
    'dashboard.total_visitors': 'Visiteurs Totaux',
    'dashboard.statistics': 'Statistiques',
    'dashboard.system_health': 'Santé Système',
    'dashboard.user_growth': 'Croissance Utilisateurs',
    'dashboard.activity_overview': 'Aperçu Activité',
    'dashboard.traffic_analytics': 'Analytique Trafic',
    'dashboard.recent_activity': 'Activité Récente',
    'dashboard.registration_requests': 'Demandes d\'Inscription',
    'dashboard.pending_approvals': 'Approbations En Attente',
    'dashboard.content_moderation': 'Modération Contenu',
    'dashboard.settings': 'Paramètres',
    'dashboard.reports': 'Rapports',
    'dashboard.exports': 'Exports',
    
    // Visitor Dashboard
    'visitor.my_tickets': 'Mes Billets',
    'visitor.schedule_appointment': 'Prendre un Rendez-vous',
    'visitor.appointment_confirmed': 'Rendez-vous Confirmé',
    'visitor.appointment_declined': 'Rendez-vous Refusé',
    'visitor.no_appointments': 'Aucun Rendez-vous',
    'visitor.b2b_appointments': 'Rendez-vous B2B',
    'visitor.appointment_status': 'Statut des Rendez-vous',
    'visitor.appointment_scheduled': 'Rendez-vous Programmé',
    'visitor.loading_appointments': 'Chargement des Rendez-vous...',
    'visitor.error_loading': 'Impossible de charger les Rendez-vous. Veuillez réessayer.',
    'visitor.quota_remaining': 'Quota Restant',
    
    // Partner Dashboard
    'partner.event_registration': 'Inscription Événement',
    'partner.attendees': 'Participants',
    'partner.contribution_level': 'Niveau de Contribution',
    
    // Exhibitor Dashboard
    'exhibitor.visitor_interactions': 'Interactions Visiteurs',
    'exhibitor.booth_analytics': 'Analytique du Stand',
    'exhibitor.my_products': 'Mes Produits',
    
    // Contact Page
    'contact.title': 'Nous Contacter',
    'contact.description': 'Entrez en contact avec notre équipe',
    'contact.form_title': 'Formulaire de Contact',
    'contact.first_name': 'Prénom',
    'contact.last_name': 'Nom',
    'contact.email': 'Adresse Email',
    'contact.company': 'Entreprise',
    'contact.subject': 'Sujet',
    'contact.message': 'Message',
    'contact.send': 'Envoyer',
    'contact.success': 'Message envoyé avec succès',
    
    // Venue Page
    'venue.title': 'Plan de l\'Événement',
    'venue.description': 'Explorez la carte interactive pour localiser les stands',
    'venue.how_to_use': 'Comment utiliser la carte',
    'venue.step1_title': 'Parcourez la carte',
    'venue.step1_desc': 'Faites défiler la carte pour voir tous les stands disponibles',
    'venue.step2_title': 'Survolez un stand',
    'venue.step2_desc': 'Passez votre souris sur un stand pour voir un aperçu',
    'venue.step3_title': 'Cliquez pour plus',
    'venue.step3_desc': 'Cliquez sur un stand pour accéder à la fiche complète',
    
    // News Page
    'news.title': 'Actualités',
    'news.description': 'Restez informé sur les derniers événements',
    'news.search_placeholder': 'Chercher une actualité',
    'news.filter': 'Filtrer',
    'news.all_categories': 'Toutes les catégories',
    'news.featured': 'En vedette',
    'news.views': 'Vues',
    'news.category': 'Catégorie',
    
    // Partnership Page
    'partnership.title': 'Partenariats SIPORTS 2026',
    'partnership.description': 'Rejoignez l\'écosystème portuaire international',
    'partnership.premium': 'Partenaire Premium',
    'partnership.gold': 'Partenaire Or',
    'partnership.silver': 'Partenaire Argent',
    'partnership.become': 'Devenir Partenaire',
    'partnership.contact': 'Nous Contacter',
    
    // Subscription Page
    'subscription.title': 'Plans d\'Abonnement',
    'subscription.description': 'Choisissez votre plan',
    'subscription.visitor': 'Visiteur',
    'subscription.partner': 'Partenaire',
    'subscription.exhibitor': 'Exposant',
    'subscription.features': 'Caractéristiques',
    'subscription.included': 'Inclus',
    'subscription.not_included': 'Non inclus',
    'subscription.upgrade': 'Améliorer',
    'subscription.current_plan': 'Plan actuel',
    
    // Legal Pages
    'legal.terms_title': 'Conditions d\'Utilisation',
    'legal.privacy_title': 'Politique de Confidentialité',
    'legal.cookies_title': 'Politique de Cookies',
    'legal.last_update': 'Dernière mise à jour',
    'legal.acceptance': 'Acceptation',
    'legal.usage': 'Utilisation acceptable',
    'legal.data_collection': 'Collecte de données',
    'legal.contact': 'Nous Contacter',
    
    // Support & Help
    'support.title': 'Support et Aide',
    'support.description': 'Nous sommes là pour vous aider',
    'support.contact_form': 'Formulaire de Contact',
    'support.faq': 'Questions Fréquentes',
    
    // Detail Pages
    'detail.overview': 'Aperçu',
    'detail.contact': 'Nous Contacter',
    'detail.book_appointment': 'Réserver un Rendez-vous',
    'detail.add_favorite': 'Ajouter aux Favoris',
    'detail.share': 'Partager',
    'detail.products': 'Produits',
    'detail.services': 'Services',
    'detail.team': 'Équipe',
    
    // Networking Page
    'networking.description': 'Connexions intelligentes basées sur votre profil',
    'networking.connections': 'Mes Connexions',
    'networking.favorites': 'Mes Favoris',
    'networking.find_matches': 'Trouver des correspondances',
    'networking.compatibility': 'Compatibilité',
    
    // API Page
    'api.title': 'API SIPORTS',
    'api.description': 'Intégrez SIPORTS dans vos applications',
    'api.documentation': 'Documentation API',
    'api.authentication': 'Authentification',
    'api.endpoints': 'Points de Terminaison',
    'api.rate_limiting': 'Limitation de Débit',
    'api.webhook': 'Webhooks',
    'api.get_started': 'Commencer',
    
    // Badge Page
    'badge.title': 'Mon Badge',
    'badge.badge_info': 'Informations du Badge',
    'badge.access_level': 'Niveau d\'Accès',
    'badge.qr_code': 'Code QR',
    'badge.download': 'Télécharger',
    'badge.print': 'Imprimer',
    'badge.share': 'Partager',
    
    // Enhanced Networking
    'enhanced_networking.title': 'Réseautage Avancé',
    'enhanced_networking.ai_matching': 'Appariement IA',
    'enhanced_networking.analytics': 'Analytique',
    'enhanced_networking.compatibility_score': 'Score de Compatibilité',
    'enhanced_networking.mutual_connections': 'Connexions Mutuelles',
    
    // Upgrade Pages
    'upgrade.partner_title': 'Plans d\'Abonnement Partenaire',
    'upgrade.partner_description': 'Élevez votre visibilité au SIPORTS 2026',
    'upgrade.visitor_title': 'Mises à Jour de Visiteur',
    'upgrade.visitor_description': 'Accédez aux fonctionnalités premium',
    'upgrade.payment_method': 'Méthode de Paiement',
    'upgrade.card': 'Carte de Crédit',
    'upgrade.paypal': 'PayPal',
    'upgrade.bank_transfer': 'Virement Bancaire',
    'upgrade.amount': 'Montant',
    'upgrade.total': 'Total',
    
    // User Management
    'users.title': 'Gestion des Utilisateurs',
    'users.total': 'Total des Utilisateurs',
    'users.active': 'Utilisateurs Actifs',
    'users.search': 'Rechercher des utilisateurs',
    'users.filter': 'Filtrer par type',
    'users.status': 'Statut',
    'users.action': 'Actions',
    'users.delete': 'Supprimer',
    
    // Partner Detail Page
    'partner_detail.about': 'À Propos',
    'partner_detail.projects': 'Projets',
    'partner_detail.contact_info': 'Informations de Contact',
    'partner_detail.request_meeting': 'Demander une Réunion',
    'partner_detail.back': 'Retour',
    
    // Product Detail Page
    'product_detail.specifications': 'Spécifications',
    'product_detail.price': 'Prix',
    'product_detail.availability': 'Disponibilité',
    'product_detail.request_demo': 'Demander une Démo',
    'product_detail.contact_supplier': 'Contacter le Fournisseur',
    
    // Reset Password
    'password.reset_title': 'Réinitialiser le Mot de Passe',
    'password.reset_description': 'Entrez votre nouveau mot de passe',
    'password.new_password': 'Nouveau Mot de Passe',
    'password.confirm': 'Confirmer',
    'password.error': 'Erreur lors de la réinitialisation',
  },
  
  en: {
    // Navigation Header
    'nav.home': 'Home',
    'nav.exhibitors': 'Exhibitors',
    'nav.partners': 'Partners',
    'nav.networking': 'Networking',
    'nav.pavilions': 'Pavilions',
    'nav.events': 'Events',
    'nav.news': 'News',
    'nav.information': 'Information',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    // Menu Descriptions
    'menu.pavilions_desc': 'Explore the exhibition pavilions',
    'menu.events_desc': 'Conferences and workshops',
    'menu.news_desc': 'Latest event news',
    'menu.subscriptions_desc': 'Available subscription plans',

    'pages.exhibitors.title': 'Exhibitors',
    'pages.exhibitors.description': 'Discover the companies and organizations in the port industry',
    'pages.exhibitors.search': 'Search for an exhibitor',
    'pages.exhibitors.filter_category': 'Category',
    'pages.exhibitors.all_categories': 'All categories',
    'pages.exhibitors.category_institutional': 'Institutional',
    'pages.exhibitors.category_port_industry': 'Port Industry',
    'pages.exhibitors.category_operations': 'Operations & Management',
    'pages.exhibitors.category_academic': 'Academic & Training',
    'pages.exhibitors.category_technology': 'Technology',
    'pages.exhibitors.category_automation': 'Automation',
    'pages.exhibitors.category_equipment': 'Equipment',
    'pages.exhibitors.featured': 'Featured',
    
    // Sector Translations
    'sector.technology': 'Technology',
    'sector.port_industry': 'Port Industry',
    'sector.automation': 'Automation',
    'sector.equipment': 'Equipment',
    'sector.operations_management': 'Operations & Management',
    'pages.exhibitors.verified': 'Verified',
    'pages.exhibitors.contact': 'Contact',
    'pages.exhibitors.view_profile': 'View Profile',
    'pages.exhibitors.no_results': 'No exhibitors found',
    
    'pages.partners.title': 'Partners',
    'pages.partners.description': 'Organizations supporting SIPORTS 2026',
    'pages.partners.search': 'Search for a partner',
    'pages.partners.filter_tier': 'Partnership Type',
    'pages.partners.tier_museum': 'Museum',
    'pages.partners.tier_silver': 'Silver',
    'pages.partners.tier_gold': 'Gold',
    'pages.partners.tier_platinium': 'Platinium',
    'pages.partners.view_details': 'View Details',
    'pages.partners.no_results': 'No partners found',
    
    'pages.events.title': 'Events',
    'pages.events.description': 'Conferences, workshops and exhibition activities',
    'pages.events.search': 'Search for an event',
    'pages.events.filter_date': 'Date',
    'pages.events.date': 'Date',
    'pages.events.time': 'Time',
    'pages.events.location': 'Location',
    'pages.events.capacity': 'Available Spots',
    'pages.events.register': 'Register',
    'pages.events.registered': 'Registered',
    'pages.events.no_results': 'No events found',
    
    'pages.news.title': 'News',
    'pages.news.description': 'Latest news from the exhibition and industry',
    'pages.news.search': 'Search for news',
    'pages.news.read_more': 'Read More',
    'pages.news.published': 'Published on',
    'pages.news.no_results': 'No news found',
    
    'admin.title': 'Administration',
    'admin.dashboard': 'Dashboard',
    'admin.users_management': 'User Management',
    'admin.exhibitors_management': 'Exhibitors Management',
    'admin.partners_management': 'Partners Management',
    'admin.events_management': 'Events Management',
    'admin.analytics': 'Analytics',
    'admin.settings': 'Settings',
    'admin.total_users': 'Total Users',
    'admin.total_exhibitors': 'Total Exhibitors',
    'admin.total_partners': 'Total Partners',
    'admin.pending_approval': 'Pending Approval',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.edit': 'Edit',
    'admin.delete': 'Delete',
    
    'visitor.dashboard': 'My Space',
    'visitor.my_profile': 'My Profile',
    'visitor.my_appointments': 'My Appointments',
    'visitor.my_favorites': 'My Favorites',
    'visitor.upgrade': 'Upgrade Account',
    'visitor.subscription_level': 'Subscription Level',
    'visitor.member_since': 'Member Since',
    'visitor.my_badge': 'My Digital Badge',
    
    'partner.dashboard': 'Partner Space',
    'partner.my_profile': 'My Profile',
    'partner.my_events': 'My Events',
    'partner.my_booth': 'My Booth',
    'partner.analytics': 'My Report',
    'partner.contacts': 'My Contacts',
    
    'exhibitor.dashboard': 'Exhibitor Space',
    'exhibitor.my_profile': 'My Profile',
    'exhibitor.my_booth': 'My Booth',
    'exhibitor.appointments': 'My Appointments',
    'exhibitor.analytics': 'Statistics',
    'exhibitor.booth_size': 'Booth Size',
    'exhibitor.booth_location': 'Booth Location',
    
    // Home Page
    'home.book_appointment': 'Book Appointment',
    'home.verified': 'Verified',
    'home.featured_partners_title': 'Featured Partners',
    'home.featured_partners_desc': 'Leading organizations supporting SIPORTS 2026',
    'home.discover_all': 'Discover All Partners',
    'home.featured_exhibitors_title': 'Featured Exhibitors',
    'home.featured_exhibitors_desc': 'The best exhibitors of the show',
    
    // Salon Statistics
    'salon.exhibitors': 'Exhibitors',
    'salon.visitors': 'Professional Visitors',
    'salon.conferences': 'Conferences & Panels',
    'salon.countries': 'Countries Represented',
    
    // Hero Section
    'hero.title': 'SIPORTS 2026',
    'hero.subtitle': 'The International Port Exhibition - Connect, Innovate, Transform',
    'hero.countdown.title': 'Coming Soon',
    'hero.countdown.subtitle': 'Join us at Mohammed VI Exhibition Center',
    'hero.stats.location': 'Morocco',
    'hero.stats.participants': 'Professional Participants',
    'hero.stats.exhibitors': 'International Exhibitors',
    'hero.cta.exhibitor': 'Become an Exhibitor',
    'hero.cta.discover': 'Discover the Event',
    'time.days': 'Days',
    'time.hours': 'Hours',
    'time.minutes': 'Minutes',
    'time.seconds': 'Seconds',
    
    // Actions communes
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.edit': 'Edit',
    'actions.delete': 'Delete',
    'actions.add': 'Add',
    'actions.view': 'View',
    'actions.download': 'Download',
    'actions.share': 'Share',
    'actions.close': 'Close',
    'actions.back': 'Back',
    'actions.next': 'Next',
    'actions.previous': 'Previous',
    'actions.submit': 'Submit',
    'actions.loading': 'Loading...',
    'actions.success': 'Success',
    'actions.error': 'Error',
    
    'messages.confirm_delete': 'Are you sure you want to delete?',
    'messages.confirm_action': 'Are you sure?',
    'messages.saved': 'Saved successfully',
    'messages.deleted': 'Deleted successfully',
    'messages.error': 'An error occurred',
    'messages.no_data': 'No data available',
    
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.company': 'Company',
    'profile.sector': 'Sector',
    'profile.description': 'Description',
    'profile.website': 'Website',
    'profile.location': 'Location',
    'profile.logo': 'Logo',
    'profile.about': 'About',
    
    'networking.title': 'Networking',
    'networking.find_contacts': 'Find the right contacts',
    'networking.smart_matching': 'Smart Matching',
    'networking.send_message': 'Send Message',
    'networking.request_meeting': 'Request Meeting',
    'networking.messages': 'Messages',
    'networking.meetings': 'Meetings',
    'networking.recommendations': 'Recommendations',

    // Dashboard sections
    'dashboard.admin_title': 'Administration Dashboard',
    'dashboard.admin_subtitle': 'Manage all SIPORTS 2026 resources',
    'dashboard.restricted_access': 'Restricted Access - Administrators Only',
    'dashboard.restricted_message': 'This section is reserved for SIPORTS administrators',
    'dashboard.back_to_dashboard': 'Back to Dashboard',
    'dashboard.welcome': 'Welcome to',
    'dashboard.loading_metrics': 'Loading metrics...',
    'dashboard.metrics_error': 'Error loading metrics',
    'dashboard.retry': 'Retry',
    'dashboard.total_users': 'Total Users',
    'dashboard.active_users': 'Active Users',
    'dashboard.total_exhibitors': 'Total Exhibitors',
    'dashboard.total_partners': 'Total Partners',
    'dashboard.total_visitors': 'Total Visitors',
    'dashboard.statistics': 'Statistics',
    'dashboard.system_health': 'System Health',
    'dashboard.user_growth': 'User Growth',
    'dashboard.activity_overview': 'Activity Overview',
    'dashboard.traffic_analytics': 'Traffic Analytics',
    'dashboard.recent_activity': 'Recent Activity',
    'dashboard.registration_requests': 'Registration Requests',
    'dashboard.pending_approvals': 'Pending Approvals',
    'dashboard.content_moderation': 'Content Moderation',
    'dashboard.settings': 'Settings',
    'dashboard.reports': 'Reports',
    'dashboard.exports': 'Exports',
    
    // Visitor Dashboard
    'visitor.my_tickets': 'My Tickets',
    'visitor.schedule_appointment': 'Schedule Appointment',
    'visitor.appointment_confirmed': 'Appointment Confirmed',
    'visitor.appointment_declined': 'Appointment Declined',
    'visitor.no_appointments': 'No Appointments',
    'visitor.b2b_appointments': 'B2B Appointments',
    'visitor.appointment_status': 'Appointment Status',
    'visitor.appointment_scheduled': 'Appointment Scheduled',
    'visitor.loading_appointments': 'Loading Appointments...',
    'visitor.error_loading': 'Unable to load Appointments. Please try again.',
    'visitor.quota_remaining': 'Remaining Quota',
    
    // Partner Dashboard
    'partner.event_registration': 'Event Registration',
    'partner.attendees': 'Attendees',
    'partner.contribution_level': 'Contribution Level',
    
    // Exhibitor Dashboard
    'exhibitor.visitor_interactions': 'Visitor Interactions',
    'exhibitor.booth_analytics': 'Booth Analytics',
    'exhibitor.my_products': 'My Products',
    
    // Contact Page
    'contact.title': 'Contact Us',
    'contact.description': 'Get in touch with our team',
    'contact.form_title': 'Contact Form',
    'contact.first_name': 'First Name',
    'contact.last_name': 'Last Name',
    'contact.email': 'Email Address',
    'contact.company': 'Company',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'contact.success': 'Message sent successfully',
    
    // Venue Page
    'venue.title': 'Event Map',
    'venue.description': 'Explore the interactive map to locate exhibitor booths',
    'venue.how_to_use': 'How to use the map',
    'venue.step1_title': 'Browse the map',
    'venue.step1_desc': 'Scroll through the map to see all available booths',
    'venue.step2_title': 'Hover over a booth',
    'venue.step2_desc': 'Hover your mouse over a booth to see a preview',
    'venue.step3_title': 'Click for more',
    'venue.step3_desc': 'Click on a booth to access the full exhibitor details',
    
    // News Page
    'news.title': 'News',
    'news.description': 'Stay informed about the latest events',
    'news.search_placeholder': 'Search for news',
    'news.filter': 'Filter',
    'news.all_categories': 'All categories',
    'news.featured': 'Featured',
    'news.views': 'Views',
    'news.category': 'Category',
    
    // Partnership Page
    'partnership.title': 'SIPORTS 2026 Partnerships',
    'partnership.description': 'Join the international port ecosystem',
    'partnership.premium': 'Premium Partner',
    'partnership.gold': 'Gold Partner',
    'partnership.silver': 'Silver Partner',
    'partnership.become': 'Become a Partner',
    'partnership.contact': 'Contact Us',
    
    // Subscription Page
    'subscription.title': 'Subscription Plans',
    'subscription.description': 'Choose your perfect plan',
    'subscription.visitor': 'Visitor',
    'subscription.partner': 'Partner',
    'subscription.exhibitor': 'Exhibitor',
    'subscription.features': 'Features',
    'subscription.included': 'Included',
    'subscription.not_included': 'Not included',
    'subscription.upgrade': 'Upgrade',
    'subscription.current_plan': 'Current plan',
    
    // Legal Pages
    'legal.terms_title': 'Terms of Service',
    'legal.privacy_title': 'Privacy Policy',
    'legal.cookies_title': 'Cookie Policy',
    'legal.last_update': 'Last Updated',
    'legal.acceptance': 'Acceptance',
    'legal.usage': 'Acceptable Use',
    'legal.data_collection': 'Data Collection',
    'legal.contact': 'Contact Us',
    
    // Support & Help
    'support.title': 'Support & Help',
    'support.description': 'We are here to help you',
    'support.contact_form': 'Contact Form',
    'support.faq': 'Frequently Asked Questions',
    
    // Detail Pages
    'detail.overview': 'Overview',
    'detail.contact': 'Contact Us',
    'detail.book_appointment': 'Book Appointment',
    'detail.add_favorite': 'Add to Favorites',
    'detail.share': 'Share',
    'detail.products': 'Products',
    'detail.services': 'Services',
    'detail.team': 'Team',
    
    // Networking Page
    'networking.description': 'Smart connections based on your profile',
    'networking.connections': 'My Connections',
    'networking.favorites': 'My Favorites',
    'networking.find_matches': 'Find Matches',
    'networking.compatibility': 'Compatibility',
    
    // API Page
    'api.title': 'SIPORTS API',
    'api.description': 'Integrate SIPORTS into your applications',
    'api.documentation': 'API Documentation',
    'api.authentication': 'Authentication',
    'api.endpoints': 'Endpoints',
    'api.rate_limiting': 'Rate Limiting',
    'api.webhook': 'Webhooks',
    'api.get_started': 'Get Started',
    
    // Badge Page
    'badge.title': 'My Badge',
    'badge.badge_info': 'Badge Information',
    'badge.access_level': 'Access Level',
    'badge.qr_code': 'QR Code',
    'badge.download': 'Download',
    'badge.print': 'Print',
    'badge.share': 'Share',
    
    // Enhanced Networking
    'enhanced_networking.title': 'Advanced Networking',
    'enhanced_networking.ai_matching': 'AI Matching',
    'enhanced_networking.analytics': 'Analytics',
    'enhanced_networking.compatibility_score': 'Compatibility Score',
    'enhanced_networking.mutual_connections': 'Mutual Connections',
    
    // Upgrade Pages
    'upgrade.partner_title': 'Partner Subscription Plans',
    'upgrade.partner_description': 'Increase your visibility at SIPORTS 2026',
    'upgrade.visitor_title': 'Visitor Upgrades',
    'upgrade.visitor_description': 'Access premium features',
    'upgrade.payment_method': 'Payment Method',
    'upgrade.card': 'Credit Card',
    'upgrade.paypal': 'PayPal',
    'upgrade.bank_transfer': 'Bank Transfer',
    'upgrade.amount': 'Amount',
    'upgrade.total': 'Total',
    
    // User Management
    'users.title': 'User Management',
    'users.total': 'Total Users',
    'users.active': 'Active Users',
    'users.search': 'Search users',
    'users.filter': 'Filter by type',
    'users.status': 'Status',
    'users.action': 'Actions',
    'users.delete': 'Delete',
    
    // Partner Detail Page
    'partner_detail.about': 'About',
    'partner_detail.projects': 'Projects',
    'partner_detail.contact_info': 'Contact Information',
    'partner_detail.request_meeting': 'Request Meeting',
    'partner_detail.back': 'Back',
    
    // Product Detail Page
    'product_detail.specifications': 'Specifications',
    'product_detail.price': 'Price',
    'product_detail.availability': 'Availability',
    'product_detail.request_demo': 'Request Demo',
    'product_detail.contact_supplier': 'Contact Supplier',
    
    // Reset Password
    'password.reset_title': 'Reset Password',
    'password.reset_description': 'Enter your new password',
    'password.new_password': 'New Password',
    'password.confirm': 'Confirm',
    'password.error': 'Error resetting password',
  },
  
  ar: {
    // Navigation Header
    'nav.home': 'الرئيسية',
    'nav.exhibitors': 'العارضون',
    'nav.partners': 'الشركاء',
    'nav.networking': 'التواصل',
    'nav.pavilions': 'الأجنحة',
    'nav.events': 'الأحداث',
    'nav.news': 'الأخبار',
    'nav.information': 'المعلومات',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'التسجيل',
    'nav.logout': 'تسجيل الخروج',
    
    // Menu Descriptions
    'menu.pavilions_desc': 'استكشف أجنحة المعرض',
    'menu.events_desc': 'المؤتمرات والورش',
    'menu.news_desc': 'أحدث أخبار الحدث',
    'menu.subscriptions_desc': 'خطط الاشتراك المتاحة',

    'pages.exhibitors.title': 'العارضون',
    'pages.exhibitors.description': 'اكتشف الشركات والمنظمات في صناعة الموانئ',
    'pages.exhibitors.search': 'ابحث عن عارض',
    'pages.exhibitors.filter_category': 'الفئة',
    'pages.exhibitors.all_categories': 'جميع الفئات',
    'pages.exhibitors.category_institutional': 'مؤسسي',
    'pages.exhibitors.category_port_industry': 'صناعة الموانئ',
    'pages.exhibitors.category_operations': 'العمليات والإدارة',
    'pages.exhibitors.category_academic': 'الأكاديمي والتدريب',
    'pages.exhibitors.category_technology': 'التكنولوجيا',
    'pages.exhibitors.category_automation': 'الأتمتة',
    'pages.exhibitors.category_equipment': 'المعدات',
    'pages.exhibitors.featured': 'المميز',
    
    // Sector Translations
    'sector.technology': 'التكنولوجيا',
    'sector.port_industry': 'صناعة الموانئ',
    'sector.automation': 'الأتمتة',
    'sector.equipment': 'المعدات',
    'sector.operations_management': 'العمليات والإدارة',
    'pages.exhibitors.verified': 'تم التحقق',
    'pages.exhibitors.contact': 'اتصال',
    'pages.exhibitors.view_profile': 'عرض الملف الشخصي',
    'pages.exhibitors.no_results': 'لم يتم العثور على عارضين',
    
    'pages.partners.title': 'الشركاء',
    'pages.partners.description': 'المنظمات التي تدعم SIPORTS 2026',
    'pages.partners.search': 'ابحث عن شريك',
    'pages.partners.filter_tier': 'نوع الشراكة',
    'pages.partners.tier_museum': 'متحف',
    'pages.partners.tier_silver': 'فضي',
    'pages.partners.tier_gold': 'ذهبي',
    'pages.partners.tier_platinium': 'بلاتيني',
    'pages.partners.view_details': 'عرض التفاصيل',
    'pages.partners.no_results': 'لم يتم العثور على شركاء',
    
    'pages.events.title': 'الفعاليات',
    'pages.events.description': 'المؤتمرات والورش وأنشطة المعرض',
    'pages.events.search': 'ابحث عن حدث',
    'pages.events.filter_date': 'التاريخ',
    'pages.events.date': 'التاريخ',
    'pages.events.time': 'الوقت',
    'pages.events.location': 'الموقع',
    'pages.events.capacity': 'الأماكن المتاحة',
    'pages.events.register': 'التسجيل',
    'pages.events.registered': 'مسجل',
    'pages.events.no_results': 'لم يتم العثور على فعاليات',
    
    'pages.news.title': 'الأخبار',
    'pages.news.description': 'أحدث الأخبار من المعرض والصناعة',
    'pages.news.search': 'ابحث عن خبر',
    'pages.news.read_more': 'اقرأ المزيد',
    'pages.news.published': 'نشر في',
    'pages.news.no_results': 'لم يتم العثور على أخبار',
    
    'admin.title': 'الإدارة',
    'admin.dashboard': 'لوحة التحكم',
    'admin.users_management': 'إدارة المستخدمين',
    'admin.exhibitors_management': 'إدارة العارضين',
    'admin.partners_management': 'إدارة الشركاء',
    'admin.events_management': 'إدارة الفعاليات',
    'admin.analytics': 'التحليلات',
    'admin.settings': 'الإعدادات',
    'admin.total_users': 'إجمالي المستخدمين',
    'admin.total_exhibitors': 'إجمالي العارضين',
    'admin.total_partners': 'إجمالي الشركاء',
    'admin.pending_approval': 'قيد الموافقة',
    'admin.approve': 'الموافقة',
    'admin.reject': 'الرفض',
    'admin.edit': 'تعديل',
    'admin.delete': 'حذف',
    
    'visitor.dashboard': 'مساحتي',
    'visitor.my_profile': 'ملفي الشخصي',
    'visitor.my_appointments': 'مواعيدي',
    'visitor.my_favorites': 'مفضلاتي',
    'visitor.upgrade': 'ترقية الحساب',
    'visitor.subscription_level': 'مستوى الاشتراك',
    'visitor.member_since': 'عضو منذ',
    'visitor.my_badge': 'شارتي الرقمية',
    
    'partner.dashboard': 'مساحة الشريك',
    'partner.my_profile': 'ملفي الشخصي',
    'partner.my_events': 'فعالياتي',
    'partner.my_booth': 'كشكي',
    'partner.analytics': 'تقريري',
    'partner.contacts': 'جهات اتصالي',
    
    'exhibitor.dashboard': 'مساحة العارض',
    'exhibitor.my_profile': 'ملفي الشخصي',
    'exhibitor.my_booth': 'كشكي',
    'exhibitor.appointments': 'مواعيدي',
    'exhibitor.analytics': 'الإحصائيات',
    'exhibitor.booth_size': 'حجم الكشك',
    'exhibitor.booth_location': 'موقع الكشك',
    
    // Home Page
    'home.book_appointment': 'حجز موعد',
    'home.verified': 'تم التحقق',
    'home.featured_partners_title': 'الشركاء المميزون',
    'home.featured_partners_desc': 'المنظمات الرائدة التي تدعم SIPORTS 2026',
    'home.discover_all': 'اكتشف جميع الشركاء',
    'home.featured_exhibitors_title': 'العارضون المميزون',
    'home.featured_exhibitors_desc': 'أفضل العارضين في المعرض',
    
    // Salon Statistics
    'salon.exhibitors': 'العارضون',
    'salon.visitors': 'الزوار المحترفون',
    'salon.conferences': 'المؤتمرات والجلسات',
    'salon.countries': 'الدول الممثلة',
    
    // Hero Section
    'hero.title': 'سيبورتس 2026',
    'hero.subtitle': 'المعرض الدولي للموانئ - الاتصال والابتكار والتحويل',
    'hero.countdown.title': 'قريبا جدا',
    'hero.countdown.subtitle': 'انضم إلينا في مركز معرض محمد السادس',
    'hero.stats.location': 'المغرب',
    'hero.stats.participants': 'المشاركون المحترفون',
    'hero.stats.exhibitors': 'العارضون الدوليون',
    'hero.cta.exhibitor': 'أصبح عارضا',
    'hero.cta.discover': 'اكتشف الحدث',
    'time.days': 'الأيام',
    'time.hours': 'الساعات',
    'time.minutes': 'الدقائق',
    'time.seconds': 'الثواني',
    
    // Actions communes
    'actions.save': 'حفظ',
    'actions.cancel': 'إلغاء',
    'actions.edit': 'تعديل',
    'actions.delete': 'حذف',
    'actions.add': 'إضافة',
    'actions.view': 'عرض',
    'actions.download': 'تحميل',
    'actions.share': 'مشاركة',
    'actions.close': 'إغلاق',
    'actions.back': 'رجوع',
    'actions.next': 'التالي',
    'actions.previous': 'السابق',
    'actions.submit': 'إرسال',
    'actions.loading': 'جاري التحميل...',
    'actions.success': 'نجح',
    'actions.error': 'خطأ',
    
    'messages.confirm_delete': 'هل أنت متأكد من رغبتك في الحذف؟',
    'messages.confirm_action': 'هل أنت متأكد؟',
    'messages.saved': 'تم الحفظ بنجاح',
    'messages.deleted': 'تم الحذف بنجاح',
    'messages.error': 'حدث خطأ',
    'messages.no_data': 'لا توجد بيانات متاحة',
    
    'profile.name': 'الاسم',
    'profile.email': 'البريد الإلكتروني',
    'profile.phone': 'الهاتف',
    'profile.company': 'الشركة',
    'profile.sector': 'القطاع',
    'profile.description': 'الوصف',
    'profile.website': 'الموقع الإلكتروني',
    'profile.location': 'الموقع',
    'profile.logo': 'الشعار',
    'profile.about': 'حول',
    
    'networking.title': 'التواصل',
    'networking.find_contacts': 'ابحث عن الجهات المناسبة',
    'networking.smart_matching': 'مطابقة ذكية',
    'networking.send_message': 'إرسال رسالة',
    'networking.request_meeting': 'طلب اجتماع',
    'networking.messages': 'الرسائل',
    'networking.meetings': 'الاجتماعات',
    'networking.recommendations': 'التوصيات',
    
    // Dashboards
    'dashboard.admin_title': 'لوحة تحكم الإدارة',
    'dashboard.admin_subtitle': 'إدارة جميع موارد SIPORTS 2026',
    'dashboard.restricted_access': 'وصول مقيد - المسؤولون فقط',
    'dashboard.restricted_message': 'هذا القسم مخصص لمسؤولي SIPORTS',
    'dashboard.back_to_dashboard': 'العودة إلى لوحة التحكم',
    'dashboard.welcome': 'أهلا بك في',
    'dashboard.loading_metrics': 'جاري تحميل المقاييس...',
    'dashboard.metrics_error': 'خطأ في تحميل المقاييس',
    'dashboard.retry': 'حاول مجددا',
    'dashboard.total_users': 'إجمالي المستخدمين',
    'dashboard.active_users': 'المستخدمون النشطون',
    'dashboard.total_exhibitors': 'إجمالي العارضين',
    'dashboard.total_partners': 'إجمالي الشركاء',
    'dashboard.total_visitors': 'إجمالي الزوار',
    'dashboard.statistics': 'الإحصائيات',
    'dashboard.system_health': 'صحة النظام',
    'dashboard.user_growth': 'نمو المستخدمين',
    'dashboard.activity_overview': 'نظرة عامة على النشاط',
    'dashboard.traffic_analytics': 'تحليلات حركة المرور',
    'dashboard.recent_activity': 'النشاط الأخير',
    'dashboard.registration_requests': 'طلبات التسجيل',
    'dashboard.pending_approvals': 'الموافقات المعلقة',
    'dashboard.content_moderation': 'إشراف المحتوى',
    'dashboard.settings': 'الإعدادات',
    'dashboard.reports': 'التقارير',
    'dashboard.exports': 'الصادرات',
    
    // Visitor Dashboard
    'visitor.my_tickets': 'تذاكري',
    'visitor.schedule_appointment': 'جدول موعد',
    'visitor.appointment_confirmed': 'موعد مؤكد',
    'visitor.appointment_declined': 'موعد مرفوض',
    'visitor.no_appointments': 'بدون مواعيد',
    'visitor.b2b_appointments': 'مواعيد B2B',
    'visitor.appointment_status': 'حالة الموعد',
    'visitor.appointment_scheduled': 'موعد مجدول',
    'visitor.loading_appointments': 'جاري تحميل المواعيد...',
    'visitor.error_loading': 'تعذر تحميل المواعيد. الرجاء المحاولة مجددا.',
    'visitor.quota_remaining': 'الحصة المتبقية',
    
    // Partner Dashboard
    'partner.event_registration': 'تسجيل الفعالية',
    'partner.attendees': 'الحاضرون',
    'partner.contribution_level': 'مستوى المساهمة',
    
    // Exhibitor Dashboard
    'exhibitor.visitor_interactions': 'تفاعلات الزوار',
    'exhibitor.booth_analytics': 'تحليلات الكشك',
    'exhibitor.my_products': 'منتجاتي',
    
    // Contact Page
    'contact.title': 'تواصل معنا',
    'contact.description': 'ابقَ على اتصال مع فريقنا',
    'contact.form_title': 'نموذج الاتصال',
    'contact.first_name': 'الاسم الأول',
    'contact.last_name': 'الاسم الأخير',
    'contact.email': 'عنوان البريد الإلكتروني',
    'contact.company': 'الشركة',
    'contact.subject': 'الموضوع',
    'contact.message': 'الرسالة',
    'contact.send': 'إرسال',
    'contact.success': 'تم إرسال الرسالة بنجاح',
    
    // Venue Page
    'venue.title': 'خريطة الحدث',
    'venue.description': 'استكشف الخريطة التفاعلية لتحديد موقع الأكشاك',
    'venue.how_to_use': 'كيفية استخدام الخريطة',
    'venue.step1_title': 'استعرض الخريطة',
    'venue.step1_desc': 'مرر عبر الخريطة لرؤية جميع الأكشاك المتاحة',
    'venue.step2_title': 'مرر فوق الكشك',
    'venue.step2_desc': 'مرر الفأرة فوق الكشك لرؤية معاينة',
    'venue.step3_title': 'اضغط لمزيد',
    'venue.step3_desc': 'اضغط على الكشك للوصول إلى الملف الكامل',
    
    // News Page
    'news.title': 'أخبار',
    'news.description': 'ابقَ على اطلاع بآخر الأحداث',
    'news.search_placeholder': 'ابحث عن خبر',
    'news.filter': 'تصفية',
    'news.all_categories': 'جميع الفئات',
    'news.featured': 'المميز',
    'news.views': 'المشاهدات',
    'news.category': 'الفئة',
    
    // Partnership Page
    'partnership.title': 'شراكات SIPORTS 2026',
    'partnership.description': 'انضم إلى النظام البيئي للموانئ الدولية',
    'partnership.premium': 'شريك Premium',
    'partnership.gold': 'شريك ذهبي',
    'partnership.silver': 'شريك فضي',
    'partnership.become': 'كن شريكاً',
    'partnership.contact': 'تواصل معنا',
    
    // Subscription Page
    'subscription.title': 'خطط الاشتراك',
    'subscription.description': 'اختر خطتك المثالية',
    'subscription.visitor': 'زائر',
    'subscription.partner': 'شريك',
    'subscription.exhibitor': 'عارض',
    'subscription.features': 'المميزات',
    'subscription.included': 'مضمون',
    'subscription.not_included': 'غير مضمون',
    'subscription.upgrade': 'ترقية',
    'subscription.current_plan': 'الخطة الحالية',
    
    // Legal Pages
    'legal.terms_title': 'شروط الخدمة',
    'legal.privacy_title': 'سياسة الخصوصية',
    'legal.cookies_title': 'سياسة الكوكيز',
    'legal.last_update': 'آخر تحديث',
    'legal.acceptance': 'القبول',
    'legal.usage': 'الاستخدام المقبول',
    'legal.data_collection': 'جمع البيانات',
    'legal.contact': 'تواصل معنا',
    
    // Support & Help
    'support.title': 'الدعم والمساعدة',
    'support.description': 'نحن هنا لمساعدتك',
    'support.contact_form': 'نموذج الاتصال',
    'support.faq': 'الأسئلة الشائعة',
    
    // Detail Pages
    'detail.overview': 'نظرة عامة',
    'detail.contact': 'تواصل معنا',
    'detail.book_appointment': 'حجز موعد',
    'detail.add_favorite': 'إضافة إلى المفضلات',
    'detail.share': 'مشاركة',
    'detail.products': 'المنتجات',
    'detail.services': 'الخدمات',
    'detail.team': 'الفريق',
    
    // Networking Page
    'networking.description': 'اتصالات ذكية بناءً على ملفك الشخصي',
    'networking.connections': 'اتصالاتي',
    'networking.favorites': 'مفضلاتي',
    'networking.find_matches': 'العثور على مطابقات',
    'networking.compatibility': 'التوافق',
    
    // API Page
    'api.title': 'واجهة برمجة التطبيقات SIPORTS',
    'api.description': 'دمج SIPORTS في تطبيقاتك',
    'api.documentation': 'توثيق API',
    'api.authentication': 'المصادقة',
    'api.endpoints': 'نقاط النهاية',
    'api.rate_limiting': 'تحديد المعدل',
    'api.webhook': 'الخطافات الويب',
    'api.get_started': 'ابدأ الآن',
    
    // Badge Page
    'badge.title': 'شارتي',
    'badge.badge_info': 'معلومات الشارة',
    'badge.access_level': 'مستوى الوصول',
    'badge.qr_code': 'رمز الاستجابة السريعة',
    'badge.download': 'تحميل',
    'badge.print': 'طباعة',
    'badge.share': 'مشاركة',
    
    // Enhanced Networking
    'enhanced_networking.title': 'الشبكات المتقدمة',
    'enhanced_networking.ai_matching': 'المطابقة بالذكاء الاصطناعي',
    'enhanced_networking.analytics': 'التحليلات',
    'enhanced_networking.compatibility_score': 'درجة التوافق',
    'enhanced_networking.mutual_connections': 'الاتصالات المتبادلة',
    
    // Upgrade Pages
    'upgrade.partner_title': 'خطط الاشتراك للشركاء',
    'upgrade.partner_description': 'زيادة رؤيتك في SIPORTS 2026',
    'upgrade.visitor_title': 'ترقيات الزوار',
    'upgrade.visitor_description': 'الوصول إلى الميزات المميزة',
    'upgrade.payment_method': 'طريقة الدفع',
    'upgrade.card': 'بطاقة الائتمان',
    'upgrade.paypal': 'PayPal',
    'upgrade.bank_transfer': 'تحويل بنكي',
    'upgrade.amount': 'المبلغ',
    'upgrade.total': 'الإجمالي',
    
    // User Management
    'users.title': 'إدارة المستخدمين',
    'users.total': 'إجمالي المستخدمين',
    'users.active': 'المستخدمون النشطون',
    'users.search': 'البحث عن المستخدمين',
    'users.filter': 'التصفية حسب النوع',
    'users.status': 'الحالة',
    'users.action': 'الإجراءات',
    'users.delete': 'حذف',
    
    // Partner Detail Page
    'partner_detail.about': 'نبذة عن',
    'partner_detail.projects': 'المشاريع',
    'partner_detail.contact_info': 'معلومات الاتصال',
    'partner_detail.request_meeting': 'طلب اجتماع',
    'partner_detail.back': 'العودة',
    
    // Product Detail Page
    'product_detail.specifications': 'المواصفات',
    'product_detail.price': 'السعر',
    'product_detail.availability': 'التوفر',
    'product_detail.request_demo': 'طلب عرض توضيحي',
    'product_detail.contact_supplier': 'التواصل مع المورد',
    
    // Reset Password
    'password.reset_title': 'إعادة تعيين كلمة المرور',
    'password.reset_description': 'أدخل كلمة المرور الجديدة',
    'password.new_password': 'كلمة المرور الجديدة',
    'password.confirm': 'تأكيد',
    'password.error': 'خطأ في إعادة تعيين كلمة المرور',
  },
    
    
    
    
    
    
    
    
    
    
    
    
    // Dashboards
    
    // Visitor Dashboard
    
    // Partner Dashboard
    
    // Exhibitor Dashboard
    
    // Contact Page
    
    // Venue Page
    // News Page
    
    // Partnership Page
    
    // Upgrade Pages
    
    // User Management
    
    // Partner Detail Page
    
    // Product Detail Page
    
    // Reset Password
};