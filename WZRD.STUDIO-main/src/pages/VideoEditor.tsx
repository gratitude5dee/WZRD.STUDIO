
import React from 'react';
import { VideoEditorProvider } from '@/providers/VideoEditorProvider';
import VideoEditorComponent from '@/components/editor/VideoEditor';
import { useParams } from 'react-router-dom';

const VideoEditor = () => {
  const { projectId } = useParams();
  
  return (
    <div className="h-screen bg-[#0A0D16] overflow-hidden">
      <VideoEditorProvider>
        <VideoEditorComponent />
      </VideoEditorProvider>
    </div>
  );
};

export default VideoEditor;
