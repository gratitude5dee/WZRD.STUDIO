
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { ProjectList } from '@/components/home/ProjectList';
import type { Project } from '@/components/home/ProjectCard';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2, AlertTriangle, Plus, Sparkles, Orbit, Zap, Atom, Star, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { GlassCard } from '@/components/ui/glass-card';
import { PortalHeader } from '@/components/ui/portal-header';
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
    navigate(`/timeline/${projectId}`);
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
          <div className="relative">
            <Orbit className="h-12 w-12 text-cosmic-stellar animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-full bg-cosmic-stellar/20 animate-pulse" />
          </div>
          <span className="ml-4 text-muted-foreground font-light">Synchronizing realities...</span>
        </div>
      );
    }

    if (error) {
      return (
        <GlassCard variant="void" depth="shallow" className="p-8">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">Portal Disruption Detected</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            <GlassButton 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="border-destructive/30 hover:bg-destructive/10"
            >
              <Zap className="w-4 h-4" />
              Reconnect Portal
            </GlassButton>
          </div>
        </GlassCard>
      );
    }

    if (projects.length === 0) {
      return (
        <GlassCard variant="stellar" depth="deep" particle shimmer className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cosmic-stellar to-cosmic-temporal flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-cosmic-void animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-cosmic-nebula flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold glow-text-cosmic">Your Cosmos Awaits</h3>
              <p className="text-muted-foreground">Begin your journey by creating your first reality.</p>
            </div>
            <GlassButton
              onClick={handleCreateProject}
              variant="stellar"
              size="lg"
              glow="intense"
              particle
            >
              <Plus className="w-5 h-5" />
              Create First Reality
            </GlassButton>
          </div>
        </GlassCard>
      );
    }

    if (filteredProjects.length === 0 && activeTab !== 'all') {
      return (
        <div className="text-center py-16 space-y-4">
          <Atom className="w-12 h-12 text-cosmic-stellar/50 mx-auto animate-pulse" />
          <p className="text-muted-foreground">No {activeTab} dimensions discovered yet.</p>
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
    <div className="min-h-screen bg-cosmic-void text-foreground relative overflow-hidden">
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-nebula-field opacity-30 pointer-events-none" />
      <div className="fixed inset-0 particle-field opacity-20 pointer-events-none" />
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-4 py-8 space-y-8">
        {/* Portal Header */}
        <PortalHeader 
          title="Discovery Portal" 
          subtitle="Navigate your creative cosmos"
          cosmic={true}
          actions={
            <div className="flex space-x-3">
              <GlassButton variant="stellar" onClick={handleCreateProject}>
                <Plus className="w-4 h-4" />
                New Reality
              </GlassButton>
              <GlassButton variant="cosmic" onClick={() => navigate('/learning-studio')}>
                <Brain className="w-4 h-4" />
                Learning Studio
              </GlassButton>
              <GlassButton variant="void" size="icon">
                <Star className="w-4 h-4" />
              </GlassButton>
            </div>
          }
        />

        {/* Cosmic Navigation */}
        <GlassCard variant="nebula" depth="medium" glow="subtle" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Orbit className="w-6 h-6 text-cosmic-stellar" />
              <h2 className="text-xl font-semibold glow-text-primary">Project Dimensions</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-cosmic-quantum animate-pulse" />
              <span>{projects.length} Active Realities</span>
            </div>
          </div>

          <div className="flex space-x-1 bg-cosmic-void/30 p-1 rounded-lg backdrop-blur-sm">
            <GlassButton
              variant={activeTab === 'all' ? 'stellar' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('all')}
              className="flex-1"
            >
              <Atom className="w-3 h-3" />
              All Dimensions ({counts.all})
            </GlassButton>
            <GlassButton
              variant={activeTab === 'private' ? 'stellar' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('private')}
              className="flex-1"
            >
              <Zap className="w-3 h-3" />
              Private ({counts.private})
            </GlassButton>
            <GlassButton
              variant={activeTab === 'public' ? 'stellar' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('public')}
              className="flex-1"
            >
              <Sparkles className="w-3 h-3" />
              Public ({counts.public})
            </GlassButton>
          </div>
        </GlassCard>
        
        {/* Content Area */}
        <GlassCard variant="cosmic" depth="deep" glow="medium" className="min-h-[400px]">
          {renderContent()}
        </GlassCard>
      </main>
    </div>
  );
};

export default Home;
