// Test Tebi configuration and upload
export async function onRequestGet(context) {
  try {
    const { env } = context;
    
    // Check if Tebi credentials are configured
    const hasAccessKey = !!env.TEBI_ACCESS_KEY;
    const hasSecretKey = !!env.TEBI_SECRET_KEY;
    const accessKeyPreview = env.TEBI_ACCESS_KEY ? 
      env.TEBI_ACCESS_KEY.substring(0, 4) + '...' + env.TEBI_ACCESS_KEY.slice(-4) : 
      'Not set';
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Tebi configuration test',
      config: {
        hasAccessKey,
        hasSecretKey,
        accessKeyPreview,
        bucketName: 'preset-pro-files',
        endpoint: 'https://s3.tebi.io'
      },
      instructions: {
        step1: 'Add TEBI_ACCESS_KEY and TEBI_SECRET_KEY to Cloudflare Pages environment variables',
        step2: 'Create bucket "preset-pro-files" in Tebi dashboard',
        step3: 'Enable public read access on the bucket',
        step4: 'Redeploy your site after adding environment variables'
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
      error: 'Tebi test failed: ' + error.message,
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

// Test upload functionality
export async function onRequestPost(context) {
  try {
    const { env } = context;
    
    if (!env.TEBI_ACCESS_KEY || !env.TEBI_SECRET_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Tebi credentials not configured',
        success: false,
        setup_required: true
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Create a test file
    const testContent = `Tebi Test Upload - ${new Date().toISOString()}`;
    const testKey = `test/tebi-test-${Date.now()}.txt`;
    
    // Test upload using the tebi-upload API
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('key', testKey);
    formData.append('originalName', 'tebi-test.txt');
    
    const uploadResponse = await fetch('/api/tebi-upload', {
      method: 'POST',
      body: formData
    });

    const result = await uploadResponse.json();
    
    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Tebi test upload successful!',
        testFile: {
          key: testKey,
          url: result.url,
          fileName: result.fileName,
          fileSize: result.fileSize
        },
        tebiInfo: {
          endpoint: 'https://s3.tebi.io',
          bucket: 'preset-pro-files',
          freeStorage: '50GB',
          freeBandwidth: '250GB/month'
        },
        nextSteps: [
          'Your Tebi integration is working!',
          'You can now upload preset files up to 50GB total',
          'Files will have direct CDN URLs for fast downloads'
        ]
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      throw new Error(`Upload failed: ${result.error || 'Unknown error'}`);
    }

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Tebi upload test failed: ' + error.message,
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