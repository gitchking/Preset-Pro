// Utility functions for handling images and fallbacks

export const createFallbackImage = (text: string, width = 400, height = 300): string => {
  // Create a simple SVG as base64 data URL
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#8B5CF6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// No random image generation - only use uploaded content