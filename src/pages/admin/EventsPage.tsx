import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Filter, Users, Clock, MapPin, Video, MoreVertical, CreditCard as Edit, Eye, Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { EventsService, Event } from '../../services/eventsService';

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await EventsService.getAllEvents();

      const formattedEvents = data.map((event: Event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);
        const now = new Date();

        let status = 'confirmed';
        if (endDate < now) {
          status = 'completed';
        }

        return {
          id: event.id,
          title: event.title,
          type: event.event_type,
          description: event.description,
          date: startDate,
          startTime: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          endTime: endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          location: event.location || '',
          capacity: event.capacity || 0,
          registered: event.registered || 0,
          status,
          organizer: 'SIPORTS Team',
          virtual: false,
          speakers: []
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback mock data for initial load
  const mockEvents = [
    {
      id: '1',
      title: 'Conférence Innovation Portuaire',
      type: 'conference',
      description: 'Découvrez les dernières innovations technologiques pour les ports du futur',
      date: new Date(Date.now() + 86400000), // Demain
      startTime: '09:00',
      endTime: '12:00',
      location: 'Salle principale - Palais des Congrès',
      capacity: 500,
      registered: 387,
      status: 'confirmed',
      organizer: 'SIPORTS Team',
      virtual: false,
      speakers: [
        { name: 'Dr. Marie Dubois', company: 'Port Tech Institute' },
        { name: 'Jean-Pierre Martin', company: 'Maritime Solutions' }
      ]
    },
    {
      id: '2',
      title: 'Workshop Digitalisation',
      type: 'workshop',
      description: 'Atelier pratique sur la transformation digitale des opérations portuaires',
      date: new Date(Date.now() + 172800000), // Après-demain
      startTime: '14:00',
      endTime: '17:00',
      location: 'Salle B - Palais des Congrès',
      capacity: 80,
      registered: 65,
      status: 'confirmed',
      organizer: 'TechNav Solutions',
      virtual: false,
      speakers: [
        { name: 'Sophie Leroy', company: 'Maritime Data Systems' }
      ]
    },
    {
      id: '3',
      title: 'Table Ronde Cybersécurité',
      type: 'roundtable',
      description: 'Discussion sur les défis de cybersécurité dans l\'industrie maritime',
      date: new Date(Date.now() - 86400000), // Hier
      startTime: '10:00',
      endTime: '11:30',
      location: 'Salle C - Palais des Congrès',
      capacity: 60,
      registered: 45,
      status: 'completed',
      organizer: 'CyberPort Security',
      virtual: true,
      speakers: [
        { name: 'Michel Bernard', company: 'SecureMaritime' },
        { name: 'Claire Dupont', company: 'Port Authority' }
      ]
    },
    {
      id: '4',
      title: 'Networking VIP',
      type: 'networking',
      description: 'Session de réseautage exclusive pour les décideurs de l\'industrie',
      date: new Date(Date.now() + 259200000), // Dans 3 jours
      startTime: '18:00',
      endTime: '21:00',
      location: 'Salon VIP - Hôtel Marriott',
      capacity: 100,
      registered: 78,
      status: 'confirmed',
      organizer: 'SIPORTS Partners',
      virtual: false,
      speakers: []
    },
    {
      id: '5',
      title: 'Démonstration Technologique',
      type: 'demo',
      description: 'Présentation des dernières solutions technologiques portuaires',
      date: new Date(Date.now() + 345600000), // Dans 4 jours
      startTime: '11:00',
      endTime: '13:00',
      location: 'Zone démonstration - Hall principal',
      capacity: 200,
      registered: 156,
      status: 'confirmed',
      organizer: 'Tech Innovation Hub',
      virtual: false,
      speakers: [
        { name: 'Pierre Durand', company: 'Ocean Freight Corp' },
        { name: 'Marie Martin', company: 'TechNav Solutions' }
      ]
    },
    {
      id: '6',
      title: 'Keynote IA & Ports',
      type: 'keynote',
      description: 'Conférence sur l\'impact de l\'intelligence artificielle sur les ports',
      date: new Date(Date.now() + 432000000), // Dans 5 jours
      startTime: '09:30',
      endTime: '10:30',
      location: 'Auditorium principal',
      capacity: 400,
      registered: 298,
      status: 'confirmed',
      organizer: 'AI Maritime Institute',
      virtual: true,
      speakers: [
        { name: 'Dr. Alain Moreau', company: 'AI Research Lab' }
      ]
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || event.type === selectedType;
    const matchesStatus = !selectedStatus || event.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'conference': return 'Conférence';
      case 'workshop': return 'Atelier';
      case 'roundtable': return 'Table ronde';
      case 'networking': return 'Réseautage';
      case 'demo': return 'Démonstration';
      case 'keynote': return 'Keynote';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" />Confirmé</Badge>;
      case 'pending':
        return <Badge variant="warning"><AlertTriangle className="h-3 w-3 mr-1" />En attente</Badge>;
      case 'cancelled':
        return <Badge variant="error"><XCircle className="h-3 w-3 mr-1" />Annulé</Badge>;
      case 'completed':
        return <Badge variant="info">Terminé</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const handleEventAction = (eventId: string, action: string) => {
    console.log(`Action ${action} pour l'événement ${eventId}`);
    // Ici vous pouvez implémenter les actions réelles
  };

  const eventTypes = [
    { value: 'conference', label: 'Conférence' },
    { value: 'workshop', label: 'Atelier' },
    { value: 'roundtable', label: 'Table ronde' },
    { value: 'networking', label: 'Réseautage' },
    { value: 'demo', label: 'Démonstration' },
    { value: 'keynote', label: 'Keynote' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
              <p className="text-gray-600 mt-2">
                Administration et organisation des événements SIPORTS 2026
              </p>
            </div>
            <Link to="/admin/content">
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Créer Événement
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Événements</p>
                  <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmés</p>
                  <p className="text-3xl font-bold text-green-600">
                    {events.filter(e => e.status === 'confirmed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Participants Totaux</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {events.reduce((sum, e) => sum + e.registered, 0).toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taux d'occupation</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {Math.round((events.reduce((sum, e) => sum + e.registered, 0) /
                               events.reduce((sum, e) => sum + e.capacity, 0)) * 100)}%
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, description ou organisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les types</option>
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les statuts</option>
                <option value="confirmed">Confirmé</option>
                <option value="pending">En attente</option>
                <option value="cancelled">Annulé</option>
                <option value="completed">Terminé</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </div>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {getEventTypeLabel(event.type)} • {event.organizer}
                      </p>
                      {getStatusBadge(event.status)}
                    </div>
                    <div className="ml-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.registered}/{event.capacity} participants</span>
                    </div>
                    {event.virtual && (
                      <div className="flex items-center text-sm text-blue-600">
                        <Video className="h-4 w-4 mr-2" />
                        <span>Événement virtuel</span>
                      </div>
                    )}
                  </div>

                  {event.speakers.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Intervenants :</h4>
                      <div className="space-y-1">
                        {event.speakers.slice(0, 2).map((speaker, idx) => (
                          <div key={idx} className="text-sm text-gray-600">
                            {speaker.name} - {speaker.company}
                          </div>
                        ))}
                        {event.speakers.length > 2 && (
                          <div className="text-sm text-gray-500">
                            +{event.speakers.length - 2} autres...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEventAction(event.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEventAction(event.id, 'edit')}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEventAction(event.id, 'more')}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun événement trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
