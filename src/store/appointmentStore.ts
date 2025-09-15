import { create } from 'zustand';
import { Appointment, TimeSlot } from '../types';

interface AppointmentState {
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  
  // Actions
  fetchAppointments: () => Promise<void>;
  fetchTimeSlots: (exhibitorId: string) => Promise<void>;
  bookAppointment: (timeSlotId: string, message?: string) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => Promise<void>;
  createTimeSlot: (slot: Omit<TimeSlot, 'id'>) => Promise<void>;
  updateTimeSlot: (slotId: string, updates: Partial<TimeSlot>) => Promise<void>;
  deleteTimeSlot: (slotId: string) => Promise<void>;
}

const mockTimeSlots: TimeSlot[] = [
  {
    id: '1',
    date: new Date('2026-02-05'),
    startTime: '09:00',
    endTime: '09:30',
    duration: 30,
    type: 'in-person',
    maxBookings: 1,
    currentBookings: 0,
    available: true,
    location: 'Stand A-12'
  },
  {
    id: '2',
    date: new Date('2026-02-05'),
    startTime: '10:00',
    endTime: '10:30',
    duration: 30,
    type: 'virtual',
    maxBookings: 1,
    currentBookings: 1,
    available: false
  },
  {
    id: '3',
    date: new Date('2026-02-05'),
    startTime: '14:00',
    endTime: '14:45',
    duration: 45,
    type: 'hybrid',
    maxBookings: 2,
    currentBookings: 1,
    available: true,
    location: 'Salle de réunion B-5'
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    exhibitorId: '1',
    visitorId: 'user1',
    timeSlotId: '2',
    status: 'confirmed',
    message: 'Intéressé par vos solutions de gestion portuaire',
    createdAt: new Date(Date.now() - 86400000),
    meetingType: 'virtual',
    meetingLink: 'https://meet.google.com/abc-defg-hij'
  },
  {
    id: '2',
    exhibitorId: '2',
    visitorId: 'user1',
    timeSlotId: '3',
    status: 'pending',
    message: 'Souhait de discuter de partenariat technologique',
    createdAt: new Date(Date.now() - 3600000),
    meetingType: 'hybrid'
  }
];

async function syncWithMiniSite(slot: TimeSlot, availableCount: number): Promise<void> {
  try {
    void slot;
    void availableCount;
  } catch {
    // silencieux
  }
}

async function notifyInterestedVisitors(slot: TimeSlot): Promise<void> {
  try {
    void slot;
  } catch {
    // silencieux
  }
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  timeSlots: [],
  isLoading: false,

  fetchAppointments: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ appointments: mockAppointments, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchTimeSlots: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ timeSlots: mockTimeSlots, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  bookAppointment: async (timeSlotId, message) => {
    const { appointments, timeSlots } = get();
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      exhibitorId: '1',
      visitorId: 'user1',
      timeSlotId,
      status: 'pending',
      message,
      createdAt: new Date(),
      meetingType: 'in-person'
    };

    // Update time slot availability
    const updatedTimeSlots = timeSlots.map(slot =>
      slot.id === timeSlotId
        ? { ...slot, currentBookings: slot.currentBookings + 1, available: slot.currentBookings + 1 < slot.maxBookings }
        : slot
    );

    set({ 
      appointments: [newAppointment, ...appointments],
      timeSlots: updatedTimeSlots
    });
  },

  cancelAppointment: async (appointmentId) => {
    const { appointments, timeSlots } = get();
    const appointment = appointments.find(a => a.id === appointmentId);
    
    if (appointment) {
      // Update appointment status
      const updatedAppointments = appointments.map(a =>
        a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
      );

      // Free up the time slot
      const updatedTimeSlots = timeSlots.map(slot =>
        slot.id === appointment.timeSlotId
          ? { ...slot, currentBookings: Math.max(0, slot.currentBookings - 1), available: true }
          : slot
      );

      set({ 
        appointments: updatedAppointments,
        timeSlots: updatedTimeSlots
      });
    }
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const { appointments } = get();
    const updatedAppointments = appointments.map(a =>
      a.id === appointmentId ? { ...a, status } : a
    );
    set({ appointments: updatedAppointments });
  },

  createTimeSlot: async (slot) => {
    const { timeSlots } = get();
    const newSlot: TimeSlot = {
      ...slot,
      id: Date.now().toString()
    };
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mise à jour du store
    set({ timeSlots: [newSlot, ...timeSlots] });
    
    // Lancer en tâche de fond sans bloquer l'UI
    void syncWithMiniSite(newSlot, get().timeSlots.filter(s => s.available).length);
    void notifyInterestedVisitors(newSlot);
  },
  updateTimeSlot: async (slotId, updates) => {
    const { timeSlots } = get();
    const updatedTimeSlots = timeSlots.map(slot =>
      slot.id === slotId ? { ...slot, ...updates } : slot
    );
    set({ timeSlots: updatedTimeSlots });
  },

  deleteTimeSlot: async (slotId) => {
    const { timeSlots } = get();
    const updatedTimeSlots = timeSlots.filter(slot => slot.id !== slotId);
    set({ timeSlots: updatedTimeSlots });
  }
}));