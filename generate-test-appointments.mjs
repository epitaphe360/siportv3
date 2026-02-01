import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erreur: Identifiants Supabase manquants dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🚀 Démarrage du script de création de rendez-vous...');

  try {
    // 1. Récupérer les utilisateurs clés
    const emails = {
      exhibitor: 'exhibitor-9m@test.siport.com',
      partner: 'partner-museum@test.siport.com',
      visitor: 'visitor-vip@test.siport.com'
    };

    console.log('🔍 Recherche des utilisateurs...');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .in('email', Object.values(emails));

    if (usersError) throw usersError;

    const userMap = {};
    Object.entries(emails).forEach(([key, email]) => {
      const user = users.find(u => u.email === email);
      if (user) {
        userMap[key] = user;
        console.log(`✅ Utilisateur trouvé: ${key} (${user.id})`);
      } else {
        console.warn(`⚠️ Utilisateur non trouvé: ${key} (${email})`);
      }
    });

    if (!userMap.exhibitor) {
      throw new Error('L\'utilisateur exposant est requis pour créer des créneaux.');
    }

    // --- FIX: Ensure Partner has a visitor profile (VIP) to allow bookings ---
    if (userMap.partner) {
        const { data: partnerVisitorProfile } = await supabase
            .from('visitor_profiles')
            .select('id')
            .eq('user_id', userMap.partner.id)
            .maybeSingle();

        if (!partnerVisitorProfile) {
            console.log('ℹ️ Création d\'un profil visiteur VIP pour le partenaire (pour permettre les RDV)...');
            await supabase.from('visitor_profiles').insert({
                user_id: userMap.partner.id,
                first_name: 'Partner',
                last_name: 'Test',
                company: 'Museum Partner',
                visitor_type: 'company',
                pass_type: 'vip', // VIP to bypass quotas
                country: 'France'
            });
        }
        
        // Fix: Update users table visitor_level as well (Trigger uses this)
        await supabase.from('users')
            .update({ visitor_level: 'premium' })
            .eq('id', userMap.partner.id);
            
    }
    // -------------------------------------------------------------------------

    // 2. Récupérer le profil exposant (table exhibitors)
    // Note: On suppose que la table exhibitors a une colonne user_id
    const { data: exhibitorProfile, error: exhError } = await supabase
      .from('exhibitors')
      .select('id')
      .eq('user_id', userMap.exhibitor.id)
      .maybeSingle();

    if (exhError) throw exhError;
    
    let exhibitorId;
    
    if (!exhibitorProfile) {
      console.log('ℹ️ Profil exposant introuvable, tentative de création...');
      // Création basique d'exposant si absent
        const { data: newExhibitor, error: createError } = await supabase
            .from('exhibitors')
            .insert({
                user_id: userMap.exhibitor.id,
                company_name: 'Exposant Test 9m',
                category: 'port-industry',
                sector: 'Logistics',
                description: 'Description de test pour RDV',
                verified: true
            })
            .select()
            .single();
            
        if (createError) throw createError;
        exhibitorId = newExhibitor.id;
        console.log(`✅ Profil exposant créé: ${exhibitorId}`);
    } else {
      exhibitorId = exhibitorProfile.id;
      console.log(`✅ Profil exposant existant: ${exhibitorId}`);
    }

    // 3. Créer des créneaux horaires (Time Slots) pour les jours du salon
    // Dates du salon : 1, 2, 3 Avril 2026
    const salonDates = ['2026-04-01', '2026-04-02', '2026-04-03'];
    
    console.log(`📅 Création de créneaux pour le salon (Avril 2026)...`);
    
    const slotsToCreate = [
      { start: '09:00:00', end: '09:30:00' },
      { start: '10:00:00', end: '10:30:00' },
      { start: '11:00:00', end: '11:30:00' },
      { start: '14:00:00', end: '14:30:00' },
      { start: '15:00:00', end: '15:30:00' }
    ];

    const createdSlots = [];
    
    for (const dateStr of salonDates) {
        console.log(`  - Traitement du ${dateStr}...`);
        for (const slot of slotsToCreate) {
            // Vérifier si le slot existe déjà
            const { data: existingSlot } = await supabase
                .from('time_slots')
                .select('id')
                .match({ 
                    exhibitor_id: exhibitorId, 
                    slot_date: dateStr,
                    start_time: slot.start 
                })
                .maybeSingle(); // match exact date and time
                
            if (existingSlot) {
                createdSlots.push(existingSlot);
            } else {
                const { data: newSlot, error: slotError } = await supabase
                    .from('time_slots')
                    .insert({
                        exhibitor_id: exhibitorId,
                        slot_date: dateStr,
                        start_time: slot.start,
                        end_time: slot.end,
                        duration: 30,
                        type: 'in-person',
                        available: true
                    })
                    .select()
                    .single();
                    
                if (slotError) {
                    console.error(`Erreur création slot ${dateStr} ${slot.start}:`, slotError.message);
                } else {
                    createdSlots.push(newSlot);
                }
            }
        }
    }
    
    console.log(`✅ ${createdSlots.length} créneaux disponibles sur l'ensemble du salon.`);

    // 4. Créer les rendez-vous (Appointments)
    // On va distribuer les RDV sur les slots disponibles
    // Slot 0 (Day 1 morning): VIP Visitor (Pending)
    // Slot 6 (Day 2 morning): Partner (Confirmed)
    // Slot 2 (Day 1 mid): VIP Visitor (Refused)
    // Slot 12 (Day 3 pm): Partner (Pending)
    
    const appointmentsToCreate = [];
    
    // Day 1: VIP Visitor - Pending
    if (userMap.visitor && createdSlots[0]) {
        appointmentsToCreate.push({
            exhibitor_id: exhibitorId,
            visitor_id: userMap.visitor.id,
            time_slot_id: createdSlots[0].id,
            status: 'pending',
            message: 'Je souhaite discuter de vos produits VIP (Jour 1).',
            meeting_type: 'in-person'
        });
    }
    
    // Day 2: Partner - Confirmed
    // Assuming createdSlots are ordered by date then time.
    // 5 slots per day. So index 5 is start of Day 2.
    if (userMap.partner && createdSlots[5]) {
        appointmentsToCreate.push({
            exhibitor_id: exhibitorId,
            visitor_id: userMap.partner.id,
            time_slot_id: createdSlots[5].id,
            status: 'confirmed',
            message: 'Partenariat annuel - Confirmé (Jour 2)',
            meeting_type: 'in-person'
        });
        // Mettre à jour le slot comme non disponible si confirmé
        await supabase.from('time_slots').update({ available: false, current_bookings: 1 }).eq('id', createdSlots[5].id);
    }
    
    // Day 1: VIP Visitor - Refused
    if (userMap.visitor && createdSlots[2]) {
        appointmentsToCreate.push({
            exhibitor_id: exhibitorId,
            visitor_id: userMap.visitor.id,
            time_slot_id: createdSlots[2].id,
            status: 'cancelled', // ou refused selon l'enum
            message: 'Annulé: Indisponibilité (Jour 1)',
            meeting_type: 'virtual'
        });
    }
    
    // Day 3: Partner - Pending
    // Index 10 is start of Day 3.
     if (userMap.partner && createdSlots[10]) {
        appointmentsToCreate.push({
            exhibitor_id: exhibitorId,
            visitor_id: userMap.partner.id,
            time_slot_id: createdSlots[10].id,
            status: 'pending',
            message: 'Discussion projet musée (Jour 3)',
            meeting_type: 'in-person'
        });
    }

    console.log(`📝 Création de ${appointmentsToCreate.length} rendez-vous...`);

    for (const apt of appointmentsToCreate) {
        // Check existing
        const { data: existingApt } = await supabase
            .from('appointments')
            .select('id')
            .match({ 
                time_slot_id: apt.time_slot_id, 
                visitor_id: apt.visitor_id 
            })
            .maybeSingle();

        if (existingApt) {
             console.log(`  - RDV déjà existant (Slot ${apt.time_slot_id})`);
             // Update status just in case
             await supabase.from('appointments').update({ status: apt.status }).eq('id', existingApt.id);
        } else {
            const { error: aptError } = await supabase
                .from('appointments')
                .insert(apt);
            
            if (aptError) {
                console.error('  ❌ Erreur création RDV:', aptError.message);
            } else {
                console.log(`  ✅ RDV créé: ${apt.status} (Visiteur: ${apt.visitor_id})`);
            }
        }
    }

    console.log('✨ Terminé ! Les données de test sont prêtes.');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
  }
}

main();
