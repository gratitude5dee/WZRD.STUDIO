import { Video, Image as ImageIcon, Music, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LibraryMediaItem, useVideoEditorStore } from '@/store/videoEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useDrag } from '@/lib/react-dnd';

interface MediaItemProps {
  item: LibraryMediaItem;
  viewMode: 'grid' | 'list';
}

export function MediaItem({ item, viewMode }: MediaItemProps) {
  const addClip = useVideoEditorStore(s => s.addClip);
  const addAudioTrack = useVideoEditorStore(s => s.addAudioTrack);
  const audioTracks = useVideoEditorStore(s => s.audioTracks);
  
  // Enable drag functionality
  const [{ isDragging }, dragRef] = useDrag({
    type: 'MEDIA_ITEM',
    item: { mediaItem: item },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const Icon = 
    item.mediaType === 'video' ? Video :
    item.mediaType === 'audio' ? Music :
    ImageIcon;
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAddToTimeline = () => {
    if (!item.url) {
      toast.error('Media URL not available');
      return;
    }
    
    const durationMs = Math.max(1, item.durationSeconds ?? 5) * 1000;
    
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
      toast.success('Audio added to timeline');
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
    toast.success('Clip added to timeline');
  };
  
  if (viewMode === 'grid') {
    return (
      <div
        ref={dragRef}
        onClick={handleAddToTimeline}
        className={`relative aspect-square rounded-lg overflow-hidden cursor-grab active:cursor-grabbing bg-muted/50 border-2 border-border hover:border-primary transition-all group ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        {/* Thumbnail */}
        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        {/* Status overlay */}
        {item.status === 'processing' && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-2">
          <p className="text-foreground text-xs truncate font-medium">{item.name}</p>
          {item.durationSeconds && (
            <p className="text-muted-foreground text-xs">{formatDuration(item.durationSeconds)}</p>
          )}
        </div>
        
        {/* AI badge */}
        {item.sourceType === 'ai-generated' && (
          <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] h-5 px-1.5">AI</Badge>
        )}
        
        {/* Click to add indicator */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium">
            Click to add
          </div>
        </div>
      </div>
    );
  }
  
  // List view
  return (
    <div
      ref={dragRef}
      onClick={handleAddToTimeline}
      className={`flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border hover:border-primary cursor-grab active:cursor-grabbing transition-all group ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="w-10 h-10 rounded bg-muted/50 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-foreground text-sm truncate font-medium">{item.name}</p>
        <div className="flex items-center gap-2">
          {item.durationSeconds && (
            <p className="text-muted-foreground text-xs">{formatDuration(item.durationSeconds)}</p>
          )}
          {item.sourceType === 'ai-generated' && (
            <Badge className="bg-primary text-primary-foreground text-xs h-4 px-1">AI</Badge>
          )}
        </div>
      </div>
      
      {item.status === 'processing' && (
        <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
      )}
    </div>
  );
}
