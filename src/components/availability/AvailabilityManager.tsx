
import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, X } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TimeSlot } from '../../types';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';

interface AvailabilityManagerProps {
  userId: string;
  userType: 'exhibitor' | 'partner';
  onAvailabilityUpdate?: (timeSlots: TimeSlot[]) => void;
}

export default function AvailabilityManager({ userId, userType, onAvailabilityUpdate }: AvailabilityManagerProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    startTime: '',
    endTime: '',
    type: 'in-person' as const,
    maxBookings: 5,
    location: ''
  });

  // Fetch time slots from Supabase for the current user
  useEffect(() => {
    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        const slots = await SupabaseService.getTimeSlotsByUser(userId);
        setTimeSlots(slots);
      } catch {
        toast.error('Erreur lors du chargement des créneaux');
      }
      setIsLoading(false);
    };
    fetchTimeSlots();
  }, [userId]);

  const handleAddTimeSlot = async () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    const startMinutes = timeToMinutes(newSlot.startTime);
    const endMinutes = timeToMinutes(newSlot.endTime);

    if (endMinutes <= startMinutes) {
      toast.error("L'heure de fin doit être après l'heure de début.");
      return;
    }

    // Check for overlapping time slots
    const newSlotStart = new Date(`${newSlot.date}T${newSlot.startTime}:00`);
    const newSlotEnd = new Date(`${newSlot.date}T${newSlot.endTime}:00`);

    const overlappingSlot = timeSlots.find(slot => {
      const existingSlotStart = new Date(`${slot.date}T${slot.startTime}:00`);
      const existingSlotEnd = new Date(`${slot.date}T${slot.endTime}:00`);

      return (
        (newSlotStart < existingSlotEnd && newSlotEnd > existingSlotStart)
      );
    });

    if (overlappingSlot) {
      toast.error("Ce créneau chevauche un créneau existant.");
      return;
    }
    setIsLoading(true);
    try {
      const newTimeSlot = await SupabaseService.createTimeSlot({
        userId,
        date: newSlot.date,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        duration: calculateDuration(newSlot.startTime, newSlot.endTime),
        type: newSlot.type,
        maxBookings: newSlot.maxBookings,
        location: newSlot.location || undefined
      });

      toast.success('Créneau ajouté avec succès');
      setTimeSlots(prev => [...prev, newTimeSlot]);
      onAvailabilityUpdate?.([...timeSlots, newTimeSlot]);
      setNewSlot({
        date: '',
        startTime: '',
        endTime: '',
        type: 'in-person',
        maxBookings: 5,
        location: ''
      });
      setShowAddForm(false);
    } catch {
      toast.error('Erreur lors de l\'ajout du créneau');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTimeSlot = async (slotId: string) => {
    setIsLoading(true);
    try {
      await SupabaseService.deleteTimeSlot(slotId);
      const updatedSlots = timeSlots.filter(slot => slot.id !== slotId);
      setTimeSlots(updatedSlots);
      onAvailabilityUpdate?.(updatedSlots);
      toast.success('Créneau supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return endMinutes - startMinutes;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'in-person': return 'bg-blue-100 text-blue-800';
      case 'virtual': return 'bg-green-100 text-green-800';
      case 'hybrid': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in-person': return 'Présentiel';
      case 'virtual': return 'Virtuel';
      case 'hybrid': return 'Hybride';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Mes Créneaux de Disponibilité
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Gérez vos créneaux horaires pour les rencontres {userType === 'partner' ? 'partenaires' : 'professionnelles'}
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un créneau
        </Button>
      </div>

      {/* Add Time Slot Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Nouveau créneau</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input type="date"
                value={newSlot.date}
                onChange={(e) =
                      aria-label="Date"> setNewSlot({...newSlot, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rencontre
              </label>
              <select value={newSlot.type}
                onChange={(e) =
                aria-label="Type"> setNewSlot({...newSlot, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in-person">Présentiel</option>
                <option value="virtual">Virtuel</option>
                <option value="hybrid">Hybride</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de début *
              </label>
              <input type="time"
                value={newSlot.startTime}
                onChange={(e) =
                      aria-label="Time"> setNewSlot({...newSlot, startTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Heure de fin *
              </label>
              <input type="time"
                value={newSlot.endTime}
                onChange={(e) =
                      aria-label="Time"> setNewSlot({...newSlot, endTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre max de RDV
              </label>
              <input type="number"
                value={newSlot.maxBookings}
                onChange={(e) =
                      aria-label="Number"> setNewSlot({...newSlot, maxBookings: parseInt(e.target.value)})}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu (optionnel)
              </label>
              <input type="text"
                value={newSlot.location}
                onChange={(e) =
                      aria-label="Text"> setNewSlot({...newSlot, location: e.target.value})}
                placeholder="Stand A-12, Zoom, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddTimeSlot}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? <span className="animate-spin">⚙️</span> : <Save className="h-4 w-4 mr-2" />}
              {isLoading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </Card>
      )}

      {/* Time Slots List */}
      <div className="space-y-4">
        {timeSlots.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Aucun créneau défini
            </h4>
            <p className="text-gray-600 mb-4">
              Créez vos premiers créneaux de disponibilité pour permettre aux autres participants de prendre rendez-vous avec vous.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier créneau
            </Button>
          </Card>
        ) : (
          timeSlots.map((slot) => (
            <Card key={slot.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">
                        {formatDate(slot.date)}
                      </span>
                      <Badge className={getTypeColor(slot.type)}>
                        {getTypeLabel(slot.type)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime} ({slot.duration} min)
                      {slot.location && ` • ${slot.location}`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {slot.currentBookings}/{slot.maxBookings} RDV réservés
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge variant={slot.available ? 'success' : 'error'}>
                    {slot.available ? 'Disponible' : 'Complet'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isLoading}
                  >
                    {isLoading ? <span className="animate-spin">⚙️</span> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Section */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Gestion des créneaux obligatoire
            </h4>
            <p className="text-sm text-blue-700">
              En tant qu'{userType === 'partner' ? 'partenaire' : 'exposant'}, vous devez définir vos créneaux de disponibilité
              pour permettre aux autres participants de prendre rendez-vous. Ces créneaux apparaîtront dans votre profil
              et seront visibles lors des recommandations IA.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
