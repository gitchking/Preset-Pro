// File.io API service for file uploads
// Supports larger files (2GB) with direct downloads

class FileioService {
  private uploadUrl = 'https://file.io';

  // Upload file to File.io
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Uploading to File.io:', file.name, 'Size:', file.size);
      
      // Check file size (2GB limit)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 2GB.');
      }
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to File.io with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for larger files
      
      try {
        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }

        // File.io returns JSON with file info
        const result = await response.json();
        
        if (!result.success || !result.link) {
          throw new Error('Upload failed: ' + (result.message || 'Unknown error'));
        }

        const directUrl = result.link;
        
        if (!directUrl || !directUrl.startsWith('https://')) {
          throw new Error('Invalid response from File.io: ' + directUrl);
        }

        console.log('File.io upload successful:', directUrl);
        return directUrl;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Upload timeout (60s) - file may be too large or network slow');
        }
        throw fetchError;
      }
      
    } catch (error) {
      console.error('File.io upload error:', error);
      throw new Error(`File.io upload failed: ${error.message}`);
    }
  }

  // Check if URL is a File.io URL
  isFileioUrl(url: string): boolean {
    return url.includes('file.io');
  }

  // File.io URLs are direct download links
  isDirectDownloadUrl(url: string): boolean {
    return this.isFileioUrl(url);
  }

  // Get file info from File.io URL
  extractFileInfo(url: string): { fileName?: string; fileId?: string } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileId = pathParts[pathParts.length - 1];
      return { fileId };
    } catch (error) {
      console.error('Error parsing File.io URL:', error);
      return {};
    }
  }

  // Get maximum file size
  getMaxFileSize(): number {
    return 2 * 1024 * 1024 * 1024; // 2GB
  }

  // Get service info
  getServiceInfo() {
    return {
      name: 'File.io',
      maxFileSize: '2GB',
      features: [
        'Direct download URLs',
        'No registration required',
        'Large file support (2GB)',
        'Professional API',
        'Fast uploads/downloads',
        'No credit card required'
      ],
      apiUrl: this.uploadUrl
    };
  }
}

export const fileioService = new FileioService();