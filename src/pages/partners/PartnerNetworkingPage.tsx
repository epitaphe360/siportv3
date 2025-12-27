import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  MessageCircle,
  Handshake,
  Star,
  MapPin,
  Building2,
  Crown,
  Target
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const PartnerNetworkingPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');

  // Données mockées pour les opportunités de networking
  const networkingOpportunities = [
    {
      id: '1',
      name: 'Port Maritime Marseille',
      type: 'exhibitor',
      sector: 'Infrastructure Portuaire',
      company: 'Port Maritime Marseille',
      title: 'Directeur Commercial',
      location: 'Marseille, France',
      interests: ['Technologie', 'Innovation', 'Logistique'],
      mutualConnections: 3,
      availability: 'Libre cette semaine',
      rating: 4.8,
      profileStrength: 95
    },
    {
      id: '2',
      name: 'Sophie Leroy',
      type: 'exhibitor',
      sector: 'Data & Analytics',
      company: 'Maritime Data Systems',
      title: 'CTO',
      location: 'Nantes, France',
      interests: ['Big Data', 'IA', 'Cybersécurité'],
      mutualConnections: 5,
      availability: 'Disponible pour un café',
      rating: 4.9,
      profileStrength: 98
    },
    {
      id: '3',
      name: 'Jean-Pierre Martin',
      type: 'partner',
      sector: 'Technologie',
      company: 'Port Tech Institute',
      title: 'Directeur de Recherche',
      location: 'Toulouse, France',
      interests: ['R&D', 'Innovation', 'Formation'],
      mutualConnections: 2,
      availability: 'En déplacement jusqu\'à vendredi',
      rating: 4.7,
      profileStrength: 92
    },
    {
      id: '4',
      name: 'Claire Dupont',
      type: 'exhibitor',
      sector: 'Sécurité',
      company: 'SecureMaritime',
      title: 'Responsable Sécurité',
      location: 'Brest, France',
      interests: ['Cybersécurité', 'Conformité', 'Audit'],
      mutualConnections: 1,
      availability: 'Disponible demain',
      rating: 4.6,
      profileStrength: 89
    },
    {
      id: '5',
      name: 'Michel Bernard',
      type: 'partner',
      sector: 'Ingénierie',
      company: 'Port Engineering Ltd',
      title: 'Chef de Projet',
      location: 'Bordeaux, France',
      interests: ['Ingénierie', 'Construction', 'Maintenance'],
      mutualConnections: 4,
      availability: 'Planning chargé',
      rating: 4.5,
      profileStrength: 87
    },
    {
      id: '6',
      name: 'Pierre Durand',
      type: 'exhibitor',
      sector: 'Logistique',
      company: 'Ocean Freight Corp',
      title: 'Directeur Logistique',
      location: 'Le Havre, France',
      interests: ['Supply Chain', 'Transport', 'Distribution'],
      mutualConnections: 6,
      availability: 'Libre lundi prochain',
      rating: 4.4,
      profileStrength: 91
    }
  ];

  const filteredOpportunities = networkingOpportunities.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !selectedSector || opportunity.sector === selectedSector;

    return matchesSearch && matchesSector;
  });

  const sectors = [
    'Infrastructure Portuaire',
    'Technologie',
    'Data & Analytics',
    'Sécurité',
    'Ingénierie',
    'Logistique',
    'Environnement'
  ];

  const handleNetworkingAction = (opportunityId: string, action: string) => {
    // Ici vous pouvez implémenter les actions réelles
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'partner': return Crown;
      case 'exhibitor': return Building2;
      default: return Users;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'partner': return 'text-purple-600';
      case 'exhibitor': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes('Libre') || availability.includes('Disponible')) {
      return 'text-green-600 bg-green-50';
    } else if (availability.includes('Planning chargé')) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-gray-600 bg-gray-50';
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
          <h1 className="text-3xl font-bold text-gray-900">Networking Privilégié</h1>
          <p className="text-gray-600 mt-2">
            Découvrez et connectez-vous avec les décideurs de l'industrie maritime
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connexions Disponibles</p>
                  <p className="text-3xl font-bold text-blue-600">{networkingOpportunities.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Connexions Mutuelles</p>
                  <p className="text-3xl font-bold text-green-600">
                    {networkingOpportunities.reduce((sum, opp) => sum + opp.mutualConnections, 0)}
                  </p>
                </div>
                <Handshake className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages Envoyés</p>
                  <p className="text-3xl font-bold text-purple-600">12</p>
                </div>
                <MessageCircle className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Réponses Reçues</p>
                  <p className="text-3xl font-bold text-orange-600">8</p>
                </div>
                <Target className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, entreprise ou secteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les secteurs</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Networking Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opportunity) => {
            const TypeIcon = getTypeIcon(opportunity.type);
            const typeColor = getTypeColor(opportunity.type);
            const availabilityColor = getAvailabilityColor(opportunity.availability);

            return (
              <Card key={opportunity.id} hover className="h-full">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {opportunity.name}
                        </h3>
                        <TypeIcon className={`h-5 w-5 ${typeColor}`} />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{opportunity.title}</p>
                      <p className="text-sm font-medium text-gray-900">{opportunity.company}</p>
                    </div>
                    <div className="ml-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>{opportunity.sector}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Handshake className="h-4 w-4 mr-2" />
                      <span>{opportunity.mutualConnections} connexions communes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      <span>{opportunity.rating}/5 • {opportunity.profileStrength}% profil complet</span>
                    </div>
                  </div>

                  <div className={`px-3 py-2 rounded-lg text-sm font-medium mb-4 ${availabilityColor}`}>
                    {opportunity.availability}
                  </div>

                  {opportunity.interests.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Centres d'intérêt :</h4>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.interests.slice(0, 3).map((interest, idx) => (
                          <Badge key={idx} variant="info" size="sm">{interest}</Badge>
                        ))}
                        {opportunity.interests.length > 3 && (
                          <Badge variant="info" size="sm">+{opportunity.interests.length - 3}</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleNetworkingAction(opportunity.id, 'view')}
                    >
                      Voir profil
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleNetworkingAction(opportunity.id, 'connect')}
                      variant="default"
                    >
                      Se connecter
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune opportunité trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommandations IA pour votre Networking
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">
                     Profils Prioritaires
                  </h4>
                  <p className="text-sm text-purple-700">
                    3 contacts identifiés comme stratégiques pour vos objectifs business
                  </p>
                </div>

                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">
                     Opportunités Sectorielles
                  </h4>
                  <p className="text-sm text-purple-700">
                    Focus recommandé sur les secteurs Data & Technologie cette semaine
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};



