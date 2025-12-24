import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../hooks/useTranslation';
import { HelpCircle, MessageCircle, FileText, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { CONFIG, getSupportEmail, getSupportPhone, getSupportMessage } from '../lib/config';

export default function SupportPage() {
  const { t } = useTranslation();
  const handleSupportRequest = (type: keyof typeof CONFIG.supportTypes) => {
    const message = getSupportMessage(type.toLowerCase() as keyof typeof CONFIG.messages.support);
    toast.success(message);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('support.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('support.description')}
          </p>
        </div>

        {/* Support Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-8 text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Support Technique
            </h3>
            <p className="text-gray-600 mb-6">
              Problèmes techniques, bugs, ou difficultés d'utilisation de la plateforme.
            </p>
            <Button onClick={() => handleSupportRequest('technical')} className="w-full">
              Contacter le Support
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Support Commercial
            </h3>
            <p className="text-gray-600 mb-6">
              Questions sur les tarifs, partenariats, ou informations sur l'événement.
            </p>
            <Button onClick={() => handleSupportRequest('commercial')} variant="outline" className="w-full">
              Contact Commercial
            </Button>
          </Card>

          <Card className="p-8 text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Support Exposant
            </h3>
            <p className="text-gray-600 mb-6">
              Aide pour la création de profil, gestion de stand, ou fonctionnalités exposant.
            </p>
            <Button onClick={() => handleSupportRequest('exhibitor')} variant="outline" className="w-full">
              Support Exposant
            </Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card className="p-8 mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Questions Fréquentes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Problèmes de connexion
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">J'ai oublié mon mot de passe</h4>
                  <p className="text-gray-600 text-sm">Utilisez le lien "Mot de passe oublié" sur la page de connexion.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Mon compte n'est pas activé</h4>
                  <p className="text-gray-600 text-sm">Vérifiez vos emails ou contactez le support pour l'activation.</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Fonctionnalités de la plateforme
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Comment prendre un rendez-vous ?</h4>
                  <p className="text-gray-600 text-sm">Accédez à la section "Networking" et sélectionnez un exposant.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Comment modifier mon profil ?</h4>
                  <p className="text-gray-600 text-sm">Allez dans "Mon Profil" dans le menu utilisateur.</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-8 text-center">
          <Phone className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Besoin d'aide immédiate ?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Notre équipe de support est disponible pour répondre à toutes vos questions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Support Technique</h3>
              <p className="text-gray-600">{getSupportEmail('technical')}</p>
              <p className="text-gray-600">{getSupportPhone('technical')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Support Commercial</h3>
              <p className="text-gray-600">{getSupportEmail('commercial')}</p>
              <p className="text-gray-600">{getSupportPhone('commercial')}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Urgences</h3>
              <p className="text-gray-600">{getSupportEmail('emergency')}</p>
              <p className="text-gray-600">{getSupportPhone('emergency')}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => handleSupportRequest('general')} size="lg">
              Ouvrir un ticket
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(`mailto:${getSupportEmail('technical')}`)}
            >
              Envoyer un email
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
