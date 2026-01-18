import React, { memo, useCallback } from 'react';
import { Star, Building2, MapPin, Users, ExternalLink, Award, Handshake } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LevelBadge } from '../common/QuotaWidget';
import { motion } from 'framer-motion';
import OptimizedImage from '../ui/OptimizedImage';
import type { PartnerTier } from '../../config/partnerTiers';

interface PartnerCardProps {
  partner: {
    id: string;
    name: string;
    partner_tier: PartnerTier;
    category: string;
    description: string;
    logo: string;
    website?: string;
    country: string;
    sector: string;
    verified: boolean;
    featured: boolean;
    contributions?: string[];
    establishedYear?: number;
    employees?: string;
  };
  viewMode?: 'grid' | 'list';
  index?: number;
  onViewDetails: (id: string) => void;
  getCategoryLabel: (category: string) => string;
  getCategoryColor: (category: string) => 'default' | 'success' | 'warning' | 'error' | 'info';
  t: (key: string) => string;
}

/**
 * ⚡ OPTIMISÉ: PartnerCard mémorisé pour éviter les re-renders inutiles
 *
 * Pattern identique à ExhibitorCard pour cohérence
 */
const PartnerCard: React.FC<PartnerCardProps> = memo(({
  partner,
  viewMode = 'grid',
  index = 0,
  onViewDetails,
  getCategoryLabel,
  getCategoryColor,
  t
}) => {
  const handleViewDetails = useCallback(() => {
    onViewDetails(partner.id);
  }, [onViewDetails, partner.id]);

  const handleWebsiteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card hover className="flex items-center p-6">
          <div className="flex items-center space-x-4 flex-grow">
            <OptimizedImage
              src={partner.logo}
              alt={partner.name}
              className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              fallback="/partner-placeholder.svg"
            />

            <div className="flex-grow min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {partner.name}
                </h3>
                {partner.featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                )}
                {partner.verified && (
                  <Award className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                {partner.sector && <span>{partner.sector}</span>}
                {partner.country && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {partner.country}
                  </span>
                )}
                {partner.establishedYear && (
                  <span className="flex items-center">
                    <Building2 className="h-3 w-3 mr-1" />
                    Depuis {partner.establishedYear}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={getCategoryColor(partner.category)}
                  size="sm"
                >
                  {getCategoryLabel(partner.category)}
                </Badge>
                <LevelBadge
                  level={partner.partner_tier}
                  type="partner"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('actions.view_details')}
            </Button>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWebsiteClick}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Handshake className="h-4 w-4 mr-2" />
                Site web
              </a>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card hover className="h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <OptimizedImage
                src={partner.logo}
                alt={partner.name}
                className="h-12 w-12 rounded-lg object-cover"
                fallback="/partner-placeholder.svg"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {partner.name}
                </h3>
                {partner.sector && (
                  <p className="text-sm text-gray-500 truncate">{partner.sector}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {partner.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {partner.verified && (
                <Award className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </div>

          {/* Category & Tier Badges */}
          <div className="mb-4 flex items-center space-x-2">
            <Badge
              variant={getCategoryColor(partner.category)}
              size="sm"
            >
              {getCategoryLabel(partner.category)}
            </Badge>
            <LevelBadge
              level={partner.partner_tier}
              type="partner"
              size="sm"
            />
          </div>

          {/* Description */}
          {partner.description && (
            <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
              {partner.description}
            </p>
          )}

          {/* Info */}
          <div className="space-y-2 mb-6">
            {partner.country && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                {partner.country}
              </div>
            )}
            {partner.establishedYear && (
              <div className="flex items-center text-sm text-gray-500">
                <Building2 className="h-4 w-4 mr-2" />
                Établi en {partner.establishedYear}
              </div>
            )}
            {partner.employees && (
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2" />
                {partner.employees} employés
              </div>
            )}
          </div>

          {/* Contributions */}
          {partner.contributions && partner.contributions.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-1">
                {partner.contributions.slice(0, 3).map((contribution, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {contribution}
                  </span>
                ))}
                {partner.contributions.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{partner.contributions.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col space-y-2 mt-auto">
            <Button
              variant="default"
              size="sm"
              onClick={handleViewDetails}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('actions.view_details')}
            </Button>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWebsiteClick}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 w-full"
              >
                <Handshake className="h-4 w-4 mr-2" />
                Site web
              </a>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // ⚡ Comparaison custom optimisée
  return (
    prevProps.partner.id === nextProps.partner.id &&
    prevProps.partner.name === nextProps.partner.name &&
    prevProps.partner.featured === nextProps.partner.featured &&
    prevProps.partner.verified === nextProps.partner.verified &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.index === nextProps.index
  );
});

PartnerCard.displayName = 'PartnerCard';

export default PartnerCard;
