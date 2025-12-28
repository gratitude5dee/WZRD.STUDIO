import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, ZoomIn, Film, Loader2, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShotImageActionsProps {
  shotId: string;
  imageUrl: string;
  visualPrompt?: string;
  upscaleStatus?: string;
  upscaledImageUrl?: string;
  onImageUpdate: (newImageUrl: string, type: 'edited' | 'upscaled') => void;
  onVideoGenerate?: () => void;
}

const QUICK_EDITS = [
  'Make it more cinematic',
  'Add dramatic lighting',
  'Make colors more vibrant',
  'Add film grain',
  'Make it darker/moodier',
  'Add depth of field blur'
];

export function ShotImageActions({
  shotId,
  imageUrl,
  visualPrompt = '',
  upscaleStatus,
  upscaledImageUrl,
  onImageUpdate,
  onVideoGenerate
}: ShotImageActionsProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpscaling, setIsUpscaling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      toast.error('Please enter an edit prompt');
      return;
    }

    setIsEditing(true);

    try {
      const { data, error } = await supabase.functions.invoke('edit-shot-image', {
        body: {
          shot_id: shotId,
          image_url: imageUrl,
          edit_prompt: editPrompt,
          original_prompt: visualPrompt
        }
      });

      if (error) throw error;

      if (data?.image_url) {
        onImageUpdate(data.image_url, 'edited');
        setIsEditDialogOpen(false);
        setEditPrompt('');
        toast.success('Image edited successfully!');
      }
    } catch (err) {
      console.error('Image edit failed:', err);
      toast.error('Failed to edit image. Feature may not be available yet.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleUpscale = async () => {
    setIsUpscaling(true);

    try {
      const { data, error } = await supabase.functions.invoke('upscale-shot-image', {
        body: {
          shot_id: shotId,
          image_url: imageUrl,
          scale: 2,
          model: 'creative'
        }
      });

      if (error) throw error;

      if (data?.image_url) {
        onImageUpdate(data.image_url, 'upscaled');
        toast.success('Image upscaled to 2x!');
      }
    } catch (err) {
      console.error('Upscale failed:', err);
      toast.error('Failed to upscale image. Feature may not be available yet.');
    } finally {
      setIsUpscaling(false);
    }
  };

  if (!imageUrl) return null;

  return (
    <>
      {/* Action buttons overlay on image */}
      <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <TooltipProvider>
          {/* Edit Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 h-7 text-xs bg-black/70 hover:bg-black/90 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditDialogOpen(true);
                }}
              >
                <Pencil className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit image with AI prompt</TooltipContent>
          </Tooltip>

          {/* Upscale Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 h-7 text-xs bg-black/70 hover:bg-black/90 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpscale();
                }}
                disabled={isUpscaling || upscaleStatus === 'ready'}
              >
                {isUpscaling ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <ZoomIn className="w-3 h-3 mr-1" />
                )}
                {upscaleStatus === 'ready' ? 'Upscaled' : 'Upscale'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upscale image to 2x resolution</TooltipContent>
          </Tooltip>

          {/* Generate Video Button */}
          {onVideoGenerate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="flex-1 h-7 text-xs bg-primary/90 hover:bg-primary backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoGenerate();
                  }}
                >
                  <Film className="w-3 h-3 mr-1" />
                  Video
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate video from this image</TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
            <DialogDescription>
              Describe the changes you want to make to this image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Image Preview */}
            <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
              <img
                src={imageUrl}
                alt="Current shot"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Edit Prompt */}
            <div>
              <Label>Edit Instructions</Label>
              <Textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="e.g., 'Make the sky more dramatic with orange sunset colors' or 'Add rain and wet reflections'"
                rows={3}
                className="mt-1"
              />
            </div>

            {/* Quick Edit Suggestions */}
            <div>
              <Label className="text-xs text-zinc-500">Quick Edits</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {QUICK_EDITS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    size="sm"
                    variant="outline"
                    className="text-xs h-6"
                    onClick={() => setEditPrompt(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>

            {/* Original Prompt Reference */}
            {visualPrompt && (
              <div className="p-2 bg-zinc-900/50 rounded-md">
                <Label className="text-xs text-zinc-500">Original Prompt</Label>
                <p className="text-xs text-zinc-400 mt-1">{visualPrompt}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditImage}
              disabled={isEditing || !editPrompt.trim()}
            >
              {isEditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Editing...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Apply Edit
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
