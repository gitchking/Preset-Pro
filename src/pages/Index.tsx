import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PresetCard } from "@/components/PresetCard";
import { Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { presetStorage, type Preset } from "@/utils/presetStorage";

const Index = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPresets = () => {
      try {
        const storedPresets = presetStorage.getPresets();
        setPresets(storedPresets);
      } catch (error) {
        console.error('Error loading presets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPresets();
    
    // Listen for storage changes (when new presets are added)
    const handleStorageChange = () => {
      loadPresets();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center py-20">
              <div className="mb-6 text-6xl">⚡</div>
              <h2 className="mb-4 text-2xl font-semibold text-foreground">
                Loading Presets...
              </h2>
            </div>
          ) : presets.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {presets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  name={preset.name}
                  effects={preset.effects.split(', ')}
                  previewUrl={preset.preview_url}
                  downloadUrl={preset.download_url}
                  fileType={preset.file_type}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto max-w-md">
                <div className="mb-6 text-6xl">🎬</div>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  No Presets Yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your amazing After Effects presets with the community!
                </p>
                <Link to="/submit">
                  <Button variant="outline">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
