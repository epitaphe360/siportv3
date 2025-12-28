import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { 
  Share2,
  MessageCircle,
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
  Calendar,
  CheckCircle2,
  Sparkles,
  Building2,
  ExternalLink,
  Eye,
  Package
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { motion, useScroll, useTransform } from 'framer-motion';
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

// Image avec fallback
const SafeImage = ({ src, alt, className, fallback }: { src?: string; alt: string; className?: string; fallback?: React.ReactNode }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return fallback || <div className={className}><Building2 className="w-full h-full p-4 text-gray-300" /></div>;
  }
  
  return <img src={src} alt={alt} className={className} onError={() => setError(true)} />;
};

export default function MiniSitePreviewSimple() {
  const { exhibitorId } = useParams<{ exhibitorId: string }>();
  const navigate = useNavigate();
  
  const [miniSiteData, setMiniSiteData] = useState<MiniSiteData | null>(null);
  const [exhibitorData, setExhibitorData] = useState<ExhibitorData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    if (!exhibitorId) {
      setError('ID exposant manquant');
      setIsLoading(false);
      return;
    }
    loadData();
  }, [exhibitorId]);

  const loadData = async () => {
    if (!exhibitorId) return;
    setIsLoading(true);
    try {
      const [miniSite, exhibitor, prods] = await Promise.all([
        SupabaseService.getMiniSite(exhibitorId),
        SupabaseService.getExhibitorForMiniSite(exhibitorId),
        SupabaseService.getExhibitorProducts(exhibitorId)
      ]);

      console.log('[MiniSite] Data:', { miniSite, exhibitor, products: prods });

      if (!miniSite) {
        setError('Mini-site non trouvé');
        return;
      }

      setMiniSiteData(miniSite);
      setExhibitorData(exhibitor);
      setProducts(prods || []);
      
      await SupabaseService.incrementMiniSiteViews(exhibitorId);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading
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

  // Error - Mini-site non trouvé
  if (error || !miniSiteData || !exhibitorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-lg w-full p-8 text-center shadow-xl border-0">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Mini-site non disponible</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error === 'Mini-site non trouvé' || !miniSiteData
              ? "Cet exposant n'a pas encore créé son mini-site vitrine. Revenez bientôt pour découvrir leur présentation complète !"
              : error || "Ce mini-site n'existe pas ou n'est plus disponible."}
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(ROUTES.EXHIBITORS)} variant="outline" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voir tous les exposants
            </Button>
            <Button onClick={() => navigate(ROUTES.HOME)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Découvrir SIPORTS 2026
            </Button>
          </div>
          
          {/* Message informatif pour exposants */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-blue-600">Vous êtes exposant ?</span>
              <br />
              Créez votre mini-site vitrine depuis votre tableau de bord pour présenter votre entreprise aux visiteurs.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Theme avec valeurs par défaut
  const theme = {
    primaryColor: miniSiteData.theme?.primaryColor || '#1a365d',
    secondaryColor: miniSiteData.theme?.secondaryColor || '#2b6cb0',
    accentColor: miniSiteData.theme?.accentColor || '#4299e1',
    fontFamily: miniSiteData.theme?.fontFamily || 'Inter'
  };

  // Extraire les sections
  const heroSection = miniSiteData.sections?.find(s => s.type === 'hero');
  const aboutSection = miniSiteData.sections?.find(s => s.type === 'about');
  
  // Features/Values
  const features = aboutSection?.content?.features || aboutSection?.content?.values || [];
  
  // Contact info
  const contactInfo = exhibitorData.contact_info || {};
  const socialLinks = contactInfo.social || {};

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: theme.fontFamily }}>
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HEADER FLOTTANT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-6xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.EXHIBITORS)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            
            <div className="flex items-center gap-3">
              <SafeImage 
                src={exhibitorData.logo_url} 
                alt={exhibitorData.company_name}
                className="h-8 w-8 rounded-lg object-contain bg-gray-100"
                fallback={<div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center"><Building2 className="h-5 w-5 text-gray-400" /></div>}
              />
              <span className="font-semibold hidden md:inline">{exhibitorData.company_name}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 hidden sm:flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {miniSiteData.views}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => toast.success('Lien copié !'))
                    .catch(() => toast.error('Impossible de copier'));
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION HERO */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          {heroSection?.content?.backgroundImage ? (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroSection.content.backgroundImage})` }}
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
            />
          )}
        </motion.div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white pt-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <SafeImage 
              src={exhibitorData.logo_url}
              alt={exhibitorData.company_name}
              className="h-24 w-24 mx-auto rounded-2xl bg-white p-3 shadow-2xl object-contain"
              fallback={
                <div className="h-24 w-24 mx-auto rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
              }
            />
          </motion.div>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Badge className="mb-6 px-4 py-2 bg-white/20 text-white border-white/30">
              <Sparkles className="h-4 w-4 mr-2 inline" />
              SIPORTS 2026 - Exposant Officiel
            </Badge>
          </motion.div>

          {/* Titre */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            {heroSection?.content?.title || exhibitorData.company_name}
          </motion.h1>

          {/* Sous-titre */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto"
          >
            {heroSection?.content?.subtitle || heroSection?.content?.description || exhibitorData.description || 'Solutions innovantes pour l\'industrie maritime'}
          </motion.p>

          {/* Boutons */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              size="lg"
              className="text-lg px-8 py-6 rounded-xl"
              style={{ backgroundColor: theme.accentColor }}
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {heroSection?.content?.ctaText || 'Découvrir nos solutions'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-xl bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Nous contacter
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 cursor-pointer"
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="h-8 w-8" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION À PROPOS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <Building2 className="h-4 w-4" />
              À propos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: theme.primaryColor }}>
              {aboutSection?.content?.title || 'Notre expertise'}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {aboutSection?.content?.description || aboutSection?.content?.text || exhibitorData.description || 'Nous sommes fiers de présenter nos solutions innovantes à SIPORTS 2026.'}
            </p>
          </div>

          {/* Features/Values - TOUJOURS AFFICHÉES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.length > 0 ? (
              features.map((feature: string) => (
                <Card key={feature} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${theme.accentColor}15` }}
                  >
                    <CheckCircle2 className="h-7 w-7" style={{ color: theme.accentColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature}</h3>
                </Card>
              ))
            ) : (
              // Valeurs par défaut si aucune feature
              ['Innovation', 'Expertise', 'Qualité', 'Support'].map((feature) => (
                <Card key={feature} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${theme.accentColor}15` }}
                  >
                    <CheckCircle2 className="h-7 w-7" style={{ color: theme.accentColor }} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{feature}</h3>
                </Card>
              ))
            )}
          </div>

          {/* Image About */}
          {(aboutSection?.content?.image || aboutSection?.content?.images?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aboutSection?.content?.image && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={aboutSection.content.image} 
                    alt="À propos"
                    className="w-full h-64 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              {aboutSection?.content?.images?.map((img: string) => (
                <div key={`img-${img.slice(-20)}`} className="rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={img} 
                    alt="Image galerie"
                    className="w-full h-64 object-cover"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          {aboutSection?.content?.stats?.length > 0 && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl" style={{ backgroundColor: `${theme.primaryColor}08` }}>
              {aboutSection.content.stats.map((stat: any) => (
                <div key={`stat-${stat.label || stat.number}`} className="text-center">
                  <div className="text-4xl font-bold mb-1" style={{ color: theme.primaryColor }}>
                    {stat.number}
                  </div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION PRODUITS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">
              <Package className="h-4 w-4" />
              Nos solutions
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: theme.primaryColor }}>
              Produits & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez notre gamme de solutions innovantes
            </p>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Image */}
                  <div className="h-48 bg-gray-100">
                    <SafeImage 
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      fallback={
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}20, ${theme.secondaryColor}20)` }}>
                          <Package className="h-16 w-16" style={{ color: theme.primaryColor }} />
                        </div>
                      }
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {product.category && (
                      <Badge className="mb-3" style={{ backgroundColor: theme.accentColor, color: 'white' }}>
                        {product.category}
                      </Badge>
                    )}
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                    
                    {/* Features */}
                    {product.features?.length > 0 && (
                      <ul className="space-y-1 mb-4">
                        {product.features.slice(0, 3).map((f: string) => (
                          <li key={f} className="flex items-center text-sm text-gray-600">
                            <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: theme.accentColor }} />
                            <span className="line-clamp-1">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="font-bold text-lg" style={{ color: theme.primaryColor }}>
                        {product.price || 'Sur devis'}
                      </span>
                      <Button size="sm" variant="outline">En savoir +</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Aucun produit n'a encore été ajouté</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SECTION CONTACT */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
              <MessageCircle className="h-4 w-4" />
              Contact
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: theme.primaryColor }}>
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Notre équipe est à votre disposition
            </p>
          </div>

          {/* Contact Cards - TOUJOURS AU MOINS LES ÉLÉMENTS DE BASE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Email */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.accentColor}15` }}>
                <Mail className="h-7 w-7" style={{ color: theme.accentColor }} />
              </div>
              <h3 className="font-semibold mb-2">Email</h3>
              {contactInfo.email ? (
                <a href={`mailto:${contactInfo.email}`} className="text-sm text-gray-600 hover:text-blue-600 break-all">
                  {contactInfo.email}
                </a>
              ) : (
                <span className="text-sm text-gray-400">Non renseigné</span>
              )}
            </Card>

            {/* Téléphone */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.secondaryColor}15` }}>
                <Phone className="h-7 w-7" style={{ color: theme.secondaryColor }} />
              </div>
              <h3 className="font-semibold mb-2">Téléphone</h3>
              {contactInfo.phone ? (
                <a href={`tel:${contactInfo.phone}`} className="text-sm text-gray-600 hover:text-blue-600">
                  {contactInfo.phone}
                </a>
              ) : (
                <span className="text-sm text-gray-400">Non renseigné</span>
              )}
            </Card>

            {/* Site Web */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.primaryColor}15` }}>
                <Globe className="h-7 w-7" style={{ color: theme.primaryColor }} />
              </div>
              <h3 className="font-semibold mb-2">Site Web</h3>
              {exhibitorData.website ? (
                <a href={exhibitorData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1">
                  Visiter <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-sm text-gray-400">Non renseigné</span>
              )}
            </Card>

            {/* Adresse */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 bg-red-50">
                <MapPin className="h-7 w-7 text-red-500" />
              </div>
              <h3 className="font-semibold mb-2">Adresse</h3>
              {contactInfo.address ? (
                <span className="text-sm text-gray-600">{contactInfo.address}</span>
              ) : (
                <span className="text-sm text-gray-400">Non renseignée</span>
              )}
            </Card>
          </div>

          {/* Social Links */}
          {Object.values(socialLinks).some(Boolean) && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">Suivez-nous</p>
              <div className="flex justify-center gap-4">
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#0077B5' }}>
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#1877F2' }}>
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#1DA1F2' }}>
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {socialLinks.youtube && (
                  <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#FF0000' }}>
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="py-12" style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            {/* Logo & Name */}
            <div className="flex items-center gap-4">
              <SafeImage 
                src={exhibitorData.logo_url}
                alt={exhibitorData.company_name}
                className="h-12 w-12 rounded-xl bg-white p-2 object-contain"
                fallback={<div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center"><Building2 className="h-6 w-6 text-white/60" /></div>}
              />
              <div className="text-white">
                <h3 className="font-bold text-lg">{exhibitorData.company_name}</h3>
                <p className="text-white/70 text-sm">Exposant SIPORTS 2026</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{miniSiteData.views} vues</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(miniSiteData.last_updated).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center text-white/60 text-sm">
            <p>© {new Date().getFullYear()} {exhibitorData.company_name}. Tous droits réservés.</p>
            <p className="mt-2">
              Propulsé par <Link to={ROUTES.HOME} className="text-white hover:underline">SIPORTS Platform</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
