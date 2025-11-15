import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVideoEditorStore, LibraryMediaItem } from '@/store/videoEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { Search, Image, Video, Music, Plus } from 'lucide-react';

interface MediaLibraryProps {
  projectId?: string;
}

export default function MediaLibrary({ projectId }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'uploaded' | 'audio'>('ai');
  const [searchQuery, setSearchQuery] = useState('');
  const addClip = useVideoEditorStore((state) => state.addClip);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const mediaItems = useVideoEditorStore((state) => state.mediaLibrary.items);
  const isLoading = useVideoEditorStore((state) => state.mediaLibrary.isLoading);
  const loadMediaLibrary = useVideoEditorStore((state) => state.loadMediaLibrary);
  const clearMediaLibrary = useVideoEditorStore((state) => state.clearMediaLibrary);

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

  const renderItems = () => {
    if (!projectId) {
      return <p className="text-xs text-muted-foreground p-4">Select or create a project to load media.</p>;
    }

    if (isLoading) {
      return <p className="text-xs text-muted-foreground p-4">Loading media...</p>;
    }

    if (filteredItems.length === 0) {
      return <p className="text-xs text-muted-foreground p-4">No media available yet.</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-3 p-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => handleAddToTimeline(item)}
          >
            <div className="aspect-video bg-muted/20 flex items-center justify-center relative">
              {item.thumbnailUrl ? (
                <img 
                  src={item.thumbnailUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  {item.mediaType === 'image' && <Image className="w-8 h-8 text-muted-foreground" />}
                  {item.mediaType === 'video' && <Video className="w-8 h-8 text-muted-foreground" />}
                  {item.mediaType === 'audio' && <Music className="w-8 h-8 text-muted-foreground" />}
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
            </div>
            
            <div className="p-2">
              <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
              <span className="text-[10px] text-muted-foreground uppercase">
                {item.mediaType}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full bg-card border-r border-border flex flex-col">
      <div className="p-3 space-y-3 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Media</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/20 border-border text-sm"
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-8">
            <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary">All</TabsTrigger>
            <TabsTrigger value="uploaded" className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary">Photos</TabsTrigger>
            <TabsTrigger value="audio" className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary">Audio</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ScrollArea className="flex-1">
        {renderItems()}
      </ScrollArea>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
