// Debug endpoint to check database contents with Supabase
import { createClient } from '@supabase/supabase-js'

export async function onRequestGet(context) {
  try {
    // Supabase configuration from environment variables
    const SUPABASE_URL = context.env.SUPABASE_URL || 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
    const SUPABASE_KEY = context.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Get all presets
    const { data: presets, error: presetsError } = await supabase
      .from('presets')
      .select('*')
      .order('created_at', { ascending: false })

    if (presetsError) {
      throw new Error('Presets query failed: ' + presetsError.message)
    }

    // Note: preset_files table may not exist in Supabase, so we'll skip this for now
    const files = []

    return new Response(JSON.stringify({
      success: true,
      presets: presets || [],
      files: files || [],
      presets_count: presets?.length || 0,
      files_count: files?.length || 0
    }, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return new Response(JSON.stringify({ 
      error: 'Debug failed: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}