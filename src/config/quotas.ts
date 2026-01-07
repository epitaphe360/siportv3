/**
 * Configuration des quotas pour les différents niveaux de visiteurs
 * Ces valeurs doivent correspondre à celles de la table visitor_levels dans Supabase
 * 
 * CAHIER DES CHARGES:
 * - Visiteur Gratuit: 0 demande RDV B2B
 * - Visiteur VIP (700€): 10 demandes max (incitation à la sélectivité)
 */

export const VISITOR_QUOTAS: Record<string, number> = {
  free: 0,      // FREE: Aucun rendez-vous autorisé (CDC)
  premium: 10,   // VIP: 10 demandes de rendez-vous maximum (CDC)
  vip: 10       // Alias pour VIP
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

