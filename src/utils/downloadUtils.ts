// Utility functions for handling file downloads
import { goFileService } from './gofileService';

export const downloadFile = async (
  downloadUrl: string, 
  fileName: string, 
  fileType: string = '.ffx',
  localFileData?: string
): Promise<void> => {
  // Handle local file data (base64 encoded)
  if (downloadUrl === 'local-file' && localFileData) {
    try {
      // Convert base64 to blob
      const response = await fetch(localFileData);
      const blob = await response.blob();
      
      // Create download link
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = objectUrl;
      link.download = `${fileName.replace(/[^a-zA-Z0-9\s]/g, '_')}${fileType}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(objectUrl);
      return;
    } catch (error) {
      throw new Error('Failed to download local file: ' + error.message);
    }
  }

  // If no download URL or placeholder, throw error
  if (!downloadUrl || downloadUrl === '#' || downloadUrl === '') {
    throw new Error('No download file available');
  }

  // Create a temporary link element for download
  const link = document.createElement('a');
  
  try {
    // Handle GoFile URLs - open in new tab (GoFile handles the download)
    if (goFileService.isGoFileUrl(downloadUrl)) {
      // GoFile URLs open download pages - let GoFile handle the download
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Handle Cloudflare API URLs - direct download
    if (downloadUrl.startsWith('/api/download/')) {
      try {
        const response = await fetch(downloadUrl);
        
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const downloadFileName = `${fileName.replace(/[^a-zA-Z0-9\s]/g, '_')}${fileType}`;
        
        link.href = objectUrl;
        link.download = downloadFileName;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(objectUrl);
        return;
      } catch (fetchError) {
        console.warn('Direct download failed, opening in new tab:', fetchError);
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    
    // If it's an API endpoint, fetch the file first
    if (downloadUrl.startsWith('/api/')) {
      const response = await fetch(downloadUrl);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create object URL for the blob
      const objectUrl = URL.createObjectURL(blob);
      
      // Set up download
      link.href = objectUrl;
      link.download = `${fileName.replace(/[^a-zA-Z0-9\s]/g, '_')}${fileType}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      URL.revokeObjectURL(objectUrl);
    } else {
      // For other direct URLs, use download attribute
      link.href = downloadUrl;
      link.download = `${fileName.replace(/[^a-zA-Z0-9\s]/g, '_')}${fileType}`;
      link.target = '_blank';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    // Clean up link if it was added
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    throw error;
  }
};

export const isDownloadAvailable = (downloadUrl: string, localFileData?: string): boolean => {
  // Local file is available if we have the data
  if (downloadUrl === 'local-file' && localFileData) {
    return true;
  }
  
  // Regular URL check
  return !!(downloadUrl && downloadUrl !== '#' && downloadUrl !== '');
};