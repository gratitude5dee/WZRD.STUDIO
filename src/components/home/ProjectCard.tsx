
import { MoreVertical, ImageIcon, Clock, Lock, Globe, Sparkles, Zap, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { GlassCard } from '@/components/ui/glass-card';
import { useState } from 'react';
import { DeleteProjectDialog } from '@/components/dialogs/DeleteProjectDialog';
import { useProjectActions } from '@/hooks/useProjectActions';

// Updated Project interface to match our database schema
export interface Project {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  updated_at: string;
  is_private: boolean;
  description?: string | null;
}

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard = ({ project, onOpen, onDelete }: ProjectCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteProject, isDeleting } = useProjectActions();

  // Format the date
  const lastEditedFormatted = project.updated_at
    ? `${formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}`
    : 'No edits';

  const handleDelete = async () => {
    const success = await deleteProject(project.id);
    if (success) {
      setShowDeleteDialog(false);
      onDelete?.(project.id);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpen(project.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  return (
    <>
      <GlassCard 
        variant="cosmic" 
        depth="medium" 
        glow="subtle" 
        interactive="none"
        particle
        shimmer
        className="overflow-hidden cursor-pointer group will-change-transform hover:scale-[1.02] hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_12px_40px_hsl(var(--cosmic-stellar)/0.3)] hover:z-10 isolate"
        onClick={handleCardClick}
      >
      {/* Thumbnail Area */}
      <div className="relative">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full aspect-video object-cover"
          />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-cosmic-void/40 to-cosmic-shadow/30 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-stellar-burst opacity-20" />
            <ImageIcon className="h-12 w-12 text-cosmic-stellar/60 relative z-10" />
            <div className="absolute bottom-2 right-2">
              <Sparkles className="h-4 w-4 text-cosmic-stellar animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs backdrop-blur-sm border",
            project.is_private 
              ? "bg-cosmic-plasma/20 border-cosmic-plasma/30 text-cosmic-plasma" 
              : "bg-cosmic-quantum/20 border-cosmic-quantum/30 text-cosmic-quantum"
          )}>
            {project.is_private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
            <span className="font-medium">{project.is_private ? 'Private' : 'Public'}</span>
          </div>
        </div>

        {/* Hover Options */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex space-x-2">
          <button 
            className="p-2 rounded-full bg-cosmic-void/60 backdrop-blur-sm border border-cosmic-stellar/30 hover:bg-cosmic-void/80 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4 text-cosmic-stellar" />
          </button>
          <button 
            onClick={handleDeleteClick}
            className="p-2 rounded-full bg-destructive/60 backdrop-blur-sm border border-destructive/50 hover:bg-destructive/80 transition-all duration-200 hover:scale-110"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-white group-hover:glow-text-primary transition-all duration-300 line-clamp-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-white mt-1 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-white">
            <Clock className="w-3 h-3" />
            <span>{lastEditedFormatted}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-cosmic-stellar animate-pulse" />
            <span className="text-xs text-white font-medium">Active</span>
          </div>
        </div>
      </div>
      </GlassCard>
      
      <DeleteProjectDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        projectTitle={project.title}
        isDeleting={isDeleting}
      />
    </>
  );
};
