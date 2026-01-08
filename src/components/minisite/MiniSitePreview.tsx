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
  Loader2
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion } from 'framer-motion';
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
      
      if (!miniSite) {
        setError('Ce mini-site n\'existe pas ou n\'est pas encore publié.');
        setIsLoading(false);
        return;
      }

      setMiniSiteData(miniSite);

      // Charger les informations de l'exposant
      const exhibitor = await SupabaseService.getExhibitorForMiniSite(exhibitorId);
      
      if (exhibitor) {
        setExhibitorData(exhibitor);
      }

      // Charger les produits
      const exhibitorProducts = await SupabaseService.getExhibitorProducts(exhibitorId);
      setProducts(exhibitorProducts);

      // Incrémenter le compteur de vues
      await SupabaseService.incrementMiniSiteViews(exhibitorId);

    } catch (err: any) {
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

  // Helper function to get section data
  const getSection = (sectionName: string) => {
    if (!miniSiteData?.sections) return null;
    return miniSiteData.sections.find((s: any) => s.type === sectionName);
  };

  const heroSection = getSection('hero');
  const aboutSection = getSection('about');
  const contactSection = getSection('contact');

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du mini-site...</p>
        </div>
      </div>
    );
  }

  // Error state - Beautiful error page
  if (error || !miniSiteData || !exhibitorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-8 text-center shadow-xl">
            <div className="w-20 h-20 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Oops! Une erreur s'est produite
            </h2>
            <p className="text-gray-600 mb-8">
              {error || "Impossible de charger le mini-site. Veuillez réessayer plus tard."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.reload()} className="rounded-xl">
                Réessayer
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

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: theme.fontFamily }}>
      {/* Header with back button */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(ROUTES.EXHIBITORS)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux exposants
            </Button>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Lien copié dans le presse-papiers');
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      {heroSection && (
        <section
          className="relative h-[500px] flex items-center justify-center text-white"
          style={{
            backgroundImage: heroSection.data?.backgroundImage
              ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroSection.data.backgroundImage})`
              : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="max-w-4xl mx-auto px-4 text-center">
            {exhibitorData.logo_url && (
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                src={exhibitorData.logo_url}
                alt={exhibitorData.company_name}
                className="h-24 w-auto mx-auto mb-6 rounded-lg shadow-lg bg-white p-4"
              />
            )}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-5xl md:text-6xl font-bold mb-4"
            >
              {heroSection.data?.title || exhibitorData.company_name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-xl md:text-2xl mb-8"
            >
              {heroSection.data?.subtitle || exhibitorData.description}
            </motion.p>
            {heroSection.data?.ctaText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <Button
                  size="lg"
                  style={{ backgroundColor: theme.accentColor }}
                  onClick={() => {
                    const element = document.querySelector(heroSection.data.ctaLink || '#products');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {heroSection.data.ctaText}
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      {aboutSection && (
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-center mb-4" style={{ color: theme.primaryColor }}>
                {aboutSection.data?.title || 'À propos'}
              </h2>
              <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
                {aboutSection.data?.description || exhibitorData.description}
              </p>

              {/* Features */}
              {aboutSection.data?.features && aboutSection.data.features.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {aboutSection.data.features.map((feature: string, index: number) => (
                    <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                      <Award className="h-8 w-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                      <h3 className="font-semibold text-gray-900">{feature}</h3>
                    </Card>
                  ))}
                </div>
              )}

              {/* Stats */}
              {aboutSection.data?.stats && aboutSection.data.stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {aboutSection.data.stats.map((stat: any, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl font-bold mb-2" style={{ color: theme.primaryColor }}>
                        {stat.number}
                      </div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Products Section */}
      {products.length > 0 && (
        <section id="products" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-center mb-4" style={{ color: theme.primaryColor }}>
                Nos Produits & Services
              </h2>
              <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
                Découvrez notre gamme de solutions innovantes
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                          {product.category && (
                            <Badge style={{ backgroundColor: theme.accentColor, color: 'white' }}>
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-4 flex-1">{product.description}</p>
                        {product.features && product.features.length > 0 && (
                          <ul className="space-y-2 mb-4">
                            {product.features.slice(0, 3).map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <Award className="h-4 w-4 mr-2" style={{ color: theme.accentColor }} />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        )}
                        {product.price && (
                          <div className="text-lg font-bold mt-auto" style={{ color: theme.primaryColor }}>
                            {product.price}
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-center mb-4" style={{ color: theme.primaryColor }}>
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
              Nous sommes à votre disposition pour répondre à vos questions
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {exhibitorData.contact_info?.email && (
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <Mail className="h-8 w-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a
                    href={`mailto:${exhibitorData.contact_info.email}`}
                    className="text-gray-600 hover:underline"
                  >
                    {exhibitorData.contact_info.email}
                  </a>
                </Card>
              )}

              {exhibitorData.contact_info?.phone && (
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <Phone className="h-8 w-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                  <a
                    href={`tel:${exhibitorData.contact_info.phone}`}
                    className="text-gray-600 hover:underline"
                  >
                    {exhibitorData.contact_info.phone}
                  </a>
                </Card>
              )}

              {exhibitorData.website && (
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <Globe className="h-8 w-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Site Web</h3>
                  <a
                    href={exhibitorData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:underline"
                  >
                    Visiter le site
                  </a>
                </Card>
              )}

              {exhibitorData.contact_info?.address && (
                <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                  <MapPin className="h-8 w-8 mx-auto mb-3" style={{ color: theme.accentColor }} />
                  <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
                  <p className="text-gray-600">{exhibitorData.contact_info.address}</p>
                </Card>
              )}
            </div>

            {/* Social Media Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="mt-12 flex justify-center gap-4">
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: theme.primaryColor }}
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: theme.primaryColor }}
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: theme.primaryColor }}
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: theme.primaryColor }}
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full hover:bg-gray-100 transition-colors"
                    style={{ color: theme.primaryColor }}
                  >
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </section>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {exhibitorData.company_name}. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {miniSiteData.views} vues • Dernière mise à jour : {new Date(miniSiteData.last_updated).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </footer>
    </div>
  );
}
