import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Cookie, Settings, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function CookiesPage() {
  const { t } = useTranslation();
  const handleCookieSettings = () => {
    toast.success('Préférences de cookies mises à jour !');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.cookies_title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <Cookie className="h-8 w-8 text-blue-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Qu'est-ce qu'un cookie ?</h2>
          </div>
          <p className="text-gray-700 mb-6">
            Un cookie est un petit fichier texte déposé sur votre ordinateur lorsque vous visitez notre site web.
            Il permet à la plateforme de mémoriser vos préférences et d'améliorer votre expérience utilisateur.
          </p>
        </Card>

        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <Settings className="h-8 w-8 text-green-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">Types de Cookies UtilisÃ©s</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Essentiels</h3>
              <p className="text-gray-700 mb-2">
                NÃ©cessaires au fonctionnement de la plateforme. Ils ne peuvent pas Ãªtre dÃ©sactivÃ©s.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>Authentification et sÃ©curitÃ©</li>
                <li>Gestion de session</li>
                <li>PrÃ©fÃ©rences de langue</li>
                <li>Protection CSRF</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Analytiques</h3>
              <p className="text-gray-700 mb-2">
                Nous aident Ã  comprendre comment vous utilisez la plateforme pour l'amÃ©liorer.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>Pages les plus consultÃ©es</li>
                <li>Temps passÃ© sur le site</li>
                <li>Actions des utilisateurs</li>
                <li>Performances techniques</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Fonctionnels</h3>
              <p className="text-gray-700 mb-2">
                AmÃ©liorent votre expÃ©rience en mÃ©morisant vos prÃ©fÃ©rences.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>ThÃ¨me (clair/sombre)</li>
                <li>Taille de police</li>
                <li>Position des Ã©lÃ©ments</li>
                <li>Historique de recherche</li>
              </ul>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies Marketing</h3>
              <p className="text-gray-700 mb-2">
                UtilisÃ©s pour vous proposer du contenu personnalisÃ© et des offres pertinentes.
              </p>
              <ul className="list-disc pl-6 text-gray-600 text-sm">
                <li>PrÃ©fÃ©rences de contenu</li>
                <li>Recommandations personnalisÃ©es</li>
                <li>Campagnes ciblÃ©es</li>
                <li>RÃ©seaux sociaux intÃ©grÃ©s</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-red-600 mr-4" />
            <h2 className="text-2xl font-bold text-gray-900">DurÃ©e de Conservation</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookies de Session</h3>
              <p className="text-gray-700 text-sm">
                SupprimÃ©s automatiquement Ã  la fermeture du navigateur.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Cookies Persistants</h3>
              <p className="text-gray-700 text-sm">
                ConservÃ©s jusqu'Ã  13 mois maximum selon la lÃ©gislation.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion de vos Cookies</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Essentiels</h3>
                <p className="text-gray-600 text-sm">Toujours activÃ©s - NÃ©cessaires au fonctionnement</p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ActivÃ©
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Analytiques</h3>
                <p className="text-gray-600 text-sm">Aide Ã  amÃ©liorer la plateforme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Fonctionnels</h3>
                <p className="text-gray-600 text-sm">AmÃ©liore votre expÃ©rience utilisateur</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-900">Cookies Marketing</h3>
                <p className="text-gray-600 text-sm">Contenu personnalisÃ© et recommandations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleCookieSettings} size="lg">
              Sauvegarder mes prÃ©fÃ©rences
            </Button>
          </div>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment gÃ©rer les cookies dans votre navigateur</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Chrome</h3>
              <p className="text-gray-600 text-sm mb-2">
                ParamÃ¨tres â†’ ConfidentialitÃ© â†’ Cookies et autres donnÃ©es des sites
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Mozilla Firefox</h3>
              <p className="text-gray-600 text-sm mb-2">
                PrÃ©fÃ©rences â†’ Vie privÃ©e â†’ Cookies
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Safari</h3>
              <p className="text-gray-600 text-sm mb-2">
                PrÃ©fÃ©rences â†’ ConfidentialitÃ© â†’ GÃ©rer les donnÃ©es de sites web
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Microsoft Edge</h3>
              <p className="text-gray-600 text-sm mb-2">
                ParamÃ¨tres â†’ Cookies et autorisations de site
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note :</strong> La dÃ©sactivation de certains cookies peut affecter le fonctionnement de la plateforme
              et limiter certaines fonctionnalitÃ©s.
            </p>
          </div>

          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Besoin d'aide ?</h3>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant les cookies ou vos donnÃ©es personnelles :
            </p>
            <div className="bg-gray-100 p-4 rounded-lg inline-block">
              <p className="text-gray-700">
                <strong>DÃ©lÃ©guÃ© Ã  la Protection des DonnÃ©es</strong><br />
                Email : privacy@siportevent.com<br />
                TÃ©lÃ©phone : +212 1 23 45 67 92
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


