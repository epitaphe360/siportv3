import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../lib/routes';
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
  Handshake,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import LogoWithFallback from '../components/ui/LogoWithFallback';
import { motion } from 'framer-motion';
import { CONFIG } from '../lib/config';
import { SupabaseService } from '../services/supabaseService';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'planned';
  startDate: Date;
  endDate?: Date;
  budget: string;
  impact: string;
  image: string;
  technologies: string[];
  team: string[];
  kpis: {
    progress: number;
    satisfaction: number;
    roi: number;
  };
  timeline: Array<{
    phase: string;
    date: Date;
    status: 'completed' | 'current' | 'upcoming';
    description: string;
  }>;
  partners: string[];
  documents: Array<{
    name: string;
    type: string;
    url: string;
  }>;
  gallery: string[];
}

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
  projects: Project[];
}

// Les données du partenaire sont maintenant chargées depuis Supabase

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof typeof CONFIG.tabIds>(CONFIG.tabIds.overview);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPartner = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await SupabaseService.getPartnerById(id);
        if (data) {
          setPartner(data);
        } else {
          setError("Partenaire non trouvé");
        }
      } catch (err) {
        console.error("Erreur chargement partenaire:", err);
        setError("Erreur lors du chargement du partenaire");
      } finally {
        setIsLoading(false);
      }
    };

    loadPartner();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Chargement du partenaire...
          </h3>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Partenaire non trouvé
          </h3>
          <p className="text-gray-600 mb-6">
            {error || "Le partenaire que vous recherchez n'existe pas ou a été supprimé."}
          </p>
          <Link to={ROUTES.PARTNERS}>
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux partenaires
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const TypeIcon = getTypeIcon(partner.type);

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

  const handleViewProjectDetails = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'active': return 'En cours';
      case 'planned': return 'Planifié';
      default: return status;
    }
  };

  const handleContact = () => {
    // Ouvrir un modal de contact ou rediriger vers la page de contact
    setShowContactModal(true);
  };

  const handleShare = () => {
    const shareData = {
      title: partner.name,
      text: `Découvrez ${partner.name} - ${partner.description}`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      // Fallback: copier le lien dans le presse-papiers
      navigator.clipboard.writeText(shareData.url)
        .then(() => toast.success('Lien copié dans le presse-papiers !'))
        .catch(() => toast.error('Impossible de copier le lien'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link to={ROUTES.PARTNERS}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux partenaires
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-6"
          >
            <LogoWithFallback
              src={partner.logo}
              alt={partner.name}
              className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200"
            />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {partner.name}
                </h1>
                {partner.verified && (
                  <CheckCircle className="h-6 w-6 text-blue-500" />
                )}
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(partner.type)}`}>
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {partner.category}
                </div>
                <Badge variant="info" size="sm">
                  {partner.sector}
                </Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.country}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 max-w-3xl">
                {partner.description}
              </p>
              
              <div className="flex items-center space-x-4">
                {partner.website && (
                  <a
                    href={partner.website}
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
              { id: 'projects', label: 'Projets', icon: Target },
              { id: 'impact', label: 'Impact & ROI', icon: TrendingUp },
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
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {partner.establishedYear ? Math.max(0, new Date().getFullYear() - partner.establishedYear) : 0}+
                </div>
                <div className="text-sm text-gray-600">Années d'expérience</div>
              </Card>

              <Card className="text-center p-6">
                <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {partner.employees}
                </div>
                <div className="text-sm text-gray-600">Employés</div>
              </Card>

              <Card className="text-center p-6">
                <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {partner.projects.length}
                </div>
                <div className="text-sm text-gray-600">Projets actifs</div>
              </Card>

              <Card className="text-center p-6">
                <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  285%
                </div>
                <div className="text-sm text-gray-600">ROI Partenariat</div>
              </Card>
            </div>

            {/* Contributions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Contributions au Salon SIPORTS 2026
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {partner.contributions.map((contribution, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Handshake className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{contribution}</span>
                    </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {partner.projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <img
                      src={project.image}
                      alt={project.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(project.name)}`;
                      }}
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(project.status)} size="sm">
                          {getStatusLabel(project.status)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDate(project.startDate)}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {project.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {project.kpis.progress}%
                          </div>
                          <div className="text-xs text-gray-600">Avancement</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {project.kpis.satisfaction}%
                          </div>
                          <div className="text-xs text-gray-600">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {project.kpis.roi}%
                          </div>
                          <div className="text-xs text-gray-600">ROI</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="default"
                        className="w-full"
                        onClick={() => handleViewProjectDetails(project)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir les détails
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Impact du Partenariat SIPORTS 2026
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-2">285%</div>
                    <div className="text-sm text-green-700">ROI Global</div>
                  </div>
                  
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-2">3.2M€</div>
                    <div className="text-sm text-blue-700">Valeur Générée</div>
                  </div>
                  
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
                    <div className="text-sm text-purple-700">Satisfaction</div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === CONFIG.tabIds.contact && (
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
                      <span className="text-gray-700">{partner.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">{partner.country}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">+44 20 7123 4567</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-700">contact@{partner?.name?.toLowerCase().replace(/\s+/g, '') || 'contact'}.com</span>
                    </div>
                    
                    {partner.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <a href={partner.website} className="text-blue-600 hover:text-blue-700">
                          {partner.website}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Contact SIPORTS</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Ahmed El Mansouri</p>
                            <p className="text-sm text-gray-600">Directeur Partenariats</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p> ahmed.mansouri@portcasablanca.ma</p>
                          <p> </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modal Détails Projet */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <p className="text-blue-100">{partner.name}</p>
                </div>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                <Badge className={getStatusColor(selectedProject.status)} size="sm">
                  {getStatusLabel(selectedProject.status)}
                </Badge>
                <span className="text-blue-100 text-sm">
                  Budget: {selectedProject.budget}
                </span>
                <span className="text-blue-100 text-sm">
                  Impact: {selectedProject.impact}
                </span>
              </div>
            </div>

            {/* Contenu Modal */}
            <div className="p-6">
              {/* Image Principale */}
              <div className="mb-6">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.name}
                  className="w-full h-64 object-cover rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = `https://placehold.co/800x400/e2e8f0/64748b?text=${encodeURIComponent(selectedProject.name)}`;
                  }}
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description du Projet
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {selectedProject.description}
                </p>
              </div>

              {/* Détails Techniques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Détails Techniques</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <Badge className={getStatusColor(selectedProject.status)} size="sm">
                        {getStatusLabel(selectedProject.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Début:</span>
                      <span className="font-medium">{formatDate(selectedProject.startDate)}</span>
                    </div>
                    {selectedProject.endDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fin prévue:</span>
                        <span className="font-medium">{formatDate(selectedProject.endDate)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-bold text-green-600">{selectedProject.budget}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Équipe:</span>
                      <span className="font-medium">
                        {selectedProject.status === 'completed' ? '45 experts' : 
                         selectedProject.status === 'active' ? '32 experts' : '15 experts'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">KPIs du Projet</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Avancement</span>
                        <span className="font-medium">{selectedProject.kpis.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedProject.kpis.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Satisfaction</span>
                        <span className="font-medium">{selectedProject.kpis.satisfaction}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${selectedProject.kpis.satisfaction}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">ROI</span>
                        <span className="font-medium">{selectedProject.kpis.roi}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(selectedProject.kpis.roi, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technologies Utilisées */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Technologies Utilisées</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech: string, index: number) => (
                    <Badge key={index} variant="info" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Chronologie du Projet */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4">Chronologie du Projet</h4>
                <div className="space-y-4">
                  {selectedProject.timeline.map((phase: Project['timeline'][0], index: number) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-4 h-4 rounded-full mt-1 ${
                        phase.status === 'completed' ? 'bg-green-500' :
                        phase.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-gray-900">{phase.phase}</h5>
                          <span className="text-sm text-gray-500">{formatDate(phase.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partenaires du Projet */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Partenaires du Projet</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.partners.map((partnerName: string, index: number) => (
                    <Badge key={index} variant="success" size="sm">
                      <Handshake className="h-3 w-3 mr-1" />
                      {partnerName}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Documents et Ressources */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Documents & Ressources</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {selectedProject.documents.map((doc: Project['documents'][0], index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type}</p>
                      </div>
                      <Download className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Galerie Photos */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Galerie du Projet</h4>
                <div className="grid grid-cols-3 gap-3">
                  {selectedProject.gallery.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Projet ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform"                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://placehold.co/400x300/e2e8f0/64748b?text=Photo+${index + 1}`;
                      }}                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button variant="default" className="flex-1" onClick={handleContact}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contacter l'Équipe Projet
                </Button>
                <Button variant="default" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Partager
                </Button>
                <Button variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Rapport Complet
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Contact */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contacter {partner.name}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre nom
                  </label>
                  <input type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom complet"
                   aria-label="Votre nom complet" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="votre@email.com"
                   aria-label="votre@email.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet
                  </label>
                  <input type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Objet de votre message"
                   aria-label="Objet de votre message" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre message..."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowContactModal(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={() => {
                      toast.success('Message envoyé avec succès !');
                      setShowContactModal(false);
                    }}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

