import { useState, useEffect } from 'react';
import {
  Calendar, Plus, Users, MapPin, Video, Globe, Save, X,
  Clock, Trash2, Edit, ChevronLeft, ChevronRight, Grid3x3, List
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeSlot } from '../../types';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { motion, AnimatePresence } from 'framer-motion';

interface PublicAvailabilityCalendarProps {
  userId: string;
  isEditable?: boolean;
}

export default function PublicAvailabilityCalendar({
  userId,
  isEditable = true
}: PublicAvailabilityCalendarProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'in-person' as const,
    maxBookings: 5,
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchTimeSlots();
  }, [userId]);

  const fetchTimeSlots = async () => {
    setIsLoading(true);
    try {
      const slots = await SupabaseService.getTimeSlotsByUser(userId);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      toast.error('Erreur lors du chargement des créneaux');
    }
    setIsLoading(false);
  };

  const handleAddTimeSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    // Validation: startTime < endTime
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    setIsLoading(true);
    try {
      const duration = calculateDuration(newSlot.startTime, newSlot.endTime);

      // Vérifier les créneaux qui se chevauchent
      const overlapping = timeSlots.find(slot =>
        slot.date === newSlot.date && (
          (newSlot.startTime >= slot.startTime && newSlot.startTime < slot.endTime) ||
          (newSlot.endTime > slot.startTime && newSlot.endTime <= slot.endTime) ||
          (newSlot.startTime <= slot.startTime && newSlot.endTime >= slot.endTime)
        )
      );

      if (overlapping) {
        toast.error('Ce créneau chevauche un créneau existant');
        setIsLoading(false);
        return;
      }

      const newTimeSlot = await SupabaseService.createTimeSlot({
        userId,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration,
        type: newSlot.type,
        maxBookings: newSlot.maxBookings || 1, // Valeur par défaut
        location: newSlot.location || undefined
      });

      toast.success('✅ Créneau ajouté avec succès');
      setTimeSlots(prev => [...prev, newTimeSlot]);
      resetForm();
      setShowAddModal(false);
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du créneau:', error);

      // Gestion spécifique erreur 409 (conflit)
      if (error?.code === '409' || error?.message?.includes('409')) {
        toast.error('Ce créneau existe déjà à cette date et heure');
      } else {
        toast.error('Erreur lors de l\'ajout du créneau');
      }
    }
    setIsLoading(false);
  };

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.abs(end.getTime() - start.getTime()) / (1000 * 60);
  };

  const resetForm = () => {
    setNewSlot({
      date: '',
      startTime: '',
      endTime: '',
      type: 'in-person',
      maxBookings: 5,
      location: '',
      description: ''
    });
    setSelectedSlot(null);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return;

    try {
      await SupabaseService.deleteTimeSlot(slotId);
      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
      toast.success('Créneau supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'virtual': return <Video className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      case 'hybrid': return <Globe className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'virtual': return 'from-blue-500 to-blue-600';
      case 'in-person': return 'from-green-500 to-green-600';
      case 'hybrid': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeBadgeColor = (type: string): 'success' | 'info' | 'warning' | 'default' => {
    switch (type) {
      case 'virtual': return 'info';
      case 'in-person': return 'success';
      case 'hybrid': return 'warning';
      default: return 'default';
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
  const weekSlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    return weekDays.some(day =>
      day.toDateString() === slotDate.toDateString()
    );
  });

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
        <div className="p-8 relative">
          {/* Motif décoratif */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <Calendar className="w-full h-full" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 backdrop-blur-lg rounded-2xl">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Gestion des Disponibilités
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Créez et gérez vos créneaux de rendez-vous pour SIPORT 2026
                  </p>
                </div>
              </div>

              {isEditable && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  data-testid="button-add-availability"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nouveau Créneau
                </Button>
              )}
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-blue-100 text-sm mb-1">Total créneaux</div>
                <div className="text-3xl font-bold">{timeSlots.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-blue-100 text-sm mb-1">Cette semaine</div>
                <div className="text-3xl font-bold">{weekSlots.length}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
                <div className="text-blue-100 text-sm mb-1">Places disponibles</div>
                <div className="text-3xl font-bold">
                  {timeSlots.reduce((sum, slot) => sum + (slot.maxBookings - slot.currentBookings), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation & Vue */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          {/* Navigation semaine */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => {
                const newWeek = new Date(selectedWeek);
                newWeek.setDate(selectedWeek.getDate() - 7);
                setSelectedWeek(newWeek);
              }}
              className="hover:bg-blue-50 text-blue-600"
              data-testid="button-previous-week"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Semaine du</div>
              <h3 className="text-xl font-bold text-gray-900" data-testid="text-current-week">
                {weekDays[0].toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <Button
              variant="ghost"
              onClick={() => {
                const newWeek = new Date(selectedWeek);
                newWeek.setDate(selectedWeek.getDate() + 7);
                setSelectedWeek(newWeek);
              }}
              className="hover:bg-blue-50 text-blue-600"
              data-testid="button-next-week"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => setSelectedWeek(new Date())}
              className="ml-4 text-blue-600 hover:bg-blue-50"
            >
              Aujourd'hui
            </Button>
          </div>

          {/* Toggle Vue */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-white shadow text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white shadow text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vue Hebdomadaire */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day) => {
              const daySlots = weekSlots.filter(slot =>
                new Date(slot.date).toDateString() === day.toDateString()
              );
              const isToday = day.toDateString() === new Date().toDateString();
              const isPast = day < new Date() && !isToday;

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border-2 transition-all duration-200 ${
                    isToday
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : isPast
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* En-tête jour */}
                  <div className={`p-4 border-b-2 ${
                    isToday ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600' : 'border-gray-200'
                  }`}>
                    <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                      isToday ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isToday ? 'text-white' : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Créneaux du jour */}
                  <div className="p-3 space-y-2 min-h-[200px]">
                    <AnimatePresence>
                      {daySlots.map((slot) => (
                        <motion.div
                          key={slot.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`p-3 rounded-lg bg-gradient-to-br ${getTypeColor(slot.type)} text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer`}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowAddModal(true);
                          }}
                          data-testid={`slot-${slot.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(slot.type)}
                              <span className="font-bold text-sm">
                                {slot.startTime}
                              </span>
                            </div>
                            <Badge
                              variant="default"
                              className="bg-white/20 text-white border-0"
                              size="sm"
                            >
                              {slot.maxBookings - slot.currentBookings}/{slot.maxBookings}
                            </Badge>
                          </div>

                          <div className="text-xs opacity-90 truncate">
                            {slot.location || 'Lieu non spécifié'}
                          </div>

                          {isEditable && (
                            <div className="flex items-center space-x-1 mt-2 pt-2 border-t border-white/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(slot.id);
                                }}
                                className="flex-1 text-white hover:bg-white/20 text-xs py-1"
                                data-testid={`button-delete-${slot.id}`}
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Supprimer
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {daySlots.length === 0 && (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm py-8">
                        <div className="text-center">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <div>Aucun créneau</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Vue Liste */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {weekSlots.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun créneau cette semaine
                </h4>
                <p className="text-gray-500">
                  Ajoutez vos créneaux de disponibilité pour cette semaine
                </p>
              </div>
            ) : (
              weekSlots
                .sort((a, b) => {
                  const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
                  if (dateCompare !== 0) return dateCompare;
                  return a.startTime.localeCompare(b.startTime);
                })
                .map((slot) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${getTypeColor(slot.type)} text-white`}>
                        {getTypeIcon(slot.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-bold text-lg text-gray-900">
                            {new Date(slot.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                          <Badge variant={getTypeBadgeColor(slot.type)}>
                            {slot.type === 'virtual' ? 'Virtuel' : slot.type === 'in-person' ? 'Présentiel' : 'Hybride'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                          {slot.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{slot.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {slot.maxBookings - slot.currentBookings}
                        </div>
                        <div className="text-xs text-gray-500">
                          places restantes
                        </div>
                      </div>
                    </div>

                    {isEditable && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowAddModal(true);
                          }}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:bg-red-50"
                          data-testid={`button-delete-${slot.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))
            )}
          </div>
        )}
      </Card>

      {/* Message si aucun créneau */}
      {timeSlots.length === 0 && !isLoading && (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            Aucune disponibilité configurée
          </h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Commencez par ajouter vos créneaux de disponibilité pour permettre aux visiteurs de prendre rendez-vous avec vous pendant SIPORT 2026.
          </p>
          {isEditable && (
            <Button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 text-lg"
              data-testid="button-add-first-slot"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer mon premier créneau
            </Button>
          )}
        </Card>
      )}

      {/* Modal Ajout/Édition */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header Modal */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      {selectedSlot ? 'Modifier le créneau' : 'Nouveau créneau'}
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Body Modal */}
              <div className="p-6 space-y-6">
                {/* Date et Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Date du créneau *
                    </label>
                    <input
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      min={formatDateForInput(new Date())}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      data-testid="input-slot-date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📍 Type de rencontre *
                    </label>
                    <select
                      value={newSlot.type}
                      onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value as any })}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      data-testid="select-slot-type"
                    >
                      <option value="in-person">🏢 Présentiel</option>
                      <option value="virtual">💻 Virtuel</option>
                      <option value="hybrid">🔄 Hybride</option>
                    </select>
                  </div>
                </div>

                {/* Horaires */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏰ Heure de début *
                    </label>
                    <input
                      type="time"
                      value={newSlot.startTime}
                      onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      data-testid="input-start-time"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏱️ Heure de fin *
                    </label>
                    <input
                      type="time"
                      value={newSlot.endTime}
                      onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      data-testid="input-end-time"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👥 Participants max *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={newSlot.maxBookings || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Gestion du NaN - utiliser une string vide si invalide
                        setNewSlot({
                          ...newSlot,
                          maxBookings: value ? parseInt(value, 10) : 1
                        });
                      }}
                      placeholder="5"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      data-testid="input-max-bookings"
                    />
                  </div>
                </div>

                {/* Lieu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏛️ Lieu / Lien visioconférence
                  </label>
                  <input
                    type="text"
                    value={newSlot.location}
                    onChange={(e) => setNewSlot({ ...newSlot, location: e.target.value })}
                    placeholder="Stand A12, Salle B, https://meet.google.com/..."
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    data-testid="input-location"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pour les RDV virtuels, indiquez le lien de visioconférence
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Description (optionnel)
                  </label>
                  <textarea
                    value={newSlot.description}
                    onChange={(e) => setNewSlot({ ...newSlot, description: e.target.value })}
                    placeholder="Sujet du rendez-vous, agenda, préparation nécessaire..."
                    rows={4}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    data-testid="textarea-description"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t">
                  <Button
                    onClick={handleAddTimeSlot}
                    disabled={isLoading || !newSlot.date || !newSlot.startTime || !newSlot.endTime}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold"
                    data-testid="button-save-slot"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        {selectedSlot ? 'Modifier' : 'Créer le créneau'}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-lg"
                    data-testid="button-cancel-slot"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
