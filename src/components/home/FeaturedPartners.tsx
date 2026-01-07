import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { CheckCircle, Eye, ArrowRight, Award, Handshake } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { SupabaseService } from '../../services/supabaseService';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { translateSector } from '../../utils/sectorTranslations';
import { MoroccanPattern } from '../ui/MoroccanDecor';

export const FeaturedPartners: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPartners = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getPartners();
        // Filter for featured partners and take the first 3, or show all if none are featured
        const featured = data.filter(p => p.featured).slice(0, 3);
        setPartners(featured.length > 0 ? featured : data.slice(0, 3));
      } catch (error) {
        console.error('Erreur lors du chargement des partenaires:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPartners();
  }, []);

  const getTierLabel = (tier: string) => {
    const labels = {
      'museum': 'Museum',
      'silver': 'Silver',
      'gold': 'Gold',
      'platinium': 'Platinium'
    };
    return labels[tier as keyof typeof labels] || tier;
  };

  const getTierColor = (tier: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors = {
      'museum': 'default' as const,
      'silver': 'info' as const,
      'gold': 'warning' as const,
      'platinium': 'error' as const
    };
    return colors[tier as keyof typeof colors] || 'default';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Partenaires à la Une
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="bg-gray-50 rounded-lg p-6 h-80">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) return null;

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <MoroccanPattern className="opacity-[0.03] text-siports-primary" scale={1.5} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-siports-primary mb-4">
              {t('home.featured_partners_title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.featured_partners_desc')}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full border-blue-100">
                <div className="flex flex-col h-full p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="h-14 w-14 rounded-xl object-cover border-2 border-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const initial = partner.name ? partner.name.charAt(0) : 'P';
                          target.onerror = null;
                          target.src = `https://placehold.co/56x56/3b82f6/ffffff?text=${encodeURIComponent(initial)}`;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">{translateSector(partner.sector, t)}</p>
                      </div>
                    </div>
                    {partner.verified && (
                      <Badge variant="success" size="sm" className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {t('home.verified')}
                      </Badge>
                    )}
                  </div>

                  {/* Tier */}
                  <div className="mb-4">
                    <Badge variant={getTierColor(partner.partner_tier)} className="uppercase tracking-wider font-bold">
                      <Award className="h-3 w-3 mr-1" />
                      {getTierLabel(partner.partner_tier)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow">
                    {partner.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center space-x-4 mb-6 text-sm text-gray-500 border-t border-gray-50 pt-4">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1 text-gray-400" />
                      <span>0 vues</span>
                    </div>
                    <div className="flex items-center">
                      <Handshake className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{partner.contributions?.length || 0} avantages</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`${ROUTES.PARTNERS}/${partner.id}`)}
                    >
                      Voir le Profil
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`${ROUTES.CONTACT}?subject=Partenariat with ${partner.name}`)}
                    >
                      Contacter
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to={ROUTES.PARTNERS}>
            <Button variant="outline" size="lg" className="group">
              {t('home.discover_all')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
