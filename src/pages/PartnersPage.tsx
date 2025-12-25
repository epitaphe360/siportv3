import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid2x2 as Grid, List, MapPin, Users, ExternalLink, Star, EggFried as Verified, Award, Building2, Crown, Handshake } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import LogoWithFallback from '../components/ui/LogoWithFallback';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';
import { LevelBadge } from '../components/common/QuotaWidget';
import type { PartnerTier } from '../config/partnerTiers';
import { useTranslation } from '../hooks/useTranslation';

interface Partner {
  id: string;
  name: string;
  partner_tier: PartnerTier; // Nouveau systÃ¨me: museum, silver, gold, platinium
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

// Les partenaires sont maintenant chargÃ©s depuis Supabase

export default function PartnersPage() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>(''); // Nouveau: filtre par tier
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
        // Statistiques par dÃ©faut
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

  const partnerTiers = [
    { value: '', label: t('pages.partners.filter_tier') },
    { value: 'museum', label: t('pages.partners.tier_museum') + ' ($20k)' },
    { value: 'silver', label: t('pages.partners.tier_silver') + ' ($48k)' },
    { value: 'gold', label: t('pages.partners.tier_gold') + ' ($68k)' },
    { value: 'platinium', label: t('pages.partners.tier_platinium') + ' ($98k)' }
  ];

  const countries = [...new Set(partners.map(p => p.country).filter(Boolean))];

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
          <div className={viewMode === CONFIG.viewModes.grid 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {filteredPartners.map((partner, index) => {
              return (
                <motion.div
                  key={partner.id}
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
                            <LogoWithFallback
                              src={partner.logo}
                              alt={partner.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {partner.name}
                              </h3>
                              <p className="text-sm text-gray-500">{partner.sector}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {partner.featured && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                            {partner.verified && (
                              <Verified className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                        </div>

                        {/* Partner Tier Badge */}
                        <div className="mb-4">
                          <LevelBadge
                            level={partner.partner_tier}
                            type="partner"
                            size="md"
                          />
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
                          {partner.description}
                        </p>

                        {/* Contributions */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Contributions :
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {partner.contributions.slice(0, 3).map((contribution, idx) => (
                              <Badge key={idx} variant="info" size="sm">
                                {contribution}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{partner.country}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{partner.employees}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <Link to={`/partners/${partner.id}`}>
                            <Button variant="outline" size="sm" className="flex-1">
                              En savoir plus
                            </Button>
                          </Link>
                          {partner.website && (
                            <a aria-label="Open in new tab"
                              href={partner.website}
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
                        <LogoWithFallback
                          src={partner.logo}
                          alt={partner.name}
                          className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {partner.name}
                              </h3>
                              <p className="text-sm text-gray-500">{partner.sector}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <LevelBadge
                                level={partner.partner_tier}
                                type="partner"
                                size="sm"
                              />
                              {partner.verified && (
                                <Verified className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {partner.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{partner.country}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{partner.employees}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Link to={`/partners/${partner.id}`}>
                                <Button variant="outline" size="sm">
                                  En savoir plus
                                </Button>
                              </Link>
                              {partner.website && (
                                <a aria-label="Open in new tab"
                                  href={partner.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

