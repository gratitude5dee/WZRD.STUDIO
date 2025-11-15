import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const clearMediaState = () => {
  useVideoEditorStore.setState((state) => ({
    ...state,
    clips: [],
    audioTracks: [],
    selectedClipIds: [],
    selectedAudioTrackIds: [],
    mediaLibrary: { ...state.mediaLibrary, items: [], isLoading: false },
  }));
};

// Create context with a more complete type definition
type VideoEditorContextType = {
  isLoading: boolean;
  // We could include more shared state or methods here as needed
};

// Create context with proper typing
const VideoEditorContext = createContext<VideoEditorContextType | null>(null);

// Provider component
export function VideoEditorProvider({ children }: { children: ReactNode }) {
  const {
    project,
    setProjectId,
    setProjectName,
    reset,
  } = useVideoEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  // Load project data if we have a project ID (either from params or stored)
  useEffect(() => {
    const loadProjectData = async () => {
      const urlProjectId = params.projectId;

      if (urlProjectId && urlProjectId !== project.id) {
        setProjectId(urlProjectId);
        return;
      }

      const activeProjectId = project.id ?? urlProjectId;

      if (!activeProjectId) {
        clearMediaState();
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      clearMediaState();

      try {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', activeProjectId)
          .single();

        if (projectError) throw projectError;

        if (projectData) {
          setProjectName(projectData.title);

          await useVideoEditorStore.getState().loadProject(activeProjectId);
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [params.projectId, project.id, setProjectId, setProjectName]);
  
  // Clean up when unmounting
  useEffect(() => {
    return () => {
      // Reset the store when the provider is unmounted
      reset();
    };
  }, []);

  // Create context value with proper shape
  const contextValue = {
    isLoading,
    // We can add more shared state or methods here as needed
  };

  return (
    <VideoEditorContext.Provider value={contextValue}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        children
      )}
    </VideoEditorContext.Provider>
  );
}

// Hook to use the context state (not the store directly)
export function useVideoEditorContext() {
  const context = useContext(VideoEditorContext);
  if (context === null) {
    throw new Error('useVideoEditorContext must be used within a VideoEditorProvider');
  }
  return context;
}

// Hook to use the store (keep this for compatibility with existing components)
export function useVideoEditor() {
  // Ensure we're within the provider
  useContext(VideoEditorContext);
  return useVideoEditorStore();
}

// Export the raw store too for integration with external state if needed
export { useVideoEditorStore };
