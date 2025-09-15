import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPublicEventsAccess() {
  console.log('🧪 Testing public access to events...');

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('featured', { ascending: false })
      .order('event_date')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching events:', error);
      console.log('🔍 This suggests RLS is still blocking public access');

      // Try with service role to confirm events exist
      console.log('🔧 Checking with service role...');
      const serviceSupabase = createClient(supabaseUrl, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
      const { data: serviceEvents, error: serviceError } = await serviceSupabase
        .from('events')
        .select('*')
        .limit(5);

      if (serviceError) {
        console.error('❌ Service role also failed:', serviceError);
      } else {
        console.log(`✅ Service role can access ${serviceEvents.length} events`);
        console.log('📋 RLS policies need to be fixed manually in Supabase dashboard');
      }

    } else {
      console.log(`✅ SUCCESS! Public access works. Found ${events.length} events:`);
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.title} (${event.category})`);
      });

      if (events.length > 0) {
        console.log('\n🎉 The events should now be visible in your application!');
        console.log('🔄 Try refreshing http://localhost:5178/ to see the events.');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPublicEventsAccess().catch(console.error);
