/**
 * Configuration des niveaux partenaires et leurs quotas
 * 4 niveaux : Platinium, Gold, Silver, Musée
 *
 * ✅ FIX P0-3: Import des montants depuis Single Source of Truth
 */

import { PARTNER_BILLING } from './partnerBilling';

export type PartnerTier = 'museum' | 'silver' | 'gold' | 'platinum';

export interface PartnerTierConfig {
  id: PartnerTier;
  name: string;
  displayName: string;
  price: number; // en USD
  color: string;
  icon: string;

  // Quotas et limites
  quotas: {
    appointments: number;          // Nombre de RDV B2B
    eventRegistrations: number;    // Inscriptions aux événements
    mediaUploads: number;          // Fichiers média (vidéos, brochures)
    teamMembers: number;           // Nombre de membres d'équipe
    standsAllowed: number;         // Nombre de stands autorisés
    promotionalEmails: number;     // Emails promotionnels par mois
    showcaseProducts: number;      // Produits/services à présenter
    analyticsAccess: boolean;      // Accès aux analytics avancées
    leadExports: number;           // Exports de leads par mois
  };

  // Fonctionnalités incluses
  features: string[];

  // Avantages exclusifs
  exclusivePerks: string[];
}

export const PARTNER_TIERS: Record<PartnerTier, PartnerTierConfig> = {
  museum: {
    id: 'museum',
    name: 'Museum',
    displayName: 'Partenaire Musée',
    price: PARTNER_BILLING.museum.amount, // ✅ Import depuis SSOT ($20k)
    color: '#8B4513',
    icon: '🏛️',

    quotas: {
      appointments: 20,
      eventRegistrations: 5,
      mediaUploads: 10,
      teamMembers: 3,
      standsAllowed: 1,
      promotionalEmails: 2,
      showcaseProducts: 5,
      analyticsAccess: false,
      leadExports: 2,
    },

    features: [
      'Logo sur le site (4ème ligne)',
      'Mini-site dédié Premium Exposure',
      'Bannière rotative Web',
      'Présence newsletter',
      'Vidéos "Inside SIPORT"',
      'Interview Live Studio "Meet The Leaders"',
      'Inclusion podcast',
      'Priorité algorithmique',
      'Stand exposition standard',
      '20 rendez-vous B2B',
      '5 inscriptions événements',
      '10 fichiers média',
      '3 membres d\'équipe',
      'Présentation de 5 produits',
      'Badge "Partenaire Musée"',
      'Listing dans l\'annuaire'
    ],

    exclusivePerks: [
      'Logo en 4ème ligne sur le site',
      'Mini-site Premium Exposure',
      'Bannière Web rotative',
      'Présence dans e-mailings',
      'Capsules vidéo marquées',
      'Interview "Meet The Leaders"',
      'Mention "Best Moments"',
      'Présence dans la zone Musée',
      'Accès aux conférences',
      'Networking de base'
    ]
  },

  silver: {
    id: 'silver',
    name: 'Silver',
    displayName: 'Pass Silver',
    price: PARTNER_BILLING.silver.amount, // ✅ Import depuis SSOT
    color: '#C0C0C0',
    icon: '🥈',

    quotas: {
      appointments: 50,
      eventRegistrations: 10,
      mediaUploads: 30,
      teamMembers: 5,
      standsAllowed: 1,
      promotionalEmails: 5,
      showcaseProducts: 15,
      analyticsAccess: true,
      leadExports: 10,
    },

    features: [
      'Stand exposition premium',
      '50 rendez-vous B2B',
      '10 inscriptions événements',
      '30 fichiers média',
      '5 membres d\'équipe',
      'Présentation de 15 produits',
      'Analytics avancées',
      '10 exports leads/mois',
      '5 emails promotionnels/mois',
      'Badge Silver premium',
      'Listing prioritaire annuaire'
    ],

    exclusivePerks: [
      'Emplacement stand prioritaire',
      'Logo sur support communication',
      'Accès VIP conférences',
      'Networking avancé',
      'Session pitch 10 min'
    ]
  },

  gold: {
    id: 'gold',
    name: 'Gold',
    displayName: 'Pass Gold',
    price: PARTNER_BILLING.gold.amount, // ✅ Import depuis SSOT
    color: '#FFD700',
    icon: '🥇',

    quotas: {
      appointments: 100,
      eventRegistrations: 20,
      mediaUploads: 75,
      teamMembers: 10,
      standsAllowed: 2,
      promotionalEmails: 10,
      showcaseProducts: 30,
      analyticsAccess: true,
      leadExports: 50,
    },

    features: [
      'Stand exposition VIP (2 stands)',
      '100 rendez-vous B2B',
      '20 inscriptions événements',
      '75 fichiers média',
      '10 membres d\'équipe',
      'Présentation de 30 produits',
      'Analytics premium',
      '50 exports leads/mois',
      '10 emails promotionnels/mois',
      'Badge Gold VIP',
      'Top listing annuaire',
      'Page partenaire personnalisée'
    ],

    exclusivePerks: [
      'Emplacement stand premium',
      'Logo grand format communication',
      'Accès VIP tous événements',
      'Networking illimité',
      'Session pitch 20 min',
      'Article blog dédié',
      'Post réseaux sociaux',
      'Invitation soirée gala'
    ]
  },

  platinum: {
    id: 'platinum',
    name: 'Platinium',
    displayName: 'Pass Platinium',
    price: PARTNER_BILLING.platinum.amount, // ✅ Import depuis SSOT
    color: '#E5E4E2',
    icon: '💎',

    quotas: {
      appointments: -1, // illimité
      eventRegistrations: -1, // illimité
      mediaUploads: 200,
      teamMembers: 20,
      standsAllowed: 3,
      promotionalEmails: -1, // illimité
      showcaseProducts: 100,
      analyticsAccess: true,
      leadExports: -1, // illimité
    },

    features: [
      'Stand exposition Platinium (3 stands)',
      'Rendez-vous B2B illimités',
      'Inscriptions événements illimitées',
      '200 fichiers média',
      '20 membres d\'équipe',
      'Présentation de 100 produits',
      'Analytics intelligence artificielle',
      'Exports leads illimités',
      'Emails promotionnels illimités',
      'Badge Platinium Executive',
      'Featured listing annuaire',
      'Mini-site partenaire personnalisé',
      'Dashboard analytics avancé'
    ],

    exclusivePerks: [
      'Emplacement stand premium exclusif',
      'Logo sponsor principal',
      'Accès VIP Executive',
      'Networking illimité premium',
      'Keynote speech 30 min',
      'Série d\'articles blog',
      'Campagne réseaux sociaux dédiée',
      'Invitation soirée gala + tables VIP',
      'Mention sponsors page d\'accueil',
      'Video testimonial',
      'Interview presse',
      'Concierge service dédié'
    ]
  }
};

