import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

async function fixEventsRLS() {
  console.log('🔧 Applying RLS fix for events...');

  try {
    // First, check if the policy already exists
    const { data: existingPolicies, error: checkError } = await supabase
      .rpc('get_policies', { table_name: 'events' });

    if (checkError) {
      console.log('ℹ️  Cannot check existing policies, proceeding with creation...');
    }

    // Apply the RLS policy to allow public read access
    const { error } = await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Public can read events" ON events FOR SELECT TO anon USING (true);`
    });

    if (error) {
      // If the policy already exists, this is expected
      if (error.message.includes('already exists')) {
        console.log('✅ Policy already exists');
      } else {
        console.error('❌ Error applying RLS policy:', error);
      }
    } else {
      console.log('✅ RLS policy applied successfully!');
    }

    // Test the fix by fetching events with anon key
    const testSupabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data: events, error: testError } = await testSupabase
      .from('events')
      .select('*')
      .limit(5);

    if (testError) {
      console.error('❌ Test failed:', testError);
    } else {
      console.log(`✅ Test successful! Found ${events.length} events accessible to public`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixEventsRLS().catch(console.error);
