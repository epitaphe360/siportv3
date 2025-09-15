import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM2MjI0NywiZXhwIjoyMDcyOTM4MjQ3fQ.HzgGnbbTyF-c_jAawvXNDXfHpqtZR4mN6UIx-X3GdVo';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEventsWithServiceRole() {
  console.log('🔍 Checking events with service role...');

  try {
    // Check events with service role (bypasses RLS)
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('featured', { ascending: false })
      .order('event_date');

    if (error) {
      console.error('❌ Error fetching events:', error);
      return;
    }

    console.log(`✅ Found ${events.length} events in database:`);
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} - ${event.event_date} (${event.category})`);
    });

    if (events.length === 0) {
      console.log('⚠️  No events found. The demo migration may not have been applied.');
      console.log('🔧 Applying demo events migration...');
      await applyDemoEvents();
    } else {
      console.log('✅ Events exist! The issue might be with RLS policies or frontend fetching.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function applyDemoEvents() {
  console.log('📝 Applying demo events...');

  const demoEvents = [
    {
      id: 'event-1',
      title: 'Digitalisation des Ports : Enjeux et Opportunités',
      description: 'Table ronde sur les technologies émergentes dans le secteur portuaire et leur impact sur l\'efficacité opérationnelle.',
      type: 'roundtable',
      event_date: '2026-02-05T14:00:00',
      start_time: '14:00',
      end_time: '15:30',
      capacity: 50,
      registered: 32,
      category: 'Digital Transformation',
      virtual: false,
      featured: true,
      location: 'Salle de conférence A',
      tags: ['digitalisation', 'innovation', 'technologie']
    },
    {
      id: 'event-2',
      title: 'Speed Networking : Opérateurs Portuaires',
      description: 'Session de réseautage rapide dédiée aux opérateurs et gestionnaires de terminaux portuaires.',
      type: 'networking',
      event_date: '2026-02-06T10:30:00',
      start_time: '10:30',
      end_time: '12:00',
      capacity: 80,
      registered: 65,
      category: 'Networking',
      virtual: false,
      featured: true,
      location: 'Espace networking B',
      tags: ['networking', 'opérateurs', 'partenariats']
    },
    {
      id: 'event-3',
      title: 'Ports Durables : Transition Énergétique',
      description: 'Webinaire sur les stratégies de transition énergétique dans les ports et les solutions innovantes.',
      type: 'webinar',
      event_date: '2026-02-07T16:00:00',
      start_time: '16:00',
      end_time: '17:00',
      capacity: 200,
      registered: 145,
      category: 'Sustainability',
      virtual: true,
      featured: false,
      location: null,
      tags: ['durabilité', 'énergie', 'environnement']
    },
    {
      id: 'event-4',
      title: 'Atelier : Gestion des Données Portuaires',
      description: 'Atelier pratique sur l\'utilisation des données pour optimiser les opérations portuaires.',
      type: 'workshop',
      event_date: '2026-02-06T09:00:00',
      start_time: '09:00',
      end_time: '11:00',
      capacity: 25,
      registered: 18,
      category: 'Data Management',
      virtual: false,
      featured: false,
      location: 'Salle d\'atelier C',
      tags: ['données', 'analytics', 'optimisation']
    },
    {
      id: 'event-5',
      title: 'Conférence : L\'Avenir du Transport Maritime',
      description: 'Conférence magistrale sur les tendances futures du transport maritime et l\'impact sur les ports.',
      type: 'conference',
      event_date: '2026-02-05T09:00:00',
      start_time: '09:00',
      end_time: '10:00',
      capacity: 300,
      registered: 280,
      category: 'Maritime Transport',
      virtual: false,
      featured: true,
      location: 'Auditorium principal',
      tags: ['transport', 'maritime', 'avenir']
    }
  ];

  try {
    const { data, error } = await supabase
      .from('events')
      .upsert(demoEvents, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('❌ Error applying demo events:', error);
      return;
    }

    console.log(`✅ Successfully applied ${data.length} demo events!`);
    data.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
    });

  } catch (error) {
    console.error('❌ Error applying events:', error);
  }
}

checkEventsWithServiceRole().catch(console.error);
