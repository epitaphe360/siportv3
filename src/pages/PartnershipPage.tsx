import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { Handshake, Star, TrendingUp, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getSupportEmail, getSupportPhone, getSupportMessage } from '../lib/config';

export default function PartnershipPage() {
  const { t } = useTranslation();
  const handleContact = () => {
    toast.success(getSupportMessage('partnership'));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Partenariats SIPORTS 2026
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rejoignez l'Ã©cosystÃ¨me portuaire international et bÃ©nÃ©ficiez d'une visibilitÃ© exceptionnelle auprÃ¨s des dÃ©cideurs du secteur.
          </p>
        </div>

        {/* Partnership Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-8 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Partenaire Premium
            </h3>
            <p className="text-gray-600 mb-6">
              VisibilitÃ© maximale avec logo sur tous les supports de communication et prÃ©sence dans les zones VIP.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>â€¢ Logo sur le site web principal</li>
              <li>â€¢ PrÃ©sence dans les newsletters</li>
              <li>â€¢ AccÃ¨s aux zones VIP</li>
              <li>â€¢ Stand dÃ©diÃ© dans les pavillons</li>
            </ul>
            <Button onClick={handleContact} className="w-full">
              Devenir Partenaire Premium
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Partenaire Technique
            </h3>
            <p className="text-gray-600 mb-6">
              Participez aux confÃ©rences techniques et dÃ©montrez votre expertise auprÃ¨s des professionnels du secteur.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>â€¢ Intervention dans les confÃ©rences</li>
              <li>â€¢ PrÃ©sence dans le catalogue officiel</li>
              <li>â€¢ AccÃ¨s aux donnÃ©es des participants</li>
              <li>â€¢ Support marketing personnalisÃ©</li>
            </ul>
            <Button onClick={handleContact} variant="outline" className="w-full">
              Devenir Partenaire Technique
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Partenaire MÃ©dia
            </h3>
            <p className="text-gray-600 mb-6">
              Couvrez l'Ã©vÃ©nement et bÃ©nÃ©ficiez d'un accÃ¨s privilÃ©giÃ© aux informations et aux intervenants.
            </p>
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
              <li>â€¢ AccrÃ©ditation presse complÃ¨te</li>
              <li>â€¢ AccÃ¨s aux confÃ©rences et ateliers</li>
              <li>â€¢ CommuniquÃ©s de presse exclusifs</li>
              <li>â€¢ Photos et vidÃ©os officielles</li>
            </ul>
            <Button onClick={handleContact} variant="outline" className="w-full">
              Devenir Partenaire MÃ©dia
            </Button>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Avantages du Partenariat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                VisibilitÃ© Internationale
              </h3>
              <p className="text-gray-600 mb-4">
                SIPORTS 2026 rassemble plus de 500 exposants et 10 000 visiteurs professionnels du monde entier.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>â€¢ Exposition auprÃ¨s de dÃ©cideurs clÃ©s</li>
                <li>â€¢ Couverture mÃ©diatique internationale</li>
                <li>â€¢ RÃ©seau professionnel Ã©tendu</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Retour sur Investissement
              </h3>
              <p className="text-gray-600 mb-4">
                Nos partenaires bÃ©nÃ©ficient d'un ROI dÃ©montrÃ© grÃ¢ce Ã  notre stratÃ©gie marketing ciblÃ©e.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>â€¢ GÃ©nÃ©ration de leads qualifiÃ©s</li>
                <li>â€¢ OpportunitÃ©s business concrÃ¨tes</li>
                <li>â€¢ Image de marque renforcÃ©e</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Section */}
        <Card className="p-8 text-center">
          <Handshake className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            PrÃªt Ã  nous rejoindre ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contactez notre Ã©quipe commerciale pour discuter de votre projet de partenariat et dÃ©couvrir les opportunitÃ©s adaptÃ©es Ã  vos objectifs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleContact} size="lg">
              Contactez-nous
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(`mailto:${getSupportEmail('commercial')}`)}
            >
              Envoyer un email
            </Button>
          </div>
          <p className="text-gray-500 mt-4">
            Email: {getSupportEmail('commercial')} | TÃ©lÃ©phone: {getSupportPhone('commercial')}
          </p>
        </Card>
      </div>
    </div>
  );
}


