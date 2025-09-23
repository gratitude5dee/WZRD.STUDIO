import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Share, User, MoreVertical } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import CreditsDisplay from '@/components/CreditsDisplay';
import { supabaseService } from '@/services/supabaseService';

type ViewMode = 'studio' | 'timeline' | 'editor';

interface AppHeaderProps {
  // Optional customizations
  className?: string;
  showShareButton?: boolean;
}

export const AppHeader = ({ 
  className, 
  showShareButton = true 
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ projectId?: string }>();
  const projectIdFromURL = params.projectId;
  
  const { activeProjectId, activeProjectName, setActiveProject, fetchMostRecentProject } = useAppStore();

  // Determine current view from the URL path
  const getCurrentView = (): ViewMode => {
    const path = location.pathname;
    if (path.includes('/studio')) return 'studio';
    if (path.includes('/timeline')) return 'timeline';
    if (path.includes('/editor')) return 'editor';
    return 'studio'; // Default
  };

  const currentView = getCurrentView();

  // When URL projectId changes, update the store
  useEffect(() => {
    if (projectIdFromURL && projectIdFromURL !== activeProjectId) {
      const fetchProjectName = async () => {
        try {
          const project = await supabaseService.projects.find(projectIdFromURL);
          setActiveProject(projectIdFromURL, project?.title || 'Untitled');
        } catch (error) {
          console.error('Error fetching project name:', error);
        }
      };
      
      fetchProjectName();
    }
  }, [projectIdFromURL, activeProjectId, setActiveProject]);

  const handleNavigate = async (viewMode: ViewMode) => {
    // Case 1: User wants to go to studio
    if (viewMode === 'studio') {
      // From any view, always go to global studio view
      navigate('/studio');
      return;
    }
    
    // Case 2: User wants to go to timeline or editor
    // Both require a project ID
    if (!activeProjectId) {
      // If we don't have an active project, try to fetch the most recent one
      const recentProjectId = await fetchMostRecentProject();
      
      if (recentProjectId) {
        navigate(`/${viewMode}/${recentProjectId}`);
      } else {
        toast.warning('Please select or create a project first');
        navigate('/home');
      }
    } else {
      // We have an active project, navigate to the view with this project
      navigate(`/${viewMode}/${activeProjectId}`);
    }
  };

  // Helper for button styling based on active state
  const getButtonClass = (viewMode: ViewMode) => {
    const baseClass = "text-sm px-3 py-1.5 rounded-md transition-colors duration-200";
    return cn(
      baseClass,
      currentView === viewMode
        ? "bg-purple-600 text-white" 
        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
    );
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  return (
    <header className={cn(
      "w-full bg-black border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between",
      className
    )}>
      <div className="flex items-center gap-4">
        <div onClick={handleLogoClick} className="cursor-pointer">
          <Logo size="sm" showVersion={false} />
        </div>
        <h1 className="text-lg font-medium text-white">
          {activeProjectName || 'Untitled'}
        </h1>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center space-x-1 bg-zinc-900/80 rounded-lg p-1">
          <Button
            variant="ghost"
            className={getButtonClass('studio')}
            onClick={() => handleNavigate('studio')}
          >
            Studio
          </Button>
          
          <Button
            variant="ghost" 
            className={getButtonClass('timeline')}
            onClick={() => handleNavigate('timeline')}
          >
            Timeline
          </Button>
          
          <Button
            variant="ghost"
            className={getButtonClass('editor')}
            onClick={() => handleNavigate('editor')}
          >
            Editor
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <CreditsDisplay showTooltip={true} />
        <Button variant="ghost" className="text-white hover:bg-zinc-800">
          <User className="h-5 w-5" />
        </Button>
        {showShareButton && (
          <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
