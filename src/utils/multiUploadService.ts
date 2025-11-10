// Multi-service uploader - tries multiple services for best reliability
import { pomfService } from './pomfService';
import { fileioService } from './fileioService';
import { nullService } from './nullService';

export interface UploadResult {
  success: boolean;
  url?: string;
  service?: string;
  error?: string;
  shouldTryCloudflare?: boolean;
}

class MultiUploadService {
  // Services in order of preference (most reliable first)
  private services = [
    { name: 'Pomf.lain.la', service: pomfService, maxSize: 100 * 1024 * 1024 },
    { name: 'File.io', service: fileioService, maxSize: 2 * 1024 * 1024 * 1024 },
    { name: '0x0.st', service: nullService, maxSize: 512 * 1024 * 1024 }
  ];

  // Upload file using the best available service
  async uploadFile(file: File): Promise<UploadResult> {
    console.log('Multi-upload starting for:', file.name, 'Size:', file.size);
    
    const errors: string[] = [];
    
    // Try external services first (but with shorter timeout for faster fallback)
    for (const { name, service, maxSize } of this.services) {
      // Skip if file is too large for this service
      if (file.size > maxSize) {
        console.log(`Skipping ${name} - file too large (${file.size} > ${maxSize})`);
        continue;
      }
      
      try {
        console.log(`Trying ${name}...`);
        
        // Race the upload against a timeout for faster fallback
        const uploadPromise = service.uploadFile(file);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Service timeout')), 15000) // 15s timeout
        );
        
        const url = await Promise.race([uploadPromise, timeoutPromise]);
        
        console.log(`✅ ${name} upload successful:`, url);
        return {
          success: true,
          url,
          service: name
        };
        
      } catch (error) {
        const errorMsg = `${name}: ${error.message}`;
        console.warn(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        
        // Continue to next service
        continue;
      }
    }
    
    // All external services failed - try Cloudflare D1 fallback
    console.log('All external services failed, trying Cloudflare D1 fallback...');
    try {
      // This will be handled by the Submit component's fallback logic
      return {
        success: false,
        error: 'External services unavailable - will try Cloudflare D1 fallback',
        shouldTryCloudflare: true
      };
    } catch (fallbackError) {
      const combinedError = `All upload services failed:\n${errors.join('\n')}\nCloudflare fallback: ${fallbackError.message}`;
      console.error(combinedError);
      
      return {
        success: false,
        error: combinedError
      };
    }
  }

  // Check if URL is from any supported service
  isSupportedUrl(url: string): boolean {
    return pomfService.isPomfUrl(url) || 
           fileioService.isFileioUrl(url) || 
           nullService.isNullUrl(url);
  }

  // Check if URL provides direct downloads
  isDirectDownloadUrl(url: string): boolean {
    return pomfService.isDirectDownloadUrl(url) || 
           fileioService.isDirectDownloadUrl(url) || 
           nullService.isDirectDownloadUrl(url);
  }

  // Get file info from any supported URL
  extractFileInfo(url: string): { fileName?: string; service?: string } {
    if (pomfService.isPomfUrl(url)) {
      return { ...pomfService.extractFileInfo(url), service: 'Pomf.lain.la' };
    }
    if (fileioService.isFileioUrl(url)) {
      return { ...fileioService.extractFileInfo(url), service: 'File.io' };
    }
    if (nullService.isNullUrl(url)) {
      return { ...nullService.extractFileInfo(url), service: '0x0.st' };
    }
    return {};
  }

  // Get service info
  getServicesInfo() {
    return {
      primary: pomfService.getServiceInfo(),
      fallbacks: [
        fileioService.getServiceInfo(),
        nullService.getServiceInfo()
      ],
      strategy: 'Try services in order until one succeeds',
      benefits: [
        'Maximum reliability (multiple fallbacks)',
        'No credit card required',
        'Direct download URLs',
        'Permanent storage',
        'Large file support (up to 2GB)',
        'No registration needed'
      ]
    };
  }
}

export const multiUploadService = new MultiUploadService();