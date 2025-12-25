import { Card } from '../components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.privacy_title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Collecte des DonnÃ©es</h2>
            <p className="text-gray-700 mb-6">
              SIPORTS 2026 collecte les informations suivantes lorsque vous utilisez notre plateforme :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Informations d'identification (nom, email, tÃ©lÃ©phone)</li>
              <li>Informations professionnelles (sociÃ©tÃ©, poste, secteur)</li>
              <li>DonnÃ©es d'utilisation de la plateforme</li>
              <li>PrÃ©fÃ©rences de communication</li>
              <li>Informations de connexion et de navigation</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Utilisation des DonnÃ©es</h2>
            <p className="text-gray-700 mb-6">
              Vos donnÃ©es sont utilisÃ©es pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir et amÃ©liorer nos services</li>
              <li>Faciliter les connexions professionnelles</li>
              <li>Communiquer avec vous concernant l'Ã©vÃ©nement</li>
              <li>Assurer la sÃ©curitÃ© de la plateforme</li>
              <li>Respecter nos obligations lÃ©gales</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Partage des DonnÃ©es</h2>
            <p className="text-gray-700 mb-6">
              Nous ne vendons pas vos donnÃ©es personnelles. Nous pouvons partager vos informations dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Avec votre consentement explicite</li>
              <li>Pour faciliter les rendez-vous professionnels</li>
              <li>Avec nos prestataires de services (hÃ©bergement, sÃ©curitÃ©)</li>
              <li>Lorsque requis par la loi</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. SÃ©curitÃ© des DonnÃ©es</h2>
            <p className="text-gray-700 mb-6">
              Nous mettons en Å“uvre des mesures de sÃ©curitÃ© appropriÃ©es pour protÃ©ger vos donnÃ©es :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Chiffrement SSL/TLS pour toutes les transmissions</li>
              <li>Stockage sÃ©curisÃ© des donnÃ©es</li>
              <li>ContrÃ´le d'accÃ¨s strict aux donnÃ©es</li>
              <li>Audits de sÃ©curitÃ© rÃ©guliers</li>
              <li>Sauvegardes automatiques</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Vos Droits</h2>
            <p className="text-gray-700 mb-6">
              ConformÃ©ment au RGPD, vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li><strong>Droit d'accÃ¨s :</strong> Consulter vos donnÃ©es personnelles</li>
              <li><strong>Droit de rectification :</strong> Corriger vos donnÃ©es inexactes</li>
              <li><strong>Droit Ã  l'effacement :</strong> Supprimer vos donnÃ©es</li>
              <li><strong>Droit Ã  la portabilitÃ© :</strong> RÃ©cupÃ©rer vos donnÃ©es</li>
              <li><strong>Droit d'opposition :</strong> Refuser certains traitements</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cookies et TraÃ§age</h2>
            <p className="text-gray-700 mb-6">
              Nous utilisons des cookies pour amÃ©liorer votre expÃ©rience :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Cookies essentiels pour le fonctionnement du site</li>
              <li>Cookies analytiques pour comprendre l'utilisation</li>
              <li>Cookies de prÃ©fÃ©rences pour mÃ©moriser vos choix</li>
              <li>Cookies marketing (avec votre consentement)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Conservation des DonnÃ©es</h2>
            <p className="text-gray-700 mb-6">
              Nous conservons vos donnÃ©es aussi longtemps que nÃ©cessaire pour :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir nos services</li>
              <li>Respecter nos obligations lÃ©gales</li>
              <li>RÃ©soudre les litiges</li>
              <li>Maintenir la sÃ©curitÃ©</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant cette politique de confidentialitÃ© :
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>DÃ©lÃ©guÃ© Ã  la Protection des DonnÃ©es</strong><br />
                Email : privacy@siportevent.com<br />
                TÃ©lÃ©phone : +212 1 23 45 67 92<br />
                Adresse : El Jadida, Maroc
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