/**
 * Récupère la configuration d'un niveau partenaire
 */
export function getPartnerTierConfig(tier: PartnerTier | string): PartnerTierConfig {
  return PARTNER_TIERS[tier as PartnerTier] || PARTNER_TIERS.museum;
}

/**
 * Récupère le quota pour un type spécifique
 * -1 signifie illimité, retourne un grand nombre pour l'UI
 */
export function getPartnerQuota(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): number {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') return quota ? 999999 : 0;
  return quota === -1 ? 999999 : quota;
}

/**
 * Vérifie si un partenaire a accès à une fonctionnalité
 */
export function hasPartnerAccess(tier: PartnerTier | string, quotaType: keyof PartnerTierConfig['quotas']): boolean {
  const config = getPartnerTierConfig(tier);
  const quota = config.quotas[quotaType];

  if (typeof quota === 'boolean') return quota;
  return quota !== 0;
}

/**
 * Calcule le quota restant pour un partenaire
 */
export function calculatePartnerRemainingQuota(
  tier: PartnerTier | string,
  quotaType: keyof PartnerTierConfig['quotas'],
  currentUsage: number
): number {
  const quota = getPartnerQuota(tier, quotaType);
  if (quota === 999999) return 999999; // illimité
  return Math.max(0, quota - currentUsage);
}

/**
 * Retourne la liste des niveaux partenaires triés par prix
 */
export function getPartnerTiersSorted(): PartnerTierConfig[] {
  return Object.values(PARTNER_TIERS).sort((a, b) => a.price - b.price);
}

/**
 * Vérifie si un upgrade est possible
 */
export function canUpgradeTo(currentTier: PartnerTier | string, targetTier: PartnerTier): boolean {
  const current = getPartnerTierConfig(currentTier);
  const target = getPartnerTierConfig(targetTier);
  return target.price > current.price;
}

/**
 * Calcule le prix d'upgrade (différence entre les deux niveaux)
 */
export function calculateUpgradePrice(currentTier: PartnerTier | string, targetTier: PartnerTier): number {
  const current = getPartnerTierConfig(currentTier);
  const target = getPartnerTierConfig(targetTier);
  return Math.max(0, target.price - current.price);
}

/**
 * Vérifie si le quota est atteint
 */
export function isQuotaReached(
  tier: PartnerTier | string,
  quotaType: keyof PartnerTierConfig['quotas'],
  currentUsage: number
): boolean {
  const remaining = calculatePartnerRemainingQuota(tier, quotaType, currentUsage);
  return remaining === 0;
}

/**
 * Mapping des couleurs pour les badges
 */
export const PARTNER_TIER_COLORS: Record<PartnerTier, string> = {
  museum: '#8B4513',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2'
};

/**
 * Ordre des niveaux (pour comparaisons)
 */
export const PARTNER_TIER_ORDER: PartnerTier[] = ['museum', 'silver', 'gold', 'platinum'];

/**
 * Retourne l'index du niveau (pour comparaisons)
 */
export function getPartnerTierIndex(tier: PartnerTier | string): number {
  return PARTNER_TIER_ORDER.indexOf(tier as PartnerTier);
}

/**
 * Compare deux niveaux partenaires
 * Retourne: -1 si tier1 < tier2, 0 si égal, 1 si tier1 > tier2
 */
export function comparePartnerTiers(tier1: PartnerTier | string, tier2: PartnerTier | string): number {
  const index1 = getPartnerTierIndex(tier1);
  const index2 = getPartnerTierIndex(tier2);

  if (index1 < index2) return -1;
  if (index1 > index2) return 1;
  return 0;
}
