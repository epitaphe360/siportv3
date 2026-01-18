import { create } from 'zustand';
import { Appointment, TimeSlot } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { supabase as supabaseClient, isSupabaseReady } from '../lib/supabase';
import { generateDemoTimeSlots } from '../config/demoTimeSlots';
import { emailTemplateService } from '../services/emailTemplateService';

// Helper pour vérifier si Supabase est configuré
const getSupabaseClient = () => {
  if (!isSupabaseReady()) {
    return null;
  }
  return supabaseClient;
};

/**
 * Envoie des notifications email et push pour un rendez-vous
 */
async function sendAppointmentNotifications(
  appointment: Appointment,
  type: 'confirmed' | 'cancelled' | 'reminder'
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('Supabase not configured, skipping notifications');
      return;
    }

    // Récupérer les informations du visiteur et de l'exposant
    const { data: visitorProfile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', appointment.visitorId)
      .single();

    const { data: exhibitorProfile } = await supabase
      .from('profiles')
      .select('email, first_name, last_name, company_name')
      .eq('id', appointment.exhibitorId)
      .single();

    if (!visitorProfile?.email || !exhibitorProfile?.email) {
      console.warn('Missing email addresses for notification');
      return;
    }

    // Formater la date et l'heure
    const appointmentDate = new Date(appointment.startTime);
    const formattedDate = appointmentDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Préparer les données pour le template
    const emailData = {
      firstName: visitorProfile.first_name || 'Visiteur',
      exhibitorName: exhibitorProfile.company_name || `${exhibitorProfile.first_name} ${exhibitorProfile.last_name}`,
      date: formattedDate,
      time: formattedTime,
      location: appointment.location || 'À déterminer',
      type: appointment.type || 'in-person' as 'in-person' | 'virtual' | 'hybrid',
    };

    // Envoyer email au visiteur
    if (type === 'confirmed') {
      const visitorTemplate = emailTemplateService.createAppointmentConfirmationEmail(emailData);
      await emailTemplateService.sendEmail(visitorProfile.email, visitorTemplate);
    } else if (type === 'cancelled') {
      // Pour l'annulation, créer un template simple
      const cancelTemplate = {
        subject: 'Annulation de rendez-vous - SIPORTS 2026',
        html: `
          <p>Bonjour ${emailData.firstName},</p>
          <p>Votre rendez-vous avec ${emailData.exhibitorName} prévu le ${emailData.date} à ${emailData.time} a été annulé.</p>
          <p>N'hésitez pas à prendre un nouveau rendez-vous si nécessaire.</p>
          <p>Cordialement,<br>L'équipe SIPORTS 2026</p>
        `,
        text: `Bonjour ${emailData.firstName}, Votre rendez-vous avec ${emailData.exhibitorName} prévu le ${emailData.date} à ${emailData.time} a été annulé.`
      };
      await emailTemplateService.sendEmail(visitorProfile.email, cancelTemplate);
    }

    // Envoyer une notification push si disponible
    try {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          userId: appointment.visitorId,
          title: type === 'confirmed' ? 'Rendez-vous confirmé' : 'Rendez-vous annulé',
          body: `${emailData.exhibitorName} - ${emailData.date} à ${emailData.time}`,
          data: {
            appointmentId: appointment.id,
            type,
          },
        },
      });
    } catch (pushError) {
      // Push notifications sont optionnelles, ne pas faire échouer si indisponibles
      console.warn('Push notification failed:', pushError);
    }
  } catch (error) {
    console.error('Failed to send appointment notifications:', error);
    // Ne pas faire échouer l'opération principale si les notifications échouent
  }
}

