import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12">
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
