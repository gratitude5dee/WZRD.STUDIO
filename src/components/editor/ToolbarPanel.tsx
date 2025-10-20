
import React, { useState } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Button } from '@/components/ui/button';
import { Settings, Save, FileText, Scissors, Copy, Undo, Redo, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ToolbarPanel = () => {
  const {
    project,
    setProjectName,
    openDialog,
    clips,
    audioTracks,
  } = useVideoEditor();

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProject = async () => {
    if (!project.id) {
      toast.error("No project to save");
      return;
    }

    try {
      setIsSaving(true);
      await supabaseService.projects.update(project.id, { title: project.name });
      toast.success("Project saved successfully");
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      setIsCreatingProject(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to create a project");
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: newProjectName || 'Untitled Project',
          description: newProjectDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const { project: createdProject } = await response.json();
      window.location.href = `/editor/${createdProject.id}`;
      toast.success("Project created successfully");
      setIsNewProjectDialogOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="flex-none bg-[#0A0D16] border-b border-[#1D2130] p-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="flex items-center mr-4">
          <input
            type="text"
            value={project.name}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none text-sm font-medium"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-[#1D2130] h-8"
          onClick={handleSaveProject}
          disabled={isSaving || !project.id}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>

        <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Create a new video editing project
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Untitled Project"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description (optional)</Label>
                <Textarea
                  id="project-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Project description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsNewProjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={isCreatingProject}
              >
                {isCreatingProject ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-[#1D2130] h-8"
          onClick={() => openDialog('export')}
          disabled={clips.length + audioTracks.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8 px-2">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8 px-2">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
          <Scissors className="h-4 w-4 mr-2" />
          Cut
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-[#1D2130] h-8"
          onClick={() => openDialog('projectSettings')}
          disabled={!project.id}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default ToolbarPanel;
