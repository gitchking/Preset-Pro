// Avatar upload endpoint using same storage system as presets
let userProfiles = new Map();

export async function onRequestPost(context) {
  try {
    const { request } = context;
    const data = await request.json();
    
    console.log('Avatar upload request received for:', data.name);
    
    // Validate required fields
    if (!data.name || !data.email) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Name and email are required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Store profile data (in production, this would go to a database)
    const profileId = data.email; // Use email as unique identifier
    const profileData = {
      id: profileId,
      name: data.name,
      email: data.email,
      avatar: data.avatar || '',
      bio: data.bio || '',
      updatedAt: new Date().toISOString()
    };

    userProfiles.set(profileId, profileData);
    
    console.log('Profile saved successfully for:', data.name);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully!',
      profile: profileData
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to update profile: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// GET endpoint to retrieve profile
export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Email parameter required'
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const profile = userProfiles.get(email);
    
    if (profile) {
      return new Response(JSON.stringify({
        success: true,
        profile: profile
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Profile not found'
      }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

  } catch (error) {
    console.error('Error fetching profile:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to fetch profile: ' + error.message
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}