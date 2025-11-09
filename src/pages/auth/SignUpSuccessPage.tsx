
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
              🎉 Inscription Réussie !
            </h1>

            <p className="text-gray-600 mb-6">
              Félicitations ! Votre demande d'inscription en tant qu'<strong>exposant SIPORTS 2026</strong> a bien été enregistrée dans notre système.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
              <h2 className="font-semibold text-blue-800 mb-3 text-lg">📋 Prochaines Étapes</h2>
              <ul className="space-y-3 text-sm text-blue-700">
                <li className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Email de confirmation :</strong> Un email récapitulatif contenant vos informations d'inscription vous a été envoyé. Veuillez vérifier votre boîte de réception (et vos spams).
                  </span>
                </li>
                <li className="flex items-start">
                  <User className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Validation commerciale :</strong> Notre équipe commerciale SIPORTS vous contactera sous <strong>48 heures ouvrées</strong> pour finaliser les aspects contractuels, commerciaux et financiers de votre participation.
                  </span>
                </li>
                <li className="flex items-start">
                  <Lock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Activation du compte :</strong> Une fois votre dossier validé par nos équipes, votre compte exposant sera <strong>activé</strong> et vous recevrez un email de confirmation avec vos accès complets à la plateforme.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-green-800">
                <strong>✅ Compte créé avec succès !</strong> Votre profil exposant a été enregistré dans notre base de données. Vous pouvez dès maintenant vous connecter pour consulter l'état de votre demande.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-yellow-800">
                <strong>⏳ En attente de validation :</strong> L'accès aux fonctionnalités complètes de la plateforme (mini-site, networking, rendez-vous) sera disponible après validation de votre inscription par nos équipes.
              </p>
            </div>

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
