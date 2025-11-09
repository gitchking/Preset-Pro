import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { presetStorage } from "@/utils/presetStorage";

const Submit = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
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
            // Validate file sizes before processing
            if (formData.previewFile && formData.previewFile.size > 5 * 1024 * 1024) {
                alert('Preview file is too large. Maximum size is 5MB.');
                setIsSubmitting(false);
                return;
            }
            
            if (formData.presetFile && formData.presetFile.size > 25 * 1024 * 1024) {
                alert('Preset file is too large. Maximum size is 25MB.');
                setIsSubmitting(false);
                return;
            }

            // Helper function to safely convert file to base64
            const fileToBase64 = (file: File): Promise<string> => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        resolve(result);
                    };
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                });
            };

            let previewData = '';
            
            // Convert preview file to base64 safely
            if (formData.previewFile) {
                try {
                    previewData = await fileToBase64(formData.previewFile);
                } catch (error) {
                    console.error('Error processing preview file:', error);
                    alert('Failed to process preview file. Please try a smaller file.');
                    setIsSubmitting(false);
                    return;
                }
            }
            
            // Add preset using client-side storage
            const newPreset = presetStorage.addPreset({
                name: formData.name,
                effects: formData.effects,
                previewGif: previewData,
                downloadLink: formData.downloadLink || '#',
                presetFileName: formData.presetFile?.name || 'preset.ffx',
                author: user?.name || 'Anonymous'
            });

            console.log('Preset added successfully:', newPreset);

            alert("Preset uploaded successfully! It's now live on the website.");
            
            // Reset form
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
            
            // Redirect to homepage to see the new preset
            setTimeout(() => {
                navigate('/');
            }, 1500);

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
            // Validate file size
            const maxSize = e.target.name === 'previewFile' ? 5 * 1024 * 1024 : 25 * 1024 * 1024;
            const fileType = e.target.name === 'previewFile' ? 'Preview' : 'Preset';
            
            if (file.size > maxSize) {
                alert(`${fileType} file is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
                e.target.value = ''; // Clear the input
                return;
            }
            
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
                                        {formData.previewFile && (
                                            <p className="text-xs text-muted-foreground">
                                                Selected: {formData.previewFile.name} ({(formData.previewFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        )}
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
                                        {formData.presetFile && (
                                            <p className="text-xs text-muted-foreground">
                                                Selected: {formData.presetFile.name} ({(formData.presetFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </p>
                                        )}
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