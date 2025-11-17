import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { useComputeFlowSync } from '@/hooks/useComputeFlowSync';
import { useRealtimeTimelineSync } from '@/hooks/useRealtimeTimelineSync';
import { useEditorShortcuts } from '@/hooks/useEditorShortcuts';
import { useEditorKeyboardShortcuts } from '@/hooks/editor/useEditorKeyboardShortcuts';
import { usePropertySync } from '@/hooks/editor/usePropertySync';
import { loadDemoContent } from '@/lib/demoContent';
import { EditorHeader } from './EditorHeader';
import { EditorIconBar, EditorTab } from './EditorIconBar';
import { EditorMediaPanel } from './EditorMediaPanel';
import { EditorCanvas } from './EditorCanvas';
import TimelinePanel from './timeline/TimelinePanel';
import PropertiesPanel from './properties/PropertiesPanel';
import { editorTheme } from '@/lib/editor/theme';

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
  const playback = useVideoEditorStore((state) => state.playback);
  const composition = useVideoEditorStore((state) => state.composition);
  const play = useVideoEditorStore((state) => state.play);
  const pause = useVideoEditorStore((state) => state.pause);
  const seek = useVideoEditorStore((state) => state.seek);
  const undo = useVideoEditorStore((state) => state.undo);
  const redo = useVideoEditorStore((state) => state.redo);

  const [activeMediaTab, setActiveMediaTab] = useState<EditorTab>('photos');

  useEffect(() => {
    if (projectId && projectId !== storeProjectId) {
      loadProject(projectId).then(() => {
        if (clips.length === 0) {
          loadDemoContent(addClip, addAudioTrack);
        }
      });
    } else if (clips.length === 0) {
      loadDemoContent(addClip, addAudioTrack);
    }
  }, [loadProject, projectId, storeProjectId, clips.length, addClip, addAudioTrack]);

  useComputeFlowSync(projectId ?? storeProjectId);
  useRealtimeTimelineSync(projectId ?? storeProjectId);
  useEditorShortcuts();
  useEditorKeyboardShortcuts();
  usePropertySync();

  const handleTitleChange = (title: string) => {
    // Project name update logic here
    console.log('Update title:', title);
  };

  const handleExport = () => {
    console.log('Export clicked');
  };

  const handleShare = () => {
    console.log('Share clicked');
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: editorTheme.bg.primary }}
    >
      {/* Header */}
      <EditorHeader
        projectTitle={projectName || 'Untitled video'}
        onTitleChange={handleTitleChange}
        canUndo={false}
        canRedo={false}
        onUndo={undo}
        onRedo={redo}
        onShare={handleShare}
        onExport={handleExport}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="flex">
          <EditorIconBar
            activeTab={activeMediaTab}
            onTabChange={setActiveMediaTab}
          />
          <EditorMediaPanel
            activeTab={activeMediaTab}
          />
        </div>

        {/* Center - Canvas + Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          <EditorCanvas
            currentTime={playback.currentTime / 1000}
            duration={composition.duration / 1000}
            isPlaying={playback.isPlaying}
            onPlay={play}
            onPause={pause}
            onSeek={(time) => seek(time * 1000)}
          />

          <TimelinePanel />
        </div>

        {/* Right Sidebar - Properties */}
        <PropertiesPanel
          selectedClipIds={selectedClipIds}
          selectedAudioTrackIds={selectedAudioTrackIds}
        />
      </div>
    </div>
  );
}
