import { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Building2,
  Network,
  X
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import PublicAvailability from '../availability/PublicAvailability';
import useAuthStore from '../../store/authStore';
import { useEventStore } from '../../store/eventStore';
import { Link } from 'react-router-dom';
import PersonalCalendar from './PersonalCalendar';

export default function VisitorDashboard() {
  // Appointment management logic (copied/adapted from ExhibitorDashboard)
  const { appointments, fetchAppointments, updateAppointmentStatus, cancelAppointment, isLoading: isAppointmentsLoading } = require('../../store/appointmentStore').useAppointmentStore();
  const [showAvailabilityModal, setShowAvailabilityModal] = useState<{ exhibitorId: string } | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filtrer les rendez-vous reçus (où le visiteur est le user connecté)
  const receivedAppointments = appointments?.filter((a: import('../../types').Appointment) => user && a.visitorId === user.id) || [];
  const pendingAppointments = receivedAppointments.filter((a: import('../../types').Appointment) => a.status === 'pending');
  const confirmedAppointments = receivedAppointments.filter((a: import('../../types').Appointment) => a.status === 'confirmed');
  const refusedAppointments = receivedAppointments.filter((a: import('../../types').Appointment) => a.status === 'cancelled');

  const handleAccept = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, 'confirmed');
    fetchAppointments();
  };
  const handleReject = async (appointmentId: string) => {
    await cancelAppointment(appointmentId);
    fetchAppointments();
  };
  const handleRequestAnother = (exhibitorId: string) => {
    setShowAvailabilityModal({ exhibitorId });
  };
  const { user, isAuthenticated } = useAuthStore();
  const { 
    events, 
    registeredEvents, 
    fetchEvents, 
    fetchUserEventRegistrations,
    unregisterFromEvent 
  } = useEventStore();
  
  const [stats] = useState({
    appointmentsBooked: 3,
    exhibitorsVisited: 12,
    eventsAttended: 5,
    connectionsRequested: 8
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      fetchUserEventRegistrations();
    }
  }, [isAuthenticated, fetchEvents, fetchUserEventRegistrations]);

  const handleUnregisterFromEvent = async (eventId: string) => {
    try {
      await unregisterFromEvent(eventId);
      fetchUserEventRegistrations(); // Refresh the list
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erreur lors de la désinscription');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => registeredEvents.includes(event.id) && event.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 3);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Accès non autorisé
          </h3>
          <p className="text-gray-600">
            Veuillez vous connecter pour accéder à votre tableau de bord visiteur
          </p>
          <Link to="/login" className="mt-4 inline-block">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord visiteur
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {user.name}, gérez vos activités SIPORTS 2026
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">RDV programmés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.appointmentsBooked}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Exposants visités</p>
                <p className="text-2xl font-bold text-gray-900">{stats.exhibitorsVisited}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Événements inscrits</p>
                <p className="text-2xl font-bold text-gray-900">{registeredEvents.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connexions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.connectionsRequested}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Network className="h-5 w-5 mr-2 text-blue-600" />
              Réseautage IA
            </h3>
            <p className="text-gray-600 mb-4">
              Découvrez des connexions pertinentes grâce à l'intelligence artificielle
            </p>
            <Link to="/networking">
              <Button className="w-full">
                <Network className="h-4 w-4 mr-2" />
                Explorer le réseau
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-600" />
              Prendre un rendez-vous
            </h3>
            <p className="text-gray-600 mb-4">
              Planifiez des rencontres avec les exposants selon leurs disponibilités
            </p>
            <Link to="/networking?action=schedule">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Programmer un RDV
              </Button>
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
              Messagerie
            </h3>
            <p className="text-gray-600 mb-4">
              Communiquez directement avec les exposants et partenaires
            </p>
            <Link to="/chat">
              <Button variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ouvrir la messagerie
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-orange-600" />
              Découvrir les exposants
            </h3>
            <p className="text-gray-600 mb-4">
              Explorez les stands et trouvez les solutions qui vous intéressent
            </p>
            <Link to="/exhibitors">
              <Button variant="outline" className="w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Voir les exposants
              </Button>
            </Link>
          </Card>
        </div>

        {/* Event Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Mes Événements ({registeredEvents.length})
            </h3>
            <p className="text-gray-600 mb-4">
              Gérez vos inscriptions aux événements et conférences
            </p>
            <div className="space-y-3 mb-4">
              {getUpcomingEvents().map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                    <p className="text-xs text-gray-600">{formatDate(event.date)} à {event.startTime}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUnregisterFromEvent(event.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {getUpcomingEvents().length === 0 && (
                <p className="text-sm text-gray-500">Aucun événement à venir</p>
              )}
            </div>
            <Link to="/events">
              <Button variant="outline" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Voir tous les événements
              </Button>
            </Link>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
              Calendrier Personnel
            </h3>
            <p className="text-gray-600 mb-4">
              Consultez votre planning personnel avec tous vos événements
            </p>
            <PersonalCalendar compact={true} />
          </Card>
        </div>

        {/* Appointment Management */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Mes rendez-vous
          </h3>
          {isAppointmentsLoading ? (
            <div className="text-center py-6 text-gray-500">Chargement...</div>
          ) : (
            <>
              {pendingAppointments.length === 0 && (
                <div className="text-center text-gray-500 py-4">Aucune demande en attente</div>
              )}
              {pendingAppointments.map((app: import('../../types').Appointment) => (
                <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                  <div>
                    <div className="font-medium text-gray-900">Invitation de {app.exhibitorId}</div>
                    <div className="text-xs text-gray-600">{app.message}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="default" onClick={() => handleAccept(app.id)}>Accepter</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(app.id)}>Refuser</Button>
                  </div>
                </div>
              ))}
              {/* Show refused appointments with option to request another slot */}
              {refusedAppointments.length > 0 && (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Rendez-vous refusés</h4>
                  {refusedAppointments.map((app: import('../../types').Appointment) => (
                    <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                      <div>
                        <div className="font-medium text-gray-900">Invitation de {app.exhibitorId}</div>
                        <div className="text-xs text-gray-600">{app.message}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleRequestAnother(app.exhibitorId)}>
                        Demander un autre créneau
                      </Button>
                    </div>
                  ))}
                </>
              )}
              <h4 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Rendez-vous confirmés</h4>
              {confirmedAppointments.length === 0 ? (
                <div className="text-center text-gray-500 py-2">Aucun rendez-vous confirmé</div>
              ) : (
                confirmedAppointments.map((app: import('../../types').Appointment) => (
                  <div key={app.id} className="flex items-center justify-between border-b py-2 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">Avec {app.exhibitorId}</div>
                      <div className="text-xs text-gray-600">{app.message}</div>
                    </div>
                    <Badge variant="success">Confirmé</Badge>
                  </div>
                ))
              )}
            </>
          )}
        </Card>

        {/* Modal for requesting another slot */}
        {showAvailabilityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowAvailabilityModal(null)}>
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4">Choisir un autre créneau disponible</h3>
              <PublicAvailability userId={showAvailabilityModal.exhibitorId} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};