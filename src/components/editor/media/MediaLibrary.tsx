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
      return <p className="text-xs text-[#8E94A8] p-4">Select or create a project to load media.</p>;
    }

    if (isLoading) {
      return <p className="text-xs text-[#8E94A8] p-4">Loading media...</p>;
    }

    if (filteredItems.length === 0) {
      return <p className="text-xs text-[#8E94A8] p-4">No media available yet.</p>;
    }

    return (
      <div className="space-y-3 p-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-[#141826] border border-[#1D2130] rounded p-3">
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-[#8E94A8] uppercase">
                {item.mediaType} • {item.sourceType || 'unknown'}
              </p>
            </div>
            <Button size="sm" variant="outline" className="border-[#9b87f5] text-[#9b87f5]" onClick={() => handleAddToTimeline(item)}>
              Add
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-[280px] bg-[#0F1117] border-r border-[#1D2130] flex flex-col">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex-1 flex flex-col">
        <TabsList className="bg-transparent border-b border-[#1D2130]">
          <TabsTrigger value="ai" className="flex-1">AI</TabsTrigger>
          <TabsTrigger value="uploaded" className="flex-1">Uploads</TabsTrigger>
          <TabsTrigger value="audio" className="flex-1">Audio</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">{renderItems()}</ScrollArea>
        </TabsContent>
        <TabsContent value="uploaded" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">{renderItems()}</ScrollArea>
        </TabsContent>
        <TabsContent value="audio" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">{renderItems()}</ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
