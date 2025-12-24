import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Brain, 
  Globe, 
  ArrowRight,
  Zap,
  Target,
  Network
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';

export const NetworkingSection: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'IA de Matching',
      description: 'Algorithme intelligent qui analyse vos objectifs et recommande les contacts les plus pertinents.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'Chat Assisté',
      description: 'Messagerie instantanée avec chatbot IA pour faciliter vos premiers échanges.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Rendez-vous Intelligents',
      description: 'Planification automatique avec gestion des disponibilités et suggestions de créneaux.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Globe,
      title: 'Réseautage Global',
      description: 'Connectez-vous avec des professionnels de 40 pays dans l\'écosystème portuaire.',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const stats = [
    { number: '6,000+', label: 'Professionnels connectés' },
    { number: '40', label: 'Pays représentés' },
    { number: '300+', label: 'Exposants actifs' },
    { number: '95%', label: 'Taux de satisfaction' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <span className="text-blue-600 font-semibold">Réseautage Intelligent</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Connectez-vous avec les{' '}
                <span className="text-blue-600">bons partenaires</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Notre plateforme utilise l'intelligence artificielle pour vous mettre en relation 
                avec les professionnels les plus pertinents selon vos objectifs et votre secteur d'activité.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={ROUTES.NETWORKING}>
                <Button size="lg" className="w-full sm:w-auto">
                  <Zap className="mr-2 h-5 w-5" />
                  Commencer le Réseautage
                </Button>
              </Link>
              <Link to={ROUTES.VISITOR_SUBSCRIPTION}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Target className="mr-2 h-5 w-5" />
                  Devenir Membre
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => {
                  const aiAssistantData = {
                    name: 'SIPORTS AI Assistant',
                    version: '3.0',
                    capabilities: [
                      'Recommandations de contacts intelligentes',
                      'Matching par secteur d\'activité',
                      'Suggestions de rendez-vous optimales',
                      'Analyse de compatibilité avancée',
                      'Prédictions de succès commercial',
                      'Optimisation d\'agenda automatique',
                      'Traduction en temps réel',
                      'Analyse de sentiment'
                    ],
                    stats: {
                      accuracy: '92%',
                      users: '6,300+',
                      matches: '12,847',
                      satisfaction: '94%',
                      responseTime: '< 2 secondes'
                    },
                    languages: ['Français', 'Anglais', 'Arabe', 'Espagnol'],
                    availability: '24/7 pendant SIPORTS'
                  };
                  
                  alert(`🤖 ${aiAssistantData.name} v${aiAssistantData.version}\n\n📊 Statistiques:\n🎯 Précision: ${aiAssistantData.stats.accuracy}\n👥 Utilisateurs actifs: ${aiAssistantData.stats.users}\n🤝 Matches réalisés: ${aiAssistantData.stats.matches}\n⭐ Satisfaction: ${aiAssistantData.stats.satisfaction}\n⚡ Temps de réponse: ${aiAssistantData.stats.responseTime}\n\n🌐 Langues supportées: ${aiAssistantData.languages.join(', ')}\n⏰ Disponibilité: ${aiAssistantData.availability}\n\n🧠 Capacités IA avancées:\n${aiAssistantData.capabilities.map(cap => `• ${cap}`).join('\n')}\n\n🚀 Connectez-vous pour accéder à l'IA complète !`);
                }}
              >
                <Brain className="mr-2 h-5 w-5" />
                Assistant IA
              </Button>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Card */}
            <Card className="relative z-10 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center mb-6">
                <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Réseau Portuaire Mondial
                </h3>
                <p className="text-gray-600">
                  Rejoignez la plus grande communauté de professionnels portuaires
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center p-4 bg-white rounded-lg shadow-sm"
                  >
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 p-2 rounded-lg">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Chat IA</p>
                  <p className="text-xs text-gray-500">Assistant 24/7</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Brain className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Matching IA</p>
                  <p className="text-xs text-gray-500">Recommandations</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Prêt à développer votre réseau professionnel ?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Rejoignez dès maintenant la plateforme SIPORTS et découvrez comment 
            l'intelligence artificielle peut transformer votre approche du réseautage.
          </p>
          <Link to={ROUTES.NETWORKING}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Découvrir le Réseautage
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};