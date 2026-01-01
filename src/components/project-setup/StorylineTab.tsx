import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectContext } from './ProjectContext';
import { StorylineProgress } from './StorylineProgress';
import { TextAnimate } from '@/components/ui/text-animate';
import { motion, AnimatePresence } from 'framer-motion';
import type { Storyline } from './types';
import { ProjectData } from './types';

interface StorylineTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}


const StorylineTab = ({ projectData, updateProjectData }: StorylineTabProps) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [selectedStoryline, setSelectedStoryline] = useState<Storyline | null>(null);
  const [alternativeStorylines, setAlternativeStorylines] = useState<Storyline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { projectId: contextProjectId, saveProjectData } = useProjectContext();
  const navigate = useNavigate();
  const params = useParams();
  
  // Streaming state
  const [streamingStory, setStreamingStory] = useState('');
  const [streamingStatus, setStreamingStatus] = useState<'idle' | 'creating' | 'generating' | 'scenes' | 'characters' | 'complete' | 'failed'>('idle');
  const [streamingScenes, setStreamingScenes] = useState<any[]>([]);
  const [streamingCharacters, setStreamingCharacters] = useState<any[]>([]);
  const [generationError, setGenerationError] = useState<string | undefined>();
  
  // Determine the project ID to use (URL param takes precedence)
  const currentProjectId = params.id || contextProjectId;

  // Fetch storylines when component mounts or when project ID changes
  useEffect(() => {
    if (currentProjectId) {
      fetchStorylines();
    } else {
      // If no project ID, clear state and stop loading
      setSelectedStoryline(null);
      setAlternativeStorylines([]);
      setIsLoading(false);
    }
  }, [currentProjectId]);

  // Realtime streaming for storyline updates
  useEffect(() => {
    if (!currentProjectId) return;
    
    // Subscribe to storyline INSERT (immediate skeleton) and UPDATE events
    const storylineChannel = supabase
      .channel(`storyline-changes-${currentProjectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'storylines',
          filter: `project_id=eq.${currentProjectId}`
        },
        (payload) => {
          console.log('Storyline INSERT received:', payload);
          const newStoryline = payload.new as Storyline;
          
          // Immediately show the skeleton storyline
          if (newStoryline.status === 'generating') {
            setStreamingStatus('generating');
            setStreamingStory('');
            setStreamingScenes([]);
            setStreamingCharacters([]);
            
            // If it's a main storyline, set as selected
            if (newStoryline.is_selected) {
              setSelectedStoryline(newStoryline);
            } else {
              // Add to alternatives
              setAlternativeStorylines(prev => [newStoryline, ...prev]);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'storylines',
          filter: `project_id=eq.${currentProjectId}`
        },
        (payload) => {
          console.log('Storyline UPDATE received:', payload);
          const newStoryline = payload.new as Storyline;
          
          setStreamingStory(newStoryline.full_story || '');
          
          // Map DB status to progress status
          if (newStoryline.status === 'generating' && newStoryline.full_story) {
            setStreamingStatus('generating');
          }
          
          // Update selected storyline if it's being updated
          if (selectedStoryline?.id === newStoryline.id || newStoryline.is_selected) {
            setSelectedStoryline(newStoryline);
          } else {
            // Update in alternatives list
            setAlternativeStorylines(prev => 
              prev.map(s => s.id === newStoryline.id ? newStoryline : s)
            );
          }
          
          if (newStoryline.status === 'complete') {
            setStreamingStatus('complete');
            setIsGenerating(false);
            toast.success('Storyline generation complete!');
            fetchStorylines();
          } else if (newStoryline.status === 'failed') {
            setStreamingStatus('failed');
            setIsGenerating(false);
            setGenerationError(newStoryline.failure_reason || 'Generation failed');
            toast.error('Storyline generation failed');
          }
        }
      )
      .subscribe();
    
    // Subscribe to scene insertions
    const scenesChannel = supabase
      .channel(`scenes-${currentProjectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'scenes',
          filter: `project_id=eq.${currentProjectId}`
        },
        (payload) => {
          console.log('New scene received:', payload);
          setStreamingScenes(prev => [...prev, payload.new]);
          setStreamingStatus('scenes');
        }
      )
      .subscribe();
    
    // Subscribe to character insertions
    const charactersChannel = supabase
      .channel(`characters-${currentProjectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'characters',
          filter: `project_id=eq.${currentProjectId}`
        },
        (payload) => {
          console.log('New character received:', payload);
          setStreamingCharacters(prev => [...prev, payload.new]);
          setStreamingStatus('characters');
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(storylineChannel);
      supabase.removeChannel(scenesChannel);
      supabase.removeChannel(charactersChannel);
    };
  }, [currentProjectId, selectedStoryline?.id]);

  const fetchStorylines = async () => {
    if (!currentProjectId) return;

    setIsLoading(true);
    try {
      // Fetch selected storyline
      const selectedData = await supabaseService.storylines.findSelected(currentProjectId);

      // Fetch alternative storylines
      const alternativesData = await supabaseService.storylines.listByProject(currentProjectId);

      // Update states based on fetched data
      if (selectedData) {
        setSelectedStoryline(selectedData);
        setCharacterCount(selectedData.full_story?.length || 0);
      } else {
        setSelectedStoryline(null);
        setCharacterCount(0);
      }

      setAlternativeStorylines(alternativesData || []);
      
    } catch (error: any) {
      console.error("Error fetching storylines:", error);
      toast.error(`Failed to load storylines: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStorylineChange = async (storylineToSelect: Storyline) => {
    if (!currentProjectId || !storylineToSelect || storylineToSelect.is_selected) return;

    const previousSelected = selectedStoryline; // Store previous for UI update

    try {
      // Optimistic UI update
      setSelectedStoryline(storylineToSelect);
      setCharacterCount(storylineToSelect.full_story?.length || 0);
      setAlternativeStorylines(prev => 
        prev.filter(s => s.id !== storylineToSelect.id)
          .concat(previousSelected ? [{ ...previousSelected, is_selected: false }] : [])
      );

      // Update the is_selected flag in the database
      await supabaseService.storylines.clearSelection(currentProjectId);
      await supabaseService.storylines.setSelected(storylineToSelect.id);

      // Update the project's selected_storyline_id
      await supabaseService.projects.update(currentProjectId, { selected_storyline_id: storylineToSelect.id });

      toast.success("Storyline selected");

    } catch (error: any) {
      console.error("Error changing selected storyline:", error);
      toast.error(`Failed to select storyline: ${error.message}`);
      
      // Revert UI changes on error
      setSelectedStoryline(previousSelected);
      setCharacterCount(previousSelected?.full_story?.length || 0);
      setAlternativeStorylines(prev => 
        prev.filter(s => s.id !== previousSelected?.id)
          .concat(storylineToSelect ? [storylineToSelect] : [])
      );
    }
  };

  const handleGenerateMore = async () => {
    // Ensure we have a project ID
    let effectiveProjectId = currentProjectId;
    
    // If no projectId, try to save the project first
    if (!effectiveProjectId) {
      toast.info("Saving project before generating...");
      try {
        const savedId = await saveProjectData();
        if (!savedId) {
          toast.error("Cannot generate storylines: Failed to save project");
          return;
        }
        effectiveProjectId = savedId;
      } catch (error: any) {
        console.error("Error saving project:", error);
        toast.error("Cannot generate storylines: Failed to save project");
        return;
      }
    }

    if (!effectiveProjectId) {
      toast.error("Cannot generate storylines: missing project ID");
      return;
    }

    try {
      setIsGenerating(true);
      setStreamingStatus('creating');
      setGenerationError(undefined);
      setStreamingStory('');
      setStreamingScenes([]);
      setStreamingCharacters([]);
      
      // Call our edge function with a flag to generate alternative storylines
      const { data, error } = await supabase.functions.invoke('generate-storylines', {
        body: { 
          project_id: effectiveProjectId,
          generate_alternative: true // Add flag to indicate this is for an alternative storyline
        }
      });
      
      if (error) {
        // Handle specific error codes
        const errorMessage = error.message || "Function invocation failed";
        if (errorMessage.includes('402') || errorMessage.includes('Payment')) {
          throw new Error('AI credits exhausted. Please add funds in Settings → Workspace → Usage to continue generating.');
        }
        if (errorMessage.includes('429') || errorMessage.includes('Rate')) {
          throw new Error('Rate limited. Please wait a moment and try again.');
        }
        throw new Error(errorMessage);
      }
      
      // Check the success flag from the response
      if (data && data.success) {
        // Don't show success toast here - realtime will handle it
        // Generation continues in background, UI updates via realtime
      } else {
        const errorMsg = data?.error || data?.message || 'Failed to generate storyline';
        // Check for AI-specific errors in response
        if (errorMsg.includes('402') || errorMsg.includes('credits')) {
          throw new Error('AI credits exhausted. Please add funds in Settings → Workspace → Usage to continue generating.');
        }
        if (errorMsg.includes('429') || errorMsg.includes('rate')) {
          throw new Error('Rate limited. Please wait a moment and try again.');
        }
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("Error generating storyline:", error);
      setStreamingStatus('failed');
      setGenerationError(error.message);
      toast.error(error.message);
      setIsGenerating(false);
    }
    // Note: isGenerating is set to false via realtime subscription when complete/failed
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Project title and tags */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{projectData.title || 'Untitled Project'}</h1>
          <div className="flex gap-2 flex-wrap">
            {projectData.format && (
              <Badge className="bg-black text-white hover:bg-zinc-800">
                {projectData.format === 'custom'
                  ? projectData.customFormat || 'Custom'
                  : projectData.format
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
              </Badge>
            )}
            {projectData.genre && (
              <Badge className="bg-black text-white hover:bg-zinc-800">{projectData.genre}</Badge>
            )}
            {projectData.tone && (
              <Badge className="bg-black text-white hover:bg-zinc-800">{projectData.tone}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Alternative Storylines - Now on the left */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold uppercase">Alternative Storylines</h2>
              
              <Button 
                variant="outline" 
                className="bg-blue-950 border-blue-900 text-blue-400 hover:bg-blue-900"
                onClick={handleGenerateMore}
                disabled={isGenerating || isLoading || !currentProjectId}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate alternative
                  </>
                )}
              </Button>
            </div>
            
            {isLoading && !selectedStoryline && alternativeStorylines.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : alternativeStorylines.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p>No alternative storylines yet.</p>
                <p className="mt-2 text-sm">Click "Generate alternative" to create different storyline options based on your concept.</p>
              </div>
            ) : (
              alternativeStorylines.map((storyline) => (
                <Card 
                  key={storyline.id}
                  className="bg-black border-zinc-800 p-4 cursor-pointer hover:border-zinc-700 transition-colors"
                  onClick={() => handleStorylineChange(storyline)}
                >
                  <h3 className="font-medium mb-2">{storyline.title}</h3>
                  <p className="text-sm text-zinc-400 mb-3 line-clamp-3">{storyline.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {storyline.tags && storyline.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        className="bg-zinc-900 text-xs text-zinc-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Main Storyline Editor - Now spans 2 columns */}
          <div className="md:col-span-2">
            <div className="bg-black rounded-lg border border-zinc-800 p-6 min-h-[400px]">
              {/* Show generation progress indicator */}
              <StorylineProgress 
                status={streamingStatus}
                scenesCount={streamingScenes.length}
                charactersCount={streamingCharacters.length}
                errorMessage={generationError}
              />
              
              {isLoading && !selectedStoryline ? (
                <div className="flex justify-center items-center h-full py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-zinc-400">Loading your storyline...</span>
                </div>
              ) : selectedStoryline || streamingStory ? (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-white">
                    {selectedStoryline?.title || <Skeleton className="h-8 w-64" />}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedStoryline?.tags && selectedStoryline.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        className="bg-zinc-900 text-zinc-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Display streaming or final story */}
                  <div className="prose prose-invert max-w-none">
                    {['creating', 'generating', 'scenes', 'characters'].includes(streamingStatus) && streamingStory ? (
                      <div className="relative">
                        <div className="text-zinc-300 whitespace-pre-line leading-relaxed">
                          <TextAnimate 
                            animation="blurIn" 
                            by="word"
                            duration={0.4}
                            className="inline"
                          >
                            {streamingStory}
                          </TextAnimate>
                          <motion.span 
                            className="inline-block w-0.5 h-5 bg-primary ml-1 align-middle"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                          />
                        </div>
                      </div>
                    ) : selectedStoryline?.full_story ? (
                      <TextAnimate 
                        animation="fadeIn" 
                        by="word"
                        className="text-zinc-300 whitespace-pre-line leading-relaxed"
                      >
                        {selectedStoryline.full_story}
                      </TextAnimate>
                    ) : streamingStatus === 'creating' ? (
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-full animate-shimmer" />
                        <Skeleton className="h-4 w-5/6 animate-shimmer" />
                        <Skeleton className="h-4 w-4/5 animate-shimmer" />
                        <Skeleton className="h-4 w-full animate-shimmer" />
                        <Skeleton className="h-4 w-3/4 animate-shimmer" />
                      </div>
                    ) : (
                      <Skeleton className="h-48 w-full" />
                    )}
                  </div>

                  {/* Show streaming scenes with staggered animation */}
                  <AnimatePresence>
                    {streamingScenes.length > 0 && (
                      <motion.div 
                        className="mt-6 space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TextAnimate animation="fadeIn" by="word" className="text-lg font-semibold text-zinc-300">
                          Scenes
                        </TextAnimate>
                        {streamingScenes.map((scene, idx) => (
                          <motion.div 
                            key={scene.id || idx} 
                            className="p-3 bg-zinc-900 rounded border border-zinc-800"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.3 }}
                          >
                            <span className="font-medium text-primary">Scene {scene.scene_number}:</span>{' '}
                            <span className="text-zinc-300">{scene.title}</span>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Show streaming characters with staggered animation */}
                  <AnimatePresence>
                    {streamingCharacters.length > 0 && (
                      <motion.div 
                        className="mt-6"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TextAnimate animation="fadeIn" by="word" className="text-lg font-semibold text-zinc-300 mb-2">
                          Characters
                        </TextAnimate>
                        <div className="flex flex-wrap gap-2">
                          {streamingCharacters.map((char, idx) => (
                            <motion.div
                              key={char.id || idx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.08, type: "spring", stiffness: 300 }}
                            >
                              <Badge className="bg-zinc-900 text-zinc-300 border border-zinc-700">
                                {char.name}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="mt-4 text-right text-sm text-zinc-500">
                    {(streamingStory || selectedStoryline?.full_story || '').length} characters
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-zinc-400 h-full flex flex-col justify-center items-center">
                  <p className="text-xl font-medium mb-2">No storyline available</p>
                  <p className="mb-8 text-sm">A storyline should have been generated during project setup.</p>
                  <Button 
                    variant="outline" 
                    className="bg-blue-950 border-blue-900 text-blue-400 hover:bg-blue-900"
                    onClick={handleGenerateMore}
                    disabled={isGenerating || !currentProjectId}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Generate a storyline now
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorylineTab;
