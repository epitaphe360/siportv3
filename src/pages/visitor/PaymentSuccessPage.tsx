import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Crown, Download, ArrowRight, Loader } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';
import { checkPaymentStatus, upgradeUserToVIP } from '../../services/paymentService';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get payment session ID from URL
  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');

  // Helper function to refresh user data from database
  const refreshUserData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    if (data) {
      setUser({
        ...user,
        status: data.status,
        visitor_level: data.visitor_level
      });
    }
  };

  useEffect(() => {
    verifyPaymentAndUpgrade();
  }, [user]);

  async function verifyPaymentAndUpgrade() {
    if (!user) return;

    try {
      setIsVerifying(true);

      // Wait a bit for the database to update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // First, check directly if user is already VIP (status: active AND visitor_level: premium)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('status, visitor_level')
        .eq('id', user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user:', userError);
      }

      // If user is already active with premium level, they're VIP
      if (userData?.status === 'active' && userData?.visitor_level === 'premium') {
        setIsUpgraded(true);
        await refreshUserData();
        toast.success('Paiement confirme ! Vous etes maintenant VIP.');
        return;
      }

      // Check via payment service
      try {
        const paymentStatus = await checkPaymentStatus(user.id);
        if (paymentStatus.hasPaid) {
          setIsUpgraded(true);
          await refreshUserData();
          toast.success('Paiement confirme ! Vous etes maintenant VIP.');
          return;
        }
      } catch (paymentCheckError) {
        console.warn('Payment status check failed:', paymentCheckError);
      }

      // Try to find and process pending payment (fallback)
      try {
        const { data: payments } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);

        if (payments && payments.length > 0) {
          await upgradeUserToVIP(user.id, payments[0].id);
          setIsUpgraded(true);
          await refreshUserData();
          toast.success('Paiement valide ! Vous etes maintenant VIP.');
          return;
        }
      } catch (paymentError) {
        console.warn('Payment records check failed:', paymentError);
      }

      // If we got here and user status is still active (from simulation), consider it success
      if (userData?.status === 'active') {
        setIsUpgraded(true);
        await refreshUserData();
        toast.success('Bienvenue dans le Club VIP !');
        return;
      }

      setError('Impossible de verifier le paiement. Contactez le support.');
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      setError(err.message || 'Erreur lors de la verification du paiement');
    } finally {
      setIsVerifying(false);
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <Loader className="h-16 w-16 mx-auto mb-6 text-blue-600 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification du paiement...</h2>
          <p className="text-gray-600">Veuillez patienter quelques instants</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <Card className="p-12 text-center max-w-md">
          <div className="h-16 w-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">X</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de paiement</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate(ROUTES.VISITOR_SUBSCRIPTION)}
              className="w-full"
            >
              Reessayer le paiement
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@siport2026.com'}
              className="w-full"
            >
              Contacter le support
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-12 text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="h-24 w-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Paiement reussi !
              </h1>
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Crown className="h-8 w-8 text-yellow-500" />
                <p className="text-2xl font-semibold text-yellow-600">
                  Bienvenue dans le Club VIP
                </p>
                <Crown className="h-8 w-8 text-yellow-500" />
              </div>
            </motion.div>

            {/* Confirmation Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <p className="text-lg text-gray-700 mb-4">
                Votre Pass Premium VIP est maintenant actif ! Vous avez desormais acces a toutes les fonctionnalites exclusives de SIPORT 2026.
              </p>
              <div className="inline-block bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Un email de confirmation a ete envoye a <strong>{user?.email}</strong>
                </p>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prochaines etapes
              </h3>
              <div className="space-y-3 text-left">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Telechargez votre badge VIP</p>
                    <p className="text-sm text-gray-600">Badge premium avec photo et QR code securise</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Accedez a votre tableau de bord VIP</p>
                    <p className="text-sm text-gray-600">Toutes les fonctionnalites premium sont maintenant debloquees</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Planifiez vos rendez-vous B2B</p>
                    <p className="text-sm text-gray-600">Rendez-vous B2B ILLIMITES disponibles immediatement</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Button
                onClick={() => navigate(ROUTES.BADGE)}
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-bold"
              >
                <Download className="mr-2 h-5 w-5" />
                Telecharger mon badge VIP
              </Button>
              <Button
                onClick={() => navigate(ROUTES.VISITOR_DASHBOARD)}
                size="lg"
                variant="outline"
                className="w-full"
              >
                Acceder a mon tableau de bord VIP
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Support */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Besoin d'aide ? Contactez-nous a{' '}
                <a href="mailto:support@siport2026.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                  support@siport2026.com
                </a>
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Benefits Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">🤝</div>
            <h4 className="font-semibold text-gray-900 mb-1">Networking Illimite</h4>
            <p className="text-sm text-gray-600">Rencontrez tous les decideurs</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">📅</div>
            <h4 className="font-semibold text-gray-900 mb-1">RDV B2B Illimites</h4>
            <p className="text-sm text-gray-600">Planifiez vos rendez-vous strategiques</p>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h4 className="font-semibold text-gray-900 mb-1">Evenements Exclusifs</h4>
            <p className="text-sm text-gray-600">Gala, ateliers, conferences VIP</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}




