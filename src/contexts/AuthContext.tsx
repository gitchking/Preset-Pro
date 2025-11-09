import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  gender: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, gender: string) => Promise<boolean>;
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

  useEffect(() => {
    // Check for existing session on app load
    const savedUser = localStorage.getItem('presetpro-user');
    const savedToken = localStorage.getItem('presetpro-token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('presetpro-user');
        localStorage.removeItem('presetpro-token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // For demo purposes, check against stored users in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('presetpro-users') || '{}');
      
      // Check demo user
      if (email === 'demo@presetpro.com' && password === 'demo123') {
        const userData = {
          id: '1',
          name: 'Demo User',
          email: 'demo@presetpro.com',
          gender: 'prefer-not-to-say',
          avatar: ''
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('presetpro-user', JSON.stringify(userData));
        localStorage.setItem('presetpro-token', 'demo-token');
        
        return true;
      }
      
      // Check registered users
      const user = storedUsers[email];
      if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        localStorage.setItem('presetpro-user', JSON.stringify(userWithoutPassword));
        localStorage.setItem('presetpro-token', 'user-token-' + Date.now());
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, gender: string): Promise<boolean> => {
    try {
      // Get existing users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('presetpro-users') || '{}');
      
      // Check if user already exists
      if (storedUsers[email]) {
        console.error('User already exists');
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password, // In production, this would be hashed
        gender,
        avatar: '',
        createdAt: new Date().toISOString()
      };
      
      // Store user
      storedUsers[email] = newUser;
      localStorage.setItem('presetpro-users', JSON.stringify(storedUsers));
      
      // Set as current user (excluding password)
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      localStorage.setItem('presetpro-user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('presetpro-token', 'user-token-' + Date.now());
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('presetpro-user');
    localStorage.removeItem('presetpro-token');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('presetpro-user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};