interface AppointmentState {
  appointments: Appointment[];
  timeSlots: TimeSlot[];
  isLoading: boolean;
  isBooking: boolean; // Prevent concurrent booking requests

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

// Fonctions utilitaires pour la synchronisation avec les mini-sites
/**
 * Synchronise la disponibilité des créneaux avec le mini-site de l'exposant
 * Met à jour le widget de disponibilité en temps réel
 */
async function syncWithMiniSite(slot: TimeSlot, availableCount: number): Promise<void> {
  try {
    // 1. Récupérer le mini-site de l'exposant
    const miniSite = await SupabaseService.getMiniSite(slot.exhibitorId);
    if (!miniSite) {
      return;
    }

    // 2. Mettre à jour les métadonnées du mini-site avec les disponibilités
    const updatedData = {
      ...miniSite,
      availability_widget: {
        total_slots: availableCount,
        next_available_date: slot.date ? new Date(slot.date).toISOString() : new Date().toISOString(),
        last_updated: new Date().toISOString(),
        slot_types: {
          'in-person': availableCount > 0,
          'virtual': slot.type === 'virtual',
          'hybrid': slot.type === 'hybrid'
        }
      }
    };

    await SupabaseService.updateMiniSite(slot.exhibitorId, updatedData);


    // 3. Optionnel: Publier sur canal temps réel Supabase
    // Pour une implémentation complète, on pourrait utiliser Supabase Realtime
    // const channel = supabase.channel(`mini-site-${slot.userId}`);
    // await channel.send({
    //   type: 'broadcast',
    //   event: 'availability-updated',
    //   payload: { availableCount, slotId: slot.id }
    // });

  } catch (error) {
    console.error('❌ Erreur sync mini-site:', error);
    // Ne pas bloquer le flux principal si la sync échoue
  }
}

/**
 * Notifie les visiteurs intéressés par un exposant lorsqu'un nouveau créneau est ajouté
 * Envoie des notifications in-app et emails selon les préférences utilisateur
 */
async function notifyInterestedVisitors(slot: TimeSlot): Promise<void> {
  try {
    // Get the user_id from the exhibitor relation if available
    const exhibitorUserId = slot.exhibitor?.userId;
    if (!exhibitorUserId) {
      return;
    }

    // 1. Récupérer les visiteurs qui ont marqué cet exposant comme favori
    // ou qui ont interagi avec lui (visites de mini-site, messages, etc.)
    const interestedVisitors = await SupabaseService.getInterestedVisitors?.(exhibitorUserId) || [];

    if (interestedVisitors.length === 0) {
      return;
    }


    // 2. Filtrer selon les préférences de notification
    const notifiableVisitors = interestedVisitors.filter((v: any) =>
      v.notificationPreferences?.newTimeSlots !== false  // Actif par défaut
    );

    // 3. Créer les notifications in-app
    const notificationPromises = notifiableVisitors.map(async (visitor: any) => {
      try {
        // Créer notification in-app
        await SupabaseService.createNotification?.({
          userId: visitor.id,
          type: 'new_timeslot',
          title: 'Nouveau créneau disponible',
          message: `Un nouveau créneau est disponible le ${new Date(slot.date).toLocaleDateString('fr-FR')} à ${slot.startTime}`,
          data: {
            slotId: slot.id,
            exhibitorId: slot.exhibitorId,
            date: slot.date,
            startTime: slot.startTime,
            type: slot.type
          }
        });

        // 4. Envoyer email si préférence activée
        if (visitor.notificationPreferences?.emailNotifications) {
          await SupabaseService.sendNotificationEmail?.({
            to: visitor.email,
            template: 'new-timeslot-notification',
            data: {
              visitorName: visitor.name,
              slotDate: new Date(slot.date).toLocaleDateString('fr-FR'),
              slotTime: slot.startTime,
              slotType: slot.type === 'virtual' ? 'Virtuel' :
                        slot.type === 'hybrid' ? 'Hybride' : 'Présentiel',
              exhibitorName: slot.exhibitor?.companyName || 'l\'exposant',
              bookingUrl: `${window.location.origin}/appointments?exhibitor=${slot.exhibitorId}`
            }
          });
        }

        return { success: true, visitorId: visitor.id };
      } catch (error) {
        console.error(`❌ Erreur notification visiteur ${visitor.id}:`, error);
        return { success: false, visitorId: visitor.id, error };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;


  } catch (error) {
    console.error('❌ Erreur notification visiteurs:', error);
    // Ne pas bloquer le flux principal si les notifications échouent
  }
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  timeSlots: [],
  isLoading: false,
  isBooking: false,

  fetchAppointments: async () => {
    set({ isLoading: true });
    try {
      // Essayer de récupérer depuis Supabase via SupabaseService
      if (SupabaseService && typeof SupabaseService.getAppointments === 'function') {
        const appointments = await SupabaseService.getAppointments();
        set({ appointments: appointments || [], isLoading: false });
        return;
      }

      // Fallback: si SupabaseService n'est pas disponible, utiliser supabaseClient directement
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('appointments')
          .select(`
            *,
            exhibitor:users!appointments_exhibitor_id_fkey(id, name, profile),
            visitor:users!appointments_visitor_id_fkey(id, name, profile)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transformer les données pour correspondre à l'interface Appointment
        const transformedAppointments = (data || []).map((apt: any) => ({
          id: apt.id,
          exhibitorId: apt.exhibitor_id,
          visitorId: apt.visitor_id,
          timeSlotId: apt.time_slot_id,
          status: apt.status,
          message: apt.message,
          notes: apt.notes,
          rating: apt.rating,
          createdAt: new Date(apt.created_at),
          meetingType: apt.meeting_type || 'in-person',
          meetingLink: apt.meeting_link,
          exhibitor: apt.exhibitor ? {
            id: apt.exhibitor.id,
            name: apt.exhibitor.name,
            companyName: apt.exhibitor.profile?.company || apt.exhibitor.profile?.companyName,
            avatar: apt.exhibitor.profile?.avatar
          } : undefined,
          visitor: apt.visitor ? {
            id: apt.visitor.id,
            name: apt.visitor.name,
            avatar: apt.visitor.profile?.avatar
          } : undefined
        }));

        set({ appointments: transformedAppointments, isLoading: false });
        return;
      }

      // Si aucune méthode n'est disponible, retourner un tableau vide
      console.warn('Aucune méthode de récupération des rendez-vous disponible');
      set({ appointments: [], isLoading: false });
    } catch (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      set({ isLoading: false, appointments: [] });
      throw error;
    }
  },

  // Fetch time slots for a specific exhibitor (userId)
  fetchTimeSlots: async (exhibitorId: string) => {
    // Validation: exhibitorId must be a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!exhibitorId || !uuidRegex.test(exhibitorId)) {
      console.warn('[APPOINTMENT] Invalid exhibitorId format:', exhibitorId);
      set({ timeSlots: [], isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      // If SupabaseService is available and supabase is configured, use it
      if (SupabaseService && typeof SupabaseService.getTimeSlotsByUser === 'function') {
        const slots = await SupabaseService.getTimeSlotsByUser(exhibitorId);
        set({ timeSlots: slots || [], isLoading: false });
        return;
      }

      // Fallback: utiliser supabaseClient directement
      const client = getSupabaseClient();
      if (client) {
        const { data, error } = await client
          .from('time_slots')
          .select(`
            *,
            exhibitor:exhibitors!exhibitor_id(
              id,
              user_id,
              company_name
            )
          `)
          .eq('exhibitor_id', exhibitorId)
          .order('slot_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;

        // Transformer les données pour correspondre à l'interface TimeSlot
        const transformedSlots = (data || []).map((slot: any) => ({
          id: slot.id,
          exhibitorId: slot.exhibitor_id,
          date: slot.slot_date ? new Date(slot.slot_date) : new Date(),
          startTime: slot.start_time,
          endTime: slot.end_time,
          duration: slot.duration,
          type: slot.type || 'in-person',
          maxBookings: slot.max_bookings || 1,
          currentBookings: slot.current_bookings || 0,
          available: (slot.current_bookings || 0) < (slot.max_bookings || 1),
          location: slot.location,
          exhibitor: slot.exhibitor ? {
            id: slot.exhibitor.id,
            userId: slot.exhibitor.user_id,
            companyName: slot.exhibitor.company_name
          } : undefined
        }));

        set({ timeSlots: transformedSlots, isLoading: false });
        return;
      }

      // Si aucune méthode n'est disponible, charger les données de démonstration
      console.warn('Aucune méthode de récupération des créneaux disponible - Chargement des données de démo');
      const demoSlots = generateDemoTimeSlots();
      set({ timeSlots: demoSlots, isLoading: false });
    } catch (err) {
      console.error('Erreur lors de la récupération des créneaux:', err);
      // En cas d'erreur, charger les données de démonstration
      const demoSlots = generateDemoTimeSlots();
      set({ timeSlots: demoSlots, isLoading: false });
    }
  },

  bookAppointment: async (timeSlotId, message) => {
    const { appointments, timeSlots, isBooking } = get();

    // Prevent concurrent booking requests (UI-level protection)
    if (isBooking) {
      throw new Error('Une réservation est déjà en cours. Veuillez patienter.');
    }

    set({ isBooking: true });

    try {
      // Récupérer l'utilisateur connecté via import dynamique
      let resolvedUser: any = null;
      try {
        const mod = await import('../store/authStore');
        resolvedUser = mod?.default?.getState ? mod.default.getState().user : null;
      } catch {
        resolvedUser = null;
      }

      // CRITICAL: User must be authenticated
      if (!resolvedUser?.id) {
        throw new Error('Vous devez être connecté pour réserver un rendez-vous.');
      }

      const visitorId = resolvedUser.id;

    // Vérifier le quota selon visitor_level OU type d'utilisateur (utilise la configuration centralisée)
    // ✅ IMPORTANT: Les exposants/partenaires utilisent leur TYPE, les visiteurs utilisent leur NIVEAU
    const userType = resolvedUser?.type; // 'exhibitor', 'partner', 'visitor', etc.
    const visitorLevel = resolvedUser?.visitor_level || resolvedUser?.profile?.visitor_level || 'free';

    // Import de la configuration des quotas
    const { getVisitorQuota } = await import('../config/quotas');

    // ✅ Utiliser le type pour exposants/partenaires, le niveau pour visiteurs
    const quotaKey = (userType === 'exhibitor' || userType === 'partner' || userType === 'admin' || userType === 'security')
      ? userType
      : visitorLevel;

    const quota = getVisitorQuota(quotaKey);

    // Compter TOUS les RDV actifs (pending + confirmed) pour éviter le contournement du quota
    const activeCount = appointments.filter(
      a => a.visitorId === visitorId &&
           (a.status === 'confirmed' || a.status === 'pending')
    ).length;

    // ✅ Ne vérifier le quota que si ce n'est pas illimité (999999)
    if (quota !== 999999 && activeCount >= quota) {
      throw new Error('Quota de rendez-vous atteint pour votre niveau');
    }

    // Prevent duplicate booking of the same time slot by the same visitor
    if (appointments.some(a => a.visitorId === visitorId && a.timeSlotId === timeSlotId)) {
      throw new Error('Vous avez déjà réservé ce créneau');
    }

    // CRITICAL: Validate time slot ownership
    const slot = timeSlots.find(s => s.id === timeSlotId);

    if (!slot) {
      throw new Error('Créneau non trouvé. Veuillez actualiser la page.');
    }

    const exhibitorIdForSlot = slot.exhibitorId;

    if (!exhibitorIdForSlot) {
      // Time slot exists but has no owner - data integrity violation
      throw new Error('Ce créneau n\'a pas de propriétaire valide. Veuillez contacter le support.');
    }

    // Additional validation: Verify slot is not already fully booked
    if (!slot.available || (slot.currentBookings || 0) >= (slot.maxBookings || 1)) {
      throw new Error('Ce créneau est complet. Veuillez en choisir un autre.');
    }

    // ATOMIC BOOKING: Use RPC function with row-level locking
    // This prevents ALL race conditions and overbooking
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase.rpc('book_appointment_atomic', {
      p_time_slot_id: timeSlotId,
      p_visitor_id: visitorId,
      p_exhibitor_id: exhibitorIdForSlot,
      p_notes: message || null
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de la réservation');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Erreur lors de la réservation');
    }

    // Success! Update local state with server data
    // STATUS: 'pending' - Le RDV est en attente de confirmation par l'exposant/partenaire
    const newAppointment: Appointment = {
      id: data.appointment_id,
      exhibitorId: exhibitorIdForSlot,
      visitorId,
      timeSlotId,
      status: 'pending', // En attente de confirmation par l'exposant/partenaire
      message,
      createdAt: new Date(),
      meetingType: 'in-person'
    };

    // Update time slot with server data
    const updatedSlots = timeSlots.map(s => s.id === timeSlotId ? {
      ...s,
      currentBookings: data.current_bookings,
      available: data.available
    } : s);

    set({
      appointments: [newAppointment, ...appointments],
      timeSlots: updatedSlots
    });

    return newAppointment;
    } finally {
      // Always reset isBooking flag, even if error occurs
      set({ isBooking: false });
    }
  },

  cancelAppointment: async (appointmentId) => {
    const { appointments, timeSlots } = get();
    const appointment = appointments.find(a => a.id === appointmentId);

    if (!appointment) return;

    // Get authenticated user via import dynamique
    let resolvedUser: any = null;
    try {
      const mod = await import('../store/authStore');
      resolvedUser = mod?.default?.getState ? mod.default.getState().user : null;
    } catch {
      resolvedUser = null;
    }

    if (!resolvedUser?.id) {
      throw new Error('Vous devez être connecté pour annuler un rendez-vous.');
    }

    // ATOMIC CANCEL: Use RPC function with proper slot management
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase.rpc('cancel_appointment_atomic', {
      p_appointment_id: appointmentId,
      p_user_id: resolvedUser.id
    });

    if (error) {
      throw new Error(error.message || 'Erreur lors de l\'annulation');
    }

    if (!data || !data.success) {
      throw new Error(data?.error || 'Erreur lors de l\'annulation');
    }

    // Success! Update local state
    const updatedAppointments = appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
    );

    // Envoyer notification d'annulation
    try {
      await sendAppointmentNotifications(appointment, 'cancelled');
    } catch (notifError) {
      console.warn('Failed to send cancellation notification:', notifError);
      // Ne pas faire échouer l'annulation si la notification échoue
    }

    // Refresh time slots to get updated counts
    if (appointment.timeSlotId) {
      const affectedSlot = timeSlots.find(s => s.id === appointment.timeSlotId);
      if (affectedSlot?.exhibitorId) {
        try {
          await get().fetchTimeSlots(affectedSlot.exhibitorId);
        } catch {
          // Ignore refresh errors, we already updated the appointment
        }
      }
    }

    set({ appointments: updatedAppointments });
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const { appointments, timeSlots } = get();

    // TODO: Same transaction concern as cancelAppointment
    // Persist to Supabase if possible
    if (SupabaseService && typeof SupabaseService.updateAppointmentStatus === 'function') {
      try {
        await SupabaseService.updateAppointmentStatus(appointmentId, status as any);

        // Si le statut passe à 'confirmed', envoyer des notifications
        const appointment = appointments.find(a => a.id === appointmentId);
        if (status === 'confirmed' && appointment?.status === 'pending') {
          try {
            // Import dynamique de toast pour les notifications
            const { toast } = await import('sonner');
            
            // Notification de confirmation
            toast.success('Rendez-vous confirmé !', {
              description: 'Les calendriers ont été mis à jour et les participants notifiés.'
            });

            // Envoyer notification email/push aux participants
            await sendAppointmentNotifications(appointment, 'confirmed');
          } catch (notifError) {
            console.warn('Erreur notification:', notifError);
          }
        }

        // Refresh slots from server for authoritative count
        if (appointment?.timeSlotId) {
          const affectedSlot = timeSlots.find(s => s.id === appointment.timeSlotId);
          if (affectedSlot?.exhibitorId) {
            try {
              await get().fetchTimeSlots(affectedSlot.exhibitorId);
              // Update appointments locally and return
              const updatedAppointments = appointments.map(a => a.id === appointmentId ? { ...a, status } : a);
              set({ appointments: updatedAppointments });
              return;
            } catch {
              // Fall through to local update if refresh fails
            }
          }
        }
      } catch (err) {
        console.warn('Failed to persist appointment status to Supabase', err);
        throw err; // Don't update local state if server update failed
      }
    }

    // Fallback local update
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

    // MEDIUM SEVERITY FIX: Add validations before creating time slot
    if (!slot.startTime || !slot.endTime) {
      throw new Error('Les heures de début et de fin sont obligatoires');
    }

    if (!slot.duration || slot.duration <= 0) {
      throw new Error('La durée doit être supérieure à 0 minutes');
    }

    if (!slot.maxBookings || slot.maxBookings <= 0) {
      throw new Error('Le nombre maximum de réservations doit être supérieur à 0');
    }

    const slotExhibitorId = (slot as any).exhibitorId;
    if (!slotExhibitorId || slotExhibitorId === 'unknown') {
      throw new Error('L\'identifiant de l\'exposant est requis pour créer un créneau');
    }

    // Validate start time is before end time
    if (slot.startTime >= slot.endTime) {
      throw new Error('L\'heure de début doit être avant l\'heure de fin');
    }

    // Validate date is not in the past (allow today)
    const slotDate = (slot as any).date;
    if (slotDate) {
      const dateObj = slotDate instanceof Date ? slotDate : new Date(slotDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj < today) {
        throw new Error('Impossible de créer un créneau dans le passé');
      }
    }

    // If SupabaseService is available, persist the slot; otherwise create local mock
    try {
      if (SupabaseService && typeof SupabaseService.createTimeSlot === 'function') {
        const created = await SupabaseService.createTimeSlot({
          exhibitorId: slotExhibitorId,
          date: slotDate instanceof Date ? slotDate.toISOString().split('T')[0] : String(slotDate),
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
        id: Date.now().toString(),
        exhibitorId: slotExhibitorId
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
        id: Date.now().toString(),
        exhibitorId: slotExhibitorId
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

    const client = getSupabaseClient();
    if (client) {
      for (const a of toConfirm) {
        try {
          const { error } = await client.from('appointments').update({ status: 'confirmed' }).eq('id', a.id);
          if (error) {
            failed.push({ id: a.id, error: error.message || String(error) });
            continue;
          }
          success.push(a.id);
        } catch (err: unknown) {
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
