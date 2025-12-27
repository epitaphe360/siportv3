import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Video, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Appointment } from '../../types';
import { useAppointmentStore } from '../../store/appointmentStore';
import useAuthStore from '../../store/authStore';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface PersonalAppointmentsCalendarProps {
  userType: 'exhibitor' | 'partner' | 'visitor';
}

export default function PersonalAppointmentsCalendar({ userType }: PersonalAppointmentsCalendarProps) {
  const { user } = useAuthStore();
  const {
    appointments,
    timeSlots,
    fetchAppointments,
    fetchTimeSlots,
    updateAppointmentStatus,
    cancelAppointment,
    isLoading
  } = useAppointmentStore();

  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    fetchAppointments();
    if (user?.id) {
      fetchTimeSlots(user.id);
    }
  }, [fetchAppointments, fetchTimeSlots, user?.id]);

  // Filtrer les rendez-vous selon le type d'utilisateur
  const getFilteredAppointments = () => {
    if (!user) return [];

    let filteredByUser: Appointment[] = [];
    
    if (userType === 'visitor') {
      // Pour les visiteurs : rendez-vous qu'ils ont demandés
      filteredByUser = appointments.filter(apt => apt.visitorId === user.id);
    } else {
      // Pour les exposants/partenaires : rendez-vous qu'ils reçoivent
      filteredByUser = appointments.filter(apt => apt.exhibitorId === user.id);
    }

    // Appliquer le filtre de statut
    if (filter === 'all') return filteredByUser;
    return filteredByUser.filter(apt => apt.status === filter);
  };

  const handleAccept = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'confirmed');
      toast.success('Rendez-vous confirmé');
      fetchAppointments();
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleReject = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      toast.success('Rendez-vous refusé');
      fetchAppointments();
    } catch (error) {
      toast.error('Erreur lors du refus');
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    
    try {
      await cancelAppointment(appointmentId);
      toast.success('Rendez-vous annulé');
      fetchAppointments();
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      case 'hybrid': return <Globe className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Lundi

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedWeek);
  // Pour cette démo, on simule que les appointments ont des timeSlots
  // Dans une vraie implémentation, il faudrait faire un join avec les timeSlots
  const weekAppointments = getFilteredAppointments();

  const getAppointmentTitle = () => {
    if (userType === 'visitor') {
      return `RDV avec Exposant`;
    } else {
      return `RDV avec Visiteur`;
    }
  };

  return (
    <Card className="p-6" data-testid="personal-appointments-calendar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Mes Rendez-vous
            </h3>
            <p className="text-sm text-gray-500">
              {userType === 'visitor' 
                ? 'Vos rendez-vous programmés avec les exposants'
                : 'Les rendez-vous que vous avez reçus'}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center space-x-2">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilter(status)}
              data-testid={`filter-${status}`}
            >
              {status === 'all' && 'Tous'}
              {status === 'pending' && 'En attente'}
              {status === 'confirmed' && 'Confirmés'}
              {status === 'cancelled' && 'Annulés'}
            </Button>
          ))}
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => {
            const newWeek = new Date(selectedWeek);
            newWeek.setDate(selectedWeek.getDate() - 7);
            setSelectedWeek(newWeek);
          }}
          data-testid="button-previous-week"
        >
          ← Semaine précédente
        </Button>
        
        <h4 className="text-lg font-semibold text-gray-900" data-testid="text-current-week">
          Semaine du {weekDays[0].toLocaleDateString('fr-FR')}
        </h4>
        
        <Button
          variant="ghost"
          onClick={() => {
            const newWeek = new Date(selectedWeek);
            newWeek.setDate(selectedWeek.getDate() + 7);
            setSelectedWeek(newWeek);
          }}
          data-testid="button-next-week"
        >
          Semaine suivante →
        </Button>
      </div>

      {/* Grille hebdomadaire */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day, index) => {
          // Filtrer les rendez-vous pour ce jour spécifique
          const dayAppointments = weekAppointments.filter(appointment => {
            const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
            if (!slot) return false;
            const slotDate = new Date(slot.date);
            return slotDate.toDateString() === day.toDateString();
          });
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div key={day.toISOString()} className="border rounded-lg p-3 min-h-[200px]">
              <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-xs text-gray-500 uppercase">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="space-y-2">
                {dayAppointments.length > 0 ? dayAppointments.map((appointment) => {
                  const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
                  const displayTime = slot ? slot.startTime : 'TBD';

                  return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 bg-gray-50 rounded-lg border text-xs"
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(appointment.meetingType)}
                        <span className="font-medium text-gray-900">
                          {displayTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(appointment.status)}
                        <Badge variant={getStatusColor(appointment.status)} size="sm">
                          {appointment.status === 'confirmed' && 'Confirmé'}
                          {appointment.status === 'pending' && 'En attente'}
                          {appointment.status === 'cancelled' && 'Annulé'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-gray-700 font-medium mb-1">
                      {getAppointmentTitle()}
                    </div>
                    
                    {appointment.meetingLink && (
                      <div className="text-gray-500 mb-2 truncate">
                        📍 {appointment.meetingLink}
                      </div>
                    )}
                    
                    {appointment.message && (
                      <div className="text-gray-600 mb-2 text-xs italic">
                        "{appointment.message}"
                      </div>
                    )}

                    {/* Actions selon le type d'utilisateur et le statut */}
                    <div className="flex space-x-1 mt-2">
                      {userType !== 'visitor' && appointment.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(appointment.id)}
                            className="flex-1 text-xs bg-green-600 hover:bg-green-700"
                            data-testid={`button-accept-${appointment.id}`}
                          >
                            Accepter
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReject(appointment.id)}
                            className="flex-1 text-xs text-red-600 hover:text-red-700"
                            data-testid={`button-reject-${appointment.id}`}
                          >
                            Refuser
                          </Button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCancel(appointment.id)}
                          className="w-full text-xs text-red-600 hover:text-red-700"
                          data-testid={`button-cancel-${appointment.id}`}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </motion.div>
                  );
                }) : (
                <div className="text-center text-gray-400 text-xs py-4">
                  Aucun RDV
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {getFilteredAppointments().filter(apt => apt.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-500">Confirmés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {getFilteredAppointments().filter(apt => apt.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-500">En attente</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {getFilteredAppointments().filter(apt => apt.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-500">Annulés</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {getFilteredAppointments().length}
          </div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
      </div>

      {getFilteredAppointments().length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' 
              ? 'Aucun rendez-vous programmé'
              : `Aucun rendez-vous ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmé' : 'annulé'}`
            }
          </h4>
          <p className="text-gray-500">
            {userType === 'visitor' 
              ? 'Parcourez la liste des exposants pour prendre vos premiers rendez-vous.'
              : 'Les visiteurs pourront prendre rendez-vous avec vous via vos créneaux de disponibilité.'}
          </p>
        </div>
      )}
    </Card>
  );
}