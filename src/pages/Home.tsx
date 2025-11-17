import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, UserPlus, Plus } from 'lucide-react';
import wzrdLogo from '@/assets/wzrd-logo.png';
import { ProjectList } from '@/components/home/ProjectList';
import { ProjectListView } from '@/components/home/ProjectListView';
import { Sidebar } from '@/components/home/Sidebar';
import { SearchBar } from '@/components/home/SearchBar';
import { SortDropdown, SortOption } from '@/components/home/SortDropdown';
import { ProjectViewModeSelector } from '@/components/home/ProjectViewModeSelector';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { useAuth } from '@/providers/AuthProvider';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';
import { isDemoModeEnabled, getDemoProjects } from '@/utils/demoMode';
import type { Project } from '@/components/home/ProjectCard';

type ViewMode = 'grid' | 'list';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isDemo = isDemoModeEnabled();

  const [activeView, setActiveView] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'public'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [searchQuery, setSearchQuery] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user && !isDemo) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isDemo) {
        // Use demo projects from localStorage
        const demoProjects = getDemoProjects();
        setProjects(demoProjects as Project[]);
      } else {
        // Fetch real projects from Supabase
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
      // Filter by tab
      if (activeTab === 'private' && !project.is_private) return false;
      if (activeTab === 'public' && project.is_private) return false;
      
      // Filter by search
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
      // Sort projects
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
      <div className="min-h-screen bg-[#0A0A0A] flex w-full">
        {/* Sidebar */}
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Main Content */}
        <div className="flex-1 ml-64">
        {/* New Top Header with Logo */}
        <header className="h-16 border-b border-white/[0.08] flex items-center justify-center px-6">
          <div className="flex items-center gap-3">
            <img 
              src={wzrdLogo} 
              alt="WZRD.STUDIO Logo" 
              className="h-16 object-contain"
            />
            <span className="text-xl font-semibold text-white">Studio</span>
            <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
          </div>
        </header>

        {/* Toolbar */}
        <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SortDropdown value={sortBy} onChange={setSortBy} />
            <ProjectViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>

        {/* Tabs and Actions Bar */}
        <div className="h-16 border-b border-white/[0.08] flex items-center justify-between px-6">
          {/* Left: Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-white bg-white/[0.08]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs text-white/40">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-6">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-9 px-4 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white/60 hover:text-white hover:border-white/[0.16] transition-colors">
              <UserPlus className="w-4 h-4" />
              <span>Invite</span>
            </button>
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 h-9 px-4 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-sm text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <main className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-white/40 mb-4" />
              <p className="text-sm text-white/40">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-white mb-2">Error Loading Projects</h3>
                <p className="text-sm text-white/60 mb-6">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-white hover:bg-white/[0.12] transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredProjects.length === 0 && searchQuery ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                <p className="text-sm text-white/60">
                  Try adjusting your search or filters
                </p>
              </div>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white/60" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Create your first project</h3>
                <p className="text-sm text-white/60 mb-6">
                  Start bringing your ideas to life
                </p>
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-2.5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-sm text-white font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
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
    </div>
    </>
  );
}
