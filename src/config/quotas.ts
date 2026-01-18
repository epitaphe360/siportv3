/**
 * Configuration des quotas pour les différents niveaux de visiteurs
 * Ces valeurs doivent correspondre à celles de la table visitor_levels dans Supabase
 *
 * CAHIER DES CHARGES:
 * - Visiteur Gratuit: 0 demande RDV B2B
 * - Visiteur VIP (700€): 10 demandes max (incitation à la sélectivité)
 * - Exposants: ILLIMITÉ (ils REÇOIVENT les demandes de RDV)
 * - Partenaires: ILLIMITÉ (accès complet au réseau)
 */

export const VISITOR_QUOTAS: Record<string, number> = {
  free: 0,       // FREE: Aucun rendez-vous autorisé (CDC)
  premium: 10,   // VIP: 10 demandes de rendez-vous maximum (CDC)
  vip: 10,       // Alias pour VIP
  // Quotas illimités pour exposants et partenaires
  exhibitor: 999999,  // EXPOSANT: Illimité (ils reçoivent les RDV)
  partner: 999999,    // PARTENAIRE: Illimité
  admin: 999999,      // ADMIN: Illimité
  security: 999999    // SÉCURITÉ: Illimité
};

/**
 * Retourne le quota de rendez-vous B2B pour un niveau/type donné
 * @param level - Le niveau de visiteur (free, premium, vip) OU le type d'utilisateur (exhibitor, partner, admin)
 * @returns Le nombre de RDV autorisés (999999 = illimité)
 */
export const getVisitorQuota = (level: string | undefined): number => {
  return VISITOR_QUOTAS[level || 'free'] || 0;
};

export const calculateRemainingQuota = (
  level: string | undefined,
  confirmedCount: number
): number => {
  const quota = getVisitorQuota(level);
  return Math.max(0, quota - confirmedCount);
};


export const VISITOR_LEVELS: Record<string, { label: string, color: string, icon: string, access: string[] }> = {
  free: { label: 'Free Pass', color: '#6c757d', icon: '🟢', access: ['Accès limité', 'Badge uniquement', 'Aucun rendez-vous'] },
  premium: { label: 'Premium VIP Pass', color: '#ffd700', icon: '👑', access: ['Invitation inauguration', '10 demandes de rendez-vous B2B', 'Networking illimité', 'Ateliers spécialisés', 'Soirée gala exclusive', 'Conférences', 'Déjeuners networking'] },
  vip: { label: 'Premium VIP Pass', color: '#ffd700', icon: '👑', access: ['Invitation inauguration', '10 demandes de rendez-vous B2B', 'Networking illimité', 'Ateliers spécialisés', 'Soirée gala exclusive', 'Conférences', 'Déjeuners networking'] }
};

/**
 * Retourne les informations détaillées pour un niveau de visiteur donné.
 * @param level Le niveau du visiteur.
 * @returns Les informations du niveau.
 */
export function getVisitorLevelInfo(level: string) {
  return VISITOR_LEVELS[level] || VISITOR_LEVELS.free;
}

