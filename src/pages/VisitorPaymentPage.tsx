import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import {
  CreditCard,
  Building2,
  Check,
  ArrowRight,
  Shield,
  Loader,
  AlertCircle,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useAuthStore from '../store/authStore';
import {
  getStripe,
  createStripeCheckoutSession,
  redirectToStripeCheckout,
  createPayPalOrder,
  capturePayPalOrder,
  createCMIPaymentRequest,
  createPaymentRecord,
  PAYPAL_CLIENT_ID,
  PAYMENT_AMOUNTS,
  convertEURtoMAD,
} from '../services/paymentService';
import { ROUTES } from '../lib/routes';

type PaymentMethod = 'stripe' | 'paypal' | 'cmi';

export default function VisitorPaymentPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already VIP
  React.useEffect(() => {
    if (user?.visitor_level === 'premium' || user?.visitor_level === 'vip') {
      toast.success('Vous êtes déjà abonné Premium VIP !');
      navigate(ROUTES.VISITOR_DASHBOARD);
    }
  }, [user, navigate]);

  const handleStripePayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment record
      const paymentRecord = await createPaymentRecord({
        userId: user.id,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'EUR',
        paymentMethod: 'stripe',
        status: 'pending',
      });

      // Create Stripe checkout session
      const session = await createStripeCheckoutSession(user.id, user.email);

      // Redirect to Stripe
      await redirectToStripeCheckout(session.id);
    } catch (err: any) {
      console.error('Stripe payment error:', err);
      setError(err.message || 'Erreur lors du paiement Stripe');
      toast.error('Erreur de paiement Stripe');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalApprove = async (data: any) => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Capture PayPal order
      const captureData = await capturePayPalOrder(data.orderID, user.id);

      // Create payment record
      await createPaymentRecord({
        userId: user.id,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'EUR',
        paymentMethod: 'paypal',
        transactionId: data.orderID,
        status: 'approved', // PayPal approves instantly
      });

      toast.success('Paiement PayPal réussi !');
      navigate('/visitor/payment-success');
    } catch (err: any) {
      console.error('PayPal capture error:', err);
      setError(err.message || 'Erreur lors de la capture PayPal');
      toast.error('Erreur de paiement PayPal');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCMIPayment = async () => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment record
      await createPaymentRecord({
        userId: user.id,
        amount: convertEURtoMAD(PAYMENT_AMOUNTS.VIP_PASS),
        currency: 'MAD',
        paymentMethod: 'cmi',
        status: 'pending',
      });

      // Create CMI payment request
      const cmiData = await createCMIPaymentRequest(user.id, user.email);

      // Redirect to CMI payment gateway
      window.location.href = cmiData.paymentUrl;
    } catch (err: any) {
      console.error('CMI payment error:', err);
      setError(err.message || 'Erreur lors du paiement CMI');
      toast.error('Erreur de paiement CMI');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'stripe' as PaymentMethod,
      name: 'Carte Bancaire',
      description: 'Visa, Mastercard, American Express',
      icon: CreditCard,
      color: 'blue',
      recommended: true,
      fees: '0€ de frais',
    },
    {
      id: 'paypal' as PaymentMethod,
      name: 'PayPal',
      description: 'Paiement sécurisé via votre compte PayPal',
      icon: Shield,
      color: 'indigo',
      fees: '0€ de frais',
    },
    {
      id: 'cmi' as PaymentMethod,
      name: 'Carte Marocaine',
      description: 'CMI - Cartes bancaires marocaines',
      icon: Building2,
      color: 'green',
      fees: 'Paiement en MAD',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Crown className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Paiement Pass Premium VIP
          </h1>
          <p className="text-xl text-gray-600">
            Choisissez votre moyen de paiement préféré
          </p>
        </motion.div>

        {/* Order Summary */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Votre commande</h3>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 line-through text-gray-400">950€</div>
              <div className="text-3xl font-bold text-yellow-600">700€</div>
              <div className="text-sm text-green-600 font-semibold">-250€ d'économie</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Pass Premium VIP - Accès complet 3 jours
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              10 demandes de RDV B2B actives
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Accès événements exclusifs (gala, ateliers, conférences)
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Badge ultra-sécurisé avec photo
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
          >
            <AlertCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-semibold">Erreur de paiement</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Payment Methods */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900">Choisissez votre moyen de paiement</h3>
          {paymentMethods.map((method, index) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-6 cursor-pointer transition-all ${
                  selectedMethod === method.id
                    ? `border-2 border-${method.color}-500 shadow-lg`
                    : 'border-2 border-transparent hover:border-gray-300'
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full bg-${method.color}-100`}>
                      <method.icon className={`h-6 w-6 text-${method.color}-600`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        {method.recommended && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                            Recommandé
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{method.description}</p>
                      <p className="text-xs text-green-600 font-semibold mt-1">{method.fees}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedMethod === method.id ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Buttons */}
        {selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {selectedMethod === 'stripe' && (
              <Button
                onClick={handleStripePayment}
                disabled={isProcessing}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isProcessing ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Payer 700€ par Carte Bancaire
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}

            {selectedMethod === 'paypal' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'EUR' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', label: 'pay' }}
                    createOrder={async () => {
                      if (!user) throw new Error('User not found');
                      return await createPayPalOrder(user.id);
                    }}
                    onApprove={handlePayPalApprove}
                    onError={(err) => {
                      console.error('PayPal error:', err);
                      setError('Erreur PayPal');
                      toast.error('Erreur PayPal');
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {selectedMethod === 'cmi' && (
              <Button
                onClick={handleCMIPayment}
                disabled={isProcessing}
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {isProcessing ? (
                  <>
                    <Loader className="mr-2 h-5 w-5 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <Building2 className="mr-2 h-5 w-5" />
                    Payer {convertEURtoMAD(PAYMENT_AMOUNTS.VIP_PASS)} MAD (carte marocaine)
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )}

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center text-sm text-gray-600">
          <Shield className="h-5 w-5 mr-2 text-green-600" />
          <span>Paiement 100% sécurisé - Vos données sont cryptées</span>
        </div>

        {/* Cancel */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(ROUTES.VISITOR_SUBSCRIPTION)}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            Annuler et retourner aux options d'abonnement
          </button>
        </div>
      </div>
    </div>
  );
}
