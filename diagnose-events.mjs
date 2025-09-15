import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseEvents() {
  console.log('🔍 Diagnosing events issue...');

  try {
    // Check if events table exists and has data
    console.log('📊 Checking events table...');
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
      console.log('⚠️  No events found in database. Creating sample events...');
      await createSampleEvents();
    }

  } catch (error) {
    console.error('❌ Error diagnosing events:', error);
  }
}

async function createSampleEvents() {
  console.log('🌱 Creating sample events...');

  const sampleEvents = [
    {
      title: 'Salon International de l\'Innovation Technologique',
      description: 'Découvrez les dernières innovations technologiques et rencontrez les leaders du secteur.',
      type: 'conference',
      event_date: '2025-10-15',
      start_time: '09:00',
      end_time: '18:00',
      capacity: 500,
      registered: 0,
      category: 'technology',
      virtual: false,
      featured: true,
      location: 'Palais des Congrès, Paris',
      meeting_link: '',
      tags: ['innovation', 'technology', 'networking']
    },
    {
      title: 'Webinaire: Tendances Digitales 2025',
      description: 'Explorez les tendances digitales qui façonneront l\'année 2025.',
      type: 'webinar',
      event_date: '2025-09-20',
      start_time: '14:00',
      end_time: '16:00',
      capacity: 200,
      registered: 0,
      category: 'digital',
      virtual: true,
      featured: false,
      location: 'En ligne',
      meeting_link: 'https://meet.google.com/abc-defg-hij',
      tags: ['digital', 'trends', 'webinar']
    },
    {
      title: 'Atelier: Développement Durable',
      description: 'Participez à notre atelier sur les stratégies de développement durable.',
      type: 'workshop',
      event_date: '2025-11-05',
      start_time: '10:00',
      end_time: '12:00',
      capacity: 50,
      registered: 0,
      category: 'sustainability',
      virtual: false,
      featured: true,
      location: 'Centre de Formation, Lyon',
      meeting_link: '',
      tags: ['sustainability', 'workshop', 'environment']
    },
    {
      title: 'Soirée Networking VIP',
      description: 'Une soirée exclusive pour rencontrer les décideurs et entrepreneurs les plus influents.',
      type: 'networking',
      event_date: '2025-09-25',
      start_time: '18:30',
      end_time: '22:00',
      capacity: 100,
      registered: 0,
      category: 'networking',
      virtual: false,
      featured: false,
      location: 'Hôtel Plaza Athénée, Paris',
      meeting_link: '',
      tags: ['networking', 'vip', 'business']
    }
  ];

  try {
    const { data, error } = await supabase
      .from('events')
      .insert(sampleEvents)
      .select();

    if (error) {
      console.error('❌ Error creating sample events:', error);
      return;
    }

    console.log(`✅ Created ${data.length} sample events:`);
    data.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
    });

  } catch (error) {
    console.error('❌ Error creating events:', error);
  }
}

diagnoseEvents().catch(console.error);
