
import React from 'react';
import { Loader2, Wand2, Play, ImageOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ImageStatus } from '@/types/storyboardTypes';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ShotImageProps {
  shotId: string;
  imageUrl: string | null;
  status: ImageStatus;
  isGenerating: boolean;
  hasVisualPrompt: boolean;
  onGenerateImage: () => void;
  onGenerateVisualPrompt: () => void;
}

const ShotImage: React.FC<ShotImageProps> = ({
  shotId,
  imageUrl,
  status,
  isGenerating,
  hasVisualPrompt,
  onGenerateImage,
  onGenerateVisualPrompt
}) => {
  const [isGeneratingVideo, setIsGeneratingVideo] = React.useState(false);

  const handleGenerateVideo = async () => {
    if (!imageUrl) {
      toast.error('No image available to generate video from');
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-from-image', {
        body: { shot_id: shotId, image_url: imageUrl }
      });

      if (error) {
        throw new Error(error.message || 'Failed to start video generation');
      }

      toast.success('Video generation started successfully');
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast.error(`Failed to generate video: ${error.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const overlayBaseClass = "absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent";
  const textClass = "text-xs text-zinc-400";
  const buttonClass = "text-xs h-8 px-3 bg-black/40 border border-white/20 hover:bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 pointer-events-auto cursor-pointer";
  const iconClass = "w-3 h-3 mr-1";

  // Completed Image State
  if (imageUrl && status === 'completed') {
    return (
      <div className="w-full aspect-video relative group/image overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Shot visualization" 
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        />
        <div 
          className={cn(overlayBaseClass, "opacity-0 group-hover/image:opacity-100 transition-opacity duration-200")}
        >
          <Button
            variant="outline"
            size="sm"
            className={buttonClass}
            onClick={handleGenerateVideo}
            disabled={isGeneratingVideo}
          >
            {isGeneratingVideo ? (
              <Loader2 className={cn(iconClass, "animate-spin")} />
            ) : (
              <Play className={cn(iconClass, "fill-current")} />
            )}
            Generate Video
          </Button>
        </div>
      </div>
    );
  }

  // Loading/Generating/Pending/Failed States
  return (
    <div className="w-full aspect-video bg-zinc-900/50 backdrop-blur-sm flex flex-col items-center justify-center p-2 relative overflow-hidden border-b border-white/5">
      {isGenerating || status === 'generating' ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-400 mb-1" />
          <span className="text-xs text-zinc-300">Generating image...</span>
        </div>
      ) : status === 'failed' ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-400 mb-1" />
          <span className="text-xs text-red-400 mb-2">Generation failed</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={buttonClass}
            onClick={hasVisualPrompt ? onGenerateImage : onGenerateVisualPrompt}
          >
            <RefreshCw className={iconClass} /> Retry
          </Button>
        </div>
      ) : status === 'prompt_ready' ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <span className={textClass}>Prompt ready</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(buttonClass, "text-purple-300 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-200 mt-2")}
            onClick={onGenerateImage}
          >
            <Wand2 className={iconClass}/> Generate Image
          </Button>
        </div>
      ) : ( // Status is 'pending'
        <div className="flex flex-col items-center justify-center gap-2">
          <ImageOff className="h-5 w-5 text-zinc-500 mb-1" />
          <span className={textClass}>No image yet</span>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(buttonClass, "text-blue-300 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-200 mt-2")}
            onClick={onGenerateVisualPrompt}
          >
            <Wand2 className={iconClass} /> Generate Prompt
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShotImage;
