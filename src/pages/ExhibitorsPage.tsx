import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useExhibitorStore } from '../store/exhibitorStore';
import useAuthStore from '../store/authStore';
import { ROUTES } from '../lib/routes';
import { CONFIG } from '../lib/config';
import { useTranslation } from '../hooks/useTranslation';
import { MoroccanPattern } from '../components/ui/MoroccanDecor';
import ExhibitorCard from '../components/exhibitor/ExhibitorCard';

export default function ExhibitorsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  // ⚡ OPTIMISÉ: Mémoriser les catégories pour éviter la recréation à chaque render
  const categories = useMemo(() => [
    { value: '', label: t('pages.exhibitors.all_categories') },
    { value: 'institutional', label: t('pages.exhibitors.category_institutional') },
    { value: 'port-industry', label: t('pages.exhibitors.category_port_industry') },
    { value: 'port-operations', label: t('pages.exhibitors.category_operations') },
    { value: 'academic', label: t('pages.exhibitors.category_academic') }
  ], [t]);

  // ⚡ OPTIMISÉ: useCallback pour éviter de recréer ces fonctions à chaque render
  const getCategoryLabel = useCallback((category: string) => {
    const labels = {
      'institutional': t('pages.exhibitors.category_institutional'),
      'port-industry': t('pages.exhibitors.category_port_industry'),
      'port-operations': t('pages.exhibitors.category_operations'),
      'academic': t('pages.exhibitors.category_academic')
    };
    return labels[category as keyof typeof labels] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'institutional': 'success',
      'port-industry': 'error',
      'port-operations': 'info',
      'academic': 'warning'
    };
    return colors[category] || 'default';
  }, []);

  // ⚡ OPTIMISÉ: useCallback pour les handlers
  const handleViewDetails = useCallback((exhibitorId: string) => {
    navigate(`${ROUTES.EXHIBITORS}/${exhibitorId}`);
  }, [navigate]);

  const handleScheduleAppointment = useCallback((exhibitorId: string) => {
    // Récupérer l'état actuel du store directement
    const currentAuthState = useAuthStore.getState();

    if (!currentAuthState.isAuthenticated || !currentAuthState.user) {
      // Rediriger vers la page de connexion avec redirection vers les RDV
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
      // Rediriger directement vers la page des RDV avec l'ID de l'exposant
      navigate(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-siports-primary via-siports-secondary to-siports-accent relative overflow-hidden shadow-lg">
        <MoroccanPattern className="opacity-10" color="white" scale={0.5} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('pages.exhibitors.title')}
              </h1>
              <p className="text-lg text-blue-100">
                {t('pages.exhibitors.description')} {filteredExhibitors.length}
              </p>
            </div>
            
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  data-testid="search-input"
                  placeholder={t('pages.exhibitors.search')}
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
                  {t('pages.exhibitors.filter_category')}
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
                    {t('pages.exhibitors.filter_category')}
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
                    {t('profile.sector')}
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
                    {t('profile.location')}
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
              <div key={`skeleton-${i}`} className="animate-pulse">
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
              {t('pages.exhibitors.no_results')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('messages.confirm_action')}
            </p>
            <Button variant="default" onClick={() => setFilters({ search: '', category: '', sector: '', country: '' })}>
              {t('actions.cancel')}
            </Button>
          </div>
        ) : (
          // ⚡ OPTIMISÉ: Utilisation du composant ExhibitorCard mémorisé
          <div data-testid="exhibitors-list" className={viewMode === CONFIG.viewModes.grid
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {filteredExhibitors.map((exhibitor, index) => (
              <ExhibitorCard
                key={exhibitor.id}
                exhibitor={exhibitor}
                viewMode={viewMode}
                index={index}
                onViewDetails={handleViewDetails}
                onScheduleAppointment={handleScheduleAppointment}
                getCategoryLabel={getCategoryLabel}
                getCategoryColor={getCategoryColor}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

