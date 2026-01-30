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
import { getMinSlotDate, getMaxSlotDate } from '../../config/salonInfo';

interface PublicAvailabilityCalendarProps {
  userId: string;
  isEditable?: boolean;
  standalone?: boolean;
}

export default function PublicAvailabilityCalendar({
  userId,
  isEditable = true,
  standalone = true
}: PublicAvailabilityCalendarProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date(`${getMinSlotDate()}T00:00:00`));
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: getMinSlotDate(),
    startTime: '',
    endTime: '',
    type: 'in-person' as const,
    maxBookings: 5,
    location: '',
    description: ''
  });

  // Helper pour parser une date string (YYYY-MM-DD) en Date locale sans décalage UTC
  const parseLocalDate = (dateStr: string | Date): Date => {
    if (dateStr instanceof Date) return dateStr;
    // Format YYYY-MM-DD -> créer une date à minuit heure locale
    const [year, month, day] = String(dateStr).split('T')[0].split('-').map(Number);
    return new Date(year, month - 1, day);
  };

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
    console.log('🔵 handleAddTimeSlot appelé', { newSlot, isLoading });
    
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Veuillez remplir tous les champs requis');
      console.log('❌ Champs manquants:', { date: newSlot.date, startTime: newSlot.startTime, endTime: newSlot.endTime });
      return;
    }

    // Validation: date ne doit pas être dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(newSlot.date + 'T00:00:00'); // Force local timezone
    if (slotDate < today) {
      toast.error('❌ Impossible de créer un créneau pour une date passée');
      return;
    }

    // Validation: startTime < endTime
    if (newSlot.startTime >= newSlot.endTime) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    console.log('✅ Validation passée, création du créneau...');
    setIsLoading(true);
    try {
      const duration = calculateDuration(newSlot.startTime, newSlot.endTime);

      // Normaliser les dates pour comparaison (format YYYY-MM-DD) - SANS conversion UTC
      const normalizeDate = (date: string | Date): string => {
        if (date instanceof Date) {
          // Utiliser getFullYear/Month/Date pour éviter le décalage UTC
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
        // Pour une string, prendre juste la partie date (YYYY-MM-DD)
        return String(date).split('T')[0];
      };

      const newSlotDate = normalizeDate(newSlot.date);

      // Note: On permet les créneaux identiques (mêmes horaires) car plusieurs personnes
      // peuvent recevoir simultanément au même stand
      // Pas de validation de chevauchement ou duplication

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
      date: '2026-04-01',
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

  const weekDays = [
    new Date('2026-04-01T00:00:00'),
    new Date('2026-04-02T00:00:00'),
    new Date('2026-04-03T00:00:00')
  ];
  const weekSlots = timeSlots.filter(slot => {
    const slotDate = parseLocalDate(slot.date);
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
      {/* Header - Masqué si non standalone */}
      {standalone && (
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
      )}

      {/* Navigation & Vue */}
      {/* Navigation - LIMITÉ AUX JOURS DE L'ÉVÉNEMENT */}
      <Card className="p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 p-8 text-white relative">
          {/* Motif Marocain Subtil */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <div className="text-center">
                  <span className="block text-2xl font-black text-blue-400 leading-none">01-03</span>
                  <span className="block text-xs font-bold uppercase tracking-widest text-white/60 mt-1">AVRIL</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white mb-1">
                  Planning SIPORTS 2026
                </h3>
                <div className="flex items-center space-x-2 text-blue-200/80">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                  <p className="text-sm font-medium">Disponibilités pour les 3 jours de l'événement</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-3">
              {/* Bouton Ajouter Créneau - Toujours visible si editable */}
              {isEditable && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-2.5 font-bold shadow-lg shadow-emerald-900/30 hover:shadow-xl transition-all duration-200 border border-white/20"
                  data-testid="button-add-slot-header"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau Créneau
                </Button>
              )}
              
              <Badge variant="info" className="px-4 py-1.5 text-xs font-bold bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm uppercase tracking-wider">
                Événement Exclusif
              </Badge>
              
              {/* Toggle Vue */}
              <div className="flex items-center space-x-1 bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    viewMode === 'week'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-tight">Grille</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-tight">Liste</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
        {/* Vue Hebdomadaire */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weekDays.map((day) => {
              const daySlots = weekSlots.filter(slot =>
                parseLocalDate(slot.date).toDateString() === day.toDateString()
              );
              const isToday = day.toDateString() === new Date().toDateString();
              const isPast = day < new Date() && !isToday;

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`group rounded-2xl border-2 transition-all duration-300 flex flex-col overflow-hidden ${
                    isToday
                      ? 'border-blue-500 bg-blue-50/30'
                      : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-xl'
                  }`}
                >
                  {/* En-tête jour */}
                  <div className={`p-5 relative ${
                    isToday ? 'bg-blue-600' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <div className={`text-xs font-black uppercase tracking-widest mb-1 ${
                          isToday ? 'text-blue-200' : 'text-gray-400'
                        }`}>
                          {day.toLocaleDateString('fr-FR', { weekday: 'long' })}
                        </div>
                        <div className={`text-3xl font-black ${
                          isToday ? 'text-white' : 'text-gray-900'
                        }`}>
                          {day.getDate()} <span className="text-sm font-bold opacity-60">Avril</span>
                        </div>
                      </div>
                      <div className={`p-2.5 rounded-xl ${isToday ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                        <Calendar className={`w-6 h-6 ${isToday ? 'text-white' : 'text-blue-600'}`} />
                      </div>
                    </div>
                  </div>

                  {/* Créneaux du jour */}
                  <div className="p-4 space-y-3 flex-1 min-h-[300px] bg-gradient-to-b from-transparent to-gray-50/50 pb-20">
                    <AnimatePresence mode="popLayout">
                      {daySlots.map((slot) => (
                        <motion.div
                          key={slot.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 border-white overflow-hidden relative group/slot ${
                            slot.type === 'virtual' ? 'bg-blue-600 text-white' : 
                            slot.type === 'in-person' ? 'bg-emerald-600 text-white' : 
                            'bg-amber-500 text-white'
                          }`}
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowAddModal(true);
                          }}
                        >
                          {/* Overlay effet glass */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full transform translate-x-4 -translate-y-4 transition-transform group-hover/slot:translate-x-2 group-hover/slot:-translate-y-2"></div>

                          <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-white/20 rounded-lg">
                                {getTypeIcon(slot.type)}
                              </div>
                              <span className="font-black text-base">
                                {slot.startTime}
                              </span>
                            </div>
                            <div className="px-2 py-1 bg-white/20 rounded-md text-[10px] font-black uppercase tracking-tighter">
                              {slot.maxBookings - slot.currentBookings} Libres
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-medium text-white/90 mb-3 ml-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{slot.location || 'Lieu SIPORT'}</span>
                          </div>

                          {isEditable && (
                            <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-white/10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSlot(slot.id);
                                }}
                                className="flex items-center justify-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg py-1.5 px-3 text-[10px] font-bold transition-colors w-full uppercase tracking-widest"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Retirer</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Message si aucun créneau */}
                    {daySlots.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 border-2 border-dashed border-gray-200 group-hover:border-blue-200 transition-colors">
                          <Clock className="w-8 h-8 text-gray-300 group-hover:text-blue-300 transition-all group-hover:scale-110" />
                        </div>
                        <p className="text-gray-500 font-bold text-sm mb-1 uppercase tracking-tight">Aucun créneau</p>
                        <p className="text-gray-400 text-xs mb-6">Planifiez vos disponibilités pour ce jour</p>
                      </div>
                    )}

                    {/* Bouton Ajouter - Toujours visible si éditable */}
                    {isEditable && (
                      <div className={`flex justify-center pb-4 ${daySlots.length > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}`}>
                        <button
                          onClick={() => {
                            setNewSlot({ ...newSlot, date: formatDateForInput(day) });
                            setShowAddModal(true);
                          }}
                          className="flex items-center space-x-2 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-500 px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm hover:shadow-md uppercase tracking-wider"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ajouter</span>
                        </button>
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
          <div className="space-y-4">
            {weekSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">
                  Aucun créneau configuré
                </h4>
                <p className="text-gray-500 mb-8 max-w-sm text-center">
                  Vous n'avez pas encore défini de disponibilités pour les 3 jours du salon SIPORT.
                </p>
                {isEditable && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Créer mon premier créneau
                  </Button>
                )}
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
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="group flex items-center justify-between p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-6 flex-1">
                      <div className={`p-4 rounded-2xl shadow-lg transform group-hover:scale-110 transition-transform ${
                        slot.type === 'virtual' ? 'bg-blue-600 text-white' : 
                        slot.type === 'in-person' ? 'bg-emerald-600 text-white' : 
                        'bg-amber-500 text-white shadow-amber-100'
                      }`}>
                        {getTypeIcon(slot.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-black text-xl text-gray-900 uppercase tracking-tight">
                            {parseLocalDate(slot.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long'
                            })}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            slot.type === 'virtual' ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                            slot.type === 'in-person' ? 'border-emerald-200 text-emerald-600 bg-emerald-50' : 
                            'border-amber-200 text-amber-600 bg-amber-50'
                          }`}>
                            {slot.type === 'virtual' ? 'Virtuel' : slot.type === 'in-person' ? 'Présentiel' : 'Hybride'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 font-bold">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-900">{slot.startTime} - {slot.endTime}</span>
                          </div>
                          {slot.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-emerald-500" />
                              <span className="text-gray-900">{slot.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right pr-6 border-r-2 border-gray-50 mr-6">
                        <div className="text-3xl font-black text-gray-900">
                          {slot.maxBookings - slot.currentBookings}
                        </div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                          places disponibles
                        </div>
                      </div>
                    </div>

                    {isEditable && (
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setSelectedSlot(slot);
                            setShowAddModal(true);
                          }}
                          className="p-2.5 bg-gray-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2.5 bg-gray-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))
            )}
          </div>
        )}
        </div>
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

      {/* Bouton flottant pour ajouter un créneau - Visible quand il y a déjà des créneaux */}
      {isEditable && timeSlots.length > 0 && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 group"
          data-testid="button-add-slot-floating"
          title="Ajouter un nouveau créneau"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        </button>
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
                      min={getMinSlotDate()}
                      max={getMaxSlotDate()}
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
