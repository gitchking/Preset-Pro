// Debug endpoint to check GIF storage and retrieval with Supabase
import { createClient } from '@supabase/supabase-js'

export async function onRequestGet(context) {
  try {
    // Supabase configuration from environment variables
    const SUPABASE_URL = context.env.SUPABASE_URL || 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
    const SUPABASE_KEY = context.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    
    const url = new URL(context.request.url)
    const presetId = url.searchParams.get('id')

    if (presetId) {
      // Debug specific preset
      const { data: preset, error } = await supabase
        .from('presets')
        .select('id, name, preview_url, download_url, file_type, created_at')
        .eq('id', presetId)
        .single()

      if (error || !preset) {
        return new Response(JSON.stringify({ error: 'Preset not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const debugInfo = {
        preset: {
          id: preset.id,
          name: preset.name,
          file_type: preset.file_type,
          created_at: preset.created_at,
          download_url: preset.download_url
        },
        preview_url_info: {
          is_data_url: preset.preview_url.startsWith('data:'),
          mime_type: preset.preview_url.startsWith('data:') ? 
            preset.preview_url.split(';')[0].replace('data:', '') : 'external',
          length: preset.preview_url.length,
          first_100_chars: preset.preview_url.substring(0, 100),
          is_base64: preset.preview_url.includes('base64,')
        }
      }

      return new Response(JSON.stringify(debugInfo, null, 2), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // List all presets with debug info
    const { data: presets, error } = await supabase
      .from('presets')
      .select('id, name, preview_url, download_url, file_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      throw new Error(error.message)
    }

    const debugInfo = {
      total_presets: presets?.length || 0,
      presets: presets?.map(preset => ({
        id: preset.id,
        name: preset.name,
        file_type: preset.file_type,
        preview_url_length: preset.preview_url.length,
        is_data_url: preset.preview_url.startsWith('data:'),
        mime_type: preset.preview_url.startsWith('data:') ? 
          preset.preview_url.split(';')[0].replace('data:', '') : 'external',
        created_at: preset.created_at
      })) || []
    }

    return new Response(JSON.stringify(debugInfo, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Debug failed: ' + error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}