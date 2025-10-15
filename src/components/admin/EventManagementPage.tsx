import { useState, useEffect } from 'react';
import { Calendar, Edit, Trash2, Loader2, Plus, AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../ui/use-toast';
import { SupabaseService } from '../../services/supabaseService';
import { Event } from '../../types';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import { motion } from 'framer-motion';
import EventCreationForm from './EventCreationForm'; // Réutiliser le formulaire pour la modification

export default function EventManagementPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const fetchedEvents = await SupabaseService.getEvents();
      // Assurer que la date est un objet Date pour le tri
      const processedEvents = fetchedEvents.map(event => ({
        ...event,
        date: new Date(event.date),
      }));
      setEvents(processedEvents.sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de récupérer la liste des événements.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: string, eventTitle: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'événement "${eventTitle}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(eventId);
    try {
      await SupabaseService.deleteEvent(eventId);
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: 'Succès',
        description: `L'événement "${eventTitle}" a été supprimé.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: 'Erreur de suppression',
        description: 'Impossible de supprimer l\'événement.',
        variant: 'error',
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleEditSuccess = () => {
    setEditingEvent(null);
    fetchEvents(); // Recharger la liste après modification
    toast({
      title: 'Succès',
      description: `L'événement a été mis à jour.`,
      variant: 'success',
    });
  };

  const EventItem = ({ event }: { event: Event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-gray-900 truncate">{event.title}</p>
        <div className="flex items-center space-x-3 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>•</span>
          <span>{event.startTime} - {event.endTime}</span>
          <span>•</span>
          <span>{event.type}</span>
        </div>
      </div>
      <div className="flex space-x-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditingEvent(event)}
        >
          <Edit className="h-4 w-4 mr-2" /> Modifier
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDelete(event.id, event.title)}
          disabled={isDeleting === event.id}
        >
          {isDeleting === event.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );

  if (editingEvent) {
    // On réutilise le formulaire de création pour la modification
    return (
      <EventCreationForm 
        eventToEdit={editingEvent} 
        onSuccess={handleEditSuccess} 
        onCancel={() => setEditingEvent(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Événements ({events.length})
          </h1>
          <Link to={ROUTES.ADMIN_CREATE_EVENT}>
            <Button>
              <Plus className="h-5 w-5 mr-2" /> Créer un Événement
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          {isLoading ? (
            <div className="p-6 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-4" />
              <p className="text-gray-600">Chargement des événements...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-10 w-10 mx-auto text-yellow-500 mb-4" />
              <p className="text-lg font-medium text-gray-700">Aucun événement trouvé.</p>
              <p className="text-gray-500">Utilisez le bouton "Créer un Événement" pour commencer.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events.map(event => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
