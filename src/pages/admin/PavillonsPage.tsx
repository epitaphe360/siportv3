import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Building2,
  Calendar,
  Search,
  Filter,
  Users,
  Clock,
  MoreVertical,
  Edit,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Presentation,
  Lightbulb,
  Settings
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

export default function PavillonsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');

  // Données mockées pour les pavillons thématiques SIPORTS 2026
  const pavilions = [
    {
      id: 'digitalization',
      name: 'Pavillon Digitalisation',
      theme: 'digitalization',
      description: 'Transformation digitale des opérations portuaires et solutions technologiques innovantes',
      objectives: [
        'Présenter les dernières innovations technologiques',
        'Faciliter l\'adoption des solutions numériques',
        'Créer des synergies entre acteurs technologiques'
      ],
      features: [
        'Intelligence Artificielle & Machine Learning',
        'IoT et capteurs connectés',
        'Big Data et analyse prédictive',
        'Blockchain et sécurité numérique'
      ],
      targetAudience: ['Directeurs IT', 'Responsables innovation', 'Startups tech', 'Investisseurs'],
      demoPrograms: [
        {
          id: 'd1',
          title: 'Démonstration IA Portuaire',
          description: 'Présentation d\'un système d\'IA pour l\'optimisation des flux portuaires',
          date: new Date(Date.now() + 86400000),
          time: '10:00',
          duration: '45 min',
          speaker: 'Dr. Marie Dubois',
          company: 'Port Tech Institute',
          type: 'presentation',
          capacity: 80,
          registered: 65,
          location: 'Salle principale pavillon',
          tags: ['IA', 'Optimisation', 'Flux']
        },
        {
          id: 'd2',
          title: 'Atelier IoT en Temps Réel',
          description: 'Workshop pratique sur l\'implémentation d\'IoT dans les terminaux portuaires',
          date: new Date(Date.now() + 172800000),
          time: '14:00',
          duration: '2h',
          speaker: 'Jean-Pierre Martin',
          company: 'Maritime Solutions',
          type: 'workshop',
          capacity: 30,
          registered: 28,
          location: 'Salle atelier',
          tags: ['IoT', 'Pratique', 'Implémentation']
        },
        {
          id: 'd3',
          title: 'Démonstration Live Blockchain',
          description: 'Présentation en direct d\'une solution blockchain pour la traçabilité des conteneurs',
          date: new Date(Date.now() + 259200000),
          time: '11:00',
          duration: '30 min',
          speaker: 'Sophie Leroy',
          company: 'SecureChain',
          type: 'demo',
          capacity: 60,
          registered: 45,
          location: 'Zone démonstration',
          tags: ['Blockchain', 'Traçabilité', 'Sécurité']
        }
      ],
      status: 'active',
      totalPrograms: 3,
      totalCapacity: 170,
      totalRegistered: 138
    },
    {
      id: 'sustainability',
      name: 'Pavillon Développement Durable',
      theme: 'sustainability',
      description: 'Solutions écologiques et stratégies de développement durable pour l\'industrie maritime',
      objectives: [
        'Promouvoir les pratiques durables',
        'Présenter les technologies vertes',
        'Favoriser la transition énergétique'
      ],
      features: [
        'Énergies renouvelables portuaires',
        'Réduction des émissions CO2',
        'Gestion durable des déchets',
        'Économie circulaire maritime'
      ],
      targetAudience: ['Responsables RSE', 'Écologues', 'Décideurs politiques', 'ONG environnementales'],
      demoPrograms: [
        {
          id: 's1',
          title: 'Solutions Énergies Renouvelables',
          description: 'Présentation des technologies solaires et éoliennes adaptées aux ports',
          date: new Date(Date.now() + 86400000),
          time: '09:30',
          duration: '1h',
          speaker: 'Claire Dupont',
          company: 'GreenPort Solutions',
          type: 'presentation',
          capacity: 100,
          registered: 87,
          location: 'Amphithéâtre vert',
          tags: ['Énergie', 'Renouvelable', 'Solaire']
        },
        {
          id: 's2',
          title: 'Workshop Économie Circulaire',
          description: 'Atelier collaboratif sur l\'application de l\'économie circulaire dans les ports',
          date: new Date(Date.now() + 345600000),
          time: '15:00',
          duration: '1h30',
          speaker: 'Michel Bernard',
          company: 'Circular Ports',
          type: 'workshop',
          capacity: 40,
          registered: 35,
          location: 'Salle collaborative',
          tags: ['Circulaire', 'Déchets', 'Innovation']
        }
      ],
      status: 'active',
      totalPrograms: 2,
      totalCapacity: 140,
      totalRegistered: 122
    },
    {
      id: 'security',
      name: 'Pavillon Sécurité & Cybersécurité',
      theme: 'security',
      description: 'Technologies et stratégies de sécurité pour les infrastructures portuaires critiques',
      objectives: [
        'Renforcer la sécurité des installations portuaires',
        'Présenter les solutions cybersécurité',
        'Former aux meilleures pratiques'
      ],
      features: [
        'Systèmes de surveillance avancés',
        'Cybersécurité maritime',
        'Gestion des risques',
        'Formation et sensibilisation'
      ],
      targetAudience: ['Responsables sécurité', 'Experts cybersécurité', 'Autorités portuaires', 'Forces de l\'ordre'],
      demoPrograms: [
        {
          id: 'sec1',
          title: 'Simulation Cyberattaque',
          description: 'Démonstration d\'une simulation de cyberattaque sur un système portuaire',
          date: new Date(Date.now() + 172800000),
          time: '13:00',
          duration: '45 min',
          speaker: 'Pierre Durand',
          company: 'CyberPort Security',
          type: 'demo',
          capacity: 50,
          registered: 48,
          location: 'Salle sécurisée',
          tags: ['Cybersécurité', 'Simulation', 'Risques']
        },
        {
          id: 'sec2',
          title: 'Table Ronde Sécurité',
          description: 'Discussion avec experts sur les défis de sécurité dans les ports modernes',
          date: new Date(Date.now() + 432000000),
          time: '10:00',
          duration: '2h',
          speaker: 'Marie Martin',
          company: 'Port Authority',
          type: 'roundtable',
          capacity: 80,
          registered: 72,
          location: 'Salle conférence',
          tags: ['Sécurité', 'Discussion', 'Experts']
        }
      ],
      status: 'active',
      totalPrograms: 2,
      totalCapacity: 130,
      totalRegistered: 120
    },
    {
      id: 'innovation',
      name: 'Pavillon Innovation & Start-ups',
      theme: 'innovation',
      description: 'Espace dédié aux jeunes entreprises innovantes et aux projets disruptifs',
      objectives: [
        'Soutenir l\'innovation portuaire',
        'Faciliter les rencontres investisseurs-startups',
        'Accélérer le développement de solutions'
      ],
      features: [
        'Pitchs de startups',
        'Démonstrations de prototypes',
        'Sessions de networking',
        'Concours d\'innovation'
      ],
      targetAudience: ['Startups', 'Investisseurs', 'Incubateurs', 'Chercheurs'],
      demoPrograms: [
        {
          id: 'i1',
          title: 'Pitch Battle Startups',
          description: 'Compétition de pitchs entre 5 startups innovantes du secteur maritime',
          date: new Date(Date.now() + 259200000),
          time: '16:00',
          duration: '1h30',
          speaker: 'Alain Moreau',
          company: 'Maritime Innovation Hub',
          type: 'presentation',
          capacity: 120,
          registered: 115,
          location: 'Scène innovation',
          tags: ['Pitch', 'Startups', 'Innovation']
        },
        {
          id: 'i2',
          title: 'Démonstration Prototypes',
          description: 'Présentation de prototypes technologiques développés par des startups',
          date: new Date(Date.now() + 518400000),
          time: '11:00',
          duration: '2h',
          speaker: 'Sophie Chen',
          company: 'Tech Accelerator',
          type: 'demo',
          capacity: 60,
          registered: 52,
          location: 'Zone prototypes',
          tags: ['Prototypes', 'Technologie', 'Démonstration']
        }
      ],
      status: 'active',
      totalPrograms: 2,
      totalCapacity: 180,
      totalRegistered: 167
    }
  ];

  const filteredPavilions = pavilions.filter(pavilion => {
    const matchesSearch = pavilion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pavilion.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTheme = !selectedTheme || pavilion.theme === selectedTheme;

    return matchesSearch && matchesTheme;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getThemeLabel = (theme: string) => {
    switch (theme) {
      case 'digitalization': return 'Digitalisation';
      case 'sustainability': return 'Développement Durable';
      case 'security': return 'Sécurité';
      case 'innovation': return 'Innovation';
      default: return theme;
    }
  };

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'digitalization': return 'bg-blue-100 text-blue-800';
      case 'sustainability': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'innovation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDemoTypeIcon = (type: string) => {
    switch (type) {
      case 'presentation': return Presentation;
      case 'workshop': return Lightbulb;
      case 'demo': return Settings;
      case 'roundtable': return Users;
      default: return Presentation;
    }
  };

  const handlePavilionAction = (pavilionId: string, action: string) => {
    console.log(`Action ${action} pour le pavillon ${pavilionId}`);
    // Ici vous pouvez implémenter les actions réelles
  };

  const handleDemoAction = (demoId: string, action: string) => {
    console.log(`Action ${action} pour la démonstration ${demoId}`);
    // Ici vous pouvez implémenter les actions réelles
  };

  const themeOptions = [
    { value: 'digitalization', label: 'Digitalisation' },
    { value: 'sustainability', label: 'Développement Durable' },
    { value: 'security', label: 'Sécurité' },
    { value: 'innovation', label: 'Innovation' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Pavillons Thématiques</h1>
              <p className="text-gray-600 mt-2">
                Administration et organisation des pavillons SIPORTS 2026
              </p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_PAVILION}>
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Créer Pavillon
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pavillons</p>
                  <p className="text-3xl font-bold text-gray-900">{pavilions.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Programmes</p>
                  <p className="text-3xl font-bold text-green-600">
                    {pavilions.reduce((sum, p) => sum + p.totalPrograms, 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants Totaux</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {pavilions.reduce((sum, p) => sum + p.totalRegistered, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round((pavilions.reduce((sum, p) => sum + p.totalRegistered, 0) /
                               pavilions.reduce((sum, p) => sum + p.totalCapacity, 0)) * 100)}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
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
                  placeholder="Rechercher par nom ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les thèmes</option>
                {themeOptions.map(theme => (
                  <option key={theme.value} value={theme.value}>{theme.label}</option>
                ))}
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Pavilions Grid */}
        <div className="space-y-6">
          {filteredPavilions.map((pavilion, index) => (
            <motion.div
              key={pavilion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {pavilion.name}
                        </h3>
                        <Badge className={getThemeColor(pavilion.theme)}>
                          {getThemeLabel(pavilion.theme)}
                        </Badge>
                        <Badge variant="success">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {pavilion.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Métriques du pavillon */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-blue-600">{pavilion.totalPrograms}</div>
                      <div className="text-sm text-blue-700">Programmes</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{pavilion.totalCapacity}</div>
                      <div className="text-sm text-green-700">Capacité totale</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-purple-600">{pavilion.totalRegistered}</div>
                      <div className="text-sm text-purple-700">Inscrits</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-lg font-semibold text-orange-600">
                        {Math.round((pavilion.totalRegistered / pavilion.totalCapacity) * 100)}%
                      </div>
                      <div className="text-sm text-orange-700">Taux remplissage</div>
                    </div>
                  </div>

                  {/* Programmes de démonstration */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                      Programmes de Démonstration ({pavilion.demoPrograms.length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pavilion.demoPrograms.map((program) => {
                        const DemoIcon = getDemoTypeIcon(program.type);
                        return (
                          <Card key={program.id} className="p-4 bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <div className="bg-indigo-100 p-2 rounded-lg">
                                <DemoIcon className="h-4 w-4 text-indigo-600" />
                              </div>

                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900 text-sm mb-1">
                                  {program.title}
                                </h5>
                                <div className="text-xs text-gray-600 mb-2">
                                  <div className="flex items-center mb-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(program.date)}
                                  </div>
                                  <div className="flex items-center mb-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {program.time} ({program.duration})
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-3 w-3 mr-1" />
                                    {program.registered}/{program.capacity}
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDemoAction(program.id, 'edit')}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDemoAction(program.id, 'delete')}
                                  >
                                    <XCircle className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions du pavillon */}
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => handlePavilionAction(pavilion.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir Détails
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handlePavilionAction(pavilion.id, 'edit')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier Pavillon
                    </Button>
                    <Link to={`/admin/pavilion/${pavilion.id}/add-demo`}>
                      <Button variant="default">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter Programme
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => handlePavilionAction(pavilion.id, 'more')}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPavilions.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun pavillon trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
