import { supabase } from '../lib/supabase';
import { UserBadge } from '../types';

/**
 * Service de gestion des badges utilisateurs avec QR code
 * Supporte tous les types d'utilisateurs: visiteurs, exposants, partenaires
 */

/**
 * Récupère le badge d'un utilisateur
 * ✅ SECURITY FIX: Verify user ID matches current authenticated user
 */
export async function getUserBadge(userId: string): Promise<UserBadge | null> {
  try {
    // Security check: verify user is authenticated and requesting their own badge
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !currentUser) {
      throw new Error('Not authenticated');
    }
    
    if (currentUser.id !== userId) {
      console.warn(`⚠️ SECURITY ALERT: Unauthorized badge access attempt: ${currentUser.id} trying to access ${userId}`);
      throw new Error('Unauthorized: Cannot access badge for other user');
    }

    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Badge n'existe pas encore
        return null;
      }
      throw error;
    }

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error fetching user badge:', error);
    throw error;
  }
}

/**
 * Crée ou met à jour le badge d'un utilisateur
 */
export async function upsertUserBadge(params: {
  userId: string;
  userType: 'visitor' | 'exhibitor' | 'partner' | 'admin';
  userLevel?: string;
  fullName: string;
  companyName?: string;
  position?: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  standNumber?: string;
}): Promise<UserBadge> {
  try {
    const { data, error } = await supabase.rpc('upsert_user_badge', {
      p_user_id: params.userId,
      p_user_type: params.userType,
      p_user_level: params.userLevel || null,
      p_full_name: params.fullName,
      p_company_name: params.companyName || null,
      p_position: params.position || null,
      p_email: params.email,
      p_phone: params.phone || null,
      p_avatar_url: params.avatarUrl || null,
      p_stand_number: params.standNumber || null,
    });

    if (error) throw error;

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error upserting user badge:', error);
    throw error;
  }
}

/**
 * Génère automatiquement un badge pour un utilisateur basé sur son profil
 */
export async function generateBadgeFromUser(userId: string): Promise<UserBadge> {
  try {
    // Récupérer les informations de l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        exhibitors(*),
        partners(*)
      `)
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('User not found');

    // Préparer les paramètres selon le type d'utilisateur
    const badgeParams = {
      userId: user.id,
      userType: user.type,
      userLevel: user.visitor_level,
      fullName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() || user.name,
      email: user.email,
      phone: user.profile?.phone,
      avatarUrl: user.profile?.avatar,
      companyName: undefined as string | undefined,
      position: undefined as string | undefined,
      standNumber: undefined as string | undefined,
    };

    // Ajuster selon le type
    if (user.type === 'exhibitor' && user.exhibitors && user.exhibitors.length > 0) {
      const exhibitor = user.exhibitors[0];
      badgeParams.companyName = exhibitor.companyName;
      badgeParams.position = user.profile?.position;
      badgeParams.standNumber = exhibitor.standNumber;
    } else if (user.type === 'partner' && user.partners && user.partners.length > 0) {
      const partner = user.partners[0];
      badgeParams.companyName = partner.organizationName;
      badgeParams.position = user.profile?.position;
    } else if (user.type === 'visitor') {
      badgeParams.companyName = user.profile?.company;
      badgeParams.position = user.profile?.position;
    }

    return await upsertUserBadge(badgeParams);
  } catch (error) {
    console.error('Error generating badge from user:', error);
    throw error;
  }
}

/**
 * Vérifie un badge par son code
 */
export async function verifyBadgeByCode(badgeCode: string): Promise<UserBadge | null> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('badge_code', badgeCode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    const badge = transformBadgeFromDB(data);

    // Vérifier la validité
    if (badge.status !== 'active') {
      throw new Error(`Badge is ${badge.status}`);
    }

    if (new Date(badge.validUntil) < new Date()) {
      throw new Error('Badge has expired');
    }

    return badge;
  } catch (error) {
    console.error('Error verifying badge:', error);
    throw error;
  }
}

/**
 * Scanne un badge (incrémente le compteur)
 */
export async function scanBadge(badgeCode: string): Promise<UserBadge> {
  try {
    const { data, error } = await supabase.rpc('scan_badge', {
      p_badge_code: badgeCode,
    });

    if (error) throw error;

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error scanning badge:', error);
    throw error;
  }
}

/**
 * Révoque un badge (admin uniquement)
 */
export async function revokeBadge(badgeId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', badgeId);

    if (error) throw error;
  } catch (error) {
    console.error('Error revoking badge:', error);
    throw error;
  }
}

/**
 * Renouvelle la validité d'un badge (admin ou auto-renouvellement)
 */
export async function renewBadge(badgeId: string, daysToAdd: number = 3): Promise<UserBadge> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .update({
        valid_until: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', badgeId)
      .select()
      .single();

    if (error) throw error;

    return transformBadgeFromDB(data);
  } catch (error) {
    console.error('Error renewing badge:', error);
    throw error;
  }
}

/**
 * Transforme les données de la base de données en objet UserBadge
 */
function transformBadgeFromDB(data: any): UserBadge {
  return {
    id: data.id,
    userId: data.user_id,
    badgeCode: data.badge_code,
    userType: data.user_type,
    userLevel: data.user_level,
    fullName: data.full_name,
    companyName: data.company_name,
    position: data.position,
    email: data.email,
    phone: data.phone,
    avatarUrl: data.avatar_url,
    standNumber: data.stand_number,
    accessLevel: data.access_level,
    validFrom: new Date(data.valid_from),
    validUntil: new Date(data.valid_until),
    status: data.status,
    qrData: data.qr_data,
    scanCount: data.scan_count || 0,
    lastScannedAt: data.last_scanned_at ? new Date(data.last_scanned_at) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Génère les données du QR code pour un badge
 */
export function generateQRData(badge: UserBadge): string {
  const qrData = {
    code: badge.badgeCode,
    userId: badge.userId,
    type: badge.userType,
    level: badge.accessLevel,
    validUntil: badge.validUntil.toISOString(),
  };
  return JSON.stringify(qrData);
}

/**
 * Obtient la couleur du badge selon le niveau d'accès
 */
export function getBadgeColor(accessLevel: string): string {
  switch (accessLevel) {
    case 'admin':
      return '#dc3545'; // Rouge
    case 'exhibitor':
      return '#007bff'; // Bleu
    case 'partner':
      return '#6f42c1'; // Violet
    case 'vip':
      return '#ffd700'; // Or
    case 'standard':
    default:
      return '#28a745'; // Vert
  }
}

/**
 * Obtient le libellé du niveau d'accès
 */
export function getAccessLevelLabel(accessLevel: string): string {
  switch (accessLevel) {
    case 'admin':
      return 'Administrateur';
    case 'exhibitor':
      return 'Exposant';
    case 'partner':
      return 'Partenaire';
    case 'vip':
      return 'VIP Premium';
    case 'standard':
    default:
      return 'Standard';
  }
}
