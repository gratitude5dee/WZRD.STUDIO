import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { motion, AnimatePresence } from 'framer-motion';
import AppHeader from '@/components/AppHeader';
import StoryboardSidebar from '@/components/storyboard/StoryboardSidebar';
import ShotsRow from '@/components/storyboard/ShotsRow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAppStore } from '@/store/appStore';
import { ProjectDetails, SceneDetails, CharacterDetails, SidebarData } from '@/types/storyboardTypes';
import { cn } from '@/lib/utils';

const StoryboardPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const { setActiveProject } = useAppStore();
  
  const [scenes, setScenes] = useState<SceneDetails[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [characters, setCharacters] = useState<CharacterDetails[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
  
  // Validate that we have a projectId
  useEffect(() => {
    if (!projectId) {
      toast.error('No project ID specified');
      navigate('/home');
      return;
    }
  }, [projectId, navigate]);

  // Memoize fetchData to prevent unnecessary re-renders
  const fetchData = useCallback(async () => {
    if (!projectId) {
      console.error("StoryboardPage: Project ID is missing");
      toast.error("Project ID not found. Redirecting to home page.");
      setIsLoading(false);
      navigate('/home');
      return;
    }

    console.log(`StoryboardPage: Fetching data for project ID: ${projectId}`);
    setIsLoading(true);
    try {
      // Fetch project, scenes, and characters in parallel
      const [projectRes, scenesRes, charactersRes] = await Promise.all([
        supabase.from('projects').select('id, title, description, video_style').eq('id', projectId).single(),
        supabase.from('scenes').select('*').eq('project_id', projectId).order('scene_number', { ascending: true }),
        supabase.from('characters').select('*').eq('project_id', projectId)
      ]);

      // Process Project
      if (projectRes.error) {
        throw new Error(projectRes.error.message || 'Failed to fetch project details.');
      }
      const fetchedProject = projectRes.data as ProjectDetails;
      setProjectDetails(fetchedProject);
      
      // Update the global app state with the project details
      setActiveProject(projectId, fetchedProject.title || 'Untitled');
      
      console.log("StoryboardPage: Fetched Project:", fetchedProject);

      // Process Scenes
      if (scenesRes.error) {
        throw new Error(scenesRes.error.message || 'Failed to fetch scenes.');
      }
      const fetchedScenes = (scenesRes.data || []) as SceneDetails[];
      setScenes(fetchedScenes);
      console.log(`StoryboardPage: Fetched ${fetchedScenes.length} Scenes:`, fetchedScenes);

      // Set initial selected scene - prefer scene 1 if it exists
      const initialScene = fetchedScenes.find(s => s.scene_number === 1) || 
                          (fetchedScenes.length > 0 ? fetchedScenes[0] : null);
      setSelectedScene(initialScene);
      console.log("StoryboardPage: Initial Selected Scene:", initialScene);

      // Process Characters
      if (charactersRes.error) {
        throw new Error(charactersRes.error.message || 'Failed to fetch characters.');
      }
      const fetchedCharacters = (charactersRes.data || []) as CharacterDetails[];
      setCharacters(fetchedCharacters);
      console.log(`StoryboardPage: Fetched ${fetchedCharacters.length} Characters:`, fetchedCharacters);

      // Prepare Initial Sidebar Data
      setSidebarData({
        projectTitle: fetchedProject.title,
        projectDescription: fetchedProject.description,
        sceneDescription: initialScene?.description ?? null,
        sceneLocation: initialScene?.location ?? null,
        sceneLighting: initialScene?.lighting ?? null,
        sceneWeather: initialScene?.weather ?? null,
        videoStyle: fetchedProject.video_style ?? null,
        characters: fetchedCharacters
      });
      console.log("StoryboardPage: Initial Sidebar Data Set");

      // If there are no scenes, show a toast to help guide the user
      if (fetchedScenes.length === 0) {
        toast.info("No scenes found. You can add a scene using the + button.", {
          duration: 5000,
        });
      }

    } catch (error: any) {
      console.error("Error fetching storyboard data:", error);
      toast.error(`Failed to load storyboard: ${error.message}`);
      setProjectDetails(null);
      setScenes([]);
      setCharacters([]);
      setSelectedScene(null);
      setSidebarData(null);
    } finally {
      setIsLoading(false);
      console.log("StoryboardPage: Fetching complete.");
    }
  }, [projectId, navigate, setActiveProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up realtime subscriptions to scenes and shots
  useEffect(() => {
    if (!projectId) return;
    
    console.log(`StoryboardPage: Setting up realtime subscriptions for project: ${projectId}`);
    
    // Subscribe to scene changes
    const scenesChannel = supabase
      .channel('scenes_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scenes',
          filter: `project_id=eq.${projectId}`
        }, 
        async (payload) => {
          console.log('Scenes realtime update:', payload);
          
          // Refresh the entire scene list on any change
          // This is simpler than trying to merge changes
          await fetchData();
          
          // Show a toast based on the event type
          if (payload.eventType === 'INSERT') {
            toast.success('New scene added');
          } else if (payload.eventType === 'UPDATE') {
            toast.success('Scene updated');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Scene deleted');
          }
        })
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(scenesChannel);
    };
  }, [projectId, fetchData]);

  // Function to update scene details in the database
  const handleSceneUpdate = async (sceneId: string | undefined, updates: Partial<Omit<SceneDetails, 'id' | 'project_id' | 'scene_number'>>) => {
    if (!sceneId) {
      toast.error("Cannot update scene: Scene ID is missing.");
      return;
    }
    try {
      const { error } = await supabase
        .from('scenes')
        .update(updates)
        .eq('id', sceneId);
      if (error) throw error;

      // Update local state for immediate feedback
      setSelectedScene(prev => prev ? { ...prev, ...updates } : null);
      setScenes(prevScenes => prevScenes.map(s => s.id === sceneId ? { ...s, ...updates } : s));
      setSidebarData(prev => prev ? {
        ...prev,
        sceneDescription: updates.description ?? prev.sceneDescription,
        sceneLocation: updates.location ?? prev.sceneLocation,
        sceneLighting: updates.lighting ?? prev.sceneLighting,
        sceneWeather: updates.weather ?? prev.sceneWeather,
      } : null);

    } catch (error: any) {
      console.error("Error updating scene:", error);
      toast.error(`Failed to update scene: ${error.message}`);
    }
  };

  // Add scene function
  const addScene = async () => {
    if (!projectId) return;
    const newSceneNumber = scenes.length > 0 ? Math.max(...scenes.map(s => s.scene_number)) + 1 : 1;
    try {
      const { data, error } = await supabase
        .from('scenes')
        .insert({ project_id: projectId, scene_number: newSceneNumber, title: `Scene ${newSceneNumber}` })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setScenes(prev => [...prev, data as SceneDetails]);
        toast.success(`Scene ${newSceneNumber} added.`);
      }
    } catch (error: any) {
      console.error("Error adding scene:", error);
      toast.error(`Failed to add scene: ${error.message}`);
    }
  };

  // Function to handle selecting a different scene
  const handleSelectScene = (scene: SceneDetails) => {
    setSelectedScene(scene);
    // Update sidebar data when scene changes
    setSidebarData(prev => projectDetails ? ({
      projectTitle: projectDetails.title,
      projectDescription: projectDetails.description,
      sceneDescription: scene.description ?? null,
      sceneLocation: scene.location ?? null,
      sceneLighting: scene.lighting ?? null,
      sceneWeather: scene.weather ?? null,
      videoStyle: projectDetails.video_style ?? null,
      characters: characters
    }) : null);
  };

  // Function to handle deleting a scene
  const handleDeleteScene = async (sceneId: string) => {
    if (!projectId) return;
    
    try {
      const { error } = await supabase
        .from('scenes')
        .delete()
        .eq('id', sceneId)
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      // Update local state to remove the deleted scene
      setScenes(prev => prev.filter(scene => scene.id !== sceneId));
      
      // If the deleted scene was selected, select another scene or null
      if (selectedScene?.id === sceneId) {
        const remainingScenes = scenes.filter(scene => scene.id !== sceneId);
        setSelectedScene(remainingScenes.length > 0 ? remainingScenes[0] : null);
        
        // Update sidebar data if needed
        if (remainingScenes.length > 0 && projectDetails) {
          const nextScene = remainingScenes[0];
          setSidebarData({
            projectTitle: projectDetails.title,
            projectDescription: projectDetails.description,
            sceneDescription: nextScene.description ?? null,
            sceneLocation: nextScene.location ?? null,
            sceneLighting: nextScene.lighting ?? null,
            sceneWeather: nextScene.weather ?? null,
            videoStyle: projectDetails.video_style ?? null,
            characters: characters
          });
        }
      }
      
      toast.success('Scene deleted');
    } catch (error: any) {
      console.error("Error deleting scene:", error);
      toast.error(`Failed to delete scene: ${error.message}`);
      throw error; // Re-throw so ShotsRow can handle it
    }
  };

  // Render logic
  if (isLoading && !projectDetails) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0D16] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-3">Loading Storyboard...</span>
      </div>
    );
  }

  if (!projectDetails && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0A0D16] text-white p-6">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Project</h2>
        <p className="text-zinc-400 mb-6">Could not load project data. The project ID might be missing or invalid.</p>
        <Button onClick={() => navigate('/home')}>Go to Projects</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
      <AppHeader />
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="h-full">
          {sidebarData ? (
            <StoryboardSidebar
              key={selectedScene?.id || 'no-scene'}
              data={sidebarData}
              onUpdate={(updates) => handleSceneUpdate(selectedScene?.id, updates)}
            />
          ) : (
            <div className="p-6 text-zinc-500">Loading sidebar...</div>
          )}
        </ResizablePanel>

        {/* Main content area */}
        <ResizablePanel defaultSize={80}>
          <div className="p-6 h-full overflow-y-auto relative">
            {scenes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "text-center mt-20 max-w-md mx-auto",
                  "p-8 rounded-2xl",
                  "bg-gradient-to-br from-zinc-900/60 to-zinc-900/30",
                  "backdrop-blur-sm border border-zinc-800/40",
                  "shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]"
                )}
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-zinc-800/50 
                  flex items-center justify-center
                  shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                  <AlertCircle className="w-8 h-8 text-zinc-500" />
                </div>
                
                <p className="text-xl font-semibold text-zinc-300 mb-2">No scenes found</p>
                <p className="text-sm text-zinc-500 mb-6">
                  Add scenes manually or generate them in Project Setup.
                </p>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    className={cn(
                      "bg-gradient-to-br from-purple-600/90 to-blue-600/90",
                      "border border-purple-500/30",
                      "shadow-[0_4px_20px_rgba(139,92,246,0.3)]",
                      "hover:shadow-[0_6px_28px_rgba(139,92,246,0.4)]"
                    )}
                    onClick={addScene}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add First Scene
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {scenes.map((scene, index) => (
                  <motion.div 
                    key={scene.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => handleSelectScene(scene)} 
                    className={`${selectedScene?.id === scene.id ? 'border-l-2 border-purple-500 pl-4 -ml-4 mb-12' : 'mb-12'}`}
                  >
                    <ShotsRow
                      sceneId={scene.id}
                      sceneNumber={scene.scene_number}
                      projectId={projectId} 
                      onSceneDelete={handleDeleteScene}
                      isSelected={selectedScene?.id === scene.id}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {/* Floating Action Button to Add Scene - Premium Design */}
            <div className="fixed bottom-8 right-8 z-30">
              {/* Glow layer (backdrop) */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40 blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Main button */}
              <motion.button
                onClick={addScene}
                className={cn(
                  "relative w-16 h-16 rounded-2xl",
                  "bg-gradient-to-br from-blue-600 to-purple-600",
                  "border-2 border-blue-500/30",
                  "shadow-[0_0_32px_rgba(139,92,246,0.5),0_8px_24px_rgba(59,130,246,0.4),inset_0_2px_0_rgba(255,255,255,0.2)]",
                  "flex items-center justify-center",
                  "overflow-hidden"
                )}
                whileHover={{ 
                  scale: 1.1,
                  rotate: 90,
                  boxShadow: "0 0 40px rgba(139,92,246,0.6), 0 12px 32px rgba(59,130,246,0.5)"
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15
                }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/15" />
                
                {/* Icon */}
                <Plus className="w-7 h-7 text-white relative z-10 drop-shadow-lg" />
                
                {/* Rotating shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ width: '200%', left: '-50%' }}
                  animate={{
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Enhanced Background */}
      {/* Base gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 -z-20" />
      
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      {/* Noise texture */}
      <div className="fixed inset-0 bg-noise opacity-[0.03] -z-10 mix-blend-overlay" 
        style={{ backgroundImage: 'url(/noise.png)' }} 
      />
    </div>
  );
};

export default StoryboardPage;
