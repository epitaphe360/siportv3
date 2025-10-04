import { useMemo } from 'react';
import { useAppointmentStore } from '../store/appointmentStore';
import { useEventStore } from '../store/eventStore';
import useAuthStore from '../store/authStore';

interface VisitorStats {
  appointmentsBooked: number;
  exhibitorsVisited: number;
  eventsAttended: number;
  connectionsRequested: number;
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

    // TODO: Implémenter le comptage des connexions depuis un store dédié
    // Pour l'instant, on utilise le nombre d'exposants uniques comme proxy
    const connectionsCount = uniqueExhibitors.size;

    return {
      appointmentsBooked: confirmedAppointments.length,
      exhibitorsVisited: uniqueExhibitors.size,
      eventsAttended: attendedEvents.length,
      connectionsRequested: connectionsCount
    };
  }, [appointments, events, registeredEvents, user?.id]);
};
