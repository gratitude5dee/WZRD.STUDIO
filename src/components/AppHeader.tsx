import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { Share, Settings, Coins } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabaseService } from '@/services/supabaseService';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { ShareModal } from '@/components/share/ShareModal';
import CreditsDisplay from '@/components/CreditsDisplay';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ViewMode = 'studio' | 'timeline' | 'editor';

interface AppHeaderProps {
  className?: string;
  showShareButton?: boolean;
  onOpenSettings?: () => void;
}

export const AppHeader = ({ 
  className, 
  showShareButton = true,
  onOpenSettings 
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ projectId?: string }>();
  const projectIdFromURL = params.projectId;
  
  const { activeProjectId, activeProjectName, setActiveProject, fetchMostRecentProject } = useAppStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const titleSchema = z.string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be less than 100 characters');

  const getCurrentView = (): ViewMode => {
    const path = location.pathname;
    if (path.includes('/studio')) return 'studio';
    if (path.includes('/timeline')) return 'timeline';
    if (path.includes('/editor')) return 'editor';
    return 'studio';
  };

  const currentView = getCurrentView();

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
    const projectId = projectIdFromURL || activeProjectId;
    
    if (viewMode === 'studio') {
      if (projectId) {
        navigate(`/studio/${projectId}`);
      } else {
        navigate('/studio');
      }
      return;
    }
    
    if (!projectId) {
      const recentProjectId = await fetchMostRecentProject();
      
      if (recentProjectId) {
        navigate(`/${viewMode}/${recentProjectId}`);
      } else {
        toast.warning('Please select or create a project first');
        navigate('/home');
      }
    } else {
      navigate(`/${viewMode}/${projectId}`);
    }
  };

  const getButtonClass = (viewMode: ViewMode) => {
    return cn(
      'text-xs px-2.5 py-1 rounded-md transition-colors duration-200',
      currentView === viewMode
        ? 'bg-white/10 text-white' 
        : 'text-zinc-500 hover:text-white hover:bg-white/5'
    );
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const resolvedProjectId = projectIdFromURL || activeProjectId;

  const startEditing = () => {
    setEditValue(activeProjectName || 'Untitled');
    setIsEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const saveTitle = async () => {
    const projectId = projectIdFromURL || activeProjectId;
    if (!projectId) {
      toast.error('No project selected');
      cancelEditing();
      return;
    }

    try {
      const validatedTitle = titleSchema.parse(editValue);
      
      await supabaseService.projects.update(projectId, {
        title: validatedTitle,
      });

      setActiveProject(projectId, validatedTitle);
      toast.success('Project title updated');
      setIsEditing(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error('Error updating project title:', error);
        toast.error('Failed to update project title');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className={cn(
        'w-full h-14 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 px-4 flex items-center justify-between relative z-20',
        className
      )}>
        {/* Left: Logo + Project Name */}
        <div className="flex items-center gap-3">
          <div onClick={handleLogoClick} className="cursor-pointer">
            <Logo size="sm" showVersion={false} />
          </div>
          
          <div className="h-4 w-px bg-zinc-800" />
          
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleKeyDown}
              className="h-7 text-sm font-medium bg-zinc-900 border-zinc-700 text-white max-w-[200px]"
            />
          ) : (
            <span 
              className="text-sm font-medium text-zinc-300 cursor-text hover:text-white transition-colors"
              onClick={startEditing}
              title="Click to edit project name"
            >
              {activeProjectName || 'Untitled'}
            </span>
          )}
        </div>

        {/* Center: View Mode Tabs (minimal) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-zinc-900/50 rounded-lg p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={getButtonClass('studio')}
            onClick={() => handleNavigate('studio')}
          >
            Studio
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={getButtonClass('timeline')}
            onClick={() => handleNavigate('timeline')}
          >
            Timeline
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className={getButtonClass('editor')}
            onClick={() => handleNavigate('editor')}
          >
            Editor
          </Button>
        </div>

        {/* Right: Credits + Settings + Share */}
        <div className="flex items-center gap-2">
          {/* Credits Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/50 rounded-lg">
            <Coins className="w-3.5 h-3.5 text-accent-teal" />
            <CreditsDisplay showTooltip={false} />
          </div>

          {/* Settings Button */}
          {onOpenSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  onClick={onOpenSettings}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Settings</TooltipContent>
            </Tooltip>
          )}

          {/* Share Button */}
          {showShareButton && (
            <>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-0 text-xs px-3 h-9"
                onClick={() => {
                  if (!resolvedProjectId) {
                    toast.warning('Please select a project to share');
                    return;
                  }
                  setShowShareModal(true);
                }}
              >
                <Share className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>

              {resolvedProjectId && (
                <ShareModal
                  isOpen={showShareModal}
                  onClose={() => setShowShareModal(false)}
                  projectId={resolvedProjectId}
                  projectName={activeProjectName || 'Untitled'}
                />
              )}
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
};

export default AppHeader;