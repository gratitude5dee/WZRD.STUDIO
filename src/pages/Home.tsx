
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
import { cn } from '@/lib/utils';

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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(220_30%_8%)] via-[hsl(220_25%_6%)] to-[hsl(220_30%_4%)] text-foreground relative overflow-hidden">
      {/* Animated Cosmic Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(200_85%_15%)]/10 via-transparent to-[hsl(270_60%_20%)]/10" />
        
        {/* Mesh Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--foreground) / 0.03) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--foreground) / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
        
        {/* Particle Field */}
        <div className="absolute inset-0 particle-field opacity-10" />
      </div>
      
      <Header />
      
      <main className="relative z-10 container mx-auto px-6 py-8 space-y-8 max-w-[1600px]">
        {/* Discovery Portal Header */}
        <GlassCard variant="cosmic" depth="deep" glow="medium" shimmer className="overflow-hidden border border-white/10">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(var(--stellar-gold))] to-[hsl(var(--temporal-orange))] flex items-center justify-center shadow-lg shadow-[hsl(var(--stellar-gold))]/30">
                  <Orbit className="w-7 h-7 text-[hsl(220_30%_8%)]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[hsl(var(--glow-primary))] via-[hsl(var(--glow-secondary))] to-[hsl(var(--glow-accent))] bg-clip-text text-transparent">
                    Discovery Portal
                  </h1>
                  <p className="text-white/60 mt-1">Navigate your creative cosmos</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <GlassButton variant="stellar" glow="medium" onClick={handleCreateProject} className="shadow-lg">
                  <Plus className="w-4 h-4" />
                  New Reality
                </GlassButton>
                <GlassButton variant="cosmic" glow="medium" onClick={() => navigate('/learning-studio')}>
                  <Brain className="w-4 h-4" />
                  Learning Studio
                </GlassButton>
              </div>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--stellar-gold))] animate-pulse shadow-lg shadow-[hsl(var(--stellar-gold))]/50" />
                <span className="text-white/70">Portal Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--quantum-green))] animate-pulse shadow-lg shadow-[hsl(var(--quantum-green))]/50" />
                <span className="text-white/70">Neural Link Established</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--plasma-blue))] animate-pulse shadow-lg shadow-[hsl(var(--plasma-blue))]/50" />
                <span className="text-white/70">Cosmic Sync Active</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Project Dimensions Section */}
        <GlassCard variant="nebula" depth="deep" glow="subtle" className="overflow-hidden border border-white/5">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Orbit className="w-6 h-6 text-[hsl(var(--stellar-gold))]" />
                <h2 className="text-2xl font-semibold text-white">Project Dimensions</h2>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--quantum-green))]/10 border border-[hsl(var(--quantum-green))]/20">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--quantum-green))] animate-pulse" />
                <span className="text-sm font-medium text-white/80">{projects.length} Active Realities</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab('all')}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
                  activeTab === 'all'
                    ? "bg-gradient-to-r from-[hsl(var(--stellar-gold))]/30 to-[hsl(var(--temporal-orange))]/30 border-2 border-[hsl(var(--stellar-gold))]/50 text-white shadow-lg shadow-[hsl(var(--stellar-gold))]/20"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
                )}
              >
                <Atom className="w-4 h-4" />
                All Dimensions ({counts.all})
              </button>
              
              <button
                onClick={() => setActiveTab('private')}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium transition-all duration-300",
                  activeTab === 'private'
                    ? "bg-[hsl(200_85%_55%)]/20 border-2 border-[hsl(200_85%_55%)]/50 text-[hsl(200_85%_65%)] shadow-lg"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
                )}
              >
                Private ({counts.private})
              </button>
              
              <button
                onClick={() => setActiveTab('public')}
                className={cn(
                  "px-6 py-3 rounded-xl font-medium transition-all duration-300",
                  activeTab === 'public'
                    ? "bg-[hsl(160_70%_45%)]/20 border-2 border-[hsl(160_70%_45%)]/50 text-[hsl(160_70_55%)] shadow-lg"
                    : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white/80"
                )}
              >
                Public ({counts.public})
              </button>
            </div>
          </div>
        </GlassCard>
        
        {/* Content Area */}
        <div className="min-h-[400px] py-4">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Home;
