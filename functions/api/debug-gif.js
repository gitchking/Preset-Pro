// Debug endpoint to check GIF storage and retrieval
export async function onRequestGet(context) {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    const presetId = url.searchParams.get('id');

    if (!env.DB) {
      return new Response(JSON.stringify({ error: 'Database not available' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (presetId) {
      // Debug specific preset
      const preset = await env.DB.prepare(`
        SELECT id, name, preview_url, download_url, file_type, created_at
        FROM presets 
        WHERE id = ?
      `).bind(presetId).first();

      if (!preset) {
        return new Response(JSON.stringify({ error: 'Preset not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const debugInfo = {
        preset: {
          id: preset.id,
          name: preset.name,
          file_type: preset.file_type,
          created_at: preset.created_at,
          download_url: preset.download_url
        },
        preview_url_info: {
          is_data_url: preset.preview_url.startsWith('data:'),
          mime_type: preset.preview_url.startsWith('data:') ? 
            preset.preview_url.split(';')[0].replace('data:', '') : 'external',
          length: preset.preview_url.length,
          first_100_chars: preset.preview_url.substring(0, 100),
          is_base64: preset.preview_url.includes('base64,')
        }
      };

      return new Response(JSON.stringify(debugInfo, null, 2), {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // List all presets with debug info
    const presets = await env.DB.prepare(`
      SELECT id, name, preview_url, download_url, file_type, created_at
      FROM presets 
      ORDER BY created_at DESC
      LIMIT 10
    `).all();

    const debugInfo = {
      total_presets: presets.results?.length || 0,
      presets: presets.results?.map(preset => ({
        id: preset.id,
        name: preset.name,
        file_type: preset.file_type,
        preview_url_length: preset.preview_url.length,
        is_data_url: preset.preview_url.startsWith('data:'),
        mime_type: preset.preview_url.startsWith('data:') ? 
          preset.preview_url.split(';')[0].replace('data:', '') : 'external',
        created_at: preset.created_at
      })) || []
    };

    return new Response(JSON.stringify(debugInfo, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Debug failed: ' + error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}