import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Trash2, Lock, Globe, Play, Edit3, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect, useRef } from 'react';
import { DeleteProjectDialog } from '../dialogs/DeleteProjectDialog';
import { useProjectActions } from '@/hooks/useProjectActions';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
  };

  return (
    <>
      <div
        className={cn(
          "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
          "bg-gradient-to-br from-card/80 to-card/40",
          "backdrop-blur-xl border border-border/30",
          "hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10",
          "hover:-translate-y-1"
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-muted/50 to-muted/30 overflow-hidden">
          {mediaUrl && mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={mediaUrl}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loop
              muted
              playsInline
            />
          ) : mediaUrl && mediaType === 'image' ? (
            <img
              src={mediaUrl}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

          {/* Play button overlay on hover */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Top Actions */}
          <div className={cn(
            "absolute top-3 right-3 flex gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}>
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-background transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-background transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-md border border-border/50 text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Badge */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md border transition-colors",
              project.is_private 
                ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
            )}>
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
        <div className="relative p-4">
          <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          
          <p className="text-sm text-muted-foreground">
            Updated {formattedDate}
          </p>

          {/* Description on hover */}
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isHovered && project.description ? "max-h-20 mt-3 opacity-100" : "max-h-0 opacity-0"
          )}>
            <p className="text-sm text-muted-foreground/80 line-clamp-2">
              {project.description}
            </p>
          </div>
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
