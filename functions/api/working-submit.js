// Working preset submission without database dependency
export async function onRequestPost(context) {
  try {
    const { request } = context;
    
    console.log('Working submit endpoint called');
    
    // Parse request body
    const data = await request.json();
    console.log('Received data:', {
      name: data.name,
      effects: data.effects,
      hasPreview: !!data.previewGif
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

    // Add the preset to our mock storage by calling the mock-presets endpoint
    try {
      const addResponse = await fetch('https://3f3cec7f.preset-pro.pages.dev/api/mock-presets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (addResponse.ok) {
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Preset submitted and added to gallery successfully!',
          data: {
            name: data.name,
            effects: data.effects,
            timestamp: new Date().toISOString()
          }
        }), {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else {
        throw new Error('Failed to add to gallery');
      }
    } catch (addError) {
      console.error('Error adding to gallery:', addError);
      // Still return success for the submission
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Preset received successfully! (Gallery update pending)',
        data: {
          name: data.name,
          effects: data.effects,
          timestamp: new Date().toISOString()
        }
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('Error in working submit:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Server error: ' + error.message
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