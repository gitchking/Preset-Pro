// Test 0x0.st integration
export async function onRequestGet(context) {
  try {
    // Test 0x0.st by creating a small test file
    const testContent = `0x0.st API Test - ${new Date().toISOString()}`;
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'null-test.txt', { type: 'text/plain' });
    
    // Create FormData for test upload
    const formData = new FormData();
    formData.append('file', testFile);

    // Test upload to 0x0.st
    const response = await fetch('https://0x0.st', {
      method: 'POST',
      body: formData,
    });

    const result = await response.text();
    
    return new Response(JSON.stringify({
      success: true,
      message: '0x0.st API test',
      test_upload: {
        response_ok: response.ok,
        status: response.status,
        result: result.trim(),
        is_valid_url: result.startsWith('https://0x0.st/'),
        file_size: testFile.size,
        service_info: {
          name: '0x0.st',
          max_file_size: '512MB',
          features: ['Direct downloads', 'No registration', 'Permanent storage']
        }
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
      error: '0x0.st test failed: ' + error.message,
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