import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, Lock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { DeleteProjectDialog } from '../dialogs/DeleteProjectDialog';
import { useProjectActions } from '@/hooks/useProjectActions';
import { supabase } from '@/integrations/supabase/client';

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
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const { deleteProject, isDeleting } = useProjectActions();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const formattedDate = formatDistanceToNow(new Date(project.updated_at), { addSuffix: true });

  // Fetch first media item for this project
  useEffect(() => {
    const fetchProjectMedia = async () => {
      try {
        const { data, error } = await supabase
          .from('video_clips')
          .select('storage_bucket, storage_path, thumbnail_bucket, thumbnail_path, type')
          .eq('project_id', project.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load project media preview', error);
          return;
        }

        if (!data) return;

        const previewBucket = data.thumbnail_path ? data.thumbnail_bucket ?? 'thumbnails' : data.storage_bucket;
        const previewPath = data.thumbnail_path ?? data.storage_path;

        if (!previewBucket || !previewPath) return;

        const { data: publicData } = supabase
          .storage
          .from(previewBucket)
          .getPublicUrl(previewPath);

        setMediaUrl(publicData.publicUrl);
        setMediaType((data.type as 'video' | 'image') ?? 'image');
      } catch (err) {
        // No media items for this project - that's okay
        console.log('No media items found for project', project.id);
      }
    };

    fetchProjectMedia();
  }, [project.id]);

  // Handle video playback on hover
  useEffect(() => {
    if (videoRef.current && mediaType === 'video') {
      if (isHovered) {
        videoRef.current.play().catch(err => console.log('Video play error:', err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, mediaType]);

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
          {mediaUrl && mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            />
          ) : mediaUrl && mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cosmic-stellar/20 to-cosmic-plasma/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cosmic-stellar to-cosmic-plasma" />
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
