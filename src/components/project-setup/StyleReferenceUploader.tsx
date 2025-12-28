import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, X, Check, Loader2, Palette, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StyleReferenceUploaderProps {
  projectId: string;
  styleReferenceUrl?: string;
  onStyleReferenceChange: (url: string | null, assetId: string | null) => void;
}

export const StyleReferenceUploader: React.FC<StyleReferenceUploaderProps> = ({
  projectId,
  styleReferenceUrl,
  onStyleReferenceChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `style-ref-${Date.now()}.${fileExt}`;
      const filePath = `${projectId}/style-references/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('project-assets')
        .getPublicUrl(filePath);

      const { data: userData } = await supabase.auth.getUser();

      const { data: mediaItem, error: mediaError } = await supabase
        .from('media_items')
        .insert({
          project_id: projectId,
          user_id: userData.user?.id,
          name: `Style Reference: ${file.name}`,
          media_type: 'image',
          url: publicUrl,
          storage_bucket: 'project-assets',
          storage_path: filePath,
          mime_type: file.type,
          file_size: file.size,
          source_type: 'uploaded',
          status: 'completed',
          metadata: { purpose: 'style_reference' },
        })
        .select('id')
        .single();

      if (mediaError) throw mediaError;

      const { error: projectError } = await supabase
        .from('projects')
        .update({ style_reference_asset_id: mediaItem.id })
        .eq('id', projectId);

      if (projectError) throw projectError;

      onStyleReferenceChange(publicUrl, mediaItem.id);
      toast.success('Style reference uploaded!');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload style reference');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      await supabase
        .from('projects')
        .update({ style_reference_asset_id: null })
        .eq('id', projectId);

      onStyleReferenceChange(null, null);
      toast.success('Style reference removed');
    } catch (err: any) {
      console.error('Remove error:', err);
      toast.error('Failed to remove style reference');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-zinc-400 uppercase tracking-wide flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Style Reference
        </Label>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-zinc-500" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>Upload an image to guide the visual style of all AI-generated images in your project.</p>
          </TooltipContent>
        </Tooltip>
        {styleReferenceUrl && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Active
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {styleReferenceUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className="aspect-video rounded-lg overflow-hidden border border-zinc-700 bg-[#111319]">
              <img
                src={styleReferenceUrl}
                alt="Style Reference"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="sm" onClick={handleRemove}>
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>

            <p className="text-xs text-zinc-500 mt-2 text-center">
              This style will influence all generated images
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-zinc-700 hover:border-zinc-500 bg-[#18191E]'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-zinc-400" />
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-zinc-400">
                {isDragging ? 'Drop image here' : 'Drag image here'}
              </p>
              <p className="text-xs text-zinc-500">or click to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
