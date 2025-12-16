import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function createUserProfiles() {
  console.log('🚀 Creating user profiles in users table...\n');
  
  for (const testUser of TEST_USERS) {
    console.log(`Processing: ${testUser.email}`);
    
    // Step 1: Sign in to get user ID
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    });
    
    if (authError) {
      console.log(`  ❌ Auth failed: ${authError.message}`);
      continue;
    }
    
    const userId = authData.user?.id;
    if (!userId) {
      console.log(`  ❌ No user ID`);
      continue;
    }
    
    console.log(`  User ID: ${userId}`);
    
    // Step 2: Check if profile exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (existing) {
      console.log(`  ⚠️  Profile already exists`);
      await supabase.auth.signOut();
      continue;
    }
    
    // Step 3: Create profile with minimal required fields
    const { data: newProfile, error: profileError } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email: testUser.email,
        name: testUser.name,
        type: testUser.type,
        visitor_level: testUser.visitor_level
      }])
      .select()
      .single();
    
    if (profileError) {
      console.log(`  ❌ Profile creation failed: ${profileError.message}`);
    } else {
      console.log(`  ✅ Profile created successfully!`);
    }
    
    await supabase.auth.signOut();
  }
  
  console.log('\n✅ Done!');
}

createUserProfiles().catch(console.error);
