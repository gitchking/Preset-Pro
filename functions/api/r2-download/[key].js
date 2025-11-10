// Cloudflare R2 file download API
export async function onRequestGet(context) {
  try {
    const { params, env } = context;
    const fileKey = params.key;

    if (!fileKey) {
      return new Response('File key required', { status: 400 });
    }

    // Check if R2 bucket is available
    if (!env || !env.PRESET_BUCKET) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    // Get file from R2
    const object = await env.PRESET_BUCKET.get(fileKey);

    if (!object) {
      return new Response('File not found', { status: 404 });
    }

    // Get file metadata
    const metadata = object.customMetadata || {};
    const httpMetadata = object.httpMetadata || {};

    return new Response(object.body, {
      headers: {
        'Content-Type': httpMetadata.contentType || 'application/octet-stream',
        'Content-Disposition': httpMetadata.contentDisposition || `attachment; filename="${metadata.originalName || fileKey}"`,
        'Content-Length': object.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
        'ETag': object.etag,
        'Last-Modified': object.uploaded.toUTCString()
      }
    });

  } catch (error) {
    console.error('Error downloading from R2:', error);
    return new Response('Download failed', { status: 500 });
  }
}