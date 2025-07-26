import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectData, ProjectSetupTab, Character } from './types';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

interface ProjectContextProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
  activeTab: ProjectSetupTab;
  setActiveTab: (tab: ProjectSetupTab) => void;
  saveProjectData: () => Promise<string | null>;
  projectId: string | null;
  getVisibleTabs: () => ProjectSetupTab[];
  previousOption: 'ai' | 'manual';
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
  isGenerating: boolean; 
  setIsGenerating: (generating: boolean) => void;
  isFinalizing: boolean; // New state for finalization process
  generateStoryline: (projectId: string) => Promise<boolean>;
  handleCreateProject: () => Promise<void>;
  finalizeProjectSetup: () => Promise<boolean>; // New method to invoke the orchestrator
  generationCompletedSignal: number;
}

const defaultProjectData: ProjectData = {
  title: 'Untitled Project',
  concept: '',
  genre: '',
  tone: '',
  format: 'custom',
  customFormat: '',
  specialRequests: '',
  addVoiceover: false,
  product: '',
  targetAudience: '',
  mainMessage: '',
  callToAction: '',
  conceptOption: 'ai',
  aspectRatio: '16:9',
  videoStyle: 'cinematic'
};

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProjectSetupTab>('concept');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false); // New state
  const [previousOption, setPreviousOption] = useState<'ai' | 'manual'>('ai');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData);
  const [generationCompletedSignal, setGenerationCompletedSignal] = useState(0);
  
  // Track option changes for smooth transitions
  useEffect(() => {
    if (previousOption !== projectData.conceptOption) {
      setPreviousOption(projectData.conceptOption);
      
      // If switching from AI to manual and currently on storyline tab, move to settings
      if (previousOption === 'ai' && projectData.conceptOption === 'manual' && activeTab === 'storyline') {
        setActiveTab('settings');
      }
    }
  }, [projectData.conceptOption, activeTab, previousOption]);
  
  const updateProjectData = (data: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  // Save project data to Supabase
  const saveProjectData = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please log in to create a project");
      return null;
    }

    let currentProjectId = projectId;
    try {
      console.log('Saving project data:', projectData);
      
      const projectPayload = {
        user_id: user.id,
        title: projectData.title || 'Untitled Project',
        concept_text: projectData.concept,
        concept_option: projectData.conceptOption,
        format: projectData.format,
        custom_format_description: projectData.customFormat,
        genre: projectData.genre,
        tone: projectData.tone,
        add_voiceover: projectData.addVoiceover,
        special_requests: projectData.specialRequests,
        product_name: projectData.product,
        target_audience: projectData.targetAudience,
        main_message: projectData.mainMessage,
        call_to_action: projectData.callToAction,
        // Add settings fields
        aspect_ratio: projectData.aspectRatio,
        video_style: projectData.videoStyle,
        cinematic_inspiration: projectData.cinematicInspiration
      };
      
      console.log('Project payload:', projectPayload);

      // If project already exists, update it
      if (currentProjectId) {
        console.log(`Updating existing project ID: ${currentProjectId}`);
        await supabaseService.projects.update(currentProjectId, projectPayload);
        
        toast.info("Project data saved");
        return currentProjectId;
      } else {
        // Create new project
        console.log('Creating new project...');
        const newProjectId = await supabaseService.projects.create(projectPayload);
        
        console.log(`New project created with ID: ${newProjectId}`);
        setProjectId(newProjectId);
        currentProjectId = newProjectId;
        toast.success("Project created successfully");
        return newProjectId;
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(`Failed to save project: ${error.message}`);
      return null;
    }
  };

  // Function to generate storyline using the generate-storylines Edge Function
  const generateStoryline = async (currentProjectId: string): Promise<boolean> => {
    if (!user) {
      toast.error("Please log in to generate storylines");
      return false;
    }
    
    if (!currentProjectId) {
      toast.error("Cannot generate storyline without a project ID");
      return false;
    }

    try {
      setIsGenerating(true);
      console.log(`Invoking generate-storylines for project: ${currentProjectId}`);
      
      const { data, error } = await supabase.functions.invoke('generate-storylines', {
        body: { project_id: currentProjectId }
      });
      
      if (error) {
        console.error('Error invoking generate-storylines function:', error);
        toast.error(`Storyline generation failed: ${error.message}`);
        return false;
      }
      
      console.log('Storyline generation function response:', data);
      if (data.success === false) {
        toast.error(`Storyline generation failed: ${data.error || 'Unknown error'}`);
        return false;
      }
      
      // Add character count to toast message if available
      toast.success(`Storyline generated with ${data.scene_count ?? 0} scenes${data.character_count ? ` and ${data.character_count} characters` : ''}`);
      
      // If AI inferred settings that didn't exist, update them in context
      if (data.updated_settings?.length > 0) {
        const updates: Partial<ProjectData> = {};
        // Check for updated settings from the response
        if (data.updated_settings.includes('genre') && !projectData.genre) {
          updates.genre = data.potential_genre || '';
        }
        if (data.updated_settings.includes('tone') && !projectData.tone) {
          updates.tone = data.potential_tone || '';
        }
        
        if (Object.keys(updates).length > 0) {
          console.log('Applying inferred settings to context:', updates);
          updateProjectData(updates);
        }
      }
      
      // Signal generation completion - AFTER all DB operations
      setGenerationCompletedSignal(prev => prev + 1);
      console.log('Generation completed signal incremented:', generationCompletedSignal + 1);
      
      return true;
    } catch (error: any) {
      console.error('Error in generateStoryline:', error);
      toast.error(`Storyline generation failed: ${error.message}`);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to get visible tabs based on the conceptOption
  const getVisibleTabs = (): ProjectSetupTab[] => {
    if (projectData.conceptOption === 'manual') {
      // Skip storyline tab for manual mode
      return ['concept', 'settings', 'breakdown'];
    } else {
      // Show all tabs for AI mode
      return ['concept', 'storyline', 'settings', 'breakdown'];
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      toast.error("Please log in to create a project");
      return;
    }

    try {
      setIsCreating(true);
      
      // Save final project data if needed
      const savedProjectId = await saveProjectData();
      if (!savedProjectId) {
        throw new Error("Failed to save project data before completing setup");
      }
      
      toast.success("Project setup complete!");
      
      // Navigation happens in the NavigationFooter component
    } catch (error: any) {
      console.error('Error completing project setup:', error);
      toast.error(`Failed to complete project setup: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // New function to finalize project setup
  const finalizeProjectSetup = async (): Promise<boolean> => {
    if (!user) {
      toast.error("Please log in to create a project");
      return false;
    }

    if (!projectId) {
      toast.error("Project ID not found. Please save the project first.");
      return false;
    }

    setIsFinalizing(true);
    toast.info("Preparing your storyboard, please wait...", { duration: 10000 }); // Longer duration

    try {
      // Ensure latest data is saved before finalizing
      const finalSaveId = await saveProjectData();
      
      if (!finalSaveId) {
        throw new Error("Failed to save final project settings.");
      }

      console.log(`Invoking finalize-project-setup for project: ${projectId}`);
      
      const { data, error } = await supabase.functions.invoke('finalize-project-setup', {
        body: { project_id: projectId }
      });

      if (error) {
        console.error('Error invoking finalize-project-setup:', error);
        throw new Error(error.message || "Failed to start storyboard preparation.");
      }

      console.log('Finalize project setup response:', data);
      toast.success(data.message || "Storyboard preparation started!");
      return true; // Indicate invocation success
    } catch (error: any) {
      console.error('Error finalizing project setup:', error);
      toast.error(`Storyboard preparation failed: ${error.message}`);
      return false;
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projectData,
      updateProjectData,
      activeTab,
      setActiveTab,
      saveProjectData,
      projectId,
      getVisibleTabs,
      previousOption,
      isCreating,
      setIsCreating,
      isGenerating,
      setIsGenerating,
      isFinalizing,
      generateStoryline,
      handleCreateProject,
      finalizeProjectSetup,
      generationCompletedSignal
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectProvider;
