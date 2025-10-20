
import React, { useEffect, useRef, useState } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import TimelinePanel from './TimelinePanel';
import MediaPanel from './MediaPanel';
import PreviewPanel from './PreviewPanel';
import ToolbarPanel from './ToolbarPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AIGenerationPanel from './AIGenerationPanel';

const VideoEditor = () => {
  const { 
    projectId,
    projectName, 
    isPlaying, 
    currentTime, 
    duration,
    togglePlayPause, 
    setCurrentTime, 
    setDuration,
    dialogs,
    openDialog,
    closeDialog,
    setProjectId,
    setProjectName
  } = useVideoEditor();
  
  const navigate = useNavigate();
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);

  // Reference to the video element for playback control
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Handle playback state changes
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);
  
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
  if (!projectId && userAuthenticated) {
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

  return (
    <div className="flex flex-col h-full bg-[#0A0D16] text-white">
      <ToolbarPanel />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left panel - Media Library */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#111520] border-r border-[#1D2130]">
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="w-full bg-[#0A0D16] border-b border-[#1D2130]">
              <TabsTrigger value="library" className="flex-1">Media Library</TabsTrigger>
              <TabsTrigger value="effects" className="flex-1">Effects</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <MediaPanel />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="effects" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">Effects Panel</h3>
                  <p className="text-sm text-zinc-400">Drag and drop effects onto your media</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Center panel - Preview */}
        <ResizablePanel defaultSize={60} className="bg-[#0F1117]">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} className="flex items-center justify-center">
              <PreviewPanel videoRef={videoRef} />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Timeline panel */}
            <ResizablePanel defaultSize={30} className="bg-[#111520] border-t border-[#1D2130]">
              <TimelinePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right panel - Properties */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#111520] border-l border-[#1D2130]">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="w-full bg-[#0A0D16] border-b border-[#1D2130]">
              <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
              <TabsTrigger value="generate" className="flex-1">Generate</TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">Properties Panel</h3>
                  <p className="text-sm text-zinc-400">Edit properties of selected media</p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="generate" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <AIGenerationPanel />
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default VideoEditor;
