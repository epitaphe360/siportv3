import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  MapPin, 
  Users, 
  ExternalLink,
  Star,
  Verified,
  Calendar
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useExhibitorStore } from '../store/exhibitorStore';
import useAuthStore from '../store/authStore';
import { motion } from 'framer-motion';
import { ROUTES } from '../lib/routes';
import { CONFIG } from '../lib/config';

export default function ExhibitorsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { 
    filteredExhibitors, 
    filters, 
    isLoading, 
    fetchExhibitors, 
    setFilters 
  } = useExhibitorStore();
  
  const [viewMode, setViewMode] = useState<keyof typeof CONFIG.viewModes>(CONFIG.viewModes.grid);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExhibitors();
  }, [fetchExhibitors]);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = (exhibitorId: string) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec redirection vers les RDV
  navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
      // Rediriger directement vers la page des RDV
  navigate(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`);
    }
  };

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'institutional', label: 'Institutionnel' },
    { value: 'port-industry', label: 'Industrie Portuaire' },
    { value: 'port-operations', label: 'Exploitation & Gestion' },
    { value: 'academic', label: 'Académique & Formation' }
  ];

  const getCategoryLabel = (category: string) => {
    const labels = {
      'institutional': 'Institutionnel',
      'port-industry': 'Industrie Portuaire',
      'port-operations': 'Exploitation & Gestion',
      'academic': 'Académique & Formation'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'port-industry': 'error',
      'port-operations': 'info',
      'academic': 'warning'
    };
    return colors[category] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Exposants SIPORTS 2026
              </h1>
              <p className="text-lg text-gray-600">
                Découvrez les {filteredExhibitors.length} exposants participants au salon
              </p>
            </div>
            
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un exposant..."
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
                
                <div className="flex border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode(CONFIG.viewModes.grid)}
                    className={`p-2 ${viewMode === CONFIG.viewModes.grid ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode(CONFIG.viewModes.list)}
                    className={`p-2 ${viewMode === CONFIG.viewModes.list ? 'bg-blue-50 text-blue-600' : 'text-gray-400'}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Port Management"
                    value={filters.sector}
                    onChange={(e) => setFilters({ sector: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Morocco"
                    value={filters.country}
                    onChange={(e) => setFilters({ country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 h-80">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredExhibitors.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun exposant trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button variant="default" onClick={() => setFilters({ search: '', category: '', sector: '', country: '' })}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className={viewMode === CONFIG.viewModes.grid 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {filteredExhibitors.map((exhibitor, index) => (
              <motion.div
                key={exhibitor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className={viewMode === CONFIG.viewModes.list ? 'flex items-center p-6' : 'h-full'}>
                  {viewMode === CONFIG.viewModes.grid ? (
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={exhibitor.logo}
                            alt={exhibitor.companyName}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {exhibitor.companyName}
                            </h3>
                            <p className="text-sm text-gray-500">{exhibitor.sector}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {exhibitor.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {exhibitor.verified && (
                            <Verified className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="mb-4">
                        <Badge 
                          variant={getCategoryColor(exhibitor.category)}
                          size="sm"
                        >
                          {getCategoryLabel(exhibitor.category)}
                        </Badge>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                        {exhibitor.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{exhibitor.miniSite?.views || 0} vues</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{exhibitor.products.length} produits</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <Link to={`/exhibitors/${exhibitor.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            Voir le Profil
                          </Button>
                        </Link>
                        <Button 
                          variant="default"
                          size="sm" 
                          className="ml-2"
                          onClick={() => handleAppointmentClick(exhibitor.id)}
                        >
                          <Calendar className="h-4 w-4 mr-1" />
                          RDV
                        </Button>
                        {exhibitor.website && (
                          <a
                            href={exhibitor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-6 w-full">
                      <img
                        src={exhibitor.logo}
                        alt={exhibitor.companyName}
                        className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                      />
                      
                      <div className="flex-grow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {exhibitor.companyName}
                            </h3>
                            <p className="text-sm text-gray-500">{exhibitor.sector}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={getCategoryColor(exhibitor.category)}
                              size="sm"
                            >
                              {getCategoryLabel(exhibitor.category)}
                            </Badge>
                            {exhibitor.verified && (
                              <Verified className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {exhibitor.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{exhibitor.miniSite?.views || 0} vues</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{exhibitor.products.length} produits</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Link to={`/exhibitors/${exhibitor.id}`}>
                              <Button variant="outline" size="sm">
                                Voir le Profil
                              </Button>
                            </Link>
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={() => handleAppointmentClick(exhibitor.id)}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              RDV
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};