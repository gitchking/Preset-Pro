// Debug endpoint to check database contents
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    // Get all presets
    const presets = await env.DB.prepare(`
      SELECT * FROM presets ORDER BY created_at DESC
    `).all();

    // Get all files
    const files = await env.DB.prepare(`
      SELECT id, filename, content_type, file_size, uploaded_at FROM preset_files ORDER BY uploaded_at DESC
    `).all();

    return new Response(JSON.stringify({
      success: true,
      presets: presets.results || [],
      files: files.results || [],
      presets_count: presets.results?.length || 0,
      files_count: files.results?.length || 0
    }, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return new Response(JSON.stringify({ 
      error: 'Debug failed: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}