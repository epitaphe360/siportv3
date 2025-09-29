import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { MapPin, Users, ArrowRight, Calendar, CheckCircle, Eye, MessageCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useExhibitorStore } from '../../store/exhibitorStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';

export const FeaturedExhibitors: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { exhibitors, fetchExhibitors, isLoading } = useExhibitorStore();
  const featuredExhibitors = exhibitors.filter(e => e.featured).slice(0, 4);

  useEffect(() => {
    if (exhibitors.length === 0) {
      fetchExhibitors();
    }
  }, [exhibitors.length, fetchExhibitors]);

  // Fonction pour gérer le clic sur le bouton RDV
  const handleAppointmentClick = (exhibitorId: string) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec redirection vers les RDV
  navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(`${ROUTES.APPOINTMENTS}?exhibitor=${exhibitorId}`)}`);
    } else {
      // Rediriger vers la page de networking avec l'action de connexion
  navigate(`${ROUTES.NETWORKING}?action=connect&exhibitor=${exhibitorId}&source=homepage`);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'institutional': 'Institutionnel',
      'port-industry': 'Industrie Portuaire',
      'port-operations': 'Exploitation & Gestion',
      'academic': 'Académique & Formation'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    const colors = {
      'institutional': 'success' as const,
      'port-industry': 'error' as const,
      'port-operations': 'info' as const,
      'academic': 'warning' as const
    };
    return colors[category as keyof typeof colors] || 'default';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exposants à la Une
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg p-6 h-80">
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

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exposants à la Une
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez les leaders de l'industrie portuaire qui participent au salon SIPORTS 2026
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {featuredExhibitors.map((exhibitor, index) => (
            <motion.div
              key={exhibitor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full">
                <div className="flex flex-col h-full p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={exhibitor.logo}
                        alt={exhibitor.companyName}
                        className="h-14 w-14 rounded-xl object-cover border-2 border-gray-100"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Use placehold.co instead of via.placeholder (more reliable) and fallback to inline SVG if that fails
                          const initial = exhibitor.companyName ? exhibitor.companyName.charAt(0) : 'X';
                          target.onerror = null; // prevent infinite loop
                          target.src = `https://placehold.co/56x56/6366f1/ffffff?text=${encodeURIComponent(initial)}`;
                          // after a short delay, if the image still fails, replace with a data SVG
                          setTimeout(() => {
                            if (!target.complete || target.naturalWidth === 0) {
                              const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='100%' height='100%' fill='#6366f1'/><text x='50%' y='50%' dy='.35em' font-family='Arial, Helvetica, sans-serif' font-size='24' fill='#ffffff' text-anchor='middle'>${initial}</text></svg>`;
                              target.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
                            }
                          }, 300);
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {exhibitor.companyName}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">{exhibitor.sector}</p>
                      </div>
                    </div>
                    {exhibitor.verified && (
                      <Badge variant="success" size="sm" className="flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Vérifié
                      </Badge>
                    )}
                  </div>

                  {/* Category */}
                  <div className="mb-4">
                    <Badge 
                      variant={getCategoryColor(exhibitor.category)}
                      size="sm"
                      className="font-medium"
                    >
                      {getCategoryLabel(exhibitor.category)}
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {exhibitor.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{exhibitor.miniSite?.views || 0} vues</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <span>{exhibitor.products.length} produits</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Link to={`/exhibitors/${exhibitor.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full justify-center">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir le Profil
                      </Button>
                    </Link>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 justify-center"
                        onClick={() => handleAppointmentClick(exhibitor.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Prendre RDV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const contactData = {
                            company: exhibitor.companyName,
                            sector: exhibitor.sector,
                            products: exhibitor.products.length,
                            contact: 'contact@' + exhibitor.companyName.toLowerCase().replace(/\s+/g, '') + '.com'
                          };
                          
                          toast.success(`💬 Contact : ${contactData.company} — ${contactData.contact}`);
                        }}
                        title="Contacter directement"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/exhibitors">
            <Button size="lg">
              Voir Tous les Exposants
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};