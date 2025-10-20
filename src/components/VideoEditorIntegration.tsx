
import React from 'react';
import { VideoEditorProvider, useVideoEditor } from '@/providers/VideoEditorProvider';
import VideoEditor from '@/components/editor/VideoEditor';
import { useSyncVideoEditorState } from '@/integrations/stateIntegration';

interface VideoEditorIntegrationProps {
  projectId?: string | null;
  projectName?: string;
}

/**
 * This component wraps the video editor and handles state synchronization
 * between your existing state management and the video editor's Zustand store
 */
const VideoEditorIntegration: React.FC<VideoEditorIntegrationProps> = ({
  projectId,
  projectName
}) => {
  // Set up synchronization between your external state and the video editor state
  useSyncVideoEditorState({
    projectId,
    projectName,
    onClipsChange: (clips) => {
      console.log('Clips changed:', clips);
    },
    onAudioTracksChange: (tracks) => {
      console.log('Audio tracks changed:', tracks);
    },
  });

  return (
    <VideoEditorProvider>
      <VideoEditor />
    </VideoEditorProvider>
  );
};

export default VideoEditorIntegration;
