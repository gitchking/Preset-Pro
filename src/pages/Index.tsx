import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PresetCard } from "@/components/PresetCard";
import { Link } from "react-router-dom";
import { type Preset } from "@/utils/presetStorage";

const Index = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Import presetStorage
        const { presetStorage } = await import("@/utils/presetStorage");
        
        // Clear any existing presets to ensure clean state
        presetStorage.clearAllPresets();
        
        // Try to load from API endpoints
        const endpoints = ['/api/presets', '/api/unified-presets'];
        let apiSuccess = false;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`🌐 Trying to load presets from: ${endpoint}`);
            const response = await fetch(endpoint);
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.log(`❌ ${endpoint} returned non-JSON response (likely 404)`);
              continue;
            }
            
            const data = await response.json();
            
            if (data.success && Array.isArray(data.presets)) {
              console.log(`✅ Loaded ${data.presets.length} presets from ${endpoint}`);
              setPresets(data.presets);
              apiSuccess = true;
              break;
            } else if (Array.isArray(data.presets)) {
              console.log(`⚠️ ${endpoint} returned presets without success flag:`, data.presets.length);
              setPresets(data.presets);
              apiSuccess = true;
              break;
            } else {
              console.log(`❌ ${endpoint} failed or returned no presets:`, data);
            }
          } catch (endpointError) {
            console.log(`❌ ${endpoint} error:`, endpointError);
          }
        }
        
        // Only show empty state when APIs fail
        if (!apiSuccess) {
          console.log('APIs not available, showing empty state by design');
          setPresets([]);
        }
        
      } catch (error) {
        console.error('Error loading presets:', error);
        // Don't show error to user, just show empty state
        setPresets([]);
      } finally {
        setLoading(false);
      }
    };

    loadPresets();
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
          ) : error ? (
            <div className="text-center py-20">
              <div className="mx-auto max-w-md">
                <div className="mb-6 text-6xl">⚠️</div>
                <h2 className="mb-4 text-2xl font-semibold text-foreground">
                  Connection Issue
                </h2>
                <p className="text-muted-foreground mb-6">
                  {error}. Please try refreshing the page.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
              </div>
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
                  localFileData={preset.localFileData}
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
