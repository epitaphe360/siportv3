import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Handshake,
  Target,
  Calendar,
  Award,
  Download,
  Crown,
  Activity,
  MessageCircle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const PartnerAnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const analyticsData = {
    overview: {
      profileViews: 3247,
      profileViewsChange: 22,
      connections: 89,
      connectionsChange: 15,
      leadsGenerated: 23,
      leadsGeneratedChange: 8,
      roi: 285,
      roiChange: 12
    },
    performance: [
      { month: 'Jan', views: 1200, connections: 25, leads: 8 },
      { month: 'Fév', views: 1350, connections: 32, leads: 12 },
      { month: 'Mar', views: 1580, connections: 45, leads: 15 },
      { month: 'Avr', views: 1820, connections: 52, leads: 18 },
      { month: 'Mai', views: 2100, connections: 67, leads: 23 },
      { month: 'Jun', views: 2350, connections: 89, leads: 28 }
    ],
    topSectors: [
      { sector: 'Infrastructure Portuaire', percentage: 35, connections: 31 },
      { sector: 'Technologie', percentage: 28, connections: 25 },
      { sector: 'Data & Analytics', percentage: 22, connections: 20 },
      { sector: 'Sécurité', percentage: 15, connections: 13 }
    ],
    engagement: {
      messagesSent: 156,
      messagesReceived: 203,
      meetingsScheduled: 12,
      meetingsAttended: 10,
      contentShared: 8,
      eventsSponsored: 5
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fr-FR');
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown;
  };

  const exportAnalytics = () => {
    const data = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      data: analyticsData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-partner-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Rapport d\'analyse exporté avec succès !');
  };

  return (
    <div data-testid="analytics-dashboard" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analytics & ROI
                </h1>
                <p className="text-gray-600">
                  Analysez les performances de votre partenariat SIPORTS
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
                <option value="90d">90 jours</option>
                <option value="1y">1 an</option>
              </select>

              <Button onClick={exportAnalytics} variant="default">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Rapports Détaillés Partenaires</span>
              <Badge className="bg-purple-100 text-purple-800" size="sm">
                Données Temps Réel
              </Badge>
            </div>
          </div>
        </div>

        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-8 w-8 text-blue-600" />
                <div className={`flex items-center text-sm ${getChangeColor(analyticsData.overview.profileViewsChange)}`}>
                  {(() => {
                    const ChangeIcon = getChangeIcon(analyticsData.overview.profileViewsChange);
                    return <ChangeIcon className="h-4 w-4 mr-1" />;
                  })()}
                  {Math.abs(analyticsData.overview.profileViewsChange)}%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatNumber(analyticsData.overview.profileViews)}
              </div>
              <div className="text-gray-600 text-sm">Vues du profil</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Handshake className="h-8 w-8 text-green-600" />
                <div className={`flex items-center text-sm ${getChangeColor(analyticsData.overview.connectionsChange)}`}>
                  {(() => {
                    const ChangeIcon = getChangeIcon(analyticsData.overview.connectionsChange);
                    return <ChangeIcon className="h-4 w-4 mr-1" />;
                  })()}
                  {Math.abs(analyticsData.overview.connectionsChange)}%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsData.overview.connections}
              </div>
              <div className="text-gray-600 text-sm">Connexions établies</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-orange-600" />
                <div className={`flex items-center text-sm ${getChangeColor(analyticsData.overview.leadsGeneratedChange)}`}>
                  {(() => {
                    const ChangeIcon = getChangeIcon(analyticsData.overview.leadsGeneratedChange);
                    return <ChangeIcon className="h-4 w-4 mr-1" />;
                  })()}
                  {Math.abs(analyticsData.overview.leadsGeneratedChange)}%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsData.overview.leadsGenerated}
              </div>
              <div className="text-gray-600 text-sm">Leads générés</div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-purple-600" />
                <div className={`flex items-center text-sm ${getChangeColor(analyticsData.overview.roiChange)}`}>
                  {(() => {
                    const ChangeIcon = getChangeIcon(analyticsData.overview.roiChange);
                    return <ChangeIcon className="h-4 w-4 mr-1" />;
                  })()}
                  {Math.abs(analyticsData.overview.roiChange)}%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {analyticsData.overview.roi}%
              </div>
              <div className="text-gray-600 text-sm">ROI Partenariat</div>
            </div>
          </Card>
        </div>

        {/* Performance Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Évolution des Performances</h3>
              <div className="space-y-4">
                {analyticsData.performance.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{month.month}</span>
                    <div className="flex space-x-6 text-sm">
                      <span className="text-blue-600"> {formatNumber(month.views)}</span>
                      <span className="text-green-600"> {month.connections}</span>
                      <span className="text-orange-600"> {month.leads}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition Sectorielle</h3>
              <div className="space-y-4">
                {analyticsData.topSectors.map((sector, index) => (
                  <div key={sector.sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${index === 0 ? 'from-blue-500 to-blue-600' : index === 1 ? 'from-green-500 to-green-600' : index === 2 ? 'from-orange-500 to-orange-600' : 'from-purple-500 to-purple-600'}`} />
                      <span className="font-medium text-gray-900">{sector.sector}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{sector.percentage}%</div>
                      <div className="text-sm text-gray-600">{sector.connections} connexions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Engagement Metrics */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques d'Engagement</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{analyticsData.engagement.messagesSent}</div>
                <div className="text-sm text-blue-700">Messages envoyés</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <MessageCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{analyticsData.engagement.messagesReceived}</div>
                <div className="text-sm text-green-700">Messages reçus</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{analyticsData.engagement.meetingsScheduled}</div>
                <div className="text-sm text-purple-700">RDV programmés</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{analyticsData.engagement.meetingsAttended}</div>
                <div className="text-sm text-orange-700">RDV honorés</div>
              </div>

              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <Award className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-600">{analyticsData.engagement.contentShared}</div>
                <div className="text-sm text-indigo-700">Contenus partagés</div>
              </div>

              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <Crown className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-pink-600">{analyticsData.engagement.eventsSponsored}</div>
                <div className="text-sm text-pink-700">Événements sponsorisés</div>
              </div>
            </div>
          </div>
        </Card>

        {/* ROI Analysis */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Analyse ROI Détaillée
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">
                   Retour sur Investissement
                </h4>
                <p className="text-sm text-green-700">
                  Votre investissement initial de 50K€ a généré 142K€ de valeur ajoutée
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">
                   Croissance Mensuelle
                </h4>
                <p className="text-sm text-green-700">
                  +15% de croissance mensuelle moyenne sur les 6 derniers mois
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">
                   Objectifs Atteints
                </h4>
                <p className="text-sm text-green-700">
                  89% des objectifs business fixés ont été dépassés
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};



