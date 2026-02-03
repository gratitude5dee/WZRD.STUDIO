
import React, { useEffect, useState } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import VideoEditorMain from './VideoEditorMain';

const VideoEditor = () => {
  const { project, setProjectId, setProjectName } = useVideoEditor();
  
  const navigate = useNavigate();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserAuthenticated(!!session);
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserAuthenticated(!!session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Create a default project if needed
  const handleCreateDefaultProject = async () => {
    try {
      setIsCreatingProject(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to create a project");
        return;
      }
      
      // Create default project
      const newProjectId = await supabaseService.projects.create({
        title: 'Untitled Project',
      });
      
      // Set project in store
      setProjectId(newProjectId);
      setProjectName('Untitled Project');
      
      toast.success("New project created");
      
      // Stay on the current page as we're already in the editor
    } catch (error) {
      console.error('Error creating default project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };
  
  // If we're not authenticated, show login prompt
  if (userAuthenticated === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0A0D16] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-center mb-6">Please log in to use the video editor.</p>
        <Button
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </div>
    );
  }
  
  // If we don't have a project ID and are authenticated, show project creation UI
  if (!project.id && userAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0A0D16] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
        <p className="text-center mb-6">Start by creating a new video editing project</p>
        <Button
          onClick={handleCreateDefaultProject}
          disabled={isCreatingProject}
          className="mb-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreatingProject ? 'Creating...' : 'Create New Project'}
        </Button>
      </div>
    );
  }

  return <VideoEditorMain />;
};

export default VideoEditor;
