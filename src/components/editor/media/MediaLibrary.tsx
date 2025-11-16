import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVideoEditorStore, LibraryMediaItem } from '@/store/videoEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Search, Image, Video, Music, Upload, Type, 
  Square, Volume2, Sparkles, LetterText, Plus, CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaLibraryProps {
  projectId?: string;
}

type ToolbarTab = 'upload' | 'text' | 'video' | 'photos' | 'shapes' | 'audio' | 'volume' | 'effects';

export default function MediaLibrary({ projectId }: MediaLibraryProps) {
  const [toolbarTab, setToolbarTab] = useState<ToolbarTab>('photos');
  const [activeTab, setActiveTab] = useState<'ai' | 'uploaded' | 'audio'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  
  const addClip = useVideoEditorStore((state) => state.addClip);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const mediaItems = useVideoEditorStore((state) => state.mediaLibrary.items);
  const isLoading = useVideoEditorStore((state) => state.mediaLibrary.isLoading);
  const loadMediaLibrary = useVideoEditorStore((state) => state.loadMediaLibrary);
  const clearMediaLibrary = useVideoEditorStore((state) => state.clearMediaLibrary);
  const addMediaItem = useVideoEditorStore((state) => state.addMediaItem);

  useEffect(() => {
    if (!projectId) {
      clearMediaLibrary();
      return;
    }
    loadMediaLibrary(projectId);
  }, [projectId, clearMediaLibrary, loadMediaLibrary]);

  const filteredItems = useMemo(() => {
    let items = mediaItems;
    
    // Filter by tab
    if (activeTab === 'audio') {
      items = items.filter((item) => item.mediaType === 'audio');
    } else if (activeTab === 'uploaded') {
      items = items.filter((item) => item.sourceType === 'uploaded');
    } else {
      items = items.filter((item) => item.sourceType !== 'uploaded');
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => 
        item.name.toLowerCase().includes(query)
      );
    }
    
    return items;
  }, [activeTab, mediaItems, searchQuery]);

  const handleAddToTimeline = (item: LibraryMediaItem) => {
    if (!item.url) return;
    const durationMs = Math.max(1, item.durationSeconds ?? 1) * 1000;
    if (item.mediaType === 'audio') {
      const nextTrackIndex = audioTracks.length
        ? Math.max(...audioTracks.map((track) => track.trackIndex ?? 0)) + 1
        : 0;
      addAudioTrack({
        id: uuidv4(),
        mediaItemId: item.id,
        type: 'audio',
        name: item.name,
        url: item.url,
        startTime: 0,
        duration: durationMs,
        endTime: durationMs,
        volume: 1,
        isMuted: false,
        trackIndex: nextTrackIndex,
        fadeInDuration: 0,
        fadeOutDuration: 0,
      });
      return;
    }
    addClip({
      id: uuidv4(),
      mediaItemId: item.id,
      type: item.mediaType === 'image' ? 'image' : 'video',
      name: item.name,
      url: item.url,
      startTime: 0,
      duration: durationMs,
      layer: 0,
      transforms: {
        position: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        rotation: 0,
        opacity: 1,
      },
    });
  };

  const uploadFiles = async (files: FileList) => {
    if (!projectId || files.length === 0) return;

    setIsUploading(true);
    const allowedTypes = {
      video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'],
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let mediaType: 'video' | 'image' | 'audio' | null = null;

      if (allowedTypes.video.includes(file.type)) {
        mediaType = 'video';
      } else if (allowedTypes.image.includes(file.type)) {
        mediaType = 'image';
      } else if (allowedTypes.audio.includes(file.type)) {
        mediaType = 'audio';
      } else {
        toast.error(`Unsupported file type: ${file.name}`);
        continue;
      }

      try {
        toast.info(`Uploading ${file.name}...`);

        const bucket = 'workflow-media';
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${projectId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);

        // Get media duration for video/audio
        let durationSeconds = mediaType === 'image' ? 5 : undefined;
        if (mediaType === 'video' || mediaType === 'audio') {
          durationSeconds = await getMediaDuration(file);
        }

        // Add to media library
        const newMediaItem: LibraryMediaItem = {
          id: uuidv4(),
          projectId,
          mediaType,
          name: file.name,
          url: publicUrl,
          durationSeconds,
          sourceType: 'uploaded',
          status: 'completed',
        };

        addMediaItem(newMediaItem);

        // Auto-add to timeline
        handleAddToTimeline(newMediaItem);

        toast.success(`${file.name} uploaded successfully!`);
      } catch (error: any) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }

    setIsUploading(false);
  };

  const getMediaDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const element = file.type.startsWith('video/') 
        ? document.createElement('video')
        : document.createElement('audio');
      
      element.src = url;
      element.addEventListener('loadedmetadata', () => {
        resolve(element.duration);
        URL.revokeObjectURL(url);
      });
      element.addEventListener('error', () => {
        resolve(5); // Default fallback
        URL.revokeObjectURL(url);
      });
    });
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  }, [projectId]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderItems = () => {
    if (!projectId) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Upload className="w-12 h-12 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Select or create a project to load media.</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading media...</p>
          </div>
        </div>
      );
    }

    if (filteredItems.length === 0) {
      return (
        <div 
          className={cn(
            "relative flex flex-col items-center justify-center h-full p-8 text-center",
            "border-2 border-dashed rounded-lg m-4 transition-all duration-200",
            isDragging 
              ? "border-primary bg-primary/5 scale-[1.02]" 
              : "border-border/50 hover:border-border"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.div
                key="dragging"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <CloudUpload className="w-16 h-16 text-primary mb-4 animate-bounce" />
                <p className="text-lg font-semibold text-primary mb-2">Drop files here</p>
                <p className="text-xs text-muted-foreground">Upload media to your project</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">No media yet</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Drag and drop files here or click to browse
                </p>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Media
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,image/*,audio/*"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2 p-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleAddToTimeline(item)}
            className="relative aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group"
          >
            {item.thumbnailUrl && (
              <img 
                src={item.thumbnailUrl} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
            )}
            {!item.thumbnailUrl && (
              <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                {item.mediaType === 'image' && <Image className="w-8 h-8 text-gray-600" />}
                {item.mediaType === 'video' && <Video className="w-8 h-8 text-gray-600" />}
                {item.mediaType === 'audio' && <Music className="w-8 h-8 text-gray-600" />}
              </div>
            )}
            {item.durationSeconds && (
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white">
                {formatDuration(item.durationSeconds)}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p className="text-white text-xs font-medium truncate">{item.name}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const toolbarIcons = [
    { id: 'upload' as ToolbarTab, icon: Upload, label: 'Upload' },
    { id: 'text' as ToolbarTab, icon: Type, label: 'Text' },
    { id: 'video' as ToolbarTab, icon: Video, label: 'Video' },
    { id: 'photos' as ToolbarTab, icon: Image, label: 'Photos' },
    { id: 'shapes' as ToolbarTab, icon: Square, label: 'Shapes' },
    { id: 'audio' as ToolbarTab, icon: Music, label: 'Audio' },
    { id: 'volume' as ToolbarTab, icon: Volume2, label: 'Volume' },
    { id: 'effects' as ToolbarTab, icon: Sparkles, label: 'Effects' },
  ];

  return (
    <div 
      className="h-full flex bg-[#0a0a0a] relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm border-4 border-primary border-dashed rounded-lg pointer-events-none"
          >
            <div className="flex flex-col items-center justify-center h-full">
              <CloudUpload className="w-24 h-24 text-primary mb-6 animate-bounce" />
              <p className="text-2xl font-bold text-primary mb-2">Drop files to upload</p>
              <p className="text-sm text-muted-foreground">Supported: Video, Image, Audio</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload progress indicator */}
      {isUploading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-40">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}

      {/* Vertical Icon Toolbar */}
      <div className="w-12 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col items-center py-3 gap-3">
        {toolbarIcons.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="icon"
            className={`w-9 h-9 ${
              toolbarTab === tool.id 
                ? 'bg-[#2a2a2a] text-white' 
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
            onClick={() => setToolbarTab(tool.id)}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </Button>
        ))}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="w-9 h-9 text-gray-400 hover:text-white hover:bg-[#1a1a1a]"
        >
          <LetterText className="w-5 h-5" />
        </Button>
      </div>

      {/* Content Panel */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        <div className="p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">
              {toolbarTab === 'photos' ? 'Photos' : 
               toolbarTab === 'video' ? 'Videos' :
               toolbarTab === 'audio' ? 'Audio' : 'Media Library'}
            </h2>
            
            {/* Upload button and hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,image/*,audio/*"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 text-gray-400 hover:text-white h-8"
              disabled={!projectId || isUploading}
            >
              <Upload className="w-4 h-4" />
              Upload
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder={toolbarTab === 'photos' ? 'Search Pexels images...' : 'Search media...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'ai' | 'uploaded' | 'audio')} className="flex-1 flex flex-col">
          <TabsList className="w-full grid grid-cols-3 bg-[#0a0a0a] border-b border-[#2a2a2a] rounded-none h-9">
            <TabsTrigger 
              value="ai" 
              className="text-xs text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]"
            >
              AI Generated
            </TabsTrigger>
            <TabsTrigger 
              value="uploaded" 
              className="text-xs text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]"
            >
              Uploaded
            </TabsTrigger>
            <TabsTrigger 
              value="audio" 
              className="text-xs text-gray-400 data-[state=active]:text-white data-[state=active]:bg-[#1a1a1a]"
            >
              Audio
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            {renderItems()}
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

