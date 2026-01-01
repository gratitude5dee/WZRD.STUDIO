import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  ExternalLink,
  Globe,
  Lock,
  MoreHorizontal,
  Play,
  Share2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { InlineEditableTitle } from './InlineEditableTitle';
import { ShareProjectDialog } from './ShareProjectDialog';
import { DeleteProjectSheet } from './DeleteProjectSheet';
import { ShineBorder } from '@/components/ui/shine-border';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface Project {
  id: string;
  title: string;
  thumbnail_url?: string | null;
  updated_at: string;
  is_private?: boolean;
  description?: string | null;
  status?: string | null;
}

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
  onRename?: (projectId: string, newTitle: string) => void;
}

export const ProjectCard = ({ project, onOpen, onDelete, onRename }: ProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formattedDate = formatDistanceToNow(new Date(project.updated_at), { addSuffix: true });

  useEffect(() => {
    const fetchProjectMedia = async () => {
      try {
        const { data } = await supabase
          .from('video_clips')
          .select('storage_bucket, storage_path, thumbnail_bucket, thumbnail_path, type')
          .eq('project_id', project.id)
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!data) return;

        const previewBucket = data.thumbnail_path
          ? data.thumbnail_bucket ?? 'thumbnails'
          : data.storage_bucket;
        const previewPath = data.thumbnail_path ?? data.storage_path;

        if (!previewBucket || !previewPath) return;

        const { data: publicData } = supabase.storage.from(previewBucket).getPublicUrl(previewPath);

        setMediaUrl(publicData.publicUrl);
        setMediaType((data.type as 'video' | 'image') ?? 'image');
      } catch (error) {
        console.error('Failed to load project media preview', error);
      }
    };

    fetchProjectMedia();
  }, [project.id]);

  useEffect(() => {
    if (videoRef.current && mediaType === 'video') {
      if (isHovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered, mediaType]);

  const handleTitleSave = (newTitle: string) => {
    onRename?.(project.id, newTitle);
    setIsEditing(false);
  };

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -6, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'group relative rounded-2xl overflow-hidden cursor-pointer',
          'bg-surface-1 border border-border-default',
          'shadow-sm hover:shadow-xl',
          'transition-all duration-300 ease-out',
          'dark:bg-zinc-900 dark:border-zinc-800'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => !isEditing && onOpen(project.id)}
      >
        {/* Shine Border on hover */}
        <ShineBorder
          shineColor={["#8B5CF6", "#EC4899"]}
          borderWidth={1}
          duration={14}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <div className="relative aspect-[4/3] bg-surface-2 dark:bg-zinc-800 overflow-hidden">
          {/* Parallax effect on thumbnail */}
          <motion.div
            className="w-full h-full"
            animate={isHovered ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {mediaUrl ? (
              mediaType === 'video' ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center',
                    'bg-gradient-to-br from-accent-purple/20 to-accent-purple/5',
                    'dark:from-purple-500/20 dark:to-purple-500/5'
                  )}
                >
                  <Play className="w-8 h-8 text-accent-purple dark:text-purple-400" />
                </div>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
              >
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.05 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            onOpen(project.id);
                          }}
                          className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Open Project</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          onClick={(event) => {
                            event.stopPropagation();
                            setShowShareDialog(true);
                          }}
                          className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>Share Project</TooltipContent>
                    </Tooltip>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.15 }}
                        onClick={(event) => event.stopPropagation()}
                        className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Title
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowShareDialog(true)}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteSheet(true)}
                        className="text-accent-rose focus:text-accent-rose dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute top-3 right-3">
            <div
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                'backdrop-blur-md',
                project.is_private
                  ? 'bg-zinc-900/70 text-zinc-300'
                  : 'bg-emerald-500/90 text-white'
              )}
            >
              {project.is_private ? (
                <>
                  <Lock className="w-3 h-3" />
                  Private
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3" />
                  Public
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {isEditing ? (
            <InlineEditableTitle
              initialValue={project.title}
              onSave={handleTitleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <h3
              className={cn(
                'text-base font-semibold truncate relative inline-block',
                'text-text-primary dark:text-white',
                'transition-colors cursor-text'
              )}
              onClick={(event) => {
                event.stopPropagation();
                setIsEditing(true);
              }}
            >
              <span className="group-hover:text-accent-purple dark:group-hover:text-purple-400 transition-colors">
                {project.title}
              </span>
              <motion.span
                className="absolute bottom-0 left-0 h-0.5 bg-accent-purple"
                initial={{ width: 0 }}
                animate={isHovered ? { width: "100%" } : { width: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </h3>
          )}

          <p className="text-sm text-text-tertiary dark:text-zinc-500 mt-1">
            Updated {formattedDate}
          </p>
        </div>
      </motion.div>

      <ShareProjectDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        project={project}
      />

      <DeleteProjectSheet
        open={showDeleteSheet}
        onOpenChange={setShowDeleteSheet}
        project={project}
        onDelete={onDelete}
      />
    </TooltipProvider>
  );
};
