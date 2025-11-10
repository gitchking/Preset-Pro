// Presets endpoint with persistent storage using KV (simulated with static storage)
let storedPresets = [];

export async function onRequestGet(context) {
  try {
    return new Response(JSON.stringify({
      success: true,
      presets: storedPresets
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
      presets: storedPresets
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

// Add new preset to storage
export async function onRequestPost(context) {
  try {
    const { request } = context;
    const data = await request.json();
    
    // Create new preset
    const newPreset = {
      id: storedPresets.length + 1,
      name: data.name,
      effects: data.effects,
      preview_url: data.previewGif || `https://via.placeholder.com/400x300/8B5CF6/ffffff?text=${encodeURIComponent(data.name)}`,
      download_url: data.downloadLink || "#",
      file_type: data.presetFileName ? `.${data.presetFileName.split('.').pop()}` : ".ffx",
      downloads: 0,
      likes: 0,
      created_at: new Date().toISOString()
    };
    
    // Add to beginning of array (newest first)
    storedPresets.unshift(newPreset);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Preset added successfully!",
      preset: newPreset
    }), {
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