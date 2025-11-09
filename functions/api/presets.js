// Handle POST requests to submit presets
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse form data
    const formData = await request.json();
    
    // Validate required fields
    if (!formData.name || !formData.effects || !formData.previewGif || !formData.downloadLink) {
      return new Response(JSON.stringify({ 
        error: 'All fields are required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Insert into database
    const result = await env.DB.prepare(`
      INSERT INTO presets (name, effects, preview_url, download_url, file_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      formData.name,
      formData.effects,
      formData.previewGif,
      formData.downloadLink,
      '.ffx', // Default file type
      'approved' // Auto-approve for now
    ).run();

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Preset submitted successfully!',
        id: result.meta.last_row_id
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      throw new Error('Failed to insert preset');
    }

  } catch (error) {
    console.error('Error submitting preset:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to submit preset: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
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
  });
}

// Handle GET requests to fetch presets
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    const result = await env.DB.prepare(`
      SELECT id, name, effects, preview_url, download_url, file_type, 
             downloads, likes, created_at
      FROM presets 
      WHERE status = 'approved'
      ORDER BY created_at DESC
      LIMIT 50
    `).all();

    return new Response(JSON.stringify({
      success: true,
      presets: result.results || []
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching presets:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch presets: ' + error.message,
      presets: []
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}