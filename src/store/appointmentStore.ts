import { create } from 'zustand';
import { Appointment, TimeSlot } from '../types';
import { SupabaseService } from '../services/supabaseService';
// Try to import supabase client if available
let supabaseClient: any = null;
try {
   
  const sup = require('../lib/supabase');
  supabaseClient = sup?.supabase || null;
} catch {
  supabaseClient = null;
}

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
  // Utilitaires de test/dev
  confirmAppointmentsForVisitor: (visitorId: string) => Promise<{ success: string[]; failed: { id: string; error: string }[] }>;
  clearMockAppointments: () => Promise<void>;
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

  // Fetch time slots for a specific exhibitor (userId)
  fetchTimeSlots: async (exhibitorId: string) => {
    set({ isLoading: true });
    try {
      // If SupabaseService is available and supabase is configured, use it
      if (SupabaseService && typeof SupabaseService.getTimeSlotsByUser === 'function') {
        const slots = await SupabaseService.getTimeSlotsByUser(exhibitorId);
        set({ timeSlots: slots || [], isLoading: false });
        return;
      }

      // Fallback to mock data for dev
      await new Promise(resolve => setTimeout(resolve, 800));
      set({ timeSlots: mockTimeSlots, isLoading: false });
    } catch (err) {
      console.warn('fetchTimeSlots error', err);
      set({ isLoading: false });
    }
  },

  bookAppointment: async (timeSlotId, message) => {
    const { appointments, timeSlots } = get();

    // Récupérer l'utilisateur connecté depuis le store global

    let resolvedUser: any = null;
    try {
      // Essayer require (synchrones) — fonctionne dans la plupart des environnements runtime.
       
      const auth = require('../store/authStore').default;
      resolvedUser = auth?.getState ? auth.getState().user : null;
    } catch {
      try {
        // Fallback asynchrone si require échoue (ex: environnement ESM strict)
        const mod = await import('../store/authStore');
        resolvedUser = mod?.default?.getState ? mod.default.getState().user : null;
      } catch {
        resolvedUser = null;
      }
    }

  const visitorId = resolvedUser?.id || 'user1';

    // Vérifier le quota selon visitor_level
    const visitorLevel = resolvedUser?.visitor_level || resolvedUser?.profile?.visitor_level || 'free';
    const quotas: Record<string, number> = { free: 0, basic: 2, premium: 5, vip: 99 };

    const confirmedCount = appointments.filter(a => a.visitorId === visitorId && a.status === 'confirmed').length;
    if (confirmedCount >= (quotas[visitorLevel] || 0)) {
      throw new Error('Quota RDV atteint pour votre niveau');
    }

    // Prevent duplicate booking of the same time slot by the same visitor
    if (appointments.some(a => a.visitorId === visitorId && a.timeSlotId === timeSlotId)) {
      throw new Error('Vous avez déjà réservé ce créneau');
    }

    // Find the timeslot to determine the exhibitor/user owner
    const slot = timeSlots.find(s => s.id === timeSlotId);
    const exhibitorIdForSlot = slot?.userId || slot?.exhibitorId || null;

    if (!exhibitorIdForSlot) {
      // If we don't have owner info locally, try to fetch the slot from Supabase
      try {
        if (SupabaseService && typeof SupabaseService.getTimeSlotsByUser === 'function') {
          // best-effort: try to fetch by visitor context — but we need owner; bail gracefully
          // We'll allow DB to resolve exhibitor via appointment create if possible
        }
      } catch {
        // ignore
      }
    }

    // Optimistic update: increment slot booking locally
    const optimisticSlots = timeSlots.map(s => s.id === timeSlotId ? { ...s, currentBookings: (s.currentBookings || 0) + 1, available: ((s.currentBookings || 0) + 1) < (s.maxBookings || 1) } : s);
    set({ timeSlots: optimisticSlots });

    // Persist via SupabaseService.createAppointment (RPC-aware)
    if (SupabaseService && typeof SupabaseService.createAppointment === 'function') {
      try {
        const persisted = await SupabaseService.createAppointment({
          exhibitorId: exhibitorIdForSlot || undefined,
          visitorId,
          timeSlotId,
          message: message || undefined,
          meetingType: 'in-person'
        });

        // After success, refresh exhibitor slots to pick up server-side counters if possible
        try {
          if (exhibitorIdForSlot) await get().fetchTimeSlots(String(exhibitorIdForSlot));
        } catch {
          // ignore refresh errors
        }

        set({ appointments: [persisted, ...appointments] });
        return persisted;
      } catch (err: any) {
        // Revert optimistic change
        const revertedSlots = timeSlots.map(s => s.id === timeSlotId ? { ...s, currentBookings: Math.max(0, (s.currentBookings || 0)), available: (s.currentBookings || 0) < (s.maxBookings || 1) } : s);
        set({ timeSlots: revertedSlots });

        const msg = String(err?.message || err || '').toLowerCase();
        if (msg.includes('complet') || msg.includes('fully booked') || msg.includes('time slot fully booked')) {
          throw new Error('Ce créneau est complet.');
        }
        if (msg.includes('déjà') || msg.includes('duplicate') || msg.includes('unique')) {
          throw new Error('Vous avez déjà réservé ce créneau.');
        }
        throw err;
      }
    }

    // Local fallback when Supabase unavailable
    const generatedId = typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
      ? (crypto as any).randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

    const newAppointment: Appointment = {
      id: generatedId,
      exhibitorId: exhibitorIdForSlot || 'unknown',
      visitorId,
      timeSlotId,
      status: 'pending',
      message,
      createdAt: new Date(),
      meetingType: 'in-person'
    };

    set({ appointments: [newAppointment, ...appointments] });
  },

  cancelAppointment: async (appointmentId) => {
    const { appointments, timeSlots } = get();
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) return;

    // Persist status change to Supabase if possible
    if (SupabaseService && typeof SupabaseService.updateAppointmentStatus === 'function') {
      try {
        await SupabaseService.updateAppointmentStatus(appointmentId, 'cancelled');
      } catch (err) {
        console.warn('Failed to persist cancellation to Supabase', err);
        // continue to update local state anyway
      }
    }

    // Update local appointment status
    const updatedAppointments = appointments.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a);

    // Recompute bookings for the affected time slot by counting confirmed/pending appointments locally
    const affectedSlotId = appointment.timeSlotId;
    const remainingBookings = updatedAppointments.filter(a => a.timeSlotId === affectedSlotId && a.status !== 'cancelled').length;

    const updatedTimeSlots = timeSlots.map(slot =>
      slot.id === affectedSlotId
        ? { ...slot, currentBookings: remainingBookings, available: remainingBookings < (slot.maxBookings || 1) }
        : slot
    );

    set({ appointments: updatedAppointments, timeSlots: updatedTimeSlots });
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const { appointments, timeSlots } = get();

    // Persist to Supabase if possible
    if (SupabaseService && typeof SupabaseService.updateAppointmentStatus === 'function') {
      try {
        await SupabaseService.updateAppointmentStatus(appointmentId, status as any);
      } catch (err) {
        console.warn('Failed to persist appointment status to Supabase', err);
      }
    }

    const updatedAppointments = appointments.map(a => a.id === appointmentId ? { ...a, status } : a);

    // If the status change affects slot counts, recompute for the related slot
    const changed = updatedAppointments.find(a => a.id === appointmentId);
    if (changed) {
      const slotId = changed.timeSlotId;
      const currentCount = updatedAppointments.filter(a => a.timeSlotId === slotId && a.status !== 'cancelled').length;
      const updatedTimeSlots = timeSlots.map(slot =>
        slot.id === slotId ? { ...slot, currentBookings: currentCount, available: currentCount < (slot.maxBookings || 1) } : slot
      );
      set({ appointments: updatedAppointments, timeSlots: updatedTimeSlots });
      return;
    }

    set({ appointments: updatedAppointments });
  },

  createTimeSlot: async (slot) => {
    const { timeSlots } = get();
    // If SupabaseService is available, persist the slot; otherwise create local mock
    try {
      if (SupabaseService && typeof SupabaseService.createTimeSlot === 'function') {
        const created = await SupabaseService.createTimeSlot({
          userId: (slot as any).userId || 'unknown',
          date: (slot as any).date instanceof Date ? (slot as any).date.toISOString().split('T')[0] : String((slot as any).date),
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: slot.duration,
          type: slot.type,
          maxBookings: slot.maxBookings,
          location: slot.location
        });
        set({ timeSlots: [created, ...timeSlots] });
        void syncWithMiniSite(created, get().timeSlots.filter(s => s.available).length);
        void notifyInterestedVisitors(created);
        return;
      }

      const newSlot: TimeSlot = {
        ...slot,
        id: Date.now().toString()
      };
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ timeSlots: [newSlot, ...timeSlots] });
      void syncWithMiniSite(newSlot, get().timeSlots.filter(s => s.available).length);
      void notifyInterestedVisitors(newSlot);
      return;
    } catch (err) {
      console.warn('createTimeSlot error', err);
      // fallback to local
      const newSlot: TimeSlot = {
        ...slot,
        id: Date.now().toString()
      };
      set({ timeSlots: [newSlot, ...timeSlots] });
      void syncWithMiniSite(newSlot, get().timeSlots.filter(s => s.available).length);
      void notifyInterestedVisitors(newSlot);
      return;
    }
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
  },
  // Confirmer tous les rendez-vous d'un visiteur (utile pour tests/dev)
  confirmAppointmentsForVisitor: async (visitorId) => {
    const { appointments } = get();
    const toConfirm = appointments.filter(x => x.visitorId === visitorId && x.status !== 'confirmed');
    const success: string[] = [];
    const failed: { id: string; error: string }[] = [];

    if (supabaseClient) {
      for (const a of toConfirm) {
        try {
          const { error } = await supabaseClient.from('appointments').update({ status: 'confirmed' }).eq('id', a.id);
          if (error) {
            failed.push({ id: a.id, error: error.message || String(error) });
            continue;
          }
          success.push(a.id);
        } catch (err: any) {
          failed.push({ id: a.id, error: err?.message || String(err) });
        }
      }

      // Reflect successful updates locally
      if (success.length > 0) {
        const updated = appointments.map(a => success.includes(a.id) ? { ...a, status: 'confirmed' as const } : a);
        set({ appointments: updated });
      }
    } else {
      // Local-only: mark all as confirmed and report as success
      const updated = appointments.map(a => a.visitorId === visitorId ? { ...a, status: 'confirmed' as const } : a);
      set({ appointments: updated });
      toConfirm.forEach(a => success.push(a.id));
    }

    return { success, failed };
  },
  // Nettoyer les rendez-vous mock (supprime ceux créés par le flow dev)
  clearMockAppointments: async () => {
    const { appointments } = get();
    const filtered = appointments.filter(a => !String(a.visitorId).startsWith('visitor-'));
    set({ appointments: filtered });
  }
}));
