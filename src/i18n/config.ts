import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  fr: {
    translation: {
      nav: {
        dashboard: 'Tableau de bord',
        events: 'Événements',
        exhibitors: 'Exposants',
        subscriptions: 'Abonnements',
        appointments: 'Rendez-vous',
        chat: 'Messagerie',
        networking: 'Networking',
        profile: 'Mon Profil'
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
        dashboard: 'Dashboard',
        events: 'Events',
        exhibitors: 'Exhibitors',
        subscriptions: 'Subscriptions',
        appointments: 'Appointments',
        chat: 'Messages',
        networking: 'Networking',
        profile: 'My Profile'
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
        dashboard: 'Panel de control',
        events: 'Eventos',
        exhibitors: 'Expositores',
       subscriptions: 'Suscripciones',
        appointments: 'Citas',
        chat: 'Mensajes',
        networking: 'Networking',
        profile: 'Mi Perfil'
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
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'es'],

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
