/**
 * Informations bancaires pour les virements Partenaires et Exposants
 * Configuration des montants selon le tier (Museum, Silver, Gold, Platinum)
 */

import { PartnerTier } from './partnerTiers';

export const PARTNER_BANK_TRANSFER_INFO = {
  // Informations du compte bancaire
  bankName: 'Banque Internationale de Commerce',
  accountHolder: 'SIPORT - Salon International des Technologies',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'BICFRPPXXX',
  swift: 'BICFRPPXXX',

  // Montants par tier (en USD)
  amounts: {
    museum: {
      amount: 20000.00,
      currency: 'USD',
      tier: 'museum' as PartnerTier,
      displayName: 'Museum Partner',
      description: 'Partenariat Museum - Visibilité de base',
      features: [
        '1 stand de 9m²',
        '10 rendez-vous B2B',
        '3 membres d\'équipe',
        'Logo sur site web',
        'Listing dans catalogue'
      ]
    },
    silver: {
      amount: 48000.00,
      currency: 'USD',
      tier: 'silver' as PartnerTier,
      displayName: 'Silver Partner',
      description: 'Partenariat Silver - Visibilité renforcée',
      features: [
        '2 stands de 18m² total',
        '30 rendez-vous B2B',
        '5 membres d\'équipe',
        'Logo premium sur site',
        'Article de blog dédié',
        'Présence réseaux sociaux'
      ]
    },
    gold: {
      amount: 68000.00,
      currency: 'USD',
      tier: 'gold' as PartnerTier,
      displayName: 'Gold Partner',
      description: 'Partenariat Gold - Visibilité maximale',
      features: [
        '3 stands de 27m² total',
        '50 rendez-vous B2B',
        '8 membres d\'équipe',
        'Logo premium + bannière',
        'Conférence dédiée 30min',
        'Campagne email dédiée',
        'Article de presse'
      ]
    },
    platinium: {
      amount: 98000.00,
      currency: 'USD',
      tier: 'platinium' as PartnerTier,
      displayName: 'Platinum Partner',
      description: 'Partenariat Platinum - Visibilité VIP exclusive',
      features: [
        '5 stands de 45m² total',
        'Rendez-vous B2B illimités',
        '15 membres d\'équipe',
        'Logo VIP + bannière homepage',
        'Keynote 60min',
        'Campagne marketing complète',
        'Communiqué de presse officiel',
        'Invitations gala VIP'
      ]
    }
  },

  // Instructions de virement (multilingue)
  instructions: {
    fr: {
      title: 'Instructions de virement bancaire pour partenaires',
      steps: [
        'Effectuez le virement depuis votre compte professionnel',
        'Montant exact selon le tier choisi (voir ci-dessus)',
        'Référence obligatoire: Votre ID de demande (fourni après soumission)',
        'Joindre le justificatif de virement (PDF ou screenshot)',
        'Délai de traitement: 2-5 jours ouvrés',
        'Après validation par l\'administrateur, votre compte sera automatiquement activé avec le tier choisi'
      ],
      important: [
        '⚠️ IMPORTANT: Indiquez la référence de paiement dans le libellé du virement',
        '⚠️ Le montant doit être exact selon le tier choisi',
        '⚠️ Conservez votre preuve de virement (vous devrez l\'uploader)',
        '⚠️ Les virements sont en USD - vérifiez le taux de change avec votre banque',
        '⚠️ Vous pouvez suivre l\'état de votre demande dans votre tableau de bord'
      ],
      additionalInfo: [
        'Pour les virements internationaux, des frais bancaires peuvent s\'appliquer',
        'Les virements SEPA (Europe) sont généralement traités en 1-2 jours',
        'Les virements SWIFT internationaux peuvent prendre 3-5 jours',
        'En cas de question, contactez notre service partenaires'
      ]
    },
    en: {
      title: 'Bank Transfer Instructions for Partners',
      steps: [
        'Make the transfer from your business account',
        'Exact amount according to chosen tier (see above)',
        'Mandatory reference: Your request ID (provided after submission)',
        'Attach transfer proof (PDF or screenshot)',
        'Processing time: 2-5 business days',
        'After admin validation, your account will be automatically activated with the chosen tier'
      ],
      important: [
        '⚠️ IMPORTANT: Include the payment reference in the transfer description',
        '⚠️ Amount must be exact according to chosen tier',
        '⚠️ Keep your transfer proof (you will need to upload it)',
        '⚠️ Transfers are in USD - check exchange rate with your bank',
        '⚠️ You can track your request status in your dashboard'
      ],
      additionalInfo: [
        'International transfers may incur bank fees',
        'SEPA transfers (Europe) are typically processed in 1-2 days',
        'International SWIFT transfers may take 3-5 days',
        'For questions, contact our partners support service'
      ]
    },
    ar: {
      title: 'تعليمات التحويل البنكي للشركاء',
      steps: [
        'قم بإجراء التحويل من حسابك المهني',
        'المبلغ الدقيق حسب المستوى المختار (انظر أعلاه)',
        'المرجع إلزامي: معرف الطلب الخاص بك (يتم توفيره بعد التقديم)',
        'إرفاق إثبات التحويل (PDF أو لقطة شاشة)',
        'وقت المعالجة: 2-5 أيام عمل',
        'بعد التحقق من قبل المسؤول، سيتم تفعيل حسابك تلقائيًا بالمستوى المختار'
      ],
      important: [
        '⚠️ مهم: قم بتضمين مرجع الدفع في وصف التحويل',
        '⚠️ يجب أن يكون المبلغ دقيقًا حسب المستوى المختار',
        '⚠️ احتفظ بإثبات التحويل الخاص بك (ستحتاج إلى تحميله)',
        '⚠️ التحويلات بالدولار الأمريكي - تحقق من سعر الصرف مع البنك الخاص بك',
        '⚠️ يمكنك تتبع حالة طلبك في لوحة التحكم الخاصة بك'
      ],
      additionalInfo: [
        'قد تتكبد التحويلات الدولية رسوم بنكية',
        'عادة ما تتم معالجة تحويلات SEPA (أوروبا) في 1-2 أيام',
        'قد تستغرق التحويلات الدولية SWIFT من 3 إلى 5 أيام',
        'للأسئلة، اتصل بخدمة دعم الشركاء لدينا'
      ]
    }
  },

  // Contact support partenaires
  support: {
    email: 'partners@siport.com',
    phone: '+33 7 66 50 45 80',
    whatsapp: '+33 7 66 50 45 80',
    hours: {
      fr: 'Lundi - Vendredi: 9h00 - 18h00 (GMT+1)',
      en: 'Monday - Friday: 9:00 AM - 6:00 PM (GMT+1)',
      ar: 'الاثنين - الجمعة: 9:00 صباحًا - 6:00 مساءً (GMT+1)'
    }
  }
};

