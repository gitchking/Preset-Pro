import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "./ui/button";
import { Upload, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-primary" style={{ animationDuration: '0.8s' }}></div>
          <span className="text-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <header className="w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
              <path d="M12 2 L2 7 L2 17 L12 22 L22 17 L22 7 L12 2 Z M12 22 L12 12 L22 7 M12 12 L2 7" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Preset Pro</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <a 
            href="https://www.youtube.com/channel/UCi84fOMGApCB8xzbugtFElw?sub_confirmation=1" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 h-8 px-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path d="M4 4 L22 12 L4 22 Z" fill="currentColor"/>
              </svg>
            </Button>
          </a>
          <Link to="/submit">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Submit
            </Button>
          </Link>
          <ThemeToggle />
          {!isAuthenticated ? (
            <Link to="/auth">
              <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </Link>
          ) : (
            <ProfileDropdown />
          )}
        </div>
      </div>
    </header>
  );
};