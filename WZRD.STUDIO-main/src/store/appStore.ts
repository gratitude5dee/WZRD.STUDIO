
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppState {
  // Core project state
  activeProjectId: string | null;
  activeProjectName: string | null;
  
  // Actions
  setActiveProject: (id: string | null, name: string | null) => void;
  clearActiveProject: () => void;
  fetchMostRecentProject: () => Promise<string | null>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  activeProjectId: null,
  activeProjectName: null,
  
  // Actions
  setActiveProject: (id, name) => set({ 
    activeProjectId: id, 
    activeProjectName: name 
  }),
  
  clearActiveProject: () => set({ 
    activeProjectId: null, 
    activeProjectName: null 
  }),
  
  fetchMostRecentProject: async () => {
    try {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No authenticated user found');
        return null;
      }
      
      // Fetch the most recent project for this user
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, title')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Error fetching recent project:', error);
        return null;
      }
      
      if (projects && projects.length > 0) {
        const projectId = projects[0].id;
        const projectName = projects[0].title || 'Untitled';
        
        // Update the store with fetched project
        set({ 
          activeProjectId: projectId, 
          activeProjectName: projectName 
        });
        
        console.log(`Set active project: ${projectName} (${projectId})`);
        return projectId;
      }
      
      return null;
    } catch (error) {
      console.error('Error in fetchMostRecentProject:', error);
      toast.error('Failed to fetch your most recent project');
      return null;
    }
  }
}));
