import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USERS = [
  {
    email: 'visitor-free@test.com',
    password: 'Test123456!',
    name: 'Visiteur Free',
    type: 'visitor',
    visitor_level: 'free'
  },
  {
    email: 'visitor-premium@test.com',
    password: 'Test123456!',
    name: 'Visiteur Premium',
    type: 'visitor',
    visitor_level: 'premium'
  }
];

async function createTestUsers() {
  console.log('🚀 Creating test users...\n');
  
  for (const user of TEST_USERS) {
    console.log(`Creating user: ${user.email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          name: user.name,
          type: user.type,
          visitor_level: user.visitor_level
        }
      }
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`  ⚠️  User already exists: ${user.email}`);
      } else {
        console.error(`  ❌ Error creating ${user.email}:`, error.message);
      }
    } else {
      console.log(`  ✅ Created: ${user.email}`);
      console.log(`     User ID: ${data.user?.id}`);
    }
  }
  
  console.log('\n✅ Test users creation completed!');
}

createTestUsers().catch(console.error);
