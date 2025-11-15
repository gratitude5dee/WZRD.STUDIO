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
    <div className="flex flex-col h-screen bg-[#0A0D16] text-white">
      <PlaybackToolbar />

      <div className="flex flex-1 overflow-hidden border-t border-[#1D2130]">
        <MediaLibrary projectId={projectId} />

        <div className="flex-1 flex flex-col border-x border-[#1D2130]">
          <PreviewCanvas selectedClipIds={selectedClipIds} />
          <TimelinePanel />
        </div>

        <PropertiesPanel
          selectedClipIds={selectedClipIds}
          selectedAudioTrackIds={selectedAudioTrackIds}
        />
      </div>
    </div>
  );
}
