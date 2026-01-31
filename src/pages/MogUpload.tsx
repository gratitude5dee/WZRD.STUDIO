import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Upload, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";

type ContentType = 'video' | 'image' | 'article';
type CreatorType = 'human' | 'agent';

export default function MogUpload() {
  const navigate = useNavigate();
  const { address, isConnected, connect } = useWallet();
  
  // Redirect to library if not connected
  useEffect(() => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      connect();
      navigate('/library');
    }
  }, [isConnected, navigate, connect]);

  const [contentType, setContentType] = useState<ContentType>('video');
  // Pre-fill creator type from onboarding preference
  const savedCreatorType = localStorage.getItem('eartone_creator_type') as CreatorType | null;
  const [creatorType, setCreatorType] = useState<CreatorType>(savedCreatorType || 'human');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
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

      // Upload file to Supabase Storage
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

      // Parse hashtags
      const parsedHashtags = hashtags
        .split(/[\s,]+/)
        .filter(t => t.startsWith('#') || t.length > 0)
        .map(t => t.replace('#', '').trim())
        .filter(t => t.length > 0);

      // Create post record
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
          <h1 className="text-lg font-semibold">Create Mog</h1>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="h-[calc(100%-5rem)] overflow-y-auto">
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
        </div>
      </motion.div>
    </>
  );
}
