
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, User, Lock } from 'lucide-react';

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card>
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Inscription Réussie !
            </h1>

            <p className="text-gray-600 mb-6">
              Votre demande d'inscription a bien été prise en compte. Vous allez recevoir un email de confirmation.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-8">
              <h2 className="font-semibold text-blue-800 mb-2">Prochaines Étapes</h2>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Email de confirmation :</strong> Un email récapitulatif vous a été envoyé.
                  </span>
                </li>
                <li className="flex items-start">
                  <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Validation commerciale :</strong> Un commercial SIPORTS vous contactera sous 48h pour finaliser les aspects contractuels et financiers.
                  </span>
                </li>
                <li className="flex items-start">
                  <Lock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Activation du compte :</strong> Une fois votre dossier validé, votre compte sera activé et vous recevrez un email pour vous connecter.
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              En attendant, vous pouvez vous connecter à votre compte, mais l'accès aux fonctionnalités sera limité.
            </p>

            <Link to={ROUTES.LOGIN}>
              <Button className="w-full" variant="default">
                Se connecter
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
