import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Building2,
  Check,
  ArrowRight,
  Shield,
  Loader,
  AlertCircle,
  Crown,
  Lock,
  Upload,
  Camera
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
import { supabase } from '../lib/supabase';

// Add this for testing purposes
const IS_DEV = import.meta.env.DEV;

type PaymentMethod = 'stripe' | 'paypal' | 'cmi';

// Schema pour les données VIP manquantes (pour upgrade FREE → VIP)
const upgradeVIPSchema = z.object({
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères')
    .regex(/[A-Z]/, 'Doit contenir une majuscule')
    .regex(/[a-z]/, 'Doit contenir une minuscule')
    .regex(/[0-9]/, 'Doit contenir un chiffre')
    .regex(/[!@#$%^&*]/, 'Doit contenir un caractère spécial'),
  confirmPassword: z.string(),
  position: z.string().optional(),
  company: z.string().optional(),
  photo: z.any().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

type UpgradeVIPForm = z.infer<typeof upgradeVIPSchema>;

export default function VisitorPaymentPage() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit: handleUpgradeSubmit,
    formState: { errors: upgradeErrors },
    setValue
  } = useForm<UpgradeVIPForm>({
    resolver: zodResolver(upgradeVIPSchema),
    mode: 'onChange',
    defaultValues: {
      position: user?.profile?.position || '',
      company: user?.profile?.company || ''
    }
  });

  // Redirect if already VIP
  React.useEffect(() => {
    if (user?.visitor_level === 'premium' || user?.visitor_level === 'vip') {
      toast.success('Vous êtes déjà abonné Premium VIP !');
      navigate(ROUTES.VISITOR_DASHBOARD);
    }
  }, [user?.visitor_level, navigate]);

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
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('Stripe payment error:', err);
      setError((errorInfo.message as string) || 'Erreur lors du paiement Stripe');
      toast.error('Erreur de paiement Stripe');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalApprove = async (data: Record<string, unknown>) => {
    if (!user) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Capture PayPal order
      const captureData = await capturePayPalOrder(data.orderID as string, user.id);

      // Create payment record
      await createPaymentRecord({
        userId: user.id,
        amount: PAYMENT_AMOUNTS.VIP_PASS,
        currency: 'EUR',
        paymentMethod: 'paypal',
        transactionId: data.orderID as string,
        status: 'approved', // PayPal approves instantly
      });

      toast.success('Paiement PayPal réussi !');
      navigate('/visitor/payment-success');
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('PayPal capture error:', err);
      setError((errorInfo.message as string) || 'Erreur lors de la capture PayPal');
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
      window.location.href = cmiData.paymentUrl as string;
    } catch (err: unknown) {
      const errorInfo = err as Record<string, unknown>;
      console.error('CMI payment error:', err);
      setError((errorInfo.message as string) || 'Erreur lors du paiement CMI');
      toast.error('Erreur de paiement CMI');
    } finally {
      setIsProcessing(false);
    }
  };

  // TEST ONLY: Simulate successful payment
  const handleSimulateSuccess = async () => {
    if (!user) return;
    
    // Si l'utilisateur n'a pas de password auth, montrer le formulaire d'upgrade d'abord
    if (!user.profile?.hasPassword) {
      setShowUpgradeForm(true);
      return;
    }
    
    await completeVIPUpgrade();
  };

  // Handler pour photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La photo ne doit pas dépasser 5MB');
        return;
      }
      setPhotoFile(file);
      setValue('photo', e.target.files);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Compléter les données VIP manquantes pour visiteur FREE
  const onSubmitUpgradeData = async (data: UpgradeVIPForm) => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // 1. Upload photo si fournie
      let photoUrl = user.profile?.photoUrl || '';
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('visitor-photos')
          .upload(fileName, photoFile);

        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('visitor-photos')
            .getPublicUrl(fileName);
          photoUrl = urlData.publicUrl;
        }
      }

      // 2. Créer compte auth avec password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: data.password,
        options: {
          data: {
            name: user.name,
            type: 'visitor',
            visitor_level: 'premium'
          }
        }
      });

      if (authError) {
        console.error('Erreur création auth:', authError);
        toast.error('Erreur lors de la création du compte sécurisé');
        return;
      }

      // 3. Mettre à jour profil avec données complètes
      await supabase.from('users').update({
        profile: {
          ...user.profile,
          position: data.position || user.profile?.position,
          company: data.company || user.profile?.company,
          photoUrl,
          hasPassword: true
        }
      }).eq('id', user.id);

      // 4. Mettre à jour le store local
      setUser({
        ...user,
        profile: {
          ...user.profile,
          position: data.position || user.profile?.position,
          company: data.company || user.profile?.company,
          photoUrl,
          hasPassword: true
        }
      });

      toast.success('Profil VIP complété avec succès');
      setShowUpgradeForm(false);
      
      // Maintenant faire l'upgrade VIP
      await completeVIPUpgrade();
    } catch (error) {
      console.error('Erreur upgrade données:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsProcessing(false);
    }
  };

  // Finaliser l'upgrade VIP
  const completeVIPUpgrade = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      // Create payment record (may fail if table doesn't exist - non-blocking)
      try {
        await createPaymentRecord({
          userId: user.id,
          amount: PAYMENT_AMOUNTS.VIP_PASS,
          currency: 'EUR',
          paymentMethod: 'stripe',
          status: 'approved',
          transactionId: `sim_${Date.now()}`
        });
      } catch (paymentError) {
        console.warn('Payment record creation skipped:', paymentError);
      }
      
      // Update user status AND visitor_level to premium
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'active',
          visitor_level: 'premium'
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      // Show success toast
      toast.success('🎉 Paiement VIP simulé avec succès !');
      
      // Navigate to success page
      navigate(ROUTES.VISITOR_PAYMENT_SUCCESS);
    } catch (err) {
      console.error('Simulation error:', err);
      toast.error('Erreur lors de la simulation du paiement');
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

        {/* DEV ONLY: Simulate Payment Button */}
        {IS_DEV && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={handleSimulateSuccess}
              className="text-xs text-gray-500 border-dashed"
            >
              [DEV] Simuler Paiement Réussi
            </Button>
          </div>
        )}

        {/* Cancel */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(ROUTES.VISITOR_SUBSCRIPTION)}
            className="text-gray-600 hover:text-gray-900 text-sm underline"
          >
            Annuler et retourner aux options d'abonnement
          </button>
        </div>

        {/* Modal: Formulaire données VIP complémentaires */}
        {showUpgradeForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Crown className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Finalisation VIP Premium</h2>
                      <p className="text-sm text-gray-600">Complétez votre profil pour finaliser l'upgrade</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpgradeSubmit(onSubmitUpgradeData)} className="space-y-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock className="h-4 w-4 inline mr-1" />
                      Mot de passe sécurisé *
                    </label>
                    <input
                      type="password"
                      {...register('password')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Min. 12 caractères"
                    />
                    {upgradeErrors.password && (
                      <p className="text-red-500 text-xs mt-1">{upgradeErrors.password.message}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Confirmez votre mot de passe"
                    />
                    {upgradeErrors.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{upgradeErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  {/* Position (si manquant) */}
                  {!user?.profile?.position && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fonction
                      </label>
                      <input
                        type="text"
                        {...register('position')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Ex: Directeur Commercial"
                      />
                    </div>
                  )}

                  {/* Company (si manquant) */}
                  {!user?.profile?.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Entreprise
                      </label>
                      <input
                        type="text"
                        {...register('company')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  )}

                  {/* Photo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Camera className="h-4 w-4 inline mr-1" />
                      Photo de profil (optionnelle)
                    </label>
                    <div className="flex items-center space-x-4">
                      {photoPreview && (
                        <img src={photoPreview} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-yellow-400" />
                      )}
                      <label className="cursor-pointer flex-1">
                        <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-yellow-500 transition">
                          <Upload className="h-6 w-6 mx-auto mb-1 text-gray-400" />
                          <span className="text-sm text-gray-600">Cliquer pour choisir une photo</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowUpgradeForm(false)}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="mr-2 h-5 w-5 animate-spin" />
                          Finalisation...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 h-5 w-5" />
                          Finaliser mon profil VIP
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}


