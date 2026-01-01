import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { 
  Share, 
  Settings, 
  Coins, 
  Home, 
  User, 
  FilePlus, 
  Copy, 
  Pencil, 
  Undo, 
  Redo, 
  Maximize,
  ZoomIn,
  ZoomOut,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabaseService } from '@/services/supabaseService';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { ShareModal } from '@/components/share/ShareModal';
import CreditsDisplay from '@/components/CreditsDisplay';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'studio' | 'timeline' | 'editor';

interface AppHeaderProps {
  className?: string;
  showShareButton?: boolean;
  onOpenSettings?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomToFit?: () => void;
}

export const AppHeader = ({ 
  className, 
  showShareButton = true,
  onOpenSettings,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
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

  // Dropdown menu handlers
  const handleBackToHome = () => navigate('/home');
  const handleMyProfile = () => navigate('/profile');
  const handleNewProject = async () => {
    try {
      const newProjectId = await supabaseService.projects.create({
        title: 'Untitled Project',
      });
      if (newProjectId) {
        navigate(`/studio/${newProjectId}`);
        toast.success('New project created');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    }
  };
  const handleDuplicateProject = async () => {
    if (!resolvedProjectId) {
      toast.error('No project to duplicate');
      return;
    }
    toast.info('Duplicating project...');
    // Note: duplicate functionality would need to be implemented in supabaseService
  };

  return (
    <TooltipProvider delayDuration={300}>
      <header className={cn(
        'w-full h-14 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/50 px-4 flex items-center justify-between relative z-50',
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

        {/* Right: Credits + Settings Dropdown + Share */}
        <div className="flex items-center gap-2">
          {/* Credits Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800/50 rounded-lg">
            <Coins className="w-3.5 h-3.5 text-accent-teal" />
            <CreditsDisplay showTooltip={false} />
          </div>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 gap-1"
              >
                <Settings className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-56 bg-zinc-900 border-zinc-800 text-white"
              sideOffset={8}
            >
              <DropdownMenuItem onClick={handleBackToHome} className="hover:bg-zinc-800 cursor-pointer">
                <Home className="mr-2 h-4 w-4" />
                Back to home
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleMyProfile} className="hover:bg-zinc-800 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                My profile
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-zinc-800" />
              
              <DropdownMenuItem onClick={handleNewProject} className="hover:bg-zinc-800 cursor-pointer">
                <FilePlus className="mr-2 h-4 w-4" />
                New project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateProject} className="hover:bg-zinc-800 cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={startEditing} className="hover:bg-zinc-800 cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                Rename project
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-zinc-800" />
              
              <DropdownMenuItem 
                onClick={onUndo} 
                disabled={!onUndo}
                className="hover:bg-zinc-800 cursor-pointer"
              >
                <Undo className="mr-2 h-4 w-4" />
                Undo
                <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onRedo}
                disabled={!onRedo}
                className="hover:bg-zinc-800 cursor-pointer"
              >
                <Redo className="mr-2 h-4 w-4" />
                Redo
                <DropdownMenuShortcut>⌘⇧Z</DropdownMenuShortcut>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-zinc-800" />
              
              <DropdownMenuItem onClick={onOpenSettings} className="hover:bg-zinc-800 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Project settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-zinc-800" />
              
              <DropdownMenuItem 
                onClick={onZoomToFit}
                disabled={!onZoomToFit}
                className="hover:bg-zinc-800 cursor-pointer"
              >
                <Maximize className="mr-2 h-4 w-4" />
                Zoom to fit
                <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onZoomIn}
                disabled={!onZoomIn}
                className="hover:bg-zinc-800 cursor-pointer"
              >
                <ZoomIn className="mr-2 h-4 w-4" />
                Zoom in
                <DropdownMenuShortcut>⌘+</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onZoomOut}
                disabled={!onZoomOut}
                className="hover:bg-zinc-800 cursor-pointer"
              >
                <ZoomOut className="mr-2 h-4 w-4" />
                Zoom out
                <DropdownMenuShortcut>⌘-</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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