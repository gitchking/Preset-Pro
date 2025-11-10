import { useState } from "react";
import { ImageIcon } from "lucide-react";

interface GifPreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export const GifPreview = ({ src, alt, className = "" }: GifPreviewProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    console.error('Failed to load image:', src.substring(0, 100) + '...');
  };

  // If no src provided, show placeholder
  if (!src || src === '#' || src === '') {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 ${className}`}>
        <div className="text-center text-white">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm font-medium">No Preview</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 ${className}`}>
        <div className="text-center text-white">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm font-medium">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-all duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};