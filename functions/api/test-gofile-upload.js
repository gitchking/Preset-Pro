// Test GoFile upload functionality
export async function onRequestPost(context) {
  try {
    const { request } = context;
    
    // Parse the uploaded file
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No file provided'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    console.log('Testing GoFile upload with file:', file.name, 'Size:', file.size);

    // Get GoFile server
    let server = 'store1';
    try {
      const serverResponse = await fetch('https://api.gofile.io/getServer');
      const serverData = await serverResponse.json();
      if (serverData.status === 'ok' && serverData.data?.server) {
        server = serverData.data.server;
      }
    } catch (serverError) {
      console.warn('Failed to get GoFile server, using fallback:', serverError);
    }

    // Upload to GoFile
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const uploadResponse = await fetch(`https://${server}.gofile.io/uploadFile`, {
      method: 'POST',
      body: uploadFormData
    });

    if (!uploadResponse.ok) {
      throw new Error(`GoFile HTTP error: ${uploadResponse.status} ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'GoFile upload test completed',
      server_used: server,
      gofile_response: uploadResult,
      file_info: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      timestamp: new Date().toISOString()
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('GoFile upload test error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'GoFile upload test failed: ' + error.message,
      timestamp: new Date().toISOString()
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