// 0x0.st (null pointer) API service for file uploads
// Documentation: https://0x0.st
// One of the most reliable free file hosting services

class NullService {
  private uploadUrl = 'https://0x0.st';

  // Upload file to 0x0.st
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Uploading to 0x0.st:', file.name, 'Size:', file.size);
      
      // Check file size (0x0.st has 512MB limit)
      if (file.size > 512 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 512MB.');
      }
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to 0x0.st
      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 0x0.st returns the direct URL as plain text
      const directUrl = await response.text();
      
      if (!directUrl || !directUrl.startsWith('https://0x0.st/')) {
        throw new Error('Invalid response from 0x0.st: ' + directUrl);
      }

      const cleanUrl = directUrl.trim();
      console.log('0x0.st upload successful:', cleanUrl);
      return cleanUrl;
      
    } catch (error) {
      console.error('0x0.st upload error:', error);
      throw new Error(`Failed to upload to 0x0.st: ${error.message}`);
    }
  }

  // Check if URL is a 0x0.st URL
  isNullUrl(url: string): boolean {
    return url.includes('0x0.st');
  }

  // 0x0.st URLs are always direct download links
  isDirectDownloadUrl(url: string): boolean {
    return this.isNullUrl(url);
  }

  // Get file info from 0x0.st URL
  extractFileInfo(url: string): { fileName?: string; fileId?: string } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileId = pathParts[pathParts.length - 1];
      
      // 0x0.st URLs look like: https://0x0.st/abc123.zip
      // Extract the filename part after the ID
      const parts = fileId.split('.');
      if (parts.length > 1) {
        return { 
          fileId: parts[0], 
          fileName: fileId 
        };
      }
      
      return { fileId };
    } catch (error) {
      console.error('Error parsing 0x0.st URL:', error);
      return {};
    }
  }

  // Get maximum file size
  getMaxFileSize(): number {
    return 512 * 1024 * 1024; // 512MB
  }

  // Get service info
  getServiceInfo() {
    return {
      name: '0x0.st',
      maxFileSize: '512MB',
      features: [
        'Direct download URLs',
        'No registration required',
        'Permanent storage',
        'Fast CDN',
        'Large file support'
      ],
      apiUrl: this.uploadUrl
    };
  }
}

export const nullService = new NullService();