import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Submit = () => {
  const [formData, setFormData] = useState({
    name: "",
    effects: "",
    previewGif: "",
    downloadLink: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted preset:", formData);
    // Here you would typically send the data to your backend
    alert("Preset submitted successfully!");
    setFormData({ name: "", effects: "", previewGif: "", downloadLink: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Submit Your Preset
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Share your amazing After Effects presets with the community. 
              Help other creators discover new effects and techniques.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Preset Details</CardTitle>
                <CardDescription>
                  Fill in the information about your After Effects preset
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Preset Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Smooth Camera Shake"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effects">Effects Used</Label>
                    <Textarea
                      id="effects"
                      name="effects"
                      value={formData.effects}
                      onChange={handleChange}
                      placeholder="e.g., Transform, Expression, Motion Blur"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previewGif">Preview GIF URL</Label>
                    <Input
                      id="previewGif"
                      name="previewGif"
                      type="url"
                      value={formData.previewGif}
                      onChange={handleChange}
                      placeholder="https://example.com/preview.gif"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downloadLink">Download Link</Label>
                    <Input
                      id="downloadLink"
                      name="downloadLink"
                      type="url"
                      value={formData.downloadLink}
                      onChange={handleChange}
                      placeholder="https://example.com/download-link"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Submit Preset
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;