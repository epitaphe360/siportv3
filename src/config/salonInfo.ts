/**
 * Configuration centralisée des informations du salon SIPORTS
 * Ces informations peuvent être surchargées par les données de la table salon_config
 */

export interface SalonConfig {
  name: string;
  dates: {
    start: string;
    end: string;
  };
  location: {
    venue: string;
    city: string;
    country: string;
  };
  hours: {
    opening: string;
    closing: string;
  };
  expectedVisitors: number;
}

export const DEFAULT_SALON_CONFIG: SalonConfig = {
  name: 'SIPORTS 2026',
  dates: {
    start: '1 Avril 2026',
    end: '3 Avril 2026'
  },
  location: {
    venue: 'Mohammed VI Exhibition Center',
    city: 'El Jadida',
    country: 'Maroc'
  },
  hours: {
    opening: '9h',
    closing: '18h'
  },
  expectedVisitors: 6300
};

/**
 * Formate les dates du salon pour l'affichage
 */
export const formatSalonDates = (config: SalonConfig): string => {
  return `${config.dates.start} - ${config.dates.end}`;
};

/**
 * Formate la localisation du salon pour l'affichage
 */
export const formatSalonLocation = (config: SalonConfig): string => {
  return `${config.location.city}, ${config.location.country}`;
};

/**
 * Formate les horaires du salon pour l'affichage
 */
export const formatSalonHours = (config: SalonConfig): string => {
  return `Tous les jours de ${config.hours.opening} à ${config.hours.closing}`;
};
