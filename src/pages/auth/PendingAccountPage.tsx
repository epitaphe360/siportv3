
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { motion } from 'framer-motion';
import { Clock, Mail, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function PendingAccountPage() {
  const { logout, user } = useAuthStore();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
              <Clock className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Compte en attente de validation
            </h1>

            <p className="text-gray-600 mb-6">
              Bonjour {user?.profile?.firstName || 'Utilisateur'}, votre demande d'inscription est en cours de traitement.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-8">
              <h2 className="font-semibold text-yellow-800 mb-2">Rappel des prochaines étapes</h2>
              <ul className="space-y-2 text-sm text-yellow-700">
                <li className="flex items-start">
                  <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Validation commerciale :</strong> Un commercial SIPORTS vous contactera pour finaliser votre dossier.
                  </span>
                </li>
                <li className="flex items-start">
                  <Mail className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Activation :</strong> Vous recevrez un email dès que votre compte sera activé.
                  </span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Merci de votre patience. Vous pouvez vous déconnecter en toute sécurité.
            </p>

            <Button onClick={logout} variant="outline" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
