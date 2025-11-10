// Simple test endpoint for file uploads with Supabase
import { createClient } from '@supabase/supabase-js'

export async function onRequestPost(context) {
  try {
    const { request, env } = context
    
    // Parse JSON data
    const data = await request.json()
    
    console.log('Test upload received:', {
      name: data.name,
      effects: data.effects,
      hasPreview: !!data.previewGif,
      previewSize: data.previewGif ? data.previewGif.length : 0,
      downloadLink: data.downloadLink
    })

    // Simple validation
    if (!data.name || !data.effects) {
      return new Response(JSON.stringify({ 
        error: 'Name and effects are required',
        success: false
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Supabase configuration from environment variables
    const SUPABASE_URL = env.SUPABASE_URL || 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
    const SUPABASE_KEY = env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Prepare preset data
    const presetData = {
      name: data.name,
      effects: data.effects,
      preview_url: data.previewGif || 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Preview',
      download_url: data.downloadLink || '#',
      file_type: '.ffx',
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert into database
    const { data: result, error } = await supabase
      .from('presets')
      .insert([presetData])
      .select()

    if (error) {
      throw new Error('Database insert failed: ' + error.message)
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Preset uploaded successfully!',
      id: result[0].id
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error in test upload:', error)
    return new Response(JSON.stringify({ 
      error: 'Upload failed: ' + error.message,
      success: false
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// Handle CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}