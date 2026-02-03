import React from 'react';
import VideoEditor from '@/components/editor/VideoEditor';
import { VideoEditorProvider } from '@/providers/VideoEditorProvider';
import { useParams } from 'react-router-dom';
import { useSyncVideoEditorState } from '@/integrations/stateIntegration';
import AppHeader from '@/components/AppHeader';

const ShotEditor = () => {
  const params = useParams();
  const projectId = params.projectId;
  
  // Use the integration to sync the state
  useSyncVideoEditorState({
    projectId: projectId || null,
    projectName: 'Untitled Project',
    onClipsChange: (clips) => {
      console.log('Clips changed:', clips);
    },
    onAudioTracksChange: (tracks) => {
      console.log('Audio tracks changed:', tracks);
    },
  });

  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
      <AppHeader />
      <div className="flex-1 bg-[#0F1117] overflow-hidden">
        <VideoEditorProvider>
          <VideoEditor />
        </VideoEditorProvider>
      </div>
    </div>
  );
};

export default ShotEditor;
