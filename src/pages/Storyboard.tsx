
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { ProjectDetails, SceneDetails, CharacterDetails, SidebarData } from '@/types/storyboardTypes';
import { useCursorLoading } from '@/contexts/CursorLoadingContext';

const StoryboardPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<SceneDetails[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [characters, setCharacters] = useState<CharacterDetails[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);
  const [generationProgress, setGenerationProgress] = useState<Record<string, {
    dialogue: boolean;
    sound_effects: boolean;
    visual_prompt: boolean;
    image_url: boolean;
  }>>({});
  const { setGlobalCursorLoading } = useCursorLoading();
  const shotsGenerationTimeoutRef = useRef<NodeJS.Timeout>();

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
  }, [projectId, navigate]);

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
          await fetchData();
          
          if (payload.eventType === 'INSERT') {
            toast.success('New scene added');
          } else if (payload.eventType === 'UPDATE') {
            toast.success('Scene updated');
          } else if (payload.eventType === 'DELETE') {
            toast.info('Scene deleted');
          }
        })
      .subscribe();
    
    // Subscribe to shot changes for real-time progress tracking
    const shotsChannel = supabase
      .channel('shots_channel')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shots'
        },
        async (payload) => {
          console.log('Shot INSERT realtime update:', payload);
          await fetchData();
          
          // Find the scene this shot belongs to
          const shot = payload.new as any;
          const scene = scenes.find(s => s.id === shot.scene_id);
          if (scene) {
            toast.success(`Shot ${shot.shot_number} created for Scene ${scene.scene_number}`);
          }

          // Activate loading cursor
          setGlobalCursorLoading(true);
          
          // Clear existing timeout
          if (shotsGenerationTimeoutRef.current) {
            clearTimeout(shotsGenerationTimeoutRef.current);
          }
          
          // Set new timeout to turn off loading after 2s of no activity
          shotsGenerationTimeoutRef.current = setTimeout(() => {
            setGlobalCursorLoading(false);
          }, 2000);
        })
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shots',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('Shot realtime update:', payload);
          const shotId = payload.new.id;
          const newData = payload.new;
          
          setGenerationProgress(prev => {
            const current = prev[shotId] || {
              dialogue: false,
              sound_effects: false,
              visual_prompt: false,
              image_url: false
            };
            
            const updated = {
              dialogue: !!newData.dialogue || current.dialogue,
              sound_effects: !!newData.sound_effects || current.sound_effects,
              visual_prompt: !!newData.visual_prompt || current.visual_prompt,
              image_url: !!newData.image_url || current.image_url
            };
            
            // Show toast for newly completed fields
            if (!current.dialogue && updated.dialogue) {
              toast.success(`Shot ${newData.shot_number}: Dialogue generated`, { duration: 2000 });
            }
            if (!current.sound_effects && updated.sound_effects) {
              toast.success(`Shot ${newData.shot_number}: Sound effects generated`, { duration: 2000 });
            }
            if (!current.visual_prompt && updated.visual_prompt) {
              toast.success(`Shot ${newData.shot_number}: Visual prompt ready`, { duration: 2000 });
            }
            if (!current.image_url && updated.image_url) {
              toast.success(`Shot ${newData.shot_number}: Image generated`, { duration: 2000 });
            }
            
            return { ...prev, [shotId]: updated };
          });
          
          // Refresh data to show updated shots
          fetchData();
        }
      )
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      supabase.removeChannel(scenesChannel);
      supabase.removeChannel(shotsChannel);
      if (shotsGenerationTimeoutRef.current) {
        clearTimeout(shotsGenerationTimeoutRef.current);
      }
    };
  }, [projectId, fetchData, setGlobalCursorLoading]);

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
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center text-zinc-500 mt-20"
              >
                <AlertCircle className="mx-auto w-12 h-12 text-zinc-600 mb-4" />
                <p className="text-xl mb-2">No scenes found</p>
                <p className="text-sm mb-6">Add scenes manually or generate them in Project Setup.</p>
                <Button 
                  variant="outline" 
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-950/30"
                  onClick={addScene}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add First Scene
                </Button>
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
            {/* Floating Action Button to Add Scene */}
            <motion.button
              onClick={addScene}
              className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-gradient-to-br from-purple-600 to-indigo-600 p-0 flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20"
              whileHover={{ 
                scale: 1.1, 
                rotate: 15,
                boxShadow: "0px 0px 20px 0px rgba(147, 51, 234, 0.5)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10 
              }}
            >
              <Plus className="w-6 h-6 text-white" />
              <span className="sr-only">Add a scene</span>
            </motion.button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Background gradient and noise texture */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0D16]/90 to-[#131A2A]/90 -z-10" />
      <div className="fixed inset-0 bg-noise opacity-5 -z-10" style={{ backgroundImage: 'url(/noise.png)' }} />
    </div>
  );
};

export default StoryboardPage;
