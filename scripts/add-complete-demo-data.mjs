import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo'
);

async function addCompleteDemoData() {
  try {
    console.log('🗓️  Création des données de démonstration complètes...\n');

    // 1. Récupérer les utilisateurs
    console.log('📋 Récupération des visiteurs...');
    const { data: visitors } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('type', 'visitor')
      .in('email', ['visitor-free@test.siport.com', 'visitor-vip@test.siport.com']);

    console.log(`✅ ${visitors?.length || 0} visiteurs trouvés`);

    // 2. Récupérer les exposants
    console.log('📋 Récupération des exposants...');
    const { data: exhibitors } = await supabase
      .from('exhibitors')
      .select('id, company_name, user_id')
      .in('user_id', [
        'fa5c44fe-e280-47e6-a4a6-630285f3d93b',
        'd41e51aa-c4e8-43fa-a266-5c128adb881f',
        'c1283698-b03f-490f-8d7f-f43e28c44143',
        '0761473c-7b11-405e-8d01-cbed36308f7c'
      ]);

    console.log(`✅ ${exhibitors?.length || 0} exposants trouvés`);

    if (!visitors || visitors.length === 0) {
      console.log('❌ Aucun visiteur trouvé');
      return;
    }

    if (!exhibitors || exhibitors.length === 0) {
      console.log('❌ Aucun exposant trouvé');
      return;
    }

    // 3. Nettoyer les anciennes données de démo
    console.log('\n🧹 Nettoyage des anciennes données...');
    
    // Supprimer les appointments de démonstration
    await supabase
      .from('appointments')
      .delete()
      .in('visitor_id', visitors.map(v => v.id));
    
    // Supprimer les time_slots de démonstration
    await supabase
      .from('time_slots')
      .delete()
      .in('exhibitor_id', exhibitors.map(e => e.id));

    console.log('✅ Nettoyage terminé');

    // 4. Créer des créneaux horaires (time_slots)
    console.log('\n📅 Création des créneaux horaires...');
    
    const now = new Date();
    const timeSlots = [];

    // Pour chaque exposant, créer plusieurs créneaux
    exhibitors.forEach((exhibitor, index) => {
      // Créneau hier (passé)
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: yesterday.toISOString().split('T')[0],
        start_time: '10:00',
        end_time: '10:30',
        duration: 30,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: 1,
        available: false,
        location: `Stand ${exhibitor.company_name}`
      });

      // Créneau aujourd'hui
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: now.toISOString().split('T')[0],
        start_time: '14:00',
        end_time: '14:45',
        duration: 45,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: index === 1 ? 1 : 0,
        available: index !== 1,
        location: `Stand ${exhibitor.company_name}`
      });

      // Créneau demain
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: tomorrow.toISOString().split('T')[0],
        start_time: '11:00',
        end_time: '12:00',
        duration: 60,
        type: 'in-person',
        max_bookings: 1,
        current_bookings: index === 2 ? 1 : 0,
        available: index !== 2,
        location: `Stand ${exhibitor.company_name}`
      });

      // Créneau dans 3 jours
      const in3Days = new Date(now);
      in3Days.setDate(in3Days.getDate() + 3);
      timeSlots.push({
        exhibitor_id: exhibitor.id,
        slot_date: in3Days.toISOString().split('T')[0],
        start_time: '09:30',
        end_time: '10:15',
        duration: 45,
        type: 'virtual',
        max_bookings: 2,
        current_bookings: index === 3 ? 1 : 0,
        available: index !== 3,
        location: 'Visioconférence'
      });

      // Créneaux VIP - dans 5 jours
      if (index < 2) {
        const in5Days = new Date(now);
        in5Days.setDate(in5Days.getDate() + 5);
        timeSlots.push({
          exhibitor_id: exhibitor.id,
          slot_date: in5Days.toISOString().split('T')[0],
          start_time: '15:00',
          end_time: '16:00',
          duration: 60,
          type: 'hybrid',
          max_bookings: 1,
          current_bookings: 1,
          available: false,
          location: `Stand ${exhibitor.company_name} + Visio`
        });
      }
    });

    const { data: createdSlots, error: slotsError } = await supabase
      .from('time_slots')
      .insert(timeSlots)
      .select();

    if (slotsError) {
      console.error('❌ Erreur lors de la création des créneaux:', slotsError);
      return;
    }

    console.log(`✅ ${createdSlots.length} créneaux créés`);

    // 5. Créer les rendez-vous
    console.log('\n📝 Création des rendez-vous...');
    
    const appointments = [];

    // Rendez-vous passé (hier avec TechMarine)
    const slotYesterday = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[0].id && s.start_time === '10:00'
    );
    if (slotYesterday) {
      appointments.push({
        time_slot_id: slotYesterday.id,
        exhibitor_id: exhibitors[0].id,
        visitor_id: visitors[0].id,
        status: 'confirmed',
        notes: 'Rendez-vous réalisé - Discussion sur SmartPort PMS',
        message: 'Je souhaite en savoir plus sur vos solutions de gestion portuaire',
        meeting_type: 'in-person'
      });
    }

    // Rendez-vous aujourd'hui (avec OceanLogistics)
    const slotToday = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[1].id && s.start_time === '14:00'
    );
    if (slotToday) {
      appointments.push({
        time_slot_id: slotToday.id,
        exhibitor_id: exhibitors[1].id,
        visitor_id: visitors[0].id,
        status: 'confirmed',
        notes: 'Présentation des solutions logistiques',
        message: 'Intéressé par vos solutions de tracking',
        meeting_type: 'in-person'
      });
    }

    // Rendez-vous demain (avec PortTech)
    const slotTomorrow = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[2].id && s.start_time === '11:00'
    );
    if (slotTomorrow) {
      appointments.push({
        time_slot_id: slotTomorrow.id,
        exhibitor_id: exhibitors[2].id,
        visitor_id: visitors[0].id,
        status: 'confirmed',
        notes: 'Démo complète PortTech Industries - Solutions premium',
        message: 'Rendez-vous pour une démonstration complète',
        meeting_type: 'in-person'
      });
    }

    // Rendez-vous dans 3 jours (avec Global Shipping - EN ATTENTE)
    const slotIn3Days = createdSlots.find(s => 
      s.exhibitor_id === exhibitors[3].id && s.start_time === '09:30'
    );
    if (slotIn3Days) {
      appointments.push({
        time_slot_id: slotIn3Days.id,
        exhibitor_id: exhibitors[3].id,
        visitor_id: visitors[0].id,
        status: 'pending',
        notes: 'En attente de confirmation - Global Shipping Alliance',
        message: 'Souhait de discuter partenariat international',
        meeting_type: 'virtual'
      });
    }

    // Rendez-vous VIP visiteur 2 (dans 5 jours)
    if (visitors.length > 1) {
      const slotVip1 = createdSlots.find(s => 
        s.exhibitor_id === exhibitors[0].id && s.start_time === '15:00'
      );
      if (slotVip1) {
        appointments.push({
          time_slot_id: slotVip1.id,
          exhibitor_id: exhibitors[0].id,
          visitor_id: visitors[1].id,
          status: 'confirmed',
          notes: 'Session VIP - Présentation exclusive dirigeants',
          message: 'Rendez-vous VIP pour discussion stratégique',
          meeting_type: 'hybrid'
        });
      }

      const slotVip2 = createdSlots.find(s => 
        s.exhibitor_id === exhibitors[1].id && s.start_time === '15:00'
      );
      if (slotVip2) {
        appointments.push({
          time_slot_id: slotVip2.id,
          exhibitor_id: exhibitors[1].id,
          visitor_id: visitors[1].id,
          status: 'confirmed',
          notes: 'Session VIP - Partenariat stratégique',
          message: 'Discussion opportunités de collaboration',
          meeting_type: 'hybrid'
        });
      }
    }

    const { data: createdAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (appointmentsError) {
      console.error('❌ Erreur lors de la création des rendez-vous:', appointmentsError);
      return;
    }

    console.log(`✅ ${createdAppointments.length} rendez-vous créés`);

    // 6. Résumé
    console.log('\n✨ Données de démonstration créées avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   - Visiteurs: ${visitors.length}`);
    console.log(`   - Exposants: ${exhibitors.length}`);
    console.log(`   - Créneaux: ${createdSlots.length}`);
    console.log(`   - Rendez-vous: ${createdAppointments.length}`);
    console.log('\n🎯 Statuts des rendez-vous:');
    console.log(`   - Confirmés: ${createdAppointments.filter(a => a.status === 'confirmed').length}`);
    console.log(`   - En attente: ${createdAppointments.filter(a => a.status === 'pending').length}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addCompleteDemoData();
