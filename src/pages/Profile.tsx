import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  gender?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    gender: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
      navigate('/auth');
      return;
    }

    // Initialize profile with user data
    setProfile({
      name: user.name || "",
      email: user.email || "",
      avatar: user.avatar || "",
      bio: "",
      gender: user.gender || ""
    });

    // Load additional profile data from localStorage if exists
    const savedProfile = localStorage.getItem(`presetpro-profile-${user.email}`);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(prev => ({
          ...prev,
          ...parsedProfile,
          // Always use auth context for core user data
          name: user.name || prev.name,
          email: user.email || prev.email
        }));
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Avatar file is too large. Maximum size is 2MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }

      setAvatarFile(file);

      // Convert to base64 for preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setProfile(prev => ({
          ...prev,
          avatar: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);

    try {
      // Update user in auth context
      updateUser({
        name: profile.name,
        avatar: profile.avatar
      });

      // Save extended profile data to localStorage (user-specific)
      localStorage.setItem(`presetpro-profile-${user.email}`, JSON.stringify({
        bio: profile.bio,
        avatar: profile.avatar
      }));

      // Update the user data in the users storage as well
      const storedUsers = JSON.parse(localStorage.getItem('presetpro-users') || '{}');
      if (storedUsers[user.email]) {
        storedUsers[user.email] = {
          ...storedUsers[user.email],
          name: profile.name,
          avatar: profile.avatar
        };
        localStorage.setItem('presetpro-users', JSON.stringify(storedUsers));
      }
      
      alert('Profile updated successfully!');
      setAvatarFile(null);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
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
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
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
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      name="gender"
                      value={profile.gender || ""}
                      onChange={handleInputChange}
                      placeholder="Your gender"
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Gender cannot be changed after registration
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Input
                      id="bio"
                      name="bio"
                      value={profile.bio || ""}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  className="w-full" 
                  disabled={isUpdating}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUpdating ? "Updating..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;