/**
 * Générer la référence de paiement pour un partenaire
 * Format: SIPORT-PARTNER-{USER_ID_SHORT}-{TIER}-{TIMESTAMP}
 */
export function generatePartnerPaymentReference(
  userId: string,
  requestId: string,
  tier: PartnerTier
): string {
  const userShort = userId.substring(0, 8).toUpperCase();
  const requestShort = requestId.substring(0, 8).toUpperCase();
  const tierCode = tier.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  return `SIPORT-PARTNER-${userShort}-${tierCode}-${requestShort}-${timestamp}`;
}

/**
 * Valider le format d'une référence de paiement partenaire
 */
export function validatePartnerPaymentReference(reference: string): boolean {
  const pattern = /^SIPORT-PARTNER-[A-F0-9]{8}-(MUS|SIL|GOL|PLA)-[A-F0-9]{8}-\d{6}$/;
  return pattern.test(reference);
}

/**
 * Obtenir les informations de montant pour un tier donné
 */
export function getPartnerTierAmount(tier: PartnerTier) {
  return PARTNER_BANK_TRANSFER_INFO.amounts[tier];
}

/**
 * Calculer le montant d'upgrade entre deux tiers
 */
export function calculateUpgradeAmount(
  currentTier: PartnerTier,
  targetTier: PartnerTier
): number {
  const currentAmount = PARTNER_BANK_TRANSFER_INFO.amounts[currentTier].amount;
  const targetAmount = PARTNER_BANK_TRANSFER_INFO.amounts[targetTier].amount;
  return Math.max(0, targetAmount - currentAmount);
}

/**
 * Convertir USD en autres devises (approximatif)
 */
export function convertPartnerAmount(
  amountUSD: number,
  targetCurrency: 'EUR' | 'MAD' | 'USD'
): number {
  const rates = {
    EUR: 0.92,  // 1 USD = 0.92 EUR
    MAD: 10.15, // 1 USD = 10.15 MAD
    USD: 1.00
  };
  return Math.round(amountUSD * rates[targetCurrency] * 100) / 100;
}

/**
 * Formater un montant avec sa devise
 */
export function formatPartnerAmount(
  amountUSD: number,
  currency: 'USD' | 'EUR' | 'MAD' = 'USD'
): string {
  const amount = convertPartnerAmount(amountUSD, currency);

  switch (currency) {
    case 'EUR':
      return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`;
    case 'MAD':
      return `${amount.toLocaleString('fr-MA', { minimumFractionDigits: 2 })} MAD`;
    case 'USD':
    default:
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }
}
