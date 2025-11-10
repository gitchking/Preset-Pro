// Handle file downloads with Supabase
import { createClient } from '@supabase/supabase-js'

export async function onRequestGet(context) {
  try {
    const { params, env } = context
    const fileId = params.id

    if (!fileId) {
      return new Response('File ID required', { status: 400 })
    }

    // Supabase configuration from environment variables
    const SUPABASE_URL = env.SUPABASE_URL || 'https://fxyoyhqxuwoqlxyofmbg.supabase.co'
    const SUPABASE_KEY = env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eW95aHF4dXdvcWx4eW9mbWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzAwODYsImV4cCI6MjA3ODM0NjA4Nn0.cL-18bnkVMFFLUQtHehQMA04VZDiE2F8O0MCWe0mEBU'
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // Get file from database
    const { data: result, error } = await supabase
      .from('preset_files')
      .select('filename, content_type, file_data, file_size')
      .eq('id', fileId)
      .single()

    if (error || !result) {
      return new Response('File not found', { status: 404 })
    }

    // Convert base64 back to binary
    const binaryString = atob(result.file_data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': result.content_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.file_size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error downloading file:', error)
    return new Response('Download failed', { status: 500 })
  }
}