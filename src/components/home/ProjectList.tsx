
import { useState, useEffect } from 'react';
import { Project, ProjectCard } from './ProjectCard';
import { NewProjectCard } from './NewProjectCard';

interface ProjectListProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export const ProjectList = ({ projects, onOpenProject, onCreateProject }: ProjectListProps) => {
  const [localProjects, setLocalProjects] = useState(projects);

  // Update local projects when projects prop changes
  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const handleDeleteProject = (projectId: string) => {
    setLocalProjects(prev => prev.filter(p => p.id !== projectId));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
      <NewProjectCard onClick={onCreateProject} />
      {localProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpenProject}
          onDelete={handleDeleteProject}
        />
      ))}
    </div>
  );
};
