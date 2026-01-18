import React, { memo } from 'react';
import { Star, Verified, MapPin, Users, ExternalLink, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import LogoWithFallback from '../ui/LogoWithFallback';
import { LevelBadge } from '../common/QuotaWidget';
import { getExhibitorLevelByArea } from '../../config/exhibitorQuotas';
import { motion } from 'framer-motion';

interface ExhibitorCardProps {
  exhibitor: {
    id: string;
    companyName: string;
    sector?: string;
    category: string;
    description?: string;
    logo?: string;
    country?: string;
    standArea?: number;
    featured?: boolean;
    verified?: boolean;
    minisiteUrl?: string;
    websiteUrl?: string;
  };
  viewMode?: 'grid' | 'list';
  index?: number;
  onViewDetails: (id: string) => void;
  onScheduleAppointment: (id: string) => void;
  getCategoryLabel: (category: string) => string;
  getCategoryColor: (category: string) => 'default' | 'success' | 'warning' | 'error' | 'info';
  t: (key: string) => string;
}

/**
 * ⚡ OPTIMISÉ: ExhibitorCard mémorisé pour éviter les re-renders inutiles
 *
 * Ce composant est mémorisé avec React.memo pour éviter de re-render
 * quand ses props ne changent pas. Cela améliore considérablement
 * les performances sur les listes d'exposants.
 */
const ExhibitorCard: React.FC<ExhibitorCardProps> = memo(({
  exhibitor,
  viewMode = 'grid',
  index = 0,
  onViewDetails,
  onScheduleAppointment,
  getCategoryLabel,
  getCategoryColor,
  t
}) => {
  const handleViewDetails = React.useCallback(() => {
    onViewDetails(exhibitor.id);
  }, [onViewDetails, exhibitor.id]);

  const handleScheduleAppointment = React.useCallback(() => {
    onScheduleAppointment(exhibitor.id);
  }, [onScheduleAppointment, exhibitor.id]);

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card hover className="flex items-center p-6">
          <div className="flex items-center space-x-4 flex-grow">
            <LogoWithFallback
              src={exhibitor.logo}
              alt={exhibitor.companyName}
              className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
            />

            <div className="flex-grow min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {exhibitor.companyName}
                </h3>
                {exhibitor.featured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                )}
                {exhibitor.verified && (
                  <Verified className="h-4 w-4 text-blue-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                {exhibitor.sector && <span>{exhibitor.sector}</span>}
                {exhibitor.country && (
                  <span className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {exhibitor.country}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Badge
                  variant={getCategoryColor(exhibitor.category)}
                  size="sm"
                >
                  {getCategoryLabel(exhibitor.category)}
                </Badge>
                {exhibitor.standArea && (
                  <LevelBadge
                    level={getExhibitorLevelByArea(exhibitor.standArea)}
                    type="exhibitor"
                    size="sm"
                  />
                )}
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
            <Button
              variant="default"
              size="sm"
              onClick={handleScheduleAppointment}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('actions.schedule_meeting')}
            </Button>
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
              <LogoWithFallback
                src={exhibitor.logo}
                alt={exhibitor.companyName}
                className="h-12 w-12 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {exhibitor.companyName}
                </h3>
                {exhibitor.sector && (
                  <p className="text-sm text-gray-500 truncate">{exhibitor.sector}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {exhibitor.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
              {exhibitor.verified && (
                <Verified className="h-4 w-4 text-blue-500" />
              )}
            </div>
          </div>

          {/* Category & Level Badges */}
          <div className="mb-4 flex items-center space-x-2">
            <Badge
              variant={getCategoryColor(exhibitor.category)}
              size="sm"
            >
              {getCategoryLabel(exhibitor.category)}
            </Badge>
            {exhibitor.standArea && (
              <LevelBadge
                level={getExhibitorLevelByArea(exhibitor.standArea)}
                type="exhibitor"
                size="sm"
              />
            )}
          </div>

          {/* Description */}
          {exhibitor.description && (
            <p className="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">
              {exhibitor.description}
            </p>
          )}

          {/* Location */}
          {exhibitor.country && (
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <MapPin className="h-4 w-4 mr-2" />
              {exhibitor.country}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleScheduleAppointment}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {t('actions.schedule_meeting')}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // ⚡ Comparaison custom pour optimiser encore plus
  // Ne re-render que si les props pertinentes changent
  return (
    prevProps.exhibitor.id === nextProps.exhibitor.id &&
    prevProps.exhibitor.companyName === nextProps.exhibitor.companyName &&
    prevProps.exhibitor.featured === nextProps.exhibitor.featured &&
    prevProps.exhibitor.verified === nextProps.exhibitor.verified &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.index === nextProps.index
  );
});

ExhibitorCard.displayName = 'ExhibitorCard';

export default ExhibitorCard;
