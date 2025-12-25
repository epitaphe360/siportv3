import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocation, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CheckCircle, Home, Mail } from 'lucide-react';
import { ROUTES } from '../lib/routes';

export default function ContactSuccessPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { firstName, email, messageId } = location.state || {};

  // Si pas de donnÃ©es (accÃ¨s direct Ã  la page), rediriger vers contact
  if (!firstName || !email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Aucun message trouvÃ©
          </h1>
          <p className="text-gray-600 mb-6">
            Il semblerait que vous ayez accÃ©dÃ© Ã  cette page directement. Veuillez remplir le formulaire de contact pour nous envoyer un message.
          </p>
          <Link to={ROUTES.CONTACT}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Mail className="h-4 w-4 mr-2" />
              Aller au formulaire de contact
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Message envoyÃ© avec succÃ¨s !
          </h1>

          {/* Personalized message */}
          <p className="text-lg text-gray-600 mb-8">
            Merci <span className="font-semibold text-gray-900">{firstName}</span> pour votre message. Notre Ã©quipe vous rÃ©pondra dans les plus brefs dÃ©lais Ã  l'adresse{' '}
            <span className="font-semibold text-blue-600">{email}</span>.
          </p>

          {/* Additional info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Et maintenant ?
            </h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">âœ“</span>
                <span>Votre message a Ã©tÃ© enregistrÃ© dans notre systÃ¨me{messageId ? ` (RÃ©f: ${messageId.substring(0, 8)})` : ''}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">âœ“</span>
                <span>Vous recevrez une confirmation par email dans quelques instants</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">âœ“</span>
                <span>Notre Ã©quipe vous rÃ©pondra sous 24-48 heures ouvrÃ©es</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">âœ“</span>
                <span>VÃ©rifiez vos spams si vous ne recevez pas notre rÃ©ponse</span>
              </li>
            </ul>
          </div>

          {/* Call to action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              En attendant notre rÃ©ponse...
            </h3>
            <p className="text-gray-700 mb-4">
              DÃ©couvrez les exposants, Ã©vÃ©nements et pavillons de SIPORTS 2026
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={ROUTES.EXHIBITORS}>
                <Button variant="outline" className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50">
                  DÃ©couvrir les exposants
                </Button>
              </Link>
              <Link to={ROUTES.EVENTS}>
                <Button variant="outline" className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50">
                  Voir le programme
                </Button>
              </Link>
            </div>
          </div>

          {/* Back to home */}
          <Link to={ROUTES.HOME}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Home className="h-4 w-4 mr-2" />
              Retour Ã  l'accueil
            </Button>
          </Link>

          {/* Support contact */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Besoin d'aide immÃ©diate ?{' '}
              <a
                href="mailto:contact@siportevent.com"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                contact@siportevent.com
              </a>
              {' '}ou{' '}
              <a
                href="tel:+212123456789"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                +212 1 23 45 67 89
              </a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}



