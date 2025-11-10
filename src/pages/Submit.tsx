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
import { goFileService } from "@/utils/gofileService";

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
    const [uploadProgress, setUploadProgress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Check if user is logged in before allowing submission
        if (!user) {
            alert('🔐 Please log in to submit presets!\n\nYou can browse and fill out the form, but submission requires an account.');
            navigate('/auth');
            return;
        }
        
        console.log('Form submitted by:', user.name);
        setIsSubmitting(true);

        try {
            // Check storage quota first
            const quota = presetStorage.checkStorageQuota();
            console.log('Storage quota check:', quota);
            
            if (quota.needsCleanup) {
                console.log('Storage quota high, cleaning up old presets...');
                presetStorage.cleanupOldPresets();
                
                // Warn user about storage cleanup
                if (quota.used > 4 * 1024 * 1024) { // If over 4MB
                    alert('⚠️ Browser storage is nearly full. Some old presets may be removed to make space.');
                }
            }

            // Test localStorage
            const storageWorks = presetStorage.testStorage();
            console.log('Storage test result:', storageWorks);
            
            if (!storageWorks) {
                alert('❌ Browser storage is not working. Please check your browser settings.');
                setIsSubmitting(false);
                return;
            }

            // Basic validation first
            if (!formData.name.trim()) {
                alert('Please enter a preset name.');
                setIsSubmitting(false);
                return;
            }

            if (!formData.effects.trim()) {
                alert('Please describe the effects used.');
                setIsSubmitting(false);
                return;
            }

            console.log('Basic validation passed');

            // Require preview file
            if (!formData.previewFile) {
                alert('Please upload a preview file (GIF, image, or video).');
                setIsSubmitting(false);
                return;
            }

            // File size validation
            if (formData.previewFile && formData.previewFile.size > 10 * 1024 * 1024) {
                alert('Preview file is too large. Maximum size is 10MB.');
                setIsSubmitting(false);
                return;
            }
            
            if (formData.presetFile && formData.presetFile.size > 100 * 1024 * 1024) {
                alert('Preset file is too large. Maximum size is 100MB for GoFile.');
                setIsSubmitting(false);
                return;
            }

            console.log('File size validation passed');

            let previewData = '';
            
            // Handle preview file - try to process all files, with fallback for storage issues
            if (formData.previewFile) {
                console.log('Preview file selected:', formData.previewFile.name, 'Size:', formData.previewFile.size);
                
                try {
                    const reader = new FileReader();
                    previewData = await new Promise<string>((resolve, reject) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = () => reject(new Error('Failed to read file'));
                        reader.readAsDataURL(formData.previewFile!);
                    });
                    console.log('Preview file processed successfully, size:', previewData.length);
                    
                    // If the base64 data is extremely large (over 5MB when encoded), warn user
                    if (previewData.length > 5 * 1024 * 1024) {
                        console.log('Very large preview file detected');
                        alert('⚠️ Large preview file detected. If upload fails, try using a smaller GIF (under 5MB).');
                    }
                    
                } catch (error) {
                    console.error('Error processing preview file:', error);
                    alert('❌ Failed to process preview file. Please try a different file or smaller size.');
                    setIsSubmitting(false);
                    return;
                }
            }

            console.log('About to add preset to storage...');

            // Upload preset file to GoFile (no setup required)
            let fileDownloadUrl = formData.downloadLink?.trim() || '#';
            
            if (formData.presetFile) {
                try {
                    setUploadProgress('Uploading preset file to GoFile...');
                    console.log('Starting GoFile upload for:', formData.presetFile.name, 'Size:', formData.presetFile.size);
                    
                    // Validate file before upload
                    if (formData.presetFile.size === 0) {
                        throw new Error('File is empty or corrupted');
                    }
                    
                    const goFileResponse = await goFileService.uploadFile(formData.presetFile);
                    fileDownloadUrl = goFileService.getDownloadUrl(goFileResponse);
                    
                    console.log('✅ GoFile upload successful:', {
                        service: 'GoFile',
                        url: fileDownloadUrl,
                        fileName: goFileResponse.data?.fileName,
                        fileId: goFileResponse.data?.fileId,
                        code: goFileResponse.data?.code
                    });
                    
                    setUploadProgress('File uploaded successfully to GoFile!');
                    
                } catch (goFileError) {
                    console.error('GoFile upload error:', goFileError);
                    setUploadProgress('GoFile upload failed, continuing without file...');
                    
                    // Provide specific error messages based on error type
                    let errorMessage = goFileError.message;
                    let suggestion = 'The preset will be saved with preview only.';
                    
                    if (errorMessage.includes('File too large')) {
                        suggestion = 'Try compressing your file or use a smaller file (under 100MB).';
                    } else if (errorMessage.includes('Network error')) {
                        suggestion = 'Check your internet connection and try again.';
                    } else if (errorMessage.includes('timeout')) {
                        suggestion = 'Try using a smaller file or check your connection speed.';
                    } else if (errorMessage.includes('empty') || errorMessage.includes('corrupted')) {
                        suggestion = 'Please select a valid preset file and try again.';
                    }
                    
                    // For small files, offer to store as base64 fallback
                    if (formData.presetFile.size < 5 * 1024 * 1024) { // Under 5MB
                        const useLocalStorage = confirm(`⚠️ GoFile upload failed: ${errorMessage}\n\n${suggestion}\n\nWould you like to store the file locally instead? (File will be available for download on this device only)`);
                        
                        if (useLocalStorage) {
                            try {
                                setUploadProgress('Storing file locally...');
                                const reader = new FileReader();
                                const fileData = await new Promise<string>((resolve, reject) => {
                                    reader.onload = () => resolve(reader.result as string);
                                    reader.onerror = () => reject(new Error('Failed to read file'));
                                    reader.readAsDataURL(formData.presetFile!);
                                });
                                
                                // Store file data in preset for local download
                                presetData.localFileData = fileData;
                                fileDownloadUrl = 'local-file'; // Special marker for local files
                                setUploadProgress('File stored locally successfully!');
                            } catch (localError) {
                                console.error('Local storage error:', localError);
                                alert('Failed to store file locally. Continuing without file.');
                                fileDownloadUrl = formData.downloadLink?.trim() || '#';
                            }
                        } else {
                            fileDownloadUrl = formData.downloadLink?.trim() || '#';
                        }
                    } else {
                        alert(`⚠️ Failed to upload preset file to GoFile:\n\n${errorMessage}\n\n${suggestion}\n\nYou can add a download link manually if needed.`);
                        fileDownloadUrl = formData.downloadLink?.trim() || '#';
                    }
                }
            }

            setUploadProgress('Saving preset...');

            // Prepare preset data for both local storage and global database
            const presetData = {
                name: formData.name.trim(),
                effects: formData.effects.trim(),
                previewGif: previewData,
                downloadLink: fileDownloadUrl, // Use uploaded file URL if available
                presetFileName: formData.presetFile?.name || 'preset.ffx',
                author: user?.name || 'Anonymous'
            };

            console.log('Preset data prepared:', presetData);

            // Save to global database first (so all users can see it)
            let globalSaveSuccess = false;
            const submitEndpoints = ['/api/submit-preset', '/api/unified-presets'];
            
            for (const endpoint of submitEndpoints) {
                try {
                    setUploadProgress(`Saving to community database (${endpoint})...`);
                    
                    const apiResponse = await fetch(endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(presetData)
                    });

                    // Check if response is actually JSON
                    const contentType = apiResponse.headers.get('content-type');
                    if (!contentType || !contentType.includes('application/json')) {
                        console.log(`❌ ${endpoint} returned non-JSON response (API not available)`);
                        continue;
                    }

                    const apiResult = await apiResponse.json();
                    
                    if (apiResult.success) {
                        console.log(`✅ Preset saved to global database successfully via ${endpoint}`);
                        globalSaveSuccess = true;
                        break;
                    } else {
                        console.error(`❌ Failed to save via ${endpoint}:`, apiResult.error);
                    }
                } catch (apiError) {
                    console.error(`❌ ${endpoint} error:`, apiError);
                }
            }

            // Also save to localStorage as backup
            setUploadProgress('Saving locally...');
            const newPreset = presetStorage.addPreset(presetData);
            console.log('Preset added to local storage:', newPreset);

            // Success message based on save status
            if (globalSaveSuccess) {
                alert("✅ Preset uploaded successfully and is now visible to all users! Redirecting to homepage...");
            } else {
                alert("✅ Preset saved successfully! It's visible on your device and will sync to other users when the server is available.");
            }
            
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
            
            // Redirect to homepage
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error('Submit error:', error);
            alert(`❌ Failed to submit preset: ${error.message}`);
        } finally {
            setIsSubmitting(false);
            setUploadProgress('');
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
            const maxSize = e.target.name === 'previewFile' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
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
                                {!user && (
                                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-800 dark:text-blue-200">
                                            👋 <strong>Welcome!</strong> You can explore the form and see what's possible, but you'll need to{' '}
                                            <button 
                                                onClick={() => navigate('/auth')}
                                                className="underline hover:no-underline font-medium"
                                            >
                                                log in
                                            </button>{' '}
                                            to submit presets to the community.
                                        </p>
                                    </div>
                                )}
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
                                            required
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Upload a preview file (GIF, MP4, WebM, JPG, PNG - max 10MB) - Required
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
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Upload your preset file (.ffx, .aep, .mogrt, .zip - max 100MB) - Optional
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
                                        {isSubmitting ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                                                {uploadProgress || 'Processing...'}
                                            </>
                                        ) : user ? (
                                            "Submit Preset"
                                        ) : (
                                            "🔐 Login to Submit Preset"
                                        )}
                                    </Button>
                                    
                                    {uploadProgress && (
                                        <p className="text-sm text-muted-foreground text-center mt-2">
                                            {uploadProgress}
                                        </p>
                                    )}
                                    
                                    {!user && (
                                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                                            <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                                                💡 <strong>Ready to share?</strong>{' '}
                                                <button 
                                                    onClick={() => navigate('/auth')}
                                                    className="underline hover:no-underline font-medium"
                                                >
                                                    Create an account
                                                </button>{' '}
                                                to submit this preset to the community!
                                            </p>
                                        </div>
                                    )}
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