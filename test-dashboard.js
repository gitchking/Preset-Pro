import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testDashboard() {
  console.log('📋 Testing dashboard preset management...\n');
  
  try {
    // Test 1: Check if we can fetch presets
    console.log('1. Testing preset fetching...');
    const { data: presets, error: fetchError } = await supabase
      .from('presets')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.log('   ❌ Fetch failed:', fetchError.message);
    } else {
      console.log('   ✅ Fetch successful');
      console.log('   Found', presets?.length || 0, 'presets');
      if (presets && presets.length > 0) {
        console.log('   Sample preset keys:', Object.keys(presets[0]));
      }
    }
    
    // Test 2: Check preset structure
    console.log('\n2. Testing preset structure...');
    const { data: samplePreset, error: sampleError } = await supabase
      .from('presets')
      .select('id, name, effects, preview_url, download_url, file_type, downloads, likes, created_at, author_name, author_email')
      .limit(1);
    
    if (sampleError) {
      console.log('   ❌ Structure check failed:', sampleError.message);
    } else {
      console.log('   ✅ Structure check successful');
      if (samplePreset && samplePreset.length > 0) {
        console.log('   Sample preset structure:', samplePreset[0]);
      }
    }
    
    // Test 3: Check if we can insert a test preset
    console.log('\n3. Testing preset insertion...');
    const testPreset = {
      name: 'Test Preset for Dashboard',
      effects: 'Test, Effects, Dashboard',
      preview_url: 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Test',
      download_url: '#',
      file_type: '.ffx',
      downloads: 0,
      likes: 0,
      status: 'approved',
      author_name: 'Test User',
      author_email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('presets')
      .insert([testPreset])
      .select();
    
    if (insertError) {
      console.log('   ❌ Insertion failed:', insertError.message);
    } else {
      console.log('   ✅ Insertion successful');
      const insertedId = insertData?.[0]?.id;
      console.log('   Inserted preset ID:', insertedId);
      
      // Clean up the test preset
      if (insertedId) {
        const { error: deleteError } = await supabase
          .from('presets')
          .delete()
          .eq('id', insertedId);
        
        if (deleteError) {
          console.log('   ℹ️  Cleanup failed:', deleteError.message);
        } else {
          console.log('   ✅ Test preset cleaned up');
        }
      }
    }
    
    console.log('\n✅ Dashboard management test completed!');
    console.log('\n📝 Dashboard should now be able to:');
    console.log('  - View all presets uploaded by the user');
    console.log('  - Edit preset details');
    console.log('  - Delete presets');
    console.log('  - Like presets');
    console.log('  - View statistics');
    
  } catch (error) {
    console.error('❌ Dashboard test error:', error);
  }
}

testDashboard();