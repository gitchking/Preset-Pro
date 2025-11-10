import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "@/hooks/use-toast";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabaseClient";

interface UserProfile {
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated, isLoading } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatar_url: "",
    bio: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load user profile data from Supabase
  useEffect(() => {
    const loadProfile = async () => {
      if (!user || !isAuthenticated) {
        if (!isLoading) {
          navigate('/auth');
        }
        return;
      }

      try {
        console.log('Loading profile for user ID:', user.id);
        
        // Simple query to test database access
        const { data, error } = await supabase
          .from('users')
          .select('name, email, avatar_url, bio')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile load error:', error);
          
          // If user not found, create them
          if (error.code === 'PGRST116') {
            console.log('User not found, creating...');
            // Generate a username from the email if not provided
            const username = user.email?.split('@')[0] || `user_${user.id.substring(0, 8)}`;
            
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: user.id,
                username: username, // Add username field
                email: user.email,
                name: user.name || user.email?.split('@')[0] || 'User',
                gender: user.gender || 'prefer-not-to-say',
                avatar_url: '',
                bio: ''
              });

            if (insertError) {
              console.error('Failed to create user:', insertError);
              toast({
                title: "Error",
                description: "Failed to create profile: " + insertError.message,
                variant: "destructive",
              });
              return;
            }

            // Try loading again
            const { data: retryData, error: retryError } = await supabase
              .from('users')
              .select('name, email, avatar_url, bio')
              .eq('id', user.id)
              .single();

            if (retryError) {
              console.error('Failed to load profile after creation:', retryError);
              toast({
                title: "Error",
                description: "Failed to load profile after creation: " + retryError.message,
                variant: "destructive",
              });
              return;
            }

            if (retryData) {
              setProfile({
                name: retryData.name || "",
                email: retryData.email || "",
                avatar_url: retryData.avatar_url || "",
                bio: retryData.bio || ""
              });
            }
          } else {
            toast({
              title: "Error",
              description: "Failed to load profile: " + error.message,
              variant: "destructive",
            });
          }
          return;
        }

        if (data) {
          console.log('Profile loaded successfully:', data);
          setProfile({
            name: data.name || "",
            email: data.email || "",
            avatar_url: data.avatar_url || "",
            bio: data.bio || ""
          });
        }
      } catch (error) {
        console.error('Unexpected error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Avatar file is too large. Maximum size is 2MB.",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setProfile(prev => ({
          ...prev,
          avatar_url: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/avatar-${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        toast({
          title: "Error",
          description: "Failed to upload avatar: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);

    try {
      let avatarUrl = profile.avatar_url;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }

      // Update user profile in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          avatar_url: avatarUrl,
          bio: profile.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile: " + error.message,
          variant: "destructive",
        });
        return;
      }

      // Update auth context
      updateUser({
        name: profile.name,
        avatar: avatarUrl,
        bio: profile.bio
      });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              Profile Settings
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Manage your profile information and avatar
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details and avatar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <Label htmlFor="avatar" className="cursor-pointer">
                      <div className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
                        <Camera className="h-4 w-4" />
                        <span>Change Avatar</span>
                      </div>
                    </Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF up to 2MB
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      placeholder="your.email@example.com"
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full" 
                  disabled={isUpdating || uploading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating || uploading ? "Updating..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      <Toaster />
    </div>
  );
};

export default Profile;