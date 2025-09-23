
import React from 'react';
import { Loader2, Wand2, Play, ImageOff, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ImageStatus } from '@/types/storyboardTypes';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ShotImageProps {
  shotId: string;
  imageUrl: string | null;
  videoUrl: string | null;
  videoStatus: 'pending' | 'generating' | 'completed' | 'failed';
  status: ImageStatus;
  isGenerating: boolean;
  hasVisualPrompt: boolean;
  onGenerateImage: () => void;
  onGenerateVisualPrompt: () => void;
  onUpdate?: (updates: { video_url?: string; video_status?: 'pending' | 'generating' | 'completed' | 'failed' }) => void;
}

const ShotImage: React.FC<ShotImageProps> = ({
  shotId,
  imageUrl,
  videoUrl,
  videoStatus,
  status,
  isGenerating,
  hasVisualPrompt,
  onGenerateImage,
  onGenerateVisualPrompt,
  onUpdate
}) => {
  const [isGeneratingVideo, setIsGeneratingVideo] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Poll for video completion when generating
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (videoStatus === 'generating') {
      interval = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('shots')
            .select('video_url, video_status')
            .eq('id', shotId)
            .single();
          
          if (error) throw error;
          
          if (data && data.video_status === 'completed' && data.video_url) {
            onUpdate?.({ 
              video_url: data.video_url, 
              video_status: data.video_status 
            });
            toast.success('Video generation completed!');
          } else if (data && data.video_status === 'failed') {
            onUpdate?.({ video_status: 'failed' });
            toast.error('Video generation failed');
          }
        } catch (error) {
          console.error('Error polling video status:', error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [videoStatus, shotId, onUpdate]);

  // Auto-play video on hover
  React.useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  const handleGenerateVideo = async () => {
    if (!imageUrl) {
      toast.error('No image available to generate video from');
      return;
    }

    setIsGeneratingVideo(true);
    
    // Immediately update local state to show generating status
    onUpdate?.({ video_status: 'generating' });
    
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
      onUpdate?.({ video_status: 'failed' });
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const overlayBaseClass = "absolute inset-0 flex flex-col items-center justify-center text-center p-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent";
  const textClass = "text-xs text-zinc-400";
  const buttonClass = "text-xs h-8 px-3 bg-black/40 border border-white/20 hover:bg-white/10 text-white backdrop-blur-sm transition-colors duration-150 pointer-events-auto cursor-pointer";
  const iconClass = "w-3 h-3 mr-1";

  // Video Available State - Show video with hover autoplay and download button
  if (videoUrl && videoStatus === 'completed') {
    return (
      <div 
        className="w-full aspect-video relative group/video overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <video 
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
          muted
          loop
          playsInline
        />
        
        {/* Download button - top right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            scale: isHovered ? 1 : 0.8 
          }}
          transition={{ duration: 0.2 }}
          className="absolute top-2 right-2 z-20"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 bg-black/60 border-white/20 hover:bg-black/80 text-white backdrop-blur-sm"
            onClick={() => handleDownload(videoUrl, `shot-${shotId}-video.mp4`)}
          >
            <Download className="w-3 h-3" />
          </Button>
        </motion.div>

        {/* Video status overlay */}
        <div 
          className={cn(overlayBaseClass, "opacity-0 group-hover/video:opacity-100 transition-opacity duration-200")}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 text-white/90"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="text-xs">Video Ready</span>
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Video Generating State
  if (videoStatus === 'generating' || isGeneratingVideo) {
    return (
      <div className="w-full aspect-video relative group/video overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Shot visualization" 
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-zinc-900/50" />
        )}
        <div className={cn(overlayBaseClass, "opacity-100")}>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
            className="flex flex-col items-center gap-2"
          >
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <span className="text-xs text-blue-300">Generating video...</span>
          </motion.div>
        </div>
      </div>
    );
  }

  // Completed Image State - Show image with video generation option
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
    <div className="w-full aspect-video bg-zinc-900/50 backdrop-blur-sm flex flex-col items-center justify-center p-3 relative overflow-hidden border-b border-white/5 pointer-events-auto">
      <div className="relative z-10 pointer-events-auto">
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
              onClick={(e) => {
                e.stopPropagation();
                hasVisualPrompt ? onGenerateImage() : onGenerateVisualPrompt();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onGenerateImage();
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                onGenerateVisualPrompt();
              }}
            >
              <Wand2 className={iconClass} /> Generate Prompt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShotImage;
