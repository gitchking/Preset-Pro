// Test upload services to see which ones are working
export async function onRequestGet(context) {
  try {
    const results = {};
    
    // Test Pomf.lain.la
    try {
      const testContent = `Test file - ${new Date().toISOString()}`;
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('files[]', testFile);
      
      const response = await fetch('https://pomf.lain.la/upload.php', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      results.pomf = {
        status: response.ok ? 'success' : 'failed',
        response: result,
        url: result.files?.[0]?.url || null
      };
    } catch (error) {
      results.pomf = {
        status: 'error',
        error: error.message
      };
    }
    
    // Test File.io
    try {
      const testContent = `Test file - ${new Date().toISOString()}`;
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', testFile);
      
      const response = await fetch('https://file.io', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      results.fileio = {
        status: response.ok ? 'success' : 'failed',
        response: result,
        url: result.link || null
      };
    } catch (error) {
      results.fileio = {
        status: 'error',
        error: error.message
      };
    }
    
    // Test 0x0.st
    try {
      const testContent = `Test file - ${new Date().toISOString()}`;
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', testFile);
      
      const response = await fetch('https://0x0.st', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.text();
      
      results.nullpointer = {
        status: response.ok ? 'success' : 'failed',
        response: result,
        url: result.startsWith('https://') ? result.trim() : null
      };
    } catch (error) {
      results.nullpointer = {
        status: 'error',
        error: error.message
      };
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Upload services test completed',
      results,
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
      error: 'Test failed: ' + error.message,
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