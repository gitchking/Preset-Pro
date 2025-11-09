import { ThemeToggle } from "./ThemeToggle";
import { ProfileDropdown } from "./ProfileDropdown";
import { Button } from "./ui/button";
import { Upload, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="w-full border-b border-border bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Preset Pro</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <Link to="/submit">
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
              <Upload className="h-4 w-4" />
              Submit
            </Button>
          </Link>
          <ThemeToggle />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};
