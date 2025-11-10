// Cloudflare R2 service for file uploads
export interface R2UploadResponse {
  success: boolean;
  message?: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  r2Key?: string;
  error?: string;
}

class R2Service {
  private uploadUrl = '/api/r2-upload';
  private downloadBaseUrl = '/api/r2-download';

  // Upload file to Cloudflare R2
  async uploadFile(file: File): Promise<R2UploadResponse> {
    try {
      console.log('Uploading to Cloudflare R2:', file.name, 'Size:', file.size);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to R2
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const result: R2UploadResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'R2 upload failed');
      }

      console.log('R2 upload successful:', result);
      return result;
      
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`Failed to upload to R2: ${error.message}`);
    }
  }

  // Get download URL for R2 file
  getDownloadUrl(r2Key: string): string {
    return `${this.downloadBaseUrl}/${r2Key}`;
  }

  // Check if URL is an R2 download URL
  isR2Url(url: string): boolean {
    return url.includes('/api/r2-download/') || url.includes('files.your-domain.com');
  }

  // R2 URLs are always direct download links
  isDirectDownloadUrl(url: string): boolean {
    return this.isR2Url(url);
  }

  // Extract R2 key from download URL
  extractR2Key(url: string): string | null {
    try {
      if (url.includes('/api/r2-download/')) {
        const parts = url.split('/api/r2-download/');
        return parts[1] || null;
      }
      
      if (url.includes('files.your-domain.com')) {
        const urlObj = new URL(url);
        return urlObj.pathname.substring(1); // Remove leading slash
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting R2 key:', error);
      return null;
    }
  }

  // Get file info from R2 URL
  extractFileInfo(url: string): { fileName?: string; r2Key?: string } {
    try {
      const r2Key = this.extractR2Key(url);
      if (r2Key) {
        // Extract filename from R2 key (format: presets/timestamp-randomid.ext)
        const parts = r2Key.split('/');
        const fileName = parts[parts.length - 1];
        return { fileName, r2Key };
      }
      return {};
    } catch (error) {
      console.error('Error parsing R2 URL:', error);
      return {};
    }
  }

  // Get service info
  getServiceInfo() {
    return {
      name: 'Cloudflare R2',
      maxFileSize: 'Unlimited (practical limit ~5GB)',
      features: [
        'Direct download URLs',
        'Integrated with Cloudflare',
        'Enterprise-grade storage',
        'Global CDN',
        'Unlimited storage',
        'Pay per use pricing'
      ],
      apiUrl: this.uploadUrl
    };
  }
}

export const r2Service = new R2Service();