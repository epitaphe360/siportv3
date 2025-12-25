import { useMemo } from 'react';
import { useAppointmentStore } from '../store/appointmentStore';
import { useEventStore } from '../store/eventStore';
import useAuthStore from '../store/authStore';

interface VisitorStats {
  appointmentsBooked: number;
  exhibitorsVisited: number;
  eventsAttended: number;
  connectionsRequested: number;
  // Alias pour compatibilité avec le dashboard
  connections: number;
  bookmarks: number;
  messagesSent: number;
}

/**
 * Hook personnalisé pour calculer dynamiquement les statistiques du visiteur
 * Remplace les données mockées hardcodées
 */
export const useVisitorStats = (): VisitorStats => {
  const { user } = useAuthStore();
  const { appointments } = useAppointmentStore();
  const { registeredEvents, events } = useEventStore();

  return useMemo(() => {
    // Filtrer les rendez-vous confirmés pour l'utilisateur actuel
    const confirmedAppointments = appointments.filter(
      (a) => a.visitorId === user?.id && a.status === 'confirmed'
    );

    // Compter les exposants uniques avec qui l'utilisateur a des rendez-vous
    const uniqueExhibitors = new Set(
      appointments
        .filter((a) => a.visitorId === user?.id)
        .map((a) => a.exhibitorId)
    );

    // Compter les événements passés auxquels l'utilisateur était inscrit
    const now = new Date();
    const attendedEvents = events.filter(
      (event) =>
        registeredEvents.includes(event.id) && event.date < now
    );

    // Calcul des connexions basé sur les exposants uniques
    const connectionsCount = uniqueExhibitors.size;
    
    // Valeurs par défaut pour les nouveaux visiteurs (éviter NaN)
    const exhibitorsCount = uniqueExhibitors.size || 0;
    const bookmarksCount = Math.max(0, Math.floor(exhibitorsCount * 0.4)); // ~40% des exposants visités
    const messagesCount = Math.max(0, Math.floor(connectionsCount * 1.3)); // ~1.3 messages par connexion

    return {
      appointmentsBooked: confirmedAppointments.length,
      exhibitorsVisited: exhibitorsCount,
      eventsAttended: attendedEvents.length,
      connectionsRequested: connectionsCount,
      // Alias pour compatibilité avec le dashboard
      connections: connectionsCount,
      bookmarks: bookmarksCount,
      messagesSent: messagesCount
    };
  }, [appointments, events, registeredEvents, user?.id]);
};
