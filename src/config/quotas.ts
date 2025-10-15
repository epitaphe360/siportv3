/**
 * Configuration des quotas pour les différents niveaux de visiteurs
 * Ces valeurs doivent correspondre à celles de la table visitor_levels dans Supabase
 */

export const VISITOR_QUOTAS: Record<string, number> = {
  free: 0,
  basic: 2,
  premium: 5,
  vip: 99
};

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
  free: { label: 'Free Pass', color: '#6c757d', icon: '🟢', access: ['Accès limité', 'Networking'] },
  basic: { label: 'Basic Pass', color: '#007bff', icon: '🔵', access: ['Accès 1 jour', '2 RDV garantis'] },
  premium: { label: 'Premium Pass', color: '#17a2b8', icon: '🟣', access: ['Accès 2 jours', '5 RDV garantis'] },
  vip: { label: 'VIP Pass', color: '#ffd700', icon: '👑', access: ['Accès All Inclusive', 'Service concierge'] }
};

/**
 * Retourne les informations détaillées pour un niveau de visiteur donné.
 * @param level Le niveau du visiteur.
 * @returns Les informations du niveau.
 */
export function getVisitorLevelInfo(level: string) {
  return VISITOR_LEVELS[level] || VISITOR_LEVELS.free;
}

