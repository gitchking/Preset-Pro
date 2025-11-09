// Simple test endpoint for file uploads
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse JSON data
    const data = await request.json();
    
    console.log('Test upload received:', {
      name: data.name,
      effects: data.effects,
      hasPreview: !!data.previewGif,
      previewSize: data.previewGif ? data.previewGif.length : 0,
      downloadLink: data.downloadLink
    });

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
      });
    }

    // Check if database is available
    if (!env.DB) {
      return new Response(JSON.stringify({ 
        error: 'Database not available',
        success: false
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Insert into database with minimal data
    const result = await env.DB.prepare(`
      INSERT INTO presets (name, effects, preview_url, download_url, file_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.effects,
      data.previewGif || 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Preview',
      data.downloadLink || '#',
      '.ffx',
      'approved'
    ).run();

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Preset uploaded successfully!',
        id: result.meta.last_row_id
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      throw new Error('Database insert failed');
    }

  } catch (error) {
    console.error('Error in test upload:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed: ' + error.message,
      success: false
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
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
  });
}