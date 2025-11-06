import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Grid2x2 as Grid, List, MapPin, Users, ExternalLink, Star, EggFried as Verified, Award, Building2, Crown, Handshake } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';

interface Partner {
  id: string;
  name: string;
  type: 'platinum' | 'gold' | 'silver' | 'bronze' | 'institutional';
  category: string;
  description: string;
  logo: string;
  website?: string;
  country: string;
  sector: string;
  verified: boolean;
  featured: boolean;
  sponsorshipLevel: string;
  contributions: string[];
  establishedYear: number;
  employees: string;
}

// Les partenaires sont maintenant chargés depuis Supabase

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [viewMode, setViewMode] = useState<keyof typeof CONFIG.viewModes>(CONFIG.viewModes.grid);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerStats, setPartnerStats] = useState({
    organisateur: 0,
    platine: 0,
    or: 0,
    argent: 0,
    bronze: 0,
    total: 0
  });

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getPartners();
        setPartners(data);
        setFilteredPartners(data);

        // Calculer les statistiques par niveau
        const stats = {
          organisateur: data.filter(p => p.sponsorshipLevel?.toLowerCase() === 'organisateur').length,
          platine: data.filter(p => p.sponsorshipLevel?.toLowerCase() === 'platine').length,
          or: data.filter(p => p.sponsorshipLevel?.toLowerCase() === 'or').length,
          argent: data.filter(p => p.sponsorshipLevel?.toLowerCase() === 'argent').length,
          bronze: data.filter(p => p.sponsorshipLevel?.toLowerCase() === 'bronze').length,
          total: data.length
        };
        setPartnerStats(stats);
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error);
        setPartners([]);
// TODO: Charger depuis Supabase avec SupabaseService.getPartners()
        setFilteredPartners([]);
        // Statistiques par défaut basées sur []
        setPartnerStats({
          organisateur: 1,
          platine: 1,
          or: 2,
          argent: 1,
          bronze: 1,
          total: 6
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPartners();
  }, []);

  useEffect(() => {
    const filtered = partners.filter(partner => {
      const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           partner.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || partner.type === selectedType;
      const matchesCountry = !selectedCountry || partner.country === selectedCountry;
      
      return matchesSearch && matchesType && matchesCountry;
    });

    setFilteredPartners(filtered);
  }, [partners, searchTerm, selectedType, selectedCountry]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'institutional': return Crown;
      case 'platinum': return Award;
      case 'gold': return Star;
      case 'silver': return Building2;
      case 'bronze': return Handshake;
      default: return Building2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'institutional': return 'bg-purple-100 text-purple-600';
      case 'platinum': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-600';
      case 'silver': return 'bg-gray-100 text-gray-600';
      case 'bronze': return 'bg-orange-100 text-orange-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'institutional': return 'Institutionnel';
      case 'platinum': return 'Platine';
      case 'gold': return 'Or';
      case 'silver': return 'Argent';
      case 'bronze': return 'Bronze';
      default: return type;
    }
  };

  const partnerTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'institutional', label: 'Institutionnel' },
    { value: 'platinum', label: 'Platine' },
    { value: 'gold', label: 'Or' },
    { value: 'silver', label: 'Argent' },
    { value: 'bronze', label: 'Bronze' }
  ];

  const countries = [...new Set(partners.map(p => p.country))];

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
                Nos Partenaires SIPORTS 2026
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Découvrez les organisations qui soutiennent et participent au développement 
                du plus grand salon portuaire international
              </p>
            </motion.div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text"
                placeholder="Rechercher un partenaire..."
                value={searchTerm}
                onChange={(e) =
                      aria-label="Rechercher un partenaire..."> setSearchTerm(e.target.value)}
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
                    Type de partenaire
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {partnerTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
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
        {/* Stats - Données dynamiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <div className="p-6 text-center">
              <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{partnerStats.organisateur}</div>
              <div className="text-sm text-gray-600">Organisateur</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Award className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{partnerStats.platine}</div>
              <div className="text-sm text-gray-600">Platine</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{partnerStats.or}</div>
              <div className="text-sm text-gray-600">Or</div>
            </div>
          </Card>

          <Card>
            <div className="p-6 text-center">
              <Building2 className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{partnerStats.argent}</div>
              <div className="text-sm text-gray-600">Argent</div>
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
              Aucun partenaire trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              Essayez de modifier vos critères de recherche
            </p>
            <Button variant="default" onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedCountry('');
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className={viewMode === CONFIG.viewModes.grid 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-6'
          }>
            {filteredPartners.map((partner, index) => {
              const TypeIcon = getTypeIcon(partner.type);
              
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
                            <img
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

                        {/* Type Badge */}
                        <div className="mb-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(partner.type)}`}>
                            <TypeIcon className="h-4 w-4 mr-2" />
                            {getTypeLabel(partner.type)}
                          </div>
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
                        <img
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
                              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(partner.type)}`}>
                                <TypeIcon className="h-3 w-3 mr-1" />
                                {getTypeLabel(partner.type)}
                              </div>
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
                                <Button variant="outline" size="sm" onClick={() => window.location.href = `/partners/${partner.id}`}>
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