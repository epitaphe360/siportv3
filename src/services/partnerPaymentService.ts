/**
 * Service de paiement pour les upgrades de niveau partenaire
 * Gère Stripe, PayPal, et CMI pour les paiements partenaires
 */

import { PartnerTier, getPartnerTierConfig } from '../config/partnerTiers';

// Constantes de prix (en centimes pour Stripe)
const TIER_PRICES = {
  museum: 2000000,    // $20,000 = 2,000,000 cents
  silver: 4800000,    // $48,000 = 4,800,000 cents
  gold: 6800000,      // $68,000 = 6,800,000 cents
  platinium: 9800000  // $98,000 = 9,800,000 cents
};

// Conversion EUR/MAD pour CMI
const EUR_TO_MAD_RATE = 11;
const USD_TO_EUR_RATE = 0.92;

/**
 * Convertit USD en EUR
 */
export function convertUSDtoEUR(amountUSD: number): number {
  return Math.round(amountUSD * USD_TO_EUR_RATE);
}

/**
 * Convertit USD en MAD
 */
export function convertUSDtoMAD(amountUSD: number): number {
  const amountEUR = convertUSDtoEUR(amountUSD);
  return Math.round(amountEUR * EUR_TO_MAD_RATE);
}

/**
 * STRIPE: Crée une session de paiement Stripe pour upgrade partenaire
 */
export async function createStripePartnerCheckout(
  userId: string,
  userEmail: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ sessionId: string }> {
  try {
    const tierConfig = getPartnerTierConfig(targetTier);
    const amount = TIER_PRICES[targetTier];

    // Si upgrade, calculer la différence
    let finalAmount = amount;
    if (currentTier && currentTier !== targetTier) {
      const currentAmount = TIER_PRICES[currentTier];
      finalAmount = Math.max(0, amount - currentAmount);
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-stripe-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        userEmail,
        amount: finalAmount,
        currency: 'usd',
        productName: `SIPORT 2026 - ${tierConfig.displayName}`,
        productDescription: `Upgrade vers le niveau ${tierConfig.displayName}`,
        metadata: {
          userId,
          partnerTier: targetTier,
          currentTier: currentTier || 'none',
          upgradeType: currentTier ? 'upgrade' : 'initial'
        },
        successUrl: `${window.location.origin}/partner/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/partner/upgrade`
      })
    });

    if (!response.ok) {
      throw new Error('Erreur création session Stripe');
    }

    const data = await response.json();
    return { sessionId: data.sessionId };
  } catch (error) {
    console.error('Erreur createStripePartnerCheckout:', error);
    throw error;
  }
}

/**
 * STRIPE: Redirige vers Stripe Checkout
 */
export async function redirectToStripeCheckout(sessionId: string): Promise<void> {
  const stripe = await import('@stripe/stripe-js').then(m =>
    m.loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  );

  if (!stripe) {
    throw new Error('Stripe non disponible');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });

  if (error) {
    throw error;
  }
}

/**
 * PAYPAL: Crée un ordre PayPal pour upgrade partenaire
 */
export async function createPayPalPartnerOrder(
  userId: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ orderId: string }> {
  try {
    const tierConfig = getPartnerTierConfig(targetTier);
    const amountCents = TIER_PRICES[targetTier];
    const amountUSD = amountCents / 100;

    // Calculer le montant final (upgrade ou initial)
    let finalAmount = amountUSD;
    if (currentTier && currentTier !== targetTier) {
      const currentAmount = TIER_PRICES[currentTier] / 100;
      finalAmount = Math.max(0, amountUSD - currentAmount);
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-paypal-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        amount: finalAmount.toFixed(2),
        currency: 'USD',
        description: `SIPORT 2026 - ${tierConfig.displayName}`,
        customId: `${userId}:${targetTier}:${currentTier || 'none'}`,
        metadata: {
          partnerTier: targetTier,
          currentTier: currentTier || 'none'
        }
      })
    });

    if (!response.ok) {
      throw new Error('Erreur création ordre PayPal');
    }

    const data = await response.json();
    return { orderId: data.orderId };
  } catch (error) {
    console.error('Erreur createPayPalPartnerOrder:', error);
    throw error;
  }
}

