
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, User, Lock, Anchor, Clock } from 'lucide-react';

export default function SignUpSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  
  const state = location.state as any;
  const accountType = state?.accountType || 'exhibitor';
  const email = state?.email || '';
  const nextPath = state?.nextPath || '';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirection automatique après 10 secondes pour visiteurs
          if (accountType === 'visitor') {
            navigate(ROUTES.VISITOR_DASHBOARD, {
              state: { message: 'Bienvenue sur SIPORTS 2026 !' }
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, accountType]);

  const isVisitor = accountType === 'visitor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="overflow-hidden">
          {/* Logo header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="bg-white p-2 rounded-lg">
                <Anchor className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">SIPORTS</span>
                <span className="text-xs text-green-100 block leading-none">2026</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20" style={{}} />
                <CheckCircle className="h-20 w-20 text-green-500 relative" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-center text-gray-900 mb-2"
            >
              🎉 Inscription Réussie !
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center text-gray-600 mb-6"
            >
              {isVisitor
                ? 'Félicitations ! Votre compte visiteur a été créé avec succès.'
                : `Félicitations ! Votre demande d'inscription en tant que ${accountType === 'exhibitor' ? 'exposant' : 'partenaire'} a bien été enregistrée.`}
            </motion.p>

            {/* Email confirmation */}
            {email && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900">Email d'inscription</p>
                    <p className="text-blue-700">{email}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`rounded-lg p-6 text-left mb-6 border ${
                isVisitor
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <h2 className={`font-semibold mb-4 text-lg flex items-center ${
                isVisitor ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {isVisitor ? '✅ Vous avez accès à :' : '📋 Prochaines Étapes'}
              </h2>
              <ul className="space-y-3">
                {isVisitor ? (
                  <>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Catalogue complet :</strong> Parcourez les 300+ exposants de SIPORTS 2026</span>
                    </li>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Programme :</strong> Découvrez les conférences et événements</span>
                    </li>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Networking :</strong> Planifiez vos rendez-vous avec les exposants</span>
                    </li>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span><strong>Profil :</strong> Complétez votre profil et explorez les opportunités</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <Mail className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Email de confirmation :</strong> Un email récapitulatif vous a été envoyé. Veuillez vérifier votre boîte de réception.
                      </span>
                    </li>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <Clock className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Validation :</strong> Notre équipe examinera votre demande sous <strong>48 heures ouvrées</strong>.
                      </span>
                    </li>
                    <li className={`flex items-start text-sm ${isVisitor ? 'text-green-800' : 'text-yellow-800'}`}>
                      <Lock className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Activation :</strong> Une fois validé, vous recevrez un email avec vos accès complets.
                      </span>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              {isVisitor ? (
                <>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate(ROUTES.VISITOR_DASHBOARD)}>
                    Aller au tableau de bord
                  </Button>
                  <p className="text-center text-sm text-gray-500">
                    {countdown > 0 && `Redirection automatique dans ${countdown}s...`}
                  </p>
                </>
              ) : (
                <Link to={ROUTES.LOGIN} className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Se connecter
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Support */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center text-sm text-gray-500 mt-6 pt-6 border-t border-gray-200"
            >
              Questions ? <a href="mailto:support@siports.fr" className="text-green-600 hover:text-green-700 font-semibold">Contactez notre support</a>
            </motion.p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

