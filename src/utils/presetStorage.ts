// Client-side preset storage utility
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
}

const STORAGE_KEY = 'presetpro-presets';

// Default presets
const defaultPresets: Preset[] = [
  {
    id: 1,
    name: "Smooth Camera Shake",
    effects: "Transform, Expression, Motion Blur",
    preview_url: "https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Smooth+Camera+Shake",
    download_url: "#",
    file_type: ".ffx",
    downloads: 0,
    likes: 0,
    created_at: new Date().toISOString(),
    author: "Demo User"
  },
  {
    id: 2,
    name: "Glitch Transition",
    effects: "Displacement, RGB Split, Noise",
    preview_url: "https://via.placeholder.com/400x300/06B6D4/ffffff?text=Glitch+Transition",
    download_url: "#",
    file_type: ".ffx",
    downloads: 0,
    likes: 0,
    created_at: new Date().toISOString(),
    author: "Demo User"
  },
  {
    id: 3,
    name: "Text Animator Pro",
    effects: "Text, Transform, Fade",
    preview_url: "https://via.placeholder.com/400x300/10B981/ffffff?text=Text+Animator",
    download_url: "#",
    file_type: ".aep",
    downloads: 0,
    likes: 0,
    created_at: new Date().toISOString(),
    author: "Demo User"
  }
];

export const presetStorage = {
  // Get all presets
  getPresets(): Preset[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize with default presets
      this.setPresets(defaultPresets);
      return defaultPresets;
    } catch (error) {
      console.error('Error loading presets:', error);
      return defaultPresets;
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

  // Add a new preset
  addPreset(presetData: {
    name: string;
    effects: string;
    previewGif?: string;
    downloadLink?: string;
    presetFileName?: string;
    author?: string;
  }): Preset {
    const presets = this.getPresets();
    
    const newPreset: Preset = {
      id: Math.max(...presets.map(p => p.id), 0) + 1,
      name: presetData.name,
      effects: presetData.effects,
      preview_url: presetData.previewGif || `https://via.placeholder.com/400x300/F59E0B/ffffff?text=${encodeURIComponent(presetData.name)}`,
      download_url: presetData.downloadLink || "#",
      file_type: presetData.presetFileName ? `.${presetData.presetFileName.split('.').pop()}` : ".ffx",
      downloads: 0,
      likes: 0,
      created_at: new Date().toISOString(),
      author: presetData.author || "Anonymous"
    };

    // Add to beginning (newest first)
    presets.unshift(newPreset);
    this.setPresets(presets);
    
    return newPreset;
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
  }
};