import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Users,
  Calendar,
  MessageCircle,
  Download,
  Share2,
  Star,
  Award,
  Phone,
  Mail,
  Globe,
  Building2,
  Eye,
  Target,
  TrendingUp,
  CheckCircle,
  Crown,
  Package,
  Shield
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { useExhibitorStore } from '../store/exhibitorStore';
import useAuthStore from '../store/authStore';
import { toast } from 'sonner';

export default function ExhibitorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { exhibitors, selectExhibitor, selectedExhibitor } = useExhibitorStore();
  const [activeTab, setActiveTab] = useState<keyof typeof CONFIG.tabIds>(CONFIG.tabIds.overview);

  useEffect(() => {
    if (id) {
      selectExhibitor(id);
    }
  }, [id, selectExhibitor]);

  const exhibitor = selectedExhibitor || exhibitors.find(e => e.id === id);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/appointments?exhibitor=${exhibitor?.id}`);
    } else {
      navigate(`/appointments?exhibitor=${exhibitor?.id}`);
    }
  };

  const handleContact = () => {
    if (exhibitor?.contactInfo?.email) {
      window.open(`mailto:${exhibitor.contactInfo.email}`, '_blank');
    } else {
      toast.error('Adresse email non disponible');
    }
  };

  const handleShare = () => {
    const shareData = {
      title: `Découvrez ${exhibitor?.companyName}`,
      text: exhibitor?.description,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  const handleDownloadBrochure = () => {
    // Simulate brochure download - replace with real download logic
    const brochureUrl = 'https://example.com/brochure.pdf'; // Replace with actual brochure URL from exhibitor data
    const link = document.createElement('a');
    link.href = brochureUrl;
    link.download = `${exhibitor?.companyName}-brochure.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Téléchargement de la brochure démarré');
  };

  if (!exhibitor) {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'institutional': return Crown;
      case 'port-industry': return Building2;
      case 'port-operations': return Target;
      case 'academic': return Award;
      default: return Building2;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'institutional': return 'bg-purple-100 text-purple-600';
      case 'port-industry': return 'bg-blue-100 text-blue-600';
      case 'port-operations': return 'bg-green-100 text-green-600';
      case 'academic': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'institutional': return 'Institutionnel';
      case 'port-industry': return 'Industrie Portuaire';
      case 'port-operations': return 'Exploitation & Gestion';
      case 'academic': return 'Académique & Formation';
      default: return category;
    }
  };

  const CategoryIcon = getCategoryIcon(exhibitor.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link to="/exhibitors">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux exposants
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-6"
          >
            <img
              src={exhibitor.logo || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200'}
              alt={exhibitor.companyName}
              className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200"
            />

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {exhibitor.companyName}
                </h1>
                {exhibitor.verified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
                {exhibitor.featured && (
                  <Star className="h-6 w-6 text-yellow-500 fill-current" />
                )}
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(exhibitor.category)}`}>
                  <CategoryIcon className="h-4 w-4 mr-2" />
                  {getCategoryLabel(exhibitor.category)}
                </div>
                <Badge variant="info" size="sm">
                  {exhibitor.sector}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{exhibitor.contactInfo?.city}, {exhibitor.contactInfo?.country}</span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 max-w-3xl">
                {exhibitor.description}
              </p>

              <div className="flex items-center space-x-4">
                {exhibitor.website && (
                  <a
                    href={exhibitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Site officiel</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <Button variant="default" size="sm" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter
                </Button>

                <Button variant="default" size="sm" onClick={handleAppointmentClick}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Prendre RDV
                </Button>

                <Button variant="default" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Eye },
              { id: 'projects', label: 'Produits', icon: Package },
              { id: 'impact', label: 'À propos', icon: Building2 },
              { id: 'contact', label: 'Contact', icon: MessageCircle }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as keyof typeof CONFIG.tabIds)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === CONFIG.tabIds.overview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="text-center p-6">
                <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {exhibitor.miniSite?.views || 0}
                </div>
                <div className="text-sm text-gray-600">Vues du mini-site</div>
              </Card>

              <Card className="text-center p-6">
                <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {exhibitor.products.length}
                </div>
                <div className="text-sm text-gray-600">Produits</div>
              </Card>

              <Card className="text-center p-6">
                <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {exhibitor.certifications.length}
                </div>
                <div className="text-sm text-gray-600">Certifications</div>
              </Card>

              <Card className="text-center p-6">
                <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <Globe className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {exhibitor.markets.length}
                </div>
                <div className="text-sm text-gray-600">Marchés</div>
              </Card>
            </div>

            {/* Certifications */}
            {exhibitor.certifications.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Certifications & Accréditations
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {exhibitor.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Marchés */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Marchés Ciblés
                </h3>
                <div className="flex flex-wrap gap-2">
                  {exhibitor.markets.map((market, index) => (
                    <Badge key={index} variant="info" size="sm">
                      <Globe className="h-3 w-3 mr-1" />
                      {market}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.projects && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {exhibitor.products.length === 0 ? (
              <Card className="text-center p-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun produit disponible
                </h3>
                <p className="text-gray-600">
                  Cet exposant n'a pas encore ajouté de produits à son catalogue.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exhibitor.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hover className="h-full">
                      {product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="default" size="sm">
                            {product.category}
                          </Badge>
                          {product.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {product.name}
                        </h3>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {product.description}
                        </p>

                        {product.specifications && (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Spécifications</h4>
                            <p className="text-sm text-gray-600">{product.specifications}</p>
                          </div>
                        )}

                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </Button>
                          <Button variant="default" size="sm" onClick={handleDownloadBrochure}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.impact && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  À propos de {exhibitor.companyName}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Secteur d'activité</p>
                        <p className="text-gray-600">{exhibitor.sector}</p>
                      </div>
                    </div>

                    {exhibitor.establishedYear && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Année de création</p>
                          <p className="text-gray-600">{exhibitor.establishedYear}</p>
                        </div>
                      </div>
                    )}

                    {exhibitor.employeeCount && (
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Effectif</p>
                          <p className="text-gray-600">{exhibitor.employeeCount} employés</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">Adresse</p>
                        <p className="text-gray-600">
                          {exhibitor.contactInfo?.address}<br />
                          {exhibitor.contactInfo?.city}, {exhibitor.contactInfo?.country}
                        </p>
                      </div>
                    </div>

                    {exhibitor.revenue && (
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Chiffre d'affaires</p>
                          <p className="text-gray-600">{exhibitor.revenue}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Informations de Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{exhibitor.companyName}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">
                        {exhibitor.contactInfo?.address}<br />
                        {exhibitor.contactInfo?.city}, {exhibitor.contactInfo?.country}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{exhibitor.contactInfo?.phone}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{exhibitor.contactInfo?.email}</span>
                    </div>

                    {exhibitor.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <a aria-label="{exhibitor.website}" href={exhibitor.website} className="text-blue-600 hover:text-blue-700">
                          {exhibitor.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Actions</h4>
                    <div className="space-y-3">
                      <Button variant="default" className="w-full" onClick={handleContact}>
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer un email
                      </Button>

                      <Button variant="default" className="w-full" onClick={handleAppointmentClick}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Prendre rendez-vous
                      </Button>

                      <Button variant="outline" className="w-full" onClick={handleDownloadBrochure}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger la brochure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
