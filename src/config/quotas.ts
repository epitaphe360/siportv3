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
