import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';
import { Badge } from '@/components/ui/Badge';
import useAuthStore from '@/store/authStore';
import AvailabilityManager from '@/components/availability/AvailabilityManager';
import { useAppointmentStore } from '@/store/appointmentStore';
import { toast } from 'sonner';
import { 
  Calendar, Clock, Users, BarChart3, PieChart, Activity, 
  CheckCircle, XCircle, AlertCircle, ChevronLeft, ChevronRight,
  LayoutDashboard, CalendarDays, MessageSquare, Download, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AvailabilitySettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { appointments, timeSlots, fetchAppointments, fetchTimeSlots } = useAppointmentStore();
  const [activeTab, setActiveTab] = useState<'availability' | 'appointments' | 'analytics'>('availability');
  const [currentWeek, setCurrentWeek] = useState(new Date(2025, 11, 29)); // Start week of Dec 29, 2025 as per request

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchTimeSlots(user.id);
    }
  }, [user, fetchAppointments, fetchTimeSlots]);

  if (!user) return null;

  // Stats for Availability
  const totalSlots = timeSlots.length;
  const thisWeekSlots = timeSlots.filter(slot => {
    const slotDate = new Date(slot.date);
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 6);
    return slotDate >= weekStart && slotDate <= weekEnd;
  }).length;
  const availableSlots = timeSlots.filter(slot => slot.currentBookings < slot.maxBookings).length;

  // Stats for Appointments
  const confirmedApps = appointments.filter(a => a.status === 'confirmed').length;
  const pendingApps = appointments.filter(a => a.status === 'pending').length;
  const cancelledApps = appointments.filter(a => a.status === 'cancelled').length;
  const totalApps = appointments.length;

  // Mock Data for Analytics (as per request visual)
  const engagementData = [
    { name: 'Lun', visits: 0, interactions: 0 },
    { name: 'Mar', visits: 1, interactions: 0 },
    { name: 'Mer', visits: 2, interactions: 1 },
    { name: 'Jeu', visits: 3, interactions: 2 },
    { name: 'Ven', visits: 4, interactions: 3 },
    { name: 'Sam', visits: 2, interactions: 1 },
    { name: 'Dim', visits: 1, interactions: 0 },
  ];

  const statusData = [
    { name: 'Confirmés', value: 66.7, color: '#10B981' },
    { name: 'En attente', value: 33.3, color: '#F59E0B' },
    { name: 'Terminés', value: 0, color: '#3B82F6' },
  ];

  const activityData = [
    { name: 'Vues Mini-Site', value: 0.8 },
    { name: 'Téléchargements', value: 0.4 },
    { name: 'Messages', value: 0.6 },
    { name: 'Connexions', value: 0.3 },
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i));

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion Calendaire Avancée</h1>
          <p className="mt-2 text-gray-600">
            Votre système complet de gestion des rendez-vous : définissez vos disponibilités publiques et suivez tous vos rendez-vous personnels
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 w-fit">
          {[
            { id: 'availability', label: 'Gestion des Disponibilités', icon: Calendar },
            { id: 'appointments', label: 'Mes Rendez-vous', icon: Clock },
            { id: 'analytics', label: 'Performance & Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          
          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 bg-white border-l-4 border-blue-500 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total créneaux</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-2">{totalSlots}</h3>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-white border-l-4 border-indigo-500 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Cette semaine</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-2">{thisWeekSlots}</h3>
                    </div>
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <CalendarDays className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-white border-l-4 border-green-500 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Places disponibles</p>
                      <h3 className="text-3xl font-bold text-gray-900 mt-2">{availableSlots}</h3>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Semaine du {format(currentWeek, 'd MMMM yyyy', { locale: fr })}</h2>
                    <p className="text-sm text-gray-500">Gérez vos créneaux horaires pour cette semaine</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200">
                  {weekDays.map((day, i) => (
                    <div key={i} className="p-4 text-center bg-gray-50">
                      <p className="text-xs font-medium text-gray-500 uppercase">{format(day, 'EEE', { locale: fr })}.</p>
                      <p className="text-lg font-bold text-gray-900">{format(day, 'd')}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6">
                  {/* Integration of existing AvailabilityManager */}
                  <AvailabilityManager 
                    userId={user.id} 
                    userType={user.type as any} 
                    onAvailabilityUpdate={() => {
                      fetchTimeSlots(user.id);
                      toast.success("Disponibilités mises à jour");
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-4 bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{totalApps}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Confirmés</p>
                      <p className="text-2xl font-bold text-green-600">{confirmedApps}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">En attente</p>
                      <p className="text-2xl font-bold text-amber-600">{pendingApps}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-white shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Annulés</p>
                      <p className="text-2xl font-bold text-red-600">{cancelledApps}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="bg-white shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Mes Rendez-vous</h2>
                    <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                      {['Tous', 'En attente', 'Confirmés', 'Annulés'].map((filter) => (
                        <button key={filter} className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600">
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-0">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                    <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Semaine précédente
                    </button>
                    <span className="font-medium text-gray-900">Semaine du {format(currentWeek, 'dd/MM/yyyy')}</span>
                    <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                      Semaine suivante <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 divide-x divide-gray-200 border-b border-gray-200">
                    {weekDays.map((day, i) => (
                      <div key={i} className="p-3 text-center bg-gray-50">
                        <p className="text-xs font-medium text-gray-500 uppercase">{format(day, 'EEE', { locale: fr })}.</p>
                        <p className="text-lg font-bold text-gray-900">{format(day, 'd')}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 divide-x divide-gray-200 min-h-[200px]">
                    {weekDays.map((day, i) => (
                      <div key={i} className="p-2">
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                          <p>Aucun RDV</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="p-6 bg-white shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Données en temps réel</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="visits" name="Visites" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="interactions" name="Interactions" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6 bg-white shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut des Rendez-vous</h3>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="h-64 w-64 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </RePieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-gray-900">100%</span>
                        <span className="text-xs text-gray-500">Total</span>
                      </div>
                    </div>
                    <div className="space-y-4 w-full max-w-xs">
                      {statusData.map((item) => (
                        <div key={item.name} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-white shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition des Activités</h3>
                <div className="space-y-6">
                  {activityData.map((item) => (
                    <div key={item.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-medium text-gray-500">{item.value * 100}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${item.value * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
