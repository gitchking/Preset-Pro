import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');
  
  try {
    // Try to get table info by selecting all columns
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing users table:', error.message);
      
      // Try to get table structure information
      const { data: info, error: infoError } = await supabase
        .from('users')
        .select('id, email, gender')
        .limit(1);
      
      if (infoError) {
        console.log('❌ Error with basic columns:', infoError.message);
      } else {
        console.log('✅ Basic columns exist:');
        console.log('   - id');
        console.log('   - email');
        console.log('   - gender');
        console.log('   Sample data:', info);
      }
    } else {
      console.log('✅ Users table accessible');
      if (data && data.length > 0) {
        console.log('   Sample record keys:', Object.keys(data[0]));
      } else {
        console.log('   Table is empty');
      }
    }
    
    // Check what columns we can identify
    console.log('\n📋 Attempting to identify available columns...');
    
    const possibleColumns = [
      'id', 'email', 'gender', 'avatar_url', 'bio', 'username', 
      'created_at', 'updated_at', 'name'
    ];
    
    for (const column of possibleColumns) {
      try {
        const { data: columnData, error: columnError } = await supabase
          .from('users')
          .select(column)
          .limit(1);
        
        if (columnError) {
          console.log(`   ❌ ${column}: ${columnError.message}`);
        } else {
          console.log(`   ✅ ${column}: column exists`);
        }
      } catch (e) {
        console.log(`   ❌ ${column}: error checking`);
      }
    }
    
    console.log('\n✅ Table structure check completed!');
    
  } catch (error) {
    console.error('❌ Table structure check error:', error);
  }
}

checkUsersTable();