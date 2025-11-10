import { useState } from "react";
import { GifPreview } from "./GifPreview";
import { downloadFile, isDownloadAvailable } from "@/utils/downloadUtils";

interface PresetCardProps {
  id?: number;
  name: string;
  effects: string[];
  previewUrl: string;
  downloadUrl: string;
  fileType?: string;
  localFileData?: string;
}

// Function to generate a consistent color based on the first letter
const getColorForLetter = (letter: string): string => {
  const colors = [
    'bg-red-500/60', 'bg-orange-500/60', 'bg-amber-500/60', 'bg-yellow-500/60', 'bg-lime-500/60',
    'bg-green-500/60', 'bg-emerald-500/60', 'bg-teal-500/60', 'bg-cyan-500/60', 'bg-sky-500/60',
    'bg-blue-500/60', 'bg-indigo-500/60', 'bg-violet-500/60', 'bg-purple-500/60', 'bg-fuchsia-500/60',
    'bg-pink-500/60', 'bg-rose-500/60', 'bg-red-600/60', 'bg-orange-600/60', 'bg-amber-600/60',
    'bg-yellow-600/60', 'bg-lime-600/60', 'bg-green-600/60', 'bg-emerald-600/60', 'bg-teal-600/60', 'bg-cyan-600/60'
  ];
  
  const charIndex = letter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
  const colorIndex = charIndex >= 0 && charIndex < 26 ? charIndex : 0; // Default to 0 if not A-Z
  
  return colors[colorIndex];
};

export const PresetCard = ({ 
  name, 
  effects, 
  previewUrl, 
  downloadUrl, 
  localFileData
}: PresetCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isDownloadAvailable(downloadUrl, localFileData)) {
      alert('No download file available for this preset.');
      return;
    }

    try {
      // Open download link in new tab
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert(`Download failed: ${error.message}`);
    }
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 ease-in-out hover:shadow-lg cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Image/GIF with Title Overlay */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
        <div className="overflow-hidden rounded-t-2xl">
          <GifPreview
            src={previewUrl}
            alt={name}
            className="h-full w-full transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
        </div>
        
        {/* Vignette Effect - Only visible on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Title - Only visible on hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <h3 className="text-sm font-bold text-white/70 truncate font-['Inter']">{name}</h3>
        </div>
        
        {/* Effects Tags - Only visible on hover */}
        <div className={`absolute right-2 top-2 flex flex-wrap gap-1 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {effects.slice(0, 2).map((effect, index) => {
            const firstLetter = effect.trim().charAt(0).toUpperCase();
            const colorClass = getColorForLetter(firstLetter);
            
            return (
              <span
                key={index}
                className={`${colorClass} px-1.5 py-0.5 text-xs font-medium text-white/90 rounded-md backdrop-blur-sm`}
              >
                {effect}
              </span>
            );
          })}
          {effects.length > 2 && (
            <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white/90 backdrop-blur-sm">
              +{effects.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};