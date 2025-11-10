// Client-side preset storage utility
import { createFallbackImage } from './imageUtils';

export interface Preset {
  id: number;
  name: string;
  effects: string;
  preview_url: string;
  download_url: string;
  file_type: string;
  downloads: number;
  likes: number;
  created_at: string;
  author?: string;
  localFileData?: string; // Base64 encoded file data for local storage
}

const STORAGE_KEY = 'presetpro-presets';

// Default presets to show when no user content exists
const defaultPresets: Preset[] = [];

export const presetStorage = {
  // Get all presets
  getPresets(): Preset[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('Raw localStorage data:', stored);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Parsed presets:', parsed);
        
        // If user has presets, return them
        if (parsed.length > 0) {
          return parsed;
        }
      }
      
      // If no user presets and no default presets, return empty array
      console.log('No stored presets, returning empty array');
      return [];
    } catch (error) {
      console.error('Error loading presets:', error);
      return [];
    }
  },

  // Set all presets
  setPresets(presets: Preset[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Error saving presets:', error);
    }
  },

  // Clear all presets from localStorage
  clearAllPresets(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Cleared all presets from localStorage');
    } catch (error) {
      console.error('Error clearing presets:', error);
    }
  },

  // Add a new preset
  addPreset(presetData: {
    name: string;
    effects: string;
    previewGif?: string;
    downloadLink?: string;
    presetFileName?: string;
    author?: string;
    localFileData?: string;
  }): Preset {
    console.log('PresetStorage.addPreset called with:', presetData);
    
    try {
      const presets = this.getPresets();
      console.log('Current presets:', presets);
      
      // Generate a unique ID using timestamp + random number
      const newId = Date.now() + Math.floor(Math.random() * 1000);
      
      const newPreset: Preset = {
        id: newId,
        name: presetData.name,
        effects: presetData.effects,
        preview_url: presetData.previewGif || '',
        download_url: presetData.downloadLink || "#",
        file_type: presetData.presetFileName ? `.${presetData.presetFileName.split('.').pop()}` : ".ffx",
        downloads: 0,
        likes: 0,
        created_at: new Date().toISOString(),
        author: presetData.author || "Anonymous",
        localFileData: presetData.localFileData
      };

      console.log('New preset created with ID:', newPreset.id);

      // Add to beginning (newest first)
      const updatedPresets = [newPreset, ...presets];
      console.log('Updated presets array length:', updatedPresets.length);
      
      // Save to localStorage with quota handling
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPresets));
        console.log('Saved to localStorage successfully');
      } catch (storageError) {
        console.error('localStorage save error:', storageError);
        
        // If quota exceeded, try aggressive cleanup and retry
        if (storageError.name === 'QuotaExceededError' || storageError.message.includes('quota')) {
          console.log('Quota exceeded, attempting aggressive cleanup...');
          
          try {
            // Clear all existing presets and start fresh with just the new one
            const minimalPresets = [newPreset];
            
            localStorage.removeItem(STORAGE_KEY); // Clear first
            localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalPresets));
            console.log('Saved after aggressive cleanup successfully');
            
          } catch (retryError) {
            console.error('Even aggressive cleanup failed:', retryError);
            throw new Error('Storage quota exceeded. Please clear your browser data and try again.');
          }
        } else {
          throw new Error('Failed to save to localStorage: ' + storageError.message);
        }
      }
      
      // Verify it was saved by reading it back
      const verification = this.getPresets();
      const foundPreset = verification.find(p => p.id === newPreset.id);
      
      if (!foundPreset) {
        console.error('Preset not found after save. All presets:', verification);
        throw new Error('Preset was not saved properly to storage');
      }
      
      console.log('Preset verified in storage:', foundPreset);
      return newPreset;
      
    } catch (error) {
      console.error('Error in addPreset:', error);
      throw error;
    }
  },

  // Get preset by ID
  getPresetById(id: number): Preset | undefined {
    const presets = this.getPresets();
    return presets.find(p => p.id === id);
  },

  // Delete preset
  deletePreset(id: number): boolean {
    try {
      const presets = this.getPresets();
      const filteredPresets = presets.filter(p => p.id !== id);
      this.setPresets(filteredPresets);
      return true;
    } catch (error) {
      console.error('Error deleting preset:', error);
      return false;
    }
  },

  // Update preset
  updatePreset(id: number, updates: Partial<Preset>): boolean {
    try {
      const presets = this.getPresets();
      const updatedPresets = presets.map(preset => 
        preset.id === id ? { ...preset, ...updates } : preset
      );
      this.setPresets(updatedPresets);
      return true;
    } catch (error) {
      console.error('Error updating preset:', error);
      return false;
    }
  },

  // Get presets by author
  getPresetsByAuthor(author: string): Preset[] {
    const presets = this.getPresets();
    return presets.filter(preset => preset.author === author);
  },

  // Test function to verify storage works
  testStorage(): boolean {
    try {
      const testData = { test: 'data', timestamp: Date.now() };
      localStorage.setItem('test-storage', JSON.stringify(testData));
      const retrieved = localStorage.getItem('test-storage');
      const parsed = JSON.parse(retrieved || '{}');
      localStorage.removeItem('test-storage');
      return parsed.test === 'data';
    } catch (error) {
      console.error('Storage test failed:', error);
      return false;
    }
  },

  // Check storage usage and clean up if needed
  checkStorageQuota(): { used: number; available: number; needsCleanup: boolean } {
    try {
      // Estimate current usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }

      // Typical localStorage limit is 5-10MB
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      const usagePercent = (totalSize / estimatedLimit) * 100;

      return {
        used: totalSize,
        available: estimatedLimit - totalSize,
        needsCleanup: usagePercent > 80
      };
    } catch (error) {
      console.error('Error checking storage quota:', error);
      return { used: 0, available: 0, needsCleanup: false };
    }
  },

  // Clean up old presets to free space
  cleanupOldPresets(): void {
    try {
      const presets = this.getPresets();
      
      // Keep only the most recent 20 presets
      if (presets.length > 20) {
        const recentPresets = presets
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 20);
        
        this.setPresets(recentPresets);
        console.log(`Cleaned up ${presets.length - 20} old presets`);
      }
    } catch (error) {
      console.error('Error cleaning up presets:', error);
    }
  },

  // Clear all presets with external URLs (random images)
  clearRandomImagePresets(): void {
    try {
      const presets = this.getPresets();
      const uploadedPresets = presets.filter(preset => 
        preset.preview_url.startsWith('data:') || preset.preview_url === ''
      );
      
      this.setPresets(uploadedPresets);
      console.log(`Removed ${presets.length - uploadedPresets.length} presets with random images`);
    } catch (error) {
      console.error('Error clearing random image presets:', error);
    }
  }
};