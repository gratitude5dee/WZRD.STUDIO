import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Video, Upload, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VideoItem {
  id: string;
  url: string;
  name: string;
  duration: number;
  thumbnail?: string;
  createdAt: string;
}

interface VideoLibraryTabProps {
  projectId?: string;
  onSelectVideo: (video: VideoItem) => void;
}

export const VideoLibraryTab: React.FC<VideoLibraryTabProps> = ({
  projectId,
  onSelectVideo,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadVideos();
  }, [projectId]);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      // Load from content_items table which exists in the schema
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('file_type', 'video')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVideos(
        data?.map((item) => ({
          id: item.id,
          url: item.file_url || '',
          name: item.title || 'Untitled Video',
          duration: (item.metadata as { duration?: number })?.duration || 0,
          thumbnail: item.thumbnail_url || undefined,
          createdAt: item.created_at,
        })) || []
      );
    } catch (error) {
      console.error('Failed to load videos:', error);
      // Load from session storage as fallback
      const storedVideos = JSON.parse(sessionStorage.getItem('videoEditorImages') || '[]');
      if (storedVideos.length > 0) {
        setVideos(storedVideos.filter((v: any) => v.type === 'video'));
      } else {
        setVideos([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video must be under 100MB');
        return;
      }

      setIsUploading(true);
      try {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { error: uploadError } = await supabase.storage
          .from('user-uploads')
          .upload(`videos/${fileName}`, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('user-uploads').getPublicUrl(`videos/${fileName}`);

        // Get video duration
        const video = document.createElement('video');
        video.src = publicUrl;
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        const newVideo: VideoItem = {
          id: `video-${Date.now()}`,
          url: publicUrl,
          name: file.name,
          duration: video.duration * 1000,
          createdAt: new Date().toISOString(),
        };

        // Store video info in local state only for now
        // The video is already uploaded to storage
        setVideos((prev) => [newVideo, ...prev]);
        toast.success('Video uploaded!');
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload video');
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  }, [projectId]);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-zinc-800">
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
          variant="outline"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Upload Video
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {videos.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No videos yet</p>
            <p className="text-sm">Upload your first video</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="relative aspect-video bg-zinc-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
              >
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2">
                  <p className="text-xs text-white truncate">{video.name}</p>
                  <p className="text-xs text-zinc-400">{formatDuration(video.duration)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

VideoLibraryTab.displayName = 'VideoLibraryTab';
