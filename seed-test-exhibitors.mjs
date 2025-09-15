import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTestExhibitors() {
  console.log('🌱 Seeding test exhibitors...');

  try {
    // First check if we already have test exhibitors
    const { data: existingExhibitors } = await supabase
      .from('exhibitors')
      .select('id, company_name')
      .or('company_name.eq.Maritime Solutions Inc,company_name.eq.Port Tech Systems');

    if (existingExhibitors && existingExhibitors.length > 0) {
      console.log('✅ Test exhibitors already exist:', existingExhibitors.map(e => e.company_name).join(', '));
      return;
    }

    // Create simple exhibitors directly
    const { data: exhibitors, error: exhibitorError } = await supabase
      .from('exhibitors')
      .insert([
        {
          company_name: 'Maritime Solutions Inc',
          description: 'Provider of innovative maritime technology solutions for ports and shipping companies.',
          verified: true,
          featured: true,
          contact_info: {
            email: 'info@maritimesolutions.example',
            phone: '+33123456789'
          }
        },
        {
          company_name: 'Port Tech Systems',
          description: 'Comprehensive port management and infrastructure solutions for modern ports.',
          verified: true,
          featured: false,
          contact_info: {
            email: 'contact@porttechsystems.example',
            phone: '+33987654321'
          }
        }
      ])
      .select();

    if (exhibitorError) {
      console.error('❌ Error creating exhibitors:', exhibitorError);
    } else {
      console.log('✅ Exhibitors created successfully:', exhibitors.map(e => e.company_name).join(', '));
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }

  console.log('🎉 Test data seeding completed!');
}

seedTestExhibitors().catch(error => {
  console.error('❌ Error during seeding:', error);
  process.exit(1);
});
