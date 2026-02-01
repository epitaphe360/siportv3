
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
try {
  const env = fs.readFileSync('.env', 'utf8');
  const envConfig = dotenv.parse(env);
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} catch (e) {
  console.log('Using process.env');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Supabase credentials missing (need SERVICE_ROLE_KEY for user updates)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function fixTestAccounts() {
  console.log('🔧 Fixing test account profiles...');

  const updates = [
    { email: 'exhibitor-18m@test.siport.com', area: 18 },
    { email: 'exhibitor-36m@test.siport.com', area: 36 },
    { email: 'exhibitor-54m@test.siport.com', area: 54 },
    { email: 'exhibitor-9m@test.siport.com', area: 9 }
  ];

  for (const { email, area } of updates) {
    try {
      // 1. Find user
      const { data: users } = await supabase
        .from('users')
        .select('id, profile, name')
        .eq('email', email);

      if (!users || users.length === 0) {
        console.log(`⚠️ User not found: ${email}`);
        continue;
      }

      const user = users[0];
      console.log(`👤 Found ${user.name} (${email})`);

      // 2. Prepare profile
      const currentProfile = user.profile || {};
      const newProfile = {
        ...currentProfile,
        standArea: area,
        company: currentProfile.company || user.name,
        companyName: currentProfile.companyName || user.name
      };

      // 3. Update
      const { error } = await supabase
        .from('users')
        .update({ profile: newProfile })
        .eq('id', user.id);

      if (error) {
        console.error(`❌ Failed to update ${email}:`, error.message);
      } else {
        console.log(`✅ Updated ${email} with standArea: ${area}m²`);
      }

    } catch (err) {
      console.error(`Unexpected error for ${email}:`, err);
    }
  }
}

fixTestAccounts();
