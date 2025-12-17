import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Plus, FolderKanban, Activity, Image, Sparkles } from 'lucide-react';
import wzrdLogo from '@/assets/wzrd-logo.png';
import { ProjectList } from '@/components/home/ProjectList';
import { ProjectListView } from '@/components/home/ProjectListView';
import { Sidebar } from '@/components/home/Sidebar';
import { MobileBottomNav } from '@/components/home/MobileBottomNav';
import { MobileHeader } from '@/components/home/MobileHeader';
import { MobileSidebarDrawer } from '@/components/home/MobileSidebarDrawer';
import { SearchBar } from '@/components/home/SearchBar';
import { SortDropdown, SortOption } from '@/components/home/SortDropdown';
import { ProjectViewModeSelector } from '@/components/home/ProjectViewModeSelector';
import { StatCard } from '@/components/home/StatCard';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/providers/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { isDemoModeEnabled, getDemoProjects } from '@/utils/demoMode';
import { cn } from '@/lib/utils';
import type { Project } from '@/components/home/ProjectCard';

type ViewMode = 'grid' | 'list';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { availableCredits } = useCredits();
  const isDemo = isDemoModeEnabled();

  const [activeView, setActiveView] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'public'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!user && !isDemo) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isDemo) {
        const demoProjects = getDemoProjects();
        setProjects(demoProjects as Project[]);
      } else {
        const data = await supabaseService.projects.list();
        setProjects(data as Project[]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      toast({
        title: 'Error',
        description: 'Failed to load projects. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, isDemo, toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = () => {
    navigate('/project-setup');
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}/timeline`);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Filter projects
  const filteredProjects = projects
    .filter((project) => {
      if (activeTab === 'private' && !project.is_private) return false;
      if (activeTab === 'public' && project.is_private) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const counts = {
    all: projects.length,
    private: projects.filter(p => p.is_private).length,
    public: projects.filter(p => !p.is_private).length,
  };

  const tabs = [
    { id: 'all' as const, label: 'All', count: counts.all },
    { id: 'private' as const, label: 'Private', count: counts.private },
    { id: 'public' as const, label: 'Public', count: counts.public },
  ];

  return (
    <>
      {isDemo && <DemoBanner />}
      <div className="min-h-screen bg-background flex w-full">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar activeView={activeView} onViewChange={setActiveView} />
        </div>

        {/* Mobile Sidebar Drawer */}
        <MobileSidebarDrawer
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* Main Content */}
        <div className="flex-1 md:ml-64 pb-20 md:pb-0">
          {/* Mobile Header */}
          <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {/* Desktop Header - hidden on mobile */}
          <header className={cn(
            "h-20 border-b border-border/30 items-center justify-between px-6",
            "bg-gradient-to-r from-card/50 via-transparent to-card/50 backdrop-blur-sm",
            "hidden md:flex"
          )}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-foreground">Dashboard</span>
                <span className="text-lg">📊</span>
              </div>
              <p className="text-sm text-muted-foreground">Welcome back! Here's your creative overview</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <img 
                src={wzrdLogo} 
                alt="WZRD.STUDIO Logo" 
                className="h-10 object-contain"
              />
              <span className="text-xs text-primary bg-primary/15 px-2 py-0.5 rounded-full border border-primary/25 font-medium">
                ALPHA
              </span>
            </div>
          </header>

          {/* Stats Row - Responsive grid */}
          <div className="px-4 md:px-6 py-4 md:py-6 border-b border-border/30 bg-gradient-to-b from-card/30 to-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard 
                icon={<FolderKanban className="w-5 h-5" />}
                label="Total Projects"
                value={projects.length}
                trend="+12%"
                trendDirection="up"
              />
              <StatCard 
                icon={<Activity className="w-5 h-5" />}
                label="Recent Activity"
                value={filteredProjects.filter(p => {
                  const updated = new Date(p.updated_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return updated > weekAgo;
                }).length}
                trend="This week"
                trendDirection="neutral"
              />
              <StatCard 
                icon={<Image className="w-5 h-5" />}
                label="Generated Assets"
                value="--"
                trend="Coming soon"
                trendDirection="neutral"
                className="hidden sm:block"
              />
              <StatCard 
                icon={<Sparkles className="w-5 h-5" />}
                label="Credits"
                value={availableCredits?.toLocaleString() || '0'}
                trend="Available"
                trendDirection="neutral"
                className="hidden sm:block"
              />
            </div>
          </div>

          {/* Toolbar - Responsive */}
          <div className="h-12 md:h-14 border-b border-border/30 flex items-center justify-between px-4 md:px-6 bg-card/20">
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm text-muted-foreground font-medium">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <SortDropdown value={sortBy} onChange={setSortBy} />
              <ProjectViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>

          {/* Tabs and Actions Bar - Responsive */}
          <div className="min-h-14 md:h-16 border-b border-border/30 flex flex-col md:flex-row md:items-center justify-between px-4 md:px-6 py-3 md:py-0 gap-3 md:gap-0">
            {/* Tabs - scrollable on mobile */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/30 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap",
                    activeTab === tab.id
                      ? "text-foreground bg-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                  <span className="ml-1 md:ml-2 text-[10px] md:text-xs opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Search - full width on mobile */}
            <div className="flex-1 md:max-w-md md:mx-6 order-last md:order-none">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Actions - hidden on mobile (use bottom nav instead) */}
            <div className="hidden md:flex items-center gap-3">
              <button className={cn(
                "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                "bg-muted/50 border border-border/50 text-muted-foreground",
                "hover:text-foreground hover:border-border hover:bg-muted"
              )}>
                <UserPlus className="w-4 h-4" />
                <span>Invite</span>
              </button>
              <button
                onClick={handleCreateProject}
                className={cn(
                  "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                  "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                  "hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5"
                )}
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <main className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 flex items-center justify-center mb-4">
                  <Loader2 className="w-7 h-7 md:w-8 md:h-8 animate-spin text-primary" />
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="text-center max-w-md px-4">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">Error Loading Projects</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredProjects.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="text-center max-w-md px-4">
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-2">No results found</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="text-center max-w-md px-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 flex items-center justify-center">
                    <Plus className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">Create your first project</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-6">
                    Start bringing your ideas to life with AI-powered video creation
                  </p>
                  <button
                    onClick={handleCreateProject}
                    className={cn(
                      "px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                      "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
                      "hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5"
                    )}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <ProjectListView
                projects={filteredProjects}
                onOpenProject={handleOpenProject}
                onRefresh={fetchProjects}
              />
            ) : (
              <ProjectList
                projects={filteredProjects}
                onOpenProject={handleOpenProject}
                onCreateProject={handleCreateProject}
              />
            )}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateProject={handleCreateProject}
        />
      </div>
    </>
  );
}
