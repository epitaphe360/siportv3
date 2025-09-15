import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createPublicEventsView() {
  console.log('🔧 Creating public events view...');

  try {
    // Create a view that bypasses RLS
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW public_events AS
        SELECT * FROM events
        ORDER BY featured DESC, event_date ASC;
      `
    });

    if (viewError) {
      console.error('❌ Error creating view:', viewError);
      return;
    }

    console.log('✅ Public events view created');

    // Test the view
    const { data: events, error: testError } = await supabase
      .from('public_events')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('❌ Error testing view:', testError);
    } else {
      console.log(`✅ View works! Found ${events.length} events`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function directEventsQuery() {
  console.log('🔍 Testing direct query with service role...');

  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('featured', { ascending: false })
      .order('event_date')
      .limit(10);

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`✅ Found ${events.length} events with service role:`);
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.event_date})`);
    });

    // Try to update the RLS policy directly
    console.log('\n🔧 Attempting to fix RLS policy...');

    const policySQL = `
      DROP POLICY IF EXISTS "Anyone can read events" ON events;
      CREATE POLICY "Public can read events"
        ON events
        FOR SELECT
        TO public
        USING (true);
    `;

    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: policySQL
    });

    if (policyError) {
      console.error('❌ Could not apply RLS policy:', policyError.message);
      console.log('💡 You may need to apply this manually in Supabase dashboard:');
      console.log(policySQL);
    } else {
      console.log('✅ RLS policy applied successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

directEventsQuery().catch(console.error);
