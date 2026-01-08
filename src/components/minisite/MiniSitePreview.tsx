import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { 
  Download,
  Share2,
  MessageCircle,
  Award,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  AlertCircle,
  Loader2,
  ChevronDown,
  Star,
  Users,
  Calendar,
  CheckCircle2,
  Sparkles,
  Building2,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNewsStore } from '../../store/newsStore';
import { SupabaseService } from '../../services/supabaseService';
import { toast } from 'sonner';

interface MiniSiteData {
  id: string;
  exhibitor_id: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  sections: any[];
  published: boolean;
  views: number;
  last_updated: string;
}

interface ExhibitorData {
  id: string;
  company_name: string;
  logo_url?: string;
  description?: string;
  website?: string;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
    social?: {
      linkedin?: string;
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
  };
}

// Image component with fallback for error handling
const ImageWithFallback = ({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackIcon
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const FallbackIcon = fallbackIcon || AlertCircle;

  if (!src || error) {
    return (
      <div className={fallbackClassName || className}>
        <FallbackIcon className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className={fallbackClassName || className}>
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : ''}`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
      />
    </>
  );
};

interface FeatureCardProps {
  feature: string;
  index: number;
  theme: any;
}

const FeatureCard = ({ feature, index, theme }: FeatureCardProps) => {
  const featureIcons = [Sparkles, Star, Award, CheckCircle2];
  const FeatureIcon = featureIcons[index % featureIcons.length];
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Descriptions génériques basées sur les domaines courants
  const getFeatureDescription = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('transformation') || lowerTitle.includes('digital')) {
      return "Accompagnement complet dans la digitalisation de vos processus et infrastructures pour optimiser votre compétitivité.";
    }
    if (lowerTitle.includes('cyber') || lowerTitle.includes('sécurité')) {
      return "Protection avancée de vos systèmes et données contre les menaces cybernétiques avec des solutions de pointe.";
    }
    if (lowerTitle.includes('big data') || lowerTitle.includes('analytics')) {
      return "Exploitation intelligente de vos données massives pour des décisions stratégiques éclairées et prédictives.";
    }
    if (lowerTitle.includes('intelligence') || lowerTitle.includes('ia') || lowerTitle.includes('ai')) {
      return "Intégration d'algorithmes d'apprentissage automatique pour automatiser et optimiser vos opérations.";
    }
    if (lowerTitle.includes('cloud')) {
      return "Infrastructure cloud évolutive et sécurisée pour une flexibilité maximale et une réduction des coûts.";
    }
    if (lowerTitle.includes('blockchain')) {
      return "Technologie blockchain pour une traçabilité transparente et des transactions sécurisées et décentralisées.";
    }
    return "Solution complète et personnalisée adaptée à vos besoins spécifiques et enjeux métiers.";
  };

  return (
    <motion.div
      key={feature}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -12, scale: 1.03 }}
      viewport={{ once: true }}
    >
      <Card 
        className="p-8 h-full bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-blue-200 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Gradient overlay on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor}05, ${theme.accentColor}05)` }}
        />
        
        <div className="relative z-10">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
            }}
          >
            <FeatureIcon className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-xl mb-2 group-hover:text-blue-600 transition-colors">{feature}</h3>
          {isExpanded && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">{getFeatureDescription(feature)}</p>
          )}
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 transform origin-left transition-all duration-300 group-hover:w-full"></div>
        </div>
      </Card>
    </motion.div>
  );
};

interface MiniSitePreviewProps {
  exhibitorId?: string;
}

export default function MiniSitePreview({ exhibitorId: propExhibitorId }: MiniSitePreviewProps) {
  const { exhibitorId: urlExhibitorId } = useParams<{ exhibitorId: string }>();
  const exhibitorId = propExhibitorId || urlExhibitorId;
  const navigate = useNavigate();
  const { articles, fetchNews } = useNewsStore();
  const [miniSiteData, setMiniSiteData] = useState<MiniSiteData | null>(null);
  const [exhibitorData, setExhibitorData] = useState<ExhibitorData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (!exhibitorId) {
      setError('ID d\'exposant manquant');
      setIsLoading(false);
      return;
    }

    loadMiniSiteData();
  }, [exhibitorId]);

  const loadMiniSiteData = async () => {
    if (!exhibitorId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Charger le mini-site
      const miniSite = await SupabaseService.getMiniSite(exhibitorId);
      console.log('[MiniSite] Données mini-site chargées:', miniSite);
      
      if (!miniSite) {
        setError('Ce mini-site n\'existe pas ou n\'est pas encore publié.');
        setIsLoading(false);
        return;
      }

      setMiniSiteData(miniSite);

      // Charger les informations de l'exposant
      const exhibitor = await SupabaseService.getExhibitorForMiniSite(exhibitorId);
      console.log('[MiniSite] Données exposant chargées:', exhibitor);
      
      if (exhibitor) {
        setExhibitorData(exhibitor);
      }

      // Charger les produits
      const exhibitorProducts = await SupabaseService.getExhibitorProducts(exhibitorId);
      console.log('[MiniSite] Produits chargés:', exhibitorProducts);
      setProducts(exhibitorProducts);

      // Incrémenter le compteur de vues
      await SupabaseService.incrementMiniSiteViews(exhibitorId);

    } catch (err: unknown) {
      console.error('Erreur lors du chargement du mini-site:', err);
      setError('Erreur lors du chargement du mini-site.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get the latest news articles
  const latestNews = articles.slice(0, 6);
  const innovations = articles
    .filter(article => article.category === 'Innovation')
    .slice(0, 6);

  // Parallax effect for hero (hooks must be called unconditionally)
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Helper function to get section data
  const getSection = (sectionName: string) => {
    if (!miniSiteData?.sections) return null;
    return miniSiteData.sections.find((s: any) => s.type === sectionName);
  };

  const heroSection = getSection('hero');
  const aboutSection = getSection('about');
  const contactSection = getSection('contact');
  
  // Fallback: Si pas de sections, créer des sections par défaut avec les données de l'exposant
  const hasConfiguredSections = miniSiteData?.sections && miniSiteData.sections.length > 0;

  // Loading state - Premium loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-blue-200"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chargement de l'expérience</h2>
          <p className="text-gray-500">Préparation du mini-site...</p>
        </motion.div>
      </div>
    );
  }

  // Error state - Beautiful error page
  if (error || !miniSiteData || !exhibitorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
              </Button>
              <Button variant="outline" onClick={() => navigate(ROUTES.HOME)} className="rounded-xl">
                Retour à l'accueil
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  const theme = miniSiteData.theme || {
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    accentColor: '#60a5fa',
    fontFamily: 'Inter'
  };

  const socialLinks = exhibitorData.contact_info?.social || {};
