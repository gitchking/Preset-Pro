import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAuthFix() {
  console.log('🔐 Testing authentication fix...\n');
  
  try {
    // Test 1: Check if we can authenticate
    console.log('1. Testing authentication...');
    
    // Sign up a test user
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signupError) {
      console.log('   ❌ Signup failed:', signupError.message);
    } else {
      console.log('   ✅ Signup successful');
      console.log('   User ID:', signupData.user?.id);
    }
    
    // Test 2: Check session
    console.log('\n2. Testing session management...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('   ❌ Session check failed:', sessionError.message);
    } else {
      console.log('   ✅ Session check successful');
      console.log('   Has session:', !!sessionData.session);
    }
    
    // Test 3: Check users table access (basic columns)
    console.log('\n3. Testing users table access...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    
    if (usersError) {
      console.log('   ℹ️  Basic users table access:', usersError.message);
    } else {
      console.log('   ✅ Basic users table access successful');
    }
    
    console.log('\n✅ Authentication fix test completed!');
    console.log('\n📝 Next steps:');
    console.log('  1. Run update-users-table.sql in Supabase dashboard');
    console.log('  2. Test login functionality in the app');
    console.log('  3. Verify user profile management works');
    
  } catch (error) {
    console.error('❌ Authentication fix test error:', error);
  }
}

testAuthFix();