
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MoreVertical, User, Share2 } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Logo } from '@/components/ui/logo';
import CreditsDisplay from '@/components/CreditsDisplay';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioCanvas from '@/components/studio/StudioCanvas';
import StudioBottomBar from '@/components/studio/StudioBottomBar';
import BlockSettingsModal from '@/components/studio/BlockSettingsModal';
import { supabase } from '@/integrations/supabase/client';

export interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  position: { x: number; y: number };
  initialData?: {
    prompt?: string;
    imageUrl?: string;
    generationTime?: number;
    aspectRatio?: string;
  };
}

const StudioPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const { activeProjectId, setActiveProject } = useAppStore();
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blockModels, setBlockModels] = useState<Record<string, string>>({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // When the component mounts or projectId changes, update the app store
  useEffect(() => {
    const initializeProjectContext = async () => {
      // If we have a project ID from the URL, fetch its details and store it
      if (projectId) {
        try {
          const { data, error } = await supabase
            .from('projects')
            .select('title')
            .eq('id', projectId)
            .single();
            
          if (error) {
            throw error;
          }
          
          setActiveProject(projectId, data?.title || 'Untitled');
        } catch (error) {
          console.error('Error fetching project details:', error);
        }
      }
    };
    
    initializeProjectContext();
  }, [projectId, setActiveProject]);
  
  const handleAddBlock = (blockOrType: Block | 'text' | 'image' | 'video') => {
    const newBlock = typeof blockOrType === 'string' 
      ? { 
          id: uuidv4(), 
          type: blockOrType,
          position: { x: 400 + Math.random() * 200, y: 300 + Math.random() * 200 }
        }
      : blockOrType;
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  };
  
  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id || null);
    setIsSettingsModalOpen(!!id);
  };

  const handleModelChange = (blockId: string, modelId: string) => {
    setBlockModels(prev => ({ ...prev, [blockId]: modelId }));
  };

  const handleCloseModal = () => {
    setIsSettingsModalOpen(false);
  };
  
  // Get the type and model of the currently selected block
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);
  const selectedBlockType = selectedBlock?.type || null;
  const selectedModel = selectedBlockId ? blockModels[selectedBlockId] : '';
  
  const location = useLocation();
  
  const handleViewModeChange = (mode: 'studio' | 'timeline' | 'editor') => {
    if (mode === 'timeline') {
      navigate(`/project/${projectId}/timeline`);
    } else if (mode === 'editor') {
      navigate(`/project/${projectId}/editor`);
    }
  };

  const getCurrentView = (): 'studio' | 'timeline' | 'editor' => {
    const path = location.pathname;
    if (path.includes('/timeline')) return 'timeline';
    if (path.includes('/editor')) return 'editor';
    return 'studio';
  };

  const currentView = getCurrentView();
  
  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Enhanced Header */}
      <header className="h-14 bg-black border-b border-zinc-800 flex items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Logo size="sm" showVersion={false} />
          <span className="text-sm text-zinc-400">Untitled</span>
          <button className="p-1 hover:bg-zinc-800 rounded transition-colors">
            <MoreVertical className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        
        {/* Center Section - View Mode Pills */}
        <div className="flex items-center gap-1 bg-zinc-900 rounded-full p-1">
          <button
            onClick={() => handleViewModeChange('studio')}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all ${
              currentView === 'studio'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Studio
          </button>
          <button
            onClick={() => handleViewModeChange('timeline')}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all ${
              currentView === 'timeline'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => handleViewModeChange('editor')}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all ${
              currentView === 'editor'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Editor
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          <CreditsDisplay showTooltip={false} showButton={false} />
          <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
            <User className="w-5 h-5 text-zinc-400" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
            <Share2 className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-200">Share</span>
          </button>
        </div>
      </header>
      
      <div className="flex-1 flex overflow-hidden">
        <StudioSidebar onAddBlock={handleAddBlock} />
        
        <StudioCanvas 
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={handleSelectBlock}
          onAddBlock={handleAddBlock}
          blockModels={blockModels}
          onModelChange={handleModelChange}
        />
      </div>

      {/* Block Settings Modal */}
      <BlockSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={handleCloseModal}
        blockType={selectedBlockType}
        selectedModel={selectedModel}
        onModelChange={(modelId) => {
          if (selectedBlockId) {
            handleModelChange(selectedBlockId, modelId);
          }
        }}
      />
    </div>
  );
};

export default StudioPage;
