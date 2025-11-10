import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test connection by querying categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      console.log('Categories table data:', categories);
    }
    
    // Test connection by querying presets
    const { data: presets, error: presetsError } = await supabase
      .from('presets')
      .select('*')
      .limit(5);
    
    if (presetsError) {
      console.error('Error fetching presets:', presetsError);
    } else {
      console.log('Presets table data:', presets);
    }
    
    // Test connection by querying users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
    } else {
      console.log('Users table data:', users);
    }
    
    // Test connection by querying preset_files
    const { data: files, error: filesError } = await supabase
      .from('preset_files')
      .select('*')
      .limit(5);
    
    if (filesError) {
      console.error('Error fetching preset_files:', filesError);
    } else {
      console.log('Preset files table data:', files);
    }
    
  } catch (error) {
    console.error('Supabase test error:', error);
  }
}

testSupabase();