/**
 * PAYPAL: Capture un paiement PayPal
 */
export async function capturePayPalPartnerOrder(
  orderId: string,
  userId: string,
  targetTier: PartnerTier
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/capture-paypal-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        orderId,
        userId,
        partnerTier: targetTier
      })
    });

    if (!response.ok) {
      throw new Error('Erreur capture PayPal');
    }

    const data = await response.json();
    return { success: data.success };
  } catch (error) {
    console.error('Erreur capturePayPalPartnerOrder:', error);
    throw error;
  }
}

/**
 * CMI: Crée une demande de paiement CMI
 */
export async function createCMIPartnerPayment(
  userId: string,
  userEmail: string,
  targetTier: PartnerTier,
  currentTier?: PartnerTier
): Promise<{ paymentUrl: string; requestId: string }> {
  try {
    const tierConfig = getPartnerTierConfig(targetTier);
    const amountCents = TIER_PRICES[targetTier];
    const amountUSD = amountCents / 100;

    // Calculer le montant final
    let finalAmount = amountUSD;
    if (currentTier && currentTier !== targetTier) {
      const currentAmount = TIER_PRICES[currentTier] / 100;
      finalAmount = Math.max(0, amountUSD - currentAmount);
    }

    // Convertir en MAD
    const amountMAD = convertUSDtoMAD(finalAmount);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-cmi-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        userId,
        userEmail,
        amount: amountMAD,
        currency: 'MAD',
        description: `SIPORT 2026 - ${tierConfig.displayName}`,
        metadata: {
          partnerTier: targetTier,
          currentTier: currentTier || 'none',
          amountUSD: finalAmount
        },
        callbackUrl: `${window.location.origin}/partner/payment-success`,
        failUrl: `${window.location.origin}/partner/upgrade?error=payment_failed`
      })
    });

    if (!response.ok) {
      throw new Error('Erreur création paiement CMI');
    }

    const data = await response.json();
    return {
      paymentUrl: data.paymentUrl,
      requestId: data.requestId
    };
  } catch (error) {
    console.error('Erreur createCMIPartnerPayment:', error);
    throw error;
  }
}

/**
 * Met à jour le niveau partenaire après paiement réussi
 */
export async function upgradePartnerTier(
  userId: string,
  targetTier: PartnerTier,
  paymentRequestId: string
): Promise<{ success: boolean }> {
  try {
    const { supabase } = await import('../lib/supabase');

    // Mettre à jour le niveau partenaire
    const { error: updateError } = await supabase
      .from('users')
      .update({
        partner_tier: targetTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Erreur mise à jour partner_tier:', updateError);
      throw updateError;
    }

    // Créer une notification
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      message: `Votre niveau partenaire a été mis à jour vers ${getPartnerTierConfig(targetTier).displayName}!`,
      read: false,
      created_at: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Erreur upgradePartnerTier:', error);
    throw error;
  }
}

/**
 * Vérifie le statut d'un paiement
 */
export async function checkPartnerPaymentStatus(sessionId: string): Promise<{
  status: 'pending' | 'completed' | 'failed';
  partnerTier?: PartnerTier;
}> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-payment-status?session_id=${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur vérification statut paiement');
    }

    const data = await response.json();
    return {
      status: data.status,
      partnerTier: data.metadata?.partnerTier
    };
  } catch (error) {
    console.error('Erreur checkPartnerPaymentStatus:', error);
    throw error;
  }
}

/**
 * Formate un prix pour l'affichage
 */
export function formatPartnerPrice(tier: PartnerTier, currency: 'USD' | 'EUR' | 'MAD' = 'USD'): string {
  const amountCents = TIER_PRICES[tier];
  const amountUSD = amountCents / 100;

  switch (currency) {
    case 'EUR':
      return `€${convertUSDtoEUR(amountUSD).toLocaleString('fr-FR')}`;
    case 'MAD':
      return `${convertUSDtoMAD(amountUSD).toLocaleString('fr-MA')} MAD`;
    default:
      return `$${amountUSD.toLocaleString('en-US')}`;
  }
}
