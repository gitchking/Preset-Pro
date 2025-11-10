import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PresetCard } from "@/components/PresetCard";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// API response data type for D1 database
interface D1Preset {
  id: number;
  name: string;
  effects: string;
  preview_url: string;
  download_url: string;
  file_type: string;
  downloads: number;
  likes: number;
  created_at: string;
  author_email?: string;
}

const Index = () => {
  const [presets, setPresets] = useState<D1Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🌐 Fetching presets from Supabase database...');
        
        // For local development, we need to handle CSP restrictions
        // We'll use the supabase client directly instead of fetch
        const { supabase } = await import('@/utils/supabaseClient');
        
        // Query to get all approved presets ordered by creation date
        const { data, error } = await supabase
          .from('presets')
          .select('id, name, effects, preview_url, download_url, file_type, downloads, likes, created_at, author_email')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error(error.message);
        }
        
        console.log(`✅ Loaded ${data ? data.length : 0} presets from Supabase database`);
        setPresets(data || []);
        
      } catch (error) {
        console.error('Error loading presets from Supabase:', error);
        // Network error - Supabase database not available
        console.log('❌ Network error - Supabase database not available');
        setError('Failed to connect to database');
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
            <div className="flex justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-primary" style={{ animationDuration: '0.8s' }}></div>
                <span className="text-foreground">Loading Presets...</span>
              </div>
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
                  id={preset.id}
                  name={preset.name}
                  effects={Array.isArray(preset.effects) ? preset.effects : preset.effects.split(', ')}
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