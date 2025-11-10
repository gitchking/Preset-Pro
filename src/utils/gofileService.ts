// GoFile API service for file uploads
// Documentation: https://gofile.io/api

export interface GoFileUploadResponse {
  status: string;
  data?: {
    downloadPage: string;
    code: string;
    parentFolder: string;
    fileId: string;
    fileName: string;
    md5: string;
  };
}

export interface GoFileServerResponse {
  status: string;
  data?: {
    server: string;
  };
}

export interface GoFileContentResponse {
  status: string;
  data?: {
    contents: {
      [key: string]: {
        id: string;
        type: string;
        name: string;
        size: number;
        downloadCount: number;
        md5: string;
        mimetype: string;
        serverChoosen: string;
        directLink: string;
        link: string;
      };
    };
  };
}

class GoFileService {
  private baseUrl = 'https://api.gofile.io';

  // Get the best server for upload
  async getBestServer(): Promise<string> {
    try {
      console.log('Getting best GoFile server...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseUrl}/getServer`, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PresetPro/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`GoFile server API returned ${response.status}`);
        return 'store1';
      }
      
      const data: GoFileServerResponse = await response.json();
      console.log('GoFile server response:', data);
      
      if (data.status === 'ok' && data.data?.server) {
        console.log('Got best server:', data.data.server);
        return data.data.server;
      }
      
      console.warn('GoFile server API returned invalid data:', data);
      return 'store1';
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('GoFile server API timeout');
      } else {
        console.error('Error getting GoFile server:', error);
      }
      return 'store1'; // Default fallback server
    }
  }

  // Upload file to GoFile
  async uploadFile(file: File): Promise<GoFileUploadResponse> {
    try {
      console.log('Starting GoFile upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Validate file size (GoFile has limits)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 100MB`);
      }

      // Get the best server with retry logic
      let server;
      try {
        server = await this.getBestServer();
        console.log('Using GoFile server:', server);
      } catch (serverError) {
        console.warn('Failed to get server, using fallback:', serverError);
        server = 'store1';
      }
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Try multiple servers if first fails
      const servers = [server, 'store1', 'store2', 'store3'];
      let lastError;
      
      for (const currentServer of servers) {
        try {
          console.log(`Attempting upload to server: ${currentServer}`);
          
          // Upload to GoFile with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
          
          const response = await fetch(`https://${currentServer}.gofile.io/uploadFile`, {
            method: 'POST',
            body: formData,
            signal: controller.signal,
            headers: {
              // Don't set Content-Type, let browser set it with boundary for FormData
            }
          });

          clearTimeout(timeoutId);

          console.log('GoFile response status:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server ${currentServer} HTTP error:`, response.status, errorText);
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            continue; // Try next server
          }

          const result: GoFileUploadResponse = await response.json();
          console.log('GoFile response data:', result);
          
          if (result.status !== 'ok') {
            console.error(`Server ${currentServer} API error:`, result);
            lastError = new Error(`GoFile API error: ${result.status}`);
            continue; // Try next server
          }

          if (!result.data?.downloadPage) {
            console.error(`Server ${currentServer} missing download page:`, result);
            lastError = new Error('GoFile response missing download page');
            continue; // Try next server
          }

          console.log('✅ GoFile upload successful:', {
            server: currentServer,
            downloadPage: result.data.downloadPage,
            fileId: result.data.fileId,
            fileName: result.data.fileName
          });

          return result;

        } catch (uploadError) {
          console.error(`Upload failed on server ${currentServer}:`, uploadError);
          lastError = uploadError;
          
          if (uploadError.name === 'AbortError') {
            lastError = new Error('Upload timeout (60 seconds exceeded)');
          }
          
          // Continue to next server
        }
      }

      // If all servers failed
      throw lastError || new Error('All GoFile servers failed');

    } catch (error) {
      console.error('GoFile upload error:', error);
      
      // Provide more specific error messages
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        throw new Error('Network error: Please check your internet connection and try again');
      } else if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        throw new Error('Upload timeout: File too large or connection too slow');
      } else if (error.message.includes('File too large')) {
        throw error; // Pass through file size errors as-is
      } else {
        throw new Error(`GoFile upload failed: ${error.message}`);
      }
    }
  }

  // Get download URL from GoFile response (simplified approach)
  getDownloadUrl(uploadResponse: GoFileUploadResponse): string {
    if (uploadResponse.data?.downloadPage) {
      return uploadResponse.data.downloadPage;
    }
    throw new Error('No download URL in GoFile response');
  }

  // Get download page URL from GoFile response (fallback)
  getDownloadPageUrl(uploadResponse: GoFileUploadResponse): string {
    if (uploadResponse.data?.downloadPage) {
      return uploadResponse.data.downloadPage;
    }
    throw new Error('No download URL in GoFile response');
  }

  // Check if URL is a GoFile URL
  isGoFileUrl(url: string): boolean {
    return url.includes('gofile.io');
  }

  // Check if GoFile URL is a direct download link
  isDirectDownloadUrl(url: string): boolean {
    return this.isGoFileUrl(url) && url.includes('/download/') && !url.includes('/d/');
  }

  // Extract file info from GoFile URL
  extractFileInfo(url: string): { code?: string; fileName?: string } {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      if (pathParts.includes('d')) {
        const codeIndex = pathParts.indexOf('d') + 1;
        const code = pathParts[codeIndex];
        return { code };
      }
      
      return {};
    } catch (error) {
      console.error('Error parsing GoFile URL:', error);
      return {};
    }
  }
}

export const goFileService = new GoFileService();