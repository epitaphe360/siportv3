import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Check, X, Crown, Zap, Star, Award } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ROUTES } from '../lib/routes';

// Types
interface SubscriptionFeature {
  name: string;
  included: boolean;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  icon: React.ReactNode;
  description: string;
  type: 'visitor' | 'partner' | 'exhibitor';
  level: string;
  features: SubscriptionFeature[];
  benefits: string[];
  cta: string;
  color: string;
}

const subscriptionTiers: SubscriptionTier[] = [
  // VISITOR SUBSCRIPTIONS
  {
    id: 'visitor-free',
    name: 'Visiteur Gratuit',
    price: 0,
    currency: 'EUR',
    icon: <Zap className="w-8 h-8" />,
    description: 'Accès basique au salon',
    type: 'visitor',
    level: 'free',
    features: [
      { name: 'Accès au site du salon', included: true },
      { name: 'Consultation des exposants', included: true },
      { name: 'Demandes de rendez-vous', included: false },
      { name: 'Messagerie directe', included: false },
      { name: 'Mini-sites des exposants', included: true },
      { name: 'Événements en direct', included: true },
    ],
    benefits: [
      'Accès complet à l\'annuaire des exposants',
      'Consultation des profils publics',
      'Voir les événements et conférences',
      'Badge visiteur gratuit',
    ],
    cta: 'S\'inscrire gratuitement',
    color: 'bg-gray-50',
  },
  {
    id: 'visitor-vip',
    name: 'Visiteur Premium',
    price: 700,
    currency: 'EUR',
    icon: <Crown className="w-8 h-8" />,
    description: 'Accès prioritaire + 10 rendez-vous',
    type: 'visitor',
    level: 'premium',
    features: [
      { name: 'Accès au site du salon', included: true },
      { name: 'Consultation des exposants', included: true },
      { name: 'Demandes de rendez-vous (10)', included: true },
      { name: 'Messagerie directe', included: true },
      { name: 'Mini-sites des exposants', included: true },
      { name: 'Événements en direct', included: true },
      { name: 'Badge VIP prioritaire', included: true },
      { name: 'Accès prioritaire aux nouveautés', included: true },
    ],
    benefits: [
      '10 demandes de rendez-vous actives',
      'Messagerie directe avec les exposants',
      'Badge VIP virtuel avec QR code',
      'Priorité© dans les algorithmes de recommandation',
      'Accès exclusif aux webinaires',
      'Support prioritaire',
    ],
    cta: 'Inscription Visiteur VIP',
    color: 'bg-purple-50',
  },

  // EXHIBITOR SUBSCRIPTIONS
  {
    id: 'exhibitor-9m',
    name: 'Exposant 9m² (Base)',
    price: 0,
    currency: 'stand',
    icon: <Star className="w-8 h-8" />,
    description: 'Profil & présence de base',
    type: 'exhibitor',
    level: '9m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Logo sur le site', included: true },
      { name: 'Présentation courte', included: true },
      { name: 'Mini-site personnalisé©', included: false },
      { name: 'Gestion des rendez-vous', included: false },
      { name: 'Store produits', included: false },
      { name: 'Tableau de bord exposant', included: true },
      { name: 'Formulaire de contact', included: true },
    ],
    benefits: [
      'Profil d\'exposant modifiable',
      'Présence sur le site',
      'Logo et description',
      'Formulaire de contact basique',
      'Accès tableau de bord',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-blue-50',
  },
  {
    id: 'exhibitor-18m',
    name: 'Exposant 18m² (Standard)',
    price: 0,
    currency: 'Sur devis',
    icon: <Star className="w-8 h-8" />,
    description: 'Mini-site + 15 rendez-vous',
    type: 'exhibitor',
    level: '18m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Logo sur le site', included: true },
      { name: 'Mini-site personnalisé©', included: true },
      { name: 'Gestion des rendez-vous (15)', included: true },
      { name: 'Store produits & filtrage', included: true },
      { name: 'URL personnalisé©e', included: true },
      { name: 'Tableau de bord complet', included: true },
      { name: 'Support standard', included: true },
    ],
    benefits: [
      'Mini-site dédié avec URL personnalisé©e',
      '15 créneaux de rendez-vous disponibles',
      'Présentation complète de produits/services',
      'Système de filtrage des visiteurs',
      'Messagerie intégrée',
      'Accès aux analytics basiques',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-green-50',
  },
  {
    id: 'exhibitor-36m',
    name: 'Exposant 36m² (Premium)',
    price: 0,
    currency: 'Sur devis',
    icon: <Award className="w-8 h-8" />,
    description: 'Mise en avant + 30 rendez-vous',
    type: 'exhibitor',
    level: '36m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Mini-site personnalisé©', included: true },
      { name: 'Mise en avant "À la Une"', included: true },
      { name: 'Gestion des rendez-vous (30)', included: true },
      { name: 'Store produits avancé©', included: true },
      { name: 'Accès API Supabase limité', included: true },
      { name: 'Outils de réseautage avancé©s', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Badge virtuel personnalisé©', included: true },
    ],
    benefits: [
      'Mise en avant sur la page d\'accueil',
      '30 créneaux de rendez-vous',
      'Mini-site premium avec médias illimités',
      'Intégration API personnalisé©e',
      'Messagerie directe et chat',
      'Analytics détaillés',
      'Support technique prioritaire',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-amber-50',
  },
  {
    id: 'exhibitor-54m',
    name: 'Exposant 54m²+ (Elite)',
    price: 0,
    currency: 'Sur devis',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité© maximale + créneaux illimités',
    type: 'exhibitor',
    level: '54m2',
    features: [
      { name: 'Profil d\'exposant public', included: true },
      { name: 'Mini-site Premium', included: true },
      { name: 'Mise en avant permanente', included: true },
      { name: 'Rendez-vous illimités', included: true },
      { name: 'Store produits complet', included: true },
      { name: 'Accès API Supabase complet', included: true },
      { name: 'Outils de réseautage illimités', included: true },
      { name: 'Support VIP 24/7', included: true },
      { name: 'Personnalisation avancé©e', included: true },
    ],
    benefits: [
      'Mise en avant permanente et prioritaire',
      'Créneaux de rendez-vous illimités',
      'Mini-site avec scripts personnalisé©s',
      'Accès API complet pour intégrations',
      'Stockage médias illimité',
      'Chat et messagerie illimitée',
      'Support technique VIP dédié',
      'Priorité© algorithmique',
    ],
    cta: 'Inscription Exposant',
    color: 'bg-red-50',
  },

  // PARTNER SUBSCRIPTIONS
  {
    id: 'partner-museum',
    name: 'Partenaire Musée (20k$)',
    price: 20000,
    currency: 'USD',
    icon: <Star className="w-8 h-8" />,
    description: 'Présence & mini-site',
    type: 'partner',
    level: 'museum',
    features: [
      { name: 'Logo sur le site', included: true },
      { name: 'Mini-site dédié', included: true },
      { name: 'Bannière rotative', included: true },
      { name: 'Présence newsletter', included: true },
      { name: 'Vidéos "Inside SIPORT"', included: true },
      { name: 'Interview Live Studio', included: true },
      { name: 'Inclusion podcast', included: false },
      { name: 'Priorité© algorithmique', included: false },
    ],
    benefits: [
      'Logo en 4ème ligne sur le site',
      'Mini-site Premium Exposure',
      'Bannière Web rotative',
      'Présence dans e-mailings',
      'Capsules vidéo marquées',
      'Interview "Meet The Leaders"',
      'Mention "Best Moments"',
    ],
    cta: 'Inscription Partenaire',
    color: 'bg-cyan-50',
  },
  {
    id: 'partner-silver',
    name: 'Partenaire Silver (48k$)',
    price: 48000,
    currency: 'USD',
    icon: <Award className="w-8 h-8" />,
    description: 'Visibilité© renforcée 3ème ligne',
    type: 'partner',
    level: 'silver',
    features: [
      { name: 'Logo en 3ème ligne', included: true },
      { name: 'Mini-site dédié', included: true },
      { name: 'Bannière rotative', included: true },
      { name: 'Section "Top Innovations"', included: true },
      { name: 'Présence newsletters', included: true },
      { name: 'Capsules vidéo sponsorisées', included: true },
      { name: 'Podcast SIPORT Talks', included: true },
      { name: 'Interview Live Studio', included: true },
      { name: 'Testimonial vidéo (1 min)', included: true },
    ],
    benefits: [
      'Logo visible en 3ème ligne prioritaire',
      'Présence dans toutes les newsletters',
      'Mini-site avec actualités complètes',
      'Capsules vidéo "Inside SIPORT"',
      'Interview audio dans le Podcast',
      'Interview Live Studio "Meet The Leaders"',
      'Vidéo testimonial diffusée',
      '50 rendez-vous mensuels',
    ],
    cta: 'Inscription Partenaire',
    color: 'bg-indigo-50',
  },
  {
    id: 'partner-gold',
    name: 'Partenaire Gold (68k$)',
    price: 68000,
    currency: 'USD',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité© premium 2ème ligne',
    type: 'partner',
    level: 'gold',
    features: [
      { name: 'Logo en 2ème ligne', included: true },
      { name: 'Mini-site premium', included: true },
      { name: 'Bannière Web rotative', included: true },
      { name: 'Section "Top Innovations"', included: true },
      { name: 'Newsletter en 2ème ligne', included: true },
      { name: 'Capsules vidéo sponsorisées', included: true },
      { name: 'Podcast SIPORT Talks', included: true },
      { name: 'Interview Live Studio', included: true },
      { name: 'Testimonial vidéo (2 min)', included: true },
      { name: 'Support prioritaire', included: true },
    ],
    benefits: [
      'Logo visible en 2ème ligne prioritaire',
      'Tous les canaux web & email',
      'Mini-site "SIPORT Premium Exposure"',
      'Capsules vidéo & brand awareness',
      'Interview audio Podcast',
      'Interview Live Studio prioritaire',
      'Vidéo testimonial 2 min diffusée',
      '100 rendez-vous mensuels',
      'Support technique prioritaire',
    ],
    cta: 'Inscription Partenaire',
    color: 'bg-rose-50',
  },
  {
    id: 'partner-platinum',
    name: 'Partenaire Platinium (98k$)',
    price: 98000,
    currency: 'USD',
    icon: <Crown className="w-8 h-8" />,
    description: 'Visibilité© maximale 1ère ligne + illimité',
    type: 'partner',
    level: 'platinum',
    features: [
      { name: 'Logo en 1ère ligne partout', included: true },
      { name: 'Mini-site premium', included: true },
      { name: 'Bannière Web rotative', included: true },
      { name: 'Section "Top Innovations"', included: true },
      { name: 'Newsletters en 1ère ligne', included: true },
      { name: 'Webinaires sponsorisés', included: true },
      { name: 'Capsules vidéo "Inside SIPORT"', included: true },
      { name: 'Podcast SIPORT Talks', included: true },
      { name: 'Interview Live Studio prioritaire', included: true },
      { name: 'Testimonial vidéo (3 min)', included: true },
      { name: 'Support VIP 24/7', included: true },
    ],
    benefits: [
      'Logo en 1ère ligne sur tous les canaux',
      'Mini-site "Premium Exposure" complet',
      'Webinaires sponsorisés avec replay',
      'Capsules vidéo exclusives marquées',
      'Inclusion podcast prioritaire',
      'Interview Live Studio "Meet The Leaders"',
      'Vidéo testimonial 3 min premium',
      'Rendez-vous illimités',
      'Support VIP dédié',
      'Priorité© algorithmique maximale',
    ],
    cta: 'Inscription Partenaire',
    color: 'bg-amber-50',
  },
];

