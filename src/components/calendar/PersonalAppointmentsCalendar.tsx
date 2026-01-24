import { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Video, Globe, CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight, Sparkles, CalendarDays, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Appointment } from '../../types';
import { useAppointmentStore } from '../../store/appointmentStore';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
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

  const [selectedWeek, setSelectedWeek] = useState(new Date('2026-04-01T00:00:00'));
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
    return [
      new Date('2026-04-01T00:00:00'),
      new Date('2026-04-02T00:00:00'),
      new Date('2026-04-03T00:00:00')
    ];
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6" data-testid="personal-appointments-calendar">
      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 mb-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <CalendarDays className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                Mes Rendez-vous B2B
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </h1>
              <p className="text-white/80 text-lg">
                {userType === 'visitor' 
                  ? '🎯 Vos rendez-vous programmés avec les exposants'
                  : '📩 Les rendez-vous que vous avez reçus'}
              </p>
            </div>
          </div>

          {/* Stats rapides dans le header */}
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <div className="text-3xl font-bold text-white">{getFilteredAppointments().length}</div>
              <div className="text-white/70 text-sm">Total</div>
            </div>
            <div className="bg-green-400/30 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <div className="text-3xl font-bold text-white">{getFilteredAppointments().filter(apt => apt.status === 'confirmed').length}</div>
              <div className="text-white/70 text-sm">Confirmés</div>
            </div>
            <div className="bg-yellow-400/30 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
              <div className="text-3xl font-bold text-white">{getFilteredAppointments().filter(apt => apt.status === 'pending').length}</div>
              <div className="text-white/70 text-sm">En attente</div>
            </div>
          </div>
        </div>
      </motion.div>

      <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        {/* Filtres avec design moderne */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Filtrer par :</span>
            <div className="flex items-center p-1 bg-gray-100 rounded-xl">
              {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    filter === status 
                      ? status === 'confirmed' ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                      : status === 'pending' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-200'
                      : status === 'cancelled' ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                  }`}
                  data-testid={`filter-${status}`}
                >
                  {status === 'all' && '📋 Tous'}
                  {status === 'pending' && '⏳ En attente'}
                  {status === 'confirmed' && '✅ Confirmés'}
                  {status === 'cancelled' && '❌ Annulés'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Titre du planning spécifique à l'événement */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-900" data-testid="text-current-week">
                Planning de l'Événement (1-3 Avril 2026)
              </h4>
              <p className="text-sm text-gray-500">Salon International des Ports et de la Logistique</p>
            </div>
          </div>
        </motion.div>

        {/* Grille hebdomadaire améliorée - Adaptée pour 3 jours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {weekDays.map((day, index) => {
            const dayAppointments = weekAppointments.filter(appointment => {
              const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
              if (!slot) return false;
              const slotDate = new Date(slot.date);
              return slotDate.toDateString() === day.toDateString();
            });
            const isToday = day.toDateString() === new Date().toDateString();
            const hasAppointments = dayAppointments.length > 0;

            return (
              <motion.div 
                key={day.toISOString()} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex flex-col h-full min-h-[280px] rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                  isToday 
                    ? 'border-indigo-400 bg-gradient-to-b from-indigo-50 to-white shadow-lg shadow-indigo-100' 
                    : hasAppointments
                      ? 'border-green-200 bg-gradient-to-b from-green-50/50 to-white hover:shadow-md'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                {/* Header du jour */}
                <div className={`text-center p-4 ${
                  isToday 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                    : hasAppointments 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                      : 'bg-gray-50'
                }`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                    isToday || hasAppointments ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </div>
                  <div className={`text-3xl font-bold ${
                    isToday || hasAppointments ? 'text-white' : 'text-gray-700'
                  }`}>
                    {day.getDate()}
                  </div>
                  {isToday && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                      Aujourd'hui
                    </span>
                  )}
                </div>

                {/* Liste des RDV */}
                <div className="p-3 space-y-2 flex-1 overflow-y-auto">
                  <AnimatePresence>
                    {dayAppointments.length > 0 ? dayAppointments.map((appointment, aptIndex) => {
                      const slot = timeSlots.find(s => s.id === appointment.timeSlotId);
                      const displayTime = slot ? slot.startTime : 'TBD';

                      return (
                        <motion.div
                          key={appointment.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: aptIndex * 0.1 }}
                          className={`p-3 rounded-xl border-2 shadow-sm bg-white group hover:shadow-lg transition-all cursor-pointer ${
                            appointment.status === 'confirmed' ? 'border-green-300 hover:border-green-400' :
                            appointment.status === 'pending' ? 'border-yellow-300 hover:border-yellow-400' :
                            appointment.status === 'cancelled' ? 'border-red-300 hover:border-red-400' : 'border-gray-200'
                          }`}
                          data-testid={`appointment-${appointment.id}`}
                        >
                          {/* Badge de statut */}
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold mb-2 ${
                            appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status === 'confirmed' ? 'Confirmé' : 
                             appointment.status === 'pending' ? 'En attente' : 'Annulé'}
                          </div>

                          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm mb-1">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            <span>{displayTime}</span>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {getAppointmentTitle()}
                          </div>
                          
                          {appointment.meetingLink && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                              <Video className="w-3 h-3" />
                              <span>Lien visio disponible</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-3 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                            {userType !== 'visitor' && appointment.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAccept(appointment.id)}
                                  className="flex-1 p-2 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                  title="Accepter"
                                >
                                  ✓ Accepter
                                </button>
                                <button
                                  onClick={() => handleReject(appointment.id)}
                                  className="flex-1 p-2 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                  title="Refuser"
                                >
                                  ✗ Refuser
                                </button>
                              </>
                            )}
                            
                            {appointment.status === 'confirmed' && (
                              <button
                                onClick={() => handleCancel(appointment.id)}
                                className="w-full p-2 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                title="Annuler"
                              >
                                Annuler ce RDV
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <Calendar className="w-5 h-5 text-gray-300" />
                        </div>
                        <span className="text-xs font-medium">Libre</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Message vide amélioré */}
        {getFilteredAppointments().length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-2xl border-2 border-dashed border-indigo-200"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="bg-gradient-to-br from-indigo-100 to-purple-100 p-6 rounded-full inline-block shadow-lg mb-6"
            >
              <CalendarDays className="w-12 h-12 text-indigo-500" />
            </motion.div>
            <h4 className="text-2xl font-bold text-gray-900 mb-3">
              {filter === 'all' 
                ? '📅 Aucun rendez-vous programmé'
                : `Aucun rendez-vous ${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmé' : 'annulé'}`
              }
            </h4>
            <p className="text-gray-500 max-w-md mx-auto text-lg">
              {userType === 'visitor' 
                ? '🔍 Parcourez la liste des exposants pour prendre vos premiers rendez-vous B2B.'
                : '⏰ Les visiteurs pourront prendre rendez-vous avec vous via vos créneaux de disponibilité.'}
            </p>
          </motion.div>
        )}
      </Card>
    </div>
  );
}