import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Plus, FolderKanban, Activity, Image, Sparkles, Settings, HelpCircle, ChevronDown, User, LogOut, Palette } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { TextAnimate } from '@/components/ui/text-animate';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/providers/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { isDemoModeEnabled, getDemoProjects } from '@/utils/demoMode';
import { cn } from '@/lib/utils';
import type { Project } from '@/components/home/ProjectCard';
import { supabase } from '@/integrations/supabase/client';

type ViewMode = 'grid' | 'list';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { availableCredits } = useCredits();
  const { isCollapsed } = useSidebar();
  const onboarding = useOnboardingTour();
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
        const activeProjects = (data as Project[]).filter(
          (project) => project.status !== 'deleted'
        );
        setProjects(activeProjects);
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

  useEffect(() => {
    const handleRestore = () => {
      fetchProjects();
    };

    const handleVisibilityUpdate = (
      event: Event
    ) => {
      const detail = (event as CustomEvent<{ projectId: string; isPrivate: boolean }>).detail;
      if (!detail) return;
      setProjects((prev) =>
        prev.map((project) =>
          project.id === detail.projectId ? { ...project, is_private: detail.isPrivate } : project
        )
      );
    };

    window.addEventListener('project-restored', handleRestore);
    window.addEventListener('project-visibility-updated', handleVisibilityUpdate);

    return () => {
      window.removeEventListener('project-restored', handleRestore);
      window.removeEventListener('project-visibility-updated', handleVisibilityUpdate);
    };
  }, [fetchProjects]);

  const handleCreateProject = () => {
    navigate('/project-setup');
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/timeline/${projectId}`);
  };

  const handleRenameProject = useCallback(async (projectId: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      toast({
        title: 'Error',
        description: 'Project title cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId ? { ...project, title: trimmedTitle } : project
      )
    );

    const { error } = await supabase
      .from('projects')
      .update({ title: trimmedTitle, updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update project title.',
        variant: 'destructive',
      });
      fetchProjects();
    }
  }, [fetchProjects, toast]);

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
        <motion.div 
          className="flex-1 pb-20 md:pb-0"
          animate={{ marginLeft: isCollapsed ? 64 : 256 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          initial={false}
        >
          {/* Mobile Header */}
          <MobileHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

          {/* Desktop Header - hidden on mobile */}
          <header data-tour="dashboard-title" className={cn(
            "border-b border-border-default",
            "bg-gradient-to-r from-surface-2 via-transparent to-surface-2 backdrop-blur-sm",
            "hidden md:block"
          )}>
            {/* Row 1: Title + Project Count + Actions */}
            <div className="h-16 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <TextAnimate animation="blurInUp" by="word" className="text-xl font-semibold text-text-primary dark:text-foreground">
                    Dashboard
                  </TextAnimate>
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="text-lg"
                  >
                    📊
                  </motion.span>
                </div>
                <div className="h-5 w-px bg-border-default" />
                <span className="text-sm text-text-secondary dark:text-muted-foreground font-medium">
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Settings dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-9 px-2 gap-1 transition-all duration-200",
                        "text-text-secondary hover:text-text-primary hover:bg-surface-2",
                        "dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-surface-1 border-border-default dark:bg-zinc-900 dark:border-zinc-800"
                    sideOffset={8}
                  >
                    <DropdownMenuLabel className="text-text-secondary dark:text-zinc-400 text-xs">
                      Account
                    </DropdownMenuLabel>
                    
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')} 
                      className="hover:bg-surface-2 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border-default dark:bg-zinc-800" />
                    
                    <DropdownMenuLabel className="text-text-secondary dark:text-zinc-400 text-xs">
                      Preferences
                    </DropdownMenuLabel>
                    
                    <DropdownMenuItem 
                      className="hover:bg-surface-2 dark:hover:bg-zinc-800 cursor-pointer"
                    >
                      <Palette className="mr-2 h-4 w-4" />
                      Appearance
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border-default dark:bg-zinc-800" />
                    
                    <DropdownMenuItem 
                      onClick={async () => {
                        try {
                          await supabase.auth.signOut();
                          navigate('/auth');
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to log out. Please try again.',
                            variant: 'destructive',
                          });
                        }
                      }} 
                      className="hover:bg-surface-2 dark:hover:bg-zinc-800 cursor-pointer text-red-500 dark:text-red-400"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Help button - triggers onboarding tour */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button 
                      onClick={onboarding.start}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        "text-text-secondary hover:text-text-primary hover:bg-surface-2",
                        "dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-white/[0.06]"
                      )}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>Help & Tour</TooltipContent>
                </Tooltip>

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
            </div>
            
            {/* Row 2: Tabs + Search + Actions */}
            <div className="h-14 flex items-center justify-between px-6 border-t border-border-subtle">
              {/* Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      activeTab === tab.id
                        ? "text-text-primary bg-surface-1 shadow-sm"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    {tab.label}
                    <span className="ml-2 text-xs opacity-60">({tab.count})</span>
                  </button>
                ))}
              </div>
              
              {/* Search + Sort + View Mode */}
              <div className="flex items-center gap-4" data-tour="search-bar">
                <div className="w-72">
                  <SearchBar onSearch={handleSearch} />
                </div>
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <ProjectViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all duration-200",
                    "bg-surface-2 border border-border-default text-text-secondary",
                    "hover:text-text-primary hover:border-border-strong hover:bg-surface-3"
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </motion.button>
                <ShimmerButton
                  data-tour="new-project-btn"
                  onClick={handleCreateProject}
                  shimmerColor="#ffffff"
                  shimmerSize="0.05em"
                  shimmerDuration="2.5s"
                  background="linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.8) 100%)"
                  className="h-9 px-4 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>New Project</span>
                </ShimmerButton>
              </div>
            </div>
          </header>

          {/* Stats Row - Responsive grid */}
          <div data-tour="stats-section" className="px-4 md:px-6 py-4 md:py-6 border-b border-border-default bg-gradient-to-b from-surface-2 to-transparent">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatCard 
                icon={<FolderKanban className="w-5 h-5" />}
                label="Total Projects"
                value={projects.length}
                trend="+12%"
                trendDirection="up"
                index={0}
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
                index={1}
              />
              <StatCard 
                icon={<Image className="w-5 h-5" />}
                label="Generated Assets"
                value="--"
                trend="Coming soon"
                trendDirection="neutral"
                className="hidden sm:block"
                index={2}
              />
              <StatCard 
                icon={<Sparkles className="w-5 h-5" />}
                label="Credits"
                value={availableCredits?.toLocaleString() || '0'}
                trend="Available"
                trendDirection="neutral"
                className="hidden sm:block"
                index={3}
              />
            </div>
          </div>

          {/* Content Area */}
          <main data-tour="projects-section" className="p-4 md:p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/15 flex items-center justify-center mb-4">
                  <Loader2 className="w-7 h-7 md:w-8 md:h-8 animate-spin text-primary" />
                </div>
                <p className="text-xs md:text-sm text-text-tertiary dark:text-muted-foreground">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="text-center max-w-md px-4">
                  <h3 className="text-base md:text-lg font-semibold text-text-primary dark:text-foreground mb-2">Error Loading Projects</h3>
                  <p className="text-xs md:text-sm text-text-tertiary dark:text-muted-foreground mb-6">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-surface-2 border border-border-default rounded-lg text-sm text-text-primary hover:bg-surface-3 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredProjects.length === 0 && searchQuery ? (
              <div className="flex flex-col items-center justify-center py-12 md:py-20">
                <div className="text-center max-w-md px-4">
                  <h3 className="text-base md:text-lg font-semibold text-text-primary dark:text-foreground mb-2">No results found</h3>
                  <p className="text-xs md:text-sm text-text-tertiary dark:text-muted-foreground">
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
                  <h3 className="text-lg md:text-xl font-semibold text-text-primary dark:text-foreground mb-2">Create your first project</h3>
                  <p className="text-xs md:text-sm text-text-tertiary dark:text-muted-foreground mb-6">
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
                onRenameProject={handleRenameProject}
              />
            )}
          </main>
        </motion.div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeView={activeView}
          onViewChange={setActiveView}
          onCreateProject={handleCreateProject}
        />
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour
        isActive={onboarding.isActive}
        currentStep={onboarding.currentStep}
        currentStepIndex={onboarding.currentStepIndex}
        totalSteps={onboarding.totalSteps}
        onNext={onboarding.next}
        onPrev={onboarding.prev}
        onSkip={onboarding.stop}
        onComplete={onboarding.complete}
        onGoToStep={onboarding.goToStep}
      />
    </>
  );
}
