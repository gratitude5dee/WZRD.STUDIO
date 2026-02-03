/**
 * Demo Mode Utility - Enhanced Version
 * Provides a rich demo experience with sample projects and data
 */

const DEMO_MODE_KEY = 'wzrdflow_demo_mode';
const DEMO_USER_ID = 'demo-user-00000000-0000-0000-0000-000000000000';
const DEMO_PROJECTS_KEY = 'wzrdflow_demo_projects';

// Sample demo projects for showcase
const DEMO_PROJECTS = [
  {
    id: 'demo-project-1',
    title: 'AI Music Video',
    description: 'Generate a music video using AI models',
    thumbnail: '/lovable-uploads/wzrdtechlogo.png',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: DEMO_USER_ID,
    status: 'completed',
  },
  {
    id: 'demo-project-2',
    title: 'Product Showcase',
    description: 'Create stunning product videos with AI',
    thumbnail: '/lovable-uploads/wzrdtechlogo.png',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    user_id: DEMO_USER_ID,
    status: 'completed',
  },
  {
    id: 'demo-project-3',
    title: 'Story Animation',
    description: 'Turn your story into an animated video',
    thumbnail: '/lovable-uploads/wzrdtechlogo.png',
    created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 259200000).toISOString(),
    user_id: DEMO_USER_ID,
    status: 'draft',
  },
];

export function enableDemoMode(): void {
  localStorage.setItem(DEMO_MODE_KEY, 'true');
  localStorage.setItem('demo_user_id', DEMO_USER_ID);
  
  // Initialize demo projects if not exists
  if (!localStorage.getItem(DEMO_PROJECTS_KEY)) {
    localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(DEMO_PROJECTS));
  }
  
  console.log('🎭 Demo mode enabled - exploring WZRD.Studio capabilities');
}

export function isDemoModeEnabled(): boolean {
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function getDemoProjects(): any[] {
  const projects = localStorage.getItem(DEMO_PROJECTS_KEY);
  return projects ? JSON.parse(projects) : DEMO_PROJECTS;
}

export function getDemoUserId(): string {
  return DEMO_USER_ID;
}

export function disableDemoMode(): void {
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem('demo_user_id');
  localStorage.removeItem(DEMO_PROJECTS_KEY);
  console.log('🎭 Demo mode disabled');
}

export async function initializeDemoMode(): Promise<void> {
  console.log('🎭 Demo mode initialized - exploring WZRD.Studio capabilities');
  return Promise.resolve();
}

export function saveDemoProject(project: any): void {
  const projects = getDemoProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...projects[existingIndex], ...project };
  } else {
    projects.push(project);
  }
  
  localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(projects));
}

export function deleteDemoProject(projectId: string): void {
  const projects = getDemoProjects();
  const filtered = projects.filter(p => p.id !== projectId);
  localStorage.setItem(DEMO_PROJECTS_KEY, JSON.stringify(filtered));
}
