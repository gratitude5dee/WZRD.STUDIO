import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { useComputeFlowSync } from '@/hooks/useComputeFlowSync';
import { useRealtimeTimelineSync } from '@/hooks/useRealtimeTimelineSync';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import PlaybackToolbar from './toolbar/PlaybackToolbar';
import PreviewCanvas from './preview/PreviewCanvas';
import TimelinePanel from './timeline/TimelinePanel';
import MediaLibrary from './media/MediaLibrary';
import PropertiesPanel from './properties/PropertiesPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

export default function VideoEditorMain() {
  const { projectId } = useParams();
  const loadProject = useVideoEditorStore((state) => state.loadProject);
  const storeProjectId = useVideoEditorStore((state) => state.project.id);
  const selectedClipIds = useVideoEditorStore((state) => state.selectedClipIds);
  const selectedAudioTrackIds = useVideoEditorStore((state) => state.selectedAudioTrackIds);

  useEffect(() => {
    if (projectId && projectId !== storeProjectId) {
      loadProject(projectId);
    }
  }, [loadProject, projectId, storeProjectId]);

  useComputeFlowSync(projectId ?? storeProjectId);
  useRealtimeTimelineSync(projectId ?? storeProjectId);
  useEditorShortcuts();

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <PlaybackToolbar />

      <ResizablePanelGroup direction="horizontal" className="flex-1 border-t border-border">
        <ResizablePanel defaultSize={18} minSize={12} maxSize={25} className="bg-card">
          <MediaLibrary projectId={projectId} />
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

        <ResizablePanel defaultSize={62} minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <PreviewCanvas selectedClipIds={selectedClipIds} />
            </ResizablePanel>
            
            <ResizableHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />
            
            <ResizablePanel defaultSize={35} minSize={20}>
              <TimelinePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle className="w-1 bg-border hover:bg-primary/50 transition-colors" />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-card">
          <PropertiesPanel
            selectedClipIds={selectedClipIds}
            selectedAudioTrackIds={selectedAudioTrackIds}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
