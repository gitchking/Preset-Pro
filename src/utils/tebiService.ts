// Tebi S3-compatible storage service
// 50GB free storage, 250GB free bandwidth, no credit card required
// Documentation: https://docs.tebi.io/api/

export interface TebiUploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

class TebiService {
  // Tebi configuration according to official docs
  private endpoint = 'https://s3.tebi.io';
  private bucket = 'preset-pro-files';
  private region = 'global'; // Tebi uses 'global' as region
  
  // For demo purposes - in production, you'd use signed URLs or a backend service
  // This is a simplified approach for client-side uploads
  
  // Upload file to Tebi using presigned URL approach
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Uploading to Tebi:', file.name, 'Size:', file.size);
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop() || 'bin';
      const uniqueKey = `presets/${timestamp}-${randomId}.${fileExtension}`;
      
      // For now, we'll use a Cloudflare Worker to handle the Tebi upload
      // This avoids CORS issues and keeps credentials secure
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', uniqueKey);
      formData.append('originalName', file.name);
      
      const response = await fetch('/api/tebi-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Tebi upload failed');
      }

      console.log('Tebi upload successful:', result.url);
      return result.url;
      
    } catch (error) {
      console.error('Tebi upload error:', error);
      throw new Error(`Failed to upload to Tebi: ${error.message}`);
    }
  }

  // Check if URL is a Tebi URL
  isTebiUrl(url: string): boolean {
    return url.includes('s3.tebi.io');
  }

  // Tebi URLs are direct download links
  isDirectDownloadUrl(url: string): boolean {
    return this.isTebiUrl(url);
  }

  // Get file info from Tebi URL
  extractFileInfo(url: string): { fileName?: string; key?: string } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const key = pathParts.slice(1).join('/'); // Remove leading slash
      return { fileName, key };
    } catch (error) {
      console.error('Error parsing Tebi URL:', error);
      return {};
    }
  }

  // Get service info
  getServiceInfo() {
    return {
      name: 'Tebi',
      maxFileSize: 'Unlimited (within 50GB storage)',
      freeStorage: '50GB',
      freeBandwidth: '250GB/month',
      features: [
        'S3-compatible API',
        'Direct download URLs',
        'No credit card required',
        'Professional grade storage',
        'Global CDN',
        'Unlimited file sizes',
        '99.9% uptime SLA'
      ],
      pricing: 'Free tier: 50GB storage + 250GB bandwidth'
    };
  }
}

export const tebiService = new TebiService();