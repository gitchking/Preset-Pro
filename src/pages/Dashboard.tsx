import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Heart, 
  TrendingUp,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabaseClient";

// Define the Preset interface to match Supabase schema
interface Preset {
  id: number;
  name: string;
  effects: string;
  preview_url: string;
  download_url: string;
  file_type: string;
  downloads: number;
  likes: number;
  created_at: string;
  author_name?: string;
  author_email?: string;
  status?: string;
}

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userPresets, setUserPresets] = useState<Preset[]>([]);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    effects: "",
    download_url: ""
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPresets: 0,
    totalDownloads: 0,
    totalLikes: 0,
    avgLikes: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const getEffectsArray = (effects: string | string[]): string[] => {
    if (Array.isArray(effects)) {
      return effects;
    }
    if (typeof effects === 'string') {
      return effects.split(',');
    }
    return [];
  };

  useEffect(() => {
    // More robust authentication check for Dashboard
    const checkAuth = async () => {
      // Small delay to allow auth context to initialize
      setTimeout(() => {
        if (!isAuthenticated && !user) {
          navigate('/auth');
          return;
        }
        
        loadUserPresets();
      }, 100);
    };
    
    checkAuth();
  }, [user, isAuthenticated, navigate]);

  // Separate effect for handling URL parameters
  useEffect(() => {
    // Check if there's an edit parameter in the URL
    const searchParams = new URLSearchParams(location.search);
    const editId = searchParams.get('edit');
    if (editId && userPresets.length > 0) {
      // Find the preset to edit
      const presetToEdit = userPresets.find(preset => preset.id === parseInt(editId));
      if (presetToEdit) {
        handleEditPreset(presetToEdit);
      }
    }
  }, [location.search, userPresets]);

  const loadUserPresets = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Loading user presets for user:', user);
      
      // Check if user is admin using multiple fallback approaches
      let isAdminUser = false;
      
      // Approach 1: Try email-based query
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('is_admin')
          .eq('email', user.email)
          .single();
        
        if (!userError && userData) {
          isAdminUser = userData?.is_admin || false;
          setIsAdmin(isAdminUser);
        }
      } catch (e) {
        // Continue to next approach
      }
      
      // Approach 2: If email-based fails, try ID-based query
      if (!isAdminUser) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          if (!userError && userData) {
            isAdminUser = userData?.is_admin || false;
            setIsAdmin(isAdminUser);
          }
        } catch (e) {
          // Continue to next approach
        }
      }
      
      // Approach 3: If both fail, assume not admin
      if (!isAdminUser) {
        setIsAdmin(false);
      }
      
      let query = supabase.from('presets').select('*');
      
      if (isAdminUser) {
        // Admins can see all presets
        query = query.order('created_at', { ascending: false });
      } else {
        // Regular users can only see their own presets or unclaimed ones
        query = query
          .or(`author_email.eq.${user.email},author_name.eq.${user.name},author_email.is.null,author_name.is.null`)
          .order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching user presets:', error);
        return;
      }
      
      const presets = data || [];
      setUserPresets(presets);
      
      // Calculate stats
      const totalDownloads = presets.reduce((sum, preset) => sum + (preset.downloads || 0), 0);
      const totalLikes = presets.reduce((sum, preset) => sum + (preset.likes || 0), 0);
      const avgLikes = presets.length > 0 ? Math.round(totalLikes / presets.length * 10) / 10 : 0;
      
      setStats({
        totalPresets: presets.length,
        totalDownloads,
        totalLikes,
        avgLikes
      });
    } catch (error) {
      console.error('Error loading user presets:', error);
    } finally {
      setLoading(false);
    }
  };

  // New function to claim a preset
  const handleClaimPreset = async (presetId: number) => {
    try {
      // Update preset in Supabase database to associate with current user
      const { error } = await supabase
        .from('presets')
        .update({
          author_name: user?.name || 'Anonymous',
          author_email: user?.email || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', presetId);

      if (error) {
        console.error('Error claiming preset:', error);
        toast({
          title: "Error",
          description: "Failed to claim preset: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Refresh the presets list
      await loadUserPresets();
      toast({
        title: "Success",
        description: "Preset claimed successfully!",
      });
    } catch (error) {
      console.error('Error claiming preset:', error);
      toast({
        title: "Error",
        description: "Failed to claim preset: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Update the handleEditPreset function to work for admins
  const handleEditPreset = async (preset: Preset) => {
    try {
      // Check if user is admin first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('email', user?.email)
        .single();
      
      const isAdminUser = !userError && userData?.is_admin;
      
      // Allow editing for admins or preset owners
      if (isAdminUser || 
          preset.author_email === user?.email || 
          preset.author_name === user?.name ||
          (!preset.author_email && !preset.author_name)) { // Unclaimed presets
        setEditingPreset(preset);
        setEditForm({
          name: preset.name,
          effects: preset.effects,
          download_url: preset.download_url
        });
        setIsEditDialogOpen(true);
      } else {
        alert('You do not have permission to edit this preset.');
      }
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      alert('Failed to check permissions: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingPreset) return;

    try {
      // Update preset in Supabase database
      const { error } = await supabase
        .from('presets')
        .update({
          name: editForm.name,
          effects: editForm.effects,
          download_url: editForm.download_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPreset.id);

      if (error) {
        console.error('Error updating preset:', error);
        toast({
          title: "Error",
          description: "Failed to update preset: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Refresh the presets list
      await loadUserPresets();
      setIsEditDialogOpen(false);
      setEditingPreset(null);
      toast({
        title: "Success",
        description: "Preset updated successfully!",
      });
    } catch (error) {
      console.error('Error saving edit:', error);
      toast({
        title: "Error",
        description: "Failed to save changes: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Update the handleDeletePreset function to work for admins
  const handleDeletePreset = async (presetId: number) => {
    try {
      // Check if user is admin first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('email', user?.email)
        .single();
      
      const isAdminUser = !userError && userData?.is_admin;
      
      // Delete preset from Supabase database
      const { error } = await supabase
        .from('presets')
        .delete()
        .eq('id', presetId);
      
      if (error) {
        console.error('Error deleting preset:', error);
        toast({
          title: "Error",
          description: "Failed to delete preset: " + error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Refresh the presets list
      await loadUserPresets();
      toast({
        title: "Success",
        description: "Preset deleted successfully!",
      });
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast({
        title: "Error",
        description: "Failed to delete preset: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleLikePreset = async (presetId: number) => {
    try {
      // Get current preset to get current likes count
      const { data: presetData, error: fetchError } = await supabase
        .from('presets')
        .select('likes')
        .eq('id', presetId)
        .single();

      if (fetchError) {
        console.error('Error fetching preset:', fetchError);
        return;
      }

      // Update likes count
      const newLikes = (presetData.likes || 0) + 1;
      const { error } = await supabase
        .from('presets')
        .update({ likes: newLikes })
        .eq('id', presetId);

      if (error) {
        console.error('Error updating likes:', error);
        return;
      }

      // Refresh the presets list
      await loadUserPresets();
    } catch (error) {
      console.error('Error liking preset:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                  Dashboard
                </h1>
                <p className="text-lg text-muted-foreground">
                  Manage your presets and view your statistics
                </p>
              </div>
              {isAdmin && (
                <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  ADMIN
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Presets</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.totalPresets}</div>
                <p className="text-xs text-muted-foreground">
                  Your uploaded presets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalDownloads}</div>
                <p className="text-xs text-muted-foreground">
                  Across all presets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats.totalLikes}</div>
                <p className="text-xs text-muted-foreground">
                  Community appreciation
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Likes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.avgLikes}</div>
                <p className="text-xs text-muted-foreground">
                  Per preset
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Presets Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Presets
                </div>
              </CardTitle>
              <CardDescription>
                Manage, edit, and track your uploaded presets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading your presets...</p>
                </div>
              ) : userPresets.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No presets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by uploading your first preset to the community
                  </p>
                  <Button onClick={() => navigate('/submit')}>
                    Upload Preset
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPresets.map((preset) => (
                    <div key={preset.id} className="bg-card rounded-lg border p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start gap-4">
                        {/* Preview Thumbnail */}
                        <div className="flex-shrink-0">
                          <div className="w-24 h-24 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                            <img 
                              src={preset.preview_url} 
                              alt={preset.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI2FhYSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Preset Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-lg truncate">{preset.name}</h3>
                              {isAdmin && preset.author_email && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Author: {preset.author_email}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                {getEffectsArray(preset.effects).slice(0, 4).map((effect, index) => (
                                  <span
                                    key={index}
                                    className="rounded px-2 py-1 text-xs font-medium text-secondary-foreground bg-secondary"
                                  >
                                    {effect.trim()}
                                  </span>
                                ))}
                                {getEffectsArray(preset.effects).length > 4 && (
                                  <span className="text-xs text-muted-foreground self-center">+{getEffectsArray(preset.effects).length - 4} more</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => handleEditPreset(preset)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => handleDeletePreset(preset.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-4">
                            {/* Show Claim button for unclaimed presets (only for non-admins) */}
                            {!isAdmin && (!preset.author_name && !preset.author_email) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-9 px-4"
                                onClick={() => handleClaimPreset(preset.id)}
                              >
                                Claim
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Edit Preset Dialog */}
      {isEditDialogOpen && editingPreset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Edit Preset</h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Preview */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Preview</label>
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <img 
                        src={editingPreset.preview_url} 
                        alt={editingPreset.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNhYWEiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="edit-name" className="block text-sm font-medium mb-2">
                        Preset Name
                      </label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        placeholder="Enter preset name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-effects" className="block text-sm font-medium mb-2">
                        Effects Used
                      </label>
                      <Textarea
                        id="edit-effects"
                        value={editForm.effects}
                        onChange={(e) => setEditForm({...editForm, effects: e.target.value})}
                        placeholder="Enter effects used (comma separated)"
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="edit-download" className="block text-sm font-medium mb-2">
                        Download URL
                      </label>
                      <Input
                        id="edit-download"
                        value={editForm.download_url}
                        onChange={(e) => setEditForm({...editForm, download_url: e.target.value})}
                        placeholder="Enter download URL"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEdit}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <Toaster />
    </div>
  );
};

export default Dashboard;