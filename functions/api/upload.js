// Simple file storage using base64 encoding in database
// For production, you'd want to use proper file storage like R2, S3, etc.

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    // Parse multipart form data
    const formData = await request.formData();
    
    const name = formData.get('name');
    const effects = formData.get('effects');
    const downloadLink = formData.get('downloadLink') || '';
    const previewFile = formData.get('previewFile');
    const presetFile = formData.get('presetFile');

    // Validate required fields
    if (!name || !effects) {
      return new Response(JSON.stringify({ 
        error: 'Name and effects are required' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    let previewUrl = '';
    let presetDownloadUrl = '';

    // Handle preview file
    if (previewFile && previewFile.size > 0) {
      // Check file size (10MB limit)
      if (previewFile.size > 10 * 1024 * 1024) {
        return new Response(JSON.stringify({ 
          error: 'Preview file too large. Maximum size is 10MB.' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // Convert to base64 and store in database (temporary solution)
      const arrayBuffer = await previewFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = previewFile.type || 'image/gif';
      previewUrl = `data:${mimeType};base64,${base64}`;
    }

    // Handle preset file
    if (presetFile && presetFile.size > 0) {
      // Check file size (50MB limit for preset files)
      if (presetFile.size > 50 * 1024 * 1024) {
        return new Response(JSON.stringify({ 
          error: 'Preset file too large. Maximum size is 50MB.' 
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // For preset files, we'll create a download endpoint
      const arrayBuffer = await presetFile.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      // Store file data in database
      const fileResult = await env.DB.prepare(`
        INSERT INTO preset_files (filename, content_type, file_data, file_size)
        VALUES (?, ?, ?, ?)
      `).bind(
        presetFile.name,
        presetFile.type,
        base64,
        presetFile.size
      ).run();

      if (fileResult.success) {
        presetDownloadUrl = `/api/download/${fileResult.meta.last_row_id}`;
      }
    }

    // Insert preset into database
    const result = await env.DB.prepare(`
      INSERT INTO presets (name, effects, preview_url, download_url, file_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      effects,
      previewUrl || 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Preview',
      presetDownloadUrl || downloadLink,
      presetFile ? `.${presetFile.name.split('.').pop()}` : '.ffx',
      'approved' // Auto-approve for now
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
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } else {
      throw new Error('Failed to insert preset');
    }

  } catch (error) {
    console.error('Error uploading preset:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to upload preset: ' + error.message
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}