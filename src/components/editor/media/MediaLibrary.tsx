import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useVideoEditorStore, LibraryMediaItem } from '@/store/videoEditorStore';
import { v4 as uuidv4 } from 'uuid';

interface MediaLibraryProps {
  projectId?: string;
}

export default function MediaLibrary({ projectId }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'uploaded' | 'audio'>('ai');
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
    if (activeTab === 'audio') {
      return mediaItems.filter((item) => item.mediaType === 'audio');
    }
    if (activeTab === 'uploaded') {
      return mediaItems.filter((item) => item.sourceType === 'uploaded');
    }
    return mediaItems.filter((item) => item.sourceType !== 'uploaded');
  }, [activeTab, mediaItems]);

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
      <div className="space-y-2 p-3">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="group relative bg-card/50 border border-border rounded-lg p-3 hover:border-primary/50 hover:bg-card transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium px-2 py-0.5 bg-muted/50 rounded">
                    {item.mediaType}
                  </span>
                  {item.durationSeconds && (
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {Math.floor(item.durationSeconds)}s
                    </span>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground shrink-0 text-xs h-7 px-3" 
                onClick={() => handleAddToTimeline(item)}
              >
                Add
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full bg-card border-r border-border flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground mb-3">Media Library</h2>
      </div>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="bg-muted/50 mx-4 grid grid-cols-3">
          <TabsTrigger value="ai" className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary">
            AI Generated
          </TabsTrigger>
          <TabsTrigger value="uploaded" className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary">
            Uploaded
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-xs data-[state=active]:bg-background data-[state=active]:text-primary">
            Audio
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">{renderItems()}</ScrollArea>
        </TabsContent>
        <TabsContent value="uploaded" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">{renderItems()}</ScrollArea>
        </TabsContent>
        <TabsContent value="audio" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">{renderItems()}</ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
