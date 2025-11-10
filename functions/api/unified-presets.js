// Unified presets endpoint that handles both GET and POST
// Uses in-memory storage (resets on deployment, but works for demo)

// Global storage (will persist during the worker's lifetime)
let globalPresets = [];

// GET - Fetch all presets
export async function onRequestGet(context) {
  try {
    console.log('Fetching presets, current count:', globalPresets.length);
    
    return new Response(JSON.stringify({
      success: true,
      presets: globalPresets,
      count: globalPresets.length
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error fetching presets:', error);
    return new Response(JSON.stringify({ 
      success: true,
      presets: globalPresets,
      error: error.message
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// POST - Add new preset
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const data = await request.json();
    
    console.log('Adding new preset:', data.name);
    
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
    
    // Create new preset
    const newPreset = {
      id: Math.max(...globalPresets.map(p => p.id), 0) + 1,
      name: data.name,
      effects: data.effects,
      preview_url: data.previewGif || `https://via.placeholder.com/400x300/F59E0B/ffffff?text=${encodeURIComponent(data.name)}`,
      download_url: data.downloadLink || "#",
      file_type: data.presetFileName ? `.${data.presetFileName.split('.').pop()}` : ".ffx",
      downloads: 0,
      likes: 0,
      created_at: new Date().toISOString()
    };
    
    // Add to beginning of array (newest first)
    globalPresets.unshift(newPreset);
    
    console.log('Preset added successfully. Total presets:', globalPresets.length);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Preset added successfully!",
      preset: newPreset,
      totalPresets: globalPresets.length
    }), {
      status: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error adding preset:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to add preset: ' + error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// OPTIONS - Handle CORS
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