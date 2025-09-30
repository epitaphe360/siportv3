import { useState, useEffect } from 'react';
import { 
  Award, 
  Users, 
  Calendar, 
  TrendingUp,
  Star,
  Handshake,
  Globe,
  Target,
  BarChart3,
  Crown,
  Zap
} from 'lucide-react';
import { useAppointmentStore } from '../../store/appointmentStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useDashboardStore } from '../../store/dashboardStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard as Edit } from 'lucide-react';

export default function PartnerDashboard() {
  // Auth doit être déclaré en premier
  const { user } = useAuthStore();
  const { dashboard, isLoading, fetchDashboard } = useDashboardStore();

  // Appointment management logic
  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = useAppointmentStore();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filtrer les rendez-vous reçus (où le partenaire est le user connecté)
  const receivedAppointments = appointments.filter(a => user && a.exhibitorId === user.id);
  const pendingAppointments = receivedAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter(a => a.status === 'confirmed');

  const handleAccept = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed');
    fetchAppointments();
  };
  const handleReject = async (appointmentId: string) => {
    await cancelAppointment(appointmentId);
    fetchAppointments();
  };
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Removed unused formatDate, getActivityIcon, getActivityColor

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600">
            Impossible de charger le tableau de bord partenaire
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Partenaire */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-600 p-3 rounded-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de Bord Partenaire
                </h1>
                <p className="text-gray-600">
                  Bienvenue {user?.profile.firstName}, suivez votre impact SIPORTS 2026
                </p>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-600" />
                <span className="text-purple-800 font-medium">Espace Partenaire</span>
                <Badge className="bg-purple-100 text-purple-800" size="sm">
                  Partenaire Officiel
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards Partenaire */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visibilité Partenaire</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboard.stats.profileViews?.toLocaleString() || '3,247'}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+22% cette semaine</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Connexions Établies</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {dashboard.stats.connections}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Handshake className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+15% ce mois</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Événements Sponsorisés</p>
                    <p className="text-3xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="text-sm text-gray-600">2 cette semaine</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ROI Partenariat</p>
                    <p className="text-3xl font-bold text-gray-900">285%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <Badge variant="success" size="sm">Excellent</Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Actions Rapides Partenaire */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Gestion de votre Partenariat
                </h3>
                
                <div className="space-y-4">
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-3" />
                      Modifier mon Profil Partenaire
                    </Button>
                  </Link>
                  
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Edit className="h-4 w-4 mr-3" />
                      Modifier mon Contenu
                    </Button>
                  </Link>
                  
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-3" />
                      Événements Sponsorisés
                    </Button>
                  </Link>
                  
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-3" />
                      Networking Privilégié
                    </Button>
                  </Link>
                  
                  <Link to="/partners" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-3" />
                      ROI & Analytics
                    </Button>
                  </Link>
                  
                  <Link to="/networking" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-3" />
                      Réseautage VIP Exclusif
                    </Button>
                  </Link>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowLeadsModal(true)}
                  >
                    <Target className="h-4 w-4 mr-3" />
                    Leads & Prospects
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowMediaModal(true)}
                  >
                    <Globe className="h-4 w-4 mr-3" />
                    Médias & Communication
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowEventsModal(true)}
                  >
                    <Calendar className="h-4 w-4 mr-3" />
                    Mes Événements Sponsorisés
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Impact de votre Partenariat
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mentions dans les médias</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowMediaModal(true)}
                    >
                      <span className="font-semibold text-purple-600">12</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Portée sociale</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowMediaModal(true)}
                    >
                      <span className="font-semibold text-blue-600">45,000</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Leads qualifiés</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowLeadsModal(true)}
                    >
                      <span className="font-semibold text-green-600">89</span>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Satisfaction partenariat</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowSatisfactionModal(true)}
                      >
                        <span className="font-semibold text-gray-900">4.9/5</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      className="w-full"
                      onClick={() => setShowLeadsModal(true)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Rapport ROI Complet
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bloc Rendez-vous reçus/confirmés pour Partenaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Rendez-vous reçus
              </h3>
              {isAppointmentsLoading ? (
                <div className="text-center py-6 text-gray-500">Chargement...</div>
              ) : (
                <>
                  {pendingAppointments.length === 0 && (
                    <div className="text-center text-gray-500 py-4">Aucune demande en attente</div>
                  )}
                  {pendingAppointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">Demande de {app.visitorId}</div>
                        <div className="text-xs text-gray-600">{app.message}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => handleAccept(app.id)}>Accepter</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>Refuser</Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Rendez-vous confirmés</h4>
              {confirmedAppointments.length === 0 ? (
                <div className="text-center text-gray-500 py-2">Aucun rendez-vous confirmé</div>
              ) : (
                confirmedAppointments.map(app => (
                  <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">Avec {app.visitorId}</div>
                      <div className="text-xs text-gray-600">{app.message}</div>
                    </div>
                    <Badge variant="success">Confirmé</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recommandations IA pour Partenaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Recommandations IA pour Maximiser votre Partenariat
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">
                    🎯 Opportunités de Networking
                  </h4>
                  <p className="text-sm text-purple-700">
                    15 prospects VIP identifiés pour des partenariats stratégiques
                  </p>
                </div>
                
                <div className="p-4 bg-white rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-900 mb-2">
                    📈 Optimisation ROI
                  </h4>
                  <p className="text-sm text-purple-700">
                    Sponsoriser 2 conférences supplémentaires pourrait augmenter votre ROI de 35%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Modales */}
      {/* Leads Modal */}
      {showLeadsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Leads & Prospects</h3>
                    <p className="text-gray-600">Gestion de vos prospects qualifiés</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowLeadsModal(false)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">89</div>
                  <div className="text-sm text-green-700">Leads qualifiés</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">2.5M€</div>
                  <div className="text-sm text-blue-700">Valeur estimée</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12%</div>
                  <div className="text-sm text-purple-700">Taux conversion</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Prospects récents</h4>
                {[
                  { name: 'Port Maritime de Marseille', sector: 'Logistique', score: 9.2, value: '850K€', status: 'Hot' },
                  { name: 'TechNav Solutions', sector: 'Technologie', score: 8.8, value: '620K€', status: 'Warm' },
                  { name: 'Ocean Freight Corp', sector: 'Transport', score: 8.5, value: '450K€', status: 'Warm' },
                  { name: 'Maritime Data Systems', sector: 'Data', score: 9.0, value: '780K€', status: 'Hot' },
                  { name: 'Port Authority Lyon', sector: 'Infrastructure', score: 7.8, value: '320K€', status: 'Cold' }
                ].map((lead, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{lead.name}</h5>
                        <p className="text-sm text-gray-600">{lead.sector}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{lead.value}</div>
                        <Badge variant={lead.status === 'Hot' ? 'error' : lead.status === 'Warm' ? 'warning' : 'info'} size="sm">
                          {lead.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Score: {lead.score}/10</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setShowLeadsModal(true)}>Contacter</Button>
                        <Button size="sm" onClick={() => setShowLeadsModal(true)}>Voir profil</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Médias & Communication</h3>
                    <p className="text-gray-600">Suivi de votre présence médiatique</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowMediaModal(false)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-purple-700">Mentions médias</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">45,000</div>
                  <div className="text-sm text-blue-700">Impressions sociales</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <div className="text-sm text-green-700">Taux engagement</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Mentions dans les médias</h4>
                  <div className="space-y-3">
                    {[
                      { media: 'Le Monde Économie', type: 'Article', date: '2025-09-08', title: 'SIPORTS 2026 : L\'innovation au service des ports européens' },
                      { media: 'France 3 Régions', type: 'Reportage TV', date: '2025-09-07', title: 'Focus sur les technologies portuaires du futur' },
                      { media: 'Maritime News', type: 'Interview', date: '2025-09-06', title: 'Entretien avec notre partenaire technologique' },
                      { media: 'Port Economics Journal', type: 'Étude', date: '2025-09-05', title: 'Impact des partenariats sur l\'efficacité portuaire' },
                      { media: 'Radio Maritime', type: 'Podcast', date: '2025-09-04', title: 'Les défis de la digitalisation portuaire' }
                    ].map((mention, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{mention.media}</h5>
                            <p className="text-sm text-gray-600">{mention.title}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="info" size="sm">{mention.type}</Badge>
                            <div className="text-sm text-gray-500 mt-1">{mention.date}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Réseaux sociaux</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">LinkedIn</span>
                        <span className="text-sm text-blue-600">15,200 vues</span>
                      </div>
                      <div className="text-xs text-blue-700">2,340 likes • 890 partages</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Twitter/X</span>
                        <span className="text-sm text-blue-600">12,500 vues</span>
                      </div>
                      <div className="text-xs text-blue-700">1,850 likes • 456 retweets</div>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Instagram</span>
                        <span className="text-sm text-pink-600">9,800 vues</span>
                      </div>
                      <div className="text-xs text-pink-700">3,200 likes • 234 commentaires</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">YouTube</span>
                        <span className="text-sm text-red-600">7,500 vues</span>
                      </div>
                      <div className="text-xs text-red-700">890 likes • 156 commentaires</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Events Modal */}
      {showEventsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Événements Sponsorisés</h3>
                    <p className="text-gray-600">Gestion de vos événements partenaires</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowEventsModal(false)}>
                  ✕
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-blue-700">Événements actifs</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2,500</div>
                  <div className="text-sm text-green-700">Participants touchés</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">98%</div>
                  <div className="text-sm text-purple-700">Satisfaction</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Événements sponsorisés</h4>
                {[
                  { name: 'Conférence Innovation Portuaire', date: '2025-09-15', participants: 450, status: 'À venir', type: 'Conférence' },
                  { name: 'Workshop Digitalisation', date: '2025-09-12', participants: 120, status: 'En cours', type: 'Atelier' },
                  { name: 'Table Ronde Cybersécurité', date: '2025-09-10', participants: 85, status: 'Terminé', type: 'Table ronde' },
                  { name: 'Networking VIP', date: '2025-09-08', participants: 65, status: 'Terminé', type: 'Networking' },
                  { name: 'Démonstration Technologique', date: '2025-09-05', participants: 180, status: 'Terminé', type: 'Démonstration' },
                  { name: 'Keynote IA & Ports', date: '2025-09-03', participants: 320, status: 'Terminé', type: 'Conférence' },
                  { name: 'Session Startups', date: '2025-09-01', participants: 95, status: 'Terminé', type: 'Pitch' },
                  { name: 'Cocktail Partenaires', date: '2025-08-30', participants: 150, status: 'Terminé', type: 'Networking' }
                ].map((event, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{event.name}</h5>
                        <p className="text-sm text-gray-600">{event.type} • {event.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{event.participants} participants</div>
                        <Badge variant={
                          event.status === 'À venir' ? 'info' : 
                          event.status === 'En cours' ? 'warning' : 'success'
                        } size="sm">
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-600">Impact: {Math.round(event.participants * 2.5)}€ valeur estimée</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setShowEventsModal(true)}>Rapport</Button>
                        <Button size="sm" onClick={() => setShowEventsModal(true)}>Détails</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Satisfaction Modal */}
      {showSatisfactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full mx-4"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Satisfaction Partenariat</h3>
                    <p className="text-gray-600">Évaluation détaillée de votre expérience</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowSatisfactionModal(false)}>
                  ✕
                </Button>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-yellow-500 mb-2">4.9/5</div>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600">Basé sur 127 évaluations</p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Répartition des notes</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = rating === 5 ? 98 : rating === 4 ? 22 : rating === 3 ? 5 : rating === 2 ? 2 : 0;
                      const percentage = (count / 127) * 100;
                      return (
                        <div key={rating} className="flex items-center space-x-3">
                          <span className="text-sm w-8">{rating}★</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Commentaires récents</h4>
                  <div className="space-y-3">
                    {[
                      { author: 'Directeur Commercial', rating: 5, comment: 'Partenaire exceptionnel, résultats au-delà de nos attentes.' },
                      { author: 'Responsable Marketing', rating: 5, comment: 'Excellente visibilité et retours sur investissement.' },
                      { author: 'CEO', rating: 4, comment: 'Très satisfaisant, quelques améliorations possibles sur la communication.' },
                      { author: 'Directeur Technique', rating: 5, comment: 'Support technique réactif et professionnel.' }
                    ].map((review, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{review.author}</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">🎉 Félicitations !</h4>
                  <p className="text-sm text-green-700">
                    Votre score de satisfaction est excellent ! 98% de vos évaluations sont 4★ ou 5★.
                    Continuez ainsi pour maintenir cette excellence.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};