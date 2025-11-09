import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container mx-auto flex h-16 items-center px-6">
        <div className="flex w-full flex-col gap-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-0">
          <Link to="/" className="flex items-center gap-2 sm:justify-self-start">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Preset Pro</span>
          </Link>
          
          <span className="text-base font-medium text-muted-foreground sm:justify-self-center">
            © {new Date().getFullYear()} Preset Pro
          </span>
          
          <div className="flex flex-col items-start gap-4 text-base font-medium text-muted-foreground sm:flex-row sm:items-center sm:justify-self-end">
            <Link 
              to="/privacy" 
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link 
              to="/terms" 
              className="transition-colors hover:text-foreground"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
