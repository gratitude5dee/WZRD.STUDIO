import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useVideoEditorStore, LibraryMediaItem } from '@/store/videoEditorStore';
import { v4 as uuidv4 } from 'uuid';
import { 
  Search, Image, Video, Music, Upload, Type, 
  Square, Volume2, Sparkles, LetterText, Plus
} from 'lucide-react';

interface MediaLibraryProps {
  projectId?: string;
}

type ToolbarTab = 'upload' | 'text' | 'video' | 'photos' | 'shapes' | 'audio' | 'volume' | 'effects';

export default function MediaLibrary({ projectId }: MediaLibraryProps) {
  const [toolbarTab, setToolbarTab] = useState<ToolbarTab>('photos');
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
    <div className="h-full flex bg-[#0a0a0a]">
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
          <h2 className="text-lg font-semibold mb-3 text-white">
            {toolbarTab === 'photos' ? 'Photos' : 
             toolbarTab === 'video' ? 'Videos' :
             toolbarTab === 'audio' ? 'Audio' : 'Media Library'}
          </h2>
          
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

