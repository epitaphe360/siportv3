import { useState, useEffect } from 'react';
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
  Settings,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { Database } from '../../lib/supabase'; // Import the Database type
import { useFilterSearch } from '../../hooks/useFilterSearch';

// Define Pavilion type based on Supabase schema
type Pavilion = Database['public']['Tables']['pavilions']['Row'] & {
  demoPrograms?: DemoProgram[]; // Assuming demoPrograms might be a JSONB column or related table
  totalPrograms?: number;
  totalCapacity?: number;
  totalRegistered?: number;
};

interface DemoProgram {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  speaker: string;
  company: string;
  type: string;
  capacity: number;
  registered: number;
  location: string;
  tags: string[];
}

export default function PavillonsPage() {
  const [pavilions, setPavilions] = useState<Pavilion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPavilions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getAll('pavilions');
        const formattedData = data.map((item: any) => {
          // Calculate aggregated stats if demoPrograms are part of the pavilion object
          const demoPrograms = item.demo_programs || []; // Assuming demo_programs is the column name
          const totalPrograms = demoPrograms.length;
          const totalCapacity = demoPrograms.reduce((sum: number, program: DemoProgram) => sum + program.capacity, 0);
          const totalRegistered = demoPrograms.reduce((sum: number, program: DemoProgram) => sum + program.registered, 0);

          return {
            ...item,
            name: item.name || 'N/A',
            theme: item.theme || 'N/A',
            description: item.description || 'N/A',
            demoPrograms: demoPrograms,
            totalPrograms,
            totalCapacity,
            totalRegistered,
          };
        });
        setPavilions(formattedData as Pavilion[]);
      } catch (err) {
        console.error('Error fetching pavilions:', err);
        setError('Failed to load pavilions. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPavilions();
  }, []);

  const { searchTerm, setSearchTerm, selectedFilter: selectedTheme, setSelectedFilter: setSelectedTheme, filteredData: finalFilteredPavilions } =
    useFilterSearch<Pavilion>({
      data: pavilions,
      searchKeys: ['name', 'description'],
      filterKey: 'theme',
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
      default: return theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement des pavillons...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

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
                    {pavilions.reduce((sum, p) => sum + (p.totalPrograms || 0), 0)}
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
                    {pavilions.reduce((sum, p) => sum + (p.totalRegistered || 0), 0).toLocaleString()}
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
                    {pavilions.reduce((sum, p) => sum + (p.totalCapacity || 0), 0) > 0
                      ? Math.round((pavilions.reduce((sum, p) => sum + (p.totalRegistered || 0), 0) /
                                   pavilions.reduce((sum, p) => sum + (p.totalCapacity || 0), 0)) * 100)
                      : 0}%
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
          {finalFilteredPavilions.map((pavilion, index) => (
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
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {pavilion.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Créé le {formatDate(pavilion.created_at)}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {pavilion.demoPrograms && pavilion.demoPrograms.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Programmes de Démonstration</h4>
                      <div className="space-y-4">
                        {pavilion.demoPrograms.map((program, programIndex) => {
                          const DemoIcon = getDemoTypeIcon(program.type);
                          return (
                            <div key={program.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="p-2 rounded-md bg-white shadow-sm">
                                <DemoIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="flex-1">
                                <h5 className="text-md font-medium text-gray-900">{program.title}</h5>
                                <p className="text-sm text-gray-700 line-clamp-1">{program.description}</p>
                                <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                                  <span><Calendar className="inline-block h-3 w-3 mr-1" />{formatDate(program.date)}</span>
                                  <span><Clock className="inline-block h-3 w-3 mr-1" />{program.time} ({program.duration})</span>
                                  <span><Users className="inline-block h-3 w-3 mr-1" />{program.registered}/{program.capacity}</span>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDemoAction(program.id, 'view')}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 mt-6">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePavilionAction(pavilion.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePavilionAction(pavilion.id, 'edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
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

        {finalFilteredPavilions.length === 0 && (
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
