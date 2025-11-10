import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testAuth() {
  console.log('🔐 Testing Supabase Authentication...\n');
  
  try {
    // Test 1: Check if we can sign up a new user
    console.log('1. Testing user signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'test-user-' + Date.now() + '@example.com',
      password: 'testpassword123'
    });
    
    if (signupError) {
      console.log('   ❌ Signup failed:', signupError.message);
    } else {
      console.log('   ✅ Signup successful');
      console.log('   User ID:', signupData.user?.id);
      console.log('   User email:', signupData.user?.email);
    }
    
    // Test 2: Check if we can sign in
    console.log('\n2. Testing user signin...');
    const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
      email: 'test-user-' + Date.now() + '@example.com',
      password: 'testpassword123'
    });
    
    if (signinError) {
      console.log('   ❌ Signin failed:', signinError.message);
    } else {
      console.log('   ✅ Signin successful');
      console.log('   User ID:', signinData.user?.id);
      console.log('   Access token length:', signinData.session?.access_token?.length);
    }
    
    // Test 3: Check current session
    console.log('\n3. Testing current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('   ❌ Session check failed:', sessionError.message);
    } else {
      console.log('   ✅ Session check successful');
      console.log('   Has session:', !!sessionData.session);
      if (sessionData.session) {
        console.log('   Session user ID:', sessionData.session.user?.id);
      }
    }
    
    // Test 4: Check users table access
    console.log('\n4. Testing users table access...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('   ❌ Users table access failed:', usersError.message);
    } else {
      console.log('   ✅ Users table access successful');
      console.log('   Users count:', usersData?.length || 0);
    }
    
    console.log('\n✅ Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Authentication test error:', error);
  }
}

testAuth();