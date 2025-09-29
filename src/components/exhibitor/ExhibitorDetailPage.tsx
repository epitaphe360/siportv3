import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  MapPin,
  Calendar,
  MessageCircle,
  Download,
  Share2,
  Star,
  Award,
  Clock,
  Building2,
  Eye,
  Heart,
  Target,
  Zap,
  Mail,
  Phone,
  CheckCircle,
  Send
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useExhibitorStore } from '../../store/exhibitorStore';
import useAuthStore from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNewsStore } from '../../store/newsStore';
import { ROUTES } from '../../lib/routes';

export default function ExhibitorDetailPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const { exhibitors, selectExhibitor, selectedExhibitor, fetchExhibitors } = useExhibitorStore();
  const { articles, fetchNews } = useNewsStore();
  // activeTab temporairement retiré (non utilisé)

  useEffect(() => {
    // Charger les exposants si pas encore chargés
    if (exhibitors.length === 0) {
      fetchExhibitors();
    }
  }, [exhibitors.length, fetchExhibitors]);

  useEffect(() => {
    if (id) {
      selectExhibitor(id);
    }
  }, [id, selectExhibitor, exhibitors]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = (exhibitorId: string) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec redirection vers les RDV
      navigate(`/login?redirect=/appointments?exhibitor=${exhibitorId}`);
    } else {
      // Rediriger vers la page de networking avec l'action de planification
      navigate(`/networking?action=schedule&exhibitor=${exhibitorId}&source=exhibitor-detail`);
    }
  };

  // Afficher loading pendant le chargement
  if (exhibitors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement de l'exposant...
          </h3>
        </div>
      </div>
    );
  }

  // Vérifier si l'exposant existe
  if (!selectedExhibitor && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Exposant non trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            L'exposant avec l'ID "{id}" n'existe pas ou a été supprimé.
          </p>
          <Link to="/exhibitors">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux exposants
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // local non-null alias pour simplifier les accès (après la garde)
  const exhibitor = selectedExhibitor!;

  // Mock data enrichie pour le mini-site avancé
  const miniSiteData = {
    hero: {
      title: exhibitor.companyName,
      subtitle: exhibitor.description,
      description: exhibitor.description + ' Notre \u00e9quipe d\'experts d\u00e9veloppe des solutions innovantes pour optimiser les op\u00e9rations portuaires et am\u00e9liorer l\'efficacit\u00e9 des cha\u00eenes logistiques.',
      backgroundImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      ctaText: 'Découvrir nos solutions',
      stats: [
        { number: '20+', label: 'Années d\'expérience' },
        { number: '150+', label: 'Ports équipés' },
        { number: '40+', label: 'Pays' },
        { number: '500+', label: 'Clients satisfaits' }
      ]
    },
    about: {
      title: 'Notre expertise',
  description: exhibitor.description + ' Notre équipe d\'experts développe des solutions innovantes pour optimiser les opérations portuaires et améliorer l\'efficacité des chaînes logistiques.',
      features: [
        'Solutions innovantes',
        'Expertise reconnue',
        'Support 24/7',
        'Présence internationale'
      ],
      certifications: [
        'ISO 9001:2015',
        'ISO 14001:2015',
        'OHSAS 18001',
        'Port Security Certified'
      ]
    },
    news: [
      {
        id: '1',
        title: 'Nouveau partenariat avec le Port de Rotterdam',
        excerpt: 'Nous sommes fiers d\'annoncer notre nouveau partenariat stratégique pour la digitalisation des opérations portuaires.',
        date: '2024-01-15',
        image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Partenariat'
      },
      {
        id: '2',
        title: 'Lancement de la version 3.0 de SmartPort',
        excerpt: 'La nouvelle version apporte des fonctionnalités révolutionnaires d\'intelligence artificielle et d\'automatisation.',
        date: '2024-01-10',
        image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300',
        category: 'Innovation'
      }
    ],
    gallery: [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    testimonials: [
      {
        name: 'Jean Dupont',
        position: 'Directeur Technique',
        company: 'Port de Marseille',
        comment: 'Une solution exceptionnelle qui a transformé nos opérations portuaires. L\'équipe de Port Solutions Inc. nous a accompagnés avec professionnalisme.',
        avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5
      },
      {
        name: 'Maria Santos',
        position: 'CEO',
        company: 'Barcelona Port Authority',
        comment: 'Innovation remarquable et support technique exceptionnel. Nous recommandons vivement leurs solutions.',
        avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=100',
        rating: 5
      }
    ]
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Sticky */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Bouton de retour */}
            <Link to="/exhibitors">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux exposants
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <img
                src={exhibitor.logo}
                alt={exhibitor.companyName}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="font-bold text-gray-900">{exhibitor.companyName}</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#accueil" className="text-gray-700 hover:text-blue-600 transition-colors">Accueil</a>
              <a href="#apropos" className="text-gray-700 hover:text-blue-600 transition-colors">À propos</a>
              <a href="#produits" className="text-gray-700 hover:text-blue-600 transition-colors">Produits</a>
              <a href="#actualites" className="text-gray-700 hover:text-blue-600 transition-colors">Actualités</a>
              <a href="#galerie" className="text-gray-700 hover:text-blue-600 transition-colors">Galerie</a>
            </div>

            <div className="flex items-center space-x-3">
              <Button size="sm"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="accueil" className="relative h-96 bg-cover bg-center" style={{
        backgroundImage: `url(${miniSiteData.hero.backgroundImage})`
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white max-w-2xl"
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {miniSiteData.hero.title}
            </h1>
            <p className="text-xl mb-8 opacity-90">
              {miniSiteData.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const solutionsSection = document.getElementById('produits');
                  if (solutionsSection) {
                    solutionsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                {miniSiteData.hero.ctaText}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => {
                  const catalogData = {
                    company: exhibitor.companyName,
                    products: exhibitor.products.length || 0,
                    pages: 24,
                    size: '2.4 MB'
                  };

                  // Simulation du téléchargement
                  const link = document.createElement('a');
                  link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvUGFnZQovUGFyZW50IDIgMCBSCi9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCj4+CmVuZG9iago=';
                  link.download = `catalogue-${catalogData.company?.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  toast('📥 Téléchargement démarré...', { icon: '📥' });
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger catalogue
              </Button>
            </div>
            
            {/* Stats Hero */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {miniSiteData.hero.stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3"
                >
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-white text-sm opacity-90">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="apropos" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {miniSiteData.about.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {miniSiteData.about.description}
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {miniSiteData.about.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-lg shadow-sm"
              >
                <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{feature}</h3>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Certifications & Accréditations
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {miniSiteData.about.certifications.map((cert, index) => (
                <Badge key={index} variant="success" className="px-4 py-2">
                  <Award className="h-4 w-4 mr-2" />
                  {cert}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produits" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nos Produits & Services
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez notre gamme complète de solutions portuaires innovantes
            </p>
          </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitor.products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="info" size="sm">
                        {product.category}
                      </Badge>
                      {product.featured && (
                        <Badge variant="warning" size="sm">
                          <Star className="h-3 w-3 mr-1" />
                          Vedette
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {product.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {product.description}
                    </p>
                    
                    {product.specifications && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Spécifications :</h4>
                        <p className="text-sm text-gray-600">{product.specifications}</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <Button size="sm" className="flex-1"
                        onClick={() => {
                          // Rediriger vers la section contact avec le produit sélectionné
                          const contactSection = document.getElementById('contact');
                          if (contactSection) {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                            
                            // Préremplir le formulaire avec les données du produit
                            setTimeout(() => {
                              const subjectField = document.querySelector('select[name="subject"]') as HTMLSelectElement;
                              const messageField = document.querySelector('textarea[name="message"]') as HTMLTextAreaElement;
                              
                              if (subjectField) {
                                subjectField.value = 'quote';
                              }
                              
                              if (messageField) {
                                messageField.value = `Demande de devis pour : ${product.name}\n\nCatégorie : ${product.category}\nSpécifications : ${product.specifications || 'À définir'}\n\nMerci de me faire parvenir un devis détaillé pour ce produit.`;
                              }
                              
                              // Mettre en évidence les champs
                              subjectField?.focus();
                            }, 500);
                          }
                        }}
                      >
                        <Target className="h-4 w-4 mr-2" />
                        Demander un devis
                      </Button>
                      <Button variant="outline" size="sm"
                        onClick={() => {
                          const docData = {
                            product: product.name,
                            type: 'Fiche technique PDF',
                            size: '1.2 MB'
                          };
                          
                          // Simulation téléchargement
                          const link = document.createElement('a');
                          link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEK';
                          link.download = `fiche-${docData.product.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          
                          toast('📄 Téléchargement de la fiche technique en cours...', { icon: '📄' });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleAppointmentClick(exhibitor.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      RDV
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="actualites" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Actualités & Innovations
            </h2>
            <p className="text-lg text-gray-600">
              Restez informé de nos dernières nouvelles et innovations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.slice(0, 6).map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover>
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="success" size="sm">
                        {article.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <Link to={`${ROUTES.NEWS}/${article.id}`}>
                        <Button variant="outline" size="sm">
                          Lire la suite
                        </Button>
                      </Link>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{article.readTime} min de lecture</span>
                        <span className="mx-2">•</span>
                        <span>{article.views} vues</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galerie" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Galerie & Réalisations
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez nos projets et réalisations en images
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {miniSiteData.gallery.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:scale-105 transition-transform shadow-lg"
              >
                <img
                  src={image}
                  alt={`Réalisation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Témoignages Clients
            </h2>
            <p className="text-lg text-gray-600">
              Ce que disent nos partenaires de nos solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {miniSiteData.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">{testimonial.position}</p>
                        <p className="text-sm text-gray-500">{testimonial.company}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-gray-700 italic">
                      "{testimonial.comment}"
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contactez-nous
            </h2>
            <p className="text-lg text-gray-600">
              Prêt à discuter de vos besoins ? Contactez notre équipe pour un devis personnalisé
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Informations de contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">contact@portsolutions.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-gray-600"></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600">123 Port Avenue, Amsterdam, Netherlands</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nos engagements
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Réponse sous 24h ouvrées</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Devis gratuit et personnalisé</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Accompagnement technique complet</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <span className="text-gray-600">Support multilingue</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Demander un devis
                </h3>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="votre.email@entreprise.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Société
                    </label>
                    <input
                      type="text"
                      name="company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de votre société"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objet *
                    </label>
                    <select
                      name="subject"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="quote">Demande de devis</option>
                      <option value="information">Demande d'informations</option>
                      <option value="partnership">Partenariat commercial</option>
                      <option value="support">Support technique</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez votre projet et vos besoins..."
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    onClick={(e) => {
                      e.preventDefault();

                      toast.success(`📧 Message envoyé avec succès ! Nous vous répondrons sous 24h.`);
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer ma demande
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Prêt à transformer vos opérations portuaires ?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez plus de 500 ports dans le monde qui font confiance à nos solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  const demoData = {
                    company: selectedExhibitor?.companyName,
                    products: selectedExhibitor?.products.length || 0,
                    duration: '30 minutes',
                    format: 'Démonstration interactive'
                  };
                  
                  toast.success(`🎯 Démonstration programmée pour ${demoData.company}`);
                }}
              >
                <Target className="h-5 w-5 mr-2" />
                Demander une démonstration
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600"
                onClick={() => {
                  const catalogData = {
                    company: selectedExhibitor?.companyName,
                    products: selectedExhibitor?.products.length || 0,
                    pages: 48,
                    size: '5.2 MB',
                    format: 'PDF Haute Qualité'
                  };
                  
                  // Simulation téléchargement
                  const link = document.createElement('a');
                  link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEK';
                  link.download = `catalogue-complet-${catalogData.company?.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  toast('📦 Téléchargement du catalogue complet démarré', { icon: '📦' });
                }}
              >
                <Download className="h-5 w-5 mr-2" />
                Télécharger notre catalogue
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer Mini-Site */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
        <img
          src={exhibitor.logo}
          alt={exhibitor.companyName}
          className="h-10 w-10 rounded-lg"
        />
        <span className="font-bold text-xl">{exhibitor.companyName}</span>
              </div>
              <p className="text-gray-400 mb-4">
                {exhibitor.description}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="success" size="sm">
                  <Eye className="h-3 w-3 mr-1" />
                  {exhibitor.miniSite?.views || 0} vues
                </Badge>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Liens rapides</h4>
              <ul className="space-y-2">
                <li><a href="#apropos" className="text-gray-400 hover:text-white transition-colors">À propos</a></li>
                <li><a href="#produits" className="text-gray-400 hover:text-white transition-colors">Produits</a></li>
                <li><a href="#actualites" className="text-gray-400 hover:text-white transition-colors">Actualités</a></li>
              </ul>
            </div>

            {/* SIPORTS Info */}
            <div>
              <h4 className="font-semibold text-white mb-4">SIPORTS 2026</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>5-7 Février 2026</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>El Jadida, Maroc</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Stand {exhibitor.id === '1' ? 'A-12' : exhibitor.id === '2' ? 'B-08' : 'C-15'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {exhibitor.companyName}. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500 mt-4 md:mt-0">
              Propulsé par SIPORTS 2026
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="flex flex-col space-y-3">
          <Button 
            variant="outline" 
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            title="Informations de contact"
            onClick={() => {
              const email = exhibitor.contactInfo?.email || 'contact@portsolutions.com';
              window.open(`mailto:${email}?subject=Demande de contact - ${exhibitor.companyName}`, '_blank');
            }}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            title="Prendre rendez-vous"
            onClick={() => handleAppointmentClick(exhibitor.id)}
          >
            <Calendar className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full w-12 h-12 shadow-lg bg-white"
            onClick={() => {
              const favorites = JSON.parse(localStorage.getItem('siports-favorites') || '[]');
              const isFavorite = favorites.includes(exhibitor.id);

              if (isFavorite) {
                const newFavorites = favorites.filter((id: string) => id !== exhibitor.id);
                localStorage.setItem('siports-favorites', JSON.stringify(newFavorites));
                toast.success(`Favoris mis à jour — retiré: ${exhibitor.companyName}`);
              } else {
                favorites.push(exhibitor.id);
                localStorage.setItem('siports-favorites', JSON.stringify(favorites));
                toast.success(`Favoris mis à jour — ajouté: ${exhibitor.companyName}`);
              }
            }}
            title="Ajouter/Retirer des favoris"
          >
            <Heart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};