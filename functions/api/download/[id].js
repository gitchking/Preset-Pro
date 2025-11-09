// Handle file downloads
export async function onRequestGet(context) {
  try {
    const { params, env } = context;
    const fileId = params.id;

    if (!fileId) {
      return new Response('File ID required', { status: 400 });
    }

    // Get file from database
    const result = await env.DB.prepare(`
      SELECT filename, content_type, file_data, file_size
      FROM preset_files 
      WHERE id = ?
    `).bind(fileId).first();

    if (!result) {
      return new Response('File not found', { status: 404 });
    }

    // Convert base64 back to binary
    const binaryString = atob(result.file_data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        'Content-Type': result.content_type || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Content-Length': result.file_size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return new Response('Download failed', { status: 500 });
  }
}