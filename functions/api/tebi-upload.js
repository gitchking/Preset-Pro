// Tebi S3-compatible upload API
// Based on official Tebi API documentation: https://docs.tebi.io/api/

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    
    console.log('Tebi upload request received');
    
    // Check if Tebi credentials are configured
    if (!env.TEBI_ACCESS_KEY || !env.TEBI_SECRET_KEY) {
      console.error('Tebi credentials not configured');
      return new Response(JSON.stringify({ 
        error: 'Tebi storage not configured. Please add TEBI_ACCESS_KEY and TEBI_SECRET_KEY environment variables.',
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
    
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file');
    const key = formData.get('key');
    const originalName = formData.get('originalName');

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
      originalName,
      size: file.size,
      type: file.type,
      key
    });

    try {
      // Upload to Tebi using proper S3-compatible API
      const arrayBuffer = await file.arrayBuffer();
      
      // Tebi S3 endpoint (according to their docs)
      const bucketName = 'preset-pro-files';
      const tebiEndpoint = 'https://s3.tebi.io';
      const uploadUrl = `${tebiEndpoint}/${bucketName}/${key}`;
      
      // Generate proper AWS Signature Version 4
      const date = new Date();
      const dateString = date.toISOString().split('T')[0].replace(/-/g, '');
      const timeString = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
      
      // Create authorization header using AWS Signature V4
      const region = 'global'; // Tebi uses 'global' region
      const service = 's3';
      const algorithm = 'AWS4-HMAC-SHA256';
      
      const credential = `${env.TEBI_ACCESS_KEY}/${dateString}/${region}/${service}/aws4_request`;
      const signedHeaders = 'host;x-amz-acl;x-amz-content-sha256;x-amz-date';
      
      // Calculate content hash
      const contentHash = await sha256(arrayBuffer);
      
      // Create canonical request
      const canonicalRequest = [
        'PUT',
        `/${bucketName}/${key}`,
        '',
        `host:s3.tebi.io`,
        `x-amz-acl:public-read`,
        `x-amz-content-sha256:${contentHash}`,
        `x-amz-date:${timeString}`,
        '',
        signedHeaders,
        contentHash
      ].join('\n');
      
      // Create string to sign
      const canonicalRequestHash = await sha256(new TextEncoder().encode(canonicalRequest));
      const stringToSign = [
        algorithm,
        timeString,
        `${dateString}/${region}/${service}/aws4_request`,
        canonicalRequestHash
      ].join('\n');
      
      // Calculate signature
      const signature = await calculateSignature(env.TEBI_SECRET_KEY, dateString, region, service, stringToSign);
      
      // Create authorization header
      const authorization = `${algorithm} Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
      
      // Upload to Tebi
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Host': 's3.tebi.io',
          'Authorization': authorization,
          'x-amz-date': timeString,
          'x-amz-content-sha256': contentHash,
          'x-amz-acl': 'public-read',
          'Content-Type': file.type || 'application/octet-stream',
          'Content-Length': arrayBuffer.byteLength.toString()
        },
        body: arrayBuffer
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Tebi upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      console.log('Tebi upload successful');

      // Generate public URL (Tebi provides direct access to public files)
      const publicUrl = `${tebiEndpoint}/${bucketName}/${key}`;

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'File uploaded successfully to Tebi!',
        url: publicUrl,
        key: key,
        fileName: originalName,
        fileSize: file.size,
        bucketName: bucketName
      }), {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });

    } catch (tebiError) {
      console.error('Tebi upload error:', tebiError);
      return new Response(JSON.stringify({ 
        error: 'Failed to upload to Tebi: ' + tebiError.message,
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
    console.error('Error in Tebi upload:', error);
    return new Response(JSON.stringify({ 
      error: 'Tebi upload failed: ' + error.message,
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

// AWS Signature Version 4 helper functions
async function sha256(data) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key, data) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    typeof key === 'string' ? new TextEncoder().encode(key) : key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(data)
  );
  
  return new Uint8Array(signature);
}

async function calculateSignature(secretKey, dateString, region, service, stringToSign) {
  const kDate = await hmacSha256(`AWS4${secretKey}`, dateString);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  const signature = await hmacSha256(kSigning, stringToSign);
  
  return Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
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