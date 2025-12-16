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
          "bg-gradient-to-br from-[rgba(24,24,32,0.75)] to-[rgba(16,16,22,0.55)]",
          "backdrop-blur-xl border border-white/[0.08]",
          "hover:border-[rgba(139,92,246,0.4)] hover:shadow-[0_8px_45px_rgba(139,92,246,0.15),0_0_0_1px_rgba(139,92,246,0.12)]",
          "hover:-translate-y-1"
        )}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top shine line */}
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent z-10" />
        
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[rgba(139,92,246,0.06)] via-transparent to-[rgba(245,158,11,0.03)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-muted/30 to-muted/10 overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-accent/[0.05]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-white/[0.08]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/60 to-accent/60" />
              </div>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,8,12,0.95)] via-[rgba(8,8,12,0.3)] to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-300" />

          {/* Play button overlay on hover */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="w-14 h-14 rounded-full bg-[rgba(139,92,246,0.9)] backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(139,92,246,0.6)] hover:scale-110 transition-transform border border-[rgba(167,139,250,0.4)]">
              <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Top Actions */}
          <div className={cn(
            "absolute top-3 right-3 flex gap-2 transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}>
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-[rgba(0,0,0,0.5)] backdrop-blur-md border border-white/[0.1] text-foreground hover:bg-[rgba(0,0,0,0.7)] hover:border-white/[0.15] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleMoreClick}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-[rgba(0,0,0,0.5)] backdrop-blur-md border border-white/[0.1] text-foreground hover:bg-[rgba(0,0,0,0.7)] hover:border-white/[0.15] transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-[rgba(0,0,0,0.5)] backdrop-blur-md border border-white/[0.1] text-foreground hover:bg-destructive/80 hover:text-destructive-foreground hover:border-destructive/50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Privacy Badge */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-md border transition-colors",
              project.is_private 
                ? "bg-amber/15 border-amber/25 text-amber-200"
                : "bg-emerald-500/15 border-emerald-500/25 text-emerald-200"
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
          <h3 className="text-base font-semibold text-foreground mb-1 truncate group-hover:text-[#A78BFA] transition-colors">
            {project.title}
          </h3>
          
          <p className="text-xs text-muted-foreground/70">
            Updated {formattedDate}
          </p>

          {/* Description on hover */}
          <div className={cn(
            "overflow-hidden transition-all duration-300",
            isHovered && project.description ? "max-h-20 mt-3 opacity-100" : "max-h-0 opacity-0"
          )}>
            <p className="text-xs text-muted-foreground/60 line-clamp-2">
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
