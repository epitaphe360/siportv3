import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogin() {
  const email = 'visitor-free@test.com';
  const password = 'Test123456!';
  
  console.log('🔐 Testing login for:', email);
  console.log('');
  
  // Test 1: Try to sign in
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (authError) {
    console.error('❌ Auth Error:', authError.message);
    return;
  }
  
  console.log('✅ Authentication successful!');
  console.log('User ID:', authData.user?.id);
  console.log('Email:', authData.user?.email);
  console.log('');
  
  // Test 2: Check if user profile exists in users table
  console.log('🔍 Checking user profile in users table...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (userError) {
    console.error('❌ User profile error:', userError.message);
    console.log('');
    console.log('⚠️  PROBLEM: User authenticated but no profile in users table!');
    console.log('   This is why login fails - getUserByEmail() returns null');
    return;
  }
  
  console.log('✅ User profile found!');
  console.log('Profile data:', JSON.stringify(userData, null, 2));
  
  // Sign out
  await supabase.auth.signOut();
}

checkLogin().catch(console.error);
