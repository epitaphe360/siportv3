import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function fixRLS() {
  try {
    // Drop the existing policy
    await supabase.rpc('exec_sql', {
      sql: `DROP POLICY IF EXISTS "Anyone can read exhibitors" ON exhibitors;`
    });

    // Create new policy for public
    await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Anyone can read exhibitors" ON exhibitors FOR SELECT TO public USING (true);`
    });

    console.log('RLS policy updated to allow public read access');
  } catch (error) {
    console.error('Error updating RLS:', error);
  }
}

fixRLS();
