import { supabase } from '../lib/supabase';
import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Payment Service for SIPORT 2026
 * Handles Stripe, PayPal, and CMI Morocco payment integrations
 */

// Stripe public key (should be in env variables)
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

// PayPal client ID (should be in env variables)
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';

// Payment amounts
export const PAYMENT_AMOUNTS = {
  VIP_PASS: 700, // euros
  VIP_PASS_CENTS: 70000, // cents for Stripe
};

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance
 */
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
}

/**
 * Create Stripe checkout session for VIP pass
 */
export async function createStripeCheckoutSession(userId: string, userEmail: string) {
  try {
    // Call backend function to create checkout session
    const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
      body: {
        userId,
        userEmail,
        amount: PAYMENT_AMOUNTS.VIP_PASS_CENTS,
        currency: 'eur',
        productName: 'Pass Premium VIP SIPORT 2026',
        successUrl: `${window.location.origin}/visitor/payment-success`,
        cancelUrl: `${window.location.origin}/visitor/subscription`,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}

/**
 * Handle Stripe payment redirect
 */
export async function redirectToStripeCheckout(sessionId: string) {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe not loaded');

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
}

/**
 * Create PayPal order for VIP pass
 */
export async function createPayPalOrder(userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: {
        userId,
        amount: PAYMENT_AMOUNTS.VIP_PASS.toString(),
        currency: 'EUR',
        description: 'Pass Premium VIP SIPORT 2026',
      },
    });

    if (error) throw error;

    return data.orderId;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

/**
 * Capture PayPal order after approval
 */
export async function capturePayPalOrder(orderId: string, userId: string) {
  try {
    const { data, error } = await supabase.functions.invoke('capture-paypal-order', {
      body: {
        orderId,
        userId,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

/**
 * Create CMI payment request (Morocco local cards)
 */
export async function createCMIPaymentRequest(userId: string, userEmail: string) {
  try {
    const { data, error } = await supabase.functions.invoke('create-cmi-payment', {
      body: {
        userId,
        userEmail,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'MAD', // Moroccan Dirham
        description: 'Pass Premium VIP SIPORT 2026',
        returnUrl: `${window.location.origin}/visitor/payment-success`,
        cancelUrl: `${window.location.origin}/visitor/subscription`,
      },
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating CMI payment:', error);
    throw error;
  }
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(userId: string): Promise<{
  hasPaid: boolean;
  paymentMethod?: string;
  paidAt?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      return {
        hasPaid: true,
        paymentMethod: data.payment_method,
        paidAt: data.approved_at,
      };
    }

    return { hasPaid: false };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return { hasPaid: false };
  }
}

/**
 * Create payment record in database
 */
export async function createPaymentRecord(params: {
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal' | 'cmi' | 'bank_transfer';
  transactionId?: string;
  status: 'pending' | 'approved' | 'rejected';
}) {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: params.userId,
        requested_level: 'premium',
        amount: params.amount,
        currency: params.currency,
        payment_method: params.paymentMethod,
        transaction_id: params.transactionId,
        status: params.status,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating payment record:', error);
    throw error;
  }
}

/**
 * Upgrade user to VIP after successful payment
 */
export async function upgradeUserToVIP(userId: string, paymentRequestId: string) {
  try {
    // Update user visitor_level to premium
    const { error: userError } = await supabase
      .from('users')
      .update({ visitor_level: 'premium' })
      .eq('id', userId);

    if (userError) throw userError;

    // Mark payment as approved
    const { error: paymentError } = await supabase
      .from('payment_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', paymentRequestId);

    if (paymentError) throw paymentError;

    return true;
  } catch (error) {
    console.error('Error upgrading user to VIP:', error);
    throw error;
  }
}

/**
 * Get payment history for user
 */
export async function getPaymentHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    return [];
  }
}

/**
 * Convert EUR to MAD (Moroccan Dirham)
 * Approximate rate: 1 EUR = 11 MAD
 */
export function convertEURtoMAD(amountEUR: number): number {
  const RATE = 11;
  return Math.round(amountEUR * RATE);
}
