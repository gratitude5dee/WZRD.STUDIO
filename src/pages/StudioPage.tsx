
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import AppHeader from '@/components/AppHeader';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioCanvas from '@/components/studio/StudioCanvas';
import StudioBottomBar from '@/components/studio/StudioBottomBar';
import StudioRightPanel from '@/components/studio/StudioRightPanel';
import { supabase } from '@/integrations/supabase/client';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
  position: { x: number; y: number };
}

const StudioPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId?: string }>();
  const { activeProjectId, setActiveProject } = useAppStore();
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
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
  };
  
  // Get the type of the currently selected block
  const selectedBlockType = blocks.find(b => b.id === selectedBlockId)?.type || null;
  
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
        />
        
        <StudioRightPanel 
          selectedBlockType={selectedBlockType}
          selectedBlockId={selectedBlockId}
        />
      </div>
    </div>
  );
};

export default StudioPage;
