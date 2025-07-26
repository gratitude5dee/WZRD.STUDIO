
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { VideoEditorProvider } from '@/providers/VideoEditorProvider';
import VideoEditor from '@/components/editor/VideoEditor';
import { toast } from 'sonner';
import AppHeader from '@/components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';

const EditorPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const { setActiveProject } = useAppStore();
  
  // Validate that we have a projectId
  useEffect(() => {
    if (!projectId) {
      toast.error('No project ID specified');
      navigate('/home');
      return;
    }
    
    // Fetch project details and update app state
    const fetchProjectDetails = async () => {
      try {
        const project = await supabaseService.projects.find(projectId);
        
        if (!project) {
          throw new Error('Project not found');
        }
        
        setActiveProject(projectId, project.title || 'Untitled');
      } catch (error) {
        console.error('Error loading project:', error);
        toast.error('Could not load project');
        navigate('/home');
      }
    };
    
    fetchProjectDetails();
  }, [projectId, navigate, setActiveProject]);
  
  if (!projectId) {
    return null; // This is handled by the useEffect redirect
  }
  
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

export default EditorPage;
