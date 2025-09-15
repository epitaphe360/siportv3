import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://eqjoqgpbxhsfgcovipgu.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxam9xZ3BieGhzZmdjb3ZpcGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNjIyNDcsImV4cCI6MjA3MjkzODI0N30.W8NfGyGQRBvVPAeS-EYq5TLjMBRTASLf5AgHES3aieE';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChatTables() {
  console.log('🔍 Checking chat tables in Supabase...');
  console.log('URL:', supabaseUrl);

  const tables = ['conversations', 'messages', 'message_attachments'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table '${table}' error:`, error.message);
        if (error.code === 'PGRST116') {
          console.log(`   → Table '${table}' exists but RLS policy blocks access`);
        }
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
        console.log(`   → Found ${data ? data.length : 0} records`);
      }
    } catch (error) {
      console.error(`❌ Error checking table '${table}':`, error.message);
    }
  }
}

checkChatTables().catch(console.error);
