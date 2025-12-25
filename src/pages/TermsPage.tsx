import { Card } from '../components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('legal.terms_title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('legal.last_update')}: {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        <Card className="p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptation des Conditions</h2>
            <p className="text-gray-700 mb-6">
              En accÃ©dant et utilisant la plateforme SIPORTS 2026, vous acceptez d'Ãªtre liÃ© par les prÃ©sentes conditions d'utilisation.
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description du Service</h2>
            <p className="text-gray-700 mb-6">
              SIPORTS 2026 est une plateforme digitale qui facilite les connexions professionnelles entre :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Exposants et visiteurs du Salon International des Ports</li>
              <li>Professionnels du secteur portuaire et maritime</li>
              <li>Partenaires et prestataires de services</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Conditions d'Inscription</h2>
            <p className="text-gray-700 mb-6">
              Pour utiliser notre plateforme, vous devez :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>ÃŠtre Ã¢gÃ© d'au moins 18 ans</li>
              <li>Fournir des informations exactes et Ã  jour</li>
              <li>Maintenir la confidentialitÃ© de vos identifiants</li>
              <li>Utiliser la plateforme de maniÃ¨re responsable</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Utilisation Acceptable</h2>
            <p className="text-gray-700 mb-6">
              Vous vous engagez Ã  utiliser la plateforme de maniÃ¨re responsable et Ã  ne pas :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Violer les droits d'autrui</li>
              <li>Publier du contenu inappropriÃ© ou illÃ©gal</li>
              <li>Perturber le fonctionnement de la plateforme</li>
              <li>Utiliser des robots ou scripts automatisÃ©s</li>
              <li>Tenter de compromettre la sÃ©curitÃ©</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. PropriÃ©tÃ© Intellectuelle</h2>
            <p className="text-gray-700 mb-6">
              Tout le contenu de la plateforme SIPORTS 2026 est protÃ©gÃ© par le droit d'auteur :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Le contenu crÃ©Ã© par SIPORTS 2026 reste notre propriÃ©tÃ©</li>
              <li>Vous conservez les droits sur votre contenu personnel</li>
              <li>L'utilisation commerciale nÃ©cessite notre autorisation</li>
              <li>La marque SIPORTS est dÃ©posÃ©e et protÃ©gÃ©e</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. ResponsabilitÃ©s</h2>
            <p className="text-gray-700 mb-6">
              <strong>Nos responsabilitÃ©s :</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir un service de qualitÃ© et sÃ©curisÃ©</li>
              <li>ProtÃ©ger vos donnÃ©es personnelles</li>
              <li>Maintenir la disponibilitÃ© de la plateforme</li>
              <li>RÃ©pondre Ã  vos demandes dans les dÃ©lais raisonnables</li>
            </ul>

            <p className="text-gray-700 mb-6">
              <strong>Vos responsabilitÃ©s :</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Fournir des informations exactes</li>
              <li>Utiliser la plateforme de maniÃ¨re Ã©thique</li>
              <li>Respecter la confidentialitÃ© des autres utilisateurs</li>
              <li>Signaler tout contenu inappropriÃ©</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. RÃ©siliation</h2>
            <p className="text-gray-700 mb-6">
              Nous nous rÃ©servons le droit de suspendre ou rÃ©silier votre compte si :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Vous violez ces conditions d'utilisation</li>
              <li>Vos informations sont inexactes</li>
              <li>Une activitÃ© suspecte est dÃ©tectÃ©e</li>
              <li>Vous ne respectez pas l'esprit de la plateforme</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation de ResponsabilitÃ©</h2>
            <p className="text-gray-700 mb-6">
              Dans les limites permises par la loi, SIPORTS 2026 ne peut Ãªtre tenu responsable de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-6">
              <li>Pertes indirectes ou consÃ©cutives</li>
              <li>Interruptions temporaires du service</li>
              <li>Actions des autres utilisateurs</li>
              <li>Contenus tiers intÃ©grÃ©s Ã  la plateforme</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Modifications</h2>
            <p className="text-gray-700 mb-6">
              Nous nous rÃ©servons le droit de modifier ces conditions Ã  tout moment.
              Les modifications prendront effet immÃ©diatement aprÃ¨s publication.
              Votre utilisation continue de la plateforme constitue l'acceptation des nouvelles conditions.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Droit Applicable</h2>
            <p className="text-gray-700 mb-6">
              Ces conditions sont rÃ©gies par le droit marocain.
              Tout litige sera soumis Ã  la compÃ©tence des tribunaux d'El Jadida.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact</h2>
            <p className="text-gray-700 mb-6">
              Pour toute question concernant ces conditions :
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Service Juridique SIPORTS 2026</strong><br />
                Email : legal@siportevent.com<br />
                TÃ©lÃ©phone : +212 1 23 45 67 93<br />
                Adresse : El Jadida, Maroc
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


