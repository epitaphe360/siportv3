import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Tv,
  Newspaper,
  Share2,
  Users,
  TrendingUp,
  Award,
  Crown,
  Calendar,
  ExternalLink,
  Upload,
  BarChart3,
  Library
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const PartnerMediaPage: React.FC = () => {
  const mediaData = {
    overview: {
      totalMentions: 12,
      socialImpressions: 45000,
      engagementRate: 98,
      mediaValue: 25000
    },
    television: [
      {
        id: '1',
        title: 'Interview BFM Business',
        date: '15 Jan 2024',
        description: 'Discussion sur l\'innovation dans les ports français',
        reach: '2.5M',
        duration: '8 min',
        status: 'Diffusé'
      },
      {
        id: '2',
        title: 'Reportage France 3 Régions',
        date: '22 Jan 2024',
        description: 'Focus sur la transformation digitale des infrastructures portuaires',
        reach: '1.8M',
        duration: '12 min',
        status: 'Diffusé'
      },
      {
        id: '3',
        title: 'Émission économique M6',
        date: '28 Jan 2024',
        description: 'Table ronde sur l\'avenir de l\'industrie maritime',
        reach: '3.2M',
        duration: '15 min',
        status: 'Programmé'
      }
    ],
    press: [
      {
        id: '1',
        title: 'Article Les Échos',
        outlet: 'Les Échos',
        date: '10 Jan 2024',
        headline: 'SIPORTS révolutionne le networking dans l\'industrie maritime',
        excerpt: 'La plateforme innovante facilite les connexions entre acteurs du secteur...',
        reach: '850K',
        sentiment: 'positive'
      },
      {
        id: '2',
        title: 'Portrait L\'Express',
        outlet: 'L\'Express',
        date: '18 Jan 2024',
        headline: 'Les nouveaux visages de l\'innovation portuaire',
        excerpt: 'Rencontre avec l\'équipe derrière SIPORTS, la plateforme qui transforme...',
        reach: '650K',
        sentiment: 'positive'
      },
      {
        id: '3',
        title: 'Tribune Le Monde',
        outlet: 'Le Monde',
        date: '25 Jan 2024',
        headline: 'Digitalisation : les ports français en première ligne',
        excerpt: 'Comment SIPORTS accompagne la transformation numérique du secteur...',
        reach: '1.2M',
        sentiment: 'positive'
      }
    ],
    social: [
      {
        id: '1',
        platform: 'LinkedIn',
        content: 'Post sur l\'innovation technologique',
        date: '12 Jan 2024',
        engagement: '2,340 likes, 156 commentaires',
        reach: '45K',
        sentiment: 'positive'
      },
      {
        id: '2',
        platform: 'Twitter',
        content: 'Tweet viral sur la durabilité',
        date: '20 Jan 2024',
        engagement: '890 partages, 234 RT',
        reach: '78K',
        sentiment: 'very_positive'
      },
      {
        id: '3',
        platform: 'Instagram',
        content: 'Story événement partenaire',
        date: '27 Jan 2024',
        engagement: '456 commentaires, 89K vues',
        reach: '32K',
        sentiment: 'positive'
      }
    ],
    upcoming: [
      {
        id: '1',
        type: 'Interview',
        media: 'France Inter',
        date: '5 Février 2024',
        topic: 'Économie bleue et innovation',
        status: 'Confirmé'
      },
      {
        id: '2',
        type: 'Article',
        media: 'Challenges',
        date: '12 Février 2024',
        topic: 'Startups et transformation digitale',
        status: 'En préparation'
      }
    ]
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive': return 'text-green-600 bg-green-50';
      case 'positive': return 'text-blue-600 bg-blue-50';
      case 'neutral': return 'text-yellow-600 bg-yellow-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'very_positive': return 'Très positif';
      case 'positive': return 'Positif';
      case 'neutral': return 'Neutre';
      case 'negative': return 'Négatif';
      default: return sentiment;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Diffusé': return 'text-green-600 bg-green-50';
      case 'Programmé': return 'text-blue-600 bg-blue-50';
      case 'Confirmé': return 'text-purple-600 bg-purple-50';
      case 'En préparation': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <Tv className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Médias & Communication
              </h1>
              <p className="text-gray-600">
                Suivez votre couverture médiatique et votre présence dans les médias
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Couverture Médiatique Premium</span>
                <Badge className="bg-blue-100 text-blue-800" size="sm">
                  Temps Réel
                </Badge>
              </div>
              <div className="flex gap-3">
                <Link
                  to={ROUTES.PARTNER_MEDIA_UPLOAD}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Uploader un média
                </Link>
                <Link
                  to={ROUTES.PARTNER_MEDIA_ANALYTICS}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
                <Link
                  to={ROUTES.MEDIA_LIBRARY}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Library className="w-4 h-4" />
                  Bibliothèque
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Newspaper className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{mediaData.overview.totalMentions}</p>
                  <p className="text-sm text-gray-600">Mentions médias</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{mediaData.overview.socialImpressions.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Impressions sociales</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{mediaData.overview.engagementRate}%</p>
                  <p className="text-sm text-gray-600">Taux d'engagement</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{mediaData.overview.mediaValue.toLocaleString()}€</p>
                  <p className="text-sm text-gray-600">Valeur média</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Television Coverage */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Tv className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Télévision</h3>
            </div>

            <div className="space-y-4">
              {mediaData.television.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ðŸ“… {item.date}</span>
                      <span>ðŸ‘ï¸ {item.reach} téléspectateurs</span>
                      <span>â±ï¸ {item.duration}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Press Coverage */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Newspaper className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Presse Écrite</h3>
            </div>

            <div className="space-y-4">
              {mediaData.press.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className="text-sm text-gray-500">{item.outlet}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentLabel(item.sentiment)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{item.date}</span>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-2">{item.headline}</h5>
                  <p className="text-gray-600 text-sm mb-3">{item.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Portée estimée: {item.reach}</span>
                    <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Share2 className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Réseaux Sociaux</h3>
            </div>

            <div className="space-y-4">
              {mediaData.social.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900">{item.platform}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                        {getSentimentLabel(item.sentiment)}
                      </span>
                    </div>
                    <p className="text-gray-900 text-sm mb-1">{item.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ðŸ“… {item.date}</span>
                      <span>ðŸ“Š {item.engagement}</span>
                      <span>ðŸ‘ï¸ {item.reach} impressions</span>
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Upcoming Media */}
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Calendar className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Événements Médiatiques à Venir</h3>
            </div>

            <div className="space-y-4">
              {mediaData.upcoming.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900">{item.type}</span>
                      <span className="text-sm text-gray-600">{item.media}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.topic}</p>
                    <span className="text-sm text-gray-500">ðŸ“… {item.date}</span>
                  </div>
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};



