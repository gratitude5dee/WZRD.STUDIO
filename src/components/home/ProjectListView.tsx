import { useState } from 'react';
import { MoreVertical, Trash2, Edit2, Check, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useProjectActions } from '@/hooks/useProjectActions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Project } from './ProjectCard';

const titleSchema = z.string().trim().min(1, 'Title cannot be empty').max(100, 'Title must be less than 100 characters');

interface ProjectListViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onRefresh?: () => void;
}

export const ProjectListView = ({ projects, onOpenProject, onRefresh }: ProjectListViewProps) => {
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editError, setEditError] = useState('');
  const { deleteProject } = useProjectActions();
  const { toast } = useToast();

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedProjects(new Set());
  };

  const toggleProject = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const selectAll = () => {
    setSelectedProjects(new Set(projects.map(p => p.id)));
  };

  const deselectAll = () => {
    setSelectedProjects(new Set());
  };

  const handleBulkDelete = async () => {
    const projectsToDelete = Array.from(selectedProjects);
    let successCount = 0;
    
    for (const projectId of projectsToDelete) {
      const success = await deleteProject(projectId);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toast({
        title: 'Success',
        description: `${successCount} project${successCount > 1 ? 's' : ''} deleted successfully.`,
      });
      onRefresh?.();
    }

    setSelectedProjects(new Set());
    setDeleteDialogOpen(false);
    setIsSelectMode(false);
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditValue(project.title);
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
    setEditError('');
  };

  const saveTitle = async (projectId: string) => {
    try {
      const validated = titleSchema.parse(editValue);
      
      const { error } = await supabase
        .from('projects')
        .update({ title: validated, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Project title updated.',
      });
      
      onRefresh?.();
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        setEditError(error.errors[0].message);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update project title.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDeleteSingle = async (projectId: string) => {
    const success = await deleteProject(projectId);
    if (success) {
      onRefresh?.();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleSelectMode}
            variant={isSelectMode ? 'default' : 'outline'}
            size="sm"
            className={isSelectMode ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            {isSelectMode ? 'Cancel Select' : 'Select'}
          </Button>
          
          {isSelectMode && (
            <>
              <Button onClick={selectAll} variant="ghost" size="sm">
                Select All
              </Button>
              <Button onClick={deselectAll} variant="ghost" size="sm">
                Deselect All
              </Button>
              {selectedProjects.size > 0 && (
                <Button
                  onClick={() => setDeleteDialogOpen(true)}
                  variant="destructive"
                  size="sm"
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedProjects.size})
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/[0.08] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                  Actions
                </th>
                {isSelectMode && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-white/60 uppercase tracking-wider w-20">
                    Select
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  {/* Title */}
                  <td className="px-6 py-4">
                    {editingId === project.id ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 max-w-md"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveTitle(project.id);
                              if (e.key === 'Escape') cancelEditing();
                            }}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => saveTitle(project.id)}
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={cancelEditing}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        {editError && (
                          <p className="text-xs text-red-500">{editError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenProject(project.id)}
                          className="text-sm font-medium text-white hover:text-purple-400 transition-colors text-left"
                        >
                          {project.title}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="bg-green-500/10 text-green-400 border-green-500/30"
                    >
                      Active
                    </Badge>
                  </td>

                  {/* Updated */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/60">
                      {format(new Date(project.updated_at), 'MMM d, yyyy')}
                    </span>
                  </td>

                  {/* Visibility */}
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={
                        project.is_private
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }
                    >
                      {project.is_private ? 'Private' : 'Public'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEditing(project)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => onOpenProject(project.id)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEditing(project)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Title
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteSingle(project.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>

                  {/* Checkbox */}
                  {isSelectMode && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={selectedProjects.has(project.id)}
                          onCheckedChange={() => toggleProject(project.id)}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Projects</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
