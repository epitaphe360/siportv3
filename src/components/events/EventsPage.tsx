import { useState, useEffect, useCallback, memo } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Filter,
  Search,
  Star,
  ExternalLink
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useEventStore } from '../../store/eventStore';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';

// OPTIMIZATION: Memoized EventsPage to prevent unnecessary re-renders
export default memo(function EventsPage() {
  const {
    events,
    featuredEvents,
    registeredEvents,
    isLoading,
    fetchEvents,
    registerForEvent,
    unregisterFromEvent
  } = useEventStore();

  const { isAuthenticated, user } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = [
    'Digital Transformation',
    'Networking',
    'Sustainability',
    'Data Management',
    'Maritime Transport'
  ];

  const eventTypes = [
    { value: 'conference', label: 'Conférence' },
    { value: 'webinar', label: 'Webinaire' },
    { value: 'roundtable', label: 'Table Ronde' },
    { value: 'networking', label: 'Réseautage' },
    { value: 'workshop', label: 'Atelier' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesType = !selectedType || event.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return Video;
      case 'networking': return Users;
      case 'roundtable': return Users;
      case 'workshop': return Users;
      case 'conference': return Calendar;
      default: return Calendar;
    }
  };

  const getEventTypeLabel = (type: string) => {
    const typeObj = eventTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getEventTypeColor = (type: string): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (type) {
      case 'webinar': return 'info';
      case 'networking': return 'success';
      case 'roundtable': return 'warning';
      case 'workshop': return 'error';
      case 'conference': return 'default';
      default: return 'default';
    }
  };

  const handleEventRegistration = async (eventId: string) => {
    if (!isAuthenticated || !user) {
      alert('Vous devez être connecté pour vous inscrire à un événement.');
      return;
    }

    try {
      if (registeredEvents.includes(eventId)) {
        await unregisterFromEvent(eventId);
      } else {
        await registerForEvent(eventId);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Événements SIPORTS 2026
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Participez aux conférences, webinaires et sessions de réseautage 
              organisés durant le salon
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) =
                      aria-label="Rechercher un événement..."> setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select value={selectedCategory}
                    onChange={(e) =
                aria-label="Select option"> setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'événement
                  </label>
                  <select value={selectedType}
                    onChange={(e) =
                aria-label="Select option"> setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tous les types</option>
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Événements à la Une
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredEvents.slice(0, 2).map((event, index) => {
                const EventIcon = getEventTypeIcon(event.type);
                const isRegistered = registeredEvents.includes(event.id);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card hover className="h-full">
                      <div className="relative">
                        {event.featured && (
                          <div className="absolute top-4 right-4">
                            <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-start space-x-4 mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <EventIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge 
                                  variant={getEventTypeColor(event.type)}
                                  size="sm"
                                >
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                                {event.virtual && (
                                  <Badge variant="info" size="sm">
                                    <Video className="h-3 w-3 mr-1" />
                                    Virtuel
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {event.title}
                              </h3>
                              
                              <p className="text-gray-600 mb-4 line-clamp-2">
                                {event.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Event Details */}
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                            
                            {event.location && (
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{event.registered}/{event.capacity} participants</span>
                            </div>
                          </div>
                          
                          {/* Speakers */}
                          {event.speakers.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Intervenants :
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {event.speakers.map(speaker => (
                                  <div key={speaker.id} className="text-sm text-gray-600">
                                    {speaker.name} - {speaker.company}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Actions */}
                          <div className="flex space-x-3">
                            {isAuthenticated ? (
                              <Button
                                onClick={() => handleEventRegistration(event.id)}
                                variant={isRegistered ? 'outline' : 'default'}
                                className="flex-1"
                                type="button"
                              >
                                {isRegistered ? 'Se désinscrire' : "S'inscrire"}
                              </Button>
                            ) : (
                              <Link to={ROUTES.LOGIN} className="flex-1">
                                <Button className="w-full">
                                  Se connecter pour s'inscrire
                                </Button>
                              </Link>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => {
                                const shareData = {
                                  title: event.title,
                                  text: event.description,
                                  url: window.location.href + '#event-' + event.id
                                };
                                if (navigator.share) {
                                  navigator.share(shareData);
                                } else {
                                  navigator.clipboard.writeText(shareData.url);
                                  alert("🔗 Lien de l'événement copié !");
                                }
                              }}
                              title="Partager cet événement"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Tous les Événements ({filteredEvents.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
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
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-gray-600">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => {
                const EventIcon = getEventTypeIcon(event.type);
                const isRegistered = registeredEvents.includes(event.id);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card hover className="h-full">
                      <div className="p-6">
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <EventIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge 
                                variant={getEventTypeColor(event.type)}
                                size="sm"
                              >
                                {getEventTypeLabel(event.type)}
                              </Badge>
                              {event.virtual && (
                                <Badge variant="info" size="sm">Virtuel</Badge>
                              )}
                            </div>
                            
                            <h3 className="font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h3>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {event.description}
                        </p>
                        
                        {/* Event Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-2" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-2" />
                            <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-2" />
                            <span>{event.registered}/{event.capacity}</span>
                          </div>
                        </div>
                        
                        {/* Action */}
                        {isAuthenticated ? (
                          <Button
                            onClick={() => handleEventRegistration(event.id)}
                            variant={isRegistered ? 'outline' : 'default'}
                            size="sm"
                            className="w-full"
                            type="button"
                          >
                            {isRegistered ? 'Inscrit' : "S'inscrire"}
                          </Button>
                        ) : (
                          <Link to={ROUTES.LOGIN}>
                            <Button size="sm" className="w-full">
                              Se connecter
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});