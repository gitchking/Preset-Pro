// Presets endpoint with persistent storage using KV (simulated with static storage)
let storedPresets = [
  {
    id: 1,
    name: "Smooth Camera Shake",
    effects: "Transform, Expression, Motion Blur",
    preview_url: "https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Smooth+Camera+Shake",
    download_url: "#",
    file_type: ".ffx",
    downloads: 0,
    likes: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: "Glitch Transition",
    effects: "Displacement, RGB Split, Noise",
    preview_url: "https://via.placeholder.com/400x300/06B6D4/ffffff?text=Glitch+Transition",
    download_url: "#",
    file_type: ".ffx",
    downloads: 0,
    likes: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: "Text Animator Pro",
    effects: "Text, Transform, Fade",
    preview_url: "https://via.placeholder.com/400x300/10B981/ffffff?text=Text+Animator",
    download_url: "#",
    file_type: ".aep",
    downloads: 0,
    likes: 0,
    created_at: new Date().toISOString()
  }
];

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