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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Mes Rendez-vous
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {userType === 'visitor' 
                ? 'Vos rendez-vous programmés avec les exposants'
                : 'Les rendez-vous que vous avez reçus'}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center p-1 bg-gray-100 rounded-lg">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                filter === status 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              data-testid={`filter-${status}`}
            >
              {status === 'all' && 'Tous'}
              {status === 'pending' && 'En attente'}
              {status === 'confirmed' && 'Confirmés'}
              {status === 'cancelled' && 'Annulés'}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between mb-6 bg-gray-50 p-4 rounded-xl">
        <Button
          variant="ghost"
          onClick={() => {
            const newWeek = new Date(selectedWeek);
            newWeek.setDate(selectedWeek.getDate() - 7);
            setSelectedWeek(newWeek);
          }}
          className="hover:bg-white hover:shadow-sm"
          data-testid="button-previous-week"
        >
          ← Semaine précédente
        </Button>
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <h4 className="text-lg font-semibold text-gray-900" data-testid="text-current-week">
            Semaine du {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h4>
        </div>
        
        <Button
          variant="ghost"
          onClick={() => {
            const newWeek = new Date(selectedWeek);
            newWeek.setDate(selectedWeek.getDate() + 7);
            setSelectedWeek(newWeek);
          }}
          className="hover:bg-white hover:shadow-sm"
          data-testid="button-next-week"
        >
          Semaine suivante →
        </Button>
      </div>

      {/* Grille hebdomadaire */}
      <div className="grid grid-cols-7 gap-4 mb-8">
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
            <div key={day.toISOString()} className={`flex flex-col h-full min-h-[250px] rounded-xl border transition-colors ${isToday ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
              <div className={`text-center p-3 border-b ${isToday ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} rounded-t-xl`}>
                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-2xl font-bold ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
              </div>

              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {dayAppointments.length > 0 ? dayAppointments.map((appointment) => {
                  const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
                  const displayTime = slot ? slot.startTime : 'TBD';

                  return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg border shadow-sm bg-white group hover:shadow-md transition-all ${
                      appointment.status === 'confirmed' ? 'border-l-4 border-l-green-500' :
                      appointment.status === 'pending' ? 'border-l-4 border-l-yellow-500' :
                      appointment.status === 'cancelled' ? 'border-l-4 border-l-red-500' : ''
                    }`}
                    data-testid={`appointment-${appointment.id}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-1.5 text-gray-900 font-bold text-sm">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{displayTime}</span>
                      </div>
                      {getTypeIcon(appointment.meetingType)}
                    </div>
                    
                    <div className="text-xs font-medium text-gray-600 mb-2 line-clamp-2">
                      {getAppointmentTitle()}
                    </div>
                    
                    {appointment.meetingLink && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 mb-2 bg-blue-50 p-1.5 rounded">
                        <Video className="w-3 h-3" />
                        <span className="truncate">Lien visio</span>
                      </div>
                    )}

                    {/* Actions compactes */}
                    <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {userType !== 'visitor' && appointment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAccept(appointment.id)}
                            className="flex-1 p-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Accepter"
                          >
                            <CheckCircle className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => handleReject(appointment.id)}
                            className="flex-1 p-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4 mx-auto" />
                          </button>
                        </>
                      )}
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          className="w-full p-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100"
                          title="Annuler"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </motion.div>
                  );
                }) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs py-8 opacity-50">
                  <div className="w-1 h-1 bg-gray-300 rounded-full mb-2"></div>
                  Aucun RDV
                </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-800">Confirmés</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-700">
            {getFilteredAppointments().filter(apt => apt.status === 'confirmed').length}
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-yellow-800">En attente</span>
            <AlertCircle className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-yellow-700">
            {getFilteredAppointments().filter(apt => apt.status === 'pending').length}
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800">Annulés</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-700">
            {getFilteredAppointments().filter(apt => apt.status === 'cancelled').length}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">Total</span>
            <Calendar className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {getFilteredAppointments().length}
          </div>
        </div>
      </div>

      {getFilteredAppointments().length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-8">
          <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' 
              ? 'Aucun rendez-vous programmé'
              : `Aucun rendez-vous ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmé' : 'annulé'}`
            }
          </h4>
          <p className="text-gray-500 max-w-md mx-auto">
            {userType === 'visitor' 
              ? 'Parcourez la liste des exposants pour prendre vos premiers rendez-vous.'
              : 'Les visiteurs pourront prendre rendez-vous avec vous via vos créneaux de disponibilité.'}
          </p>
        </div>
      )}
    </Card>
  );
}