import { useState, useEffect } from 'react';
import { Calendar, Plus, Users, MapPin, Video, Globe, Save } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeSlot } from '../../types';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';
import { motion } from 'framer-motion';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
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

    setIsLoading(true);
    try {
      const duration = calculateDuration(newSlot.startTime, newSlot.endTime);
      const newTimeSlot = await SupabaseService.createTimeSlot({
        userId,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration,
        type: newSlot.type,
        maxBookings: newSlot.maxBookings,
        location: newSlot.location || undefined
      });

      toast.success('Créneau ajouté avec succès');
      setTimeSlots(prev => [...prev, newTimeSlot]);
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du créneau:', error);
      toast.error('Erreur lors de l\'ajout du créneau');
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
    setShowAddForm(false);
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

  const getTypeColor = (type: string): 'success' | 'info' | 'warning' | 'default' => {
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

  return (
    <Card className="p-6" data-testid="public-availability-calendar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Calendrier des Disponibilités
            </h3>
            <p className="text-sm text-gray-500">
              Gérez vos créneaux horaires publics pour les rendez-vous
            </p>
          </div>
        </div>
        
        {isEditable && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
            data-testid="button-add-availability"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un créneau</span>
          </Button>
        )}
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
          const daySlots = weekSlots.filter(slot => 
            new Date(slot.date).toDateString() === day.toDateString()
          );
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div key={index} className="border rounded-lg p-3">
              <div className={`text-center mb-2 pb-2 border-b ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-xs text-gray-500 uppercase">
                  {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div className={`text-lg font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {day.getDate()}
                </div>
              </div>
              
              <div className="space-y-1">
                {daySlots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 bg-gray-50 rounded text-xs"
                    data-testid={`slot-${slot.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(slot.type)}
                        <span className="font-medium">{slot.startTime}</span>
                      </div>
                      <Badge variant={getTypeColor(slot.type)} size="sm">
                        {slot.maxBookings - slot.currentBookings}/{slot.maxBookings}
                      </Badge>
                    </div>
                    {slot.location && (
                      <div className="text-gray-500 mt-1 truncate">
                        {slot.location}
                      </div>
                    )}
                    {isEditable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="w-full mt-1 text-red-600 hover:text-red-700"
                        data-testid={`button-delete-${slot.id}`}
                      >
                        Supprimer
                      </Button>
                    )}
                  </motion.div>
                ))}
                
                {daySlots.length === 0 && (
                  <div className="text-center text-gray-400 text-xs py-4">
                    Aucun créneau
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t pt-6"
        >
          <h4 className="text-lg font-semibold mb-4">Ajouter un nouveau créneau</h4>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input type="date"
                value={newSlot.date}
                onChange={(e) =
                      aria-label="Date"> setNewSlot({ ...newSlot, date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                data-testid="input-slot-date"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rencontre
              </label>
              <select value={newSlot.type}
                onChange={(e) =
                aria-label="Type"> setNewSlot({ ...newSlot, type: e.target.value as any })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                data-testid="select-slot-type"
              >
                <option value="in-person">Présentiel</option>
                <option value="virtual">Virtuel</option>
                <option value="hybrid">Hybride</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début
              </label>
              <input type="time"
                value={newSlot.startTime}
                onChange={(e) =
                      aria-label="Time"> setNewSlot({ ...newSlot, startTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                data-testid="input-start-time"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin
              </label>
              <input type="time"
                value={newSlot.endTime}
                onChange={(e) =
                      aria-label="Time"> setNewSlot({ ...newSlot, endTime: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                data-testid="input-end-time"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Places disponibles
              </label>
              <input type="number"
                min="1"
                max="20"
                value={newSlot.maxBookings}
                onChange={(e) =
                      aria-label="Number"> setNewSlot({ ...newSlot, maxBookings: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                data-testid="input-max-bookings"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lieu / Lien (optionnel)
            </label>
            <input type="text"
              value={newSlot.location}
              onChange={(e) =
                      aria-label="Text"> setNewSlot({ ...newSlot, location: e.target.value })}
              placeholder="Stand A12, Salle de réunion B, https://zoom.us/..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              data-testid="input-location"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea value={newSlot.description}
              onChange={(e) =
                  aria-label="Text area"> setNewSlot({ ...newSlot, description: e.target.value })}
              placeholder="Présentation produit, démonstration, discussion technique..."
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              data-testid="textarea-description"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleAddTimeSlot}
              disabled={isLoading}
              className="flex items-center space-x-2"
              data-testid="button-save-slot"
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? 'Ajout...' : 'Ajouter le créneau'}</span>
            </Button>
            
            <Button
              variant="ghost"
              onClick={resetForm}
              data-testid="button-cancel-slot"
            >
              Annuler
            </Button>
          </div>
        </motion.div>
      )}

      {/* Liste des créneaux */}
      {timeSlots.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Aucun créneau configuré
          </h4>
          <p className="text-gray-500 mb-4">
            Ajoutez vos premiers créneaux de disponibilité pour permettre aux visiteurs de prendre rendez-vous avec vous.
          </p>
          {isEditable && (
            <Button onClick={() => setShowAddForm(true)} data-testid="button-add-first-slot">
              Ajouter un créneau
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}