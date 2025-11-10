// Cloudflare R2 file upload API
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    console.log('R2 upload request received');
    console.log('Environment keys:', Object.keys(env || {}));
    
    // Check if R2 bucket is available
    if (!env || !env.PRESET_BUCKET) {
      console.error('R2 bucket not available in environment');
      return new Response(JSON.stringify({ 
        error: 'R2 bucket not configured. Please check Cloudflare R2 binding.',
        success: false,
        debug: {
          hasEnv: !!env,
          envKeys: Object.keys(env || {}),
          hasBucket: !!(env && env.PRESET_BUCKET)
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
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ 
        error: 'No file provided',
        success: false
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'bin';
    const uniqueFileName = `presets/${timestamp}-${randomId}.${fileExtension}`;

    try {
      // Upload to R2
      console.log('Uploading to R2:', uniqueFileName);
      
      const arrayBuffer = await file.arrayBuffer();
      
      await env.PRESET_BUCKET.put(uniqueFileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
          contentDisposition: `attachment; filename="${file.name}"`
        },
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString()
        }
      });

      console.log('R2 upload successful');

      // Generate public URL (assuming R2 custom domain is configured)
      // You'll need to configure a custom domain for your R2 bucket
      const publicUrl = `https://files.your-domain.com/${uniqueFileName}`;
      
      // Alternative: Use Cloudflare Workers URL (if public access is enabled)
      // const publicUrl = `https://your-worker.your-subdomain.workers.dev/download/${uniqueFileName}`;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'File uploaded successfully to R2!',
        url: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        r2Key: uniqueFileName
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });

    } catch (r2Error) {
      console.error('R2 upload error:', r2Error);
      return new Response(JSON.stringify({ 
        error: 'Failed to upload to R2: ' + r2Error.message,
        success: false
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('Error in R2 upload:', error);
    return new Response(JSON.stringify({ 
      error: 'R2 upload failed: ' + error.message,
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