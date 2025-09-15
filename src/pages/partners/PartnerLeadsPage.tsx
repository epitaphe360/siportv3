import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Target,
  TrendingUp,
  Award,
  Mail,
  Phone,
  Crown,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const PartnerLeadsPage: React.FC = () => {
  const leadsData = {
    overview: {
      totalLeads: 89,
      qualifiedLeads: 67,
      conversionRate: 12,
      totalValue: 2850000
    },
    recentLeads: [
      {
        id: '1',
        company: 'Port Solutions Inc.',
        contact: 'Marie Dubois',
        position: 'Directrice Commerciale',
        sector: 'Port Operations',
        value: '850K€',
        status: 'Hot Lead',
        lastContact: '2024-01-15',
        nextAction: 'Présentation produit',
        priority: 'high'
      },
      {
        id: '2',
        company: 'TechMarine Solutions',
        contact: 'Pierre Martin',
        position: 'CTO',
        sector: 'Technology',
        value: '1.2M€',
        status: 'Qualified',
        lastContact: '2024-01-12',
        nextAction: 'Démo technique',
        priority: 'high'
      },
      {
        id: '3',
        company: 'LogiFlow Systems',
        contact: 'Sophie Bernard',
        position: 'VP Sales',
        sector: 'Logistics',
        value: '650K€',
        status: 'Nurturing',
        lastContact: '2024-01-10',
        nextAction: 'Suivi email',
        priority: 'medium'
      },
      {
        id: '4',
        company: 'Maritime Data Hub',
        contact: 'Jean-François Moreau',
        position: 'CEO',
        sector: 'Data & Analytics',
        value: '950K€',
        status: 'Qualified',
        lastContact: '2024-01-08',
        nextAction: 'Proposition commerciale',
        priority: 'high'
      },
      {
        id: '5',
        company: 'SecurePort Technologies',
        contact: 'Claire Leroy',
        position: 'Directrice Sécurité',
        sector: 'Sécurité',
        value: '720K€',
        status: 'Hot Lead',
        lastContact: '2024-01-05',
        nextAction: 'Réunion stratégique',
        priority: 'high'
      }
    ],
    leadSources: [
      { source: 'Événements SIPORTS', count: 34, percentage: 38 },
      { source: 'Networking Partenaires', count: 28, percentage: 31 },
      { source: 'Références Clients', count: 15, percentage: 17 },
      { source: 'Campagnes Marketing', count: 12, percentage: 14 }
    ],
    conversionFunnel: [
      { stage: 'Leads Générés', count: 89, percentage: 100 },
      { stage: 'Qualifiés', count: 67, percentage: 75 },
      { stage: 'Proposition', count: 23, percentage: 26 },
      { stage: 'Négociation', count: 12, percentage: 13 },
      { stage: 'Conversion', count: 11, percentage: 12 }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hot Lead': return 'text-red-600 bg-red-50';
      case 'Qualified': return 'text-green-600 bg-green-50';
      case 'Nurturing': return 'text-yellow-600 bg-yellow-50';
      case 'Cold': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
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
            <div className="bg-green-600 p-3 rounded-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Leads & Prospects
              </h1>
              <p className="text-gray-600">
                Gérez vos leads qualifiés et suivez leur progression dans le pipeline commercial
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Programme Leads Premium</span>
              <Badge className="bg-green-100 text-green-800" size="sm">
                12% Taux de Conversion
              </Badge>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{leadsData.overview.totalLeads}</p>
                  <p className="text-sm text-gray-600">Leads générés</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{leadsData.overview.qualifiedLeads}</p>
                  <p className="text-sm text-gray-600">Leads qualifiés</p>
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
                  <p className="text-2xl font-bold text-gray-900">{leadsData.overview.conversionRate}%</p>
                  <p className="text-sm text-gray-600">Taux de conversion</p>
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
                  <p className="text-2xl font-bold text-gray-900">{leadsData.overview.totalValue.toLocaleString()}€</p>
                  <p className="text-sm text-gray-600">Valeur estimée</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Leads Récents</h3>
            <div className="space-y-4">
              {leadsData.recentLeads.map((lead) => (
                <div key={lead.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{lead.company}</h4>
                      <p className="text-sm text-gray-600">{lead.contact} • {lead.position}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                        {getPriorityLabel(lead.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-gray-500 text-sm">Secteur:</span>
                      <div className="font-medium">{lead.sector}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Valeur:</span>
                      <div className="font-medium text-green-600">{lead.value}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Dernier contact:</span>
                      <div className="font-medium">{lead.lastContact}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">Prochaine action:</span>
                      <div className="font-medium">{lead.nextAction}</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">
                      <Mail className="h-3 w-3" />
                      <span>Email</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100">
                      <Phone className="h-3 w-3" />
                      <span>Appeler</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-purple-50 text-purple-600 rounded text-sm hover:bg-purple-100">
                      <Clock className="h-3 w-3" />
                      <span>Planifier RDV</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Lead Sources & Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Sources des Leads</h3>
              <div className="space-y-4">
                {leadsData.leadSources.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900">{source.source}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{source.count}</div>
                      <div className="text-xs text-gray-500">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Tunnel de Conversion</h3>
              <div className="space-y-4">
                {leadsData.conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-blue-100 text-blue-600' :
                        index === 1 ? 'bg-green-100 text-green-600' :
                        index === 2 ? 'bg-yellow-100 text-yellow-600' :
                        index === 3 ? 'bg-orange-100 text-orange-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{stage.count}</div>
                      <div className="text-xs text-gray-500">{stage.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Lead Management Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Conseils de Gestion des Leads
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  🎯 Qualification Rapide
                </h4>
                <p className="text-sm text-blue-700">
                  Contactez les leads chauds dans les 24h pour maximiser vos chances de conversion
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  📊 Suivi Régulier
                </h4>
                <p className="text-sm text-blue-700">
                  Planifiez des points de suivi hebdomadaires pour maintenir l'engagement
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  🎪 Personnalisation
                </h4>
                <p className="text-sm text-blue-700">
                  Adaptez vos propositions aux besoins spécifiques de chaque prospect
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  📈 Mesure des Résultats
                </h4>
                <p className="text-sm text-blue-700">
                  Analysez régulièrement vos taux de conversion pour optimiser votre approche
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
