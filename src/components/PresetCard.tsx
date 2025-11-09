import { Download, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface PresetCardProps {
  name: string;
  effects: string[];
  previewUrl: string;
  downloadUrl: string;
  fileType?: string;
}

export const PresetCard = ({ 
  name, 
  effects, 
  previewUrl, 
  downloadUrl, 
  fileType = ".ffx" 
}: PresetCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Preview Image/GIF */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {!imageError ? (
          <img
            src={isHovered ? previewUrl : previewUrl}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* File Type Badge */}
        <div className="absolute right-3 top-3 rounded-md bg-background/90 px-2 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-foreground">{fileType}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-bold text-card-foreground">{name}</h3>
        
        {/* Effects Tags */}
        <div className="flex flex-wrap gap-2">
          {effects.map((effect, index) => (
            <span
              key={index}
              className="rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
            >
              {effect}
            </span>
          ))}
        </div>

        {/* Download Button */}
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-semibold text-accent-foreground transition-all duration-200 hover:bg-accent/90 hover:shadow-lg"
        >
          <Download className="h-4 w-4" />
          Download
        </a>
      </div>
    </div>
  );
};
