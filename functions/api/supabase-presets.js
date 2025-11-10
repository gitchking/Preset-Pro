// Cloudflare Worker for Preset Management with Supabase Database
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'

// Handle GET requests to fetch presets from Supabase database
export async function onRequestGet(context) {
  try {
    console.log('Fetching presets from Supabase database...');
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // Query to get all approved presets ordered by creation date
    const { data, error } = await supabase
      .from('presets')
      .select('id, name, effects, preview_url, download_url, file_type, downloads, likes, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      console.error('Supabase error:', error)
      throw new Error(error.message)
    }
    
    console.log(`Retrieved ${data ? data.length : 0} presets from database`)
    
    return new Response(JSON.stringify({
      success: true,
      presets: data || [],
      count: (data || []).length
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
    
  } catch (error) {
    console.error('Error fetching presets from Supabase:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch presets: ' + error.message,
      presets: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// Handle POST requests to submit presets to Supabase database
export async function onRequestPost(context) {
  try {
    console.log('Received preset submission request')
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    // Parse form data
    const formData = await context.request.json()
    
    console.log('Form data received:', {
      name: formData.name,
      effects: formData.effects,
      hasPreview: !!formData.previewGif,
      hasDownload: !!formData.downloadLink
    })
    
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Preset name is required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    if (!formData.effects || !formData.effects.trim()) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Effects description is required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    if (!formData.previewGif) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Preview image/video is required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // Extract file extension from preset file name if available
    let fileType = '.ffx' // Default
    if (formData.presetFileName) {
      const parts = formData.presetFileName.split('.')
      if (parts.length > 1) {
        fileType = '.' + parts[parts.length - 1].toLowerCase()
      }
    }
    
    console.log('Inserting preset into Supabase database...')
    
    // Prepare preset data
    const presetData = {
      name: formData.name.trim(),
      effects: formData.effects.trim(),
      preview_url: formData.previewGif,
      download_url: formData.downloadLink || '#',
      file_type: fileType,
      downloads: 0,
      likes: 0,
      status: 'approved', // Auto-approve for now
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    // Insert preset into Supabase database
    const { data, error } = await supabase
      .from('presets')
      .insert([presetData])
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      throw new Error(error.message)
    }
    
    console.log('New preset created:', data[0])
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Preset submitted successfully!',
      preset: data[0]
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
    
  } catch (error) {
    console.error('Error submitting preset to Supabase:', error)
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

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}