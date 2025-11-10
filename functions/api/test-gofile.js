// Test GoFile integration
export async function onRequestGet(context) {
  try {
    // Test GoFile server endpoint
    const serverResponse = await fetch('https://api.gofile.io/getServer');
    const serverData = await serverResponse.json();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'GoFile API test',
      server_test: {
        status: serverData.status,
        server: serverData.data?.server,
        response_ok: serverResponse.ok
      },
      timestamp: new Date().toISOString()
    }, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'GoFile test failed: ' + error.message,
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