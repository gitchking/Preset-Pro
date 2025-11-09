// File upload and preset management API
// Handles both file uploads and preset retrieval

// Handle GET requests to fetch presets
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    // Check if DB is available
    if (!env.DB) {
      console.error('Database not available in environment');
      return new Response(JSON.stringify({
        success: true,
        presets: [],
        error: 'Database not configured'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
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
      success: true,
      presets: []
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Handle POST requests for file uploads
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    console.log('Upload request received');
    console.log('Environment keys:', Object.keys(env || {}));
    
    // Check if DB is available
    if (!env || !env.DB) {
      console.error('Database not available in environment');
      return new Response(JSON.stringify({ 
        error: 'Database not configured. Please check Cloudflare D1 binding.',
        success: false,
        debug: {
          hasEnv: !!env,
          envKeys: Object.keys(env || {}),
          hasDB: !!(env && env.DB)
        }
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Parse multipart form data
    const formData = await request.formData();
    
    const name = formData.get('name');
    const effects = formData.get('effects');
    const downloadLink = formData.get('downloadLink') || '';
    const previewFile = formData.get('previewFile');
    const presetFile = formData.get('presetFile');

    console.log('Form data parsed:', { 
      name, 
      effects, 
      downloadLink,
      hasPreviewFile: !!previewFile,
      hasPresetFile: !!presetFile,
      previewFileSize: previewFile?.size,
      presetFileSize: presetFile?.size
    });

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
      });
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
      });
    }

    let previewUrl = '';
    let presetDownloadUrl = downloadLink || '';

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
        });
      }

      try {
        console.log('Processing preview file...');
        const arrayBuffer = await previewFile.arrayBuffer();
        
        // Use a more efficient base64 encoding for smaller files
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, chunk);
        }
        
        const base64 = btoa(binaryString);
        const mimeType = previewFile.type || 'image/gif';
        previewUrl = `data:${mimeType};base64,${base64}`;
        console.log('Preview file processed successfully');
      } catch (fileError) {
        console.error('Error processing preview file:', fileError);
        return new Response(JSON.stringify({ 
          error: 'Failed to process preview file: ' + fileError.message,
          success: false
        }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
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
        });
      }

      try {
        console.log('Processing preset file...');
        const arrayBuffer = await presetFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        let binaryString = '';
        const chunkSize = 8192;
        
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, chunk);
        }
        
        const base64 = btoa(binaryString);
        
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
          console.log('Preset file stored successfully');
        }
      } catch (fileError) {
        console.error('Error processing preset file:', fileError);
        // Don't fail the whole upload if preset file fails
        console.log('Continuing without preset file...');
      }
    }

    // Insert preset into database
    console.log('Inserting preset into database...');
    const result = await env.DB.prepare(`
      INSERT INTO presets (name, effects, preview_url, download_url, file_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      name,
      effects,
      previewUrl,
      presetDownloadUrl,
      presetFile ? `.${presetFile.name.split('.').pop()}` : '.ffx',
      'approved'
    ).run();

    console.log('Database insert result:', result);

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
      throw new Error('Database insert failed: ' + JSON.stringify(result));
    }

  } catch (error) {
    console.error('Error uploading preset:', error);
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