export default function SubscriptionPage() {
  const [selectedType, setSelectedType] = useState<'visitor' | 'partner' | 'exhibitor'>('visitor');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const visitorTiers = subscriptionTiers.filter(t => t.type === 'visitor');
  const partnerTiers = subscriptionTiers.filter(t => t.type === 'partner');
  const exhibitorTiers = subscriptionTiers.filter(t => t.type === 'exhibitor');

  const displayedTiers = selectedType === 'visitor' ? visitorTiers : selectedType === 'partner' ? partnerTiers : exhibitorTiers;

  const handleSubscribe = (tierId: string) => {
    // Redirection selon le type d'offre (pas besoin d'être authentifié pour s'inscrire)
    if (tierId === 'visitor-free') {
      // Inscription gratuite - rediriger vers formulaire visiteur standard pour créer un compte complet
      navigate(ROUTES.REGISTER_VISITOR);
    } else if (tierId === 'visitor-vip') {
      // Inscription VIP - rediriger vers formulaire VIP complet avec photo et paiement
      navigate(ROUTES.VISITOR_VIP_REGISTRATION);
    } else if (tierId.includes('exhibitor')) {
      // Offre exposant - toujours rediriger vers formulaire inscription avec le tier choisi
      // Un commercial contactera l'exposant après inscription
      const tier = subscriptionTiers.find(t => t.id === tierId);
      navigate(ROUTES.REGISTER_EXHIBITOR, {
        state: {
          selectedTier: tierId,
          tierName: tier?.name || '',
          tierLevel: tier?.level || '',
          tierPrice: tier?.price || 0
        }
      });
    } else if (tierId.includes('partner')) {
      // Offre partenaire - rediriger vers inscription partenaire avec le tier choisi
      const tier = subscriptionTiers.find(t => t.id === tierId);
      navigate(ROUTES.REGISTER_PARTNER, {
        state: {
          selectedTier: tierId,
          tierName: tier?.name || '',
          tierLevel: tier?.level || '',
          tierPrice: tier?.price || 0
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('subscription.title')}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subscription.description')}
          </p>
        </div>

        {/* Type Selector */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setSelectedType('visitor')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              selectedType === 'visitor'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
            }`}
          >
            👤 Visiteurs
          </button>
          <button
            onClick={() => setSelectedType('exhibitor')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              selectedType === 'exhibitor'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
            }`}
          >
            🏢 Exposants
          </button>
          <button
            onClick={() => setSelectedType('partner')}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              selectedType === 'partner'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-300'
            }`}
          >
            🤝 Partenaires
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="flex justify-center">
          <div className={`grid grid-cols-1 md:grid-cols-2 ${displayedTiers.length > 2 ? 'lg:grid-cols-4 max-w-7xl' : 'lg:grid-cols-2 max-w-4xl'} gap-8 w-full`}>
            {displayedTiers.map((tier) => (
              <Card
                key={tier.id}
                data-testid={`subscription-card-${tier.id}`}
                className={`relative overflow-hidden h-full flex flex-col transition-transform hover:scale-105 ${tier.color}`}
              >
              {/* Header */}
              <div className="p-6 pb-8 border-b-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{tier.icon}</div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-2">
                  {tier.currency === 'Sur devis' ? (
                    <span className="text-4xl font-bold text-siports-primary">Sur devis</span>
                  ) : tier.price === 0 ? (
                    <span className="text-4xl font-bold text-green-600">Gratuit</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">{tier.price.toLocaleString()}</span>
                      <span className="text-lg text-gray-600">{tier.currency}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="p-6 flex-grow">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Fonctionnalités</h4>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-gray-800' : 'text-gray-400'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Benefits */}
                <h4 className="text-sm font-semibold text-gray-900 mt-6 mb-4 uppercase tracking-wider">Avantages</h4>
                <ul className="space-y-2 mb-6">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="text-sm text-gray-700 flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 border-t-2 border-gray-200">
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:shadow-lg transition-all"
                >
                  {tier.cta}
                </Button>
              </div>
            </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-3">1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Choix de l'offre</h3>
              <p className="text-gray-600">
                Sélectionnez l'offre qui correspond à vos besoins parmi nos différents niveaux.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-3">2</div>
              <h3 className="font-semibold text-gray-900 mb-2">Paiement sécurisé</h3>
              <p className="text-gray-600">
                Paiement en ligne ou via un commercial. Validation par administrateur automatique.
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-3">3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Accès immédiat</h3>
              <p className="text-gray-600">
                Accès instantané à votre tableau de bord et à tous les avantages de votre offre.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Questions fréquentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Puis-je changer d'offre ?</h3>
              <p className="text-gray-600">
                Oui, vous pouvez faire évoluer votre offre à tout moment. Un administrateur validera les changements.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quel est le délai d'activation ?</h3>
              <p className="text-gray-600">
                Une fois le paiement validé, votre Accès est activé dans les 24 heures.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Y a-t-il une facturation récurrente ?</h3>
              <p className="text-gray-600">
                Non, sauf mention contraire. Les offres sont forfaitaires pour le salon 2026.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Comment contacter le support ?</h3>
              <p className="text-gray-600">
                Contactez notre équipe via le formulaire du site ou par e-mail : support@siports.com
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}




