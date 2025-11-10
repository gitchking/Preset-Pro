// Pomf.lain.la API service for file uploads
// One of the most reliable free file hosting services

class PomfService {
  private uploadUrl = 'https://pomf.lain.la/upload.php';

  // Upload file to Pomf
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Uploading to Pomf.lain.la:', file.name, 'Size:', file.size);
      
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 100MB.');
      }
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('files[]', file);

      // Upload to Pomf with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
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

        // Pomf returns JSON with file info
        const result = await response.json();
        
        if (!result.success || !result.files || result.files.length === 0) {
          throw new Error('Upload failed: ' + (result.description || 'Unknown error'));
        }

        const fileInfo = result.files[0];
        const directUrl = fileInfo.url;
        
        if (!directUrl || !directUrl.startsWith('https://')) {
          throw new Error('Invalid response from Pomf: ' + directUrl);
        }

        console.log('Pomf upload successful:', directUrl);
        return directUrl;
        
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Upload timeout (30s) - file may be too large or network slow');
        }
        throw fetchError;
      }
      
    } catch (error) {
      console.error('Pomf upload error:', error);
      throw new Error(`Pomf upload failed: ${error.message}`);
    }
  }

  // Check if URL is a Pomf URL
  isPomfUrl(url: string): boolean {
    return url.includes('pomf.lain.la') || url.includes('a.pomf.cat');
  }

  // Pomf URLs are always direct download links
  isDirectDownloadUrl(url: string): boolean {
    return this.isPomfUrl(url);
  }

  // Get file info from Pomf URL
  extractFileInfo(url: string): { fileName?: string } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return { fileName };
    } catch (error) {
      console.error('Error parsing Pomf URL:', error);
      return {};
    }
  }

  // Get maximum file size
  getMaxFileSize(): number {
    return 100 * 1024 * 1024; // 100MB
  }

  // Get service info
  getServiceInfo() {
    return {
      name: 'Pomf.lain.la',
      maxFileSize: '100MB',
      features: [
        'Direct download URLs',
        'No registration required',
        'Permanent storage',
        'Reliable service (5+ years)',
        'Fast downloads',
        'No credit card required'
      ],
      apiUrl: this.uploadUrl
    };
  }
}

export const pomfService = new PomfService();