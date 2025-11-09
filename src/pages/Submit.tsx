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
        downloadLink: "",
        previewFile: null as File | null,
        presetFile: null as File | null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Create FormData for file uploads
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('effects', formData.effects);
            formDataToSend.append('downloadLink', formData.downloadLink);
            
            if (formData.previewFile) {
                formDataToSend.append('previewFile', formData.previewFile);
            }
            if (formData.presetFile) {
                formDataToSend.append('presetFile', formData.presetFile);
            }
            
            // For now, let's use a simple approach with the working presets API
            // Convert files to base64 for JSON submission
            let previewData = '';
            let presetData = '';
            
            if (formData.previewFile) {
                const previewBuffer = await formData.previewFile.arrayBuffer();
                const previewBase64 = btoa(String.fromCharCode(...new Uint8Array(previewBuffer)));
                previewData = `data:${formData.previewFile.type};base64,${previewBase64}`;
            }
            
            if (formData.presetFile) {
                const presetBuffer = await formData.presetFile.arrayBuffer();
                const presetBase64 = btoa(String.fromCharCode(...new Uint8Array(presetBuffer)));
                presetData = presetBase64;
            }
            
            const response = await fetch('/api/presets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    effects: formData.effects,
                    previewGif: previewData || 'https://via.placeholder.com/400x300/8B5CF6/ffffff?text=Preview',
                    downloadLink: formData.downloadLink || '#',
                    presetFileData: presetData,
                    presetFileName: formData.presetFile?.name || 'preset.ffx'
                }),
            });

            const result = await response.json();
            console.log('Upload response:', result);

            if (response.ok && result.success) {
                alert("Preset uploaded successfully! It's now live on the website.");
                setFormData({ 
                    name: "", 
                    effects: "", 
                    downloadLink: "",
                    previewFile: null,
                    presetFile: null
                });
                // Reset file inputs
                const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
                fileInputs.forEach(input => input.value = '');
            } else {
                const errorMessage = result.error || 'Failed to submit preset';
                console.error('Upload failed:', result);
                alert(`Upload failed: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error submitting preset:', error);
            alert(`Failed to submit preset: ${error.message}. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [e.target.name]: file
            }));
        }
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
                                        <Label htmlFor="previewFile">Preview GIF/Video</Label>
                                        <Input
                                            id="previewFile"
                                            name="previewFile"
                                            type="file"
                                            accept=".gif,.mp4,.webm,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Upload a preview file (GIF, MP4, WebM, JPG, PNG - max 5MB)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="presetFile">Preset File</Label>
                                        <Input
                                            id="presetFile"
                                            name="presetFile"
                                            type="file"
                                            accept=".ffx,.aep,.mogrt,.zip,.rar"
                                            onChange={handleFileChange}
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Upload your preset file (.ffx, .aep, .mogrt, .zip - max 25MB)
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="downloadLink">Additional Resources (Optional)</Label>
                                        <Input
                                            id="downloadLink"
                                            name="downloadLink"
                                            type="url"
                                            value={formData.downloadLink}
                                            onChange={handleChange}
                                            placeholder="https://example.com/tutorial-or-resources"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Optional: Link to tutorials, documentation, or additional resources
                                        </p>
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting..." : "Submit Preset"}
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