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

export default function MiniSitePreview() {
  const { exhibitorId } = useParams<{ exhibitorId: string }>();
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

  // Helper function to get section data
  const getSection = (sectionName: string) => {
    if (!miniSiteData?.sections) return null;
    return miniSiteData.sections.find((s: any) => s.type === sectionName);
  };

  const heroSection = getSection('hero');
  const aboutSection = getSection('about');
  const contactSection = getSection('contact');

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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement en cours</h3>
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
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="max-w-lg w-full p-8 text-center shadow-xl border-0">
            <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Mini-site introuvable</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error || 'Ce mini-site n\'existe pas ou n\'est pas encore publié. L\'exposant n\'a peut-être pas encore configuré sa page.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate(ROUTES.EXHIBITORS)} className="rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voir tous les exposants
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
        </Card>
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

  // Parallax effect for hero
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: theme.fontFamily }}>
      {/* Floating Header */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20">
            <div className="px-6 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  onClick={() => navigate(ROUTES.EXHIBITORS)}
                  className="flex items-center gap-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Retour aux exposants</span>
                </Button>
                
                <div className="flex items-center gap-2">
                  {exhibitorData.logo_url && (
                    <img 
                      src={exhibitorData.logo_url} 
                      alt={exhibitorData.company_name}
                      className="h-8 w-8 rounded-lg object-contain bg-white shadow-sm"
                    />
                  )}
                  <span className="font-semibold text-gray-900 hidden md:inline">
                    {exhibitorData.company_name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Eye className="h-4 w-4" />
                    <span>{miniSiteData.views} vues</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Lien copié dans le presse-papiers');
                    }}
                    className="rounded-xl"
                  >
                    <Share2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Partager</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hero Section - Immersive */}
      {heroSection && (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Background with parallax */}
          <motion.div 
            style={{ y: heroY }}
            className="absolute inset-0"
          >
            {heroSection.content?.backgroundImage ? (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroSection.content.backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
              </>
            ) : (
              <div 
                className="absolute inset-0"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 50%, ${theme.accentColor} 100%)` 
                }}
              />
            )}
            
            {/* Animated shapes */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -right-1/2 w-full h-full opacity-10"
                style={{ 
                  background: `radial-gradient(circle, ${theme.accentColor} 0%, transparent 70%)` 
                }}
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-1/2 -left-1/2 w-full h-full opacity-10"
                style={{ 
                  background: `radial-gradient(circle, ${theme.secondaryColor} 0%, transparent 70%)` 
                }}
              />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div 
            style={{ opacity: heroOpacity }}
            className="relative z-10 max-w-5xl mx-auto px-4 text-center text-white pt-24"
          >
            {exhibitorData.logo_url && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="mb-8"
              >
                <motion.div 
                  animate={floatingAnimation}
                  className="inline-block"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150" />
                    <img
                      src={exhibitorData.logo_url}
                      alt={exhibitorData.company_name}
                      className="relative h-28 w-auto mx-auto rounded-2xl shadow-2xl bg-white p-4"
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Badge 
                className="mb-6 px-4 py-2 text-sm font-medium backdrop-blur-sm"
                style={{ backgroundColor: `${theme.accentColor}40`, color: 'white', border: `1px solid ${theme.accentColor}60` }}
              >
                <Sparkles className="h-4 w-4 mr-2 inline" />
                SIPORTS 2026 - Exposant Officiel
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
            >
              {heroSection.content?.title || exhibitorData.company_name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed"
            >
              {heroSection.content?.subtitle || exhibitorData.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {heroSection.content?.ctaText && (
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                  style={{ backgroundColor: theme.accentColor }}
                  onClick={() => {
                    const element = document.querySelector(heroSection.content.ctaLink || '#products');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {heroSection.content.ctaText}
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-2xl bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 transition-all"
                onClick={() => {
                  const element = document.querySelector('#contact');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Nous contacter
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/60 flex flex-col items-center cursor-pointer"
              onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="text-sm mb-2">Découvrir</span>
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </section>
      )}

      {/* About Section - Modern Design */}
      {aboutSection && (
        <section id="about" className="py-24 bg-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-5" style={{ background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)` }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 opacity-5" style={{ background: `radial-gradient(circle, ${theme.secondaryColor} 0%, transparent 70%)` }} />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Section Header */}
              <motion.div variants={itemVariants} className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
                  <Building2 className="h-4 w-4" />
                  À propos de nous
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: theme.primaryColor }}>
                  {aboutSection.content?.title || 'Notre Histoire'}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {aboutSection.content?.description || exhibitorData.description}
                </p>
              </motion.div>

              {/* Features Grid - Modern Cards */}
              {aboutSection.content?.features && aboutSection.content.features.length > 0 && (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                  {aboutSection.content.features.map((feature: string, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -8, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Card className="p-6 h-full bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg hover:shadow-xl transition-all group">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: `${theme.accentColor}15` }}
                        >
                          <CheckCircle2 className="h-7 w-7" style={{ color: theme.accentColor }} />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{feature}</h3>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Stats - Impressive Display */}
              {aboutSection.content?.stats && aboutSection.content.stats.length > 0 && (
                <motion.div 
                  variants={itemVariants}
                  className="rounded-3xl p-8 md:p-12"
                  style={{ background: `linear-gradient(135deg, ${theme.primaryColor}08, ${theme.secondaryColor}08)` }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {aboutSection.content.stats.map((stat: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        className="text-center"
                      >
                        <div 
                          className="text-5xl md:text-6xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
                          style={{ backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` }}
                        >
                          {stat.number}
                        </div>
                        <div className="text-gray-600 font-medium">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Products Section - Premium Grid */}
      {products.length > 0 && (
        <section id="products" className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {/* Section Header */}
              <motion.div variants={itemVariants} className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-600 text-sm font-medium mb-4">
                  <Star className="h-4 w-4" />
                  Nos Solutions
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: theme.primaryColor }}>
                  Produits & Services
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Découvrez notre gamme complète de solutions innovantes pour répondre à vos besoins
                </p>
              </motion.div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col bg-white border-0 shadow-lg hover:shadow-2xl transition-all group">
                      {/* Product Image */}
                      <div className="relative overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div 
                            className="w-full h-56 flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)` }}
                          >
                            <Building2 className="h-16 w-16" style={{ color: theme.primaryColor }} />
                          </div>
                        )}
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Category Badge */}
                        {product.category && (
                          <div className="absolute top-4 right-4">
                            <Badge 
                              className="px-3 py-1 text-xs font-semibold shadow-lg"
                              style={{ backgroundColor: theme.accentColor, color: 'white' }}
                            >
                              {product.category}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                          {product.description}
                        </p>

                        {/* Features */}
                        {product.features && product.features.length > 0 && (
                          <ul className="space-y-2 mb-4">
                            {product.features.slice(0, 3).map((feature: string, idx: number) => (
                              <li key={idx} className="flex items-center text-sm text-gray-600">
                                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: theme.accentColor }} />
                                <span className="line-clamp-1">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                          {product.price ? (
                            <div className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
                              {product.price}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Sur devis</span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-xl"
                            onClick={() => document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })}
                          >
                            En savoir plus
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Contact Section - Modern & Interactive */}
      <section id="contact" className="py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${theme.primaryColor}05 0%, ${theme.secondaryColor}10 100%)` 
          }}
        />
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.primaryColor}30, transparent)` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Section Header */}
            <motion.div variants={itemVariants} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-600 text-sm font-medium mb-4">
                <MessageCircle className="h-4 w-4" />
                Restons en contact
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: theme.primaryColor }}>
                Contactez-nous
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Notre équipe est à votre disposition pour répondre à toutes vos questions
              </p>
            </motion.div>

            {/* Contact Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {exhibitorData.contact_info?.email && (
                <motion.a
                  href={`mailto:${exhibitorData.contact_info.email}`}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="block"
                >
                  <Card className="p-6 text-center h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110"
                      style={{ backgroundColor: `${theme.accentColor}15` }}
                    >
                      <Mail className="h-8 w-8" style={{ color: theme.accentColor }} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Email</h3>
                    <p className="text-gray-600 text-sm break-all group-hover:text-blue-600 transition-colors">
                      {exhibitorData.contact_info.email}
                    </p>
                  </Card>
                </motion.a>
              )}

              {exhibitorData.contact_info?.phone && (
                <motion.a
                  href={`tel:${exhibitorData.contact_info.phone}`}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="block"
                >
                  <Card className="p-6 text-center h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110"
                      style={{ backgroundColor: `${theme.secondaryColor}15` }}
                    >
                      <Phone className="h-8 w-8" style={{ color: theme.secondaryColor }} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Téléphone</h3>
                    <p className="text-gray-600 text-sm group-hover:text-blue-600 transition-colors">
                      {exhibitorData.contact_info.phone}
                    </p>
                  </Card>
                </motion.a>
              )}

              {exhibitorData.website && (
                <motion.a
                  href={exhibitorData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="block"
                >
                  <Card className="p-6 text-center h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110"
                      style={{ backgroundColor: `${theme.primaryColor}15` }}
                    >
                      <Globe className="h-8 w-8" style={{ color: theme.primaryColor }} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Site Web</h3>
                    <p className="text-gray-600 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-center gap-1">
                      Visiter
                      <ExternalLink className="h-3 w-3" />
                    </p>
                  </Card>
                </motion.a>
              )}

              {exhibitorData.contact_info?.address && (
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-6 text-center h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all group">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all group-hover:scale-110"
                      style={{ backgroundColor: '#ef444415' }}
                    >
                      <MapPin className="h-8 w-8 text-red-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">Adresse</h3>
                    <p className="text-gray-600 text-sm">{exhibitorData.contact_info.address}</p>
                  </Card>
                </motion.div>
              )}
            </motion.div>

            {/* Social Links - Premium Style */}
            {Object.values(socialLinks).some(link => link) && (
              <motion.div variants={itemVariants} className="text-center">
                <p className="text-gray-500 mb-6 text-sm uppercase tracking-wider font-medium">Suivez-nous</p>
                <div className="flex justify-center gap-4">
                  {socialLinks.linkedin && (
                    <motion.a
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Linkedin"
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: '#0077B5', color: 'white' }}
                    >
                      <Linkedin className="h-6 w-6" />
                    </motion.a>
                  )}
                  {socialLinks.facebook && (
                    <motion.a
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Facebook"
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: '#1877F2', color: 'white' }}
                    >
                      <Facebook className="h-6 w-6" />
                    </motion.a>
                  )}
                  {socialLinks.twitter && (
                    <motion.a
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Twitter"
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: '#1DA1F2', color: 'white' }}
                    >
                      <Twitter className="h-6 w-6" />
                    </motion.a>
                  )}
                  {socialLinks.instagram && (
                    <motion.a
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Instagram"
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: 'white' }}
                    >
                      <Instagram className="h-6 w-6" />
                    </motion.a>
                  )}
                  {socialLinks.youtube && (
                    <motion.a
                      whileHover={{ y: -5, scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Youtube"
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                      style={{ backgroundColor: '#FF0000', color: 'white' }}
                    >
                      <Youtube className="h-6 w-6" />
                    </motion.a>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer - Modern & Elegant */}
      <footer className="relative overflow-hidden">
        <div 
          className="py-16"
          style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/4 w-1/2 h-full rounded-full bg-white/5" />
            <div className="absolute -bottom-1/2 -left-1/4 w-1/2 h-full rounded-full bg-white/5" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Company Info */}
              <div className="flex items-center gap-4">
                {exhibitorData.logo_url && (
                  <img 
                    src={exhibitorData.logo_url} 
                    alt={exhibitorData.company_name}
                    className="h-12 w-12 rounded-xl object-contain bg-white p-2 shadow-lg"
                  />
                )}
                <div className="text-white">
                  <h3 className="font-bold text-xl">{exhibitorData.company_name}</h3>
                  <p className="text-white/70 text-sm">Exposant SIPORTS 2026</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 text-white/80 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{miniSiteData.views} vues</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>Mis à jour le {new Date(miniSiteData.last_updated).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20 text-center text-white/60 text-sm">
              <p>© {new Date().getFullYear()} {exhibitorData.company_name}. Tous droits réservés.</p>
              <p className="mt-2">
                Mini-site propulsé par{' '}
                <Link to={ROUTES.HOME} className="text-white hover:underline font-medium">
                  SIPORTS Platform
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

