import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Grid2x2 as Grid, List } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';
import type { PartnerTier } from '../config/partnerTiers';
import { useTranslation } from '../hooks/useTranslation';
import { COUNTRIES } from '../data/countries';
import PartnerCard from '../components/partner/PartnerCard';

interface Partner {
  id: string;
  name: string;
  partner_tier: PartnerTier; // Nouveau système: museum, silver, gold, platinium
  category: string;
  description: string;
  logo: string;
  website?: string;
  country: string;
  sector: string;
  verified: boolean;
  featured: boolean;
  contributions: string[];
  establishedYear: number;
  employees: string;
}

// Les partenaires sont maintenant chargés depuis Supabase

export default function PartnersPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [viewMode, setViewMode] = useState<keyof typeof CONFIG.viewModes>(CONFIG.viewModes.grid);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerStats, setPartnerStats] = useState({
    museum: 0,
    silver: 0,
    gold: 0,
    platinium: 0,
    total: 0
  });

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getPartners();
        setPartners(data);
        setFilteredPartners(data);

        // Calculer les statistiques par tier
        const stats = {
          museum: data.filter(p => p.partner_tier === 'museum').length,
          silver: data.filter(p => p.partner_tier === 'silver').length,
          gold: data.filter(p => p.partner_tier === 'gold').length,
          platinium: data.filter(p => p.partner_tier === 'platinium').length,
          total: data.length
        };
        setPartnerStats(stats);
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error);
        setPartners([]);
        setFilteredPartners([]);
        // Statistiques par défaut
        setPartnerStats({
          museum: 0,
          silver: 0,
          gold: 0,
          platinium: 0,
          total: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPartners();
  }, []);

  useEffect(() => {
    const filtered = partners.filter(partner => {
      const name = partner.name || '';
      const description = partner.description || '';
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = name.toLowerCase().includes(search) ||
                           description.toLowerCase().includes(search);
      const matchesTier = !selectedTier || partner.partner_tier === selectedTier;
      const matchesCountry = !selectedCountry || partner.country === selectedCountry;

      return matchesSearch && matchesTier && matchesCountry;
    });

    setFilteredPartners(filtered);
  }, [partners, searchTerm, selectedTier, selectedCountry]);

  // ⚡ OPTIMISÉ: Mémoriser les tiers pour éviter recréation
  const partnerTiers = useMemo(() => [
    { value: '', label: t('pages.partners.filter_tier') },
    { value: 'museum', label: t('pages.partners.tier_museum') + ' ($20k)' },
    { value: 'silver', label: t('pages.partners.tier_silver') + ' ($48k)' },
    { value: 'gold', label: t('pages.partners.tier_gold') + ' ($68k)' },
    { value: 'platinium', label: t('pages.partners.tier_platinium') + ' ($98k)' }
  ], [t]);

  // ⚡ OPTIMISÉ: Mémoriser les pays
  const countries = useMemo(() => {
    const partnerCountries = [...new Set(partners.map(p => p.country).filter(Boolean))];
    const allCountryNames = COUNTRIES.map(c => c.name);
    return [...new Set([...allCountryNames, ...partnerCountries])].sort();
  }, [partners]);

  // ⚡ OPTIMISÉ: useCallback pour les handlers
  const handleViewDetails = useCallback((partnerId: string) => {
    navigate(`/partners/${partnerId}`);
  }, [navigate]);

  const getCategoryLabel = useCallback((category: string) => {
    const labels: Record<string, string> = {
      'industry': t('pages.partners.category_industry'),
      'service': t('pages.partners.category_service'),
      'technology': t('pages.partners.category_technology'),
      'education': t('pages.partners.category_education')
    };
    return labels[category] || category;
  }, [t]);

  const getCategoryColor = useCallback((category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      'industry': 'error',
      'service': 'info',
      'technology': 'success',
      'education': 'warning'
    };
    return colors[category] || 'default';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('pages.partners.title')}
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('pages.partners.description')}
              </p>
            </motion.div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('pages.partners.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
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

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau partenaire
                  </label>
                  <select
                    value={selectedTier}
                    onChange={(e) => setSelectedTier(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {partnerTiers.map((tier) => (
                      <option key={tier.value} value={tier.value}>
                        {tier.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les pays</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats - Niveaux Partenaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🏛️</div>
              <div className="text-2xl font-bold text-gray-900">{partnerStats.museum}</div>
              <div className="text-sm text-gray-600">Museum</div>
              <div className="text-xs text-gray-500">$20k</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="text-2xl font-bold text-gray-900">{partnerStats.silver}</div>
              <div className="text-sm text-gray-600">Silver</div>
              <div className="text-xs text-gray-500">$48k</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🥇</div>
              <div className="text-2xl font-bold text-gray-900">{partnerStats.gold}</div>
              <div className="text-sm text-gray-600">Gold</div>
              <div className="text-xs text-gray-500">$68k</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">💎</div>
              <div className="text-2xl font-bold text-gray-900">{partnerStats.platinium}</div>
              <div className="text-sm text-gray-600">Platinium</div>
              <div className="text-xs text-gray-500">$98k</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Handshake className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{partnerStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </Card>
        </div>

        {/* Partners List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('pages.partners.no_results')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('pages.partners.try_modify')}
            </p>
            <Button variant="default" onClick={() => {
              setSearchTerm('');
              setSelectedTier('');
              setSelectedCountry('');
            }}>
              {t('pages.partners.reset_filters')}
            </Button>
          </div>
        ) : (
          // ⚡ OPTIMISÉ: Utilisation du composant PartnerCard mémorisé
          <div className={viewMode === CONFIG.viewModes.grid
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {filteredPartners.map((partner, index) => (
              <PartnerCard
                key={partner.id}
                partner={partner}
                viewMode={viewMode}
                index={index}
                onViewDetails={handleViewDetails}
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

