import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const YouTubePopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the popup has been shown before
    const hasSeenPopup = localStorage.getItem("hasSeenYouTubePopup");
    if (!hasSeenPopup) {
      // Show the popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenYouTubePopup", "true");
  };

  const handleSubscribe = () => {
    window.open("https://www.youtube.com/channel/UCi84fOMGApCB8xzbugtFElw?sub_confirmation=1", "_blank");
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Subscribe to Proxima</h2>
          <p className="text-muted-foreground mb-6">
            Get exclusive After Effects presets and tutorials by subscribing to my YouTube channel!
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleSubscribe}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Subscribe to Proxima
            </Button>
            <Button 
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};