import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface User {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar: string;
  bio: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, gender: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load user data from database
  const loadUserData = async (userId: string, authUser: any) => {
    try {
      console.log('Loading user data for ID:', userId);
      
      // Try to load user data from Supabase
      let { data, error } = await supabase
        .from('users')
        .select('name, email, gender, avatar_url, bio')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Error loading user data:', error);
        
        // If user not found, create them
        if (error.code === 'PGRST116') {
          console.log('User not found, creating...');
          // Generate a username from the email if not provided
          const username = authUser.email?.split('@')[0] || `user_${userId.substring(0, 8)}`;
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              username: username, // Add username field
              email: authUser.email,
              name: authUser.email?.split('@')[0] || 'User',
              gender: 'prefer-not-to-say',
              avatar_url: '',
              bio: ''
            });

          if (insertError) {
            console.error('Failed to create user:', insertError);
          } else {
            // Try loading again
            const { data: retryData, error: retryError } = await supabase
              .from('users')
              .select('name, email, gender, avatar_url, bio')
              .eq('id', userId)
              .single();

            if (!retryError && retryData) {
              data = retryData;
            }
          }
        }
      }

      const userObj: User = {
        id: userId,
        name: data?.name || authUser.email?.split('@')[0] || 'User',
        email: data?.email || authUser.email || '',
        gender: data?.gender || 'prefer-not-to-say',
        avatar: data?.avatar_url || '',
        bio: data?.bio || ''
      };

      console.log('User data loaded:', userObj);
      setUser(userObj);
      setIsAuthenticated(true);
      return userObj;
    } catch (error: any) {
      console.error('Error loading user data:', error);
      
      // Fallback to basic user data from auth session
      const userObj: User = {
        id: userId,
        name: authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        gender: 'prefer-not-to-say',
        avatar: '',
        bio: ''
      };

      setUser(userObj);
      setIsAuthenticated(true);
      return userObj;
    }
  };

  useEffect(() => {
    // Check for existing session on app load
    const checkUserSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session data:', session);
        if (session?.user) {
          await loadUserData(session.user.id, session.user);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
      if (session?.user) {
        loadUserData(session.user.id, session.user);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserData(data.user.id, data.user);
        return { success: true };
      }

      return { success: false, error: 'Failed to login' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const register = async (name: string, email: string, password: string, gender: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Try to insert user data into database
        try {
          // Generate a username from the email
          const username = email.split('@')[0];
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              username: username, // Add username field
              name: name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              gender: gender || 'prefer-not-to-say'
            });
          
          if (insertError && !insertError.message.includes('duplicate key')) {
            console.error('Error inserting user data:', insertError);
          }
        } catch (insertError) {
          console.error('Error inserting user data:', insertError);
        }
        
        await loadUserData(data.user.id, data.user);
        
        return { success: true, error: 'Please check your email for confirmation' };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      // Update local state
      const updatedUser = {
        ...user,
        ...userData,
        avatar: userData.avatar !== undefined ? userData.avatar : user.avatar,
        bio: userData.bio !== undefined ? userData.bio : user.bio
      };
      
      setUser(updatedUser);
      
      // Also update in database
      try {
        const { error } = await supabase
          .from('users')
          .update({
            name: updatedUser.name,
            avatar_url: updatedUser.avatar,
            bio: updatedUser.bio,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating user in database:', error);
        }
      } catch (error) {
        console.error('Error updating user in database:', error);
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};