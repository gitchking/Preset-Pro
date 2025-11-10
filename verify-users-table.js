import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyUsersTable() {
  console.log('🔍 Verifying users table structure after update...\n');
  
  try {
    // Check all required columns
    const requiredColumns = [
      'id', 'email', 'gender', 'avatar_url', 'bio', 'username', 
      'created_at', 'updated_at', 'name'
    ];
    
    console.log('📋 Checking required columns:');
    let allColumnsExist = true;
    
    for (const column of requiredColumns) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`   ❌ ${column}: ${error.message}`);
          allColumnsExist = false;
        } else {
          console.log(`   ✅ ${column}: column exists`);
        }
      } catch (e) {
        console.log(`   ❌ ${column}: error checking`);
        allColumnsExist = false;
      }
    }
    
    if (allColumnsExist) {
      console.log('\n✅ All required columns exist!');
    } else {
      console.log('\n❌ Some columns are missing');
    }
    
    // Test inserting a sample user record
    console.log('\n📝 Testing user record insertion...');
    
    // First, let's get a user ID from auth (if we have a session)
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const userId = session.user.id;
      const userEmail = session.user.email;
      
      console.log('   Using current session user:', userId);
      
      // Try to insert/update a user record
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          name: userEmail?.split('@')[0] || 'User',
          gender: 'prefer-not-to-say'
        }, { onConflict: 'id' })
        .select();
      
      if (insertError) {
        console.log('   ❌ User insertion failed:', insertError.message);
      } else {
        console.log('   ✅ User insertion successful');
        console.log('   Inserted user:', insertData?.[0]);
      }
    } else {
      console.log('   ℹ️  No active session, skipping insertion test');
    }
    
    console.log('\n✅ Users table verification completed!');
    
  } catch (error) {
    console.error('❌ Users table verification error:', error);
  }
}

verifyUsersTable();