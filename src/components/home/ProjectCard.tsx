import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, Lock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { DeleteProjectDialog } from '../dialogs/DeleteProjectDialog';
import { useProjectActions } from '@/hooks/useProjectActions';

export interface Project {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  updated_at: string;
  is_private?: boolean;
  description?: string | null;
}

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
}

export const ProjectCard = ({ project, onOpen, onDelete }: ProjectCardProps) => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { deleteProject, isDeleting } = useProjectActions();
  
  const formattedDate = formatDistanceToNow(new Date(project.updated_at), { addSuffix: true });

  const handleDelete = async () => {
    const success = await deleteProject(project.id);
    if (success && onDelete) {
      onDelete(project.id);
    }
    setShowDeleteDialog(false);
  };

  const handleCardClick = () => {
    navigate(`/timeline/${project.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Future: Open context menu with more options
  };

  return (
    <>
      <div
        className="group relative bg-[#1A1A1A] border border-white/[0.08] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.16] hover:shadow-lg hover:shadow-black/20"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video bg-[#0A0A0A] overflow-hidden">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700" />
              </div>
            </div>
          )}

          {/* Hover Actions */}
          {isHovered && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={handleMoreClick}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-black/80 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:bg-red-500 hover:border-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Privacy Badge */}
          <div className="absolute top-2 left-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-white/80">
              {project.is_private ? (
                <>
                  <Lock className="w-3 h-3" />
                  <span>Private</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  <span>Public</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">
            {project.title}
          </h3>
          
          <p className="text-sm text-white/40">
            {formattedDate}
          </p>

          {/* Description on hover */}
          {isHovered && project.description && (
            <p className="mt-2 text-sm text-white/60 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
      </div>

      <DeleteProjectDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        projectTitle={project.title}
      />
    </>
  );
};
