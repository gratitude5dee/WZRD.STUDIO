import { Share, MoreVertical, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useCredits } from '@/hooks/useCredits';

interface StudioHeaderProps {
  viewMode?: 'studio' | 'timeline' | 'editor';
  setViewMode?: (mode: 'studio' | 'timeline' | 'editor') => void;
}

const ViewModeTabs = ({
  mode,
  onChange,
}: {
  mode: 'studio' | 'timeline' | 'editor';
  onChange: (mode: 'studio' | 'timeline' | 'editor') => void;
}) => {
  const tabs: Array<{ label: string; value: 'studio' | 'timeline' | 'editor' }> = [
    { label: 'Studio', value: 'studio' },
    { label: 'Timeline', value: 'timeline' },
    { label: 'Editor', value: 'editor' },
  ];

  return (
    <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-border-subtle">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            mode === tab.value
              ? 'bg-surface-4 text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

const StudioHeader = ({ viewMode = 'studio', setViewMode }: StudioHeaderProps) => {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = useParams();
  const [projectId, setProjectId] = useState<string | null>(urlProjectId || null);
  const { availableCredits, isLoading } = useCredits();

  useEffect(() => {
    const fetchMostRecentProject = async () => {
      if (!urlProjectId && viewMode === 'studio') {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            console.warn('No authenticated user found');
            return;
          }

          const projects = await supabaseService.projects.list();

          if (projects && projects.length > 0) {
            setProjectId(projects[0].id);
            console.log('Found recent project ID:', projects[0].id);
          }
        } catch (error) {
          console.error('Error in fetchMostRecentProject:', error);
        }
      }
    };

    fetchMostRecentProject();
  }, [urlProjectId, viewMode]);

  const handleViewModeChange = (mode: 'studio' | 'timeline' | 'editor') => {
    if (setViewMode) {
      setViewMode(mode);
    }

    switch (mode) {
      case 'timeline':
        if (projectId) {
          navigate(`/timeline/${projectId}`);
        } else {
          toast.warning('No project available. Please create a project first.');
          navigate('/home');
        }
        break;
      case 'editor':
        if (projectId) {
          navigate(`/editor/${projectId}`);
        } else {
          toast.warning('No project available. Please create a project first.');
          navigate('/home');
        }
        break;
      case 'studio':
        navigate('/studio');
        break;
    }
  };

  const creditsLabel = isLoading ? '...' : availableCredits ?? '--';

  return (
    <header className="h-14 bg-surface-1 border-b border-border-subtle px-4 flex items-center">
      <div className="flex items-center gap-4">
        <Logo size="sm" showVersion={false} />
        <div className="h-6 w-px bg-border-subtle" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">Untitled Project</span>
          <button className="p-1 rounded hover:bg-surface-3 text-text-tertiary hover:text-text-secondary">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <ViewModeTabs mode={viewMode} onChange={handleViewModeChange} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-border-subtle">
          <Sparkles className="w-4 h-4 text-accent-amber" />
          <span className="text-sm font-medium text-text-primary">{creditsLabel}</span>
          <span className="text-xs text-text-tertiary">credits</span>
        </div>

        <Button
          variant="ghost"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border-subtle text-text-primary text-sm font-medium transition-colors"
        >
          <Share className="w-4 h-4" />
          Share
        </Button>
      </div>
    </header>
  );
};

export default StudioHeader;
