
import { useState, useEffect } from 'react';
import { Project, ProjectCard } from './ProjectCard';
import { NewProjectCard } from './NewProjectCard';

interface ProjectListProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: () => void;
  onRenameProject?: (projectId: string, newTitle: string) => void;
}

export const ProjectList = ({
  projects,
  onOpenProject,
  onCreateProject,
  onRenameProject,
}: ProjectListProps) => {
  const [localProjects, setLocalProjects] = useState(projects);

  // Update local projects when projects prop changes
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const handleDeleteProject = (projectId: string) => {
    setLocalProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleRenameProject = (projectId: string, newTitle: string) => {
    setLocalProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, title: newTitle } : project
      )
    );
    onRenameProject?.(projectId, newTitle);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-5">
      {/* New Project Card - hidden on mobile (use bottom nav FAB instead) */}
      <div className="hidden md:block">
        <NewProjectCard onClick={onCreateProject} />
      </div>
      {localProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpenProject}
          onDelete={handleDeleteProject}
          onRename={handleRenameProject}
        />
      ))}
    </div>
  );
};
