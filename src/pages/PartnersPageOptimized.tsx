/**
 * PartnersPage Optimisé avec Pagination
 * Utilise tous les nouveaux composants de Phase 1
 */

import React, { useEffect, useState } from 'react';
import { Download, Grid, List, Building } from 'lucide-react';
import { useOptimizedList } from '../hooks/useOptimizedList';
import { Pagination } from '../components/ui/Pagination';
import { AdvancedSearch } from '../components/search/AdvancedSearch';
import { PartnerCard } from '../components/cards/PartnerCardMemo';
import { exportService } from '../services/exportService';
import { useRateLimit, RATE_LIMITS } from '../middleware/rateLimiter';
import { SupabaseService } from '../services/supabaseService';
import { logger } from '../lib/logger';
import type { Partner } from '../types';

export const PartnersPageOptimized: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');

  const { checkLimit: checkExportLimit, getRemaining } = useRateLimit(
    undefined,
    RATE_LIMITS.EXPORT
  );

  const {
    paginatedItems,
    totalItems,
    currentPage,
    totalPages,
    goToPage,
    searchQuery,
    setSearchQuery,
    sortField,
    sortDirection,
    toggleSort,
    setFilter,
    clearFilters,
  } = useOptimizedList({
    items: partners,
    itemsPerPage: 12,
    searchFields: ['organizationName', 'sector', 'description', 'country'],
    initialSortField: 'organizationName',
    filterFn: (partner, filters) => {
      if (filters.partnerType && partner.partnerType !== filters.partnerType) return false;
      if (filters.verified && !partner.verified) return false;
      if (filters.featured && !partner.featured) return false;
      if (filters.country && partner.country !== filters.country) return false;
      return true;
    },
  });

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      logger.info('Loading partners');

      const data = await SupabaseService.getPartners();
      setPartners(data || []);

      logger.info('Partners loaded', { count: data?.length || 0 });
    } catch (error) {
      logger.error('Failed to load partners', error as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!checkExportLimit()) {
      const remaining = getRemaining();
      alert(`Limite d'export atteinte. ${remaining} exports restants.`);
      return;
    }

    try {
      logger.trackAction('export_partners', undefined, { format: exportFormat });
      await exportService.exportPartners(partners, exportFormat);
    } catch (error) {
      logger.error('Export failed', error as Error);
      alert('Erreur lors de l\'export');
    }
  };

  const suggestions = React.useMemo(() => {
    const uniqueSectors = Array.from(new Set(partners.map((p) => p.sector)));
    return uniqueSectors.slice(0, 10);
  }, [partners]);

  const uniqueCountries = React.useMemo(() => {
    return Array.from(new Set(partners.map((p) => p.country))).sort();
  }, [partners]);

  const searchFilters = [
    {
      key: 'partnerType',
      label: 'Type de partenaire',
      type: 'select' as const,
      options: [
        { value: 'institutional', label: 'Institutionnel' },
        { value: 'platinum', label: 'Platinum' },
        { value: 'gold', label: 'Gold' },
        { value: 'silver', label: 'Silver' },
        { value: 'bronze', label: 'Bronze' },
      ],
    },
    {
      key: 'country',
      label: 'Pays',
      type: 'select' as const,
      options: uniqueCountries.map((c) => ({ value: c, label: c })),
    },
    {
      key: 'verified',
      label: 'Vérifiés uniquement',
      type: 'checkbox' as const,
    },
    {
      key: 'featured',
      label: 'En vedette uniquement',
      type: 'checkbox' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Partenaires SIPORT 2026
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Découvrez les {totalItems} partenaires soutenant le salon
          </p>
        </header>

        {/* Search & Filters */}
        <div className="mb-6">
          <AdvancedSearch
            placeholder="Rechercher par nom, secteur, pays..."
            onSearch={(query, filters) => {
              setSearchQuery(query);
              Object.entries(filters).forEach(([key, value]) => {
                setFilter(key, value);
              });
            }}
            filters={searchFilters}
            suggestions={suggestions}
            showFilters
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Trier par:</label>
            <select
              value={sortField?.toString() || 'organizationName'}
              onChange={(e) => toggleSort(e.target.value as keyof Partner)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="organizationName">Nom</option>
              <option value="sector">Secteur</option>
              <option value="partnerType">Type</option>
              <option value="country">Pays</option>
            </select>

            <button
              onClick={() => sortField && toggleSort(sortField)}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              aria-label={`Direction: ${sortDirection === 'asc' ? 'Croissant' : 'Décroissant'}`}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-50'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Exporter</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : paginatedItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-gray-600">
                Aucun partenaire trouvé pour votre recherche
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {paginatedItems.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>

              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={12}
                  onPageChange={goToPage}
                  showFirstLast
                  showItemsCount
                />
              </div>
            </>
          )}
        </main>

        {/* Stats */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
              <div className="text-sm text-gray-600">Total Partenaires</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">
                {partners.filter((p) => p.partnerType === 'platinum' || p.partnerType === 'platinum').length}
              </div>
              <div className="text-sm text-gray-600">Platinum</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {partners.filter((p) => p.partnerType === 'gold').length}
              </div>
              <div className="text-sm text-gray-600">Gold</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600">
                {partners.filter((p) => p.partnerType === 'silver').length}
              </div>
              <div className="text-sm text-gray-600">Silver</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PartnersPageOptimized;
