
import { Share, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ViewModeSelector } from '@/components/home/ViewModeSelector';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { supabaseService } from '@/services/supabaseService';
import { toast } from 'sonner';

interface StudioHeaderProps {
  viewMode?: 'studio' | 'timeline' | 'editor';
  setViewMode?: (mode: 'studio' | 'timeline' | 'editor') => void;
}

const StudioHeader = ({ viewMode = 'studio', setViewMode }: StudioHeaderProps) => {
  const navigate = useNavigate();
  const { projectId: urlProjectId } = useParams();
  const [projectId, setProjectId] = useState<string | null>(urlProjectId || null);
  
  // If we're on studio page without a projectId, fetch the most recent project
  useEffect(() => {
    const fetchMostRecentProject = async () => {
      if (!urlProjectId && viewMode === 'studio') {
        try {
          // Get the user's ID
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            console.warn('No authenticated user found');
            return;
          }
          
          // Fetch the most recent project for this user
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

  return (
    <header className="w-full bg-black border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo size="sm" showVersion={false} />
        <h1 className="text-lg font-medium text-white">Untitled</h1>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 flex justify-center">
        <ViewModeSelector viewMode={viewMode} setViewMode={handleViewModeChange} />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="text-white hover:bg-zinc-800">
          <User className="h-5 w-5 mr-2" />
        </Button>
        <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </header>
  );
};

export default StudioHeader;
