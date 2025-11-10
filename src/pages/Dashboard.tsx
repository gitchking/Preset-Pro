import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { presetStorage, type Preset } from "@/utils/presetStorage";
import { GifPreview } from "@/components/GifPreview";
import { BarChart3, Edit, Trash2, Eye, Download, Heart, Calendar, FileText, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth');
      return;
    }

    loadUserPresets();
  }, [user, isAuthenticated, navigate]);

  const loadUserPresets = () => {
    if (!user) return;

    const allPresets = presetStorage.getPresets();
    const userPresets = allPresets.filter(preset => preset.author === user.name);
    setUserPresets(userPresets);

    // Calculate stats
    const totalDownloads = userPresets.reduce((sum, preset) => sum + preset.downloads, 0);
    const totalLikes = userPresets.reduce((sum, preset) => sum + preset.likes, 0);
    const avgLikes = userPresets.length > 0 ? Math.round(totalLikes / userPresets.length * 10) / 10 : 0;

    setStats({
      totalPresets: userPresets.length,
      totalDownloads,
      totalLikes,
      avgLikes
    });
  };

  const handleEditPreset = (preset: Preset) => {
    setEditingPreset(preset);
    setEditForm({
      name: preset.name,
      effects: preset.effects,
      download_url: preset.download_url
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingPreset) return;

    const allPresets = presetStorage.getPresets();
    const updatedPresets = allPresets.map(preset => 
      preset.id === editingPreset.id 
        ? { 
            ...preset, 
            name: editForm.name,
            effects: editForm.effects,
            download_url: editForm.download_url
          }
        : preset
    );

    presetStorage.setPresets(updatedPresets);
    loadUserPresets();
    setIsEditDialogOpen(false);
    setEditingPreset(null);
  };

  const handleDeletePreset = (presetId: number) => {
    const success = presetStorage.deletePreset(presetId);
    if (success) {
      loadUserPresets();
    }
  };

  const handleLikePreset = (presetId: number) => {
    const allPresets = presetStorage.getPresets();
    const updatedPresets = allPresets.map(preset => 
      preset.id === presetId 
        ? { ...preset, likes: preset.likes + 1 }
        : preset
    );

    presetStorage.setPresets(updatedPresets);
    loadUserPresets();
  };

  const debugStorage = () => {
    const allPresets = presetStorage.getPresets();
    console.log('=== STORAGE DEBUG ===');
    console.log('Total presets:', allPresets.length);
    allPresets.forEach((preset, index) => {
      console.log(`Preset ${index + 1}:`, {
        id: preset.id,
        name: preset.name,
        preview_url_type: preset.preview_url.startsWith('data:') ? 'Base64 Data' : 'External URL',
        preview_url_length: preset.preview_url.length,
        preview_url_start: preset.preview_url.substring(0, 50) + '...',
        author: preset.author
      });
    });
    alert('Debug info logged to console. Check browser developer tools.');
  };

  const clearRandomImages = () => {
    if (confirm('This will remove all presets with random placeholder images. Only uploaded content will remain. Continue?')) {
      presetStorage.clearRandomImagePresets();
      loadUserPresets();
      alert('✅ Cleared all random image presets. Only uploaded content remains.');
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
        <div className="container mx-auto px-6 py-12">
          <div className="mb-12">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your presets and view your statistics
            </p>
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
              <CardTitle className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Your Presets
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearRandomImages}>
                    Clear Random Images
                  </Button>
                  <Button variant="outline" size="sm" onClick={debugStorage}>
                    Debug Storage
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Manage, edit, and track your uploaded presets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userPresets.length === 0 ? (
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
                    <div key={preset.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <GifPreview
                          src={preset.preview_url}
                          alt={preset.name}
                          className="w-16 h-16 rounded-md"
                        />
                        <div>
                          <h3 className="font-semibold">{preset.name}</h3>
                          <p className="text-sm text-muted-foreground">{preset.effects}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(preset.created_at)}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {preset.downloads}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {preset.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLikePreset(preset.id)}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        
                        <Dialog open={isEditDialogOpen && editingPreset?.id === preset.id} onOpenChange={setIsEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPreset(preset)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Preset</DialogTitle>
                              <DialogDescription>
                                Update your preset information
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-name">Name</Label>
                                <Input
                                  id="edit-name"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-effects">Effects</Label>
                                <Textarea
                                  id="edit-effects"
                                  value={editForm.effects}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, effects: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-download">Download URL</Label>
                                <Input
                                  id="edit-download"
                                  value={editForm.download_url}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, download_url: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSaveEdit}>
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{preset.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePreset(preset.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;