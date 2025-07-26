
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { ProjectList } from '@/components/home/ProjectList';
import type { Project } from '@/components/home/ProjectCard';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'public'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setIsLoading(false);
        setProjects([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await supabaseService.projects.list();

        const fetchedProjects: Project[] = (data || []).map(p => ({
          id: p.id,
          title: p.title || 'Untitled Project',
          updated_at: p.updated_at || new Date().toISOString(),
          is_private: true, // Default to private since we don't have this field yet
          thumbnail_url: null, // We don't have thumbnails yet
          description: p.description || null
        }));

        setProjects(fetchedProjects);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
        toast.error("Error loading projects", {
          description: err.message || "An unknown error occurred"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const handleCreateProject = () => {
    navigate('/project-setup');
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/storyboard/${projectId}`);
  };

  // Filter projects based on active tab
  const filteredProjects = projects.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'private') return p.is_private;
    if (activeTab === 'public') return !p.is_private;
    return false;
  });

  const counts = {
    all: projects.length,
    private: projects.filter(p => p.is_private).length,
    public: projects.filter(p => !p.is_private).length,
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          <span className="ml-3 text-zinc-400">Loading projects...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <AlertTriangle className="h-8 w-8 mb-3" />
          <p className="font-semibold mb-1">Error Loading Projects</p>
          <p className="text-sm text-red-300">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4 border-red-500/30 hover:bg-red-950/50 text-red-300"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/50">
          <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-zinc-800/60">
            <Plus className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-lg mb-2">No projects yet</p>
          <p className="text-sm text-zinc-400 mb-5">Start creating to see your projects here.</p>
          <Button
            onClick={handleCreateProject}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Project
          </Button>
        </div>
      );
    }

    if (filteredProjects.length === 0 && activeTab !== 'all') {
      return (
        <div className="text-center py-16 text-zinc-500">
          No {activeTab} projects found.
        </div>
      );
    }

    return (
      <ProjectList
        projects={filteredProjects}
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Your Projects</h1>
        </div>

        <section>
          <div className="border-b border-zinc-700/50 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`relative px-4 py-2 text-sm transition-colors duration-200 ${
                  activeTab === 'all'
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Projects ({counts.all})
                {activeTab === 'all' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></span>}
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`relative px-4 py-2 text-sm transition-colors duration-200 ${
                  activeTab === 'private'
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Private ({counts.private})
                {activeTab === 'private' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></span>}
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`relative px-4 py-2 text-sm transition-colors duration-200 ${
                  activeTab === 'public'
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Public ({counts.public})
                {activeTab === 'public' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"></span>}
              </button>
            </div>
          </div>
          
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default Home;
