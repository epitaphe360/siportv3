import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Building2,
  Search,
  Filter,
  MapPin,
  Users,
  Star,
  MoreVertical,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import { useFilterSearch } from '../../hooks/useFilterSearch';

interface Exhibitor {
  id: string;
  company_name: string;
  category: string;
  description: string;
  verified: boolean; // Assuming 'status' is now 'verified'
  contact_info: { name: string; email: string };
  website: string | null;
  employees: number | null;
  founded: number | null;
  location: string | null;
  rating: number | null;
  visitorsCount: number; // This might need to be derived or added to DB
  created_at: string;
  status: 'approved' | 'pending' | 'rejected'; // Added for UI display
  // Add other fields as per your Supabase 'exhibitors' table structure
}

export default function ExhibitorsPage() {
  const { t } = useTranslation();
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExhibitors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getAll('exhibitors');
        const formattedData = data.map((item: any) => ({
          ...item,
          company_name: item.company_name || 'N/A',
          category: item.category || 'N/A',
          description: item.description || 'N/A',
          verified: item.verified || false,
          contact_info: item.contact_info || { name: 'N/A', email: 'N/A' },
          visitorsCount: item.visitorsCount || 0, // Placeholder, adjust if DB has this
          status: item.verified ? 'approved' : 'pending', // Map 'verified' to a display status
        }));
        setExhibitors(formattedData as Exhibitor[]);
      } catch (err) {
        console.error('Error fetching exhibitors:', err);
        setError('Failed to load exhibitors. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExhibitors();
  }, []);

  const { searchTerm, setSearchTerm, selectedFilter: selectedCategory, setSelectedFilter: setSelectedCategory, filteredData: filteredExhibitorsByCategory } =
    useFilterSearch<Exhibitor>({
      data: exhibitors,
      searchKeys: ['company_name', 'description', 'contact_info.name'],
      filterKey: 'category',
    });

  const { selectedFilter: selectedStatus, setSelectedFilter: setSelectedStatus, filteredData: finalFilteredExhibitors } =
    useFilterSearch<Exhibitor>({
      data: filteredExhibitorsByCategory,
      searchKeys: [], // Already filtered by searchTerm
      filterKey: 'status',
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />ApprouvÃ©</Badge>;
      case 'pending':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'rejected':
        return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />RejetÃ©</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const handleExhibitorAction = (exhibitorId: string, action: string) => {
    // Implement actual actions like viewing details, editing, approving/rejecting
  };

  const categories = [
    'Infrastructure Portuaire',
    'Technologie',
    'Logistique',
    'Data & Analytics',
    'IngÃ©nierie',
    'SÃ©curitÃ©',
    'Environnement'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Chargement des exposants...</h3>
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
            RÃ©essayer
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
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Exposants</h1>
              <p className="text-gray-600 mt-2">
                Administration et validation des exposants SIPORTS 2026
              </p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_EXHIBITOR}>
              <Button variant="default">
                <Building2 className="h-4 w-4 mr-2" />
                Ajouter Exposant
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
                  <p className="text-sm font-medium text-gray-600">Total Exposants</p>
                  <p className="text-3xl font-bold text-gray-900">{exhibitors.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ApprouvÃ©s</p>
                  <p className="text-3xl font-bold text-green-600">
                    {exhibitors.filter(e => e.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {exhibitors.filter(e => e.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visiteurs Totaux</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {exhibitors.reduce((sum, e) => sum + e.visitorsCount, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
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
                  placeholder="Rechercher par nom, description ou contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les catÃ©gories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="approved">ApprouvÃ©</option>
                <option value="pending">En attente</option>
                <option value="rejected">RejetÃ©</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Exhibitors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {finalFilteredExhibitors.map((exhibitor, index) => (
            <motion.div
              key={exhibitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {exhibitor.company_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{exhibitor.category}</p>
                      {getStatusBadge(exhibitor.status)}
                    </div>
                    <div className="ml-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {exhibitor.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{exhibitor.location || 'N/A'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{exhibitor.employees || 'N/A'} employÃ©s</span>
                    </div>
                    {/* Assuming standNumber is not directly in the DB or needs to be fetched separately */}
                    {/* {exhibitor.standNumber && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span>Stand {exhibitor.standNumber}</span>
                      </div>
                    )} */}
                    {exhibitor.rating && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>{exhibitor.rating}/5 ({exhibitor.visitorsCount} visiteurs)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Inscrit le {formatDate(exhibitor.created_at)}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleExhibitorAction(exhibitor.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExhibitorAction(exhibitor.id, 'edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExhibitorAction(exhibitor.id, 'more')}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {finalFilteredExhibitors.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun exposant trouvÃ©
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critÃ¨res de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};



