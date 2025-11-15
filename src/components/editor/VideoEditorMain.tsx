import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { useComputeFlowSync } from '@/hooks/useComputeFlowSync';
import { useRealtimeTimelineSync } from '@/hooks/useRealtimeTimelineSync';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import PreviewCanvas from './preview/PreviewCanvas';
import TimelinePanel from './timeline/TimelinePanel';
import MediaLibrary from './media/MediaLibrary';
import PropertiesPanel from './properties/PropertiesPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Users, Share2, Download } from 'lucide-react';
import { loadDemoContent } from '@/lib/demoContent';

export default function VideoEditorMain() {
  const { projectId } = useParams();
  const loadProject = useVideoEditorStore((state) => state.loadProject);
  const storeProjectId = useVideoEditorStore((state) => state.project.id);
  const selectedClipIds = useVideoEditorStore((state) => state.selectedClipIds);
  const selectedAudioTrackIds = useVideoEditorStore((state) => state.selectedAudioTrackIds);
  const projectName = useVideoEditorStore((state) => state.project.name);
  const clips = useVideoEditorStore((state) => state.clips);
  const addClip = useVideoEditorStore((state) => state.addClip);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);
  const undo = useVideoEditorStore((state) => state.undo);
  const redo = useVideoEditorStore((state) => state.redo);

  useEffect(() => {
    if (projectId && projectId !== storeProjectId) {
      loadProject(projectId);
    } else if (!projectId && clips.length === 0) {
      // Load demo content if no project loaded
      loadDemoContent(addClip, addAudioTrack);
    }
  }, [loadProject, projectId, storeProjectId, clips.length, addClip, addAudioTrack]);

  useComputeFlowSync(projectId ?? storeProjectId);
  useRealtimeTimelineSync(projectId ?? storeProjectId);
  useEditorShortcuts();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      {/* Top Navbar */}
      <div className="h-14 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <h1 className="text-sm font-medium text-white">
          {projectName || 'Untitled video'}
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2a2a2a] gap-2"
          >
            <Users className="w-4 h-4" />
            Join Us
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#2a2a2a] gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={22} minSize={18} maxSize={30} className="bg-[#0a0a0a]">
          <MediaLibrary projectId={projectId} />
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-[#2a2a2a]" />

        <ResizablePanel defaultSize={56} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <PreviewCanvas selectedClipIds={selectedClipIds} />
            </ResizablePanel>
            
            <ResizableHandle className="h-[1px] bg-[#2a2a2a]" />
            
            <ResizablePanel defaultSize={35} minSize={20}>
              <TimelinePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className="w-[1px] bg-[#2a2a2a]" />

        <ResizablePanel defaultSize={22} minSize={18} maxSize={30} className="bg-[#0a0a0a]">
          <PropertiesPanel
            selectedClipIds={selectedClipIds}
            selectedAudioTrackIds={selectedAudioTrackIds}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
