import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Plus,
  Check,
  X,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAppointmentStore } from '../../store/appointmentStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { isDateInSalonRange, getMinSlotDate, getMaxSlotDate, DEFAULT_SALON_CONFIG } from '../../config/salonInfo';

export default function AppointmentCalendar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    appointments,
    timeSlots,
    isLoading,
    isBooking,
    fetchAppointments,
    fetchTimeSlots,
    bookAppointment,
    cancelAppointment,
    updateAppointmentStatus,
    createTimeSlot
  } = useAppointmentStore();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCreateSlotModal, setShowCreateSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingMessage, setBookingMessage] = useState('');
  const [newSlotData, setNewSlotData] = useState({
    date: getMinSlotDate(), // Date par défaut: 1er avril 2026
    startTime: '09:00',
    endTime: '09:30',
    duration: 30,
    type: 'in-person' as 'in-person' | 'virtual' | 'hybrid',
    maxBookings: 1,
    location: ''
  });
  
  // Récupérer l'ID de l'exposant depuis l'URL ou les paramètres
  const rawExhibitorId = searchParams.get('exhibitor') ||
                         location.pathname.split('/').pop() ||
                         '';
  
  // Valider que c'est une UUID valide (36 caractères avec tirets)
  const exhibitorId = (rawExhibitorId && rawExhibitorId.includes('-') && rawExhibitorId.length === 36) 
    ? rawExhibitorId 
    : '';

  // Mode "Mes rendez-vous" si pas d'exhibitorId
  const isMyAppointmentsMode = !exhibitorId;

  // Vérification d'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion avec un paramètre de redirection
      const currentPath = `/appointments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    // Note: On ne redirige plus si pas d'exhibitorId - on affiche "Mes rendez-vous"
  }, [isAuthenticated, navigate, searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAppointments();
      // Ne fetch les time slots que si on a un exhibitorId
      if (exhibitorId) {
        fetchTimeSlots(exhibitorId);
      }
    }
  }, [fetchAppointments, fetchTimeSlots, exhibitorId, isAuthenticated]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getStatusColor = (status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getMeetingTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return Video;
      case 'in-person': return MapPin;
      case 'hybrid': return Users;
      default: return Calendar;
    }
  };

  // removed simple handleBookSlot in favor of improved version below

  const handleCreateSlot = async () => {
    try {
      // Validation des données
      if (!newSlotData.date || !newSlotData.startTime || !newSlotData.endTime) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation de la date dans la plage du salon (1-3 avril 2026)
      const selectedDate = new Date(newSlotData.date + 'T00:00:00');

      if (!isDateInSalonRange(selectedDate)) {
        toast.error(`La date doit être comprise entre le ${DEFAULT_SALON_CONFIG.dates.start} et le ${DEFAULT_SALON_CONFIG.dates.end}`);
        return;
      }

      // Vérifier que l'heure de fin est après l'heure de début
      if (newSlotData.startTime >= newSlotData.endTime) {
        toast.error('L\'heure de fin doit être après l\'heure de début');
        return;
      }

      // Calculer la durée automatiquement
      const startTime = new Date(`2000-01-01T${newSlotData.startTime}`);
      const endTime = new Date(`2000-01-01T${newSlotData.endTime}`);
      const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Vérifier les conflits avec les créneaux existants (comparaisons numériques)
      const conflictingSlot = timeSlots.find(slot => {
        const slotDate = new Date(slot.date).toDateString();
        const newDate = selectedDate.toDateString();

        if (slotDate !== newDate) return false;

        // Convertir HH:MM en minutes depuis minuit
        const timeToMinutes = (t: string) => {
          const [hh, mm] = t.split(':').map(x => parseInt(x, 10));
          return hh * 60 + mm;
        };

        const existingStartMin = timeToMinutes(slot.startTime);
        const existingEndMin = timeToMinutes(slot.endTime);
        const newStartMin = timeToMinutes(newSlotData.startTime);
        const newEndMin = timeToMinutes(newSlotData.endTime);

        // Overlap if newStart < existingEnd && newEnd > existingStart
        return newStartMin < existingEndMin && newEndMin > existingStartMin;
      });

      if (conflictingSlot) {
        toast.error(`Conflit d'horaire détecté: ${conflictingSlot.startTime} - ${conflictingSlot.endTime}`);
        return;
      }

      const slotData = {
        exhibitorId: exhibitorId,
        date: selectedDate,
        startTime: newSlotData.startTime,
        endTime: newSlotData.endTime,
        duration: calculatedDuration,
        type: newSlotData.type,
        maxBookings: newSlotData.maxBookings,
        currentBookings: 0,
        available: true,
        location: newSlotData.location || undefined
      };

      // Afficher un indicateur de chargement
      toast.loading('Création du créneau en cours...', { id: 'create-slot' });

      await createTimeSlot(slotData);

      // Fermer le toast de chargement et afficher le succès
      toast.success('Créneau créé avec succès !', { id: 'create-slot' });

      setShowCreateSlotModal(false);
      setNewSlotData({
        date: getMinSlotDate(),
        startTime: '09:00',
        endTime: '09:30',
        duration: 30,
        type: 'in-person',
        maxBookings: 1,
        location: ''
      });

      // Recharger les créneaux
      await fetchTimeSlots(exhibitorId);

    } catch (error) {
      console.error('Erreur lors de la création du créneau:', error);
      toast.error('Erreur lors de la création du créneau. Veuillez réessayer.', { id: 'create-slot' });
    }
  };


  const handleBookSlotImproved = async () => {
    if (!selectedSlot) return;
    
    const slot = timeSlots.find(s => s.id === selectedSlot);
    if (!slot) {
      toast.error('Créneau non trouvé');
      return;
    }
    
    try {
      // Pré-vérification du quota côté client
      const auth = await import('../../store/authStore');
      const { getVisitorQuota } = await import('../../config/quotas');
      const user = auth?.default?.getState ? auth.default.getState().user : null;
      const visitorId = user?.id || 'user1';
      const visitorLevel = user?.visitor_level || user?.profile?.visitor_level || 'free';
      const quota = getVisitorQuota(visitorLevel);
      const confirmedCount = appointments.filter(a => a.visitorId === visitorId && a.status === 'confirmed').length;
      if (confirmedCount >= quota) {
        toast.error('Quota de rendez-vous atteint pour votre niveau');
        return;
      }

      // Prevent duplicate same-slot booking
      if (appointments.some(a => a.visitorId === visitorId && a.timeSlotId === selectedSlot)) {
        toast.error('Vous avez déjà réservé ce créneau');
        return;
      }

      await bookAppointment(selectedSlot, bookingMessage);
      toast.success('Rendez-vous réservé !');
      
      setShowBookingModal(false);
      setSelectedSlot(null);
      setBookingMessage('');
    } catch {
      toast.error('Erreur lors de la réservation.');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      toast.success('Rendez-vous confirmé !');
    } catch {
      toast.error('Erreur lors de la confirmation.');
    }
  };

  const handleRejectAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success('Rendez-vous refusé et annulé.');
    } catch {
      toast.error('Erreur lors du refus.');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await cancelAppointment(appointmentId);
        toast.success('Rendez-vous annulé !');
      } catch {
        toast.error('Erreur lors de l\'annulation.');
      }
    }
  };

  const todaySlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return slotDate.toDateString() === selectedDate.toDateString();
  });

  const todayAppointments = appointments.filter(appointment => {
    const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
    if (!slot) return false;
    const slotDate = new Date(slot.date);
    return slotDate.toDateString() === selectedDate.toDateString();
  });

  // Vérification d'authentification - éviter le rendu si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirection vers la page de connexion...</p>
        </div>
      </div>
    );
  }

  // Mode "Mes rendez-vous" - afficher tous les rendez-vous de l'utilisateur
  if (isMyAppointmentsMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Bouton de retour */}
          <div className="mb-6">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 min-w-0 mr-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Mes Rendez-vous B2B
              </h2>
              <p className="text-gray-600 mt-1">
                Consultez et gérez tous vos rendez-vous avec les exposants
              </p>
            </div>
          </div>

          {/* Liste des rendez-vous */}
          <Card className="mb-8">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Tous vos rendez-vous ({appointments.length})
              </h3>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun rendez-vous</h4>
                  <p className="text-gray-600 mb-6">
                    Vous n'avez pas encore de rendez-vous B2B.<br />
                    Visitez les pages des exposants pour demander un rendez-vous.
                  </p>
                  <Link to={ROUTES.EXHIBITORS}>
                    <Button variant="default">
                      <Users className="h-4 w-4 mr-2" />
                      Voir les exposants
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => {
                    const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
                    const StatusIcon = appointment.status === 'confirmed' ? Check :
                                      appointment.status === 'cancelled' ? X : Clock;
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-full ${
                              appointment.status === 'confirmed' ? 'bg-green-100' :
                              appointment.status === 'cancelled' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              <StatusIcon className={`h-5 w-5 ${
                                appointment.status === 'confirmed' ? 'text-green-600' :
                                appointment.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {appointment.exhibitor?.companyName || appointment.exhibitor?.name || `Exposant`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {slot?.date ? new Date(slot.date).toLocaleDateString('fr-FR', {
                                  weekday: 'long', day: 'numeric', month: 'long'
                                }) : 'Date à confirmer'}
                                {slot?.startTime && ` • ${slot.startTime}`}
                              </p>
                              {appointment.message && (
                                <p className="text-xs text-gray-500 mt-1 italic">"{appointment.message}"</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusColor(appointment.status)}>
                              {getStatusLabel(appointment.status)}
                            </Badge>
                            {appointment.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                Annuler
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.status === 'confirmed').length}
                  </p>
                  <p className="text-sm text-gray-600">Confirmés</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">En attente</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointments.filter(a => a.status === 'cancelled').length}
                  </p>
                  <p className="text-sm text-gray-600">Annulés</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton de retour */}
        <div className="mb-6">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au Tableau de Bord
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1 min-w-0 mr-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Calendrier des Rendez-vous
            </h2>
            <p className="text-gray-600 mt-1">
              Gérez vos créneaux et rendez-vous - Exposant #{exhibitorId}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Button variant="default" onClick={() => setShowCreateSlotModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Créneau
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Calendrier</h3>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-900">
                      {formatDate(selectedDate)}
                    </h4>
                  </div>
                  
                  {/* Quick date navigation */}
                  <div className="grid grid-cols-3 gap-2">
                    {[-1, 0, 1].map(offset => {
                      const date = new Date();
                      date.setDate(date.getDate() + offset);
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      
                      return (
                        <button
                          key={offset}
                          onClick={() => setSelectedDate(date)}
                          className={`p-2 text-sm rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-700 font-medium' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {offset === -1 ? 'Hier' : offset === 0 ? 'Aujourd\'hui' : 'Demain'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Time Slots */}
            <Card className="lg:col-span-2">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">
                  Créneaux disponibles - {formatDate(selectedDate)}
                </h3>
              </div>
              <div className="p-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : todaySlots.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun créneau disponible pour cette date</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaySlots.map((slot) => {
                      const MeetingIcon = getMeetingTypeIcon(slot.type);
                      const isBooked = slot.currentBookings >= slot.maxBookings;
                      
                      return (
                        <motion.div
                          key={slot.id}
                          whileHover={{ scale: 1.02 }}
                          className={`p-4 border rounded-lg transition-colors ${
                            isBooked 
                              ? 'border-gray-200 bg-gray-50' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isBooked) {
                              setSelectedSlot(slot.id);
                              setShowBookingModal(true);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                isBooked ? 'bg-gray-200' : 'bg-blue-100'
                              }`}>
                                <MeetingIcon className={`h-4 w-4 ${
                                  isBooked ? 'text-gray-500' : 'text-blue-600'
                                }`} />
                              </div>
                              
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                  </span>
                                  <Badge 
                                    variant={slot.type === 'virtual' ? 'info' : slot.type === 'hybrid' ? 'warning' : 'default'}
                                    size="sm"
                                  >
                                    {slot.type === 'virtual' ? 'Virtuel' : 
                                     slot.type === 'hybrid' ? 'Hybride' : 'Présentiel'}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{slot.duration} min</span>
                                  </span>
                                  
                                  {slot.location && (
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>{slot.location}</span>
                                    </span>
                                  )}
                                  
                                  <span className="flex items-center space-x-1">
                                    <Users className="h-3 w-3" />
                                    <span>{slot.currentBookings}/{slot.maxBookings}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {isBooked ? (
                                <Badge variant="error" size="sm">Complet</Badge>
                              ) : (
                                <Badge variant="success" size="sm">Disponible</Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Appointments List */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Mes Rendez-vous</h3>
            </div>
            <div className="p-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun rendez-vous prévu pour cette date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => {
                    const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
                    if (!slot) {
                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border border-orange-200 rounded-lg bg-orange-50"
                        >
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            <div>
                              <p className="text-sm font-medium text-orange-700">Créneau non trouvé</p>
                              <p className="text-xs text-orange-600">Le créneau de ce rendez-vous n'est plus disponible</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    const MeetingIcon = getMeetingTypeIcon(appointment.meetingType);
                    
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <MeetingIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                                <Badge 
                                  variant={getStatusColor(appointment.status)}
                                  size="sm"
                                >
                                  {getStatusLabel(appointment.status)}
                                </Badge>
                              </div>
                              
                              {appointment.message && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {appointment.message}
                                </p>
                              )}
                              
                              {appointment.meetingLink && (
                                <a 
                                  href={appointment.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                                >
                                  Rejoindre la réunion
                                </a>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {appointment.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="default"
                                  onClick={() => handleConfirmAppointment(appointment.id)}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Confirmer
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleRejectAppointment(appointment.id)}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Refuser
                                </Button>
                              </>
                            )}
                            
                            {appointment.status === 'confirmed' && (
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Annuler
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Booking Modal */}
          {showBookingModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Réserver un rendez-vous
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      placeholder="Décrivez brièvement l'objet de votre rendez-vous..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedSlot(null);
                      setBookingMessage('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleBookSlotImproved}
                    disabled={isBooking}
                  >
                    {isBooking ? 'Réservation en cours...' : 'Réserver'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Create Slot Modal */}
          {showCreateSlotModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Créer un nouveau créneau
                </h3>
                
                <div className="space-y-4">
                  {/* Information sur les dates du salon */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Créneaux uniquement du {DEFAULT_SALON_CONFIG.dates.start} au {DEFAULT_SALON_CONFIG.dates.end}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newSlotData.date}
                      min={getMinSlotDate()}
                      max={getMaxSlotDate()}
                      onChange={(e) => setNewSlotData({...newSlotData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure début
                      </label>
                      <input
                        type="time"
                        value={newSlotData.startTime}
                        onChange={(e) => setNewSlotData({...newSlotData, startTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Heure fin
                      </label>
                      <input
                        type="time"
                        value={newSlotData.endTime}
                        onChange={(e) => setNewSlotData({...newSlotData, endTime: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de rendez-vous
                    </label>
                    <select
                      value={newSlotData.type}
                      onChange={(e) => setNewSlotData({...newSlotData, type: e.target.value as 'in-person' | 'virtual' | 'hybrid'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="in-person">Présentiel</option>
                      <option value="virtual">Virtuel</option>
                      <option value="hybrid">Hybride</option>
                    </select>
                    <div className="mt-2 text-xs text-gray-500">
                      <p><strong>Présentiel:</strong> Rencontre sur votre stand</p>
                      <p><strong>Virtuel:</strong> Visioconférence en ligne</p>
                      <p><strong>Hybride:</strong> Stand + diffusion en ligne</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lieu (optionnel)
                    </label>
                    <input
                      type="text"
                      value={newSlotData.location}
                      onChange={(e) => setNewSlotData({...newSlotData, location: e.target.value})}
                      placeholder={
                        newSlotData.type === 'virtual' ? 'Lien de visioconférence' :
                        newSlotData.type === 'hybrid' ? 'Stand A-12 + Lien visio' :
                        'Stand A-12, Salle de réunion B-5'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {newSlotData.type === 'virtual' && (
                      <p className="mt-1 text-xs text-blue-600">
                        💡 Le lien de visioconférence sera généré automatiquement si laissé vide
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre max de réservations
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSlotData.maxBookings}
                      onChange={(e) => setNewSlotData({...newSlotData, maxBookings: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Recommandé: 1 pour les RDV individuels, 2-5 pour les présentations de groupe
                    </p>
                  </div>
                  
                  {/* Aperçu du Créneau */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Aperçu du créneau</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Date:</strong> {new Date(newSlotData.date).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Horaire:</strong> {newSlotData.startTime} - {newSlotData.endTime}</p>
                      <p><strong>Durée:</strong> {newSlotData.duration} minutes</p>
                      <p><strong>Type:</strong> {
                        newSlotData.type === 'in-person' ? 'Présentiel' :
                        newSlotData.type === 'virtual' ? 'Virtuel' : 'Hybride'
                      }</p>
                      <p><strong>Capacité:</strong> {newSlotData.maxBookings} personne(s)</p>
                      {newSlotData.location && (
                        <p><strong>Lieu:</strong> {newSlotData.location}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateSlotModal(false);
                      setNewSlotData({
                        date: getMinSlotDate(),
                        startTime: '09:00',
                        endTime: '09:30',
                        duration: 30,
                        type: 'in-person',
                        maxBookings: 1,
                        location: ''
                      });
                    }}
                  >
                    Annuler
                  </Button>
                  <Button variant="default" onClick={handleCreateSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer le créneau
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};