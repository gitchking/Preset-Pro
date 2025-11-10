// Working preset submission endpoint with Supabase
import { createClient } from '@supabase/supabase-js'

export async function onRequestPost(context) {
  try {
    const { request, env } = context
    
    console.log('Preset submission received')
    
    // Parse request body
    const data = await request.json()
    console.log('Request data:', {
      name: data.name,
      effects: data.effects,
      hasPreview: !!data.previewGif,
      downloadLink: data.downloadLink
    })

    // Validate required fields
    if (!data.name || !data.effects) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Name and effects are required'
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
      preview_url: data.previewGif || 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=' + encodeURIComponent(data.name),
      download_url: data.downloadLink || '#',
      file_type: '.ffx',
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert preset into database
    console.log('Inserting into Supabase database...')
    const { data: result, error } = await supabase
      .from('presets')
      .insert([presetData])
      .select()

    if (error) {
      throw new Error('Database insert failed: ' + error.message)
    }

    console.log('Database result:', result)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Preset submitted successfully!',
      id: result[0].id
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error submitting preset:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to submit preset: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

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