import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Search, Filter, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { ROUTES } from '../../lib/routes';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { Event } from '../../types';

export default function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const fetchedEvents = await SupabaseService.getEvents();
      const processedEvents = fetchedEvents.map(event => ({
        ...event,
        date: event.date ? new Date(event.date) : new Date(),
      }));
      setEvents(processedEvents.sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0)));
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast.error('Impossible de récupérer la liste des événements.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${title}" ?`)) {
      try {
        await SupabaseService.deleteEvent(id);
        
        // Supprimer immédiatement du state local
        setEvents(events.filter(e => e.id !== id));
        
        toast.success('Événement supprimé avec succès');
        // Ensuite faire un refresh complet
        setTimeout(() => fetchEvents(), 500);
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesType;
  });

  const eventTypes = Array.from(new Set(events.map(e => e.type)));

  // Statistiques
  const now = new Date();
  const upcomingEvents = events.filter(e => e.date && e.date >= now);
  const thisMonthEvents = events.filter(e => {
    if (!e.date) return false;
    const eventDate = new Date(e.date);
    return eventDate.getMonth() === now.getMonth() && 
           eventDate.getFullYear() === now.getFullYear();
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des Événements</h1>
              <p className="mt-2 text-gray-600">Gérez tous les événements de la plateforme</p>
            </div>
            <Link to={ROUTES.ADMIN_CREATE_EVENT}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-5 w-5 mr-2" />
                Nouvel Événement
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Événements</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-green-600">{upcomingEvents.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Types</p>
                <p className="text-2xl font-bold text-purple-600">{eventTypes.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Filter className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ce mois</p>
                <p className="text-2xl font-bold text-orange-600">{thisMonthEvents.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un événement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="all">Tous les types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Events List */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des événements...</p>
          </Card>
        ) : filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'Aucun événement trouvé' : 'Aucun événement'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Commencez par créer votre premier événement'}
            </p>
            {!searchTerm && filterType === 'all' && (
              <Link to={ROUTES.ADMIN_CREATE_EVENT}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Créer un événement
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                        {event.title}
                      </h3>
                      <Badge 
                        variant={event.date && event.date >= now ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {event.type}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      {event.date ? formatDate(event.date) : 'Date non définie'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      {event.startTime} - {event.endTime}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-purple-500" />
                        {event.location}
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`${ROUTES.ADMIN_CREATE_EVENT}?edit=${event.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(event.id, event.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
