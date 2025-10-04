
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
        depth="deep" 
        glow="medium" 
        interactive="none"
        particle
        shimmer
        className="overflow-hidden cursor-pointer group will-change-transform hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_60px_hsl(var(--glow-primary)/0.4)] hover:z-10 isolate border border-white/5 hover:border-[hsl(var(--glow-primary))/0.3]"
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
          <div className="w-full aspect-video bg-gradient-to-br from-[hsl(220_30%_8%)] to-[hsl(220_25%_6%)] flex items-center justify-center relative overflow-hidden border-b border-white/5">
            {/* Mesh pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />
            
            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[hsl(var(--stellar-gold))] to-[hsl(var(--temporal-orange))] flex items-center justify-center opacity-80">
                <ImageIcon className="h-8 w-8 text-[hsl(220_25%_8%)]" />
              </div>
            </div>
            
            {/* Decorative sparkles */}
            <div className="absolute bottom-3 right-3">
              <Sparkles className="h-4 w-4 text-[hsl(var(--stellar-gold))] opacity-60 animate-pulse" />
            </div>
            <div className="absolute top-3 left-3">
              <Sparkles className="h-3 h-3 text-[hsl(var(--stellar-gold))] opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        )}
        
        {/* Privacy Badge */}
        <div className="absolute top-3 right-3 z-20">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border shadow-lg",
            project.is_private 
              ? "bg-[hsl(200_85%_55%)]/20 border-[hsl(200_85%_55%)]/40 text-[hsl(200_85%_65%)]" 
              : "bg-[hsl(160_70%_45%)]/20 border-[hsl(160_70%_45%)]/40 text-[hsl(160_70_55%)]"
          )}>
            {project.is_private ? <Lock className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            <span>{project.is_private ? 'Private' : 'Public'}</span>
          </div>
        </div>

        {/* Hover Action Buttons */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-20">
          <button 
            className="p-2 rounded-full bg-[hsl(220_30%_10%)]/90 backdrop-blur-md border border-[hsl(var(--stellar-gold))]/30 hover:bg-[hsl(220_30%_12%)]/90 hover:border-[hsl(var(--stellar-gold))]/50 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
            title="More options"
          >
            <MoreVertical className="h-4 w-4 text-[hsl(var(--stellar-gold))]" />
          </button>
          <button 
            onClick={handleDeleteClick}
            className="p-2 rounded-full bg-red-500/80 backdrop-blur-md border border-red-400/50 hover:bg-red-500/90 hover:scale-110 transition-all duration-200 shadow-lg shadow-red-500/20"
            title="Delete project"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-xl text-white group-hover:text-[hsl(var(--glow-primary))] transition-all duration-300 line-clamp-1 mb-1">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-white/60 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <Clock className="w-3.5 h-3.5 text-white/50" />
            <span>{lastEditedFormatted}</span>
          </div>
          
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--stellar-gold))]/10 border border-[hsl(var(--stellar-gold))]/20">
            <Zap className="w-3.5 h-3.5 text-[hsl(var(--stellar-gold))] animate-pulse" />
            <span className="text-xs text-[hsl(var(--stellar-gold))] font-medium">Active</span>
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
