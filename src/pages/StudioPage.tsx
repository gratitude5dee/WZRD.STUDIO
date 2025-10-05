
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import AppHeader from '@/components/AppHeader';
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
    setBlocks([...blocks, newBlock]);
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
  
  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {/* Simplified header */}
      <div className="h-12 bg-black border-b border-zinc-800 flex items-center px-4">
        <span className="text-sm font-semibold text-zinc-400">Studio</span>
      </div>
      
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
