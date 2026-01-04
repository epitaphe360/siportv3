import { User } from '@/types';

/**
 * Helper pour obtenir le nom d'affichage d'un utilisateur
 * Priorité: prénom+nom > company > email
 */
export const getDisplayName = (user: User | null | undefined): string => {
  if (!user) return 'Utilisateur';
  
  // Try profile firstName + lastName
  if (user.profile?.firstName || user.profile?.lastName) {
    const firstName = user.profile.firstName || '';
    const lastName = user.profile.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;
  }
  
  // Try profile company/companyName
  if (user.profile?.company) return user.profile.company;
  if (user.profile?.companyName) return user.profile.companyName;
  
  // Try user.name
  if (user.name) return user.name;
  
  // Fallback to email
  return user.email || 'Utilisateur';
};

/**
 * Helper pour obtenir les initiales d'un utilisateur
 */
export const getUserInitials = (user: User | null | undefined): string => {
  if (!user) return 'U';
  
  if (user.profile?.firstName && user.profile?.lastName) {
    return `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase();
  }
  
  if (user.profile?.company) {
    return user.profile.company.substring(0, 2).toUpperCase();
  }
  
  if (user.name) {
    const parts = user.name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }
  
  if (user.email) {
    return user.email.substring(0, 2).toUpperCase();
  }
  
  return 'U';
};

/**
 * Helper pour vérifier si un utilisateur est connecté
 */
export const isUserConnected = (connections: any[], userId: string, currentUserId: string): boolean => {
  return connections.some(conn => 
    (conn.requester_id === currentUserId && conn.addressee_id === userId) ||
    (conn.addressee_id === currentUserId && conn.requester_id === userId)
  );
};

/**
 * Helper pour vérifier si une demande est en attente
 */
export const isConnectionPending = (pendingConnections: any[], userId: string, currentUserId: string): boolean => {
  return pendingConnections.some(conn => 
    (conn.requester_id === currentUserId && conn.addressee_id === userId) ||
    (conn.addressee_id === currentUserId && conn.requester_id === userId)
  );
};
