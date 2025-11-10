import { supabase } from './src/utils/supabaseClient';

async function testSupabaseAuth() {
  console.log('Testing Supabase Auth...');

  // Test auth state
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);

  // Test user registration (uncomment to test)
  /*
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123',
    options: {
      data: {
        name: 'Test User',
        gender: 'prefer-not-to-say'
      }
    }
  });
  
  if (error) {
    console.error('Registration error:', error);
  } else {
    console.log('Registration successful:', data);
  }
  */

  // Test user login (uncomment to test)
  /*
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'testpassword123'
  });
  
  if (error) {
    console.error('Login error:', error);
  } else {
    console.log('Login successful:', data);
  }
  */
}

testSupabaseAuth();