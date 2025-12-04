/**
 * Configuration des quotas pour les différents niveaux de visiteurs
 * Ces valeurs doivent correspondre à celles de la table visitor_levels dans Supabase
 */

export const VISITOR_QUOTAS: Record<string, number> = {
  free: 0,
  premium: -1 // -1 signifie illimité
};

export const getVisitorQuota = (level: string | undefined): number => {
  const quota = VISITOR_QUOTAS[level || 'free'] || 0;
  // -1 signifie illimité, on retourne un très grand nombre pour l'UI
  return quota === -1 ? 999999 : quota;
};

export const calculateRemainingQuota = (
  level: string | undefined,
  confirmedCount: number
): number => {
  const quota = getVisitorQuota(level);
  return Math.max(0, quota - confirmedCount);
};


export const VISITOR_LEVELS: Record<string, { label: string, color: string, icon: string, access: string[] }> = {
  free: { label: 'Free Pass', color: '#6c757d', icon: '🟢', access: ['Accès limité', 'Networking de base'] },
  premium: { label: 'Premium VIP Pass', color: '#ffd700', icon: '👑', access: ['Accès VIP complet 3 jours', 'Rendez-vous illimités', 'Networking illimité', 'Service concierge'] }
};

/**
 * Retourne les informations détaillées pour un niveau de visiteur donné.
 * @param level Le niveau du visiteur.
 * @returns Les informations du niveau.
 */
export function getVisitorLevelInfo(level: string) {
  return VISITOR_LEVELS[level] || VISITOR_LEVELS.free;
}

