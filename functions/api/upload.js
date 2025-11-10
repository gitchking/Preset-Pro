// File upload and preset management API with Supabase
// Handles both file uploads and preset retrieval
import { createClient } from '@supabase/supabase-js'

// Handle GET requests to fetch presets
export async function onRequestGet(context) {
  try {
    // Supabase configuration from environment variables
    const SUPABASE_URL = context.env.SUPABASE_URL || 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
    const SUPABASE_KEY = context.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data: presets, error } = await supabase
      .from('presets')
      .select('id, name, effects, preview_url, download_url, file_type, downloads, likes, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error(error.message)
    }

    return new Response(JSON.stringify({
      success: true,
      presets: presets || []
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error fetching presets:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch presets: ' + error.message,
      success: true,
      presets: []
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}

// Handle POST requests for file uploads
export async function onRequestPost(context) {
  try {
    const { request, env } = context
    
    console.log('Upload request received')
    
    // Supabase configuration from environment variables
    const SUPABASE_URL = env.SUPABASE_URL || 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
    const SUPABASE_KEY = env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Parse multipart form data
    const formData = await request.formData()
    
    const name = formData.get('name')
    const effects = formData.get('effects')
    const downloadLink = formData.get('downloadLink') || ''
    const previewFile = formData.get('previewFile')
    const presetFile = formData.get('presetFile')

    console.log('Form data parsed:', { 
      name, 
      effects, 
      downloadLink,
      hasPreviewFile: !!previewFile,
      hasPresetFile: !!presetFile,
      previewFileSize: previewFile?.size,
      presetFileSize: presetFile?.size
    })

    // Validate required fields
    if (!name || !effects) {
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

    // Validate that at least preview file is provided
    if (!previewFile || previewFile.size === 0) {
      return new Response(JSON.stringify({ 
        error: 'Preview file is required',
        success: false
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    let previewUrl = ''
    let presetDownloadUrl = downloadLink || ''

    // Handle preview file - reduce size limit to 5MB for better reliability
    if (previewFile && previewFile.size > 0) {
      if (previewFile.size > 5 * 1024 * 1024) {
        return new Response(JSON.stringify({ 
          error: 'Preview file too large. Maximum size is 5MB.',
          success: false
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }

      try {
        console.log('Processing preview file...')
        const arrayBuffer = await previewFile.arrayBuffer()
        
        // Use a more efficient base64 encoding for smaller files
        const uint8Array = new Uint8Array(arrayBuffer)
        let binaryString = ''
        const chunkSize = 8192
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize)
          binaryString += String.fromCharCode.apply(null, chunk)
        }
        
        const base64 = btoa(binaryString)
        const mimeType = previewFile.type || 'image/gif'
        previewUrl = `data:${mimeType};base64,${base64}`
        console.log('Preview file processed successfully')
      } catch (fileError) {
        console.error('Error processing preview file:', fileError)
        return new Response(JSON.stringify({ 
          error: 'Failed to process preview file: ' + fileError.message,
          success: false
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
    }

    // Handle preset file (optional)
    if (presetFile && presetFile.size > 0) {
      if (presetFile.size > 25 * 1024 * 1024) { // Reduced to 25MB
        return new Response(JSON.stringify({ 
          error: 'Preset file too large. Maximum size is 25MB.',
          success: false
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }

      try {
        console.log('Processing preset file...')
        const arrayBuffer = await presetFile.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        let binaryString = ''
        const chunkSize = 8192
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize)
          binaryString += String.fromCharCode.apply(null, chunk)
        }
        
        const base64 = btoa(binaryString)
        
        // Store file data in database
        const { data: fileResult, error: fileError } = await supabase
          .from('preset_files')
          .insert([
            {
              filename: presetFile.name,
              content_type: presetFile.type,
              file_data: base64,
              file_size: presetFile.size
            }
          ])
          .select()

        if (fileError) {
          console.error('Error storing preset file:', fileError)
        } else if (fileResult && fileResult.length > 0) {
          presetDownloadUrl = `/api/download/${fileResult[0].id}`
          console.log('Preset file stored successfully')
        }
      } catch (fileError) {
        console.error('Error processing preset file:', fileError)
        // Don't fail the whole upload if preset file fails
        console.log('Continuing without preset file...')
      }
    }

    // Insert preset into database
    console.log('Inserting preset into Supabase database...')
    
    // Extract file extension from preset file name if available
    let fileType = '.ffx' // Default
    if (presetFile) {
      const parts = presetFile.name.split('.')
      if (parts.length > 1) {
        fileType = '.' + parts[parts.length - 1].toLowerCase()
      }
    }
    
    const { data: result, error: insertError } = await supabase
      .from('presets')
      .insert([
        {
          name: name,
          effects: effects,
          preview_url: previewUrl,
          download_url: presetDownloadUrl,
          file_type: fileType,
          status: 'approved',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()

    if (insertError) {
      throw new Error('Database insert failed: ' + insertError.message)
    }

    console.log('Database insert result:', result)

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Preset uploaded successfully!',
      id: result[0].id
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Error uploading preset:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to upload preset: ' + error.message,
      success: false,
      details: error.stack
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}