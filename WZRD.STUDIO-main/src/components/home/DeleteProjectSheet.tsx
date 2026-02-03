import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  FileText,
  FolderX,
  Image,
  Loader2,
  Trash2,
  Undo2,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUndoDelete } from '@/hooks/useUndoDelete';
import type { Project } from './ProjectCard';

interface DeleteProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onDelete?: (projectId: string) => void;
}

interface ProjectStats {
  imageCount: number;
  videoCount: number;
  textCount: number;
}

export const DeleteProjectSheet = ({
  open,
  onOpenChange,
  project,
  onDelete,
}: DeleteProjectSheetProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [permanentDelete, setPermanentDelete] = useState(false);
  const { undoDelete } = useUndoDelete();

  useEffect(() => {
    if (open) {
      fetchProjectStats();
    }
  }, [open]);

  const fetchProjectStats = async () => {
    try {
      const { data, error } = await supabase
        .from('video_clips')
        .select('type')
        .eq('project_id', project.id);

      if (error) throw error;

      const counts = {
        imageCount: data?.filter((item) => item.type === 'image').length || 0,
        videoCount: data?.filter((item) => item.type === 'video').length || 0,
        textCount: data?.filter((item) => item.type === 'text').length || 0,
      };

      setStats(counts);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== project.title) {
      toast.error('Please type the project name correctly');
      return;
    }

    setIsDeleting(true);

    try {
      if (permanentDelete) {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', project.id);

        if (error) throw error;

        onDelete?.(project.id);
        onOpenChange(false);

        toast.success('Project permanently deleted');
      } else {
        const { error } = await supabase
          .from('projects')
          .update({
            deleted_at: new Date().toISOString(),
            status: 'deleted',
          } as any)
          .eq('id', project.id);

        if (error) throw error;

        onDelete?.(project.id);
        onOpenChange(false);

        toast.success(
          <div className="flex items-center justify-between gap-4">
            <span>Project moved to trash</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => undoDelete(project.id)}
              className="h-7 px-2 text-accent-purple hover:text-accent-purple"
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Undo
            </Button>
          </div>,
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
      setConfirmText('');
    }
  };

  const isConfirmValid = confirmText === project.title;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px]">
        <SheetHeader className="space-y-4">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto',
              'bg-rose-500/10 dark:bg-red-500/10'
            )}
          >
            <FolderX className="w-7 h-7 text-accent-rose dark:text-red-400" />
          </div>
          <SheetTitle className="text-center text-xl">Delete Project</SheetTitle>
          <SheetDescription className="text-center">
            You're about to delete{' '}
            <strong className="text-text-primary dark:text-white">"{project.title}"</strong>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          {stats && (stats.imageCount > 0 || stats.videoCount > 0 || stats.textCount > 0) && (
            <div className="p-4 rounded-xl bg-amber-100/60 dark:bg-amber-500/10 border border-amber-200/60">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-primary dark:text-white">
                    This will also delete:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {stats.imageCount > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/80 dark:bg-zinc-800 text-xs">
                        <Image className="w-3.5 h-3.5 text-text-secondary" />
                        <span>
                          {stats.imageCount} image{stats.imageCount !== 1 && 's'}
                        </span>
                      </div>
                    )}
                    {stats.videoCount > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/80 dark:bg-zinc-800 text-xs">
                        <Video className="w-3.5 h-3.5 text-text-secondary" />
                        <span>
                          {stats.videoCount} video{stats.videoCount !== 1 && 's'}
                        </span>
                      </div>
                    )}
                    {stats.textCount > 0 && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/80 dark:bg-zinc-800 text-xs">
                        <FileText className="w-3.5 h-3.5 text-text-secondary" />
                        <span>
                          {stats.textCount} text block{stats.textCount !== 1 && 's'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-text-primary dark:text-white">
              Type <span className="font-mono text-accent-rose">{project.title}</span> to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              placeholder="Enter project name"
              className={cn(
                'transition-colors',
                isConfirmValid && 'border-emerald-500 focus-visible:ring-emerald-400'
              )}
            />
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-xl border border-border-default bg-surface-2 dark:bg-zinc-900">
            <Checkbox
              id="permanent"
              checked={permanentDelete}
              onCheckedChange={(checked) => setPermanentDelete(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="permanent"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Delete permanently
              </label>
              <p className="text-xs text-text-tertiary">
                Skip trash and delete forever. This cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {permanentDelete ? 'Delete Forever' : 'Move to Trash'}
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
