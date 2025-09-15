// Test script for user registration
// Run this in the browser console on the registration page

const testRegistration = async () => {
  console.log('🧪 Testing user registration flow...');

  // Test data
  const testUser = {
    accountType: 'visitor',
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    sector: 'Technologie',
    country: 'France',
    phone: '+33123456789',
    description: 'Test user for registration validation',
    objectives: ['Rencontrer des professionnels', 'Explorer les opportunités de carrière']
  };

  try {
    // Import the auth store
    const { useAuthStore } = await import('./src/store/authStore');

    // Get the register function
    const { register } = useAuthStore.getState();

    console.log('📝 Attempting registration with:', {
      email: testUser.email,
      type: testUser.accountType,
      name: `${testUser.firstName} ${testUser.lastName}`
    });

    // Attempt registration
    await register(testUser);

    console.log('✅ Registration successful! No 401 or RLS errors detected.');
    console.log('📧 Check your email for confirmation if email confirmation is enabled.');

  } catch (error) {
    console.error('❌ Registration failed:', error);

    if (error.message?.includes('401')) {
      console.error('🚨 401 Unauthorized error still present');
    }

    if (error.message?.includes('RLS') || error.message?.includes('policy')) {
      console.error('🚨 RLS policy violation still present');
    }

    // Log additional error details
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
};

// Auto-run the test
testRegistration();
