/**
 * Informations bancaires pour les virements
 * À afficher aux visiteurs qui demandent le Pass Premium
 */

export const BANK_TRANSFER_INFO = {
  // Informations du compte bancaire
  bankName: 'Banque Internationale de Commerce',
  accountHolder: 'SIPORT - Salon International des Technologies',
  iban: 'FR76 1234 5678 9012 3456 7890 123',
  bic: 'BICFRPPXXX',
  
  // Montants
  amounts: {
    premium: {
      amount: 700.00,
      currency: 'EUR',
      description: 'Pass Premium VIP - Accès 3 jours All Inclusive'
    },
    free: {
      amount: 0.00,
      currency: 'EUR',
      description: 'Pass Gratuit - Inscription immédiate sans paiement'
    }
  },

  // Instructions
  instructions: {
    fr: {
      title: 'Instructions de virement bancaire',
      steps: [
        'Effectuez le virement depuis votre banque en ligne ou en agence',
        'Montant exact: 700,00 EUR',
        'Référence obligatoire: Votre ID de demande (fourni après soumission)',
        'Délai de traitement: 2-3 jours ouvrés',
        'Après validation par l\'administrateur, votre compte sera automatiquement mis à niveau'
      ],
      important: [
        '⚠️ Assurez-vous d\'indiquer la référence de paiement dans le virement',
        '⚠️ Le montant doit être exact (700,00 EUR)',
        '⚠️ Conservez votre preuve de virement (screenshot ou PDF)',
        '⚠️ Vous pourrez suivre l\'état de votre demande dans votre profil'
      ]
    },
    en: {
      title: 'Bank Transfer Instructions',
      steps: [
        'Make the transfer from your online banking or at your bank branch',
        'Exact amount: 700.00 EUR',
        'Mandatory reference: Your request ID (provided after submission)',
        'Processing time: 2-3 business days',
        'After admin validation, your account will be automatically upgraded'
      ],
      important: [
        '⚠️ Make sure to include the payment reference in the transfer',
        '⚠️ Amount must be exact (700.00 EUR)',
        '⚠️ Keep your transfer proof (screenshot or PDF)',
        '⚠️ You can track your request status in your profile'
      ]
    }
  },

  // Contact support
  support: {
    email: 'paiements@siport.com',
    phone: '+33 1 23 45 67 89',
    hours: 'Lundi - Vendredi: 9h00 - 18h00'
  }
};

/**
 * Générer la référence de paiement pour un utilisateur
 * Format: SIPORT-{USER_ID_SHORT}-{TIMESTAMP}
 */
export function generatePaymentReference(userId: string, requestId: string): string {
  const userShort = userId.substring(0, 8).toUpperCase();
  const requestShort = requestId.substring(0, 8).toUpperCase();
  const timestamp = Date.now().toString().substring(-6);
  return `SIPORT-${userShort}-${requestShort}-${timestamp}`;
}

/**
 * Valider le format d'une référence de paiement
 */
export function validatePaymentReference(reference: string): boolean {
  const pattern = /^SIPORT-[A-F0-9]{8}-[A-F0-9]{8}-\d{6}$/;
  return pattern.test(reference);
}
