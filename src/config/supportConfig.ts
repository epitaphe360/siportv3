/**
 * Configuration du support client WhatsApp et des canaux de communication
 */

export const SUPPORT_CONFIG = {
  // WhatsApp - Principal canal de communication
  whatsapp: {
    number: '+33766504580', // Numéro WhatsApp de support
    message: 'Bonjour, je souhaiterais entrer en contact avec votre équipe commerciale',
  },
  
  // Email
  email: 'contact@siportevent.com',
  
  // Téléphone
  phone: '+33766504580',
  
  // Horaires d'ouverture
  hours: {
    weekdays: '9h00 - 18h00', // Lundi à Vendredi
    weekend: 'Fermé',
    timezone: 'GMT+1 (Heure du Maroc)',
  },

  // Adresse
  address: {
    street: 'El Jadida',
    city: 'El Jadida',
    country: 'Maroc',
    zip: '24000',
  },

  // Équipes
  teams: {
    commercial: {
      name: 'Équipe Commerciale',
      whatsapp: '+33766504580',
      email: 'commercial@siportevent.com',
    },
    support: {
      name: 'Support Technique',
      whatsapp: '+33766504580',
      email: 'support@siportevent.com',
    },
    exhibitors: {
      name: 'Exposants',
      whatsapp: '+33766504580',
      email: 'exposants@siports.com',
    },
  },
};

// Fonction utilitaire pour générer un lien WhatsApp
export const generateWhatsAppLink = (
  phoneNumber: string,
  message?: string
): string => {
  const cleanNumber = phoneNumber.replace(/\s/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

// Fonction utilitaire pour ouvrir WhatsApp
export const openWhatsApp = (phoneNumber: string, message?: string): void => {
  const link = generateWhatsAppLink(phoneNumber, message);
  window.open(link, '_blank');
};
