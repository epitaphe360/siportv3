import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/routes';

export default function SignupConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const userType = searchParams.get('type') || 'visitor';
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = () => {
    setCountdown(60);
    // TODO: Implémenter la fonction de renvoi d'email
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-8 md:p-12">
          {/* Icon de succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-green-100 rounded-full p-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
              </div>
            </div>
          </motion.div>

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Inscription réussie !
            </h1>
            <p className="text-gray-600">
              Votre compte a été créé avec succès
            </p>
          </motion.div>

          {/* Email de confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Vérifiez votre boîte email
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Nous avons envoyé un email de confirmation à :
                </p>
                <p className="text-sm font-mono bg-white px-3 py-2 rounded border border-blue-200 text-blue-700 break-all">
                  {email}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4 mb-8"
          >
            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-1 mt-1 flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Ouvrez votre boîte email</strong> et recherchez notre message
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-1 mt-1 flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Cliquez sur le lien de confirmation</strong> dans l'email
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-gray-100 rounded-full p-1 mt-1 flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Connectez-vous</strong> avec vos identifiants
                </p>
              </div>
            </div>
          </motion.div>

          {/* Statut pour partner/exhibitor */}
          {(userType === 'partner' || userType === 'exhibitor') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-amber-900 mb-1">
                    Compte en attente de validation
                  </h4>
                  <p className="text-sm text-amber-700">
                    Après confirmation de votre email, votre compte sera créé avec un statut "En attente de paiement". 
                    Vous pourrez accéder à votre tableau de bord avec des options limitées en attendant la validation du paiement.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bouton de renvoi */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              disabled={countdown > 0}
            >
              <RefreshCw className={`h-4 w-4 ${countdown > 0 ? 'opacity-50' : ''}`} />
              {countdown > 0 ? `Renvoyer (${countdown}s)` : 'Renvoyer l\'email'}
            </Button>

            <Button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="flex-1 flex items-center justify-center gap-2"
            >
              Aller à la connexion
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Note spam */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              Vous ne trouvez pas l'email ? Vérifiez votre dossier spam ou courrier indésirable.
            </p>
          </motion.div>
        </Card>

        {/* Lien d'aide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-gray-600">
            Besoin d'aide ?{' '}
            <button
              onClick={() => navigate(ROUTES.CONTACT)}
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Contactez-nous
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
