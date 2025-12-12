/**
 * Service pour la validation reCAPTCHA côté serveur
 */

const RECAPTCHA_SECRET_KEY = import.meta.env.RECAPTCHA_SECRET_KEY || '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

export interface RecaptchaVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Vérifie un token reCAPTCHA côté serveur
 *
 * @param token - Le token reCAPTCHA reçu du frontend
 * @param expectedAction - L'action attendue (optionnel)
 * @param minimumScore - Le score minimum accepté (0.0 - 1.0, par défaut 0.5)
 * @returns {Promise<RecaptchaVerifyResponse>} Résultat de la vérification
 */
export async function verifyRecaptchaToken(
  token: string,
  expectedAction?: string,
  minimumScore: number = 0.5
): Promise<RecaptchaVerifyResponse> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data: RecaptchaVerifyResponse = await response.json();

    // Vérification basique
    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return data;
    }

    // Vérification du score (reCAPTCHA v3)
    if (data.score !== undefined && data.score < minimumScore) {
      console.warn(`reCAPTCHA score too low: ${data.score} < ${minimumScore}`);
      return {
        ...data,
        success: false,
        'error-codes': ['score-too-low'],
      };
    }

    // Vérification de l'action (optionnel)
    if (expectedAction && data.action !== expectedAction) {
      console.warn(`reCAPTCHA action mismatch: expected "${expectedAction}", got "${data.action}"`);
      return {
        ...data,
        success: false,
        'error-codes': ['action-mismatch'],
      };
    }

    return data;
  } catch (error) {
    console.error('Error verifying reCAPTCHA token:', error);
    return {
      success: false,
      'error-codes': ['network-error'],
    };
  }
}

/**
 * Middleware pour valider reCAPTCHA dans une requête
 *
 * @example
 * // Dans un handler API
 * const recaptchaToken = req.body.recaptchaToken;
 * const isValid = await validateRecaptchaMiddleware(recaptchaToken, 'submit_registration');
 * if (!isValid) {
 *   return res.status(400).json({ error: 'Invalid reCAPTCHA' });
 * }
 */
export async function validateRecaptchaMiddleware(
  token: string | undefined,
  action: string,
  minimumScore: number = 0.5
): Promise<boolean> {
  if (!token) {
    console.error('reCAPTCHA token missing');
    return false;
  }

  const result = await verifyRecaptchaToken(token, action, minimumScore);
  return result.success;
}

/**
 * Scores reCAPTCHA recommandés par action
 */
export const RECAPTCHA_SCORES = {
  REGISTRATION: 0.5, // Inscription utilisateur
  LOGIN: 0.3, // Connexion (plus permissif)
  CONTACT_FORM: 0.5, // Formulaire de contact
  PAYMENT: 0.7, // Paiement (plus strict)
  SENSITIVE_ACTION: 0.8, // Actions sensibles
} as const;

/**
 * Actions reCAPTCHA définies
 */
export const RECAPTCHA_ACTIONS = {
  VISITOR_REGISTRATION: 'visitor_registration',
  EXHIBITOR_REGISTRATION: 'exhibitor_registration',
  PARTNER_REGISTRATION: 'partner_registration',
  LOGIN: 'login',
  CONTACT_FORM: 'contact_form',
  EVENT_REGISTRATION: 'event_registration',
  PAYMENT_REQUEST: 'payment_request',
} as const;
