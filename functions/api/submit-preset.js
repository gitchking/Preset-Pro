// Working preset submission endpoint
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    console.log('Preset submission received');
    
    // Parse request body
    const data = await request.json();
    console.log('Request data:', {
      name: data.name,
      effects: data.effects,
      hasPreview: !!data.previewGif,
      downloadLink: data.downloadLink
    });

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
      });
    }

    // Check database availability
    if (!env || !env.DB) {
      console.error('Database not available');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Database not configured'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Insert preset into database
    console.log('Inserting into database...');
    const result = await env.DB.prepare(`
      INSERT INTO presets (name, effects, preview_url, download_url, file_type, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      data.name,
      data.effects,
      data.previewGif || 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=' + encodeURIComponent(data.name),
      data.downloadLink || '#',
      '.ffx',
      'approved'
    ).run();

    console.log('Database result:', result);

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Preset submitted successfully!',
        id: result.meta.last_row_id
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      throw new Error('Database insert failed: ' + JSON.stringify(result));
    }

  } catch (error) {
    console.error('Error submitting preset:', error);
    return new Response(JSON.stringify({ 
      success: false,
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