import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Upload, Image, Video, FileText, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

type ContentType = 'video' | 'image' | 'article';
type CreatorType = 'human' | 'agent';
type GenerationType = 'image' | 'video';

export default function MogUpload() {
  const navigate = useNavigate();
  const { address, isConnected, connect } = useWallet();
  
  // If not connected, show connect CTA (do not redirect away)
  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet to post');
    }
  }, [isConnected]);

  // Upload tab state
  const [contentType, setContentType] = useState<ContentType>('video');
  const savedCreatorType = localStorage.getItem('eartone_creator_type') as CreatorType | null;
  const [creatorType, setCreatorType] = useState<CreatorType>(savedCreatorType || 'human');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create tab state
  const [generationType, setGenerationType] = useState<GenerationType>('image');
  const [createCreatorType, setCreateCreatorType] = useState<CreatorType>('agent');
  const [createTitle, setCreateTitle] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createHashtags, setCreateHashtags] = useState('');
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [createUploading, setCreateUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSourceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setSourceImage(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setSourceImagePreview(url);
      setGeneratedPreview(null); // Reset generated preview when new source is selected
    }
  };

  const handleSubmit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (contentType !== 'article' && !file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      let mediaUrl = null;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${address.toLowerCase()}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('mog-media')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('mog-media')
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
      }

      const parsedHashtags = hashtags
        .split(/[\s,]+/)
        .filter(t => t.startsWith('#') || t.length > 0)
        .map(t => t.replace('#', '').trim())
        .filter(t => t.length > 0);

      const { error: insertError } = await supabase.from('mog_posts').insert({
        content_type: contentType,
        media_url: mediaUrl,
        title: title || null,
        description: description || null,
        hashtags: parsedHashtags,
        creator_wallet: address.toLowerCase(),
        creator_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        creator_type: creatorType,
      });

      if (insertError) throw insertError;

      toast.success('Mog created successfully!');
      navigate('/mog');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to create mog');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) {
      toast.error('Please upload a source image first');
      return;
    }

    if (!prompt.trim()) {
      toast.error('Please enter a prompt describing what you want');
      return;
    }

    setGenerating(true);

    try {
      // Convert source image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(sourceImage);
      });
      const sourceBase64 = await base64Promise;

      if (generationType === 'image') {
        // Use AI image generation/editing
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image_url", image_url: { url: sourceBase64 } }
                ]
              }
            ],
            modalities: ["image", "text"]
          })
        });

        if (!response.ok) throw new Error('Failed to generate image');

        const data = await response.json();
        const generatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

        if (generatedImageUrl) {
          setGeneratedPreview(generatedImageUrl);
          toast.success('Image generated successfully!');
        } else {
          throw new Error('No image in response');
        }
      } else {
        // Video generation placeholder - would integrate with video generation API
        toast.info('Video generation coming soon! For now, use image generation.');
        setGenerating(false);
        return;
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!generatedPreview) {
      toast.error('Please generate content first');
      return;
    }

    setCreateUploading(true);

    try {
      // Convert base64 to blob and upload
      const response = await fetch(generatedPreview);
      const blob = await response.blob();
      
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${generationType === 'video' ? 'mp4' : 'png'}`;
      const filePath = `${address.toLowerCase()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('mog-media')
        .upload(filePath, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('mog-media')
        .getPublicUrl(filePath);

      const parsedHashtags = createHashtags
        .split(/[\s,]+/)
        .filter(t => t.startsWith('#') || t.length > 0)
        .map(t => t.replace('#', '').trim())
        .filter(t => t.length > 0);

      const { error: insertError } = await supabase.from('mog_posts').insert({
        content_type: generationType,
        media_url: publicUrl,
        title: createTitle || null,
        description: createDescription || prompt,
        hashtags: parsedHashtags,
        creator_wallet: address.toLowerCase(),
        creator_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
        creator_type: createCreatorType,
      });

      if (insertError) throw insertError;

      toast.success('AI Mog created successfully!');
      navigate('/mog');
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create mog');
    } finally {
      setCreateUploading(false);
    }
  };

  const handleClose = () => {
    navigate('/home');
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 top-12 z-50 bg-background rounded-t-3xl overflow-hidden shadow-2xl"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <h1 className="text-lg font-semibold">New Mog</h1>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isConnected && (
          <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to post Mogs.
            </p>
            <Button size="sm" onClick={connect}>
              Connect
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="upload" className="h-[calc(100%-5rem)]">
          <div className="px-4 pt-3">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Mog
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Mog
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Upload Tab Content */}
          <TabsContent value="upload" className="h-[calc(100%-3rem)] overflow-y-auto mt-0">
            <div className="p-4 pb-safe-bottom space-y-6">
              {/* Content Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Content Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'video' as ContentType, icon: Video, label: 'Video' },
                    { type: 'image' as ContentType, icon: Image, label: 'Image' },
                    { type: 'article' as ContentType, icon: FileText, label: 'Article' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setContentType(type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                        contentType === type 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Creator Type</Label>
                <RadioGroup
                  value={creatorType}
                  onValueChange={(v) => setCreatorType(v as CreatorType)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="human" id="human" />
                    <Label htmlFor="human" className="flex items-center gap-1 cursor-pointer">
                      <span className="text-yellow-500">✓</span> Human Creator
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agent" id="agent" />
                    <Label htmlFor="agent" className="flex items-center gap-1 cursor-pointer">
                      🦞 AI Agent
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* File Upload */}
              {contentType !== 'article' && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    Upload {contentType === 'video' ? 'Video' : 'Image'}
                  </Label>
                  <input
                    id="file-input"
                    type="file"
                    accept={contentType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => document.getElementById('file-input')?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    {previewUrl ? (
                      <div className="space-y-2">
                        {contentType === 'video' ? (
                          <video src={previewUrl} className="w-full max-h-48 object-cover rounded-lg" />
                        ) : (
                          <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                        )}
                        <p className="text-sm text-foreground">{file?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Tap to select a {contentType}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your mog a title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this mog about?"
                  rows={3}
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label>Hashtags</Label>
                <Input
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  placeholder="#trending #mog #content"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={uploading || !address}
                className="w-full py-6 text-lg"
              >
                {uploading ? 'Creating...' : 'Post Mog'}
              </Button>
            </div>
          </TabsContent>

          {/* Create Tab Content */}
          <TabsContent value="create" className="h-[calc(100%-3rem)] overflow-y-auto mt-0">
            <div className="p-4 pb-safe-bottom space-y-6">
              {/* Generation Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Generate Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { type: 'image' as GenerationType, icon: Image, label: 'Image' },
                    { type: 'video' as GenerationType, icon: Video, label: '15s Video' },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setGenerationType(type)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                        generationType === type 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Type Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Creator Type</Label>
                <RadioGroup
                  value={createCreatorType}
                  onValueChange={(v) => setCreateCreatorType(v as CreatorType)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="human" id="create-human" />
                    <Label htmlFor="create-human" className="flex items-center gap-1 cursor-pointer">
                      <span className="text-yellow-500">✓</span> Human Creator
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agent" id="create-agent" />
                    <Label htmlFor="create-agent" className="flex items-center gap-1 cursor-pointer">
                      🦞 AI Agent
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Source Image Upload */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Source Image</Label>
                <input
                  id="source-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleSourceImageChange}
                  className="hidden"
                />
                <div
                  onClick={() => document.getElementById('source-image-input')?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  {sourceImagePreview ? (
                    <div className="space-y-2">
                      <img src={sourceImagePreview} alt="Source" className="w-full max-h-32 object-cover rounded-lg" />
                      <p className="text-sm text-foreground">{sourceImage?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Image className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload a source image to transform
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Prompt */}
              <div className="space-y-2">
                <Label className="text-base font-medium">AI Prompt</Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={generationType === 'video' 
                    ? "Describe the motion and scene... e.g., 'Make it rain with dramatic lighting'"
                    : "Describe the transformation... e.g., 'Add a sunset background with warm tones'"
                  }
                  rows={3}
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={generating || !sourceImage || !prompt.trim()}
                variant="outline"
                className="w-full py-5 border-primary text-primary hover:bg-primary/10"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {generationType === 'video' ? 'Video' : 'Image'}
                  </>
                )}
              </Button>

              {/* Generated Preview */}
              {generatedPreview && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Generated Result</Label>
                  <div className="border-2 border-primary/50 rounded-xl p-3 bg-primary/5">
                    {generationType === 'video' ? (
                      <video src={generatedPreview} controls className="w-full rounded-lg" />
                    ) : (
                      <img src={generatedPreview} alt="Generated" className="w-full rounded-lg" />
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <Label>Title (optional)</Label>
                <Input
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Give your AI mog a title"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Uses AI prompt if left empty"
                  rows={2}
                />
              </div>

              {/* Hashtags */}
              <div className="space-y-2">
                <Label>Hashtags</Label>
                <Input
                  value={createHashtags}
                  onChange={(e) => setCreateHashtags(e.target.value)}
                  placeholder="#ai #generated #mog"
                />
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleCreateSubmit}
                disabled={createUploading || !address || !generatedPreview}
                className="w-full py-6 text-lg"
              >
                {createUploading ? 'Creating...' : 'Post AI Mog'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
}
