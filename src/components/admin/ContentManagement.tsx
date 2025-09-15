import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  FileText,
  Users,
  Building2,
  Calendar,
  BarChart3,
  Globe,
  Shield,
  Edit,
  Save,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';

export default function ContentManagementPage() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Sections modifiables de l'application
  const contentSections = [
    {
      id: 'home',
      title: 'Page d\'Accueil',
      description: 'Contenu principal, héros, statistiques, témoignages',
      icon: Globe,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      lastModified: '2025-01-15',
      status: 'published'
    },
    {
      id: 'pavilions',
      title: 'Pavillons Thématiques',
      description: 'Gestion des pavillons SIPORTS 2026 et programmes',
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      lastModified: '2025-01-20',
      status: 'published'
    },
    {
      id: 'exhibitors',
      title: 'Exposants',
      description: 'Gestion des profils exposants et mini-sites',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      lastModified: '2025-01-18',
      status: 'published'
    },
    {
      id: 'events',
      title: 'Événements',
      description: 'Gestion des conférences et programmes',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      lastModified: '2025-01-19',
      status: 'published'
    },
    {
      id: 'news',
      title: 'Actualités',
      description: 'Articles, communiqués et annonces',
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      lastModified: '2025-01-17',
      status: 'published'
    },
    {
      id: 'partners',
      title: 'Partenaires',
      description: 'Gestion des partenaires et sponsors',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      lastModified: '2025-01-16',
      status: 'published'
    },
    {
      id: 'metrics',
      title: 'Métriques & Analytics',
      description: 'Tableaux de bord et statistiques',
      icon: BarChart3,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100',
      lastModified: '2025-01-14',
      status: 'published'
    }
  ];

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Ici vous pouvez implémenter la logique de sauvegarde
    console.log('Sauvegarde du contenu pour la section:', selectedSection);
  };

  const handlePreview = () => {
    // Ici vous pouvez implémenter la logique de prévisualisation
    console.log('Prévisualisation de la section:', selectedSection);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Publié</Badge>;
      case 'draft':
        return <Badge variant="warning">Brouillon</Badge>;
      case 'archived':
        return <Badge variant="info">Archivé</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const selectedSectionData = contentSections.find(section => section.id === selectedSection);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion du Contenu</h1>
              <p className="text-gray-600 mt-2">
                Administration centralisée de tous les contenus de l'application SIPORTS
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des sections */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  Sections Modifiables
                </h2>

                <div className="space-y-3">
                  {contentSections.map((section) => {
                    const IconComponent = section.icon;
                    const isSelected = selectedSection === section.id;

                    return (
                      <motion.div
                        key={section.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => handleSectionSelect(section.id)}
                          className={`w-full p-4 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-lg ${section.bgColor}`}>
                              <IconComponent className={`h-4 w-4 ${section.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm">
                                {section.title}
                              </h3>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {section.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  Modifié: {section.lastModified}
                                </span>
                                {getStatusBadge(section.status)}
                              </div>
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          {/* Éditeur de contenu */}
          <div className="lg:col-span-2">
            {selectedSection ? (
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      {selectedSectionData && (
                        <>
                          <div className={`p-2 rounded-lg ${selectedSectionData.bgColor}`}>
                            <selectedSectionData.icon className={`h-5 w-5 ${selectedSectionData.color}`} />
                          </div>
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {selectedSectionData.title}
                            </h2>
                            <p className="text-sm text-gray-600">
                              {selectedSectionData.description}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={handlePreview}>
                        <Eye className="h-4 w-4 mr-2" />
                        Prévisualiser
                      </Button>
                      {!isEditing ? (
                        <Button variant="default" size="sm" onClick={handleEdit}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" onClick={handleSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Zone d'édition */}
                  <div className="space-y-6">
                    {selectedSection === 'home' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Titre Principal
                          </label>
                          <input
                            type="text"
                            disabled={!isEditing}
                            defaultValue="SIPORTS 2026 - Salon International des Ports et Technologies"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            rows={4}
                            disabled={!isEditing}
                            defaultValue="Le rendez-vous mondial des professionnels des ports et de la logistique maritime. Découvrez les innovations technologiques qui transforment l'industrie portuaire."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Statistiques Clés
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                              type="text"
                              disabled={!isEditing}
                              defaultValue="500+ Exposants"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <input
                              type="text"
                              disabled={!isEditing}
                              defaultValue="10,000+ Visiteurs"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                            <input
                              type="text"
                              disabled={!isEditing}
                              defaultValue="50+ Pays"
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSection === 'pavilions' && (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-800">
                            <strong>Info:</strong> La gestion des pavillons se fait via la page dédiée
                            "Gestion des Pavillons" dans le menu principal.
                          </p>
                          <Link to="/admin/pavilions">
                            <Button variant="outline" size="sm" className="mt-2">
                              <Building2 className="h-4 w-4 mr-2" />
                              Aller à la Gestion des Pavillons
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {selectedSection === 'events' && (
                      <div className="space-y-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <p className="text-sm text-orange-800">
                            <strong>Info:</strong> La gestion des événements se fait via la page dédiée
                            "Gestion des Événements" dans le menu principal.
                          </p>
                          <Link to="/admin/content">
                            <Button variant="outline" size="sm" className="mt-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              Aller à la Gestion des Événements
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {selectedSection === 'news' && (
                      <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <p className="text-sm text-indigo-800">
                            <strong>Info:</strong> La gestion des actualités se fait via le système
                            de création d'articles dans le menu principal.
                          </p>
                          <Link to="/admin/create-news">
                            <Button variant="outline" size="sm" className="mt-2">
                              <FileText className="h-4 w-4 mr-2" />
                              Créer un Article
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Sections génériques */}
                    {(selectedSection === 'exhibitors' || selectedSection === 'partners' || selectedSection === 'metrics') && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm text-gray-700">
                            Cette section est gérée automatiquement par le système.
                            Les modifications se font via les interfaces dédiées dans le menu principal.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="p-12 text-center">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sélectionnez une Section
                  </h3>
                  <p className="text-gray-600">
                    Choisissez une section dans la liste à gauche pour commencer l'édition du contenu
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
